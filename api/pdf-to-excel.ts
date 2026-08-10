import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import * as XLSX from 'xlsx';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Método não permitido'
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY não configurada na Vercel.'
      });
    }

    const { fileBase64, mimeType, fileName } = req.body || {};

    if (!fileBase64) {
      return res.status(400).json({
        error: 'Nenhum arquivo PDF foi enviado.'
      });
    }

    const cleanBase64 = String(fileBase64)
      .replace(/^data:[^;]+;base64,/, '');

    const ai = new GoogleGenAI({
      apiKey
    });

    const prompt = `
Você é um sistema especializado em ler Ordens de Coleta e documentos de transporte.

Analise o PDF enviado e extraia os dados abaixo.

IMPORTANTE:
- Não invente informações.
- Preserve placas corretamente.
- Placa Mercosul: ABC1D23.
- Placa antiga: ABC1234.
- Se houver duas carretas, informe as duas placas separadas por "/".
- Se houver pallets no formato 24/24, preserve exatamente "24/24".
- Se houver somente um número de pallets, preserve o número.
- Data deve ser DD/MM/YYYY.
- PBT deve estar em toneladas.
- Volume/cubagem deve estar em m³.
- Se o documento informar diretamente a cubagem, use esse valor.
- Se informar comprimento, largura e altura, calcule:
  comprimento × largura × altura.
- Se houver BITREM/RODOTREM com duas carretas e somente um volume total, divida o volume entre as duas carretas.
- Não confunda a placa do cavalo com placa de carreta.
- Não confunda "PERFIL DO CAVALO" com placa.

Retorne somente JSON.

Campos:

placa_cavalo
placa_carreta
volume_cubado
data
transportador
modelo_carreta
capacidade_pallets
pbt
tipo_veiculo

tipo_veiculo deve ser:
"SINGLE" para uma carreta
ou
"BITREM" para duas carretas.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'application/pdf',
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            placa_cavalo: {
              type: Type.STRING
            },
            placa_carreta: {
              type: Type.STRING
            },
            volume_cubado: {
              type: Type.NUMBER
            },
            data: {
              type: Type.STRING
            },
            transportador: {
              type: Type.STRING
            },
            modelo_carreta: {
              type: Type.STRING
            },
            capacidade_pallets: {
              type: Type.STRING
            },
            pbt: {
              type: Type.NUMBER
            },
            tipo_veiculo: {
              type: Type.STRING
            }
          },
          required: [
            'placa_cavalo',
            'placa_carreta',
            'volume_cubado',
            'data',
            'transportador',
            'modelo_carreta',
            'capacidade_pallets',
            'pbt',
            'tipo_veiculo'
          ]
        }
      }
    });

    let jsonText = response.text || '{}';

    jsonText = jsonText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const data = JSON.parse(jsonText);

    // ---------------------------------------------------------
    // NORMALIZAÇÃO
    // ---------------------------------------------------------

    const normalizePlate = (value: any) => {
      if (!value) return '';

      return String(value)
        .replace(/[^A-Z0-9/ -]/gi, '')
        .toUpperCase()
        .trim();
    };

    data.placa_cavalo = normalizePlate(data.placa_cavalo);
    data.placa_carreta = normalizePlate(data.placa_carreta);

    data.transportador = String(
      data.transportador || ''
    ).toUpperCase().trim();

    data.modelo_carreta = String(
      data.modelo_carreta || 'SIDER'
    ).toUpperCase().trim();

    data.data = String(data.data || '').trim();

    data.capacidade_pallets = String(
      data.capacidade_pallets || ''
    ).trim();

    data.volume_cubado = Math.round(
      Number(data.volume_cubado) || 0
    );

    data.pbt = Number(
      Number(data.pbt || 0).toFixed(1)
    );

    const isBitrem =
      String(data.tipo_veiculo || '')
        .toUpperCase()
        .includes('BITREM') ||
      String(data.tipo_veiculo || '')
        .toUpperCase()
        .includes('RODOTREM') ||
      data.placa_carreta.includes('/');

    // ---------------------------------------------------------
    // PALLETS
    // ---------------------------------------------------------

    let c1Pallets = 0;
    let c2Pallets = 0;
    let totalPallets = 0;

    const palletText = data.capacidade_pallets;

    const palletPair = palletText.match(
      /(\d+(?:[.,]\d+)?)\s*[\/\\+]\s*(\d+(?:[.,]\d+)?)/ 
    );

    if (palletPair) {
      c1Pallets = Math.round(
        Number(palletPair[1].replace(',', '.'))
      );

      c2Pallets = Math.round(
        Number(palletPair[2].replace(',', '.'))
      );

      totalPallets = c1Pallets + c2Pallets;
    } else {
      totalPallets = Math.round(
        Number(
          palletText
            .replace(/[^\d.,-]/g, '')
            .replace(',', '.')
        ) || 0
      );

      if (isBitrem) {
        c1Pallets = Math.round(totalPallets / 2);
        c2Pallets = totalPallets - c1Pallets;
      } else {
        c1Pallets = totalPallets;
      }
    }

    // ---------------------------------------------------------
    // CARRETAS
    // ---------------------------------------------------------

    const carretaParts = data.placa_carreta
      .split(/[/,;+&]/)
      .map((value: string) =>
        value.replace(/[^A-Z0-9]/gi, '').toUpperCase()
      )
      .filter(Boolean);

    const placaC1 = carretaParts[0] || '';
    const placaC2 = carretaParts[1] || '';

    // ---------------------------------------------------------
    // VOLUME
    // ---------------------------------------------------------

    const totalVolume = Math.round(
      Number(data.volume_cubado) || 0
    );

    const c1Volume = isBitrem
      ? Math.round(totalVolume / 2)
      : totalVolume;

    const c2Volume = isBitrem
      ? totalVolume - c1Volume
      : 0;

    // ---------------------------------------------------------
    // PBT
    // ---------------------------------------------------------

    const totalPbt = Number(data.pbt) || 0;

    const c1Pbt = isBitrem
      ? Number((totalPbt / 2).toFixed(1))
      : totalPbt;

    const c2Pbt = isBitrem
      ? Number((totalPbt - c1Pbt).toFixed(1))
      : 0;

    // ---------------------------------------------------------
    // CRIA O EXCEL
    //
    // O formato abaixo foi feito especificamente para que
    // o seu parseExcelOrder() atual consiga ler o arquivo.
    // ---------------------------------------------------------

    const rows = [
      ['TRANSPORTADOR', data.transportador],

      ['DATA DE CARREGAMENTO', data.data],

      ['PLACA CAVALO', data.placa_cavalo],

      ['PLACA CARRETA', data.placa_carreta],

      ['MODELO CARRETA', data.modelo_carreta],

      ['TIPO VEICULO', isBitrem ? 'BITREM' : 'SINGLE'],

      ['VOLUME CUBADO', totalVolume],

      ['CAPACIDADE PALLETS', data.capacidade_pallets],

      ['PBT', totalPbt],

      ['CARRETA 1', ''],

      ['PLACA CARRETA 1', placaC1],

      ['MODELO CARRETA 1', data.modelo_carreta],

      ['VOLUME CARRETA 1', c1Volume],

      ['PALLETS CARRETA 1', c1Pallets],

      ['PBT CARRETA 1', c1Pbt],

      ['CARRETA 2', ''],

      ['PLACA CARRETA 2', placaC2],

      ['MODELO CARRETA 2', data.modelo_carreta],

      ['VOLUME CARRETA 2', c2Volume],

      ['PALLETS CARRETA 2', c2Pallets],

      ['PBT CARRETA 2', c2Pbt]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 30 }
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'ORDEM DE COLETA'
    );

    const xlsxBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx'
    });

    const xlsxBase64 = Buffer
      .from(xlsxBuffer)
      .toString('base64');

    return res.status(200).json({
      success: true,
      fileName: String(fileName || 'ordem-coleta')
        .replace(/\.pdf$/i, '') + '.xlsx',
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xlsxBase64
    });

  } catch (error: any) {
    console.error('Erro PDF → Excel:', error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        'Não foi possível converter o PDF para Excel.'
    });
  }
}
