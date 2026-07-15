import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Coffee, 
  Users,
  ChevronUp,
  Heart,
  Calendar,
  Camera,
  LayoutGrid,
  Briefcase,
  User,
  Plus,
  Trash2,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { rtdb as db } from '../firebase';
import { ref, onValue, set, update } from 'firebase/database';

function Screw({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "w-4 h-4 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_2px_2px_rgba(0,0,0,0.65),inset_0.5px_0.5px_1px_rgba(255,255,255,0.25)] relative flex items-center justify-center select-none shrink-0",
        className
      )}
    >
      <div className="w-2.5 h-[1.5px] bg-[#311b09]/80 rotate-[35deg] rounded-sm shadow-inner" />
    </div>
  );
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  title: string;
  type: 'pessoal' | 'corporativo';
}

interface PresenceListProps {
  onBack?: () => void;
}

export default function PresenceList({ onBack }: PresenceListProps) {
  const getTodayStr = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [profileImage, setProfileImage] = useState('/images/avatar.jpg');
  const [viewDate, setViewDate] = useState<Date>(() => {
    return new Date();
  });

  const [dayStatuses, setDayStatuses] = useState<Record<string, 'trabalhei' | 'falta' | 'folga' | ''>>({});
  const [dayTimes, setDayTimes] = useState<Record<string, { entrada: string; saida: string }>>({});
  const [escalaConfig, setEscalaConfig] = useState<{ enabled: boolean; startDate: string }>({
    enabled: true,
    startDate: '2026-06-14',
  });
  const [bancoHorasManual, setBancoHorasManual] = useState<number>(0);
  const [isEditingBankCard, setIsEditingBankCard] = useState(false);
  const [tempHours, setTempHours] = useState('');
  const [tempMins, setTempMins] = useState('');

  const [appointments, setAppointments] = useState<Record<string, Appointment>>({});
  const [newAppTitle, setNewAppTitle] = useState('');
  const [newAppTime, setNewAppTime] = useState('12:00');
  const [newAppType, setNewAppType] = useState<'pessoal' | 'corporativo'>('corporativo');
  const [showAllAppsDropdown, setShowAllAppsDropdown] = useState(false);

  useEffect(() => {
    const presenceRef = ref(db, 'presence_list');
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.statuses) setDayStatuses(data.statuses);
        if (data.times) setDayTimes(data.times);
        if (data.profileImage) setProfileImage(data.profileImage);
        if (data.escalaConfig) {
          setEscalaConfig(data.escalaConfig);
        }
        if (data.bancoHorasManual !== undefined && typeof data.bancoHorasManual === 'number') {
          setBancoHorasManual(data.bancoHorasManual);
        }
        if (data.appointments) {
          setAppointments(data.appointments);
        } else {
          setAppointments({});
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const updateEscalaConfig = (config: { enabled: boolean; startDate: string }) => {
    setEscalaConfig(config);
    set(ref(db, 'presence_list/escalaConfig'), config);
  };

  const updateBancoHorasManual = (minutes: number) => {
    setBancoHorasManual(minutes);
    set(ref(db, 'presence_list/bancoHorasManual'), minutes);
  };

  const getDaysDifference = (dateStr1: string, dateStr2: string): number => {
    if (!dateStr1 || !dateStr2) return 0;
    const d1 = new Date(dateStr1 + 'T12:00:00');
    const d2 = new Date(dateStr2 + 'T12:00:00');
    const diffTime = d1.getTime() - d2.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const isAutomaticWorkDay = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const isEnabled = escalaConfig.enabled !== false;
    if (!isEnabled) return false;
    const refDate = escalaConfig.startDate || '2026-06-14';
    const diff = getDaysDifference(dateStr, refDate);
    return Math.abs(diff) % 2 === 0;
  };

  const updateStatus = (date: string, status: 'trabalhei' | 'falta' | 'folga' | '') => {
    setDayStatuses(prev => ({ ...prev, [date]: status }));
    update(ref(db, 'presence_list/statuses'), { [date]: status });
  };

  const updateTime = (date: string, times: { entrada: string; saida: string }) => {
    setDayTimes(prev => ({ ...prev, [date]: times }));
    update(ref(db, 'presence_list/times'), { [date]: times });
  };

  const updateProfileImage = (url: string) => {
    setProfileImage(url);
    set(ref(db, 'presence_list/profileImage'), url);
  };

  const addAppointment = (time: string, title: string, type: 'pessoal' | 'corporativo') => {
    if (!title.trim() || !time) return;
    const id = `app_${Date.now()}`;
    const newApp: Appointment = { id, date: selectedDate, time, title, type };
    update(ref(db, `presence_list/appointments`), { [id]: newApp });
    setNewAppTitle('');
  };

  const deleteAppointment = (id: string) => {
    update(ref(db, `presence_list/appointments`), { [id]: null });
  };

  // Convert time "HH:MM" to minutes from midnight
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return 0;
    return h * 60 + m;
  };

  // Convert minutes back to pretty string representation
  const formatBalanceMinutes = (totalMinutes: number): string => {
    const sign = totalMinutes >= 0 ? '+' : '-';
    const absMinutes = Math.abs(totalMinutes);
    const hrs = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    return `${sign}${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
  };

  // Calculate day bank-of-hours balance based on rules
  const calculateDayBalance = (dateStr: string, status: string, entradaStr: string, saidaStr: string) => {
    if (status !== 'trabalhei') {
      return { total: 0, entradaDiff: 0, saidaDiff: 0, entradaStatus: 'none', saidaStatus: 'none' as 'none' | 'positivo' | 'negativo' };
    }

    const entrada = entradaStr || '18:00';
    const saida = saidaStr || '06:00';

    const entMin = timeToMinutes(entrada);
    const saiMin = timeToMinutes(saida);

    const targetEntMin = 18 * 60; // 1080 min (18:00)
    const targetSaiMin = 6 * 60;  // 360 min (06:00)

    let entradaDiff = 0;
    let entradaStatus: 'positivo' | 'negativo' | 'none' = 'none';

    let saidaDiff = 0;
    let saidaStatus: 'positivo' | 'negativo' | 'none' = 'none';

    // Rule 1: "se eu bater ponto antes das 18:06 irar negativo para o banco de horas"
    // Rule 4: "se eu bater ponto antes 17:54 irar positivo para o banco de horas"
    if (entMin < 17 * 60 + 54) { // Before 17:54 (early arrival)
      entradaDiff = targetEntMin - entMin; // Extra early minutes
      entradaStatus = 'positivo';
    } else if (entMin < 18 * 60 + 6) { // Between 17:54 and 18:06 (late/regular window)
      if (entMin < targetEntMin) {
        // Handled as penalty for not arriving sufficiently early, as requested
        entradaDiff = -10; 
      } else {
        // Late arrival
        entradaDiff = targetEntMin - entMin;
      }
      entradaStatus = 'negativo';
    } else {
      // Arrived after 18:06 (Definitely late)
      entradaDiff = targetEntMin - entMin;
      entradaStatus = 'negativo';
    }

    // Rule 2: "se eu bater ponto antes 05:56 irar negativo para o banco de horas"
    // Rule 3: "se eu bater ponto antes 06:06 irar positivo para o banco de horas"
    if (saiMin < 5 * 60 + 56) { // Before 05:56
      saidaDiff = saiMin - targetSaiMin; // Left early (negative)
      saidaStatus = 'negativo';
    } else if (saiMin < 6 * 60 + 6) { // Between 05:56 and 06:06 (positive zone)
      if (saiMin < targetSaiMin) {
        saidaDiff = 5; // Positive incentive bonus
      } else {
        saidaDiff = saiMin - targetSaiMin; // Overtime
      }
      saidaStatus = 'positivo';
    } else {
      // After 06:06 (standard positive overtime)
      saidaDiff = saiMin - targetSaiMin;
      saidaStatus = 'positivo';
    }

    return {
      total: entradaDiff + saidaDiff,
      entradaDiff,
      saidaDiff,
      entradaStatus,
      saidaStatus
    };
  };

  const calculateTotalBankOfHours = () => {
    let total = 0;
    Object.keys(dayStatuses).forEach(dateStr => {
      if (dayStatuses[dateStr] === 'trabalhei') {
        const times = dayTimes[dateStr] || { entrada: '18:00', saida: '06:00' };
        const bal = calculateDayBalance(dateStr, 'trabalhei', times.entrada, times.saida);
        total += bal.total;
      }
    });
    return total + (bancoHorasManual || 0);
  };

  const totalBankOfHours = calculateTotalBankOfHours();

  const getActiveMonthStats = () => {
    let presentes = 0;
    let faltas = 0;
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}-${month}`;

    Object.keys(dayStatuses).forEach(dateStr => {
      if (dateStr.startsWith(prefix)) {
        if (dayStatuses[dateStr] === 'trabalhei') presentes++;
        if (dayStatuses[dateStr] === 'falta') faltas++;
      }
    });

    return { presentes, faltas };
  };

  const { presentes, faltas } = getActiveMonthStats();

  const formatLocalDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} - ${formatted}`;
  };

  // viewDate state moved to the top of component to resolve initialization order conflicts

  const getHolidayForDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length < 3) return null;
    const mmdd = `${parts[1]}-${parts[2]}`;

    const annualHolidays: { [key: string]: string } = {
      '01-01': 'Confraternização Universal',
      '04-21': 'Tiradentes',
      '05-01': 'Dia do Trabalho',
      '09-07': 'Independência do Brasil',
      '10-12': 'Nossa Senhora Aparecida',
      '11-02': 'Finados',
      '11-15': 'Proclamação da República',
      '11-20': 'Dia da Consciência Negra',
      '12-25': 'Natal'
    };

    const specificHolidays: { [key: string]: string } = {
      '2026-06-04': 'Corpus Christi',
      '2025-06-19': 'Corpus Christi',
      '2027-05-27': 'Corpus Christi'
    };

    if (specificHolidays[dateStr]) {
      return { date: dateStr, name: specificHolidays[dateStr] };
    }
    if (annualHolidays[mmdd]) {
      return { date: dateStr, name: annualHolidays[mmdd] };
    }
    return null;
  };

  const currentHoliday = getHolidayForDate(selectedDate);
  const isHoliday = !!currentHoliday;

  const currentStatus = dayStatuses[selectedDate] || '';
  const isSelectedWorkDay = currentStatus === 'trabalhei';

  const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  // Generate dynamic calendar days grid for any selected month/year
  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: { day: number; inactive?: boolean; dateStr: string }[] = [];

    // Fill previous month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDay = prevMonthTotalDays - i;
      const prevMonthDate = new Date(year, month - 1, prevDay);
      const dateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(prevMonthDate.getDate()).padStart(2, '0')}`;
      days.push({
        day: prevDay,
        inactive: true,
        dateStr
      });
    }

    // Fill current month days
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i,
        dateStr
      });
    }

    // Fill next month days to make grid have standard size (35 or 42 cells)
    const totalCellsNeeded = days.length <= 35 ? 35 : 42;
    const remaining = totalCellsNeeded - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonthDate = new Date(year, month + 1, i);
      const dateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(nextMonthDate.getDate()).padStart(2, '0')}`;
      days.push({
        day: i,
        inactive: true,
        dateStr
      });
    }

    const weeks: { day: number; inactive?: boolean; dateStr: string }[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  };

  const calendarDays = generateCalendarDays();

  const handlePrevMonth = () => {
    setViewDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setViewDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const monthNames = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];
  const currentMonthLabel = `${monthNames[viewDate.getMonth()]} / ${viewDate.getFullYear()}`;

  const getHolidaysForView = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1;
    const list: { date: string; name: string }[] = [];
    
    const totalDays = new Date(year, month, 0).getDate();
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const holiday = getHolidayForDate(dateStr);
      if (holiday) {
        list.push(holiday);
      }
    }
    
    if (list.length === 0) {
      return [
        { date: `${year}-01-01`, name: 'Confraternização Universal' },
        { date: `${year}-05-01`, name: 'Dia do Trabalho' },
        { date: `${year}-09-07`, name: 'Independência do Brasil' },
        { date: `${year}-12-25`, name: 'Natal' }
      ];
    }
    return list;
  };

  const activeHolidaysList = getHolidaysForView();

  const allAppointments = (Object.values(appointments || {}) as Appointment[])
    .filter(app => app && app.date)
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.time.localeCompare(b.time);
    });

  return (
    <div className="w-full relative z-10 max-w-[96rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch font-sans">
      
      {/* Left Column (Card) */}
      <div className="hidden">
        <div className="rounded-3xl bg-[#1d1008] border border-[#a27a5d]/30 shadow-2xl overflow-hidden relative flex flex-col h-full ring-4 ring-[#1d1008]/50 outline outline-1 outline-[#a27a5d]/20">
          
          {/* Inner padded container for top content */}
          <div className="p-6 pb-4">
            {/* Header: Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#B32025] border-2 border-[#D4AF37] flex items-center justify-center shrink-0 relative shadow-lg">
                {/* Simulated 3 Corações Logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart size={24} className="text-[#D4AF37] fill-[#D4AF37]" />
                </div>
                <div className="absolute inset-1 border-[1px] border-dashed border-[#D4AF37]/50 rounded-full" />
                <span className="absolute bottom-2 text-[6px] font-bold text-[#D4AF37] tracking-widest mt-4">3 CORAÇÕES</span>
              </div>
              <div>
                <h2 className="text-white font-serif text-2xl tracking-wide font-bold">LISTA DE PRESENÇA</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  <span className="text-[#a27a5d] text-[10px] font-bold tracking-widest uppercase">MÓDULO ATIVO</span>
                </div>
              </div>
            </div>

            {/* Gold Ribbon Label */}
            <div className="mt-6 bg-gradient-to-r from-[#996b42] to-[#bfa16a] text-white py-3 px-4 rounded-xl text-center shadow-[0_4px_15px_rgba(0,0,0,0.5)] border border-[#e4c28c]/40 font-semibold tracking-widest text-[11px] uppercase">
              Café 3 Corações Edição Rústica Sofisticada
            </div>
          </div>

          {/* Representative Center Image scaled down to match user photo size */}
          <div className="py-4 flex justify-center bg-[#1d1008]">
             <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#a27a5d]/40 shadow-lg relative group bg-[#e2cfb9] shrink-0">
               <img 
                 src="/images/top.jpg" 
                 alt="Grãos de Café" 
                 className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
             </div>
          </div>

          {/* Bottom Info Section */}
          <div className="p-6 pt-2 bg-[#1d1008] z-10 flex flex-col justify-end">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[#8c6b4e] text-xs font-mono font-bold tracking-widest uppercase">Lote #3708B</span>
              <span className="text-[#a27a5d] font-handwritten text-xl opacity-90 hidden sm:block font-serif italic">Qualidade Premium</span>
            </div>
            
            <h3 className="text-white text-2xl font-bold font-serif mb-3 tracking-wide">SACO DE JUTA</h3>
            <p className="text-stone-400 text-xs leading-relaxed max-w-[90%] mb-6 font-light">
              Uma edição especial e limitada, aprimorada naturalmente, torrada com maestria para momentos que pedem presença.
            </p>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <button className="bg-[#B32025] hover:bg-[#8c060a] text-white text-[10px] font-bold uppercase tracking-wider py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg outline-none cursor-pointer">
                <Coffee size={14} className="fill-current" />
                SÓ BOAS VIBRAÇÕES
              </button>
              <button className="bg-[#593d2b] hover:bg-[#4a3222] text-[#e8dbcc] border border-[#7a5b44] text-[10px] font-bold uppercase tracking-wider py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg outline-none cursor-pointer">
                <Coffee size={14} />
                DETALHES DO CAFÉ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Main App Panel) */}
      <div className="col-span-1 lg:col-span-12 flex flex-col">
        <div className="flex-1 rounded-3xl bg-[#efdfc6] border-2 border-[#5c3e29] shadow-2xl relative overflow-visible flex flex-col"
             style={{
               backgroundImage: 'linear-gradient(135deg, rgba(239, 223, 198, 1) 0%, rgba(226, 207, 178, 1) 100%)',
             }}
        >
          {/* Inner border trim */}
          <div className="absolute inset-1.5 rounded-[1.35rem] border border-[#a6866b]/40 pointer-events-none z-0" />
          
          {/* Main Padding Container */}
          <div className="p-4 sm:p-6 relative z-10 flex flex-col h-full gap-5">
            {onBack && (
              <button 
                onClick={onBack}
                className="md:hidden flex items-center justify-center gap-2 w-full bg-[#1c1008] hover:bg-[#2c1a11] text-[#efdfc6] py-3.5 rounded-2xl font-black text-xs transition-all border border-[#5c3e29] shadow-md mb-2 cursor-pointer"
              >
                <LayoutGrid size={16} className="text-[#bf9663]" />
                <span>Voltar ao Menu Inicial</span>
              </button>
            )}
            
            {/* Top Area: Splitted into Left (Profile) and Right (Image + Titles) */}
            <div className="flex flex-col md:flex-row gap-5">
              
              {/* Left Col: Profile Image card */}
              <div className="w-24 h-24 md:w-[30%] md:h-auto rounded-full md:rounded-xl mx-auto md:mx-0 relative group border-2 border-[#5c3e29] overflow-hidden shrink-0 shadow-md bg-[#e2cfb9]">
                <img 
                  src={profileImage}
                  alt="Perfil" 
                  className="w-full h-full md:h-auto object-cover block"
                  referrerPolicy="no-referrer"
                />
                
                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-[#3A2414]/60 flex-col items-center justify-center gap-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex text-[#e2cfb9]">
                  <Camera size={24} />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Alterar Foto</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target && typeof event.target.result === 'string') {
                            updateProfileImage(event.target.result);
                          }
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }} 
                  />
                </label>
              </div>

              {/* Right Col: Banner Image + Headers */}
              <div className="flex-1 flex flex-col justify-between pt-0.5">
                
                {/* 4K Image Banner (Aesthetic from Initial Menu) */}
                <div className="w-full flex-1 max-h-[160px] min-h-[100px] mb-2 rounded-xl overflow-hidden border-2 border-[#5c3e29]/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] relative group hidden md:block">
                  <img 
                    src="/images/banner_coffee.jpg"
                    alt="Coffee Aesthetic Header"
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 filter sepia-[20%] contrast-[1.1] brightness-90 relative z-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 shadow-[inset_0_0_25px_rgba(0,0,0,0.5)] pointer-events-none z-10" />
                </div>

                {/* Inspirational Phrase */}
                <p className="w-full text-[#3d2415] font-serif italic text-sm text-center mb-4 leading-snug px-4">
                  "Seja inquieto, curioso e criativo. Transforme necessidades em oportunidades. Teste e aprenda rápido, gerando e adaptando ideias. Empreenda a fim de gerar valor para o negócio. Seja um agente de transformação!"
                </p>

                {/* Bottom of Right Col: Texts + Black Tag */}
                <div className="flex items-end justify-between">
                  {/* Title texts */}
                  <div className="pb-1">
                    <span className="text-[#5c3e29] font-bold text-[11px] tracking-widest uppercase block mb-1">
                      Lista Ativa de Atendimento
                    </span>
                    <h1 className="text-3xl font-black text-[#3A2414] font-serif uppercase tracking-tight">
                      ESCALA: <span className="text-[#B32025]">{selectedDate.split('-').reverse().join('/')}</span>
                    </h1>
                  </div>

                  {/* Black tag: Feito com paixão */}
                  <div className="hidden md:flex bg-[#18110b] border-[3px] border-[#5c3e29] rounded-2xl p-4 px-6 items-center justify-center gap-5 shadow-[0_4px_10px_rgba(0,0,0,0.4)] relative">
                    {/* Screw holes */}
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                    <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-stone-500/50 border border-black/80" />
                    
                    <div className="w-10 h-10 rounded-xl bg-transparent border border-[#cfab84]/50 flex items-center justify-center">
                      <Coffee className="text-[#cfab84]" size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-handwritten text-[#e5d5c1] text-xl font-bold leading-none mb-1">Feito com paixão.</span>
                      <span className="font-handwritten text-[#e5d5c1]/70 text-sm font-medium leading-none">Para quem entrega.</span>
                      <div className="flex gap-1.5 mt-2">
                        <span className="w-1 h-1 rounded-full bg-[#bf9663]" />
                        <span className="w-1 h-1 rounded-full bg-[#bf9663]" />
                        <span className="w-1 h-1 rounded-full bg-[#bf9663]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Input Filter & Ribbon row */}
            <div className="flex flex-col gap-2">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="text"
                  placeholder="Filtrar colaboradores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#d6be9c] rounded-xl py-3 pl-12 pr-4 text-sm text-[#3A2414] placeholder-stone-400 outline-none focus:border-[#B32025] shadow-inner font-medium"
                />
              </div>

              {/* Status Ribbon (Feriado Nacional / Time) */}
              <div className="flex items-center justify-between bg-[#f8f1e5] border border-[#e1ccb0] rounded-xl px-4 py-2.5 shadow-sm">
                <div className="flex items-center gap-2">
                  {isHoliday ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8b5a2b]" />
                      <span className="text-xs font-bold text-[#5c3e29] uppercase tracking-wide">{currentHoliday.name}</span>
                    </>
                  ) : currentStatus === 'trabalhei' ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#B32025]" />
                      <span className="text-xs font-bold text-[#5c3e29] uppercase tracking-wide">Dia de Trabalho (12x36)</span>
                    </>
                  ) : currentStatus === 'falta' ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                      <span className="text-xs font-bold text-[#5c3e29] uppercase tracking-wide">Falta Registrada</span>
                    </>
                  ) : currentStatus === 'folga' ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                      <span className="text-xs font-bold text-[#5c3e29] uppercase tracking-wide">Dia de Folga</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">Aguardando Registro</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-4 text-[#9a785c]">
                  <div className="flex items-center gap-1.5 bg-[#e1ccb0]/50 px-2.5 py-1 rounded text-[10px] font-bold">
                    ESCALA 12x36
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span className="text-xs font-mono font-bold">18:00 - 06:00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 2-Panel Area */}
            <div className="flex flex-col md:flex-row gap-5 flex-1 min-h-0 pt-2">
              
              {/* Left Inner: Calendar */}
              <div className="w-full md:w-[48%] md:max-w-[340px] md:self-start flex flex-col shrink-0 rounded-3xl overflow-hidden border border-[#eedecb] shadow-xl bg-gradient-to-b from-[#fffbf7] to-[#FAF6ED]">
                
                {/* Calendar Header with premium brand look */}
                <div className="bg-[#1c1008] text-white flex items-center justify-between py-3 px-4 select-none shadow-sm relative">
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-[#dfc2a1]/20" />
                  <button onClick={handlePrevMonth} className="text-[#dfc2a1] hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer p-1 rounded-full hover:bg-white/10"><ChevronLeft size={18} /></button>
                  <span className="text-xs sm:text-sm font-black tracking-[0.15em] uppercase font-sans text-white">{currentMonthLabel}</span>
                  <button onClick={handleNextMonth} className="text-[#dfc2a1] hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer p-1 rounded-full hover:bg-white/10"><ChevronRight size={18} /></button>
                </div>

                {/* Calendar Grid Container */}
                <div className="p-4 py-3 flex flex-col">
                  {/* Days of week header with refined spacing */}
                  <div className="grid grid-cols-7 mb-3 py-1">
                    {daysOfWeek.map(d => (
                       <div key={d} className="text-center text-[10px] font-black tracking-wider text-[#a27a5d] uppercase">{d}</div>
                    ))}
                  </div>
                  
                  {/* Days cells with premium minimalist circular aesthetic */}
                  <div className="grid grid-cols-7 gap-y-1.5 gap-x-1 py-1">
                    {calendarDays.map((week, wIdx) => (
                      week.map((d, dIdx) => {
                        const isSelected = selectedDate === d.dateStr;
                        const status = dayStatuses[d.dateStr] || '';
                        const isAutoWork = !d.inactive && isAutomaticWorkDay(d.dateStr);
                        const isAutoRest = !d.inactive && escalaConfig.enabled && !isAutoWork;
                        
                        // Setup premium minimalist circular classes
                        let cellStyle = 'relative flex flex-col items-center justify-center cursor-pointer select-none aspect-square rounded-full transition-all duration-200 w-9 h-9 md:w-10 md:h-10 mx-auto';
                        let fontStyle = 'font-sans text-xs sm:text-sm font-bold';

                        if (isSelected && !d.inactive) {
                          cellStyle += ' border-2 border-[#b8956c] bg-transparent';
                          fontStyle += ' text-[#3e2516]';
                        } else if (d.inactive) {
                          fontStyle += ' text-stone-300 opacity-40 pointer-events-none';
                        } else {
                          cellStyle += ' hover:bg-[#f4ebdc]/50';
                          fontStyle += ' text-[#4e341f]';
                        }

                        const showWorkLine = !d.inactive && (status === 'trabalhei' || (status === '' && isAutoWork));
                        const showFaltaLine = !d.inactive && status === 'falta';
                        const showFolgaLine = !d.inactive && (status === 'folga' || (status === '' && isAutoRest));

                        return (
                          <div 
                            key={`${wIdx}-${dIdx}`} 
                            onClick={() => {
                              setSelectedDate(d.dateStr);
                              if (d.inactive) {
                                setViewDate(new Date(d.dateStr));
                              }
                            }}
                            className="flex items-center justify-center py-0.5"
                          >
                            <div className={cellStyle}>
                              <span className={fontStyle}>
                                {d.day}
                              </span>
                              
                              {/* Indicadores de compromisso (pontinhos coloridos) */}
                              {!d.inactive && (() => {
                                const dayApps = (Object.values(appointments || {}) as Appointment[]).filter(app => app && app.date === d.dateStr);
                                const hasPersonal = dayApps.some(app => app && app.type === 'pessoal');
                                const hasCorporate = dayApps.some(app => app && app.type === 'corporativo');
                                if (dayApps.length === 0) return null;
                                return (
                                  <div className="absolute top-1 right-1 flex gap-0.5">
                                    {hasPersonal && (
                                      <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" title="Compromisso Pessoal" />
                                    )}
                                    {hasCorporate && (
                                      <span className="w-1.5 h-1.5 bg-[#B32025] rounded-full" title="Compromisso Corporativo" />
                                    )}
                                  </div>
                                );
                              })()}
                              
                              {/* Horizontal green line indicator for work days, red for absence, gold for rest */}
                              {showWorkLine && (
                                <div className="absolute bottom-[2.5px] w-4.5 h-[3.5px] bg-[#10b981] rounded-full animate-pulse" title="Dia Trabalhado" />
                              )}
                              {showFaltaLine && (
                                <div className="absolute bottom-[2.5px] w-4.5 h-[3.5px] bg-red-500 rounded-full" title="Falta" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    ))}
                  </div> {/* Days cells */}
                </div> {/* Calendar Grid */}
              </div> {/* Left Inner: Calendar */}

              {/* Right Inner: Stats & Interactive Controls */}
              <div className="flex flex-col flex-1 gap-4 relative min-h-[300px] w-full">
                
                {/* AGENDA DE COMPROMISSOS (Novo Módulo Solicitado) */}
                <div className="bg-[#fdfbf7] border-2 border-[#5c3e29] rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[#e1ccb0] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-[#B32025] text-white p-2 rounded-xl shadow-md">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#3e2516] uppercase tracking-widest leading-tight">Agenda de Compromissos</h3>
                        <p className="text-[11px] text-[#8c6b4e] font-mono leading-none mt-0.5">
                          Visualizando: <strong className="text-[#3e2516]">{selectedDate.split('-').reverse().join('/')}</strong>
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-[#5c3e29] text-[#efdfc6] px-2.5 py-1 rounded-lg uppercase tracking-wide">
                      Diário
                    </span>
                  </div>

                  {/* Form to Add Appointment */}
                  <div className="bg-[#fcfaf4] border border-[#d6be9c]/75 rounded-xl p-3.5 flex flex-col gap-3">
                    <span className="text-[10px] font-black text-[#5c3e29] uppercase tracking-wider block">Novo Compromisso</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                      
                      {/* Name/Title Input */}
                      <div className="sm:col-span-6">
                        <input
                          type="text"
                          placeholder="Ex: Reunião com gerência, Café, Almoço..."
                          value={newAppTitle}
                          onChange={(e) => setNewAppTitle(e.target.value)}
                          className="w-full bg-white border border-[#dac0a3] text-xs font-semibold rounded-lg p-2.5 outline-none text-[#3e2516] focus:border-[#B32025] shadow-inner placeholder-stone-400"
                        />
                      </div>

                      {/* Time Input */}
                      <div className="sm:col-span-3">
                        <input
                          type="time"
                          value={newAppTime}
                          onChange={(e) => setNewAppTime(e.target.value)}
                          className="w-full bg-white border border-[#dac0a3] text-xs font-mono font-bold rounded-lg p-2 outline-none text-[#3e2516] focus:border-[#B32025] shadow-inner"
                        />
                      </div>

                      {/* Add Button for mobile/desktop layout flexibility */}
                      <div className="sm:col-span-3">
                        <button
                          onClick={() => addAppointment(newAppTime, newAppTitle, newAppType)}
                          disabled={!newAppTitle.trim()}
                          className={`w-full text-[10px] font-black uppercase py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all
                            ${newAppTitle.trim() 
                              ? 'bg-[#B32025] hover:bg-[#8c060a] text-white active:scale-97 cursor-pointer' 
                              : 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-60'
                            }`}
                        >
                          <Plus size={14} />
                          Salvar
                        </button>
                      </div>

                    </div>

                    {/* Selector for Type: Pessoal vs Corporativo */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-[#f4ebdc]">
                      <span className="text-[9.5px] font-bold text-[#8c6b4e] uppercase tracking-wider">Tipo do Compromisso:</span>
                      
                      <div className="flex gap-2">
                        {/* Pessoal Button */}
                        <button
                          onClick={() => setNewAppType('pessoal')}
                          type="button"
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border
                            ${newAppType === 'pessoal'
                              ? 'bg-[#d97706] text-white border-[#d97706] shadow-sm'
                              : 'bg-white text-stone-600 border-[#d6be9c] hover:bg-stone-50'
                            }`}
                        >
                          <User size={13} />
                          <span>Pessoal</span>
                        </button>

                        {/* Corporativo Button */}
                        <button
                          onClick={() => setNewAppType('corporativo')}
                          type="button"
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border
                            ${newAppType === 'corporativo'
                              ? 'bg-[#B32025] text-white border-[#B32025] shadow-sm'
                              : 'bg-white text-stone-600 border-[#d6be9c] hover:bg-stone-50'
                            }`}
                        >
                          <Briefcase size={13} />
                          <span>Corporativo</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Appointments List for Selected Date */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-[#5c3e29] uppercase tracking-wider block">Compromissos Agendados</span>
                    
                    {(() => {
                      const dayApps = (Object.values(appointments || {}) as Appointment[])
                        .filter(app => app && app.date === selectedDate)
                        .sort((a, b) => a.time.localeCompare(b.time));

                      if (dayApps.length === 0) {
                        return (
                          <div className="bg-[#fcfcf9]/50 border border-dashed border-[#d6be9c]/60 rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2">
                            <Clock size={24} className="text-[#a27a5d] opacity-50" />
                            <p className="text-xs font-medium text-stone-500">
                              Nenhum compromisso agendado para hoje.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                          {dayApps.map((app) => (
                            <div 
                              key={app.id} 
                              className="bg-white border border-[#e1ccb0]/80 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all duration-200 group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Time Badge */}
                                <div className="bg-[#FAF6ED] border border-[#d6be9c] rounded-lg px-2 py-1 flex items-center gap-1 shrink-0 font-mono text-xs font-bold text-[#3e2516]">
                                  <Clock size={12} className="text-[#8c6b4e]" />
                                  {app.time}
                                </div>

                                <div className="flex flex-col gap-0.5 min-w-0">
                                  <span className="text-xs font-bold text-[#3e2516] break-words leading-snug">
                                    {app.title}
                                  </span>
                                  {/* Type tag */}
                                  <div className="flex items-center gap-1 mt-0.5">
                                    {app.type === 'pessoal' ? (
                                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50 flex items-center gap-1">
                                        <User size={9} />
                                        Pessoal
                                      </span>
                                    ) : (
                                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#B32025] bg-red-50 px-1.5 py-0.5 rounded border border-red-200/50 flex items-center gap-1">
                                        <Briefcase size={9} />
                                        Corporativo
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Delete Action */}
                              <button
                                onClick={() => deleteAppointment(app.id)}
                                className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer opacity-80 group-hover:opacity-100 shrink-0"
                                title="Excluir compromisso"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                </div>
                
                {/* 3 Stat Boxes Top row */}
                {false && (
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="bg-[#fdfbf7] rounded-xl border border-[#d6be9c] flex flex-col items-center justify-center py-2.5 sm:py-3 shadow-sm text-center">
                    <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-[#2e7d32] uppercase mb-1">Presentes</span>
                    <span className="text-xl sm:text-2xl font-black text-[#2e7d32] leading-none mb-1">{presentes}</span>
                    <span className="text-[7px] sm:text-[8px] font-medium text-stone-500 uppercase">este mês</span>
                  </div>
                  <div className="bg-[#fdfbf7] rounded-xl border border-[#d6be9c] flex flex-col items-center justify-center py-2.5 sm:py-3 shadow-sm text-center">
                    <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-[#c62828] uppercase mb-1">Faltas</span>
                    <span className="text-xl sm:text-2xl font-black text-[#c62828] leading-none mb-1">{faltas}</span>
                    <span className="text-[7px] sm:text-[8px] font-medium text-stone-500 uppercase">registradas</span>
                  </div>
                  {isEditingBankCard ? (
                    <div className="bg-[#fcf8f2] rounded-xl border-2 border-[#B32025] flex flex-col items-center justify-between p-1.5 shadow-md text-center">
                      <span className="text-[8.5px] font-black tracking-wider text-[#B32025] uppercase mb-1 leading-none">Ajustar Saldo</span>
                      
                      {/* Compact Inputs For Hours and Minutes */}
                      <div className="flex items-center justify-center gap-1 mb-1.5">
                        <div className="flex flex-col items-center">
                          <input
                            type="text"
                            placeholder="H"
                            value={tempHours}
                            onChange={(e) => setTempHours(e.target.value)}
                            className="w-10 bg-white border border-[#dac0a3] text-[9.5px] font-mono font-bold rounded py-0.5 text-center text-[#3e2516] outline-none shadow-inner"
                            title="Ex: 10 ou -5"
                          />
                        </div>
                        <span className="text-xs font-bold text-[#8c6b4e]">:</span>
                        <div className="flex flex-col items-center">
                          <input
                            type="text"
                            placeholder="M"
                            value={tempMins}
                            onChange={(e) => setTempMins(e.target.value)}
                            className="w-7 bg-white border border-[#dac0a3] text-[9.5px] font-mono font-bold rounded py-0.5 text-center text-[#3e2516] outline-none shadow-inner"
                            title="Ex: 30"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 justify-center w-full">
                        <button
                          onClick={() => {
                            const hrs = parseInt(tempHours) || 0;
                            const mins = parseInt(tempMins) || 0;
                            
                            // Check sign of input
                            const hasMinus = tempHours.includes('-') || tempMins.includes('-');
                            const totalMinsInput = (hasMinus ? -1 : 1) * (Math.abs(hrs) * 60 + Math.abs(mins));

                            // Calculate original automatic balance
                            let currentAutoBalance = 0;
                            Object.keys(dayStatuses).forEach(dateStr => {
                              if (dayStatuses[dateStr] === 'trabalhei') {
                                const times = dayTimes[dateStr] || { entrada: '18:00', saida: '06:00' };
                                const bal = calculateDayBalance(dateStr, 'trabalhei', times.entrada, times.saida);
                                currentAutoBalance += bal.total;
                              }
                            });

                            updateBancoHorasManual(totalMinsInput - currentAutoBalance);
                            setIsEditingBankCard(false);
                          }}
                          className="bg-[#10b981] hover:bg-emerald-600 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded transition-all cursor-pointer shadow-sm"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setIsEditingBankCard(false)}
                          className="bg-stone-55 hover:bg-stone-100 text-stone-600 text-[7px] font-black uppercase px-2 py-0.5 border border-[#dac0a3] rounded transition-all cursor-pointer"
                        >
                          Sair
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => {
                        const hrs = Math.trunc(totalBankOfHours / 60);
                        const mins = Math.abs(totalBankOfHours % 60);
                        setTempHours(String(hrs));
                        setTempMins(String(mins).padStart(2, '0'));
                        setIsEditingBankCard(true);
                      }}
                      className="bg-[#fdfbf7] hover:bg-[#FAF6ED] active:scale-95 transition-all duration-300 rounded-xl border border-[#d6be9c] flex flex-col items-center justify-center py-2.5 sm:py-3 shadow-sm text-center relative cursor-pointer group"
                      title="Clique para editar o saldo do Banco de Horas"
                    >
                      <span className="text-[8px] sm:text-[9.5px] font-bold tracking-wider text-[#8c7462] uppercase mb-1 flex items-center justify-center gap-0.5">
                        Banco Horas 
                        <span className="opacity-70 group-hover:opacity-100 transition-opacity text-[#b8956c] text-[8px] sm:text-[10px]">✏️</span>
                      </span>
                      <span className={`text-sm sm:text-lg font-black leading-none mb-1 ${totalBankOfHours >= 0 ? 'text-[#10b981]' : 'text-[#B32025]'}`}>
                        {formatBalanceMinutes(totalBankOfHours)}
                      </span>
                      <span className="text-[7px] sm:text-[8px] font-medium text-stone-500 uppercase">saldo (editar)</span>
                    </div>
                  )}
                </div>
                )}

                {/* Painel do Dia Selecionado: Entrada, Saída e Status */}
                {false && (
                <div className="bg-[#fdfbf7] border border-[#d6be9c] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-[#e1ccb0] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#B32025] text-white p-1.5 rounded-lg">
                        <Clock size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-[#3e2516] uppercase tracking-widest leading-none mb-1">Editor de Jornada</h3>
                        <p className="text-[10px] text-[#8c6b4e] font-mono leading-none">{formatLocalDate(selectedDate)}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-[#4e341f] text-white px-2 py-0.5 rounded uppercase tracking-wide">Minha Hora</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Status do Dia */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#5c3e29] uppercase tracking-wider">Status de Presença:</label>
                      <select
                        value={dayStatuses[selectedDate] || ''}
                        onChange={(e) => {
                          const val = e.target.value as 'trabalhei' | 'falta' | 'folga' | '';
                          updateStatus(selectedDate, val);
                        }}
                        className={`w-full text-xs font-bold border rounded-lg p-2.5 cursor-pointer outline-none transition-all shadow-inner
                          ${dayStatuses[selectedDate] === 'trabalhei' ? 'border-green-600 bg-green-50 text-green-800' : ''}
                          ${dayStatuses[selectedDate] === 'falta' ? 'border-red-600 bg-red-50 text-red-800' : ''}
                          ${dayStatuses[selectedDate] === 'folga' ? 'border-amber-600 bg-amber-50 text-amber-800' : ''}
                          ${!(dayStatuses[selectedDate]) ? 'border-[#dac0a3] bg-white text-stone-800' : ''}
                        `}
                      >
                        <option value="">Selecione status...</option>
                        <option value="trabalhei">Fui trabalhar (Trabalhei)</option>
                        <option value="falta">Falta (Não fui)</option>
                        <option value="folga">Folga oficial</option>
                      </select>
                    </div>

                    {/* Escala padrão label */}
                    <div className="flex flex-col justify-center bg-[#f8f1e5] border border-[#e1ccb0] rounded-xl p-3 text-center sm:text-left shadow-inner">
                      <span className="text-[9px] font-bold text-[#8c6b4e] uppercase tracking-wider block">Escala Padrão Noturna</span>
                      <span className="text-sm font-mono font-bold text-[#4e341f] block mt-0.5">18:00 às 06:00 (12h)</span>
                    </div>
                  </div>

                  {escalaConfig.enabled && !dayStatuses[selectedDate] && (
                    <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between text-xs gap-3 ${
                      isAutomaticWorkDay(selectedDate)
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-950"
                        : "bg-amber-500/5 border-amber-500/20 text-[#5c3e29]"
                    }`}>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#B32025]">PREVISÃO DE JORNADA</span>
                        <span className="font-semibold text-[11px] sm:text-xs">
                          Dia previsto na escala como <strong>{isAutomaticWorkDay(selectedDate) ? "TRABALHO (12x36)" : "FOLGA"}</strong>.
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          updateStatus(selectedDate, isAutomaticWorkDay(selectedDate) ? 'trabalhei' : 'folga');
                        }}
                        className="bg-[#B32025] hover:bg-[#8c060a] text-white text-[9.5px] font-bold uppercase tracking-wider py-2 px-3.5 rounded-xl transition-all shadow-sm hover:scale-102 active:scale-98 cursor-pointer shrink-0 text-center"
                      >
                        Confirmar {isAutomaticWorkDay(selectedDate) ? 'TRABALHO' : 'FOLGA'}
                      </button>
                    </div>
                  )}

                  {/* Se for dia Trabalhado, mostrar opções de horário de Entrada e Saída */}
                  {(dayStatuses[selectedDate] === 'trabalhei') ? (
                    <div className="bg-[#fffefb] border border-[#e1ccb0] rounded-xl p-4 flex flex-col gap-3.5 shadow-inner">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-[#3e2516] uppercase tracking-wider flex items-center gap-1">
                            <span>ENTRADA DE TRABALHO</span>
                          </label>
                          <input
                            type="time"
                            value={dayTimes[selectedDate]?.entrada || '18:00'}
                            onChange={(e) => {
                              const existing = dayTimes[selectedDate] || { entrada: '18:00', saida: '06:00' };
                              updateTime(selectedDate, { ...existing, entrada: e.target.value });
                            }}
                            className="bg-white border border-[#dac0a3] text-sm font-mono font-bold rounded-lg p-2.5 outline-none text-[#3e2516] focus:border-[#B32025] shadow-inner"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-[#3e2516] uppercase tracking-wider flex items-center gap-1">
                            <span>SAÍDA DE TRABALHO</span>
                          </label>
                          <input
                            type="time"
                            value={dayTimes[selectedDate]?.saida || '06:00'}
                            onChange={(e) => {
                              const existing = dayTimes[selectedDate] || { entrada: '18:00', saida: '06:00' };
                              updateTime(selectedDate, { ...existing, saida: e.target.value });
                            }}
                            className="bg-white border border-[#dac0a3] text-sm font-mono font-bold rounded-lg p-2.5 outline-none text-[#3e2516] focus:border-[#B32025] shadow-inner"
                          />
                        </div>
                      </div>

                      {/* Banco de horas do dia */}
                      {(() => {
                        const times = dayTimes[selectedDate] || { entrada: '18:00', saida: '06:00' };
                        const balance = calculateDayBalance(selectedDate, 'trabalhei', times.entrada, times.saida);
                        
                        return (
                          <div className="border-t border-[#e1ccb0] pt-3 flex flex-col gap-2">
                            <div className="flex items-center justify-between bg-[#fcf8f2] p-2.5 rounded-lg border border-[#e1ccb0]">
                              <span className="text-[10px] font-bold text-[#5c3e29] uppercase tracking-wider">Saldo Deste Dia:</span>
                              <span className={`text-sm font-mono font-black ${balance.total >= 0 ? 'text-[#2e7d32]' : 'text-[#B32025]'}`}>
                                {formatBalanceMinutes(balance.total)}
                              </span>
                            </div>

                            {/* Detalhamento dos Gatilhos do Banco de Horas */}
                            <div className="flex flex-col gap-1.5 pt-1 text-[11px] text-stone-700 font-medium">
                              {/* Regras da Entrada */}
                              <div className="flex items-start gap-2">
                                <span className="text-xs mt-0.5">{balance.entradaStatus === 'positivo' ? '🟢' : '🔴'}</span>
                                <div>
                                  <span className="font-bold text-[#4e341f]">Entrada às {times.entrada}: </span>
                                  {balance.entradaStatus === 'positivo' ? (
                                    <span className="text-green-700">Gatilho de Entrada antes de 17:54 ativado (Banco Positivo {formatBalanceMinutes(balance.entradaDiff)})</span>
                                  ) : (
                                    <span className="text-[#B32025]">Gatilho de Entrada antes de 18:06 ativado (Banco Negativo {formatBalanceMinutes(balance.entradaDiff)})</span>
                                  )}
                                </div>
                              </div>

                              {/* Regras de Saída */}
                              <div className="flex items-start gap-2">
                                <span className="text-xs mt-0.5">{balance.saidaStatus === 'positivo' ? '🟢' : '🔴'}</span>
                                <div>
                                  <span className="font-bold text-[#4e341f]">Saída às {times.saida}: </span>
                                  {balance.saidaStatus === 'positivo' ? (
                                    <span className="text-green-700">Gatilho de Saída antes de 06:06 ativado (Banco Positivo {formatBalanceMinutes(balance.saidaDiff)})</span>
                                  ) : (
                                    <span className="text-[#B32025]">Gatilho de Saída antes de 05:56 ativado (Banco Negativo {formatBalanceMinutes(balance.saidaDiff)})</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="bg-[#f8f1e5]/50 border border-dashed border-[#d6be9c] rounded-xl p-6 text-center text-stone-400 text-xs">
                      Não há compensação de banco de horas para faltas ou folgas. Selecione "Fui trabalhar (Trabalhei)" para registrar horários e acumular créditos ou débitos.
                    </div>
                  )}
                </div>
                )}

                {/* Configuração da Escala 12x36 */}
                {false && (
                <div className="bg-[#fdfbf7] border border-[#d6be9c] rounded-2xl p-5 shadow-sm flex flex-col gap-3.5">
                  <div className="flex items-center justify-between border-b border-[#e1ccb0] pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#4e341f] p-1.5 rounded-lg text-[#dfc2a1]">
                        <Calendar size={14} />
                      </div>
                      <h3 className="text-xs font-black text-[#3e2516] uppercase tracking-widest leading-none">Escala Automática 12x36</h3>
                    </div>
                    {/* Status Toggle Badge */}
                    <button
                      onClick={() => updateEscalaConfig({ ...escalaConfig, enabled: !escalaConfig.enabled })}
                      className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg transition-all focus:outline-none cursor-pointer border ${
                        escalaConfig.enabled
                          ? "bg-green-600 text-white border-green-700 hover:bg-green-700 shadow-sm"
                          : "bg-[#e1ccb0]/30 text-[#8c6b4e] border-[#eedecb] hover:bg-[#e1ccb0]/55"
                      }`}
                    >
                      {escalaConfig.enabled ? "Ativada" : "Desativada"}
                    </button>
                  </div>

                  <p className="text-[11px] text-[#5c3e29] leading-relaxed">
                    Marque os dias da sua jornada 12x36 de forma automatizada no calendário. Informe abaixo um dia de referência em que você trabalhou:
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-[#5c3e29] uppercase tracking-wider">Último dia de trabalho (Referência):</label>
                      <input
                        type="date"
                        value={escalaConfig.startDate || getTodayStr()}
                        onChange={(e) => updateEscalaConfig({ ...escalaConfig, startDate: e.target.value })}
                        disabled={!escalaConfig.enabled}
                        className="bg-white border border-[#dac0a3] text-xs font-mono font-bold rounded-lg p-2.5 outline-none text-[#3e2516] focus:border-[#B32025] shadow-inner disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
                )}

                {/* Configuração do Banco de Horas */}
                {false && (
                <div className="bg-[#fdfbf7] border border-[#d6be9c] rounded-2xl p-5 shadow-sm flex flex-col gap-3.5">
                  <div className="flex items-center justify-between border-b border-[#e1ccb0] pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#4e341f] p-1.5 rounded-lg text-[#dfc2a1]">
                        <Clock size={14} />
                      </div>
                      <h3 className="text-xs font-black text-[#3e2516] uppercase tracking-widest leading-none">Ajuste de Banco de Horas</h3>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#5c3e29] leading-relaxed">
                    Você pode adicionar um saldo inicial ou fazer um ajuste manual de horas para o seu banco. Valores positivos adicionam créditos e valores negativos adicionam débitos.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-[#5c3e29] uppercase tracking-wider">Ajuste Manual (Horas):</label>
                      <input
                        type="number"
                        placeholder="Ex: 5 ou -10"
                        value={Math.trunc(bancoHorasManual / 60) || ""}
                        onChange={(e) => {
                          const hrs = parseInt(e.target.value) || 0;
                          const currentMins = bancoHorasManual % 60;
                          updateBancoHorasManual(hrs * 60 + currentMins);
                        }}
                        className="bg-white border border-[#dac0a3] text-xs font-mono font-bold rounded-lg p-2.5 outline-none text-[#3e2516] focus:border-[#B32025] shadow-inner"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-[#5c3e29] uppercase tracking-wider">Ajuste Manual (Minutos):</label>
                      <input
                        type="number"
                        placeholder="Ex: 30 ou -45"
                        min="-59"
                        max="59"
                        value={bancoHorasManual % 60 || ""}
                        onChange={(e) => {
                          const mins = parseInt(e.target.value) || 0;
                          const currentHrs = Math.trunc(bancoHorasManual / 60);
                          updateBancoHorasManual(currentHrs * 60 + mins);
                        }}
                        className="bg-white border border-[#dac0a3] text-xs font-mono font-bold rounded-lg p-2.5 outline-none text-[#3e2516] focus:border-[#B32025] shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-[#f4ebdc]">
                    <div className="text-[10px] text-[#8c6b4e] font-mono">
                      Ajuste manual configurado: <strong className={bancoHorasManual >= 0 ? "text-green-700 font-bold" : "text-red-700 font-bold"}>{formatBalanceMinutes(bancoHorasManual)}</strong>
                    </div>
                    {bancoHorasManual !== 0 && (
                      <button
                        onClick={() => updateBancoHorasManual(0)}
                        className="text-[9px] font-black uppercase text-[#B32025] hover:underline cursor-pointer"
                      >
                        Limpar Ajuste
                      </button>
                    )}
                  </div>
                </div>
                )}

                {/* Quadro explicativo definitivo de Banco de Horas */}
                {false && (
                <div className="bg-[#fdfbf7] border border-[#d6be9c] rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-[#4e341f] p-1.5 rounded-lg text-[#dfc2a1]">
                      <Calendar size={14} />
                    </div>
                    <span className="text-[10px] font-bold text-[#3e2516] tracking-widest uppercase">Manual de Regras do Banco</span>
                  </div>

                  <div className="flex flex-col gap-2 text-xs text-stone-700 leading-relaxed">
                    <div className="flex items-start gap-2 p-1.5 bg-red-500/5 rounded border border-red-500/10">
                      <span className="text-[#B32025] font-black">🔴</span>
                      <div>
                        <strong className="text-red-900 block">DÉBITO (Banco Negativo):</strong>
                        <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-[11px] text-red-800">
                          <li>Entrada antes de <strong>18:06</strong> (entre 17:54 e 18:05)</li>
                          <li>Saída antes de <strong>05:56</strong> (ex: saída às 05:50)</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-1.5 bg-green-500/5 rounded border border-green-500/10">
                      <span className="text-green-600 font-black">🟢</span>
                      <div>
                        <strong className="text-green-900 block">CRÉDITO (Banco Positivo):</strong>
                        <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-[11px] text-green-800">
                          <li>Entrada antes de <strong>17:54</strong> (ex: chegada às 17:50)</li>
                          <li>Saída antes de <strong>06:06</strong> (ou após 05:56, ex: saída às 06:05)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                )}

              </div> {/* Close Right Inner */}

            </div> {/* Close Bottom 2-Panel Area */}
            
            {/* Very Bottom Text / Return top link inside main container */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto opacity-90 pt-4 border-t border-[#e1ccb0]/50 relative">
              <span className="text-xs font-bold text-[#5c3e29] font-mono">Hoje: {getTodayStr().split('-').reverse().join('/')}</span>
              
              <div className="flex flex-wrap items-center gap-3 relative">
                
                {/* Botão para Toggle do Dropdown */}
                <button
                  onClick={() => setShowAllAppsDropdown(true)}
                  className="text-[9px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 border bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                >
                  <Calendar size={12} className="text-stone-500" />
                  Todos Compromissos ({allAppointments.length})
                </button>

                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="bg-[#B32025] hover:bg-[#8c060a] text-white text-[9px] font-bold uppercase tracking-wider py-1.5 px-4 rounded-lg flex items-center gap-1 shadow-sm transition-colors cursor-pointer active:scale-95"
                >
                  Voltar ao topo <ChevronUp size={12} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL DE TODOS OS COMPROMISSOS */}
      <AnimatePresence>
        {showAllAppsDropdown && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllAppsDropdown(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            />
            
            {/* Modal Container */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#fdfbf7] border-2 border-[#5c3e29] rounded-3xl w-full max-w-lg shadow-[0_25px_60px_rgba(0,0,0,0.55)] p-6 relative flex flex-col gap-4 z-50"
            >
              {/* Corner vintage brass screws */}
              <Screw className="absolute -top-1.5 -left-1.5 w-3 h-3" />
              <Screw className="absolute -top-1.5 -right-1.5 w-3 h-3" />
              <Screw className="absolute -bottom-1.5 -left-1.5 w-3 h-3" />
              <Screw className="absolute -bottom-1.5 -right-1.5 w-3 h-3" />

              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#e1ccb0] pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="bg-[#B32025] text-white p-2 rounded-xl shadow-md">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#3e2516] font-serif">Todos os Compromissos</h3>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-0.5">Total cadastrado: {allAppointments.length}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAllAppsDropdown(false)}
                  className="p-1.5 rounded-lg hover:bg-[#5c3e29]/10 text-[#5c3e29]/75 hover:text-[#B32025] transition-all cursor-pointer"
                  title="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* List Content */}
              <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                {allAppointments.length === 0 ? (
                  <div className="text-center py-12 text-stone-500 text-xs font-semibold uppercase tracking-wider flex flex-col items-center gap-2">
                    <Calendar size={32} className="opacity-30 stroke-[1.5]" />
                    Nenhum compromisso cadastrado.
                  </div>
                ) : (
                  allAppointments.map((app) => (
                    <div 
                      key={app.id} 
                      className="bg-white border-2 border-[#e1ccb0]/60 rounded-2xl p-3 flex items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-[#dac0a3] transition-all group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Date & Time Badge */}
                        <div className="bg-[#FAF6ED] border-2 border-[#d6be9c]/80 rounded-xl px-2.5 py-1.5 flex flex-col items-center justify-center shrink-0 min-w-[80px] shadow-sm">
                          <span className="text-[10px] font-black text-[#5c3e29] font-mono leading-none tracking-wide">{app.date.split('-').reverse().slice(0, 2).join('/')}</span>
                          <span className="text-xs font-black text-[#3e2516] font-mono mt-1 tracking-tight">{app.time}</span>
                        </div>

                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-xs sm:text-sm font-extrabold text-[#3e2516] break-words leading-snug">
                            {app.title}
                          </span>
                          
                          {app.type === 'pessoal' ? (
                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/50 flex items-center gap-1 w-max shadow-2xs">
                              <User size={10} className="stroke-[2.5]" />
                              Pessoal
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#B32025] bg-red-50 px-2 py-0.5 rounded-lg border border-red-200/50 flex items-center gap-1 w-max shadow-2xs">
                              <Briefcase size={10} className="stroke-[2.5]" />
                              Corporativo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => deleteAppointment(app.id)}
                        className="text-stone-400 hover:text-white hover:bg-red-600 p-2 rounded-xl transition-all cursor-pointer shrink-0 opacity-40 group-hover:opacity-100 hover:scale-105 active:scale-95 border border-transparent hover:border-red-700 shadow-2xs"
                        title="Excluir compromisso"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer info/close */}
              <div className="border-t border-[#e1ccb0] pt-3.5 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setShowAllAppsDropdown(false)}
                  className="bg-[#5c3e29] hover:bg-[#3e2516] text-[#efdfc6] text-[10px] font-black uppercase tracking-widest py-2.5 px-5 rounded-xl shadow-md transition-all cursor-pointer active:scale-97"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
