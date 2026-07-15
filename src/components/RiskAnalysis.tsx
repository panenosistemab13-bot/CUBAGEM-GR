import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  Target, 
  ShieldCheck, 
  Lock, 
  Camera,
  Server,
  Network,
  Info,
  ChevronRight,
  TrendingDown,
  AlertTriangle,
  Zap,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_DATA = [
  { time: '08:00', created: 12, integrated: 10 },
  { time: '10:00', created: 19, integrated: 18 },
  { time: '12:00', created: 15, integrated: 15 },
  { time: '14:00', created: 25, integrated: 22 },
  { time: '16:00', created: 20, integrated: 20 },
];

const EVENTS_LOG = [
  { time: '15:42', msg: 'Excesso de velocidade Rota 4069', status: 'WARN' },
  { time: '15:35', msg: 'Desvio de rota detectado', status: 'CRIT' },
  { time: '15:10', msg: 'Sensor de pressão pneu aberto', status: 'OK' },
];

export default function RiskAnalysis() {
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const storedCalc = localStorage.getItem('sm_creator_calc');
    if (storedCalc) {
      const vals = JSON.parse(storedCalc);
      const sum = vals.reduce((acc: number, curr: string) => {
        const val = parseFloat(curr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
        return isNaN(val) ? acc : acc + val;
      }, 0);
      setTotalValue(sum);
    }
  }, []);

  const matrixDots = [
    { id: 1, top: '80%', left: '10%', color: 'border-green-500 bg-green-500/20' },
    { id: 2, top: '70%', left: '20%', color: 'border-green-500 bg-green-500/20' },
    { id: 3, top: '60%', left: '30%', color: 'border-yellow-500 bg-yellow-500/20' },
    { id: 4, top: '40%', left: '40%', color: 'border-yellow-500 bg-yellow-500/20' },
    { id: 5, top: '30%', left: '70%', color: 'border-red-500 bg-red-500/20' },
  ];

  const securityNodes = [
    { id: 'cam-01', name: 'Perímetro Norte', status: 'OK', integrity: 98, icon: Camera },
    { id: 'srv-alpha', name: 'Datacenter', status: 'Atenção', integrity: 76, icon: Server },
    { id: 'net-mesh', name: 'Rede Local', status: 'OK', integrity: 99, icon: Network },
    { id: 'gate-primary', name: 'Controle de Acesso', status: 'Privado', integrity: 100, icon: Lock },
  ];

  return (
    <div className="space-y-6">
      {/* Node Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {securityNodes.map((node) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={node.id} 
            className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl hover:border-primary/30 transition-all cursor-default relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-slate-800 text-primary rounded-lg border border-slate-700">
                <node.icon size={18} />
              </div>
              <span className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border",
                node.status === 'OK' ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : 
                node.status === 'Atenção' ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : "text-primary bg-primary/10 border-primary/20"
              )}>
                {node.status}
              </span>
            </div>

            <h3 className="text-sm font-semibold text-slate-200 mb-1">{node.name}</h3>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-3 uppercase tracking-tighter">
              <span>{node.id}</span>
              <span className="font-bold text-slate-300">{node.integrity}%</span>
            </div>

            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${node.integrity}%` }}
                className={cn(
                  "h-full rounded-full transition-all",
                  node.integrity > 90 ? "bg-primary shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "bg-amber-500"
                )} 
              />
            </div>
          </motion.div>
        ))}
      </div>

        {/* KPI METRICS PANEL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
               <span className="text-[10px] text-slate-400 font-bold uppercase mb-2 block tracking-widest">Valor Total Sob Risco</span>
               <span className="text-2xl font-black text-white">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
           </motion.div>
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
               <span className="text-[10px] text-slate-400 font-bold uppercase mb-2 block tracking-widest">SMs Pendentes</span>
               <span className="text-2xl font-black text-primary">05 SMs</span>
           </motion.div>
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
               <span className="text-[10px] text-slate-400 font-bold uppercase mb-2 block tracking-widest">Eficiência de Transmissão</span>
               <span className="text-2xl font-black text-emerald-400">98.4%</span>
           </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Matrix Card */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-sm font-bold text-slate-100 mb-6 flex items-center gap-2">
                    <Target size={16} className="text-primary" />
                    Matriz de Riscos Ativos
                </h2>
                <div className="aspect-square w-full max-w-[300px] mx-auto border-l border-b border-slate-700 relative flex items-center justify-center bg-slate-950/50 rounded-bl-xl">
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-10">
                        <div className="border-r border-b border-slate-600 bg-red-500" />
                        <div className="border-b border-slate-600 bg-amber-500" />
                        <div className="border-r border-slate-600 bg-amber-500" />
                        <div className="bg-emerald-500" />
                    </div>
                    {matrixDots.map(dot => (
                        <motion.div key={dot.id} className={cn("absolute w-3 h-3 rounded-full border-2", dot.color, dot.id === 5 ? 'animate-pulse' : '')} style={{ top: dot.top, left: dot.left }} />
                    ))}
                </div>
            </motion.div>

            {/* Volume Chart */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-sm font-bold text-slate-100 mb-6 flex items-center gap-2">
                    <Activity size={16} className="text-primary" />
                    Fluxo de SMs (Criadas vs Integradas)
                </h2>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={CHART_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                            <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={3} dot={{ strokeWidth: 2 }} />
                            <Line type="monotone" dataKey="integrated" stroke="#10b981" strokeWidth={3} dot={{ strokeWidth: 2 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Event Log */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl lg:col-span-2">
                <h2 className="text-sm font-bold text-slate-100 mb-6 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" />
                    Feed de Ocorrências Prioritárias
                </h2>
                <div className="space-y-2">
                    {EVENTS_LOG.map((log, i) => (
                        <div key={i} className="flex items-center p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                            <span className="font-mono text-[10px] text-slate-500 w-16">{log.time}</span>
                            <span className="text-xs text-slate-300 flex-1">{log.msg}</span>
                            <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", log.status === 'CRIT' ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-slate-800 text-slate-400')}>{log.status}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
      </div>
  );
}
