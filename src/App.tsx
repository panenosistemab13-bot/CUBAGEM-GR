/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import InitialMenu from './components/InitialMenu';
import MobileMenu from './components/MobileMenu';
import Login from './components/Login';
import {
  Route,
  LayoutGrid,
  Menu,
  X,
  AlertOctagon,
  Clock,
  Database,
  ChevronRight,
  ShieldAlert,
  BellRing,
  User,
  Briefcase,
  Calendar,
  LogOut
} from 'lucide-react';
import { cn } from './lib/utils';
import { rtdb as db } from './firebase';
import { ref, onValue } from 'firebase/database';

interface Appointment {
  id: string;
  date: string;
  time: string;
  title: string;
  type: 'pessoal' | 'corporativo';
}
import Rotas from './components/Rotas';
import Patio from './components/Patio';
import { useCurrentPrinciple, PRINCIPLES_OF_LEADERSHIP } from './utils/principles';
import { toAbsoluteUrl } from './utils/url';
import coffeeBg from './assets/images/coffee_rustic_bg_1780760486326.png';
import coffeeShopBg from './assets/images/coffee_shop_bg_1780921585218.png';

type Tab = 'menu' | 'rotas' | 'cubagem';

const backgroundImages: Record<Tab, string> = {
  menu: '', // Empty for pure dark background
  rotas: toAbsoluteUrl(coffeeBg), // Premium rustic coffee setup
  cubagem: '', // Replaced with inline background in Patio.tsx
};

const tabs = [
  { id: 'cubagem', label: 'Cubagem', icon: Database },
];

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

import ActiveUsers from './components/ActiveUsers';

export default function App() {
  const principle = useCurrentPrinciple();
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('pgr_logged_user');
  });

  const handleLoginSuccess = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem('pgr_logged_user', username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pgr_logged_user');
  };

  const [activeTab, setActiveTab] = useState<Tab>('cubagem');
  const [focusedCardIndex, setFocusedCardIndex] = useState<number>(0);
  const [averbacaoView, setAverbacaoView] = useState<'generator' | 'codes'>('generator');
  const [smCreatorView, setSmCreatorView] = useState<'generator' | 'codes'>('generator');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  const [appointments, setAppointments] = useState<Record<string, Appointment>>({});
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);

  useEffect(() => {
    const appsRef = ref(db, 'presence_list/appointments');
    const unsubscribe = onValue(appsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAppointments(data);
      } else {
        setAppointments({});
      }
    });
    return () => unsubscribe();
  }, []);

  const getTodayStr = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getMinutesFromMidnight = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                             document.activeElement?.tagName === 'TEXTAREA' || 
                             document.activeElement?.getAttribute('contenteditable') === 'true';

      if (isInputFocused) return;

      // Arrow Up/Down for smooth main page scrolling
      if (e.key === 'ArrowDown') {
        const scrollContainer = document.getElementById('main-scroll-container');
        if (scrollContainer) {
          e.preventDefault();
          scrollContainer.scrollBy({ top: 180, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowUp') {
        const scrollContainer = document.getElementById('main-scroll-container');
        if (scrollContainer) {
          e.preventDefault();
          scrollContainer.scrollBy({ top: -180, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'long' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    return `${day} de ${month}. de ${year} • ${time}`;
  };

  const activeTabInfo = tabs.find(t => t.id === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'cubagem':
        return <Patio isReadOnly={currentUser === 'PCP'} currentUser={currentUser || undefined} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center p-20 text-zinc-500">
            <AlertOctagon className="w-12 h-12 mb-4 opacity-50" />
            <h2 className="text-xl font-medium tracking-tight text-zinc-300">Em Desenvolvimento</h2>
            <p className="text-sm">Este módulo está sendo refatorado para o novo padrão de design.</p>
          </div>
        );
    }
  };

  const todayStr = getTodayStr(currentDateTime);
  const currentMinutes = currentDateTime.getHours() * 60 + currentDateTime.getMinutes();

  const todayAppointments = (Object.values(appointments || {}) as Appointment[])
    .filter(app => app && app.date === todayStr)
    .map(app => {
      const appMinutes = getMinutesFromMidnight(app.time);
      const diff = appMinutes - currentMinutes;
      
      let urgency: 'critical' | 'warning' | 'info' | 'past' = 'info';
      let urgencyScore = 1;

      if (diff < -15) {
        urgency = 'past';
        urgencyScore = 0;
      } else if (diff >= -15 && diff <= 0) {
        urgency = 'critical';
        urgencyScore = 3;
      } else if (diff > 0 && diff <= 30) {
        urgency = 'critical';
        urgencyScore = 3;
      } else if (diff > 30 && diff <= 120) {
        urgency = 'warning';
        urgencyScore = 2;
      } else {
        urgency = 'info';
        urgencyScore = 1;
      }

      return {
        ...app,
        diff,
        urgency,
        urgencyScore
      };
    })
    .sort((a, b) => {
      if (a.urgencyScore !== b.urgencyScore) {
        return b.urgencyScore - a.urgencyScore;
      }
      return a.time.localeCompare(b.time);
    });

  const activeTodayApps: any[] = [];
  const maxUrgencyApp = activeTodayApps[0];
  const maxUrgencyScore = maxUrgencyApp ? maxUrgencyApp.urgencyScore : 0;

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen md:h-screen flex bg-[#F2E4CC] text-[#2D1A10] md:overflow-hidden font-sans relative flex-col">
      
      {/* Immersive Background Image / Radial glow */}
      {(activeTab === 'menu' || activeTab === 'checklist') ? (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
           <img
             src={toAbsoluteUrl(coffeeShopBg)}
             className="w-full h-full object-cover select-none brightness-105 saturate-110"
             alt="Dashboard Coffee Background"
             referrerPolicy="no-referrer"
           />
           {/* Cinematic warm light glow overlays */}
           <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(181, 138, 76, 0.15) 0%, rgba(242, 228, 204, 0.45) 100%)' }} />
        </div>
      ) : (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <AnimatePresence mode="wait">
            {backgroundImages[activeTab] && (
              <motion.img
                key={activeTab}
                src={backgroundImages[activeTab]}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.92, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 1.5 }}
                className="w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
              />
            )}
          </AnimatePresence>
          {/* Immersive warm chocolate/dark vignette to integrate the page element contrast beautifully */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, transparent 20%, rgba(45, 26, 16, 0.4) 100%)' }} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:overflow-hidden relative z-10 min-h-screen md:h-full">
        
        {/* Top Header (Only on active modules) */}
        {activeTab !== 'menu' && (
          <header className="h-20 shrink-0 flex items-center justify-between px-8 z-50 relative pointer-events-none">
            <div className="flex items-center gap-3 w-auto md:w-1/3 pointer-events-auto">
              <ActiveUsers currentUser={currentUser} />
              
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#E8D4B0] border-2 border-[#3A2414] rounded-full shadow-md">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#B32025] flex items-center justify-center text-white text-[9px] sm:text-[10px] font-black uppercase shrink-0">
                  {currentUser ? currentUser[0] : 'U'}
                </div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#3A2414] leading-none">
                  {currentUser}
                </span>
                <div className="w-[1px] h-3 sm:h-4 bg-[#3A2414]/20 mx-0.5 sm:mx-1" />
                <button
                  onClick={handleLogout}
                  className="p-1 hover:text-[#B32025] text-[#3A2414]/60 hover:scale-105 active:scale-95 transition-all flex items-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider cursor-pointer"
                  title="Sair"
                >
                  <LogOut size={13} className="stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Centered Navigation Spacer */}
            <div className="flex-1 hidden lg:flex justify-center pointer-events-auto" />

            <div className="flex items-center justify-end gap-8 w-1/4 pointer-events-auto">
               {/* Dynamic Breadcrumb (Hidden by request) */}
               {/*
               <AnimatePresence>
                 <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="hidden sm:flex items-center gap-3 px-6 py-2 bg-[#E8D4B0] border-2 border-[#3A2414] rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-[#3a1d0f] shadow-sm"
                 >
                    <span>PGR</span> 
                    <ChevronRight size={12} className="text-[#3A2414]/40" /> 
                    <motion.span 
                      key={activeTab}
                      initial={{ opacity: 0, x: -5 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[#B32025]"
                    >
                      {activeTabInfo?.label}
                    </motion.span>
                 </motion.div>
               </AnimatePresence>
               */}

               {/* Clock Box */}
               <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-[#E8D4B0] border-2 border-[#3A2414] rounded-full text-[10px] leading-[14px] font-mono text-[#2D1A10] shadow-md">
                 <Clock size={14} className="text-[#B32025]" />
                 {formatDate(currentDateTime)}
               </div>
            </div>
          </header>
        )}

        {/* ALERTA DE COMPROMISSOS GLOBAL */}
        {activeTodayApps.length > 0 && !isAlertDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className={cn(
              "mx-4 sm:mx-8 md:mx-12 mt-4 relative rounded-2xl border-2 shadow-2xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 z-40 transition-all duration-300",
              maxUrgencyScore === 3
                ? "bg-gradient-to-r from-[#800609] via-[#B32025] to-[#800609] text-white border-[#ffd880] shadow-[0_0_25px_rgba(179,32,37,0.55)]"
                : maxUrgencyScore === 2
                  ? "bg-gradient-to-r from-[#d97706] to-[#b45309] text-white border-[#fbd38d] shadow-[0_10px_20px_rgba(217,119,6,0.25)]"
                  : "bg-[#fdfbf7] border-[#5c3e29] text-[#3e2516] shadow-[0_8px_16px_rgba(0,0,0,0.1)]"
            )}
          >
            {/* Vintage brass flat-head screws on corners */}
            <Screw className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5" />
            <Screw className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5" />
            <Screw className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5" />
            <Screw className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5" />

            {/* Content left */}
            <div className="flex items-center gap-4.5 flex-1 min-w-0">
              <div className={cn(
                "w-12 h-12 rounded-xl shrink-0 flex items-center justify-center shadow-lg relative overflow-hidden",
                maxUrgencyScore === 3
                  ? "bg-amber-400 text-[#800609] animate-bounce"
                  : maxUrgencyScore === 2
                    ? "bg-[#3A2414] text-amber-400 animate-pulse"
                    : "bg-[#B32025] text-white"
              )}>
                {maxUrgencyScore === 3 ? (
                  <ShieldAlert size={24} className="stroke-[2.5]" />
                ) : (
                  <BellRing size={22} className="stroke-[2]" />
                )}
                
                {/* Visual pulse rings for critical status */}
                {maxUrgencyScore === 3 && (
                  <span className="absolute inset-0 bg-amber-300/30 animate-ping rounded-full pointer-events-none" />
                )}
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm border",
                    maxUrgencyScore === 3
                      ? "bg-[#ffeb3b] text-[#800609] border-[#ffeb3b]"
                      : maxUrgencyScore === 2
                        ? "bg-[#3A2414] text-amber-400 border-amber-400/20"
                        : "bg-[#5c3e29] text-[#fdefd1] border-[#5c3e29]"
                  )}>
                    {maxUrgencyScore === 3 
                      ? "⚡ COMPROMISSO IMINENTE / EM ANDAMENTO" 
                      : maxUrgencyScore === 2 
                        ? "⏰ COMPROMISSO PRÓXIMO" 
                        : "📅 COMPROMISSO HOJE"}
                  </span>

                  {maxUrgencyApp.diff > 0 && (
                    <span className={cn(
                      "text-[10px] font-mono font-bold px-2 py-0.5 rounded",
                      maxUrgencyScore === 3
                        ? "bg-black/25 text-[#ffe082]"
                        : maxUrgencyScore === 2
                          ? "bg-black/15 text-white"
                          : "bg-[#e1ccb0] text-[#3e2516]"
                    )}>
                      {maxUrgencyApp.diff <= 60 
                        ? `Começa em ${maxUrgencyApp.diff} min` 
                        : `Começa em ${Math.floor(maxUrgencyApp.diff / 60)}h${maxUrgencyApp.diff % 60}m`}
                    </span>
                  )}

                  {maxUrgencyApp.diff <= 0 && maxUrgencyApp.diff >= -15 && (
                    <span className="text-[10px] font-black uppercase bg-green-500 text-white px-2 py-0.5 rounded animate-pulse shadow-sm">
                      Acontecendo Agora
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-0.5">
                  <h3 className={cn(
                    "text-sm font-black tracking-tight truncate font-serif uppercase",
                    maxUrgencyScore === 3 ? "text-white text-base font-black" : "text-[#3e2516]"
                  )}>
                    {maxUrgencyApp.title}
                  </h3>
                  <span className={cn(
                    "hidden sm:inline opacity-40",
                    maxUrgencyScore === 3 ? "text-white" : "text-[#5c3e29]"
                  )}>•</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      "text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-black/10 flex items-center gap-1",
                      maxUrgencyScore === 3 ? "text-amber-200" : "text-[#5c3e29] bg-[#f2e4cc]/40"
                    )}>
                      <Clock size={11} />
                      {maxUrgencyApp.time}
                    </span>
                    
                    {maxUrgencyApp.type === 'pessoal' ? (
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border flex items-center gap-1",
                        maxUrgencyScore === 3 
                          ? "bg-amber-400/20 text-amber-200 border-amber-400/30" 
                          : maxUrgencyScore === 2
                            ? "bg-amber-100/10 text-amber-200 border-amber-200/20"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        <User size={10} />
                        Pessoal
                      </span>
                    ) : (
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border flex items-center gap-1",
                        maxUrgencyScore === 3 
                          ? "bg-red-950/40 text-red-100 border-red-200/30" 
                          : maxUrgencyScore === 2
                            ? "bg-red-100/10 text-red-200 border-red-200/20"
                            : "bg-red-50 text-[#B32025] border-red-200"
                      )}>
                        <Briefcase size={10} />
                        Corporativo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions (Close / Manage) */}
            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  setActiveTab('presence');
                  setTimeout(() => {
                    const agendaSection = document.getElementById('main-scroll-container');
                    agendaSection?.scrollTo({ top: 300, behavior: 'smooth' });
                  }, 400);
                }}
                className={cn(
                  "text-[10px] font-black uppercase tracking-wider py-2.5 px-4 rounded-xl border transition-all cursor-pointer shadow-md active:scale-97 flex items-center gap-1.5",
                  maxUrgencyScore === 3
                    ? "bg-[#ffeb3b] hover:bg-yellow-300 text-[#800609] border-[#ffeb3b]"
                    : maxUrgencyScore === 2
                      ? "bg-white hover:bg-stone-50 text-stone-800 border-stone-200"
                      : "bg-[#B32025] hover:bg-[#8c060a] text-white border-[#B32025]"
                )}
              >
                <Calendar size={13} />
                Ver Agenda
                <ChevronRight size={13} />
              </button>
              
              <button
                onClick={() => setIsAlertDismissed(true)}
                className={cn(
                  "p-2.5 rounded-xl transition-colors cursor-pointer",
                  maxUrgencyScore >= 2
                    ? "text-white/70 hover:text-white hover:bg-white/10"
                    : "text-[#5c3e29]/70 hover:text-[#5c3e29] hover:bg-[#5c3e29]/10"
                )}
                title="Dispensar alerta temporariamente"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Scrollable Canvas */}
        <main id="main-scroll-container" className={cn(
          "flex-1 relative",
          activeTab === 'menu' ? "overflow-hidden" : 
          activeTab === 'cubagem' ? "overflow-y-auto" : 
          "overflow-y-visible md:overflow-y-auto pb-4 md:pb-8"
        )}>
          <div className={cn(
            "w-full max-w-full relative z-10 flex flex-col transition-all duration-500",
            activeTab === 'menu' || activeTab === 'cubagem' ? "h-full p-0" : "min-h-full p-4 sm:p-6 md:p-8"
          )}>
            {activeTab !== 'menu' && activeTab !== 'cubagem' && activeTab !== 'presence' && activeTab !== 'averbacao' && (
               <motion.div 
                 initial={{ y: -20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
               >
                 <div>
                   <h2 className="text-4xl sm:text-5xl font-black text-[#3A2414] tracking-tight uppercase mb-2 font-serif filter drop-shadow-[0_1.5px_1.5px_rgba(255,255,255,0.85)]">
                     {activeTabInfo?.label}
                   </h2>
                   <p className="text-[#6B4423]/80 text-xs sm:text-sm font-black tracking-widest uppercase">{activeTabInfo?.id === 'menu' ? 'Navegação Central' : 'Módulo Ativo'}</p>
                 </div>

                 {isMobile && (
                   <motion.button
                     whileTap={{ scale: 0.95 }}
                     onClick={() => setActiveTab('menu')}
                     className="flex items-center justify-center gap-3 px-6 py-4 bg-[#B32025] hover:bg-[#8c060a] border-2 border-[#8c060a] rounded-2xl text-white font-black uppercase text-[10px] tracking-widest shadow-lg transition-all cursor-pointer"
                   >
                     <LayoutGrid size={18} className="text-white" />
                     <span>Voltar ao Menu</span>
                   </motion.button>
                 )}
               </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  activeTab === 'menu' ? "h-full" : "w-full transition-all duration-300",
                  activeTab === 'controle' && "origin-top scale-[0.85] xl:scale-[0.80]"
                )}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Floating trigger widget when dismissed */}
        {activeTodayApps.length > 0 && isAlertDismissed && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setIsAlertDismissed(false)}
            className={cn(
              "fixed bottom-22 right-6 z-50 p-4.5 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.55)] cursor-pointer flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2",
              maxUrgencyScore === 3
                ? "bg-[#B32025] text-white border-amber-300 shadow-[0_0_20px_rgba(179,32,37,0.6)]"
                : maxUrgencyScore === 2
                  ? "bg-amber-600 text-white border-[#fbd38d] shadow-[0_0_15px_rgba(217,119,6,0.5)]"
                  : "bg-[#5c3e29] text-[#efdfc6] border-[#dac0a3]"
            )}
            title={`Você possui ${activeTodayApps.length} compromisso(s) pendente(s) hoje. Clique para abrir.`}
          >
            <div className="relative">
              <BellRing size={24} className={cn("stroke-[2]", maxUrgencyScore === 3 ? "animate-pulse" : "")} />
              <span className="absolute -top-2.5 -right-2.5 bg-yellow-400 text-[#800609] text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                {activeTodayApps.length}
              </span>
            </div>
          </motion.button>
        )}

        {/* System Footer (Only on active modules) */}
        {activeTab !== 'menu' && activeTab !== 'cubagem' && (
          <footer className="hidden shrink-0 py-2 px-6 flex-row items-center justify-between gap-4 relative z-50 text-[10px] font-mono font-bold text-[#c7a482] bg-gradient-to-b from-[#1a0f08] to-[#0a0502] border-t border-[#4a2e1b]/50 shadow-[0_-4px_15px_rgba(0,0,0,0.5)]">
            <span className="opacity-80 flex-1 hidden sm:block">
              © 2026 <strong className="text-[#e2c19e]">Sistema PGR</strong>
            </span>
            <div className="flex flex-col items-center justify-center flex-[2] text-center px-2">
              <span className="font-sans font-black text-[#edd9bf] text-[9px] sm:text-[10px] uppercase tracking-wide leading-tight">
                {principle.title}
              </span>
              <div className="flex gap-1 mt-1 opacity-80">
                {PRINCIPLES_OF_LEADERSHIP.map((item, idx) => {
                  const isActive = idx === PRINCIPLES_OF_LEADERSHIP.indexOf(principle);
                  return (
                    <span 
                      key={idx} 
                      className={`w-1 h-1 rounded-full transition-all duration-300 ${isActive ? 'bg-[#B32025] scale-125 shadow-[0_0_4px_#B32025]' : 'bg-[#c7a482]/40'}`}
                      title={item.title} 
                    />
                  );
                })}
              </div>
            </div>
            <span className="opacity-80 flex-1 text-right">
              <span className="hidden sm:inline">Criado por </span><span className="text-[#e2c19e] font-black">Jefferson</span>
            </span>
          </footer>
        )}

      </div>
    </div>
  );
}