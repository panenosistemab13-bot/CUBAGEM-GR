import React, { useState, useEffect, useRef } from 'react';
import { 
  Grid3X3, 
  Download, 
  Trash2, 
  Plus, 
  Search, 
  FileText, 
  Save,
  ChevronRight,
  Share2,
  Printer,
  History,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

const GUEST_USER_ID = 'guest_user';

interface IscaRow {
  id: string;
  isca: string;
  data: string;
  hora: string;
  doca: string;
  cavalo: string;
  carretas: string;
  m3: string;
  destino: string;
  nf: string;
  responsavel: string;
  produto: string;
  uma: string;
  valorNf: string;
  preAlertaGr: string;
  planCarreg: string;
  baixaGr: string;
}

interface GroupedIscas {
  cavalo: string;
  rows: IscaRow[];
}

export default function Iscas() {
  const [rows, setRows] = useState<IscaRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load from RTDB
  useEffect(() => {
    const iscasRef = ref(rtdb, `users/${GUEST_USER_ID}/iscas`);
    const unsubscribe = onValue(iscasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        }));
        setRows(list);
      } else {
        // Seed if empty with data from prancheta.jpeg
        const seedData = [
          { isca: "R100000555", data: "28/03/2026", hora: "15:42", doca: "10", cavalo: "SBK-5A52", carretas: "POF-2095 / POF-7735", m3: "110", destino: "PINHAIS", nf: "2938195", responsavel: "WEBER", produto: "12031007", uma: "012.958.300.081", valorNf: "R$ 426.467,59", preAlertaGr: "OK", planCarreg: "OK", baixaGr: "OK" },
          { isca: "R100000577", data: "28/03/2026", hora: "15:45", doca: "07", cavalo: "SAR-8D82", carretas: "SBF-9C98", m3: "90", destino: "RIO DE JANEIRO (RJ)", nf: "2898921", responsavel: "BGEF", produto: "12041013", uma: "12376220044", valorNf: "R$ 391.212,57", preAlertaGr: "OK", planCarreg: "OK", baixaGr: "OK" },
          { isca: "R100000617", data: "28/03/2026", hora: "15:50", doca: "06", cavalo: "SBK 5B52", carretas: "PNC 8903", m3: "90", destino: "VIANA", nf: "5138918", responsavel: "BGEF", produto: "12031023", uma: "12373730035", valorNf: "R$ 365.157,33", preAlertaGr: "OK", planCarreg: "OK", baixaGr: "OK" },
          { isca: "R100000673", data: "28/03/2026", hora: "16:00", doca: "09", cavalo: "SAR-7D82", carretas: "TIC-0F85", m3: "90", destino: "RIO DE JANEIRO (RJ)", nf: "2898920", responsavel: "BGEF", produto: "12041013", uma: "12376220055", valorNf: "R$ 356.685,13", preAlertaGr: "OK", planCarreg: "OK", baixaGr: "OK" },
          { isca: "R100000679", data: "28/03/2026", hora: "16:15", doca: "05", cavalo: "SBK-5C82", carretas: "POG-1245", m3: "112", destino: "BRASILIA", nf: "2898916", responsavel: "BGEF", produto: "12031025", uma: "12373730071", valorNf: "R$ 681.300,38", preAlertaGr: "OK", planCarreg: "OK", baixaGr: "OK" },
          { isca: "R100000698", data: "28/03/2026", hora: "16:30", doca: "16", cavalo: "SBK 5C22", carretas: "POG 0885", m3: "90", destino: "BRASILIA", nf: "2898917", responsavel: "BGEF", produto: "12051000", uma: "6000000816582", valorNf: "R$ 830.218,86", preAlertaGr: "OK", planCarreg: "OK", baixaGr: "OK" },
        ];
        seedData.forEach((item, idx) => {
          const id = (Date.now() + idx).toString();
          set(ref(rtdb, `users/${GUEST_USER_ID}/iscas/${id}`), { ...item, id });
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const addRow = async () => {
    const id = Date.now().toString();
    const newRow: IscaRow = {
      id,
      isca: '',
      data: format(new Date(), 'dd/MM/yyyy'),
      hora: format(new Date(), 'HH:mm'),
      doca: '',
      cavalo: '',
      carretas: '',
      m3: '',
      destino: '',
      nf: '',
      responsavel: '',
      produto: '',
      uma: '',
      valorNf: '',
      preAlertaGr: 'OK',
      planCarreg: 'OK',
      baixaGr: 'OK'
    };
    try {
      await set(ref(rtdb, `users/${GUEST_USER_ID}/iscas/${id}`), newRow);
    } catch (e) {
      console.error(e);
    }
  };

  const updateRow = async (id: string, field: keyof IscaRow, value: string) => {
    try {
      await update(ref(rtdb, `users/${GUEST_USER_ID}/iscas/${id}`), { [field]: value.toUpperCase() });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Deletar esta linha?")) return;
    try {
      await remove(ref(rtdb, `users/${GUEST_USER_ID}/iscas/${id}`));
    } catch (e) {
      console.error(e);
    }
  };

  const clearTable = async () => {
    if (!confirm("Tem certeza que deseja limpar TODA a tabela? Esta ação não pode ser desfeita.")) return;
    try {
      await remove(ref(rtdb, `users/${GUEST_USER_ID}/iscas`));
    } catch (e) {
      console.error(e);
    }
  };

  const downloadImage = async (cavalo: string) => {
    if (!previewRef.current) return;
    setIsGenerating(true);
    try {
      // Find the specific element for this cavalo group summary
      const element = document.getElementById(`pre-alerta-${cavalo}`);
      if (element) {
        const dataUrl = await toPng(element, { quality: 0.95, backgroundColor: '#ffffff' });
        saveAs(dataUrl, `Pre_Alerta_${cavalo}_${format(new Date(), 'dd_MM_yyyy')}.png`);
      }
    } catch (error) {
      console.error('Oops, something went wrong!', error);
    }
    setIsGenerating(false);
  };

  const groupedByCavalo: GroupedIscas[] = rows.reduce((acc: GroupedIscas[], row) => {
    if (!row.cavalo) return acc;
    const existing = acc.find(g => g.cavalo === row.cavalo);
    if (existing) {
      existing.rows.push(row);
    } else {
      acc.push({ cavalo: row.cavalo, rows: [row] });
    }
    return acc;
  }, []);

  const filteredGroups = groupedByCavalo.filter(g => 
    g.cavalo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.rows.some(r => r.nf.includes(searchTerm) || r.responsavel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-10 pb-40">
      {/* Header Info */}
      <div className="bg-[#0b0d19] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[100px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none group-hover:bg-primary/20 transition-all duration-1000" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-[1.25rem] flex items-center justify-center text-primary shadow-inner">
                <Grid3X3 size={32} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Controle de Iscas</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em]">Emissão de Pré-Alerta Operacional</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar placa ou NF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-primary/50 transition-all w-64 md:w-80"
              />
            </div>
            <button 
              onClick={clearTable}
              className="bg-rose-500/10 text-rose-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all flex items-center gap-2"
            >
              <Trash2 size={20} /> Limpar
            </button>
            <button 
              onClick={addRow}
              className="bg-primary text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all flex items-center gap-2"
            >
              <Plus size={20} /> Nova Linha
            </button>
          </div>
        </div>
      </div>

      {/* Manual Entry Table (The "PRR" Sheet) */}
      <div className="bg-[#0b0d19] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse min-w-[1500px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 shadow-sm">
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center w-12 border-r border-white/5">#</th>
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest min-w-[140px]">Nº ISCA</th>
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest w-28">DATA</th>
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest w-24">HORA</th>
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest w-20">DOCA</th>
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest w-32">CAVALO</th>
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest w-32">CARRETA</th>
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest w-16">M³</th>
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest min-w-[150px]">DESTINO</th>
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest w-32">Nº NF</th>
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest min-w-[150px]">RESPONSÁVEL</th>
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest min-w-[150px]">PRODUTO</th>
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest w-32">U.M.A.</th>
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest w-40">VALOR NF</th>
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest w-20 text-center">PRÉ-ALERTA</th>
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest w-20 text-center">PLAN. CARREG</th>
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest w-20 text-center">BAIXA GR</th>
                <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest text-right w-16">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-white/[0.01] transition-all group">
                  <td className="p-4 text-[10px] font-mono text-zinc-600 text-center border-r border-white/5">{idx + 1}</td>
                  <td className="p-2 mr-2">
                    <input 
                      className="w-full bg-white/5 border-none rounded-lg p-2 text-xs font-bold text-white focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-zinc-800" 
                      value={row.isca} 
                      onChange={(e) => updateRow(row.id, 'isca', e.target.value)}
                      placeholder="R1000..."
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      className="w-full bg-white/5 border-none rounded-lg p-2 text-xs font-mono text-zinc-400 focus:ring-1 focus:ring-primary/40 text-center" 
                      value={row.data} 
                      onChange={(e) => updateRow(row.id, 'data', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      className="w-full bg-white/5 border-none rounded-lg p-2 text-xs font-mono text-zinc-400 focus:ring-1 focus:ring-primary/40 text-center" 
                      value={row.hora} 
                      onChange={(e) => updateRow(row.id, 'hora', e.target.value)}
                    />
                  </td>
                   <td className="p-2">
                    <input 
                      className="w-full bg-white/5 border-none rounded-lg p-2 text-xs text-center font-bold text-white uppercase" 
                      value={row.doca} 
                      onChange={(e) => updateRow(row.id, 'doca', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      className="w-full bg-primary/10 border-none rounded-lg p-2 text-xs font-black text-primary focus:ring-2 focus:ring-primary uppercase text-center" 
                      value={row.cavalo} 
                      onChange={(e) => updateRow(row.id, 'cavalo', e.target.value)}
                      placeholder="AAA-0000"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      className="w-full bg-white/5 border-none rounded-lg p-2 text-xs font-bold text-zinc-300 uppercase text-center" 
                      value={row.carretas} 
                      onChange={(e) => updateRow(row.id, 'carretas', e.target.value)}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input 
                      className="w-full bg-white/5 border-none rounded-lg p-2 text-xs text-center text-zinc-500" 
                      value={row.m3} 
                      onChange={(e) => updateRow(row.id, 'm3', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      className="w-full bg-white/5 border-none rounded-lg p-2 text-xs text-zinc-300" 
                      value={row.destino} 
                      onChange={(e) => updateRow(row.id, 'destino', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      className="w-full bg-white/5 border-none rounded-lg p-2 text-xs font-mono text-white" 
                      value={row.nf} 
                      onChange={(e) => updateRow(row.id, 'nf', e.target.value)}
                    />
                  </td>
                   <td className="p-2">
                    <input 
                      className="w-full bg-white/5 border-none rounded-lg p-2 text-xs font-medium text-emerald-400" 
                      value={row.responsavel} 
                      onChange={(e) => updateRow(row.id, 'responsavel', e.target.value)}
                    />
                  </td>
                   <td className="p-2">
                    <input 
                      className="w-full bg-white/5 border-none rounded-lg p-2 text-xs text-zinc-400" 
                      value={row.produto} 
                      onChange={(e) => updateRow(row.id, 'produto', e.target.value)}
                    />
                  </td>
                   <td className="p-2">
                    <input 
                      className="w-full bg-white/5 border-none rounded-lg p-2 text-xs font-mono text-zinc-500" 
                      value={row.uma} 
                      onChange={(e) => updateRow(row.id, 'uma', e.target.value)}
                    />
                  </td>
                   <td className="p-2">
                    <input 
                      className="w-full bg-white/5 border-none rounded-lg p-2 text-xs text-right font-mono font-bold text-amber-500" 
                      value={row.valorNf} 
                      onChange={(e) => updateRow(row.id, 'valorNf', e.target.value)}
                      placeholder="R$ 0.000,00"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      className="w-full bg-white/5 border-none rounded-lg p-2 text-[10px] text-center font-black text-emerald-500 uppercase" 
                      value={row.preAlertaGr} 
                      onChange={(e) => updateRow(row.id, 'preAlertaGr', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      className="w-full bg-white/5 border-none rounded-lg p-2 text-[10px] text-center font-black text-emerald-500 uppercase" 
                      value={row.planCarreg} 
                      onChange={(e) => updateRow(row.id, 'planCarreg', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      className="w-full bg-white/5 border-none rounded-lg p-2 text-[10px] text-center font-black text-emerald-500 uppercase" 
                      value={row.baixaGr} 
                      onChange={(e) => updateRow(row.id, 'baixaGr', e.target.value)}
                    />
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => deleteRow(row.id)}
                      className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                      title="Excluir Linha"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {rows.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-zinc-800">
                <FileText size={40} />
              </div>
              <div>
                <p className="text-white font-bold uppercase tracking-widest text-sm">Pronta para preenchimento</p>
                <p className="text-zinc-600 font-mono text-[10px] mt-1">Carregue dados ou adicione linhas manualmente para começar.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grouped Pre-Alerta Generation */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <Share2 size={24} className="text-primary" />
             <div>
               <h2 className="text-2xl font-black text-white uppercase tracking-tight">Pré-Alertas Gerados</h2>
               <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Visualização agrupada por Cavalo</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence>
            {filteredGroups.map((group) => (
              <motion.div 
                key={group.cavalo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0b0d19] border border-white/5 rounded-[2.5rem] p-4 shadow-xl flex flex-col items-center gap-4 group"
              >
                {/* Visual Preview (novo pré alerta.jpg style) */}
                <div 
                  id={`pre-alerta-${group.cavalo}`}
                  className="w-full bg-white text-black p-8 font-sans overflow-hidden"
                  style={{ minWidth: '800px', width: '100%' }}
                >
                  <div className="flex flex-col gap-4 text-xs font-bold">
                    <div className="flex justify-between items-center bg-zinc-100 p-2 border-b border-zinc-300">
                      <span>Boa noite!</span>
                      <span className="text-[10px] text-zinc-500">{format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</span>
                    </div>

                    <div className="bg-red-700 text-white p-2 text-sm uppercase tracking-wide">
                      Favor se atentar ao resgate!
                    </div>

                    <div className="space-y-1">
                      <p>Atentar às informações abaixo:</p>
                      <div className="border border-zinc-300 p-2 flex flex-col gap-1 items-start">
                         <span className="bg-zinc-100 px-2 py-0.5 rounded">• SANTA LUZIA/MG x {group.rows[0].destino || 'DESTINO INDEFINIDO'}</span>
                         <span>* Favor, acusar o recebimento do pré-alerta;</span>
                      </div>
                    </div>

                    {/* Table Summary */}
                    <div className="mt-4 border border-zinc-400 overflow-hidden">
                      <div className="bg-blue-100 text-center py-2 border-b border-zinc-400 uppercase text-[10px] font-black">
                        PRÉ - ALERTA DE ISCA EMBARCADA
                      </div>
                      
                      <table className="w-full text-[9px] border-collapse">
                        <thead>
                          <tr className="bg-blue-50 border-b border-zinc-400">
                            <th className="border-r border-zinc-400 p-2 uppercase w-1/4">NÚMERO DA NF:</th>
                            <td className="p-2 whitespace-nowrap">{group.rows.map(r => r.nf).filter(nf => nf).join(' - ') || 'SEM NF'}</td>
                            <th className="border-l border-r border-zinc-400 p-2 uppercase w-1/6">TRANSPORTADORA:</th>
                            <td className="p-2 font-black">FROTA 3C</td>
                          </tr>
                        </thead>
                      </table>

                      <table className="w-full text-[9px] border-collapse bg-white">
                        <thead>
                          <tr className="bg-blue-50 border-b border-zinc-400 text-center font-black">
                            <th className="border-r border-zinc-400 p-1">MOTORISTA</th>
                            <th className="border-r border-zinc-400 p-1">CAVALO</th>
                            <th className="border-r border-zinc-400 p-1">CARRETAS</th>
                            <th className="border-r border-zinc-400 p-1">Nº ISCAS</th>
                            <th className="border-r border-zinc-400 p-1">PRODUTO EMBARCADO</th>
                            <th className="border-r border-zinc-400 p-1">CÓDIGO U.M.A.</th>
                            <th className="border-r border-zinc-400 p-1">DESTINO</th>
                            <th className="p-1">DATA ENVIADA</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="text-center italic font-semibold">
                            <td className="border-r border-zinc-400 p-3 leading-tight uppercase w-32">{group.rows[0].responsavel || 'NÃO INFORMADO'}</td>
                            <td className="border-r border-zinc-400 p-3 font-black text-sm uppercase">{group.cavalo}</td>
                            <td className="border-r border-zinc-400 p-0 text-[8px]">
                              {group.rows.map((r, i) => (
                                <div key={i} className={cn("p-2 uppercase", i < group.rows.length - 1 ? "border-b border-zinc-300" : "")}>
                                  {r.carretas || '---'}
                                </div>
                              ))}
                            </td>
                            <td className="border-r border-zinc-400 p-0 font-bold">
                               {group.rows.map((r, i) => (
                                <div key={i} className={cn("p-2", i < group.rows.length - 1 ? "border-b border-zinc-300" : "")}>
                                  {r.isca || 'SEM ISCA'}
                                </div>
                              ))}
                            </td>
                            <td className="border-r border-zinc-400 p-0 text-[8px]">
                               {group.rows.map((r, i) => (
                                <div key={i} className={cn("p-2", i < group.rows.length - 1 ? "border-b border-zinc-300" : "")}>
                                  {r.produto || 'SEM PRODUTO'}
                                </div>
                              ))}
                            </td>
                            <td className="border-r border-zinc-400 p-3 font-mono">{group.rows[0].uma || '----'}</td>
                            <td className="border-r border-zinc-400 p-3 uppercase font-black">{group.rows[0].destino || '---'}</td>
                            <td className="p-3 text-[10px] font-black">{format(new Date(), 'dd-MMM.', { locale: ptBR })}</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="bg-blue-100 text-center py-1 border-t border-b border-zinc-400 text-[8px] font-black tracking-widest">
                        Parametrização das iscas
                      </div>
                      <div className="h-6 bg-white" />
                    </div>

                    <div className="mt-8 text-[10px] font-black uppercase text-zinc-600">
                      ESQUEMA DE EMBARQUE DAS ISCAS:
                    </div>
                  </div>
                </div>

                {/* Control Actions */}
                <div className="w-full pt-4 border-t border-white/5 flex items-center justify-between px-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white">{group.cavalo}</span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{group.rows.length} lançamentos vinculados</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => downloadImage(group.cavalo)}
                      disabled={isGenerating}
                      className="px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all disabled:opacity-50"
                    >
                      {isGenerating ? 'Processando...' : <><Download size={16} /> Baixar Imagem</>}
                    </button>
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 transition-all">
                      <Share2 size={16} />
                    </button>
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 transition-all">
                      <Printer size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredGroups.length === 0 && rows.length > 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-400">
                <Info size={32} />
              </div>
              <div className="max-w-md">
                <p className="text-white font-bold uppercase tracking-widest text-sm">Nenhum agrupamento válido</p>
                <p className="text-zinc-600 font-mono text-[10px] mt-1">Preencha o campo "CAVALO" na planilha acima para que o sistema gere automaticamente o Pré-Alerta agrupado.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
