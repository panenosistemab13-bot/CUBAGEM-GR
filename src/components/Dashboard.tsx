import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock,
  Activity,
  TriangleAlert,
  Zap,
  Radio,
  Globe,
  MapPin,
  Signal,
  ShieldCheck,
  TrendingUp,
  AlertOctagon,
  User,
  Server,
  DollarSign,
  RefreshCw,
  Truck,
  ChevronRight,
  Layers,
  Bell,
  Search,
  Award,
  Calendar,
  ClipboardCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { GUEST_USER_ID } from '../constants';
import { format, addDays, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CityNode {
  name: string;
  state: string;
  x: number; // percentage width
  y: number; // percentage height
  region: string;
  altitude: string;
  linkStatus: 'active' | 'optimal' | 'warning';
  pings: number[];
}

export default function Dashboard() {
  const [presenceData, setPresenceData] = useState<any[]>([]);
  const [vehiclesInPatio, setVehiclesInPatio] = useState<number>(0);
  const [checklistAlerts, setChecklistAlerts] = useState<{expired: any[], soon: any[]}>({ expired: [], soon: [] });
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [activeTab, setActiveTab] = useState<'overview' | 'satellite'>('overview');
  const [hoveredNode, setHoveredNode] = useState<CityNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<CityNode | null>(null);
  const [hoveredCell, setHoveredCell] = useState<any | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // 11 real cities present in spreadsheet destinations
  const CITIES_LIST: CityNode[] = useMemo(() => [
    { name: 'Santa Luzia', state: 'MG', x: 62, y: 65, region: 'Sudeste', altitude: '725m', linkStatus: 'optimal', pings: [12, 14, 15, 11] },
    { name: 'Londrina', state: 'PR', x: 45, y: 78, region: 'Sul', altitude: '610m', linkStatus: 'active', pings: [24, 28, 26, 25] },
    { name: 'Gravataí', state: 'RS', x: 38, y: 92, region: 'Sul', altitude: '26m', linkStatus: 'active', pings: [35, 38, 36, 32] },
    { name: 'Gov. Celso Ramos', state: 'SC', x: 44, y: 86, region: 'Sul', altitude: '40m', linkStatus: 'optimal', pings: [31, 29, 32, 30] },
    { name: 'Pinhais', state: 'PR', x: 46, y: 81, region: 'Sul', altitude: '935m', linkStatus: 'active', pings: [28, 26, 27, 25] },
    { name: 'Cuiabá', state: 'MT', x: 28, y: 52, region: 'Centro-Oeste', altitude: '165m', linkStatus: 'warning', pings: [48, 55, 62, 51] },
    { name: 'Sumaré', state: 'SP', x: 54, y: 72, region: 'Sudeste', altitude: '583m', linkStatus: 'optimal', pings: [18, 16, 17, 19] },
    { name: 'Natal', state: 'RN', x: 92, y: 22, region: 'Nordeste', altitude: '30m', linkStatus: 'active', pings: [45, 42, 48, 44] },
    { name: 'Guarulhos', state: 'SP', x: 56, y: 74, region: 'Sudeste', altitude: '750m', linkStatus: 'optimal', pings: [14, 15, 13, 16] },
    { name: 'Viana', state: 'ES', x: 68, y: 62, region: 'Sudeste', altitude: '15m', linkStatus: 'active', pings: [22, 25, 24, 21] },
    { name: 'Salvador', state: 'BA', x: 78, y: 44, region: 'Nordeste', altitude: '8m', linkStatus: 'optimal', pings: [29, 31, 28, 30] }
  ], []);

  useEffect(() => {
    setSelectedNode(CITIES_LIST[0]);
  }, [CITIES_LIST]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 50); // Fast interval for millisecond feel
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    
    // Patio Data from RTDB
    const patioRef = ref(rtdb, 'patio/veiculos');
    const unsubscribePatio = onValue(patioRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.values(data) as any[];
        setVehiclesInPatio(items.filter(item => item.estaNoPatio === 'Sim').length);
      } else {
        setVehiclesInPatio(0);
      }
    });

    // Presence Data from RTDB
    const escalasListRef = ref(rtdb, 'escalas');
    const unsubscribePresence = onValue(escalasListRef, (snapshot) => {
      const data = snapshot.val();
      const shifts = data ? Object.values(data) : [];
      
      // Group progression by date
      const dataByDate: Record<string, number> = {};
      shifts.forEach((s: any) => {
        if (s.date && s.worked) {
          dataByDate[s.date] = (dataByDate[s.date] || 0) + 1;
        }
      });
      
      const sortedKeys = Object.keys(dataByDate).sort();
      // Keep only last 10 days available
      const last10 = sortedKeys.slice(-10);
      
      const chartData = last10.map((dateKey) => {
         const parts = dateKey.split('-');
         const name = parts.length === 3 ? `${parts[2]}/${parts[1]}` : dateKey;
         return { name, score: dataByDate[dateKey] };
      });
      
      setPresenceData(chartData.length ? chartData : []);
    }, (error) => {
      console.error("Error reading scales:", error);
    });

    // Checklist Data Sync
    const checklistRef = ref(rtdb, 'checklist_veiculos');
    const unsubscribeChecklist = onValue(checklistRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setChecklistAlerts({ expired: [], soon: [] });
        return;
      }
      
      const items = Object.values(data) as any[];
      const today = new Date();
      const nextWeek = addDays(today, 7);
      
      const expired: any[] = [];
      const soon: any[] = [];
      
      items.forEach(item => {
        if (!item.dataVencimento) return;
        const vencimento = parseISO(item.dataVencimento);
        if (isBefore(vencimento, today)) {
          expired.push(item);
        } else if (isBefore(vencimento, nextWeek)) {
          soon.push(item);
        }
      });
      
      setChecklistAlerts({ expired, soon });
    });

    return () => {
      unsubscribePatio();
      unsubscribePresence();
      unsubscribeChecklist();
    };
  }, []);



  // Fleet elements grid simulation
  const fleetGridCells = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const id = `V-${1000 + i}`;
      const plates = ['PGR-2041', 'PGR-5532', 'PGR-9104', 'PGR-1284', 'PGR-3725', 'PGR-6821', 'PGR-4950', 'PGR-8320'];
      const cities = ['Santa Luzia', 'Salvador', 'Guarulhos', 'Viana', 'Londrina', 'Gravataí', 'Sumaré', 'Pinhais'];
      const statusList = ['EM PÁTIO', 'ROTA ATIVA', 'BLOQUEADO', 'MANUTENÇÃO'];
      
      let state: 'PATIO' | 'ROTA' | 'BLOQUEADO' | 'RESERVA' = 'RESERVA';
      let latency = 12 + (i * 3) % 20;

      if (i < vehiclesInPatio) {
        state = 'PATIO';
      } else if (i % 6 === 0) {
        state = 'BLOQUEADO';
        latency = 999;
      } else if (i % 2 === 0) {
        state = 'ROTA';
      }

      const colorMap = {
        PATIO: '#10b981', // green
        ROTA: '#3b82f6', // blue
        BLOQUEADO: '#ef4444', // red
        RESERVA: '#71717a' // zinc
      };

      return {
        id,
        placa: plates[i % plates.length],
        status: state === 'PATIO' ? 'PÁTIO' : state === 'ROTA' ? 'EM VIAGEM' : state === 'BLOQUEADO' ? 'ALERTA' : 'DISPO/STANDBY',
        color: colorMap[state],
        latencia: `${latency}ms`,
        operacao: cities[i % cities.length],
        sinal: latency > 100 ? 'FRÁGIL' : 'ESTÁVEL',
        rawState: state
      };
    });
  }, [vehiclesInPatio]);

  // Route Flow Simulation
  const simulatedRoutes = useMemo(() => {
    return [
      { id: 'RT-301', orig: 'SANTA LUZIA', dest: 'GUARULHOS', motorista: 'Alisson R.', progresso: 65, velocidade: '82 km/h', status: 'optimal', delay: '0m' },
      { id: 'RT-312', orig: 'LONDRINA', dest: 'PINHAIS', motorista: 'Gelson M.', progresso: 85, velocidade: '78 km/h', status: 'optimal', delay: '0m' },
      { id: 'RT-402', orig: 'Viana', dest: 'SALVADOR', motorista: 'Carlos S.', progresso: 32, velocidade: '80 km/h', status: 'warning', delay: '12m' },
      { id: 'RT-285', orig: 'CUIABÁ', dest: 'SANTA LUZIA', motorista: 'Felipe J.', progresso: 18, velocidade: '0 km/h', status: 'critical', delay: '2h 15m' },
      { id: 'RT-199', orig: 'SUMARÉ', dest: 'GRAVATAÍ', motorista: 'Tadeu K.', progresso: 95, velocidade: '84 km/h', status: 'optimal', delay: '0m' }
    ];
  }, []);

  return (
    <div className="min-h-full bg-[#F2E4CC] text-[#2D1A10] p-4 md:p-8 font-sans overflow-auto flex flex-col relative gap-6">
      
      {/* Decorative Artisan Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_center,rgba(58,36,20,0.05)_0%,transparent_100%)]"></div>

      {/* HEADER SECTION - Premium Artisan Plate Style */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b-2 border-[#6B4423]/20 relative z-10 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#B32025] bg-[#E8D4B0] border border-[#6B4423]/20 px-2 py-0.5 rounded-sm">
              SISTEMA PGR CENTRAL
            </span>
            <span className="text-[#6B4423] font-mono text-sm">/</span>
            <div className="flex items-center gap-1.5 text-emerald-800 text-[10px] font-black uppercase bg-[#E8D4B0] px-2 py-0.5 border border-[#3A2414]/10 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
              NÚCLEO ATIVO
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#2D1A10] tracking-tight leading-none font-serif">
            Monitoramento de Operações
          </h1>
          <p className="text-xs text-[#6B4423] mt-2 font-medium">
            Visão computacional, telemetria e gestão artesanal em tempo real.
          </p>
        </div>

        {/* Time block */}
        <div className="flex items-center gap-3 bg-[#E8D4B0] border-2 border-[#A28A67] rounded-lg px-5 py-2.5 relative shadow-inner">
          <Clock size={16} className="text-[#B32025]" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-[#6B4423] uppercase tracking-widest">HORA OPERACIONAL (UTC)</span>
            <span className="text-lg font-mono font-bold text-[#2D1A10] tracking-wider">
              {format(currentTime, "HH:mm:ss")}
            </span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-zinc-800/80 gap-1 overflow-x-auto min-w-full relative z-10 shrink-0 select-none pb-0.5">
        {[
          { id: 'overview', label: 'Águia Geral', sub: 'Métricas & Telemetria', icon: Activity },
          { id: 'satellite', label: 'Rastreamento Satélite', sub: 'Hubs & Rotas Conectadas', icon: Globe }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "relative py-3.5 px-6 flex items-center gap-3 border-b-2 transition-all duration-300 text-left cursor-pointer outline-none shrink-0 min-w-[200px] group",
                isActive 
                  ? "border-indigo-500 text-white bg-indigo-500/5" 
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                isActive ? "bg-indigo-500/10 text-indigo-400" : "bg-zinc-800/40 text-zinc-500 group-hover:text-zinc-400"
              )}>
                <tab.icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">{tab.label}</span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5 tracking-wider">{tab.sub}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* MAIN CONTAINER CONTENT */}
      <div className="flex-1 min-h-0 relative z-10">

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 min-h-full items-start">
            
            {/* Left Metrics Column */}
            <div className="flex flex-col gap-6">
              
              {/* Metric Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    lbl: 'Veículos em Pátio',
                    desc: 'Presença no Pátio Santa Luzia',
                    val: vehiclesInPatio,
                    color: 'from-emerald-500/20 to-teal-500/2',
                    border: 'border-emerald-500/20 hover:border-emerald-500/40',
                    indicator: 'bg-emerald-500 shadow-[0_0_10px_#10b981]',
                    tag: 'EM TEMPO REAL',
                    textColor: 'text-emerald-400'
                  }
                ].map((m, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "relative overflow-hidden rounded-2xl border bg-zinc-900/40 backdrop-blur-md p-5 transition-all duration-300 group shadow-lg",
                      m.border
                    )}
                  >
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none", m.color)} />
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">{m.lbl}</span>
                        <span className="text-[9px] text-zinc-500 leading-none">{m.desc}</span>
                      </div>
                      <span className={cn("text-[8px] font-mono border px-1.5 py-0.5 rounded uppercase font-semibold", m.textColor, "bg-zinc-950/80 border-white/5")}>
                        {m.tag}
                      </span>
                    </div>
                    <div className={cn("relative z-10 text-3xl font-extrabold tracking-tight mt-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] flex items-end justify-between", m.textColor)}>
                      {m.val}
                      <span className={cn("w-2 h-2 rounded-full mb-2.5", m.indicator)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Checklist Fleet Status Section */}
              <div className="bg-[#0b0d19]/80 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 relative z-10 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                      <ClipboardCheck size={24} className="text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">Status de Frota • Checklists</h3>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Monitoramento de vistorias técnicas</p>
                    </div>
                  </div>

                  {checklistAlerts.expired.length === 0 && checklistAlerts.soon.length === 0 ? (
                    <div className="flex items-center gap-2.5 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                      <ShieldCheck size={16} className="text-emerald-500" />
                      <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">FROTA OK</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 px-5 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                      <Activity size={16} className="text-rose-500 animate-pulse" />
                      <span className="text-xs font-black text-rose-500 uppercase tracking-widest">Atenção Necessária</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  {/* Expired Section */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#ef4444]" />
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Vencimento Excedido</span>
                    </div>
                    <div className="grid gap-3">
                       {checklistAlerts.expired.length === 0 ? (
                         <div className="p-10 text-center bg-white/[0.02] border border-dashed border-white/5 rounded-3xl">
                            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Nenhum registro vencido</p>
                         </div>
                       ) : (
                         checklistAlerts.expired.map((alert, i) => (
                           <div key={i} className="flex items-center justify-between p-5 bg-rose-500/5 border border-rose-500/10 rounded-2xl group hover:bg-rose-500/10 hover:border-rose-500/30 transition-all duration-300">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-white group-hover:text-rose-100 transition-colors">{alert.cavalo}</span>
                                <span className="text-[10px] font-mono text-rose-500/70 uppercase tracking-wider">{alert.periferico}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-rose-500 bg-rose-500/20 px-2 py-0.5 rounded mb-1">VENCIDO</p>
                                <p className="text-[10px] font-mono text-zinc-500">{alert.dataVencimento.split('-').reverse().join('/')}</p>
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                  </div>

                  {/* Soon to Expire Section */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Próximos Vencimentos</span>
                    </div>
                    <div className="grid gap-3">
                       {checklistAlerts.soon.length === 0 ? (
                         <div className="p-10 text-center bg-white/[0.02] border border-dashed border-white/5 rounded-3xl">
                            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Nenhuma advertência imediata</p>
                         </div>
                       ) : (
                         checklistAlerts.soon.map((alert, i) => (
                           <div key={i} className="flex items-center justify-between p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl group hover:bg-amber-500/10 hover:border-amber-500/30 transition-all duration-300">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-white group-hover:text-amber-100 transition-colors">{alert.cavalo}</span>
                                <span className="text-[10px] font-mono text-amber-500/70 uppercase tracking-wider">{alert.periferico}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-amber-500 bg-amber-500/20 px-2 py-0.5 rounded mb-1">PROGRAMADO</p>
                                <p className="text-[10px] font-mono text-zinc-500">{alert.dataVencimento.split('-').reverse().join('/')}</p>
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SATELLITE DETAILED TRACING */}
        {activeTab === 'satellite' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
            
            {/* Interactive Vector Map Grid */}
            <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 flex flex-col relative overflow-hidden backdrop-blur-md shadow-lg min-h-[450px]">
              <div className="absolute top-4 left-4 z-10">
                <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                  <Radio size={16} className="text-cyan-400 animate-pulse" />
                  Mapeamento de Satélite Operacional
                </h3>
                <p className="text-[10px] text-zinc-400 font-mono uppercase mt-1">
                  11 HUBs Ativos Baseados em Destinos da Operação PGR
                </p>
              </div>

              {/* Dynamic Coordinate overlay background grid */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(38,38,38,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(38,38,38,0.15)_1px,transparent_1px)] bg-[size:30px_30px] opacity-30 pointer-events-none" />

              {/* SIMULATED SATELLITE CARTOGRAPHY SCREEN */}
              <div className="flex-1 w-full relative flex items-center justify-center mt-8">
                {/* Visual outline of Brazil coordinate sector borders for high craft feel */}
                <div className="absolute inset-10 border border-zinc-800/30 rounded-3xl pointer-events-none flex items-center justify-center">
                  <div className="text-[10px] text-zinc-700 font-mono tracking-widest uppercase">Setor BR-SUL-SUDESTE-NORDESTE</div>
                </div>

                <svg className="absolute inset-0 w-full h-full overflow-visible z-0 pointer-events-none opacity-40">
                  <defs>
                    <linearGradient id="linkGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  
                  {/* Connect active nodes to central Hub 'Santa Luzia' at x: 62%, y: 65% */}
                  {CITIES_LIST.map((city, idx) => {
                    if (city.name === 'Santa Luzia') return null;
                    const hub = CITIES_LIST[0]; // Santa Luzia
                    return (
                      <g key={`links-${idx}`}>
                        <line 
                          x1={`${hub.x}%`} 
                          y1={`${hub.y}%`} 
                          x2={`${city.x}%`} 
                          y2={`${city.y}%`} 
                          stroke="url(#linkGradient)" 
                          strokeWidth="1.5" 
                          strokeDasharray={city.linkStatus === 'warning' ? '2,3' : '5,5'} 
                          className="animate-[flow_1s_linear_infinite]" 
                          style={{ animationDuration: city.linkStatus === 'optimal' ? '12s' : '24s' }}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* City Pins elements */}
                {CITIES_LIST.map((city, idx) => {
                  const isHovered = hoveredNode?.name === city.name;
                  const isSelected = selectedNode?.name === city.name;
                  
                  return (
                    <button
                      key={idx}
                      onMouseEnter={() => setHoveredNode(city)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={() => setSelectedNode(city)}
                      className="absolute group z-10 transition-transform duration-300 hover:scale-110 active:scale-95 cursor-pointer outline-none"
                      style={{ left: `${city.x}%`, top: `${city.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <div className="relative flex items-center justify-center">
                        {/* Radar sonar waves */}
                        <span className={cn(
                          "absolute w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping",
                          city.linkStatus === 'optimal' ? 'bg-emerald-500/10' : city.linkStatus === 'warning' ? 'bg-amber-400/10' : 'bg-blue-500/10'
                        )} />
                        
                        {/* Small node color pill */}
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center transition-all border duration-300 shadow-md",
                          isSelected 
                            ? "bg-indigo-500 border-white text-white shadow-[0_0_12px_#6366f1]" 
                            : isHovered 
                              ? "bg-zinc-800 border-indigo-400 text-indigo-400" 
                              : "bg-zinc-950/90 border-zinc-800 text-zinc-400"
                        )}>
                          <MapPin size={11} className={cn("transition-transform group-hover:scale-125", isSelected && "animate-bounce")} />
                        </div>

                        {/* Tag Label */}
                        <div className={cn(
                          "absolute left-6 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border shadow-lg whitespace-nowrap transition-all duration-300",
                          isSelected 
                            ? "bg-indigo-950 border-indigo-500/40 text-white" 
                            : "bg-zinc-950/80 border-zinc-800 text-zinc-400 group-hover:text-zinc-200 group-hover:border-zinc-700"
                        )}>
                          {city.name} <span className="opacity-60 text-[8px]">{city.state}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Grid calibration metadata */}
              <div className="flex items-center justify-between border-t border-zinc-800/60 pt-4 text-[9px] font-mono text-zinc-500 uppercase">
                <span>Latência Média: 24.3ms</span>
                <span>Fração Comunicação: L1 Orbit Sec-55</span>
                <span>Escala Geográfica Fixa 1:2.000.000</span>
              </div>
            </div>

            {/* Hub Details Panel Right Hand */}
            <div className="flex flex-col gap-6">
              
              {/* Node Card inspector */}
              <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 flex flex-col gap-5 backdrop-blur-md shadow-lg flex-1">
                {selectedNode ? (
                  <>
                    <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
                      <div>
                        <h4 className="text-xl font-extrabold text-white uppercase mt-0.5">{selectedNode.name}</h4>
                        <span className="text-[10px] text-zinc-500 font-mono">ESTADO DE FEDERAÇÃO: {selectedNode.state}</span>
                      </div>
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full shadow-md animate-pulse mt-1",
                        selectedNode.linkStatus === 'optimal' ? 'bg-emerald-500 shadow-emerald-500/50' : selectedNode.linkStatus === 'warning' ? 'bg-amber-400 shadow-amber-400/50' : 'bg-blue-500 shadow-blue-500/50'
                      )} />
                    </div>

                    <div className="flex flex-col gap-4 text-xs font-mono">
                      <div className="flex justify-between items-center py-1 border-b border-zinc-800/40">
                        <span className="text-zinc-500 uppercase text-[10px]">Altitude Operação</span>
                        <span className="text-zinc-200 font-bold">{selectedNode.altitude}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-zinc-800/40">
                        <span className="text-zinc-500 uppercase text-[10px]">Ping Rede (Uplink)</span>
                        <span className="text-cyan-400 font-bold">{selectedNode.pings[0]}ms</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-zinc-800/40">
                        <span className="text-zinc-500 uppercase text-[10px]">Segurança Sinal</span>
                        <span className={cn(
                          "font-bold",
                          selectedNode.linkStatus === 'optimal' ? 'text-emerald-400' : selectedNode.linkStatus === 'warning' ? 'text-amber-400' : 'text-blue-400'
                        )}>{selectedNode.linkStatus === 'optimal' ? 'EXCELENTE / ENVELOPE C2' : selectedNode.linkStatus === 'warning' ? 'INTERMITENTE / SATÉTITE' : 'ESTÁVEL / CABO'}</span>
                      </div>
                      
                      <div className="mt-2">
                        <span className="text-[9px] text-zinc-500 uppercase mb-2 block tracking-wider font-extrabold">Histórico de Pings Recentes</span>
                        <div className="flex gap-2 items-end h-12 bg-zinc-950 p-2 border border-white/5 rounded-xl">
                          {selectedNode.pings.map((ping, pIdx) => {
                            const pct = Math.min((ping / 80) * 100, 100);
                            return (
                              <div key={pIdx} className="flex-1 bg-zinc-800 hover:bg-indigo-500/50 rounded-sm relative group cursor-default transition-colors" style={{ height: `${pct}%` }}>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black text-[8px] font-bold text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                  {ping}ms
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-white/5">
                        <span className="text-[9px] text-zinc-500 uppercase block tracking-wider font-extrabold mb-1">Status de Instalação PWA</span>
                        <p className="text-[11px] leading-relaxed text-zinc-400 leading-normal">
                          Configurado como standalone. Permite monitoramento persistente na barra inicial do smartphone para agilidade em campo.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-zinc-500 flex flex-col items-center gap-3">
                    <Globe className="w-8 h-8 text-zinc-600 animate-spin" />
                    <span>Selecione uma cidade no mapa satélite para inspecionar parâmetros da rota.</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}



      </div>

    </div>
  );
}
