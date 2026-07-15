export interface PatioItem {
  id: string;
  cavalo: string;
  carreta: string;
  destino: string;
  estaNoPatio: 'Sim' | 'Não';
  assinado: 'Sim' | 'Não';
}

// Based on the image analysis and request logic:
// Origin: Santa Luzia
// Termo: Não
export const initialPatioData: PatioItem[] = [
  { id: '1', cavalo: 'FRK4232', carreta: 'TRUCK01', destino: 'GUARULHOS', estaNoPatio: 'Não', assinado: 'Não' },
  { id: '2', cavalo: 'JAH9112', carreta: 'TRP884', destino: 'SUMARÉ', estaNoPatio: 'Não', assinado: 'Não' },
  { id: '3', cavalo: 'KRY2392', carreta: 'TRUCK02', destino: 'PINHAIS', estaNoPatio: 'Não', assinado: 'Sim' },
  { id: '4', cavalo: 'FMY6333', carreta: 'GZVB13', destino: 'CAMPO GRANDE', estaNoPatio: 'Não', assinado: 'Sim' },
];
