import React from 'react';
import { cn } from '../lib/utils';

export interface LicensePlateProps {
  plate: string;
  type?: 'cavalo' | 'carreta' | 'veiculo';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// High-fidelity Brazilian Mercosul License Plate Component
export const LicensePlate: React.FC<LicensePlateProps> = ({ 
  plate, 
  type = 'cavalo', 
  size = 'md',
  className
}) => {
  if (!plate || plate === '-' || plate.trim() === '') {
    return <span className="text-[#5c3c24] font-mono font-bold text-xs">-</span>;
  }
  
  const cleanPlate = plate.trim().toUpperCase();
  const isCarreta = type === 'carreta';
  const isCavalo = type === 'cavalo';
  
  // Custom headers based on plate type
  const headerText = isCavalo ? 'CAVALO' : isCarreta ? 'CARRETA' : 'BRASIL';
  
  // Outer container color & border classes
  const plateContainerClasses = cn(
    "inline-flex flex-col items-center justify-center overflow-hidden select-none font-mono tracking-wider shrink-0 transform transition-transform hover:scale-105 rounded-lg shadow-[0_3px_6px_rgba(0,0,0,0.3)]",
    size === 'sm' ? "w-[95px] h-[32px] rounded-md" : size === 'lg' ? "w-[140px] h-[48px] rounded-xl" : "w-[120px] h-[40px] rounded-lg",
    isCarreta 
      ? "bg-[#fffde7] border-2 border-[#e6b800]" 
      : "bg-[#f7f4ed] border-2 border-[#5c3c24]/80",
    className
  );

  // Character container gradient classes
  const charBgClasses = cn(
    "w-full flex-1 flex items-center justify-center px-1.5",
    isCarreta 
      ? "bg-gradient-to-b from-[#fff176] to-[#fbc02d]" 
      : "bg-gradient-to-b from-[#ffffff] to-[#e8e4db]"
  );

  return (
    <div className={plateContainerClasses}>
      {/* Blue Mercosul Header */}
      <div className={cn(
        "w-full bg-[#0051A2] flex items-center justify-between px-1.5 leading-none relative", 
        size === 'sm' ? "h-[8px]" : size === 'lg' ? "h-[12px]" : "h-[10px]"
      )}>
        <span className={cn(
          "text-white font-sans font-bold scale-95", 
          size === 'sm' ? "text-[4.5px]" : size === 'lg' ? "text-[6px]" : "text-[5px]"
        )}>
          BR
        </span>
        <span className={cn(
          "text-white font-sans font-black tracking-widest uppercase absolute left-1/2 -translate-x-1/2", 
          size === 'sm' ? "text-[5.5px]" : size === 'lg' ? "text-[7.5px]" : "text-[6.5px]"
        )}>
          {headerText}
        </span>
        {/* Tiny Brazil Flag */}
        <div className={cn(
          "bg-[#009b3a] border border-white/20 flex items-center justify-center relative rounded-[1px] overflow-hidden", 
          size === 'sm' ? "w-[6.5px] h-[4.5px]" : size === 'lg' ? "w-[10px] h-[7px]" : "w-[8px] h-[5.5px]"
        )}>
          <div className={cn(
            "bg-yellow-400 rotate-45 transform flex items-center justify-center", 
            size === 'sm' ? "w-[3.5px] h-[2px]" : size === 'lg' ? "w-[5.5px] h-[3.5px]" : "w-[4.5px] h-[3px]"
          )}>
            <div className={cn("bg-blue-800 rounded-full", size === 'sm' ? "w-[1px] h-[1px]" : "w-[1.5px] h-[1.5px]")}></div>
          </div>
        </div>
      </div>
      {/* License plate characters */}
      <div className={charBgClasses}>
        <span 
          className={cn(
            "text-[#1a1c1d] font-black tracking-wide leading-none select-all animate-fade-in font-mono", 
            size === 'sm' ? "text-[12px]" : size === 'lg' ? "text-[18px]" : "text-[15px]"
          )} 
          style={{ textShadow: isCarreta ? '0.5px 0.5px 0px rgba(255, 255, 255, 0.4)' : '0.5px 0.5px 0px rgba(255, 255, 255, 0.8)' }}
        >
          {cleanPlate}
        </span>
      </div>
    </div>
  );
};

export default LicensePlate;
