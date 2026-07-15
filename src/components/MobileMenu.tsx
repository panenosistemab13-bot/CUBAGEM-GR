import React from 'react';
import { motion } from 'motion/react';
import { 
  Route, 
  Heart,
  Database
} from 'lucide-react';
import { cn } from '../lib/utils';

interface MenuItem {
  id: string;
  subtitle: string;
  title: string;
  icon: React.ElementType;
  styleClass: string;
  iconStyle: string;
}

const menuItems: MenuItem[] = [
  { 
    id: 'cubagem', 
    subtitle: 'LOGÍSTICA', 
    title: 'CUBAGEM', 
    icon: Database,
    styleClass: "wood-button bg-gradient-to-r from-[#2a170b] via-[#3a2214] to-[#2a170b] border-y border-[#4a2e1c] shadow-[inset_0_1px_3px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.6)] text-[#e6c29b] transition-all duration-300",
    iconStyle: "border-[#e6c29b]/35 text-[#e6c29b]"
  },
  { 
    id: 'rotas', 
    subtitle: 'LOGÍSTICA TEMPORAL', 
    title: 'SISTEMA DE ROTAS', 
    icon: Route,
    styleClass: "map-button bg-gradient-to-r from-[#dfd0b2] to-[#c5b394] border-y border-[#eddcc4]/20 shadow-[inset_0_1px_3px_rgba(255,255,255,0.3),0_4px_10px_rgba(0,0,0,0.52)] text-[#3a2214] transition-all duration-300",
    iconStyle: "border-[#3a2214]/25 text-[#3a2214]"
  }
];

interface MobileMenuProps {
  onSelect: (id: string) => void;
}

export default function MobileMenu({ onSelect }: MobileMenuProps) {
  return (
    <div className="w-full min-h-screen bg-transparent relative flex flex-col items-center justify-between overflow-hidden select-none pb-8">
      
      {/* 100% Immersive Full screen overlay to enforce the dark, rich oak wood background tone and shadows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Dark warm chocolate vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c0f0a]/98 via-[#2d1a0f]/95 to-[#1c0f0a]/98" />
        
        {/* High-end wood planks pattern lines */}
        <div className="absolute inset-y-0 left-1/4 w-[1px] bg-black/30 shadow-l" />
        <div className="absolute inset-y-0 left-2/4 w-[1px] bg-black/30 shadow-l" />
        <div className="absolute inset-y-0 left-3/4 w-[1px] bg-black/30 shadow-l" />
      </div>

      {/* TOP DECORATIVE ELEMENT: Curved top coarse burlap jute fabric banner with realistic shadow */}
      <div className="w-full relative z-20 pointer-events-none">
        <svg 
          viewBox="30 20 100 24" 
          className="w-full filter drop-shadow-[0_8px_15px_rgba(0,0,0,0.92)] fill-[#a88d75] opacity-95 animate-fade-in"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Wave top resembling textured burlap arch */}
          <path d="M 0 0 L 160 0 L 160 30 Q 80 44, 0 30 Z" fill="#917359" />
          {/* Subtle fabric design contours to make it look realistic */}
          <path d="M 0 0 L 160 0 L 160 28 Q 80 41, 0 28 Z" fill="#b99f86" opacity="0.15" />
          <path d="M 0 0 L 160 0 L 160 26 Q 80 38, 0 26 Z" fill="#ffffff" opacity="0.08" />
        </svg>

        {/* Real floating fabric threads using absolute elements */}
        <div className="absolute bottom-1.5 inset-x-0 flex justify-around opacity-40">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-[#5c3e29] font-mono text-[6px] select-none">-</span>
          ))}
        </div>
      </div>

      {/* HEADER: Bold, rustic, premium branding focused on Café 3 Corações aesthetic */}
      <div className="w-full text-center px-6 relative z-10 my-4">
        <div className="flex items-center justify-center gap-1.5 mb-1.5 opacity-90 animate-fade-in">
          <Heart size={14} className="fill-[#B32025] text-[#B32025] filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
          <Heart size={14} className="fill-[#B32025] text-[#B32025] filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
          <Heart size={14} className="fill-[#B32025] text-[#B32025] filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
        </div>
        <h2 className="text-[34px] sm:text-4xl font-extrabold text-[#F5EFE6] tracking-[0.22em] uppercase leading-none drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)] pr-[-0.22em]">
          MÓDULOS
        </h2>
        <p className="text-[#E8DCCB] text-[9.5px] font-black uppercase tracking-[0.18em] mt-2.5 opacity-90 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.85)]">
          SELECIONE UMA CATEGORIA PARA INICIAR
        </p>
        <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[#B32025] to-transparent mx-auto mt-4" />
      </div>

      {/* CENTER STACK: 6 uniquely textured realistic rectangular buttons */}
      <div className="w-full max-w-[390px] px-5 flex flex-col gap-[14px] relative z-10 my-4 flex-1 justify-center">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
              whileActive={{ scale: 0.98 }}
              onClick={() => onSelect(item.id)}
              className={cn(
                "w-full h-[72px] rounded-2.5xl flex items-center justify-between px-4 cursor-pointer select-none relative group overflow-hidden border border-black/35 shadow-lg active:scale-95",
                item.styleClass
              )}
            >
              {/* Special details inside buttons for outstanding photorealism */}
              {item.id === 'cubagem' && (
                /* Wood grain pattern lines overlay */
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[repeating-linear-gradient(0deg,#000_0px,#000_4px,transparent_4px,transparent_8px)]" />
              )}
              
              {item.id === 'presence' && (
                /* Canvas raw fabric crosshatching */
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[linear-gradient(45deg,#000_25%,transparent_25%),linear-gradient(-45deg,#000_25%,transparent_25%)] [background-size:6px_6px]" />
              )}

              {item.id === 'averbacao' && (
                <>
                  {/* Subtle ancient crumpled sheet textures */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 12%, transparent 12%)", backgroundSize: "8px 8px" }} />
                  {/* Realistic small 3D Red wax/stamp seal at top right of button */}
                  <div className="absolute right-3.5 top-[11.5px] w-6 h-6 rounded-full bg-gradient-to-br from-[#cb1a21] via-[#8c060b] to-[#4e0205] shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),0_2px_4px_rgba(0,0,0,0.55)] border border-[#8C060B]/10 flex items-center justify-center transform rotate-12 z-20">
                    <Heart size={8} className="fill-white/70 text-transparent" />
                  </div>
                </>
              )}

              {item.id === 'sm_creator' && (
                /* Hammered copper highlights overlay */
                <div className="absolute inset-0 opacity-[0.16] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.2) 30%, transparent 60%)", backgroundSize: "14px 14px" }} />
              )}

              {item.id === 'rotas' && (
                /* Faint historical grid/atlas path overlay */
                <svg className="absolute inset-0 w-full h-full opacity-[0.18] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M10,20 Q48,5 90,30 T10,80" stroke="#4a2e1b" strokeWidth="0.8" fill="none" strokeDasharray="3 3" />
                  <circle cx="90" cy="30" r="1.5" fill="#B32025" />
                </svg>
              )}

              {item.id === 'checklist' && (
                /* Inset stitched border matching classic distressed leather */
                <div className="absolute inset-1.5 rounded-[1.1rem] border border-dashed border-[#FAF7F2]/20 pointer-events-none" />
              )}

              {/* LADO ESQUERDO DA TECLA: Rounded square dark metallic badge containing the bronze icon */}
              <div className="flex items-center gap-4 relative z-10">
                <div className={cn(
                  "w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1c0f0a] to-[#0a0502] border border-white/5 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.8),0_1.5px_2.5px_rgba(255,255,255,0.12)] flex items-center justify-center shrink-0",
                  item.iconStyle
                )}>
                  <IconComponent size={20} strokeWidth={2.1} className="transition-transform group-hover:scale-110 duration-300" />
                </div>

                {/* TEXT CONTAINER (Subtitle & Module Title) */}
                <div className="flex flex-col items-start text-left">
                  <span className={cn(
                    "font-mono text-[7px] tracking-[0.25em] font-black uppercase mb-0.5 opacity-90",
                    item.id === 'averbacao' ? "text-[#B32025]" : ""
                  )}>
                    {item.subtitle}
                  </span>
                  <span className="font-serif text-[15px] font-extrabold uppercase tracking-wide leading-none filter drop-shadow-[0_0.8px_0.8px_rgba(255,255,255,0.1)]">
                    {item.title}
                  </span>
                </div>
              </div>

              {/* Dynamic little hover/click detail */}
              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40 mr-1.5" />
            </motion.button>
          );
        })}
      </div>

      {/* BOTTOM DECORATIVE ELEMENT: Coarse jute fabric sacks arch framed correctly at the absolute bottom */}
      <div className="w-full relative z-20 pointer-events-none">
        
        {/* Subtle cursive branding of Café Três Corações at bottom center, elevated elegantly */}
        <div className="absolute bottom-[28px] inset-x-0 w-full flex flex-col items-center justify-center text-center">
          <p className="font-serif italic text-xs text-[#FAF7F2]/80 tracking-widest drop-shadow-[0_1.5px_2px_rgba(0,0,0,1)] select-none">
            Café Três Corações
          </p>
          <span className="text-[7px] font-mono text-[#E8DCCB]/50 uppercase tracking-[0.3em] mt-1 block">
            Paixão que move • Qualidade que entrega
          </span>
        </div>

        <svg 
          viewBox="30 0 100 24" 
          className="w-full filter drop-shadow-[0_-8px_15px_rgba(0,0,0,0.95)] fill-[#917359] opacity-95"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Wave bottom arch mirroring top jute sacks */}
          <path d="M 0 24 L 160 24 L 160 2 Q 80 14, 0 2 Z" fill="#7d6049" />
          <path d="M 0 24 L 160 24 L 160 4 Q 80 16, 0 4 Z" fill="#917359" opacity="0.25" />
        </svg>
      </div>

    </div>
  );
}

