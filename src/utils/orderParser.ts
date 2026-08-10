import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { ParseOrderResult } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;

export async function extractTextFromPdfArrayBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useSystemFonts: true,
      disableFontFace: true
    });
    const pdfDoc = await loadingTask.promise;
    let fullText = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  } catch (err) {
    console.error('Error parsing PDF arrayBuffer with pdfjs:', err);
    return '';
  }
}

// Helper to normalize plate (ABC1234 or ABC1D23)
export function normalizePlate(str: string): string {
  if (!str) return '';
  return String(str).replace(/[^A-Z0-9]/gi, '').toUpperCase().trim();
}

// Strict Regex for Brazilian Standard (ABC1234) and Mercosul (ABC1D23 / JAT4G68)
export const BRAZIL_PLATE_REGEX = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i;
export const PLATE_SEARCH_REGEX = /[A-Z]{3}[0-9][A-Z0-9][0-9]{2}|[A-Z]{3}-?[0-9]{4}/gi;
export const PLATE_REGEX = PLATE_SEARCH_REGEX;

// Validates if a string is strictly a Brazilian/Mercosul plate
export function isValidPlate(str: string): boolean {
  if (!str) return false;
  const clean = normalizePlate(str);
  return BRAZIL_PLATE_REGEX.test(clean);
}

// Extracts and validates plate from text or returns null
export function extractValidPlate(str: any): string | null {
  if (!str) return null;
  const s = String(str).trim();
  
  // 1. Direct normalized check
  const clean = normalizePlate(s);
  if (BRAZIL_PLATE_REGEX.test(clean)) {
    return clean;
  }
  
  // 2. Regex search in string (e.g. "PLACA CAVALO: JAT4G68" or "JAT-4G68")
  const matches = s.match(PLATE_SEARCH_REGEX);
  if (matches) {
    for (const m of matches) {
      const c = normalizePlate(m);
      if (BRAZIL_PLATE_REGEX.test(c)) {
        return c;
      }
    }
  }
  return null;
}

// Helper to identify and IGNORE any cell/header related to "PERFIL DO CAVALO" or truck profiles
export function isPerfilCellOrHeader(text: string): boolean {
  if (!text) return false;
  const u = text.toUpperCase().trim();
  return u.includes('PERFIL DO CAVALO') || 
         u.includes('PERFIL CAVALO') || 
         u.includes('PERFIL DO VEICULO') || 
         u.includes('PERFIL DO VEÍCULO') || 
         u.includes('PERFIL VEICULO') || 
         u.includes('PERFIL VEÍCULO') || 
         u.includes('TIPO DO CAVALO') || 
         u.includes('TIPO DE CAVALO') || 
         u.includes('TIPO CAVALO') || 
         u.includes('MODELO DO CAVALO') || 
         u.includes('MODELO CAVALO') || 
         u.includes('CATEGORIA DO CAVALO') ||
         u.includes('CATEGORIA CAVALO') ||
         u.includes('PERFIL');
}

// Helper to strictly identify "PLACA CAVALO" labels (excluding "PERFIL")
export function isStrictPlacaCavaloLabel(text: string): boolean {
  if (!text) return false;
  if (isPerfilCellOrHeader(text)) return false;
  const u = text.toUpperCase().trim();
  
  // Ignore Carreta / Reboque labels
  if (u.includes('CARRETA') || u.includes('REBOQUE') || u.includes('SEMI')) return false;

  return u === 'PLACA CAVALO' ||
         u.startsWith('PLACA CAVALO') ||
         u.includes('PLACA DO CAVALO') ||
         u.includes('PLACA TRATOR') ||
         u.includes('PLACA DO TRATOR') ||
         u.includes('PLACA CAVALO MECÂNICO') ||
         u.includes('PLACA CAVALO MECANICO') ||
         u.includes('PLACA (CAVALO)') ||
         u.includes('PLACA-CAVALO') ||
         u.includes('PLACA_CAVALO') ||
         u === 'PLACA' ||
         u.startsWith('PLACA:') ||
         u.startsWith('PLACA :') ||
         (u.includes('CAVALO') && !u.includes('PERFIL') && !u.includes('TIPO') && !u.includes('MODELO'));
}

// Format dates nicely to DD/MM/YYYY
export function formatDateToBr(value: any): string {
  if (!value) return '';
  
  if (value instanceof Date && !isNaN(value.getTime())) {
    const d = String(value.getDate()).padStart(2, '0');
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const y = value.getFullYear();
    return `${d}/${m}/${y}`;
  }

  // Excel serial date number
  if (typeof value === 'number' && value > 25000 && value < 60000) {
    try {
      const parsedDate = XLSX.SSF.parse_date_code(value);
      if (parsedDate) {
        const d = String(parsedDate.d).padStart(2, '0');
        const m = String(parsedDate.m).padStart(2, '0');
        const y = parsedDate.y;
        return `${d}/${m}/${y}`;
      }
    } catch {
      // ignore
    }
  }

  const str = String(value).trim();

  // Check ISO format YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = String(isoMatch[2]).padStart(2, '0');
    const d = String(isoMatch[3]).padStart(2, '0');
    return `${d}/${m}/${y}`;
  }

  // Check BR format DD/MM/YYYY
  const brMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (brMatch) {
    const d = String(brMatch[1]).padStart(2, '0');
    const m = String(brMatch[2]).padStart(2, '0');
    let y = brMatch[3];
    if (y.length === 2) y = `20${y}`;
    return `${d}/${m}/${y}`;
  }

  return str;
}

// Clean number parser (handles Brazilian currency/number formats with comma/dot)
export function parseNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  let str = String(val).trim();
  // If format is like "24/24", extract first number
  const slashMatch = str.match(/^(\d+(?:[.,]\d+)?)/);
  if (slashMatch) {
    str = slashMatch[1];
  }

  // Replace comma with dot
  str = str.replace(/[^\d.,-]/g, '').replace(/,/g, '.');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export interface PalletDistribution {
  c1Pallets: number;
  c2Pallets: number;
  totalPallets: number;
  hasSlashFormat: boolean;
  rawString: string;
}

/**
 * REGRAS RÍGIDAS DE DISTRIBUIÇÃO DE PALETES (C1 E C2):
 * 
 * 1. SE O VALOR ESTIVER NO FORMATO "X/Y" (Exemplo: "24/24", "26/28", "24 / 24"):
 *    - C1 (Carreta 1) = X (24 plt)
 *    - C2 (Carreta 2) = Y (24 plt)
 *    * NÃO divide por 2 quando o formato já trouxer a barra "/".
 *    - Total de Paletes = X + Y (48 plt).
 * 
 * 2. SE O VALOR FOR UM NÚMERO ÚNICO/TOTAL (Exemplo: "48"):
 *    - Se for Bitrem/Rodotrem (2 carretas):
 *      * C1 = Total / 2 (24 plt)
 *      * C2 = Total / 2 (24 plt)
 *    - Se for Carreta Única:
 *      * C1 = Total (48 plt)
 *      * C2 = 0
 */
export function parsePalletDistribution(
  val: any,
  isBitrem: boolean
): PalletDistribution {
  if (val === undefined || val === null || val === '') {
    return {
      c1Pallets: 0,
      c2Pallets: 0,
      totalPallets: 0,
      hasSlashFormat: false,
      rawString: ''
    };
  }

  const str = String(val).trim();

  // Rule 1: Check if value is in "X/Y" format (e.g. "24/24", "24 / 24", "26/28", "24/24 PLTS", "24+24")
  const slashMatch = str.match(/(\d+(?:[.,]\d+)?)\s*[\/\\+]\s*(\d+(?:[.,]\d+)?)/);
  if (slashMatch) {
    const rawX = slashMatch[1].replace(',', '.');
    const rawY = slashMatch[2].replace(',', '.');
    const x = Math.round(parseFloat(rawX) || 0);
    const y = Math.round(parseFloat(rawY) || 0);
    const total = x + y;

    return {
      c1Pallets: x,
      c2Pallets: y,
      totalPallets: total,
      hasSlashFormat: true,
      rawString: str
    };
  }

  // Rule 2: Single number / total
  const cleanedStr = str.replace(/[^\d.,-]/g, '').replace(/,/g, '.');
  const singleNumber = Math.round(parseFloat(cleanedStr) || 0);

  if (isBitrem) {
    const c1 = Math.round(singleNumber / 2);
    const c2 = Math.round(singleNumber - c1);
    return {
      c1Pallets: c1,
      c2Pallets: c2,
      totalPallets: singleNumber,
      hasSlashFormat: false,
      rawString: str
    };
  } else {
    return {
      c1Pallets: singleNumber,
      c2Pallets: 0,
      totalPallets: singleNumber,
      hasSlashFormat: false,
      rawString: str
    };
  }
}

interface GridCell {
  r: number;
  c: number;
  val: string;
  raw: any;
}

// Auto-format date input with slashes as the user types (e.g. 06 -> 06/08/2026)
export function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  } else {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }
}

// Main parser for Excel Workbook or ArrayBuffer
export function parseExcelOrder(dataBuffer: ArrayBuffer | Uint8Array): ParseOrderResult {
  const workbook = XLSX.read(dataBuffer, { type: 'array', cellDates: true });
  
  // Combine all sheets or take first sheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  if (!worksheet) {
    return createEmptyOrder();
  }

  // Convert worksheet to dense 2D grid of rows and columns
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z100');
  const grid: GridCell[][] = [];

  for (let r = range.s.r; r <= range.e.r; r++) {
    const row: GridCell[] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r, c });
      const cell = worksheet[cellAddress];
      const val = cell ? String(cell.w ?? cell.v ?? '').trim() : '';
      row.push({ r, c, val, raw: cell ? cell.v : null });
    }
    grid.push(row);
  }

  // Helper to find value adjacent to or underneath a label, with optional exclusion & validator
  const findValueByKeywords = (
    keywords: string[],
    excludeKeywords: string[] = [],
    validator?: (val: string) => boolean
  ): { val: string; raw: any; r: number; c: number } | null => {
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const text = grid[r][c].val.toUpperCase();
        if (!text) continue;

        // Skip if cell contains any excluded keyword (e.g. "PERFIL DO CAVALO")
        if (excludeKeywords.some(ex => text.includes(ex.toUpperCase()))) {
          continue;
        }

        for (const kw of keywords) {
          const normKw = kw.toUpperCase();
          if (text.includes(normKw)) {
            // 1. Check if the value is in the same cell after ":" or "-"
            const split = grid[r][c].val.split(/[:=]/);
            if (split.length > 1 && split[1].trim()) {
              const candidate = split[1].trim();
              if (!validator || validator(candidate)) {
                return { val: candidate, raw: candidate, r, c };
              }
            }

            // 2. Check next cell to the right (c+1 to c+6)
            for (let nextC = c + 1; nextC < Math.min(grid[r].length, c + 6); nextC++) {
              if (grid[r][nextC] && grid[r][nextC].val) {
                const candidate = grid[r][nextC].val;
                if (!excludeKeywords.some(ex => candidate.toUpperCase().includes(ex.toUpperCase()))) {
                  if (!validator || validator(candidate)) {
                    return { val: candidate, raw: grid[r][nextC].raw, r, c: nextC };
                  }
                }
              }
            }

            // 3. Check cell directly underneath (r+1 to r+50)
            for (let nextR = r + 1; nextR < Math.min(grid.length, r + 50); nextR++) {
              if (grid[nextR] && grid[nextR][c] && grid[nextR][c].val) {
                const candidate = grid[nextR][c].val;
                if (!excludeKeywords.some(ex => candidate.toUpperCase().includes(ex.toUpperCase()))) {
                  if (!validator || validator(candidate)) {
                    return { val: candidate, raw: grid[nextR][c].raw, r: nextR, c };
                  }
                }
              }
            }
          }
        }
      }
    }
    return null;
  };

  // Find all valid plates across entire sheet using regex /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i
  const allValidPlatesFound: string[] = [];
  for (const row of grid) {
    for (const cell of row) {
      if (!cell.val) continue;
      // Skip if cell contains "PERFIL"
      if (isPerfilCellOrHeader(cell.val)) continue;
      
      const valid = extractValidPlate(cell.val);
      if (valid && isValidPlate(valid) && !allValidPlatesFound.includes(valid)) {
        allValidPlatesFound.push(valid);
      }
    }
  }

  // --- a) TRANSPORTADOR ---
  const transpCell = findValueByKeywords(
    [
      'TRANSPORTADOR',
      'TRANSPORTADORA',
      'EMPRESA TRANSPORTE',
      'RAZÃO SOCIAL TRANSP',
      'TRANSPORTES'
    ],
    ['PERFIL']
  );
  let transportador = transpCell ? transpCell.val : '';
  // Clean up label repetition
  transportador = transportador.replace(/^(TRANSPORTADOR|TRANSPORTADORA)[:\s-]*/i, '').trim();

  // --- b) DATA DE CARREGAMENTO ---
  const dataCell = findValueByKeywords([
    'DATA DE CARREGAMENTO',
    'DATA CARREGAMENTO',
    'DATA DO CARREGAMENTO',
    'DATA DE EMISSÃO',
    'DATA EMISSAO',
    'DATA EMISSÃO',
    'DATA COLETA',
    'DATA DA COLETA',
    'DATA'
  ]);
  let dataFormatada = '';
  if (dataCell) {
    dataFormatada = formatDateToBr(dataCell.raw || dataCell.val);
  }
  if (!dataFormatada) {
    // Search grid for any date
    for (const row of grid) {
      for (const cell of row) {
        const testDate = formatDateToBr(cell.raw || cell.val);
        if (testDate && testDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          dataFormatada = testDate;
          break;
        }
      }
      if (dataFormatada) break;
    }
  }

  // --- c) PLACA CAVALO (STRICT: IGNORE "PERFIL DO CAVALO" AND VALIDATE REGEX /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i) ---
  let placaCavalo = '';

  // Pass 1: Search by strict keywords, excluding "PERFIL DO CAVALO" / "PERFIL"
  const cavaloCell = findValueByKeywords(
    [
      'PLACA CAVALO',
      'PLACA DO CAVALO',
      'PLACA TRATOR',
      'PLACA DO TRATOR',
      'PLACA CAVALO MECÂNICO',
      'PLACA CAVALO MECANICO',
      'PLACA (CAVALO)',
      'PLACA-CAVALO',
      'PLACA_CAVALO'
    ],
    [
      'PERFIL DO CAVALO',
      'PERFIL CAVALO',
      'PERFIL DO VEICULO',
      'PERFIL DO VEÍCULO',
      'PERFIL VEICULO',
      'PERFIL VEÍCULO',
      'PERFIL',
      'TIPO DO CAVALO',
      'TIPO CAVALO',
      'MODELO DO CAVALO',
      'CATEGORIA DO CAVALO',
      'CARRETA',
      'REBOQUE'
    ],
    (candidate) => Boolean(extractValidPlate(candidate))
  );

  if (cavaloCell) {
    const valid = extractValidPlate(cavaloCell.val);
    if (valid && isValidPlate(valid)) {
      placaCavalo = valid;
    }
  }

  // Pass 2: If not found, search cells matching isStrictPlacaCavaloLabel
  if (!placaCavalo) {
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const text = grid[r][c].val;
        if (!text || isPerfilCellOrHeader(text)) continue;

        if (isStrictPlacaCavaloLabel(text)) {
          // Check same cell
          const same = extractValidPlate(text);
          if (same && isValidPlate(same)) {
            placaCavalo = same;
            break;
          }
          // Check right
          for (let nextC = c + 1; nextC < Math.min(grid[r].length, c + 6); nextC++) {
            const cell = grid[r][nextC];
            if (!cell || !cell.val || isPerfilCellOrHeader(cell.val)) continue;
            const valid = extractValidPlate(cell.val);
            if (valid && isValidPlate(valid)) {
              placaCavalo = valid;
              break;
            }
          }
          if (placaCavalo) break;
          // Check down
          for (let nextR = r + 1; nextR < Math.min(grid.length, r + 50); nextR++) {
            const cell = grid[nextR][c];
            if (!cell || !cell.val || isPerfilCellOrHeader(cell.val)) continue;
            const valid = extractValidPlate(cell.val);
            if (valid && isValidPlate(valid)) {
              placaCavalo = valid;
              break;
            }
          }
          if (placaCavalo) break;
        }
      }
      if (placaCavalo) break;
    }
  }

  // --- d) PLACA CARRETA (Carreta 1 and Carreta 2) ---
  const carreta1Cell = findValueByKeywords(
    ['PLACA CARRETA 1', 'PLACA CARRETA', 'PLACA DA CARRETA', 'CARRETA 1', 'REBOQUE 1', '1º REBOQUE', '1 REBOQUE', 'SEMI-REBOQUE 1', 'SEMIREBOQUE 1'],
    ['PERFIL DO CAVALO', 'PERFIL CAVALO', 'PERFIL CARRETA', 'PERFIL DA CARRETA', 'PERFIL', 'MODELO'],
    (candidate) => Boolean(extractValidPlate(candidate))
  );
  const carreta2Cell = findValueByKeywords(
    ['PLACA CARRETA 2', 'CARRETA 2', 'REBOQUE 2', '2º REBOQUE', '2 REBOQUE', 'SEMI-REBOQUE 2', 'SEMI REBOQUE 2', 'SEMIREBOQUE 2'],
    ['PERFIL DO CAVALO', 'PERFIL CAVALO', 'PERFIL CARRETA', 'PERFIL DA CARRETA', 'PERFIL', 'MODELO'],
    (candidate) => Boolean(extractValidPlate(candidate))
  );
  
  let p1 = '';
  let p2 = '';

  if (carreta1Cell) {
    const valid = extractValidPlate(carreta1Cell.val);
    if (valid && isValidPlate(valid)) {
      p1 = valid;
    }
  }

  if (carreta2Cell) {
    const valid = extractValidPlate(carreta2Cell.val);
    if (valid && isValidPlate(valid)) {
      p2 = valid;
    }
  }

  // Pass 3: Fallbacks from allValidPlatesFound
  // If placaCavalo is empty or invalid, take first plate that is not p1 or p2
  if (!placaCavalo || !isValidPlate(placaCavalo)) {
    const candidateCavaloPlates = allValidPlatesFound.filter(p => p !== p1 && p !== p2);
    if (candidateCavaloPlates.length > 0) {
      placaCavalo = candidateCavaloPlates[0];
    } else if (allValidPlatesFound.length > 0) {
      placaCavalo = allValidPlatesFound[0];
    }
  }

  // If p1 is not found, take next available plate
  if (!p1) {
    const available = allValidPlatesFound.filter(p => p !== placaCavalo);
    if (available.length > 0) {
      p1 = available[0];
    }
  }

  // If p2 is not found and there are more distinct plates
  if (!p2 && allValidPlatesFound.length > 2) {
    const available = allValidPlatesFound.filter(p => p !== placaCavalo && p !== p1);
    if (available.length > 0) {
      p2 = available[0];
    }
  }

  // Strict final guarantee: placaCavalo MUST be a valid plate or empty string
  if (!isValidPlate(placaCavalo)) {
    placaCavalo = '';
  }

  let placaCarreta = p1;
  if (p2 && p2 !== p1) {
    placaCarreta = `${p1} / ${p2}`;
  }

  // --- e) MODELO CARRETA ---
  const modeloCell = findValueByKeywords([
    'PERFIL CARRETA',
    'MODELO CARRETA',
    'PERFIL DA CARRETA',
    'TIPO CARROCERIA',
    'TIPO VEICULO',
    'TIPO DE VEÍCULO',
    'TIPO VEÍCULO',
    'MODELO VEICULO',
    'CARROCERIA'
  ], ['PERFIL DO CAVALO', 'PERFIL CAVALO']);
  let modeloCarreta = modeloCell ? modeloCell.val.toUpperCase().trim() : '';
  modeloCarreta = modeloCarreta.replace(/^(PERFIL CARRETA|MODELO CARRETA|TIPO VEICULO|CARROCERIA)[:\s-]*/i, '').trim();

  // Default smart guess if empty
  if (!modeloCarreta) {
    for (const row of grid) {
      for (const cell of row) {
        const u = cell.val.toUpperCase();
        if (u.includes('SIDER')) { modeloCarreta = 'SIDER'; break; }
        if (u.includes('BAÚ') || u.includes('BAU')) { modeloCarreta = 'BAÚ'; break; }
        if (u.includes('GRADE BAIXA')) { modeloCarreta = 'GRADE BAIXA'; break; }
        if (u.includes('VANDERLEIA') || u.includes('VANDERLEI')) { modeloCarreta = 'VANDERLEIA'; break; }
        if (u.includes('BITREM')) { modeloCarreta = 'BITREM'; break; }
        if (u.includes('RODOTREM')) { modeloCarreta = 'RODOTREM'; break; }
      }
      if (modeloCarreta) break;
    }
  }

  // --- f) Nº PALLETS ---
  const palletsCell = findValueByKeywords([
    'CAPACIDADE PALLETS',
    'CAPACIDADE DE PALLETS',
    'NUMERO PALLETS',
    'Nº PALLETS',
    'N PALLETS',
    'QTD PALLETS',
    'PALLETS',
    'PALETES'
  ], ['PERFIL DO CAVALO', 'PERFIL CAVALO']);
  const rawPalletsVal = palletsCell ? String(palletsCell.val || '').trim() : '';

  // --- g) PBT (TON) ---
  const pbtCell = findValueByKeywords([
    'CAPACIDADE TONELADAS',
    'CAPACIDADE TON',
    'CAPACIDADE DE TONELADAS',
    'PBT (TON)',
    'PBT (TONELADAS)',
    'PBT',
    'PESO BRUTO TOTAL',
    'CAPACIDADE PESO',
    'TONELADAS'
  ]);
  let pbt = 0;
  if (pbtCell) {
    pbt = parseNumber(pbtCell.val);
    // If entered in kg (e.g. 44000), convert to ton
    if (pbt > 500) {
      pbt = Math.round(pbt / 1000);
    }
  }

  // --- h) VOLUME CUBADO (M³) ---
  const volumeCell = findValueByKeywords([
    'VOLUME CUBADO',
    'VOLUME (M³)',
    'VOLUME M3',
    'VOLUME',
    'CAPACIDADE M3',
    'CAPACIDADE M³',
    'CUBAGEM (M³)',
    'CUBAGEM'
  ]);

  let volumeCubado = 0;
  let calculationDetails = '';

  if (volumeCell) {
    volumeCubado = parseNumber(volumeCell.val);
  }

  // If not found or 0, calculate using trailer dimensions:
  // Volume 1 Carreta = COMPRIMENTO x LARGURA x ALTURA (ex: 12 * 2.6 * 2.8 = 87.36 m³)
  // If 2 carretas, multiply by 2 (174.72 m³), rounded to nearest integer (175).
  if (!volumeCubado || volumeCubado <= 0) {
    const compCell = findValueByKeywords(['COMPRIMENTO', 'COMP (M)', 'COMPRIMENTO (M)', 'COMP']);
    const largCell = findValueByKeywords(['LARGURA', 'LARG (M)', 'LARGURA (M)', 'LARG']);
    const altCell = findValueByKeywords(['ALTURA', 'ALT (M)', 'ALTURA (M)', 'ALT']);

    const comp = compCell ? parseNumber(compCell.val) : 0;
    const larg = largCell ? parseNumber(largCell.val) : 0;
    const alt = altCell ? parseNumber(altCell.val) : 0;

    if (comp > 0 && larg > 0 && alt > 0) {
      const vol1 = comp * larg * alt;
      // Determine if there are 2 carretas (or bitrem / rodotrem / 2 plates)
      const has2Trailers = (p2 && p2.length > 0) || 
                           modeloCarreta.includes('BITREM') || 
                           modeloCarreta.includes('RODOTREM') || 
                           modeloCarreta.includes('9 EIXOS');
      
      const totalVol = has2Trailers ? vol1 * 2 : vol1;
      volumeCubado = Math.round(totalVol);
      calculationDetails = `${comp}m × ${larg}m × ${alt}m = ${vol1.toFixed(2)}m³ ${has2Trailers ? '× 2 carretas = ' + (vol1 * 2).toFixed(2) + 'm³' : ''} → Arredondado: ${volumeCubado}m³`;
    }
  }

  const hasPalletsSlash = Boolean(rawPalletsVal && /(\d+(?:[.,]\d+)?)\s*[\/\\+]\s*(\d+(?:[.,]\d+)?)/.test(rawPalletsVal));

  const isBitrem = Boolean(p2 && p2.length > 0) || 
                   modeloCarreta.includes('BITREM') || 
                   modeloCarreta.includes('RODOTREM') || 
                   modeloCarreta.includes('9 EIXOS') ||
                   hasPalletsSlash;

  const c1Volume = isBitrem ? Math.round(volumeCubado / 2) : Math.round(volumeCubado);
  const c2Volume = isBitrem ? Math.round(volumeCubado - c1Volume) : 0;

  // Strict Pallet Distribution:
  // Format "X/Y" (e.g. 24/24) -> C1 = X (24), C2 = Y (24), Total = X+Y (48), do NOT divide by 2!
  // Single number (e.g. 48) -> Bitrem: C1 = 24, C2 = 24 | Single: C1 = 48, C2 = 0
  const palletDist = parsePalletDistribution(rawPalletsVal, isBitrem);
  const numeroPallets = palletDist.totalPallets;
  const c1Pallets = palletDist.c1Pallets;
  const c2Pallets = isBitrem ? palletDist.c2Pallets : 0;

  const c1Pbt = isBitrem ? Number((pbt / 2).toFixed(1)) : pbt;
  const c2Pbt = isBitrem ? Number((pbt - c1Pbt).toFixed(1)) : 0;

  return {
    placa_cavalo: placaCavalo.toUpperCase(),
    placa_carreta: placaCarreta.toUpperCase(),
    volume_cubado: Math.round(volumeCubado),
    volume_total: Math.round(volumeCubado),
    data: dataFormatada,
    transportador: transportador.toUpperCase(),
    modelo_carreta: modeloCarreta.toUpperCase(),
    numero_pallets: numeroPallets,
    pbt: pbt,
    tipo_veiculo: isBitrem ? 'BITREM' : 'SINGLE',
    c1: {
      placa: p1.toUpperCase(),
      modelo: modeloCarreta.toUpperCase() || 'SIDER',
      pallets: c1Pallets,
      pbt: c1Pbt,
      volume: c1Volume
    },
    c2: isBitrem ? {
      placa: p2.toUpperCase(),
      modelo: modeloCarreta.toUpperCase() || 'SIDER',
      pallets: c2Pallets,
      pbt: c2Pbt,
      volume: c2Volume
    } : null,
    c1_placa: p1.toUpperCase(),
    c1_modelo: modeloCarreta.toUpperCase(),
    c1_volume: c1Volume,
    c1_pallets: c1Pallets,
    c1_pbt: c1Pbt,
    c2_placa: p2 ? p2.toUpperCase() : '',
    c2_modelo: isBitrem ? modeloCarreta.toUpperCase() : '',
    c2_volume: c2Volume,
    c2_pallets: c2Pallets,
    c2_pbt: c2Pbt,
    detalhes_calculo: calculationDetails
  };
}

export function createEmptyOrder(): ParseOrderResult {
  return {
    placa_cavalo: '',
    placa_carreta: '',
    volume_cubado: 0,
    volume_total: 0,
    data: '',
    transportador: '',
    modelo_carreta: 'SIDER',
    numero_pallets: 0,
    pbt: 0,
    tipo_veiculo: 'SINGLE',
    c1: {
      placa: '',
      modelo: 'SIDER',
      pallets: 0,
      pbt: 0,
      volume: 0
    },
    c2: null,
    c1_placa: '',
    c1_modelo: 'SIDER',
    c1_volume: 0,
    c1_pallets: 0,
    c1_pbt: 0,
    c2_placa: '',
    c2_modelo: 'SIDER',
    c2_volume: 0,
    c2_pallets: 0,
    c2_pbt: 0
  };
}

/**
 * Normalizes any order object from Firebase into the standard C1 / C2 OrdemColetaItem.
 */
export function normalizeOrdemColetaItem(item: any, id?: string): import('../types').OrdemColetaItem {
  const isBitrem = item.tipo_veiculo === 'BITREM' || 
                   item.tipo_veiculo === 'bitrem' || 
                   Boolean(item.c2 && item.c2.placa) || 
                   Boolean(item.c2_placa) || 
                   (item.placa_carreta && item.placa_carreta.includes('/')) || 
                   (item.modelo_carreta && (item.modelo_carreta.includes('BITREM') || item.modelo_carreta.includes('RODOTREM')));

  const rawVol = Number(item.volume_total ?? item.volume_cubado ?? 0);
  const rawPbt = Number(item.pbt ?? 0);

  // If item already has structured c1 and c2
  if (item.c1 && typeof item.c1 === 'object') {
    const c1Vol = Number(item.c1.volume) || (isBitrem ? Math.round(rawVol / 2) : rawVol);
    const c2Vol = item.c2 ? (Number(item.c2.volume) || Math.round(rawVol - c1Vol)) : 0;
    const totalV = Number(item.volume_total) || (c1Vol + c2Vol);

    let c1Pal = item.c1.pallets;
    let c2Pal = item.c2 ? item.c2.pallets : (item.c2_pallets !== undefined ? item.c2_pallets : undefined);

    if (c1Pal === undefined || c1Pal === null || c1Pal === '') {
      const pDist = parsePalletDistribution(item.numero_pallets ?? item.pallets ?? 0, isBitrem);
      c1Pal = pDist.c1Pallets;
      c2Pal = isBitrem ? pDist.c2Pallets : 0;
    } else if (typeof c1Pal === 'string' && c1Pal.includes('/')) {
      const pDist = parsePalletDistribution(c1Pal, isBitrem);
      c1Pal = pDist.c1Pallets;
      c2Pal = pDist.c2Pallets;
    } else {
      c1Pal = Number(c1Pal) || 0;
      if (c2Pal !== undefined && c2Pal !== null && c2Pal !== '') {
        c2Pal = Number(c2Pal) || 0;
      } else if (isBitrem) {
        const pDist = parsePalletDistribution(item.numero_pallets ?? item.pallets ?? c1Pal, isBitrem);
        c2Pal = pDist.c2Pallets;
      } else {
        c2Pal = 0;
      }
    }

    const totalPal = isBitrem ? (Number(c1Pal) + Number(c2Pal)) : Number(c1Pal);

    return {
      id: item.id || id,
      tipo_veiculo: isBitrem ? 'BITREM' : 'SINGLE',
      placa_cavalo: (item.placa_cavalo || '').trim().toUpperCase(),
      data: item.data || '',
      transportador: (item.transportador || '').trim().toUpperCase(),
      c1: {
        placa: (item.c1.placa || '').trim().toUpperCase(),
        modelo: (item.c1.modelo || item.modelo_carreta || 'SIDER').trim().toUpperCase(),
        pallets: c1Pal,
        pbt: item.c1.pbt !== undefined ? item.c1.pbt : (isBitrem ? Number((rawPbt / 2).toFixed(1)) : rawPbt),
        volume: c1Vol
      },
      c2: isBitrem && item.c2 ? {
        placa: (item.c2.placa || '').trim().toUpperCase(),
        modelo: (item.c2.modelo || item.modelo_carreta || 'SIDER').trim().toUpperCase(),
        pallets: c2Pal,
        pbt: item.c2.pbt !== undefined ? item.c2.pbt : Number((rawPbt - (Number(item.c1.pbt) || 0)).toFixed(1)),
        volume: c2Vol
      } : (isBitrem ? {
        placa: (item.c2_placa || '').trim().toUpperCase(),
        modelo: (item.c2_modelo || item.modelo_carreta || 'SIDER').trim().toUpperCase(),
        pallets: c2Pal,
        pbt: Number((rawPbt / 2).toFixed(1)),
        volume: Math.round(rawVol / 2)
      } : null),
      volume_total: totalV,
      created_at: item.created_at || Date.now(),
      created_by: item.created_by,
      origem_arquivo: item.origem_arquivo,
      observacoes: item.observacoes,
      placa_carreta: item.placa_carreta,
      volume_cubado: totalV,
      modelo_carreta: item.modelo_carreta,
      numero_pallets: totalPal,
      pbt: rawPbt
    };
  }

  // Decompose from legacy fields
  const plates = (item.placa_carreta || '').split(/[/,;+&]/).map((p: string) => normalizePlate(p)).filter(Boolean);
  const p1 = item.c1_placa ? normalizePlate(item.c1_placa) : (plates[0] || '');
  const p2 = item.c2_placa ? normalizePlate(item.c2_placa) : (plates[1] || '');

  const c1Vol = Number(item.c1_volume) || (isBitrem ? Math.round(rawVol / 2) : rawVol);
  const c2Vol = Number(item.c2_volume) || (isBitrem ? Math.round(rawVol - c1Vol) : 0);
  const totalV = Number(item.volume_total) || (c1Vol + c2Vol) || rawVol;

  const rawPalVal = item.numero_pallets !== undefined ? item.numero_pallets : (item.pallets !== undefined ? item.pallets : (item.c1_pallets !== undefined ? item.c1_pallets : 0));
  let c1Pal: number;
  let c2Pal: number;
  if (item.c1_pallets !== undefined && item.c2_pallets !== undefined && item.c1_pallets !== '' && item.c2_pallets !== '') {
    c1Pal = Number(item.c1_pallets) || 0;
    c2Pal = Number(item.c2_pallets) || 0;
  } else {
    const pDist = parsePalletDistribution(rawPalVal, isBitrem);
    c1Pal = pDist.c1Pallets;
    c2Pal = isBitrem ? pDist.c2Pallets : 0;
  }
  const totalPal = isBitrem ? (c1Pal + c2Pal) : c1Pal;

  const c1Pbt = item.c1_pbt !== undefined ? item.c1_pbt : (isBitrem ? Number((rawPbt / 2).toFixed(1)) : rawPbt);
  const c2Pbt = item.c2_pbt !== undefined ? item.c2_pbt : (isBitrem ? Number((rawPbt - (Number(c1Pbt) || 0)).toFixed(1)) : 0);

  return {
    id: item.id || id,
    tipo_veiculo: isBitrem ? 'BITREM' : 'SINGLE',
    placa_cavalo: (item.placa_cavalo || item.cavalo || '').trim().toUpperCase(),
    data: item.data || '',
    transportador: (item.transportador || '').trim().toUpperCase(),
    c1: {
      placa: p1,
      modelo: (item.c1_modelo || item.modelo_carreta || item.modeloCarreta || 'SIDER').trim().toUpperCase(),
      pallets: c1Pal,
      pbt: c1Pbt,
      volume: c1Vol
    },
    c2: isBitrem ? {
      placa: p2,
      modelo: (item.c2_modelo || item.modelo_carreta || item.modeloCarreta || 'SIDER').trim().toUpperCase(),
      pallets: c2Pal,
      pbt: c2Pbt,
      volume: c2Vol
    } : null,
    volume_total: totalV,
    created_at: item.created_at || Date.now(),
    created_by: item.created_by,
    origem_arquivo: item.origem_arquivo,
    observacoes: item.observacoes,
    placa_carreta: item.placa_carreta || (isBitrem ? `${p1} / ${p2}` : p1),
    volume_cubado: totalV,
    modelo_carreta: item.modelo_carreta || item.modeloCarreta || 'SIDER',
    numero_pallets: totalPal,
    pbt: rawPbt
  };
}

export interface CarretaItem {
  id?: string;
  tag: 'C1' | 'C2' | 'Única' | string;
  placa: string;
  modelo: string;
  pallets: string | number;
  pbt: string | number;
  volume: string | number;
}

export interface BitremParseResult {
  isBitrem: boolean;
  cavalo: string;
  data: string;
  transportador: string;
  carretas: CarretaItem[];
  totalVolume: number;
  totalPallets: number;
  totalPbt: number;
  rawPlacaCarreta: string;
}

/**
 * Parses and separates Bitrem data from raw inputs (strings, objects, or arrays),
 * strictly splitting concatenated plates with '/' into two distinct C1 and C2 objects.
 */
export function parseBitremData(input: {
  id?: string;
  cavalo?: string;
  carreta?: string;
  placa_cavalo?: string;
  placa_carreta?: string;
  m3?: string | number;
  volume_cubado?: string | number;
  data?: string;
  transportador?: string;
  pallets?: string | number;
  numero_pallets?: string | number;
  pbt?: string | number;
  modeloCarreta?: string;
  modelo_carreta?: string;
  tipoVeiculo?: string;
  tipo_veiculo?: string;
  c1_placa?: string;
  c1_modelo?: string;
  c1_m3?: string | number;
  c1_volume?: string | number;
  c1_pallets?: string | number;
  c1_pbt?: string | number;
  c2_placa?: string;
  c2_modelo?: string;
  c2_m3?: string | number;
  c2_volume?: string | number;
  c2_pallets?: string | number;
  c2_pbt?: string | number;
}): BitremParseResult {
  const cavalo = (input.cavalo || input.placa_cavalo || '').trim().toUpperCase();
  const rawCarreta = (input.carreta || input.placa_carreta || '').trim();
  const rawData = (input.data || '').trim();
  const transportador = (input.transportador || '').trim().toUpperCase();
  const rawModelo = (input.modeloCarreta || input.modelo_carreta || 'SIDER').trim().toUpperCase();

  const rawVolumeStr = String(input.m3 ?? input.volume_cubado ?? '').replace(',', '.');
  const totalVol = parseFloat(rawVolumeStr) || 0;

  const rawPbtStr = String(input.pbt ?? '').replace(',', '.');
  const totalPbt = parseFloat(rawPbtStr) || 0;

  // Check if plate string contains slash '/' or multiple plates with strict deduplication
  const rawPlates = rawCarreta.split(/[/,;+&]/).map(p => normalizePlate(p)).filter(Boolean);
  const plates = Array.from(new Set(rawPlates));

  const hasMultiplePlates = plates.length >= 2;
  const hasExplicitC2 = Boolean(input.c2_placa && normalizePlate(input.c2_placa));
  const isBitrem = hasMultiplePlates || hasExplicitC2 || input.tipoVeiculo === 'bitrem' || input.tipo_veiculo === 'bitrem' || rawModelo.includes('BITREM') || rawModelo.includes('RODOTREM');

  if (isBitrem && (hasMultiplePlates || hasExplicitC2)) {
    const p1 = input.c1_placa ? normalizePlate(input.c1_placa) : (plates[0] || '');
    const p2 = input.c2_placa ? normalizePlate(input.c2_placa) : (plates[1] || plates[0] || '');

    // Volumes: use individual if provided, otherwise half of total each
    let numV1: number;
    let numV2: number;
    const v1Input = input.c1_volume ?? input.c1_m3;
    const v2Input = input.c2_volume ?? input.c2_m3;

    if (v1Input !== undefined && v1Input !== '' && !isNaN(parseFloat(String(v1Input).replace(',', '.')))) {
      numV1 = parseFloat(String(v1Input).replace(',', '.'));
      numV2 = v2Input !== undefined && v2Input !== '' && !isNaN(parseFloat(String(v2Input).replace(',', '.')))
        ? parseFloat(String(v2Input).replace(',', '.'))
        : Math.round(totalVol > numV1 ? totalVol - numV1 : numV1);
    } else {
      if (totalVol > 0) {
        numV1 = Math.round(totalVol / 2);
        numV2 = Math.round(totalVol - numV1);
      } else {
        numV1 = 0;
        numV2 = 0;
      }
    }

    // Pallets: check explicit C1/C2 inputs or use parsePalletDistribution with strict X/Y rule
    let numPal1: number;
    let numPal2: number;
    let totalPal: number;
    const pal1Input = input.c1_pallets;
    const pal2Input = input.c2_pallets;

    if (pal1Input !== undefined && pal1Input !== '' && pal2Input !== undefined && pal2Input !== '') {
      numPal1 = parseFloat(String(pal1Input)) || 0;
      numPal2 = parseFloat(String(pal2Input)) || 0;
      totalPal = numPal1 + numPal2;
    } else {
      const rawPallets = input.pallets ?? input.numero_pallets ?? pal1Input ?? 0;
      const pDist = parsePalletDistribution(rawPallets, true);
      numPal1 = pDist.c1Pallets;
      numPal2 = pDist.c2Pallets;
      totalPal = pDist.totalPallets;
    }

    // PBT: use individual if provided, otherwise half of total each
    let numPbt1: number;
    let numPbt2: number;
    const pbt1Input = input.c1_pbt;
    const pbt2Input = input.c2_pbt;

    if (pbt1Input !== undefined && pbt1Input !== '' && !isNaN(parseFloat(String(pbt1Input).replace(',', '.')))) {
      numPbt1 = parseFloat(String(pbt1Input).replace(',', '.'));
      numPbt2 = pbt2Input !== undefined && pbt2Input !== '' && !isNaN(parseFloat(String(pbt2Input).replace(',', '.')))
        ? parseFloat(String(pbt2Input).replace(',', '.'))
        : (totalPbt > numPbt1 ? Number((totalPbt - numPbt1).toFixed(1)) : numPbt1);
    } else {
      if (totalPbt > 0) {
        numPbt1 = Number((totalPbt / 2).toFixed(1));
        numPbt2 = Number((totalPbt - numPbt1).toFixed(1));
      } else {
        numPbt1 = 0;
        numPbt2 = 0;
      }
    }

    // Modelos
    const cleanModelo = rawModelo.replace(/RODOTREM\s*|RODO\s*TREM\s*|BITREM\s*/g, '').trim() || 'SIDER';
    const m1 = (input.c1_modelo || cleanModelo).toUpperCase();
    const m2 = (input.c2_modelo || cleanModelo).toUpperCase();

    // STRICT LIMIT: Max 2 carretas (C1 and C2)
    const carretas: CarretaItem[] = [
      {
        tag: 'C1',
        placa: p1,
        modelo: m1,
        pallets: numPal1 || (totalPal ? String(numPal1) : '---'),
        pbt: numPbt1 || (totalPbt ? String(numPbt1) : '---'),
        volume: numV1
      },
      {
        tag: 'C2',
        placa: p2,
        modelo: m2,
        pallets: numPal2 || (totalPal ? String(numPal2) : '---'),
        pbt: numPbt2 || (totalPbt ? String(numPbt2) : '---'),
        volume: numV2
      }
    ].slice(0, 2);

    const calculatedTotalVol = numV1 + numV2;
    const calculatedTotalPal = numPal1 + numPal2;
    const calculatedTotalPbt = Number((numPbt1 + numPbt2).toFixed(1));

    return {
      isBitrem: true,
      cavalo,
      data: rawData,
      transportador,
      carretas,
      totalVolume: calculatedTotalVol || totalVol,
      totalPallets: calculatedTotalPal || totalPal,
      totalPbt: calculatedTotalPbt || totalPbt,
      rawPlacaCarreta: p1 && p2 && p1 !== p2 ? `${p1} / ${p2}` : (p1 || p2)
    };
  }

  // Single Carreta
  const singlePlate = plates[0] || normalizePlate(rawCarreta);
  const cleanModel = rawModelo.replace(/RODOTREM\s*|RODO\s*TREM\s*|BITREM\s*/g, '').trim() || 'SIDER';
  const singlePalletDist = parsePalletDistribution(input.pallets ?? input.numero_pallets ?? input.c1_pallets ?? 0, false);
  const singleTotalPal = singlePalletDist.totalPallets;

  return {
    isBitrem: false,
    cavalo,
    data: rawData,
    transportador,
    carretas: [
      {
        tag: 'Única',
        placa: singlePlate,
        modelo: cleanModel,
        pallets: singleTotalPal || '---',
        pbt: totalPbt || (rawPbtStr ? rawPbtStr : '---'),
        volume: totalVol || (rawVolumeStr ? rawVolumeStr : '0')
      }
    ],
    totalVolume: totalVol,
    totalPallets: singleTotalPal,
    totalPbt: totalPbt,
    rawPlacaCarreta: singlePlate
  };
}

// 100% Local Text Order Parser (No external API or server required)
export function parseLocalTextOrder(textContent: string): ParseOrderResult {
  const upperText = textContent.toUpperCase();
  
  // 1. Global Plates via /\b[A-Z]{3}[0-9][A-Z0-9][0-9]{2}\b/gi
  const rawPlateMatches = (textContent.match(/\b[A-Z]{3}[0-9][A-Z0-9][0-9]{2}\b/gi) || []);
  const normalizedPlates = rawPlateMatches.map(p => normalizePlate(p)).filter(Boolean);
  const uniquePlates = Array.from(new Set(normalizedPlates)).filter(p => isValidPlate(p));

  const placaCavalo = uniquePlates[0] || '';
  const placaCarreta1 = uniquePlates[1] || '';
  const placaCarreta2 = uniquePlates[2] || '';

  const hasC2 = Boolean(placaCarreta2 && placaCarreta2 !== placaCarreta1);
  const isBitrem = hasC2;

  // 2. Date extraction (e.g. 6/8/2026 or 06/08/2026)
  let dataStr = '';
  const dateMatch = upperText.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/);
  if (dateMatch) {
    const d = dateMatch[1].padStart(2, '0');
    const m = dateMatch[2].padStart(2, '0');
    let y = dateMatch[3];
    if (y.length === 2) y = '20' + y;
    dataStr = `${d}/${m}/${y}`;
  } else {
    dataStr = new Date().toLocaleDateString('pt-BR');
  }

  // 3. Transportador
  let transportador = 'TRANSMAGNA';
  if (upperText.includes('TRANSMAGNA')) transportador = 'TRANSMAGNA';
  else if (upperText.includes('TRANSPORTADOR')) {
    const idx = upperText.indexOf('TRANSPORTADOR');
    if (idx !== -1) {
      const sub = textContent.slice(idx, idx + 40);
      const parts = sub.split(/[:\-\n]/);
      if (parts[1] && parts[1].trim().length > 2) {
        transportador = parts[1].trim();
      }
    }
  }

  // 4. Perfil / Modelo Carreta
  let perfilCarreta = 'SIDER';
  if (upperText.includes('BAU') || upperText.includes('BAÚ')) {
    perfilCarreta = 'BAU';
  } else if (upperText.includes('REFRIGERADO') || upperText.includes('FRIGORIFICO')) {
    perfilCarreta = 'REFRIGERADO';
  } else if (upperText.includes('GRADE BAIXA')) {
    perfilCarreta = 'GRADE BAIXA';
  } else if (upperText.includes('SIDER')) {
    perfilCarreta = 'SIDER';
  }

  // 5. Capacidade Pallets
  let capacidadePallets = 28;
  const palMatch = upperText.match(/(?:PALLETS|PALETE|PLT)\D*(\d{1,2})/);
  if (palMatch) {
    const val = parseInt(palMatch[1], 10);
    if (val > 0 && val <= 100) capacidadePallets = val;
  }

  // 6. PBT / Toneladas
  let pbtVal = 30;
  const pbtMatch = upperText.match(/(?:TONELADAS|PBT|TON)\D*(\d{1,2})(?:[,\.]\d+)?/);
  if (pbtMatch) {
    const val = parseFloat(pbtMatch[1].replace(',', '.'));
    if (val > 0 && val <= 100) pbtVal = val;
  }

  return {
    placa_cavalo: placaCavalo,
    placa_carreta: isBitrem ? `${placaCarreta1} / ${placaCarreta2}` : placaCarreta1,
    tipo_veiculo: isBitrem ? 'BITREM' : 'SINGLE',
    modelo_carreta: perfilCarreta,
    volume_cubado: isBitrem ? 175 : 90,
    numero_pallets: capacidadePallets,
    pbt: pbtVal,
    data: dataStr,
    transportador: transportador,
    c1: { placa: placaCarreta1, modelo: perfilCarreta, volume: isBitrem ? 87 : 90, pallets: isBitrem ? Math.floor(capacidadePallets / 2) : capacidadePallets, pbt: isBitrem ? Math.round(pbtVal / 2) : pbtVal },
    c2: isBitrem ? { placa: placaCarreta2, modelo: perfilCarreta, volume: Math.round(pbtVal - 87), pallets: Math.ceil(capacidadePallets / 2), pbt: Math.round(pbtVal / 2) } : undefined
  };
}

export async function parsePDFLocal(file: File): Promise<ParseOrderResult | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useSystemFonts: true,
      disableFontFace: true
    });
    const pdfDoc = await loadingTask.promise;
    
    let fullText = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += ' ' + pageText;
    }

    console.log("Texto extraído localmente do PDF:", fullText);

    const placas = fullText.match(/\b[A-Z]{3}[0-9][A-Z0-9][0-9]{2}\b/gi) || [];
    const placasUnicas = [...new Set(placas.map(p => p.toUpperCase()))].filter(p => isValidPlate(p));

    const matchData = fullText.match(/\b(\d{1,2}\/\d{1,2}\/\d{4})\b/);
    
    let transportador = 'TRANSMAGNA';
    if (/TRANSMAGNA/i.test(fullText)) transportador = 'TRANSMAGNA';
    else if (/MOEDENSE/i.test(fullText)) transportador = 'MOEDENSE';
    else if (/FROTA/i.test(fullText)) transportador = 'FROTA';

    const matchPallets = fullText.match(/CAPACIDADE\s*PALLETS[^\d]*(\d+)/i) || fullText.match(/PALLETS[^\d]*(\d+)/i);
    const matchTon = fullText.match(/CAPACIDADE\s*TONELADAS[^\d]*(\d+)/i) || fullText.match(/TONELADAS[^\d]*(\d+)/i);

    const placaCavalo = placasUnicas[0] || '';
    const placaC1 = placasUnicas[1] || '';
    const placaC2 = placasUnicas[2] || '';
    const temDuasCarretas = Boolean(placaC2 && placaC2 !== placaC1);
    const pallets = matchPallets ? parseInt(matchPallets[1], 10) : 28;
    const pbt = matchTon ? parseFloat(matchTon[1]) : 30;
    const modelo = /BAU|BAÚ/i.test(fullText) ? 'BAU' : 'SIDER';

    return {
      placa_cavalo: placaCavalo,
      placa_carreta: temDuasCarretas ? `${placaC1} / ${placaC2}` : placaC1,
      tipo_veiculo: temDuasCarretas ? 'BITREM' : 'SINGLE',
      modelo_carreta: modelo,
      volume_cubado: temDuasCarretas ? 175 : 90,
      numero_pallets: pallets,
      pbt: pbt,
      data: matchData ? matchData[1] : new Date().toLocaleDateString('pt-BR'),
      transportador: transportador,
      c1: { placa: placaC1, modelo: modelo, volume: temDuasCarretas ? 87 : 90, pallets: temDuasCarretas ? Math.floor(pallets / 2) : pallets, pbt: temDuasCarretas ? Math.round(pbt / 2) : pbt },
      c2: temDuasCarretas ? { placa: placaC2, modelo: modelo, volume: Math.round(pbt - 87), pallets: Math.ceil(pallets / 2), pbt: Math.round(pbt / 2) } : undefined
    };
  } catch (err) {
    console.error("Erro ao ler PDF localmente:", err);
    return null;
  }
}


