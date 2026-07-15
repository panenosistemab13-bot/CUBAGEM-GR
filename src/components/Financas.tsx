import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Edit2, 
  Trash2, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar as CalendarIcon,
  ChevronRight,
  MoreVertical,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  PieChart
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { GUEST_USER_ID } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Financa {
  id: string;
  nome: string;
  valor: number;
  vencimento: string;
  dataPagamento: string | null;
  status: 'pago' | 'nao-pago';
  userId: string;
  groupId: string;
}

interface FinancaGroup {
  id: string;
  nome: string;
  userId: string;
  itens?: Financa[];
}

interface ValorInputProps {
  value: number;
  onChange: (v: number) => void;
  className?: string;
}

function ValorInput({ value, onChange, className }: ValorInputProps) {
  const formatValueBRL = (val: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  const [displayValue, setDisplayValue] = useState(() => formatValueBRL(value));

  useEffect(() => {
    setDisplayValue(formatValueBRL(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const digits = rawInput.replace(/\D/g, '');
    
    if (digits === '') {
      setDisplayValue('R$ 0,00');
      onChange(0);
      return;
    }

    const numericValue = parseInt(digits, 10) / 100;
    const formatted = formatValueBRL(numericValue);
    setDisplayValue(formatted);
    onChange(numericValue);
  };

  return (
    <input 
      type="text" 
      className={cn("bg-transparent border-none text-white focus:outline-none focus:ring-0 w-full text-right font-mono font-bold", className)}
      value={displayValue} 
      onChange={handleChange} 
    />
  );
}

export default function Financas() {
  const [groups, setGroups] = useState<FinancaGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string>('');
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [newDebtForm, setNewDebtForm] = useState({ nome: '', valor: 0 });

  // Initial groups fetch
  useEffect(() => {
    const userId = GUEST_USER_ID;
    const groupsRef = ref(rtdb, `users/${userId}/groups`);

    const unsubscribe = onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      const gs: FinancaGroup[] = data ? Object.values(data) : [];
      setGroups(gs);

      if (!activeGroupId && gs.length > 0) {
        setActiveGroupId(gs[0].id);
      }
    });

    return () => unsubscribe();
  }, [activeGroupId]);

  // Fetch items for specific group
  useEffect(() => {
    const userId = GUEST_USER_ID;
    if (!userId || !activeGroupId) return;

    const financasRef = ref(rtdb, `users/${userId}/groups/${activeGroupId}/financas`);
    const unsubscribe = onValue(financasRef, (snapshot) => {
      const data = snapshot.val();
      const itens: Financa[] = data ? Object.values(data) : [];
      setGroups(prev => prev.map(g => g.id === activeGroupId ? { ...g, itens } : g));
    });

    return () => unsubscribe();
  }, [activeGroupId]);

  const activeGroup = groups.find(g => g.id === activeGroupId);
  const activeItens = activeGroup?.itens || [];

  const confirmAddGroup = async () => {
    if (!newGroupName) return;
    const userId = GUEST_USER_ID;
    const id = Date.now().toString();
    const newGroup = { id, nome: newGroupName, userId };
    
    try {
      await set(ref(rtdb, `users/${userId}/groups/${id}`), newGroup);
      setActiveGroupId(id);
      setNewGroupName('');
      setIsAddingGroup(false);
    } catch (err) {
      console.error('Error adding group', err);
    }
  };

  const renameGroup = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const group = groups.find(g => g.id === id);
    if (!group) return;
    const newName = prompt("Novo nome da aba:", group.nome);
    if (!newName) return;
    
    try {
      await update(ref(rtdb, `users/${GUEST_USER_ID}/groups/${id}`), { nome: newName });
    } catch(err) {
      console.error('Error renaming group', err);
    }
  };

  const deleteGroup = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja apagar esta aba?")) return;

    try {
      await remove(ref(rtdb, `users/${GUEST_USER_ID}/groups/${id}`));
      if (activeGroupId === id) {
        const remaining = groups.find(g => g.id !== id);
        setActiveGroupId(remaining?.id || '');
      }
    } catch(err) {
      console.error('Error deleting group', err);
    }
  };

  const confirmAddDebt = async () => {
    if (!newDebtForm.nome || !activeGroupId) return;
    const id = Date.now().toString();
    const newDebt: Financa = {
      id,
      nome: newDebtForm.nome,
      valor: newDebtForm.valor,
      vencimento: new Date().toISOString().split('T')[0],
      dataPagamento: null,
      status: 'nao-pago',
      userId: GUEST_USER_ID,
      groupId: activeGroupId
    };

    try {
      await set(ref(rtdb, `users/${GUEST_USER_ID}/groups/${activeGroupId}/financas/${id}`), newDebt);
      setNewDebtForm({ nome: '', valor: 0 });
      setIsAddingDebt(false);
    } catch(err) {
      console.error('Error adding debt', err);
    }
  };

  const updateDebt = async (id: string, updates: Partial<Financa>) => {
    if (!activeGroupId) return;
    try {
      await update(ref(rtdb, `users/${GUEST_USER_ID}/groups/${activeGroupId}/financas/${id}`), updates);
    } catch(err) {
      console.error('Error updating debt', err);
    }
  };

  const deleteDebt = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar?")) return;
    if (!activeGroupId) return;
    try {
      await remove(ref(rtdb, `users/${GUEST_USER_ID}/groups/${activeGroupId}/financas/${id}`));
    } catch(err) {
      console.error('Error deleting debt', err);
    }
  };

  const totalPago = activeItens.filter(f => f.status === 'pago').reduce((acc, f) => acc + f.valor, 0);
  const totalPendente = activeItens.filter(f => f.status === 'nao-pago').reduce((acc, f) => acc + f.valor, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Header & Stats Dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        
        {/* Balance Card */}
        <div className="xl:col-span-4 bg-[#0b0d19] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Wallet size={24} />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Saldo em Aberto</span>
                <span className="text-2xl font-black text-white tabular-nums tracking-tighter">
                  {formatCurrency(totalPendente)}
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                  <ArrowUpRight size={16} />
                </div>
                <div>
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">Pago</span>
                  <span className="text-sm font-bold text-emerald-400">{formatCurrency(totalPago)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-right">
                <div>
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">Pendente</span>
                  <span className="text-sm font-bold text-rose-400">{formatCurrency(totalPendente)}</span>
                </div>
                <div className="w-8 h-8 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400">
                  <ArrowDownLeft size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Tabs */}
        <div className="xl:col-span-8 bg-[#0b0d19] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Fluxo de Caixa</h2>
              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Gestão de passivos e proventos</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsAddingGroup(true)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Nova Carteira
              </button>
              <button 
                onClick={() => setIsAddingDebt(true)}
                className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all flex items-center gap-2"
              >
                <CreditCard size={16} /> Adicionar Lançamento
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <AnimatePresence mode="popLayout">
              {groups.map(g => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setActiveGroupId(g.id)}
                  className={cn(
                    "relative flex items-center gap-3 px-6 py-3 rounded-2xl cursor-pointer transition-all border shrink-0 group",
                    activeGroupId === g.id 
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/10"
                  )}
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.15em]">{g.nome}</span>
                  
                  {activeGroupId === g.id && (
                    <div className="flex items-center gap-1.5 ml-2 border-l border-white/20 pl-2">
                       <button onClick={(e) => renameGroup(g.id, e)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                         <Edit2 size={12} />
                       </button>
                       <button onClick={(e) => deleteGroup(g.id, e)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                         <Trash2 size={12} />
                       </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Content List */}
      <div className="bg-[#0b0d19] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Descrição</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Valor</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Vencimento</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pagamento</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {activeItens.map(f => (
                  <motion.tr 
                    key={f.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-white/[0.02] transition-all"
                  >
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{f.nome}</span>
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-0.5">Ref: {f.id.slice(-6)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <ValorInput 
                        value={f.valor} 
                        onChange={(val) => updateDebt(f.id, { valor: val })} 
                        className="text-sm text-right"
                      />
                    </td>
                    <td className="px-8 py-5">
                      <input 
                        type="date" 
                        value={f.vencimento}
                        onChange={(e) => updateDebt(f.id, { vencimento: e.target.value })}
                        className="bg-transparent border-none text-[10px] font-mono font-bold text-zinc-400 focus:ring-0 focus:text-white transition-all uppercase"
                      />
                    </td>
                    <td className="px-8 py-5">
                       <input 
                        type="date" 
                        value={f.dataPagamento || ''}
                        onChange={(e) => updateDebt(f.id, { dataPagamento: e.target.value || null })}
                        className="bg-transparent border-none text-[10px] font-mono font-bold text-zinc-400 focus:ring-0 focus:text-white transition-all uppercase"
                      />
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => {
                            const newStatus = f.status === 'pago' ? 'nao-pago' : 'pago';
                            updateDebt(f.id, { 
                              status: newStatus,
                              dataPagamento: newStatus === 'pago' ? new Date().toISOString().split('T')[0] : null
                            });
                          }}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                            f.status === 'pago' 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          )}
                        >
                          <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", f.status === 'pago' ? "bg-emerald-400" : "bg-rose-400")} />
                          {f.status === 'pago' ? 'Liquidado' : 'Pendente'}
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => {
                            const n = prompt("Novo nome:", f.nome);
                            if (n) updateDebt(f.id, { nome: n });
                          }}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => deleteDebt(f.id)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-400 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {activeItens.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-zinc-700">
                <PieChart size={40} />
              </div>
              <div>
                <p className="text-white font-bold uppercase tracking-widest">Sem lançamentos</p>
                <p className="text-zinc-600 text-xs font-mono">Nenhum registro encontrado nesta carteira.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAddingGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
               onClick={() => setIsAddingGroup(false)}
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-md bg-[#0b0d19] border border-white/10 rounded-[3rem] p-8 shadow-2xl space-y-8"
             >
               <div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">Nova Carteira</h3>
                 <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">Categorização financeira personalizada</p>
               </div>

               <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nome da Aba</label>
                   <input 
                     type="text" 
                     value={newGroupName}
                     onChange={(e) => setNewGroupName(e.target.value)}
                     placeholder="Ex: Pessoal, Empresa..."
                     className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                   />
                 </div>
               </div>

               <div className="flex gap-4">
                 <button onClick={() => setIsAddingGroup(false)} className="flex-1 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-all">Cancelar</button>
                 <button onClick={confirmAddGroup} className="flex-2 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Criar Carteira</button>
               </div>
             </motion.div>
          </div>
        )}

        {isAddingDebt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
               onClick={() => setIsAddingDebt(false)}
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-md bg-[#0b0d19] border border-white/10 rounded-[3rem] p-8 shadow-2xl space-y-8"
             >
               <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Novo Lançamento</h3>
                  <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">Registro de dívida ou despesa</p>
               </div>

               <div className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Descrição</label>
                   <input 
                     type="text" 
                     value={newDebtForm.nome}
                     onChange={(e) => setNewDebtForm(prev => ({ ...prev, nome: e.target.value }))}
                     placeholder="Ex: Aluguel, Cartão..."
                     className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                   />
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Valor Previsto</label>
                   <div className="relative">
                      <ValorInput 
                        value={newDebtForm.valor} 
                        onChange={(val) => setNewDebtForm(prev => ({ ...prev, valor: val }))} 
                        className="bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-left text-xl tracking-tighter"
                      />
                   </div>
                 </div>
               </div>

               <div className="flex gap-4">
                 <button onClick={() => setIsAddingDebt(false)} className="flex-1 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-all">Descartar</button>
                 <button onClick={confirmAddDebt} className="flex-2 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]">Confirmar Lançamento</button>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

