import React from 'react';
import { Edit, Trash2, Save, X } from 'lucide-react';
import { parseBitremData, CarretaItem, BitremParseResult } from '../utils/orderParser';
import { cn } from '../lib/utils';

// High-fidelity Mercosul License Plate component
export const LicensePlate: React.FC<{ 
  plate: string; 
  type?: 'cavalo' | 'carreta'; 
  size?: 'sm' | 'md';
}> = ({ plate, type, size = 'md' }) => {
  if (!plate || plate === '-') return <span className="text-[#5c3c24] font-mono font-bold">-</span>;
  
  const cleanPlate = plate.trim().toUpperCase();
  const isCarreta = type === 'carreta';
  const isCavalo = type === 'cavalo';
  const isSmall = size === 'sm';
  
  // Custom headers based on plate type
  const headerText = isCavalo ? 'CAVALO' : isCarreta ? 'CARRETA' : 'BRASIL';
  
  // Outer container color & border classes
  const plateContainerClasses = cn(
    "inline-flex flex-col items-center justify-center overflow-hidden select-none font-mono tracking-wider shrink-0 transform transition-transform hover:scale-105 rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.35)]",
    isSmall ? "w-[95px] h-[32px] rounded-md" : "w-[120px] h-[40px] rounded-lg",
    isCarreta 
      ? "bg-[#fffde7] border-2 border-[#e6b800]" 
      : "bg-[#f7f4ed] border-2 border-[#5c3c24]/80"
  );

  // Character container gradient classes
  const charBgClasses = cn(
    "w-full flex-1 flex items-center justify-center px-2",
    isCarreta 
      ? "bg-gradient-to-b from-[#fff176] to-[#fbc02d]" 
      : "bg-gradient-to-b from-[#ffffff] to-[#e8e4db]"
  );

  return (
    <div className={plateContainerClasses}>
      {/* Blue Mercosul Header */}
      <div className={cn("w-full bg-[#0051A2] flex items-center justify-between px-1.5 leading-none relative", isSmall ? "h-[8px]" : "h-[10px]")}>
        <span className={cn("text-white font-sans font-bold scale-95", isSmall ? "text-[4.5px]" : "text-[5px]")}>BR</span>
        <span className={cn("text-white font-sans font-black tracking-widest uppercase absolute left-1/2 -translate-x-1/2", isSmall ? "text-[5.5px]" : "text-[6.5px]")}>
          {headerText}
        </span>
        {/* Tiny Brazil Flag */}
        <div className={cn("bg-[#009b3a] border border-white/20 flex items-center justify-center relative rounded-[1px] overflow-hidden", isSmall ? "w-[6.5px] h-[4.5px]" : "w-[8px] h-[5.5px]")}>
          <div className={cn("bg-yellow-400 rotate-45 transform flex items-center justify-center", isSmall ? "w-[3.5px] h-[2px]" : "w-[4.5px] h-[3px]")}>
            <div className={cn("bg-blue-800 rounded-full", isSmall ? "w-[1px] h-[1px]" : "w-[1.5px] h-[1.5px]")}></div>
          </div>
        </div>
      </div>
      {/* License plate characters */}
      <div className={charBgClasses}>
        <span 
          className={cn("text-[#1a1c1d] font-black tracking-wide leading-none select-all animate-fade-in", isSmall ? "text-[12px]" : "text-[15px]")} 
          style={{ textShadow: isCarreta ? '0.5px 0.5px 0px rgba(255, 255, 255, 0.4)' : '0.5px 0.5px 0px rgba(255, 255, 255, 0.8)' }}
        >
          {cleanPlate}
        </span>
      </div>
    </div>
  );
};

export interface CubagemRowItem {
  id: string;
  cavalo: string;
  carreta: string;
  m3: string;
  mes?: string;
  dia?: string;
  data?: string;
  transportador?: string;
  pallets?: string;
  pbt?: string;
  modeloCarreta?: string;
  inseridoEm: string;
}

export interface CubagemGroupedItem {
  id: string;
  cavalo: string;
  items: CubagemRowItem[];
  inseridoEm: string;
}

interface CubagemTableRowProps {
  item: CubagemGroupedItem;
  isEditing: boolean;
  isReadOnly: boolean;
  isAdmin: boolean;
  editingCavalo: string;
  editingGroupItems: CubagemRowItem[];
  setEditingCavalo: (val: string) => void;
  setEditingGroupItems: React.Dispatch<React.SetStateAction<CubagemRowItem[]>>;
  onStartEdit: () => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onDelete: (ids: string[]) => void;
}

export const CubagemTableRow: React.FC<CubagemTableRowProps> = ({
  item,
  isEditing,
  isReadOnly,
  isAdmin,
  editingCavalo,
  editingGroupItems,
  setEditingCavalo,
  setEditingGroupItems,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete
}) => {
  // Extract and decompose all carretas for this group (handling Bitrem split rigorously)
  const parsedData = React.useMemo(() => {
    const allCarretas: CarretaItem[] = [];
    let totalVol = 0;
    let totalPal = 0;
    let totalPbt = 0;
    let dataStr = '';
    let transpStr = '';

    item.items.forEach((sub) => {
      if (sub.data && !dataStr) dataStr = sub.data;
      if (sub.transportador && !transpStr) transpStr = sub.transportador;

      const parsed: BitremParseResult = parseBitremData({
        cavalo: item.cavalo,
        carreta: sub.carreta,
        m3: sub.m3,
        pallets: sub.pallets,
        pbt: sub.pbt,
        modeloCarreta: sub.modeloCarreta,
        data: sub.data,
        transportador: sub.transportador
      });

      parsed.carretas.forEach((c) => {
        allCarretas.push({
          ...c,
          id: sub.id
        });
      });

      totalVol += parsed.totalVolume;
      totalPal += parsed.totalPallets;
      totalPbt += parsed.totalPbt;
    });

    const isBitrem = allCarretas.length > 1;

    // Label tags appropriately: C1, C2, C3...
    const labeledCarretas = allCarretas.map((c, idx) => ({
      ...c,
      tag: isBitrem ? `C${idx + 1}` : 'Única'
    }));

    return {
      isBitrem,
      carretas: labeledCarretas,
      totalVolume: Math.round(totalVol),
      totalPallets: Math.round(totalPal),
      totalPbt: Number(totalPbt.toFixed(1)),
      data: dataStr || item.items[0]?.data || '---',
      transportador: transpStr || item.items[0]?.transportador || '---'
    };
  }, [item]);

  if (isEditing) {
    return (
      <tr className="bg-[#f0dfcc]/50 border-y-2 border-[#ca1a20]/30 transition-colors">
        {/* Data */}
        <td className="px-3 py-3 align-middle">
          <div className="space-y-1">
            {editingGroupItems.map((sub, idx) => (
              <input
                key={sub.id || idx}
                type="text"
                value={sub.data || ''}
                onChange={(e) => {
                  const updated = [...editingGroupItems];
                  updated[idx].data = e.target.value;
                  setEditingGroupItems(updated);
                }}
                placeholder="DD/MM/AAAA"
                className="w-24 bg-white border border-[#5c3c24]/40 text-[#1c1109] rounded-lg px-2 py-1 text-xs font-bold text-center outline-none focus:ring-1 focus:ring-[#ca1a20]"
              />
            ))}
          </div>
        </td>

        {/* Transportador */}
        <td className="px-3 py-3 align-middle">
          <div className="space-y-1">
            {editingGroupItems.map((sub, idx) => (
              <input
                key={sub.id || idx}
                type="text"
                value={sub.transportador || ''}
                onChange={(e) => {
                  const updated = [...editingGroupItems];
                  updated[idx].transportador = e.target.value.toUpperCase();
                  setEditingGroupItems(updated);
                }}
                placeholder="TRANSPORTADOR"
                className="w-full min-w-[120px] bg-white border border-[#5c3c24]/40 text-[#1c1109] rounded-lg px-2 py-1 text-xs font-extrabold uppercase outline-none focus:ring-1 focus:ring-[#ca1a20]"
              />
            ))}
          </div>
        </td>

        {/* Cavalo */}
        <td className="px-3 py-3 align-middle text-center">
          <input
            type="text"
            value={editingCavalo}
            onChange={(e) => setEditingCavalo(e.target.value.toUpperCase())}
            placeholder="ABC1234"
            className="w-28 bg-white border-2 border-[#5c3c24]/60 text-[#1c1109] rounded-lg px-2 py-1 text-xs font-black text-center uppercase outline-none focus:ring-2 focus:ring-[#ca1a20]/30"
          />
        </td>

        {/* Carreta (C1 and C2 editable separate inputs) */}
        <td className="px-3 py-3 align-middle text-center">
          <div className="flex flex-col gap-1.5 items-center justify-center">
            {editingGroupItems.map((sub, idx) => (
              <div key={sub.id || idx} className="flex items-center gap-1">
                {editingGroupItems.length > 1 && (
                  <span className="text-[8px] font-black uppercase text-[#8B0000] bg-[#f8d7da] border border-[#f5c6cb] px-1 py-0.5 rounded font-sans">
                    C{idx + 1}
                  </span>
                )}
                <input
                  type="text"
                  value={sub.carreta}
                  onChange={(e) => {
                    const updated = [...editingGroupItems];
                    updated[idx].carreta = e.target.value.toUpperCase();
                    setEditingGroupItems(updated);
                  }}
                  placeholder={`PLACA C${idx + 1}`}
                  className="w-24 bg-white border-2 border-[#e6b800] text-[#1c1109] rounded-lg px-2 py-1 text-xs font-black text-center uppercase outline-none focus:ring-2 focus:ring-[#ca1a20]/30"
                />
              </div>
            ))}
          </div>
        </td>

        {/* Modelo Carreta */}
        <td className="px-3 py-3 align-middle text-center">
          <div className="space-y-1">
            {editingGroupItems.map((sub, idx) => (
              <input
                key={sub.id || idx}
                type="text"
                value={sub.modeloCarreta || ''}
                onChange={(e) => {
                  const updated = [...editingGroupItems];
                  updated[idx].modeloCarreta = e.target.value.toUpperCase();
                  setEditingGroupItems(updated);
                }}
                placeholder="SIDER"
                className="w-24 bg-white border border-[#5c3c24]/40 text-[#1c1109] rounded-lg px-2 py-1 text-xs font-bold text-center uppercase outline-none focus:ring-1 focus:ring-[#ca1a20]"
              />
            ))}
          </div>
        </td>

        {/* Nº Pallets */}
        <td className="px-3 py-3 align-middle text-center">
          <div className="space-y-1">
            {editingGroupItems.map((sub, idx) => (
              <input
                key={sub.id || idx}
                type="text"
                value={sub.pallets || ''}
                onChange={(e) => {
                  const updated = [...editingGroupItems];
                  updated[idx].pallets = e.target.value;
                  setEditingGroupItems(updated);
                }}
                placeholder="24"
                className="w-16 bg-white border border-[#5c3c24]/40 text-[#1c1109] rounded-lg px-2 py-1 text-xs font-bold text-center outline-none focus:ring-1 focus:ring-[#ca1a20]"
              />
            ))}
          </div>
        </td>

        {/* PBT */}
        <td className="px-3 py-3 align-middle text-center">
          <div className="space-y-1">
            {editingGroupItems.map((sub, idx) => (
              <input
                key={sub.id || idx}
                type="text"
                value={sub.pbt || ''}
                onChange={(e) => {
                  const updated = [...editingGroupItems];
                  updated[idx].pbt = e.target.value;
                  setEditingGroupItems(updated);
                }}
                placeholder="22"
                className="w-16 bg-white border border-[#5c3c24]/40 text-[#1c1109] rounded-lg px-2 py-1 text-xs font-bold text-center outline-none focus:ring-1 focus:ring-[#ca1a20]"
              />
            ))}
          </div>
        </td>

        {/* Volume Cubado (M³) */}
        <td className="px-3 py-3 align-middle text-center">
          <div className="space-y-1">
            {editingGroupItems.map((sub, idx) => (
              <input
                key={sub.id || idx}
                type="text"
                value={sub.m3}
                onChange={(e) => {
                  const updated = [...editingGroupItems];
                  updated[idx].m3 = e.target.value;
                  setEditingGroupItems(updated);
                }}
                placeholder="88"
                className="w-20 bg-white border-2 border-emerald-500 text-emerald-900 rounded-lg px-2 py-1 text-xs font-black text-center outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            ))}
          </div>
        </td>

        {/* Actions (Save / Cancel) */}
        <td className="px-3 py-3 align-middle text-center">
          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => onSaveEdit(item.id)}
              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shadow-sm active:scale-95"
              title="Salvar Alterações"
            >
              <Save size={13} className="stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="p-1.5 bg-stone-500 hover:bg-stone-600 text-white rounded-lg transition-colors cursor-pointer shadow-sm active:scale-95"
              title="Cancelar Edição"
            >
              <X size={13} className="stroke-[2.5]" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-[#fcfaf7] transition-colors border-b border-[#5c3c24]/10 group">
      {/* Data */}
      <td className="px-3 py-3.5 align-middle">
        <span className="text-[#311f14] font-mono font-bold text-[11px] whitespace-nowrap">
          {parsedData.data}
        </span>
      </td>

      {/* Transportador */}
      <td className="px-3 py-3.5 align-middle">
        <span className="text-[#ca1a20] font-extrabold uppercase text-[11px] tracking-tight block max-w-[150px] truncate" title={parsedData.transportador}>
          {parsedData.transportador}
        </span>
      </td>

      {/* Cavalo Placa */}
      <td className="px-3 py-3.5 align-middle text-center">
        <div className="flex justify-center items-center">
          <LicensePlate plate={item.cavalo} type="cavalo" size="sm" />
        </div>
      </td>

      {/* Carretas (MANDATORY: Stacked vertical yellow Mercosul plates with C1 / C2 badges) */}
      <td className="px-3 py-3.5 align-middle">
        <div className="flex flex-col gap-1.5 items-center justify-center">
          {parsedData.carretas.map((c, idx) => (
            <div key={idx} className="flex items-center gap-1.5 justify-center">
              {parsedData.isBitrem && (
                <span className="text-[8px] font-black uppercase tracking-wider text-[#8B0000] bg-[#f8d7da] border border-[#f5c6cb] px-1 py-0.5 rounded shadow-xs shrink-0 font-sans">
                  {c.tag || `C${idx + 1}`}
                </span>
              )}
              <LicensePlate plate={c.placa} type="carreta" size="sm" />
            </div>
          ))}
        </div>
      </td>

      {/* Modelo Carreta (Stacked for C1 & C2) */}
      <td className="px-3 py-3.5 align-middle text-center">
        <div className="flex flex-col gap-1.5 items-center justify-center">
          {parsedData.carretas.map((c, idx) => (
            <div key={idx} className="flex items-center gap-1 min-h-[32px]">
              {parsedData.isBitrem && (
                <span className="text-[7.5px] font-black uppercase text-[#5c3c24]/70 bg-[#5c3c24]/10 px-1 py-0.2 rounded shrink-0">
                  {c.tag || `C${idx + 1}`}
                </span>
              )}
              <span className="font-extrabold text-[11px] text-[#2b180d] uppercase tracking-wide">
                {c.modelo || '---'}
              </span>
            </div>
          ))}
        </div>
      </td>

      {/* Nº Pallets (Stacked for C1 & C2) */}
      <td className="px-3 py-3.5 align-middle text-center">
        <div className="flex flex-col gap-1.5 items-center justify-center">
          {parsedData.carretas.map((c, idx) => (
            <div key={idx} className="flex items-center gap-1 min-h-[32px]">
              {parsedData.isBitrem && (
                <span className="text-[7.5px] font-black uppercase text-[#5c3c24]/70 bg-[#5c3c24]/10 px-1 py-0.2 rounded shrink-0">
                  {c.tag || `C${idx + 1}`}
                </span>
              )}
              <span className="bg-amber-100/80 border border-amber-300/80 rounded px-1.5 py-0.5 text-[#5c3c24] font-mono font-black text-[11px] shadow-xs">
                {c.pallets || '---'}
              </span>
            </div>
          ))}
        </div>
      </td>

      {/* PBT (Stacked for C1 & C2) */}
      <td className="px-3 py-3.5 align-middle text-center">
        <div className="flex flex-col gap-1.5 items-center justify-center">
          {parsedData.carretas.map((c, idx) => (
            <div key={idx} className="flex items-center gap-1 min-h-[32px]">
              {parsedData.isBitrem && (
                <span className="text-[7.5px] font-black uppercase text-[#5c3c24]/70 bg-[#5c3c24]/10 px-1 py-0.2 rounded shrink-0">
                  {c.tag || `C${idx + 1}`}
                </span>
              )}
              <span className="bg-stone-100 border border-stone-300 rounded px-1.5 py-0.5 text-stone-800 font-mono font-black text-[11px] shadow-xs">
                {c.pbt ? `${c.pbt} T` : '---'}
              </span>
            </div>
          ))}
        </div>
      </td>

      {/* Cubagem M³ (MANDATORY: Green oval bubbles for C1 & C2, plus TOTAL below) */}
      <td className="px-3 py-3.5 align-middle text-center">
        <div className="flex flex-col gap-1.5 items-center justify-center">
          {parsedData.carretas.map((c, idx) => (
            <div key={idx} className="flex items-center gap-1 min-h-[32px]">
              {parsedData.isBitrem && (
                <span className="text-[8px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 border border-emerald-300 px-1 py-0.5 rounded shrink-0 font-sans">
                  {c.tag || `C${idx + 1}`}
                </span>
              )}
              <div className="inline-flex items-center px-3 py-0.5 bg-emerald-100/90 border-2 border-emerald-400 rounded-full text-emerald-950 font-black font-mono text-[11.5px] shadow-sm hover:scale-105 transition-transform">
                {c.volume} M³
              </div>
            </div>
          ))}

          {parsedData.isBitrem && (
            <div className="pt-1 mt-1 border-t-2 border-[#5c3c24]/15 flex items-center justify-center gap-1.5 w-full">
              <span className="text-[8.5px] font-black text-[#8B0000] uppercase tracking-wider font-sans">
                TOTAL:
              </span>
              <span className="text-[11.5px] font-black text-[#8B0000] font-mono bg-amber-100 border-2 border-amber-300 px-2 py-0.5 rounded-lg shadow-sm">
                {parsedData.totalVolume} M³
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-3 py-3.5 align-middle text-center">
        {!isReadOnly && (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={onStartEdit}
              className="p-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
              title="Editar Registro"
            >
              <Edit size={12} className="stroke-[2.5]" />
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => onDelete(item.items.map((sub) => sub.id))}
                className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
                title="Excluir Registro"
              >
                <Trash2 size={12} className="stroke-[2.5]" />
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};
