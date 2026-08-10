export interface CarretaSubItem {
  placa: string;
  modelo: string;
  pallets: number | string;
  pbt: number | string;
  volume: number;
}

export interface OrdemColetaItem {
  id?: string;
  tipo_veiculo: 'SINGLE' | 'BITREM' | 'simples' | 'bitrem';
  placa_cavalo: string;
  data: string;
  transportador: string;
  c1: CarretaSubItem;
  c2?: CarretaSubItem | null;
  volume_total: number;
  created_at?: number;
  created_by?: string;
  observacoes?: string;
  origem_arquivo?: string;

  // Legacy / fallback fields for backward compatibility
  placa_carreta?: string;
  volume_cubado?: number;
  modelo_carreta?: string;
  numero_pallets?: number;
  pbt?: number;
  c1_placa?: string;
  c1_modelo?: string;
  c1_volume?: number;
  c1_pallets?: number;
  c1_pbt?: number;
  c2_placa?: string;
  c2_modelo?: string;
  c2_volume?: number;
  c2_pallets?: number;
  c2_pbt?: number;
}

export interface ParseOrderResult {
  placa_cavalo: string;
  placa_carreta: string;
  volume_cubado: number;
  data: string;
  transportador: string;
  modelo_carreta: string;
  numero_pallets: number;
  pbt: number;
  tipo_veiculo?: 'SINGLE' | 'BITREM' | 'simples' | 'bitrem';
  c1: CarretaSubItem;
  c2?: CarretaSubItem | null;
  c1_placa?: string;
  c1_modelo?: string;
  c1_volume?: number;
  c1_pallets?: number;
  c1_pbt?: number;
  c2_placa?: string;
  c2_modelo?: string;
  c2_volume?: number;
  c2_pallets?: number;
  c2_pbt?: number;
  volume_total?: number;
  confianca?: string;
  detalhes_calculo?: string;
}
