import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { 
  Edit2, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Search, 
  ArrowRightLeft, 
  MapPin, 
  Navigation,
  Globe,
  Settings2,
  Database,
  ArrowRight,
  ShieldCheck,
  Activity,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Clipboard,
  Check,
  Upload,
  Download,
  AlertTriangle,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toAbsoluteUrl } from '../utils/url';
import coffeeBg from '../assets/images/coffee_rustic_bg_1780760486326.png';
import { rtdb as db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';

interface RouteItem {
  ida: string;
  idaCod: string;
  volta: string;
  voltaCod: string;
}

const DEFAULT_ROUTES: RouteItem[] = [
  { ida: 'SANTA LUZIA-MG X RIO DE JANEIRO-RJ', idaCod: '4069', volta: 'RIO DE JANEIRO-RJ X SANTA LUZIA-MG', voltaCod: '4079' },
  { ida: 'SANTA LUZIA-MG X GUARULHOS-SP', idaCod: '4070', volta: 'GUARULHOS-SP X SANTA LUZIA-MG', voltaCod: '3971/4076' },
  { ida: 'SANTA LUZIA-MG X MONTES CLAROS-MG', idaCod: '', volta: 'MONTES CLAROS-MG X SANTA LUZIA-MG', voltaCod: '4081' },
  { ida: 'SANTA LUZIA-MG X VIANA-ES', idaCod: '', volta: 'VIANA-ES X SANTA LUZIA-MG', voltaCod: '3985' },
  { ida: 'SANTA LUZIA-MG X BRASILIA-DF', idaCod: '4071', volta: 'BRASILIA-DF X SANTA LUZIA-MG', voltaCod: '4077' },
  { ida: 'SANTA LUZIA-MG X SUMARE-SP', idaCod: '', volta: 'SUMARE-SP X SANTA LUZIA-MG', voltaCod: '3994' },
  { ida: 'SANTA LUZIA-MG X PINHAIS-PR', idaCod: '', volta: 'PINHAIS-PR X SANTA LUZIA-MG', voltaCod: '4080' },
  { ida: 'SANTA LUZIA-MG X LONDRINA-PR', idaCod: '4027', volta: 'LONDRINA-PR X SANTA LUZIA-MG', voltaCod: '3975/4078/4091' },
  { ida: 'SANTA LUZIA-MG X NATAL-RN', idaCod: '4015', volta: 'NATAL-RN X SANTA LUZIA-MG', voltaCod: '3969/3970/4075' },
  { ida: 'SANTA LUZIA-MG X GOV. CELSO RAMOS-SC', idaCod: '', volta: 'GOV. CELSO RAMOS-SC X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X SALVADOR-BA', idaCod: '', volta: 'SALVADOR-BA X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X EUSEBIO-CE', idaCod: '', volta: 'EUSEBIO-CE X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X GRAVATAI-RS', idaCod: '', volta: 'GRAVATAI-RS X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X CAMPO GRANDE-MT', idaCod: '', volta: 'CAMPO GRANDE-MS X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X CUIABA-MT', idaCod: '', volta: 'CUIABA-MT X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X ARIQUEMES', idaCod: '', volta: 'ARIQUEMES-RO X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X VESPASIANO-MG', idaCod: '', volta: 'VESPASIANO-MG X SANTA LUZIA-MG', voltaCod: '3989/3990' },
];

export default function Rotas({ onBack }: { onBack?: () => void }) {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [tempRoutes, setTempRoutes] = useState<RouteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // States for backup and migration
  const [legacyData, setLegacyData] = useState<RouteItem[] | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [backupText, setBackupText] = useState('');
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
  const [isCopied, setIsCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<{ type: 'ida' | 'volta' | 'idaName' | 'voltaName'; index: number } | null>(null);

  const copyIndividualCode = (code: string, type: 'ida' | 'volta' | 'idaName' | 'voltaName', index: number) => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode({ type, index });
      setTimeout(() => setCopiedCode(null), 1500);
    });
  };

  // Check for legacy localstorage on load
  useEffect(() => {
    const localSaved = localStorage.getItem('app_rotas_data');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLegacyData(parsed);
        }
      } catch (e) {
        console.warn("Legacy localstorage parse error in Rotas:", e);
      }
    }
  }, []);

  useEffect(() => {
    const rotasRef = ref(db, 'app_rotas_data');
    const unsubscribe = onValue(rotasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoutes(data);
      } else {
        setRoutes(DEFAULT_ROUTES);
        set(rotasRef, DEFAULT_ROUTES);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDragStart = (e: React.DragEvent, realIndex: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedIndex(realIndex);
  };

  const handleDragOver = (e: React.DragEvent, realIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === realIndex) return;
    setHoveredIndex(realIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetRealIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetRealIndex) {
      setDraggedIndex(null);
      setHoveredIndex(null);
      return;
    }

    const list = isEditing ? [...tempRoutes] : [...routes];
    const [draggedItem] = list.splice(draggedIndex, 1);
    list.splice(targetRealIndex, 0, draggedItem);

    if (isEditing) {
      setTempRoutes(list);
    } else {
      setRoutes(list);
      set(ref(db, 'app_rotas_data'), list);
    }
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  const handleImportLegacy = (mode: 'merge' | 'replace') => {
    if (!legacyData) return;
    
    let updated: RouteItem[] = [];
    if (mode === 'replace') {
      updated = [...legacyData];
    } else {
      const existingSignatures = new Set(
        routes.map(r => `${(r.ida || '').toLowerCase()}|${(r.volta || '').toLowerCase()}`)
      );
      
      const uniqueLegacy = legacyData.filter(r => {
        const sig = `${(r.ida || '').toLowerCase()}|${(r.volta || '').toLowerCase()}`;
        return !existingSignatures.has(sig);
      });
      
      updated = [...routes, ...uniqueLegacy];
    }
    
    set(ref(db, 'app_rotas_data'), updated).then(() => {
      setRoutes(updated);
      localStorage.removeItem('app_rotas_data');
      setLegacyData(null);
    }).catch(err => {
      console.error(err);
    });
  };

  const handleManualImport = (mode: 'merge' | 'replace') => {
    try {
      const parsed = JSON.parse(backupText);
      if (!Array.isArray(parsed)) {
        setBackupStatus({ type: 'error', message: 'Formato inválido: O backup deve ser um array de rotas!' });
        return;
      }
      
      const cleaned: RouteItem[] = parsed.map(item => ({
        ida: String(item.ida || ''),
        idaCod: String(item.idaCod || ''),
        volta: String(item.volta || ''),
        voltaCod: String(item.voltaCod || ''),
      }));

      let updated: RouteItem[] = [];
      if (mode === 'replace') {
        updated = cleaned;
      } else {
        const existingSignatures = new Set(
          routes.map(r => `${(r.ida || '').toLowerCase()}|${(r.volta || '').toLowerCase()}`)
        );
        
        const uniquePasted = cleaned.filter(r => {
          const sig = `${(r.ida || '').toLowerCase()}|${(r.volta || '').toLowerCase()}`;
          return !existingSignatures.has(sig);
        });
        
        updated = [...routes, ...uniquePasted];
      }

      set(ref(db, 'app_rotas_data'), updated).then(() => {
        setRoutes(updated);
        setBackupStatus({ type: 'success', message: `${cleaned.length} rotas importadas e sincronizadas com a Nuvem!` });
        setTimeout(() => {
          setIsBackupOpen(false);
          setBackupText('');
          setBackupStatus({ type: '', message: '' });
        }, 1500);
      }).catch(err => {
        console.error(err);
        setBackupStatus({ type: 'error', message: 'Erro ao salvar no banco.' });
      });
    } catch (e) {
      setBackupStatus({ type: 'error', message: 'Código de backup inválido! Verifique a sintaxe JSON.' });
    }
  };

  const copyToClipboard = () => {
    const jsonStr = JSON.stringify(routes, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleStartEdit = () => {
    setTempRoutes([...routes]);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    setRoutes(tempRoutes);
    set(ref(db, 'app_rotas_data'), tempRoutes);
    setIsEditing(false);
  };

  const updateRow = (index: number, field: keyof RouteItem, value: string) => {
    const newRoutes = [...tempRoutes];
    newRoutes[index] = { ...newRoutes[index], [field]: value };
    setTempRoutes(newRoutes);
  };

  const addRow = () => {
    setTempRoutes([{ ida: '', idaCod: '', volta: '', voltaCod: '' }, ...tempRoutes]);
  };

  const removeRow = (index: number) => {
    setTempRoutes(tempRoutes.filter((_, i) => i !== index));
  };

  const moveRoute = (route: RouteItem, direction: 'up' | 'down') => {
    const list = isEditing ? [...tempRoutes] : [...routes];
    const index = list.indexOf(route);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < list.length) {
      // Swap
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      if (isEditing) {
        setTempRoutes(list);
      } else {
        setRoutes(list);
        set(ref(db, 'app_rotas_data'), list);
      }
    }
  };

  const clearAll = () => {
    if(confirm('Limpar todas as rotas permanentemente?')) {
        setTempRoutes([]);
    }
  };

  const rawData = isEditing ? tempRoutes : routes;
  const safeRawData = Array.isArray(rawData) ? rawData : [];
  
  const currentData = safeRawData.filter(r => 
    (r?.ida || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r?.idaCod || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r?.volta || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r?.voltaCod || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f1e5] via-[#eddaba] to-[#e4cbab] p-4 md:p-8 space-y-6 md:space-y-8 pb-32 text-[#3A2414]">
      {onBack && (
        <button 
          onClick={onBack}
          className="md:hidden flex items-center justify-center gap-2 w-full bg-[#3A2414] hover:bg-[#2A1408] text-[#fbdba5] py-3.5 rounded-2xl font-black text-xs transition-all border border-[#3A2414] shadow-md cursor-pointer mb-2"
        >
          <LayoutGrid size={16} className="text-[#B32025]" />
          <span>Voltar ao Menu Inicial</span>
        </button>
      )}

      {/* Dynamic Earthy Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#ebd8bf] to-[#d6bc99] border-4 border-[#3A2414] p-6 lg:p-8 shadow-md">
        {/* Decorative corner accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#3A2414]/20 pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#3A2414]/20 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#3A2414]/20 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#3A2414]/20 pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-2/3">
            {/* Studio Composition Image Frame */}
            <div className="relative w-full md:w-56 h-40 shrink-0 rounded-2xl overflow-hidden border-2 border-[#3A2414] shadow-md group">
              <img 
                src={toAbsoluteUrl(coffeeBg)} 
                alt="Edição Rústica Sofisticada" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3A2414]/30 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B32025] animate-pulse" />
                <span className="text-[9px] font-mono font-bold tracking-widest text-white uppercase">Composição Macro</span>
              </div>
            </div>

            <div className="text-center md:text-left space-y-2">
              <h1 className="text-3xl md:text-4xl font-serif font-black text-[#3A2414] tracking-tight leading-tight">
                Edição Rústica Sofisticada
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1">
                <span className="font-mono text-xs text-[#B32025] font-black uppercase tracking-widest">
                  CAFÉ EM GRÃOS SELECIONADOS
                </span>
                <span className="text-[#3A2414]/30">•</span>
                <span className="font-serif italic text-xs text-[#3A2414]/80">
                  Composição de Estúdio "3corações"
                </span>
              </div>
              <p className="text-xs text-[#3A2414]/80 leading-relaxed max-w-xl font-medium">
                Cata de texturas artesanais de café: juta, papel kraft, cobre polido, gotejador de cobre, caneca de cerâmica rústica, folhas de café frescas e o selo de cera vermelho-escura.
              </p>
            </div>
          </div>

          {/* Metrics styled like paper tag tickets hanging */}
          <div className="flex items-center gap-4 w-full xl:w-auto justify-center xl:justify-end">
            <div className="px-5 py-4 bg-[#fdfcf9]  border-2 border-[#3A2414]/25 rounded-2xl shadow-sm min-w-[120px] text-center relative rotate-[-1.5deg]">
              {/* String hanging effect */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#3A2414]/25 rounded" />
              <span className="text-[9px] font-black text-[#B32025] uppercase tracking-widest block mb-1">TRECHOS</span>
              <span className="text-3xl font-serif font-black text-[#3A2414]">{currentData.length}</span>
            </div>
            
            <div className="px-5 py-4 bg-[#fdfcf9]  border-2 border-[#3A2414]/25 rounded-2xl shadow-sm min-w-[120px] text-center relative rotate-[1.5deg]">
              {/* String hanging effect */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#3A2414]/25 rounded" />
              <span className="text-[9px] font-black text-[#B32025] uppercase tracking-widest block mb-1">CÓDIGOS</span>
              <span className="text-3xl font-serif font-black text-[#3A2414]">
                {currentData.filter(r => r.idaCod).length + currentData.filter(r => r.voltaCod).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Legacy Data Sync Banner */}
      {legacyData && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50/90 backdrop-blur-sm border-4 border-[#3A2414] rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md  relative overflow-hidden"
        >
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#3A2414]/20 pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#3A2414]/20 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#3A2414]/20 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#3A2414]/20 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-5 items-center text-center md:text-left">
            <div className="p-4 bg-[#B32025] text-white rounded-2xl shrink-0 shadow-md flex items-center justify-center">
              <Database size={24} />
            </div>
            <div>
              <h4 className="font-serif font-black text-lg text-[#3A2414] uppercase tracking-tight">Sincronização de Rotas do Computador Corporativo</h4>
              <p className="text-xs text-[#3A2414]/90 mt-1 font-medium max-w-2xl leading-relaxed">
                Detectamos <span className="font-black text-[#B32025]">{legacyData.length} rotas antigas</span> salvas localmente neste navegador (antigo backup do Vercel). Deseja sincronizá-las e subir para a Nuvem de forma global para funcionar em todos os dispositivos?
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0 justify-center w-full md:w-auto">
            <button 
              onClick={() => handleImportLegacy('merge')}
              className="px-5 py-3.5 bg-[#3A2414] hover:bg-[#3A2414]/90 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-sm cursor-pointer border border-[#3A2414]"
            >
              Mesclar com Nuvem
            </button>
            <button 
              onClick={() => handleImportLegacy('replace')}
              className="px-5 py-3.5 bg-[#B32025] hover:brightness-110 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-sm cursor-pointer border-2 border-[#3A2414]/20"
            >
              Substituir Nuvem
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('app_rotas_data');
                setLegacyData(null);
              }}
              className="px-5 py-3.5 bg-white hover:bg-stone-50 text-stone-700 border-2 border-[#3A2414]/15 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-sm cursor-pointer"
            >
              Descartar
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content Card - Styled as a premium rustic board sheet */}
      <div className="bg-[#fdfcf9]/85 backdrop-blur-md  border-4 border-[#3A2414] rounded-[2.5rem] p-6 md:p-8 shadow-md relative overflow-hidden text-[#3A2414]">
        
        {/* Actions & Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#B32025]">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="PESQUISAR ROTA, CIDADE OU CÓDIGO SM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-[#3A2414]/15 focus:border-[#B32025] rounded-2xl pl-12 pr-6 py-4 text-xs font-black text-[#3A2414] placeholder-stone-400 transition-all outline-none uppercase tracking-widest font-mono shadow-sm"
            />
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-2">
            {!isEditing ? (
              <>
                <button 
                  onClick={handleStartEdit} 
                  className="flex items-center gap-3 px-6 py-4 bg-[#B32025] hover:brightness-110 text-white border-2 border-[#3A2414]/25 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer shadow-sm"
                >
                  <Edit2 size={16} /> Editar Configuração
                </button>
                <button 
                  onClick={() => {
                    setIsBackupOpen(true);
                    setBackupStatus({ type: '', message: '' });
                    setBackupText('');
                  }} 
                  className="flex items-center gap-3 px-6 py-4 bg-[#3A2414] hover:brightness-110 text-[#fbdba5] border-2 border-[#3A2414]/25 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer shadow-sm"
                  title="Fazer Backup ou Restaurar Rotas"
                >
                  <Database size={16} /> Sincronizar Backup
                </button>
              </>
            ) : (
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={addRow} 
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-[#3A2414] hover:brightness-110 text-white border-2 border-[#3A2414]/20 rounded-2xl text-xs font-black uppercase transition-all cursor-pointer shadow-sm"
                >
                  <Plus size={16} /> Adicionar
                </button>
                <button 
                  onClick={handleSave} 
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-[#B32025] hover:brightness-110 text-white border-2 border-[#3A2414]/25 rounded-2xl text-xs font-black uppercase transition-all cursor-pointer shadow-sm"
                >
                  <Save size={16} /> Salvar
                </button>
                <button 
                  onClick={handleCancel} 
                  className="p-4 bg-white hover:bg-stone-50 text-[#3A2414] border-2 border-[#3A2414]/15 rounded-2xl transition-all cursor-pointer shadow-sm"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Premium Responsive Route Cards Grid (Matches Attached Image) */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {currentData.map((route) => {
              const realIndex = safeRawData.indexOf(route);
              if (realIndex === -1) return null;
              return (
                <motion.div 
                  layout
                  draggable={!isEditing}
                  onDragStart={(e) => handleDragStart(e, realIndex)}
                  onDragOver={(e) => handleDragOver(e, realIndex)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, realIndex)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={`${route.idaCod}-${route.voltaCod}-${realIndex}`} 
                  className={cn(
                    "grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch p-1 rounded-3xl transition-all relative",
                    draggedIndex === realIndex ? "opacity-30 bg-[#3A2414]/10" : "",
                    hoveredIndex === realIndex ? "border-2 border-dashed border-[#B32025]/50 bg-[#B32025]/5" : ""
                  )}
                >
                  {/* CARD LEFT: IDA */}
                  <div className="flex items-center gap-4 bg-[#FCFBF8] hover:bg-[#F8F5F0] border border-[#3A2414]/10 rounded-[2rem] p-2 pr-4 shadow-[0_2px_8px_rgba(58,36,20,0.02)] hover:shadow-[0_4px_16px_rgba(58,36,20,0.06)] transition-all group/card relative w-full">
                    {/* Six Dots Drag Handle */}
                    {!isEditing && (
                      <div 
                        className="pl-2 pr-1 text-[#3A2414]/20 hover:text-[#B32025] cursor-grab active:cursor-grabbing shrink-0 transition-colors" 
                        title="Arraste para reordenar"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical size={16} className="stroke-[2.5]" />
                      </div>
                    )}
                    
                    {/* Brown button with right arrow (→) */}
                    <div className="w-10 h-10 bg-[#B37C4E] text-white rounded-full flex items-center justify-center shrink-0 shadow-inner transition-transform duration-300 hover:scale-105">
                      <ArrowRight size={16} className="stroke-[3]" />
                    </div>

                    {/* Route Name Column */}
                    <div className="flex-1 min-w-0 pr-1">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-[#B32025] shrink-0" />
                          <input 
                            value={route.ida} 
                            onChange={(e) => updateRow(realIndex, 'ida', e.target.value)} 
                            className="w-full bg-white p-2.5 rounded-xl border border-[#3A2414]/15 text-xs text-[#3A2414] font-black focus:border-[#B32025] outline-none uppercase shadow-sm font-mono tracking-tight"
                            placeholder="ORIGEM X DESTINO"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[11px] lg:text-xs font-bold text-[#4a3322] uppercase tracking-wide break-words">
                            {route.ida || '---'}
                          </span>
                          {route.ida && (
                            <button
                              onClick={() => copyIndividualCode(route.ida, 'idaName', realIndex)}
                              className={cn(
                                "w-7 h-7 flex items-center justify-center rounded-full transition-all cursor-pointer opacity-100 md:opacity-0 md:group-hover/card:opacity-100 focus:opacity-100 shrink-0",
                                copiedCode?.type === 'idaName' && copiedCode?.index === realIndex
                                  ? "bg-green-50 text-green-600"
                                  : "bg-white border border-[#3A2414]/5 text-[#3A2414]/40 hover:text-[#B32025] hover:border-[#B32025]/20 hover:bg-[#B32025]/5 shadow-sm"
                              )}
                              title="Copiar nome da Rota (Ida)"
                            >
                              {copiedCode?.type === 'idaName' && copiedCode?.index === realIndex ? (
                                <Check size={11} className="stroke-[3]" />
                              ) : (
                                <Clipboard size={11} />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Code Badge & Copy Code Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isEditing ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black uppercase text-[#B32025] tracking-widest">Código</span>
                          <input 
                            value={route.idaCod} 
                            onChange={(e) => updateRow(realIndex, 'idaCod', e.target.value)} 
                            className="w-20 bg-white p-2.5 rounded-xl border border-[#3A2414]/15 text-[11px] text-[#312c27] font-mono text-center focus:border-[#B32025] outline-none font-bold shadow-sm"
                            placeholder="----"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <div className="bg-[#FAF5F0] hover:bg-[#F2E8DE] text-[#3A2414] border border-[#3A2414]/10 px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-inner min-w-[70px] text-center transition-colors">
                            {route.idaCod || '—'}
                          </div>
                          {route.idaCod && (
                            <button
                              onClick={() => copyIndividualCode(route.idaCod, 'ida', realIndex)}
                              className={cn(
                                "w-8 h-8 flex items-center justify-center rounded-full transition-all shrink-0 cursor-pointer shadow-sm",
                                copiedCode?.type === 'ida' && copiedCode?.index === realIndex
                                  ? "bg-green-50 border border-green-200 text-green-600"
                                  : "bg-white border border-[#3A2414]/10 text-[#3A2414]/40 hover:text-[#B32025] hover:border-[#B32025]/30 hover:bg-[#B32025]/5"
                              )}
                              title="Copiar Código Ida"
                            >
                              {copiedCode?.type === 'ida' && copiedCode?.index === realIndex ? (
                                <Check size={12} className="stroke-[3]" />
                              ) : (
                                <Clipboard size={12} />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Remove button inside card, visible only if editing */}
                    {isEditing && (
                      <button 
                        onClick={() => removeRow(realIndex)} 
                        className="absolute -top-2 -left-2 w-6 h-6 flex items-center justify-center bg-red-100 hover:bg-red-200 border border-red-200 text-red-700 rounded-full transition-all cursor-pointer shadow-sm z-10"
                        title="Excluir trecho"
                      >
                        <X size={10} className="stroke-[2.5]" />
                      </button>
                    )}
                  </div>

                  {/* CARD RIGHT: VOLTA */}
                  <div className="flex items-center gap-4 bg-[#FCFBF8] hover:bg-[#F8F5F0] border border-[#3A2414]/10 rounded-[2rem] p-2 pr-4 shadow-[0_2px_8px_rgba(58,36,20,0.02)] hover:shadow-[0_4px_16px_rgba(58,36,20,0.06)] transition-all group/card relative w-full">
                    {/* Light beige button with left arrow (←) */}
                    <div className="w-10 h-10 bg-[#EEDBC5] text-[#3A2414] rounded-full flex items-center justify-center shrink-0 shadow-inner transition-transform duration-300 hover:scale-105 ml-1">
                      <ArrowRight size={16} className="stroke-[3] rotate-180" />
                    </div>

                    {/* Route Name Column */}
                    <div className="flex-1 min-w-0 pr-1">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-[#B32025] shrink-0" />
                          <input 
                            value={route.volta} 
                            onChange={(e) => updateRow(realIndex, 'volta', e.target.value)} 
                            className="w-full bg-white p-2.5 rounded-xl border border-[#3A2414]/15 text-xs text-[#3A2414] font-black focus:border-[#B32025] outline-none uppercase shadow-sm font-mono tracking-tight"
                            placeholder="ORIGEM X DESTINO"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[11px] lg:text-xs font-bold text-[#4a3322] uppercase tracking-wide break-words">
                            {route.volta || '---'}
                          </span>
                          {route.volta && (
                            <button
                              onClick={() => copyIndividualCode(route.volta, 'voltaName', realIndex)}
                              className={cn(
                                "w-7 h-7 flex items-center justify-center rounded-full transition-all cursor-pointer opacity-100 md:opacity-0 md:group-hover/card:opacity-100 focus:opacity-100 shrink-0",
                                copiedCode?.type === 'voltaName' && copiedCode?.index === realIndex
                                  ? "bg-green-50 text-green-600"
                                  : "bg-white border border-[#3A2414]/5 text-[#3A2414]/40 hover:text-[#B32025] hover:border-[#B32025]/20 hover:bg-[#B32025]/5 shadow-sm"
                              )}
                              title="Copiar nome da Rota (Volta)"
                            >
                              {copiedCode?.type === 'voltaName' && copiedCode?.index === realIndex ? (
                                <Check size={11} className="stroke-[3]" />
                              ) : (
                                <Clipboard size={11} />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Code Badge & Copy Code Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isEditing ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black uppercase text-[#B32025] tracking-widest">Código</span>
                          <input 
                            value={route.voltaCod} 
                            onChange={(e) => updateRow(realIndex, 'voltaCod', e.target.value)} 
                            className="w-20 bg-white p-2.5 rounded-xl border border-[#3A2414]/15 text-[11px] text-[#312c27] font-mono text-center focus:border-[#B32025] outline-none font-bold shadow-sm"
                            placeholder="----"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <div className="bg-[#FAF5F0] hover:bg-[#F2E8DE] text-[#3A2414] border border-[#3A2414]/10 px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-inner min-w-[70px] text-center transition-colors">
                            {route.voltaCod || '—'}
                          </div>
                          {route.voltaCod && (
                            <button
                              onClick={() => copyIndividualCode(route.voltaCod, 'volta', realIndex)}
                              className={cn(
                                "w-8 h-8 flex items-center justify-center rounded-full transition-all shrink-0 cursor-pointer shadow-sm",
                                copiedCode?.type === 'volta' && copiedCode?.index === realIndex
                                  ? "bg-green-50 border border-green-200 text-green-600"
                                  : "bg-white border border-[#3A2414]/10 text-[#3A2414]/40 hover:text-[#B32025] hover:border-[#B32025]/30 hover:bg-[#B32025]/5"
                              )}
                              title="Copiar Código Volta"
                            >
                              {copiedCode?.type === 'volta' && copiedCode?.index === realIndex ? (
                                <Check size={12} className="stroke-[3]" />
                              ) : (
                                <Clipboard size={12} />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {currentData.length === 0 && (
            <div className="p-20 text-center bg-white rounded-3xl border border-[#3A2414]/15">
              <Database className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-xs font-black text-stone-400 uppercase tracking-widest">Nenhuma rota encontrada para os filtros aplicados</p>
            </div>
          )}
        </div>

        {/* Destructive Action */}
        {isEditing && (
          <div className="mt-8 pt-8 border-t-2 border-[#3A2414]/10 flex justify-center">
            <button 
              onClick={clearAll} 
              className="px-6 py-3 bg-red-50 text-red-800 hover:bg-red-100 border-2 border-red-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm"
            >
              Resetar Base de Dados de Rotas
            </button>
          </div>
        )}
      </div>

      {/* Backup and Sync Modal Overlay */}
      <AnimatePresence>
        {isBackupOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] select-none">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#fdfcf9] border-4 border-[#3A2414] rounded-[2.5rem] w-full max-w-2xl  overflow-hidden relative shadow-2xl p-6 md:p-8 text-[#3A2414] max-h-[90vh] overflow-y-auto"
            >
              {/* Decorative corner accents */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#3A2414]/20 pointer-events-none" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#3A2414]/20 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#3A2414]/20 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#3A2414]/20 pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-[#3A2414]/10 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#3A2414] text-[#fdefd1] rounded-xl">
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-xl text-[#3A2414] leading-tight">Backup e Sincronização</h3>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider font-mono">Migração de Dados e Nuvem</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsBackupOpen(false)}
                  className="p-2 bg-stone-100 hover:bg-stone-200 text-[#3A2414] rounded-full transition-all border border-[#3A2414]/10 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-6">
                
                {/* Export Section */}
                <div className="space-y-3">
                  <h4 className="font-serif font-black text-sm text-[#3A2414] uppercase tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B32025]" />
                    Exportar Rotas Atuais
                  </h4>
                  <p className="text-xs text-[#3A2414]/80 font-medium">
                    Copie o código abaixo no seu computador com internet ou Vercel para carregar e transferir suas rotas editadas para outro dispositivo ou navegador.
                  </p>
                  
                  <div className="relative">
                    <div className="bg-[#3A2414]/5 pl-4 pr-32 py-3 rounded-2xl border border-[#3A2414]/15 font-mono text-[11px] font-bold overflow-x-auto whitespace-nowrap text-[#3A2414]/80 max-w-full">
                      {JSON.stringify(routes)}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 px-3.5 bg-[#3A2414] hover:bg-[#3A2414]/95 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check size={12} className="text-green-300" /> Copiado!
                        </>
                      ) : (
                        <>
                          <Clipboard size={12} /> Copiar Código
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Import Section */}
                <div className="space-y-3 pt-4 border-t border-[#3A2414]/10">
                  <h4 className="font-serif font-black text-sm text-[#3A2414] uppercase tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                    Importar ou Restaurar Rotas
                  </h4>
                  <p className="text-xs text-[#3A2414]/80 font-medium">
                    Cole o código de backup copiado de outro dispositivo no campo abaixo para restaurá-lo diretamente na nuvem:
                  </p>

                  <textarea 
                    value={backupText}
                    onChange={(e) => {
                      setBackupText(e.target.value);
                      if (backupStatus.message) setBackupStatus({ type: '', message: '' });
                    }}
                    placeholder='Cole aqui seu código JSON de backup... Ex: [{"ida": "ROTA A", "idaCod": "123", ...}]'
                    className="w-full h-24 bg-white border-2 border-[#3A2414]/15 focus:border-[#B32025] rounded-2xl p-4 text-[11px] font-mono font-bold text-[#3A2414] placeholder-stone-400 outline-none shadow-sm resize-none"
                  />

                  {/* Inline Status Message */}
                  {backupStatus.message && (
                    <div className={cn(
                      "p-4 rounded-xl text-xs font-bold border flex items-center gap-3",
                      backupStatus.type === 'success' 
                        ? "bg-green-50 border-green-200 text-green-800" 
                        : "bg-red-50 border-red-200 text-red-800"
                    )}>
                      {backupStatus.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
                      {backupStatus.message}
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={() => handleManualImport('merge')}
                      disabled={!backupText.trim()}
                      className={cn(
                        "px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm border border-[#3A2414] cursor-pointer transition-all",
                        backupText.trim()
                          ? "bg-[#3A2414] hover:brightness-110 text-white"
                          : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                      )}
                    >
                      Mesclar com Base
                    </button>
                    <button
                      onClick={() => handleManualImport('replace')}
                      disabled={!backupText.trim()}
                      className={cn(
                        "px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm border-2 border-[#3A2414]/20 cursor-pointer transition-all",
                        backupText.trim()
                          ? "bg-[#B32025] hover:brightness-110 text-white"
                          : "bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed"
                      )}
                    >
                      Sobrescrever Tudo
                    </button>
                  </div>
                </div>

              </div>

              {/* Info Tip footer */}
              <div className="mt-8 pt-4 border-t-2 border-[#3A2414]/10 bg-[#3A2414]/5 p-4 rounded-2xl flex items-start gap-3">
                <span className="text-xs">💡</span>
                <p className="text-[10px] text-stone-600 font-medium leading-normal">
                  Ao atualizar e sincronizar do site Vercel, o banco de dados Realtime Database unificado é alimentado na nuvem. Suas alterações estarão seguras e prontas para uso em celulares, tablets ou qualquer outro dispositivo instantaneamente.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Status Indicator - Styled as an extraction badge */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-[#3A2414]/90 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full shadow-lg z-50">
        <div className="relative">
          <div className="absolute inset-0 bg-[#B32025] blur shadow-[0_0_10px_#B32025]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#B32025] relative z-10" />
        </div>
        <span className="text-[10px] font-black text-white uppercase tracking-widest font-mono">Torra e Rastreio Ativo</span>
      </div>
    </div>
  );
}
