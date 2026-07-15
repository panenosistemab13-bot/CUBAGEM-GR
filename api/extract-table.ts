import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { textoCopiado, imagemBase64, customPrompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Chave API do Gemini não configurada." });
    }

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
      return res.status(200).json({ success: true, partial: true, rawData: textoJSON });
    }

  } catch (error) {
    console.error("Erro no Gemini:", error);
    return res.status(500).json({ error: "Erro interno ao processar dados com a Inteligência Artificial." });
  }
}
