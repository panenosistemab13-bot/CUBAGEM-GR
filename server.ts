import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const app = express();
const PORT = 3000;

async function startServer() {
  // Increase the payload size limit for base64 images
  app.use(express.json({ limit: '50mb' }));

  // API routes go here FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/extract-table", async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { textoCopiado, imagemBase64, customPrompt } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "Chave API do Gemini não configurada." });
        }

        // 1. Inicialização segura (Lazy) apenas quando a rota for chamada
        const ai = new GoogleGenAI({
            apiKey: apiKey,
            httpOptions: {
                headers: {
                    'User-Agent': 'aistudio-build',
                }
            }
        });

        const parts = [];

        if (textoCopiado) {
            parts.push({ text: `TEXTO EXCEL:\n${textoCopiado}` });
        }

        if (imagemBase64) {
            let mimeType = "image/jpeg";
            const mimeMatch = imagemBase64.match(/^data:([^;]+);base64,/);
            if (mimeMatch) {
                mimeType = mimeMatch[1];
            }
            const apenasBase64 = imagemBase64.replace(/^data:[^;]+;base64,/, "");
            parts.push({
                inlineData: {
                    mimeType: mimeType,
                    data: apenasBase64
                }
            });
        }

        const defaultPrompt = "Converta os dados fornecidos em um array de objetos JSON para Pré-Alerta de GR. Retorne apenas o JSON limpo, sem markdown.";
        parts.push({
            text: customPrompt || defaultPrompt
        });

        const config: any = {
            responseMimeType: "application/json",
            temperature: 0.1
        };

        if (imagemBase64) {
            config.responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        baitCode: { type: Type.STRING, description: "Número ou código da isca" },
                        date: { type: Type.STRING, description: "Data do embarque formato dd/mm/aaaa" },
                        time: { type: Type.STRING, description: "Hora do embarque formato hh:mm" },
                        dock: { type: Type.STRING, description: "Identificador da Doca" },
                        cavalo: { type: Type.STRING, description: "Placa do cavalo mecânico" },
                        carreta: { type: Type.STRING, description: "Placa do reboque" },
                        volume: { type: Type.STRING, description: "Quantidade de volumes" },
                        destination: { type: Type.STRING, description: "Destino final da carga" },
                        nf: { type: Type.STRING, description: "Número(s) das Notas Fiscais" },
                        responsible: { type: Type.STRING, description: "Nome do responsável" },
                        product: { type: Type.STRING, description: "Categoria do produto" },
                        uma: { type: Type.STRING, description: "Identificação UMA" },
                        nfValue: { type: Type.STRING, description: "Valor financeiro" }
                    }
                }
            };
        } else if (textoCopiado) {
            config.responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        plate: { type: Type.STRING, description: "Placa do veículo" },
                        vehicleType: { type: Type.STRING, description: "Tipo de veículo" },
                        cargoType: { type: Type.STRING, description: "Tipo da carga" },
                        location: { type: Type.STRING, description: "Local de implantação" },
                        nfs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array com Notas Fiscais" },
                        baitIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array com iscas logísticas" },
                        destination: { type: Type.STRING, description: "Cidade / Estado destino" },
                        products: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Nomes de produtos" }
                    }
                }
            };
        }

        // 2. Correção do modelo para a versão existente
        const genResponse = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: { parts },
            config: config
        });

        let textoJSON = genResponse.text;
        
        if (!textoJSON) {
            return res.status(500).json({ error: "A IA não retornou uma resposta válida." });
        }

        textoJSON = textoJSON.replace(/```json\n?|```/g, "").trim();
        
        try {
            const parsedData = JSON.parse(textoJSON);
            return res.status(200).json({ success: true, data: parsedData });
        } catch (parseError) {
            console.warn("Falha no parse inicial do JSON, retornando texto bruto...");
            return res.status(200).json({ success: true, partial: true, rawData: textoJSON });
        }

    } catch (error) {
        console.error("Erro no processamento da imagem ou texto pelo Gemini:", error);
        return res.status(500).json({ error: "Erro interno ao processar dados com a Inteligência Artificial." });
    }
  });

  app.post("/api/extract-pdf", async (req, res) => {
    try {
        const { pdfBase64 } = req.body;

        if (!pdfBase64) {
            return res.status(400).json({ error: "O arquivo PDF em base64 é obrigatório." });
        }

        const apenasBase64 = pdfBase64.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(apenasBase64, 'base64');

        // Parse PDF locally
        const data = await pdf(buffer);
        const text = data.text;

        if (!text) {
            return res.status(400).json({ error: "Não foi possível extrair texto do PDF." });
        }

        const lines = text.split(/\r?\n/);
        const results = [];

        // Plate Regex for standard and Mercosul Brazilian formats
        const platePattern = /([A-Z]{3}[- ]?[0-9][A-Z0-9][0-9]{2}|[A-Z]{3}-?[0-9]{4})/gi;

        for (const line of lines) {
            if (!line.trim()) continue;

            const matches = line.match(platePattern) || [];
            
            // Standardize matches to clean 7-character uppercase plates
            const uniquePlates: string[] = Array.from(new Set(
                matches.map((p: string) => p.replace(/[\s-]/g, '').toUpperCase())
            ));

            // A valid truck row must contain at least 2 distinct plates (cavalo and carreta)
            if (uniquePlates.length >= 2) {
                const cavalo = uniquePlates[0];
                const carreta = uniquePlates[1];

                const words = line.split(/\s+/);
                
                // Find index of the second plate in the words array to look for M³ right after it
                let plate2Index = -1;
                for (let i = 0; i < words.length; i++) {
                    const normalizedWord = words[i].replace(/[|()\[\]\s-]/g, '').toUpperCase();
                    if (normalizedWord.includes(carreta)) {
                        plate2Index = i;
                        break;
                    }
                }

                let m3Value = '';
                if (plate2Index !== -1) {
                    const candidates: { val: number; strVal: string }[] = [];
                    // Check words after the carreta plate for the volume
                    for (let i = plate2Index + 1; i < words.length; i++) {
                        const cleanWord = words[i].replace(/[|()\[\]\s]/g, '').replace(/,/, '.');
                        const num = parseFloat(cleanWord);
                        const isPlate = uniquePlates.some(p => p.includes(cleanWord) || cleanWord.includes(p));
                        if (!isNaN(num) && num > 0 && num < 500 && !isPlate && !cleanWord.includes('/') && !cleanWord.includes(':')) {
                            candidates.push({ val: num, strVal: cleanWord });
                        }
                    }
                    if (candidates.length > 0) {
                        candidates.sort((a, b) => b.val - a.val);
                        m3Value = candidates[0].strVal;
                    }
                }

                // Fallback: If no M³ found right after the second plate, scan the entire line
                if (!m3Value) {
                    const candidates: { val: number; strVal: string }[] = [];
                    for (let i = 0; i < words.length; i++) {
                        const cleanWord = words[i].replace(/[|()\[\]\s]/g, '').replace(/,/, '.');
                        const num = parseFloat(cleanWord);
                        const isPlate = uniquePlates.some(p => p.includes(cleanWord) || cleanWord.includes(p));
                        if (!isNaN(num) && num >= 15 && num <= 500 && !isPlate && !cleanWord.includes('/') && !cleanWord.includes(':')) {
                            candidates.push({ val: num, strVal: cleanWord });
                        }
                    }
                    if (candidates.length > 0) {
                        candidates.sort((a, b) => b.val - a.val);
                        m3Value = candidates[0].strVal;
                    }
                }

                results.push({
                    cavalo,
                    carreta,
                    m3: m3Value || '---'
                });
            }
        }

        return res.status(200).json({ success: true, data: results });

    } catch (error) {
        console.error("Erro ao extrair PDF localmente:", error);
        return res.status(500).json({ error: "Erro interno ao ler e extrair os dados do PDF." });
    }
  });

  // Dedicated route for Ordem de Coleta parsing (PDF, Image, or OCR text)
  app.post("/api/parse-order", async (req, res) => {
    try {
      const { fileBase64, mimeType, extractedText, fileName } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      // Extract local PDF text if PDF is passed and no text was sent
      let textContent = extractedText || "";
      if (fileBase64 && (!mimeType || mimeType.includes("pdf")) && !textContent) {
        try {
          const apenasBase64 = fileBase64.replace(/^data:[^;]+;base64,/, "");
          const buffer = Buffer.from(apenasBase64, "base64");
          const pdfData = await pdf(buffer);
          textContent = pdfData.text || "";
        } catch (pdfErr) {
          console.warn("Aviso ao extrair texto com pdf-parse:", pdfErr);
        }
      }

      // If Gemini API is not available, try regex fallback from textContent
      if (!apiKey) {
        if (textContent) {
          const plateRegex = /([A-Z]{3}[0-9][A-Z0-9][0-9]{2}|[A-Z]{3}-?[0-9]{4})/gi;
          const plates = (textContent.match(plateRegex) || []).map((p: string) => p.replace(/[\s-]/g, '').toUpperCase());
          const cavalo = plates[0] || "";
          const carreta1 = plates[1] || "";
          const carreta2 = plates[2] || "";
          const carreta = carreta2 ? `${carreta1} / ${carreta2}` : carreta1;

          return res.status(200).json({
            success: true,
            data: {
              placa_cavalo: cavalo,
              placa_carreta: carreta,
              volume_cubado: 0,
              data: new Date().toLocaleDateString("pt-BR"),
              transportador: "",
              modelo_carreta: "SIDER",
              numero_pallets: 24,
              pbt: 44
            }
          });
        }
        return res.status(500).json({ error: "Chave API do Gemini não configurada e documento requer OCR." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const parts: any[] = [];

      if (textContent) {
        parts.push({
          text: `TEXTO EXTRAÍDO DO DOCUMENTO (Ordem de Coleta / Ordem de Serviço / Romaneio / Ficha):\n${textContent}`
        });
      }

      if (fileBase64) {
        const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, "");
        const actualMime = mimeType || (fileBase64.startsWith("data:image/") ? "image/jpeg" : "application/pdf");
        
        parts.push({
          inlineData: {
            mimeType: actualMime,
            data: cleanBase64
          }
        });
      }

      const orderPrompt = `Você é um especialista em logística, cubagem e transportes de cargas no Brasil.
Analise com precisão o documento anexado (Ordem de Coleta / Ordem de Serviço / Romaneio / Agendamento) e extraia exatamente as seguintes informações:

REGRAS RÍGIDAS DE LEITURA E CÁLCULO:
1. "placa_cavalo": Placa do Cavalo Mecânico / Caminhão Trator (ex: JAT4G68, POD0566, ABC1234).
   - REGRA MANDATÓRIA 1: IGNORE COMPLETAMENTE qualquer campo ou coluna chamado "PERFIL DO CAVALO", "PERFIL CAVALO", "PERFIL" ou "TIPO DE VEÍCULO" (valores como "TRUCADO", "TOCO", "TRUCK", "CAVALO TRUCADO" NÃO SÃO PLACAS).
   - REGRA MANDATÓRIA 2: Busque estritamente pelo rótulo "PLACA CAVALO" ou "PLACA DO CAVALO".
   - REGRA MANDATÓRIA 3: A string para "placa_cavalo" deve obrigatoriamente validar no formato de placa brasileira (Padrão Mercosul como JAT4G68 ou antigo como ABC1234), com exatamente 3 letras e 4 caracteres alfanuméricos, sem hífen ou espaços.
   - Se o campo contiver "TRUCADO", descarte-o e busque o valor real da placa no documento.
2. "placa_carreta": Placa da Carreta / Reboque / Semirreboque (ex: FQC2B85). Se houver 2 carretas (bitrem, rodotrem, 9 eixos, 1º e 2º reboque), concatene com " / " (ex: FQC2B85 / FQG1D53). Se houver apenas 1 carreta, retorne-a sem barra.
3. "volume_cubado": Número inteiro (em m³).
   - Se houver valor explícito de volume ou cubagem (ex: 175 m³), use-o.
   - Caso não exista pronto, calcule usando as dimensões da carreta:
     Volume 1 Carreta = Comprimento × Largura × Altura (ex: 12 × 2.6 × 2.8 = 87.36 m³).
     Se houver 2 carretas (bitrem/rodotrem), multiplique por 2 (174.72 m³).
     Arredonde o resultado final para o número inteiro mais próximo (ex: 175).
4. "data": Data do carregamento ou coleta no formato estrito DD/MM/YYYY (ex: 09/08/2026).
5. "transportador": Nome ou Razão Social da transportadora (ex: MOEDENSE).
6. "modelo_carreta": Perfil ou modelo da carreta (ex: SIDER, BAÚ, GRADE BAIXA, VANDERLEIA, BITREM, RODOTREM).
7. "capacidade_pallets": Quantidade ou capacidade de pallets.
   - REGRA MANDATÓRIA 1: Se no documento estiver no formato "X/Y" (ex: "24/24", "26/28", "24 / 24"), retorne exatamente a string com a barra (ex: "24/24").
   - REGRA MANDATÓRIA 2: Se for um número único ou total (ex: "48" ou "24"), retorne a string do número (ex: "48").
8. "pbt": Peso Bruto Total ou Capacidade em Toneladas como número (ex: 44). Se estiver em kg (ex: 44000), converta para 44.

Retorne estritamente o objeto JSON com esses 8 campos.`;

      parts.push({ text: orderPrompt });

      const config: any = {
        responseMimeType: "application/json",
        temperature: 0.1,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            placa_cavalo: { type: Type.STRING, description: "Placa do cavalo mecânico validada no padrão de placa brasileiro ex: JAT4G68 (NUNCA retornar TRUCADO ou TOCO)" },
            placa_carreta: { type: Type.STRING, description: "Placa da carreta (ex: FQC2B85 / FQG1D53)" },
            volume_cubado: { type: Type.NUMBER, description: "Volume cubado em m3 (ex: 175)" },
            data: { type: Type.STRING, description: "Data no formato DD/MM/YYYY" },
            transportador: { type: Type.STRING, description: "Nome do transportador (ex: MOEDENSE)" },
            modelo_carreta: { type: Type.STRING, description: "Modelo ou perfil da carreta (ex: SIDER, BAÚ)" },
            capacidade_pallets: { type: Type.STRING, description: "Capacidade de pallets extraída exatamente do documento (ex: '24/24' ou '48')" },
            pbt: { type: Type.NUMBER, description: "PBT em toneladas (ex: 44)" }
          },
          required: [
            "placa_cavalo",
            "placa_carreta",
            "volume_cubado",
            "data",
            "transportador",
            "modelo_carreta",
            "capacidade_pallets",
            "pbt"
          ]
        }
      };

      const genResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts },
        config: config
      });

      let jsonStr = genResponse.text || "{}";
      jsonStr = jsonStr.replace(/```json\n?|```/g, "").trim();

      const parsed = JSON.parse(jsonStr);

      // Strict Plate Regex: /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i
      const BRAZIL_PLATE_REGEX = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i;

      // Sanitize and Validate placa_cavalo
      if (parsed.placa_cavalo) {
        parsed.placa_cavalo = parsed.placa_cavalo.replace(/[^A-Z0-9]/gi, "").toUpperCase();
        if (!BRAZIL_PLATE_REGEX.test(parsed.placa_cavalo)) {
          console.warn(`[AI Parser] Placa cavalo inválida descartada ("${parsed.placa_cavalo}"). Buscando placa real no texto extraído...`);
          let fallbackPlate = "";
          if (textContent) {
            const allMatches = textContent.match(/[A-Z]{3}[0-9][A-Z0-9][0-9]{2}|[A-Z]{3}-?[0-9]{4}/gi);
            if (allMatches) {
              for (const m of allMatches) {
                const clean = m.replace(/[^A-Z0-9]/gi, "").toUpperCase();
                if (BRAZIL_PLATE_REGEX.test(clean)) {
                  // Ensure it's not the carreta plate
                  const rawCarreta = (parsed.placa_carreta || "").replace(/[^A-Z0-9]/gi, "").toUpperCase();
                  if (!rawCarreta.includes(clean)) {
                    fallbackPlate = clean;
                    break;
                  }
                }
              }
            }
          }
          parsed.placa_cavalo = fallbackPlate;
        }
      }

      if (parsed.placa_carreta) parsed.placa_carreta = parsed.placa_carreta.toUpperCase();
      if (parsed.transportador) parsed.transportador = parsed.transportador.toUpperCase();
      if (parsed.modelo_carreta) parsed.modelo_carreta = parsed.modelo_carreta.toUpperCase();
      if (typeof parsed.volume_cubado === "number") parsed.volume_cubado = Math.round(parsed.volume_cubado);

      // Handle Bitrem / Rodotrem decomposition
      const rawCarreta = parsed.placa_carreta || "";
      const carretaParts = rawCarreta.split(/[/,;+&]/).map((p: string) => p.replace(/[^A-Z0-9]/gi, "").toUpperCase()).filter(Boolean);

      // Pallets strict logic
      const rawPalletsStr = String(parsed.capacidade_pallets ?? parsed.numero_pallets ?? "").trim();
      const slashPalletsMatch = rawPalletsStr.match(/(\d+(?:[.,]\d+)?)\s*[\/\\+]\s*(\d+(?:[.,]\d+)?)/);

      const hasPalletsSlash = Boolean(slashPalletsMatch);
      const isBitrem = carretaParts.length > 1 || 
                       hasPalletsSlash ||
                       (parsed.modelo_carreta && (parsed.modelo_carreta.includes("BITREM") || parsed.modelo_carreta.includes("RODOTREM") || parsed.modelo_carreta.includes("9 EIXOS")));

      let c1Pal = 0;
      let c2Pal = 0;
      let totalPallets = 0;

      if (slashPalletsMatch) {
        // Rule 1: Format "X/Y" -> C1 = X, C2 = Y (DO NOT DIVIDE BY 2!)
        const rawX = slashPalletsMatch[1].replace(',', '.');
        const rawY = slashPalletsMatch[2].replace(',', '.');
        c1Pal = Math.round(parseFloat(rawX) || 0);
        c2Pal = Math.round(parseFloat(rawY) || 0);
        totalPallets = c1Pal + c2Pal;
      } else {
        // Rule 2: Single number / total
        const cleanedStr = rawPalletsStr.replace(/[^\d.,-]/g, '').replace(/,/g, '.');
        const singleNumber = Math.round(parseFloat(cleanedStr) || 0);
        totalPallets = singleNumber;
        if (isBitrem) {
          c1Pal = Math.round(singleNumber / 2);
          c2Pal = Math.round(singleNumber - c1Pal);
        } else {
          c1Pal = singleNumber;
          c2Pal = 0;
        }
      }

      const totalVol = parsed.volume_cubado || 0;
      const totalPbt = parsed.pbt || 0;

      const c1Vol = isBitrem ? Math.round(totalVol / 2) : totalVol;
      const c2Vol = isBitrem ? Math.round(totalVol - c1Vol) : 0;
      const c1Pbt = isBitrem ? Number((totalPbt / 2).toFixed(1)) : totalPbt;
      const c2Pbt = isBitrem ? Number((totalPbt - c1Pbt).toFixed(1)) : 0;

      const fullData = {
        ...parsed,
        numero_pallets: totalPallets,
        capacidade_pallets: rawPalletsStr,
        tipo_veiculo: isBitrem ? "BITREM" : "SINGLE",
        volume_total: totalVol,
        c1: {
          placa: carretaParts[0] || parsed.placa_carreta || "",
          modelo: parsed.modelo_carreta || "SIDER",
          volume: c1Vol,
          pallets: c1Pal,
          pbt: c1Pbt
        },
        c2: isBitrem ? {
          placa: carretaParts[1] || "",
          modelo: parsed.modelo_carreta || "SIDER",
          volume: c2Vol,
          pallets: c2Pal,
          pbt: c2Pbt
        } : null,
        c1_placa: carretaParts[0] || parsed.placa_carreta || "",
        c1_modelo: parsed.modelo_carreta || "SIDER",
        c1_volume: c1Vol,
        c1_pallets: c1Pal,
        c1_pbt: c1Pbt,
        c2_placa: carretaParts[1] || "",
        c2_modelo: isBitrem ? (parsed.modelo_carreta || "SIDER") : "",
        c2_volume: c2Vol,
        c2_pallets: c2Pal,
        c2_pbt: c2Pbt
      };

      return res.status(200).json({
        success: true,
        data: fullData
      });

    } catch (error: any) {
      console.error("Erro ao analisar ordem de coleta:", error);
      return res.status(500).json({
        error: error.message || "Erro ao processar o arquivo com IA."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
