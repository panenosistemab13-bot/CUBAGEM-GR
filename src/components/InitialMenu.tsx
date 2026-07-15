import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map, 
  ChevronLeft,
  ChevronRight,
  Boxes
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toAbsoluteUrl } from '../utils/url';
import coffeeLogo from '../assets/images/artisan_coffee_cup_1780921602243.png';

interface MenuItem {
  id: string;
  label: string;
  buttonLabel: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const menuItems: MenuItem[] = [
  { id: 'cubagem', label: 'Cubagem', buttonLabel: 'Volumes', icon: Boxes, color: 'text-zinc-300', description: 'Gerenciamento de cubagem e volumes de veículos.' },
  { id: 'rotas', label: 'Rotas', buttonLabel: 'Logística', icon: Map, color: 'text-zinc-300', description: 'Otimização e códigos de rotas operacionais.' },
];

interface InitialMenuProps {
  onSelect: (id: string) => void;
  focusedIndex: number;
  setFocusedIndex: React.Dispatch<React.SetStateAction<number>>;
}

// Slotted Vintage Flat-head Screw Component for authentic industrial look
function Screw({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "w-4 h-4 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_2px_2px_rgba(0,0,0,0.65),inset_0.5px_0.5px_1px_rgba(255,255,255,0.25)] relative flex items-center justify-center select-none shrink-0",
        className
      )}
    >
      {/* Screw threads flat groove */}
      <div className="w-2.5 h-[1.5px] bg-[#311b09]/80 rotate-[35deg] rounded-sm shadow-inner" />
    </div>
  );
}

// Interactive render of gorgeous photorealistic 3D/Isometric modular vectors
function ModuleGraphic({ id }: { id: string }) {
  switch (id) {
    case 'presence':
      // The Legendary 3D Wooden Crate with Gold Edge angle-irons and a glowing crimson light band
      return (
        <svg viewBox="0 0 200 200" className="w-40 h-40 drop-shadow-[0_12px_18px_rgba(0,0,0,0.7)]">
          {/* Base shadow */}
          <ellipse cx="100" cy="160" rx="60" ry="14" fill="rgba(0,0,0,0.4)" filter="blur(8px)" />
          
          {/* Isometric Cube projection */}
          {/* Left Wood Panel Face */}
          <polygon points="40,105 100,135 100,75 40,45" fill="#5c3f25" />
          {/* Wood Planks Lines on Left Face */}
          <line x1="60" y1="55" x2="60" y2="115" stroke="#412c1a" strokeWidth="2.5" />
          <line x1="80" y1="65" x2="80" y2="125" stroke="#412c1a" strokeWidth="2.5" />
          
          {/* Active Glowing Crimson Warning Neon Column on the left face */}
          <rect x="52" y="72" width="6" height="30" fill="#ff0000" rx="1" transform="skewY(26)" filter="drop-shadow(0 0 6px #ff0000)" />
          {/* Left vent grille lines */}
          <line x1="50" y1="80" x2="52" y2="81" stroke="#333" strokeWidth="1" />
          <line x1="50" y1="84" x2="52" y2="85" stroke="#333" strokeWidth="1" />
          <line x1="50" y1="88" x2="52" y2="89" stroke="#333" strokeWidth="1" />

          {/* Right Wood Panel Face */}
          <polygon points="100,135 160,105 160,45 100,75" fill="#755030" />
          {/* Planks Lines on Right Face */}
          <line x1="120" y1="125" x2="120" y2="65" stroke="#503721" strokeWidth="2.5" />
          <line x1="140" y1="115" x2="140" y2="55" stroke="#503721" strokeWidth="2.5" />
          
          {/* Woodburn Engraving of Coffee Bean logo on Front Right */}
          <path 
            d="M 125,76 C 120,81 120,93 128,95 C 133,96 137,86 131,80 Z" 
            fill="#321e0f" 
            className="opacity-90"
            transform="skewY(-26) translate(-26, 114)"
            filter="drop-shadow(1px 1px 0px rgba(255,255,255,0.08))"
          />
          <path 
            d="M 124,78 C 127,82 124,91 129,91" 
            stroke="#211208" 
            strokeWidth="1.5" 
            fill="none" 
            transform="skewY(-26) translate(-26, 114)"
          />

          {/* Top Wood Lid Face */}
          <polygon points="40,45 100,75 160,45 100,15" fill="#8c613c" />
          {/* Top Lid Wood Planks */}
          <line x1="60" y1="55" x2="120" y2="25" stroke="#68472c" strokeWidth="2.5" />
          <line x1="80" y1="65" x2="140" y2="35" stroke="#68472c" strokeWidth="2.5" />

          {/* Reinforcements - Metal Edge Brackets (Aged Gold/Bronze) */}
          {/* Edge Left Vertical */}
          <polygon points="38,45 42,47 42,107 38,105" fill="#cead82" />
          {/* Edge Middle Vertical Column */}
          <polygon points="98,75 102,75 102,135 98,135" fill="#f0dbb6" />
          <polygon points="98,75 98,135 96,134 96,74" fill="#a48259" />
          {/* Edge Right Vertical */}
          <polygon points="158,105 162,107 162,47 158,45" fill="#a48259" />

          {/* Corners caps */}
          {/* Top Corner Cap */}
          <polygon points="96,15 104,15 100,20" fill="#f3dfb9" />
          {/* Right Corner Cap */}
          <polygon points="154,45 162,45 158,52" fill="#a48259" />
          {/* Bottom Middle Joint */}
          <polygon points="96,133 104,133 100,138" fill="#e0c297" />
          {/* Bottom Left Joint */}
          <polygon points="36,104 44,104 40,109" fill="#a48259" />

          {/* Tiny screws on brackets */}
          <circle cx="100" cy="82" r="1.5" fill="#444" />
          <circle cx="100" cy="128" r="1.5" fill="#444" />
          <circle cx="41" cy="52" r="1.2" fill="#444" />
          <circle cx="41" cy="98" r="1.2" fill="#444" />
          <circle cx="159" cy="52" r="1.2" fill="#555" />
          <circle cx="159" cy="98" r="1.2" fill="#555" />
        </svg>
      );

    case 'cubagem':
      // Red Industrial Corrugated Ground Container with heavy iron doors and yellow decals
      return (
        <svg viewBox="0 0 200 200" className="w-40 h-40 drop-shadow-[0_12px_18px_rgba(0,0,0,0.7)]">
          <ellipse cx="100" cy="160" rx="60" ry="14" fill="rgba(0,0,0,0.4)" filter="blur(8px)" />
          {/* Cargo Container Isometric Base */}
          {/* Left Panel */}
          <polygon points="40,110 100,138 100,75 40,47" fill="#801818" />
          {/* Right Panel with Corrugations */}
          <polygon points="100,138 160,110 160,47 100,75" fill="#b32424" />
          
          {/* Corrugation Shading - repeatable stripes */}
          {[110, 120, 130, 140, 150].map((x, i) => (
            <g key={i}>
              <line x1={x} y1={75 - (x-100)*0.46} x2={x} y2={138 - (x-100)*0.46} stroke="#e53e3e" strokeWidth="2.5" />
              <line x1={x+2} y1={75 - (x+2-100)*0.46} x2={x+2} y2={138 - (x+2-100)*0.46} stroke="#681212" strokeWidth="2.5" />
            </g>
          ))}

          {/* Top Panel */}
          <polygon points="40,47 100,75 160,47 100,19" fill="#c53030" />
          {/* Top Panel ridges */}
          <line x1="60" y1="56" x2="120" y2="28" stroke="#a62c2c" strokeWidth="2" />
          <line x1="80" y1="65" x2="140" y2="37" stroke="#a62c2c" strokeWidth="2" />

          {/* Industrial hinges and lockbars on front-left door */}
          <line x1="50" y1="54" x2="50" y2="114" stroke="#d2d6dc" strokeWidth="2" />
          <line x1="75" y1="66" x2="75" y2="126" stroke="#d2d6dc" strokeWidth="2" />
          <rect x="49" y="75" width="4" height="6" fill="#4a5568" transform="skewY(26)" />
          <rect x="74" y="85" width="4" height="6" fill="#4a5568" transform="skewY(26)" />

          {/* Yellow warning hazard decal */}
          <polygon points="115,75 130,68 135,71 120,78" fill="#ecc94b" />
          <polygon points="118,74 122,72 125,75 121,77" fill="#1a202c" />
        </svg>
      );

    case 'averbacao':
      // Vintage Heavy Cast Iron Safe Box with polished brass combination dial
      return (
        <svg viewBox="0 0 200 200" className="w-40 h-40 drop-shadow-[0_12px_18px_rgba(0,0,0,0.7)]">
          <ellipse cx="100" cy="160" rx="55" ry="12" fill="rgba(0,0,0,0.4)" filter="blur(8px)" />
          {/* Safe Outer Frame Isometric */}
          <polygon points="45,115 100,140 100,75 45,50" fill="#2d3748" />
          <polygon points="100,140 155,115 155,50 100,75" fill="#4a5568" />
          <polygon points="45,50 100,75 155,50 100,25" fill="#718096" />

          {/* Beveled Vault Front Door Face */}
          <polygon points="107,131 148,111 148,58 107,79" fill="#1a202c" />
          <polygon points="107,79 148,58 148,56 107,77" fill="#ffd700" /> {/* Gold trim frame */}

          {/* Brass combination dial center */}
          <circle cx="127" cy="95" r="14" fill="#d69e2e" stroke="#744210" strokeWidth="1.5" />
          <circle cx="127" cy="95" r="10" fill="#1a202c" />
          <circle cx="127" cy="95" r="3" fill="#ffd700" />
          {/* Dial tick marks */}
          <line x1="127" y1="81" x2="127" y2="83" stroke="#ffd700" strokeWidth="1" />
          <line x1="139" y1="95" x2="141" y2="95" stroke="#ffd700" strokeWidth="1" />
          <line x1="127" y1="107" x2="127" y2="109" stroke="#ffd700" strokeWidth="1" />
          <line x1="113" y1="95" x2="115" y2="95" stroke="#ffd700" strokeWidth="1" />

          {/* Safe Heavy door handle */}
          <rect x="111" y="94" width="3" height="15" fill="#a0aec0" rx="1" />
          <circle cx="112.5" cy="94" r="2.5" fill="#ffffff" />

          {/* Left panel riveted steel look */}
          <circle cx="55" cy="59" r="1.5" fill="#1a202c" />
          <circle cx="90" cy="74" r="1.5" fill="#1a202c" />
          <circle cx="55" cy="107" r="1.5" fill="#1a202c" />
          <circle cx="90" cy="122" r="1.5" fill="#1a202c" />
        </svg>
      );

    case 'sm_creator':
      // Futuristic Tactical Communications Transmitter with retro screens and glowing antennas
      return (
        <svg viewBox="0 0 200 200" className="w-40 h-40 drop-shadow-[0_12px_18px_rgba(0,0,0,0.7)]">
          <ellipse cx="100" cy="160" rx="55" ry="12" fill="rgba(0,0,0,0.4)" filter="blur(8px)" />
          {/* Base Unit Transmitter */}
          <polygon points="45,120 100,145 100,85 45,60" fill="#1e293b" />
          <polygon points="100,145 155,120 155,60 100,85" fill="#334155" />
          <polygon points="45,60 100,85 155,60 100,35" fill="#475569" />

          {/* Radar sweeping graphic display on right panel */}
          <polygon points="107,133 148,114 148,70 107,89" fill="#020617" />
          <circle cx="127.5" cy="101.5" r="15" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.4" />
          <circle cx="127.5" cy="101.5" r="8" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.6" />
          {/* Sweeper green line */}
          <line x1="127.5" y1="101.5" x2="138" y2="92" stroke="#22c55e" strokeWidth="1.5" filter="drop-shadow(0 0 2px #22c55e)" />
          {/* Blinking signal nodes */}
          <circle cx="132" cy="98" r="1.5" fill="#e11d48" filter="drop-shadow(0 0 3px #e11d48)" />
          <circle cx="121" cy="104" r="1.2" fill="#22c55e" filter="drop-shadow(0 0 2px #22c55e)" />

          {/* Transmitter hardware knobs on the left panel */}
          <circle cx="60" cy="76" r="3" fill="#e2e8f0" transform="skewY(26)" />
          <circle cx="72" cy="82" r="3.5" fill="#e2e8f0" transform="skewY(26)" />
          <circle cx="84" cy="88" r="3" fill="#cbd5e1" transform="skewY(26)" />
          <rect x="58" y="95" width="28" height="8" fill="#0f172a" rx="1.5" transform="skewY(26)" />
          <rect x="62" y="103" width="4" height="4" fill="#3b82f6" rx="0.5" filter="drop-shadow(0 0 2px #3b82f6)" />
          <rect x="70" y="107" width="4" height="4" fill="#f59e0b" rx="0.5" filter="drop-shadow(0 0 2px #f59e0b)" />

          {/* Vertical Antennas on Top */}
          {/* Left Antenna rod */}
          <line x1="72" y1="67" x2="72" y2="25" stroke="#94a3b8" strokeWidth="2.5" />
          <circle cx="72" cy="23" r="3" fill="#e11d48" filter="drop-shadow(0 0 4px #e11d48)" />
          {/* Right Antenna rod */}
          <line x1="128" y1="67" x2="128" y2="25" stroke="#64748b" strokeWidth="2.5" />
          <circle cx="128" cy="23" r="3" fill="#3b82f6" filter="drop-shadow(0 0 4px #3b82f6)" />
        </svg>
      );

    case 'rotas':
      // Traditional Golden Marine Brass Compass in premium casing
      return (
        <svg viewBox="0 0 200 200" className="w-40 h-40 drop-shadow-[0_12px_18px_rgba(0,0,0,0.7)]">
          <ellipse cx="100" cy="160" rx="55" ry="12" fill="rgba(0,0,0,0.4)" filter="blur(8px)" />
          {/* Wooden Deck/Base */}
          <polygon points="45,110 100,135 155,110 100,85" fill="#4a2d10" opacity="0.3" />
          
          {/* Giant Round Compass Shell (Aged Solid Gold/Brass) */}
          <circle cx="100" cy="90" r="42" fill="url(#brassGrad)" stroke="#513008" strokeWidth="4" />
          <circle cx="100" cy="90" r="36" fill="#1b120c" stroke="#b7791f" strokeWidth="2.5" />
          <circle cx="100" cy="90" r="34" fill="#faf0e6" />

          {/* Compass Rose Rose des Vents inside dial */}
          {/* North/South pointing triangle */}
          <polygon points="100,58 104,90 96,90" fill="#b91c1c" /> {/* Red North pointer */}
          <polygon points="100,122 104,90 96,90" fill="#4a5568" /> {/* Grey South pointer */}
          <polygon points="68,90 100,94 100,86" fill="#718096" />
          <polygon points="132,90 100,94 100,86" fill="#718096" />

          {/* Directions Labels */}
          <text x="96" y="68" fill="#b91c1c" fontSize="10" fontWeight="bold" fontFamily="serif">N</text>
          <text x="97" y="120" fill="#2d3748" fontSize="8" fontWeight="bold" fontFamily="serif">S</text>
          <text x="122" y="93" fill="#2d3748" fontSize="8" fontWeight="bold" fontFamily="serif">E</text>
          <text x="71" y="93" fill="#2d3748" fontSize="8" fontWeight="bold" fontFamily="serif">W</text>

          {/* Polished Glass sheen highlight */}
          <path d="M 72,70 A 34,34 0 0,1 128,70" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.6" strokeLinecap="round" />

          {/* Brass outer lid ring */}
          <circle cx="100" cy="42" r="8" fill="none" stroke="#d69e2e" strokeWidth="2.5" />

          {/* Definition for elegant metallic gold brass gradient */}
          <defs>
            <radialGradient id="brassGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="30%" stopColor="#ca8a04" />
              <stop offset="70%" stopColor="#854d0e" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>
          </defs>
        </svg>
      );

    case 'checklist':
      // Stately inspection parchment clipboard in premium hand-stitched tan leather binder
      return (
        <svg viewBox="0 0 200 200" className="w-40 h-40 drop-shadow-[0_12px_18px_rgba(0,0,0,0.7)]">
          <ellipse cx="100" cy="165" rx="55" ry="10" fill="rgba(0,0,0,0.4)" filter="blur(8px)" />
          {/* Leather clipboard background tilted in isometric 3D space */}
          <polygon points="50,135 110,155 150,115 90,95" fill="#fcf6f0" opacity="0.1" /> {/* Shadow */}
          
          {/* Backing leather board layout */}
          <polygon points="55,135 115,155 150,110 90,90" fill="#78350f" />
          <polygon points="57,133 113,152 147,108 91,89" fill="#92400e" />

          {/* Inspection ivory document paper */}
          <polygon points="67,125 111,141 139,103 95,87" fill="#fffefc" />
          {/* Woodburned paper shadow */}
          <polygon points="69,127 109,141 109,142 69,128" fill="#e2d8cd" />

          {/* Clipboard solid vintage bronze metallic clamp at the top */}
          <polygon points="86,96 102,102 110,92 94,86" fill="#854d0e" />
          <polygon points="88,94 100,99 108,89 96,84" fill="#b45309" />
          <circle cx="97" cy="92" r="1.5" fill="#451a03" />

          {/* Checklist horizontal paper writing lines */}
          <line x1="78" y1="117" x2="101" y2="125" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="84" y1="110" x2="114" y2="121" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="90" y1="104" x2="120" y2="115" stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Glowing Green Retro Checkmarks indicating compliance */}
          <polyline points="73,115 75,117 79,112" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 0 2px #22c55e)" />
          <polyline points="79,108 81,110 85,105" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 0 2px #22c55e)" />
          <polyline points="85,101 87,103 91,98" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 0 2px #22c55e)" />
        </svg>
      );

    case 'controle':
      return (
        <svg viewBox="0 0 200 200" className="w-40 h-40 drop-shadow-[0_12px_18px_rgba(0,0,0,0.7)]">
          <ellipse cx="100" cy="160" rx="55" ry="12" fill="rgba(0,0,0,0.4)" filter="blur(8px)" />
          {/* Main Dashboard Panel tilted in 3D */}
          <polygon points="45,115 100,140 155,115 100,90" fill="#2d1d0f" />
          <polygon points="45,115 100,140 100,143 45,118" fill="#1e1108" />
          <polygon points="100,140 155,115 155,118 100,143" fill="#1e1108" />

          {/* Copper base plate */}
          <polygon points="50,112 100,135 150,112 100,89" fill="#8c5024" />
          <polygon points="52,110 100,133 148,110 100,87" fill="#b4642d" />

          {/* Brass screws in corners */}
          <circle cx="56" cy="108" r="1.5" fill="#fef08a" stroke="#451a03" strokeWidth="0.5" />
          <circle cx="144" cy="108" r="1.5" fill="#fef08a" stroke="#451a03" strokeWidth="0.5" />
          <circle cx="100" cy="129" r="1.5" fill="#fef08a" stroke="#451a03" strokeWidth="0.5" />
          <circle cx="100" cy="91" r="1.5" fill="#fef08a" stroke="#451a03" strokeWidth="0.5" />

          {/* Left vertical slider track */}
          <polygon points="70,105 74,107 74,117 70,115" fill="#1e1108" />
          {/* Slider knob (Red) */}
          <polygon points="68,109 76,113 76,111 68,107" fill="#B32025" />
          <polygon points="68,107 76,111 76,108 68,104" fill="#e53e3e" />

          {/* Right vertical slider track */}
          <polygon points="126,105 130,107 130,117 126,115" fill="#1e1108" />
          {/* Slider knob (Brass/Yellow) */}
          <polygon points="124,109 132,113 132,111 124,107" fill="#ca8a04" />
          <polygon points="124,107 132,111 132,108 124,104" fill="#fef08a" />

          {/* Center Gauge dial */}
          <ellipse cx="100" cy="108" rx="14" ry="10" fill="#1e1108" stroke="#ca8a04" strokeWidth="1" />
          {/* Indicator needle */}
          <line x1="100" y1="108" x2="108" y2="101" stroke="#e53e3e" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="100" cy="108" r="2" fill="#fff" />
        </svg>
      );

    default:
      return null;
  }
}

export default function InitialMenu({ onSelect, focusedIndex, setFocusedIndex }: InitialMenuProps) {
  const [direction, setDirection] = useState(0);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setFocusedIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = menuItems.length - 1;
      if (next >= menuItems.length) next = 0;
      return next;
    });
  }, [setFocusedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight') paginate(1);
      if (e.key === 'ArrowLeft') paginate(-1);
      if (e.key === 'Enter') onSelect(menuItems[focusedIndex].id);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, paginate, onSelect]);

  const activeItem = menuItems[focusedIndex];

  return (
    <div className="w-full min-h-screen text-[#2b180d] select-none relative flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans overflow-x-hidden md:overflow-y-hidden">
      
      {/* ================= HEADER AREA ================= */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 max-w-[84rem] mx-auto mt-2">
        
        {/* TOP LEFT HEADER: MÓDULO ATIVO RED BRAND SEAL AND LABEL */}
        <div className="flex items-center gap-2.5 bg-black/10 backdrop-blur-md rounded-full py-1 pl-1 pr-4.5 border border-white/5 shadow-2xl backdrop-saturate-150 relative transition-transform duration-300 hover:scale-[1.02]">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#cead80] bg-[#800609] flex items-center justify-center shrink-0 shadow-lg shadow-black/40">
            <img 
              src={toAbsoluteUrl(coffeeLogo)} 
              alt="3 Corações Logo Badge" 
              className="w-full h-full object-cover scale-105"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-[#b49271] leading-none mb-0.5 shadow-sm">
              Módulo Ativo
            </span>
            <AnimatePresence mode="popLayout">
              <motion.h1 
                key={activeItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-2xl xs:text-3xl font-black uppercase tracking-tight text-[#f1daaf] leading-none select-none filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.65)] font-sans"
                style={{
                  textShadow: '1.2px 1.5px 0px #311b09, 2px 3px 6px rgba(0,0,0,0.5)'
                }}
              >
                {activeItem.buttonLabel}
              </motion.h1>
            </AnimatePresence>
          </div>
        </div>

        {/* TOP RIGHT BRAND PLATE: "Feito com paixão. Feito para entregar." */}
        <div 
          className="relative px-5 py-2.5 rounded-2xl bg-gradient-to-br from-[#4a3222]/85 to-[#1c0e06]/95 border-2 border-[#bfa27a]/60 shadow-[0_10px_20px_rgba(0,0,0,0.6),inset_0_1px_4px_rgba(255,255,255,0.15)] max-w-sm w-full md:w-auto shrink-0 transition-transform duration-300 hover:scale-[1.02]"
        >
          {/* Metal plate screws */}
          <Screw className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5" />
          <Screw className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5" />
          <Screw className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5" />
          <Screw className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5" />

          <div className="flex items-center gap-3.5 text-[#eddabf]">
            {/* Elegant steaming coffee cup icon */}
            <div className="relative shrink-0 flex flex-col items-center">
              {/* Steams */}
              <div className="flex gap-0.5 -mt-2.5 mb-1 opacity-75">
                <span className="w-0.5 h-2.5 bg-[#e6cfb5]/80 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-0.5 h-3.5 bg-[#e6cfb5]/80 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                <span className="w-0.5 h-2.5 bg-[#e6cfb5]/80 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              {/* Cup body & saucer */}
              <div className="w-5 h-3.5 border-2 border-[#e6cfb5] rounded-b-md relative flex items-center justify-center">
                <span className="absolute -right-[4.5px] top-0.5 w-[4.5px] h-1.5 border-2 border-l-0 border-[#e6cfb5] rounded-r-md" />
              </div>
              <div className="w-7 h-[2px] bg-[#e6cfb5] rounded-full mt-[1px]" />
            </div>

            <div className="flex flex-col">
              <p className="font-serif italic text-[11px] tracking-wide text-[#fdefd1] font-semibold leading-none">
                Feito com paixão.
              </p>
              <p className="font-serif italic text-[10px] text-[#cca07d] font-semibold tracking-wide leading-none mt-1">
                Feito para entregar.
              </p>
              <div className="flex justify-center gap-1 mt-1 text-red-500 text-[7px] animate-pulse">
                <span>♥</span><span>♥</span><span>♥</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ================= CENTRAL CAROUSEL CONTAINER ================= */}
      <div className="flex-1 flex items-center justify-between gap-4 w-full max-w-[84rem] mx-auto px-2 relative z-10 select-none py-4 md:py-0">
        
        {/* LEFT CAROUSEL CHEVRON BUTTON */}
        <motion.button 
          whileHover={{ scale: 1.12, boxShadow: "0 0 15px rgba(139,92,26,0.5)" }}
          whileTap={{ scale: 0.90 }}
          onClick={() => paginate(-1)}
          className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-b from-[#5c371d] to-[#1e0e06] border-[2.5px] border-[#cead80] shadow-[0_6px_12px_rgba(0,0,0,0.8)] text-[#eddabf] hover:text-white transition-all cursor-pointer"
        >
          <ChevronLeft size={20} className="drop-shadow-md stroke-[3]" />
        </motion.button>
 
        {/* BRASS METAL CORE CAROUSEL PLATE */}
        <div className="flex-1 flex items-center justify-center relative min-h-[25.5rem] md:min-h-[26.5rem]">
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={activeItem.id}
              custom={direction}
              initial={{ x: direction > 0 ? 100 : -100, opacity: 0, scale: 0.94 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: direction > 0 ? -100 : 100, opacity: 0, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              className="w-full max-w-[316px] rounded-[1.85rem] bg-gradient-to-br from-[#dfcbab] via-[#cbaf8c] to-[#ae926e] border-[5px] border-[#311f14] shadow-[0_20px_45px_rgba(0,0,0,0.85),inset_1.5px_1.5px_3px_rgba(255,255,255,0.45)] p-5 flex flex-col items-center justify-between relative ring-4 ring-[#1c1109]/30 cursor-pointer select-none h-[24.5rem]"
              onClick={() => onSelect(activeItem.id)}
            >
              {/* Plaque's Corner Hardware Screws */}
              <Screw className="absolute top-2.5 left-2.5" />
              <Screw className="absolute top-2.5 right-2.5" />
              <Screw className="absolute bottom-2.5 left-2.5" />
              <Screw className="absolute bottom-2.5 right-2.5" />
 
              {/* 3D Isometric Module Visual Vector Item */}
              <div className="flex-1 flex items-center justify-center relative w-full pt-0">
                <ModuleGraphic id={activeItem.id} />
              </div>
 
              {/* Module Metadata & Text Panel details */}
              <div className="flex flex-col items-center text-center w-full mt-0.5">
                
                {/* Dynamic Red Category Badge Ribbon */}
                <span className="bg-gradient-to-b from-[#ca1a20] to-[#800609] border border-[#ff3e47]/30 text-white text-[9px] font-black px-4 py-1 uppercase tracking-widest rounded-full shadow-[0_3px_8px_rgba(179,32,37,0.4)] transform translate-y-[-2px] select-none scale-100">
                  {activeItem.buttonLabel}
                </span>
 
                {/* Module Primary Heading (Styled as engraved woodcraft) */}
                <h2 
                  className="text-lg sm:text-2xl font-serif font-black text-[#2e190e] tracking-tight capitalize mt-3 select-none mb-0.5"
                  style={{
                    textShadow: '0.5px 1px 0px rgba(255, 255, 255, 0.4)'
                  }}
                >
                  {activeItem.label}
                </h2>
 
                {/* Styled Rustic Wood/Bean Separator */}
                <div className="flex items-center gap-2 w-28 justify-center py-1 opacity-80 select-none">
                  <span className="h-[1px] flex-1 bg-[#5c3c24]" />
                  <span className="text-[#5c3c24] text-[10px]">☕</span>
                  <span className="h-[1px] flex-1 bg-[#5c3c24]" />
                </div>
 
                {/* Module Description with high contrast for paper plaque backdrop */}
                <p className="text-[#3c2518] text-xs font-bold leading-relaxed max-w-[15rem] select-none mt-0.5">
                  {activeItem.description}
                </p>
              </div>
 
            </motion.div>
          </AnimatePresence>
        </div>
 
        {/* RIGHT CAROUSEL CHEVRON BUTTON */}
        <motion.button 
          whileHover={{ scale: 1.12, boxShadow: "0 0 15px rgba(139,92,26,0.5)" }}
          whileTap={{ scale: 0.90 }}
          onClick={() => paginate(1)}
          className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-b from-[#5c371d] to-[#1e0e06] border-[2.5px] border-[#cead80] shadow-[0_6px_12px_rgba(0,0,0,0.8)] text-[#eddabf] hover:text-white transition-all cursor-pointer"
        >
          <ChevronRight size={20} className="drop-shadow-md stroke-[3]" />
        </motion.button>

      </div>

      {/* ================= HIGH-FIDELITY FOOTER BAR ================= */}
      <div className="w-full relative z-10 max-w-[84rem] mx-auto mt-auto">
        <div 
          className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-[#442e1d]/90 via-[#26150b]/95 to-[#442e1d]/90 border-2 border-[#bfa27a]/50 shadow-[0_12px_25px_rgba(0,0,0,0.7),inset_0_1px_4px_rgba(255,255,255,0.15)] flex flex-col sm:flex-row justify-between items-center gap-3 relative text-[10px] font-medium text-[#cfa588]"
        >
          {/* Edge Anchoring Rivets */}
          <Screw className="absolute left-5 top-1/2 -translate-y-1/2 w-3 h-3" />
          <Screw className="absolute right-5 top-1/2 -translate-y-1/2 w-3 h-3" />

          {/* Left copyright notice */}
          <span className="sm:pl-8 font-bold select-none text-[#cca285]">
            © 2026 Sistema PGR • Todos os direitos reservados.
          </span>

          {/* Centered romantic coffee-brand tag */}
          <div className="flex items-center gap-1.5 font-serif italic text-xs font-semibold text-[#fdefd1] select-none hover:text-[#ca8a04] transition-colors">
            <span>Feito com paixão. Feito para entregar.</span>
            <div className="flex gap-0.5 text-[8px] text-red-500 tracking-none animate-pulse">
              <span>♥</span><span>♥</span><span>♥</span>
            </div>
          </div>

          {/* Right author attribution */}
          <span className="sm:pr-8 text-center sm:text-right font-semibold select-none text-[#cca285]">
            Sistema Web • Criado por <span className="text-[#f1daaf] font-black tracking-wide">Jefferson Augusto</span> • Matrícula 10-85447
          </span>
        </div>
      </div>

    </div>
  );
}
