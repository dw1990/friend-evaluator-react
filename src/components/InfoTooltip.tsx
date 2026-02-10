import { Info } from 'lucide-react';

interface Props {
  text: string;
}

export function InfoTooltip({ text }: Props) {
  return (
    <div className="relative group ml-2 inline-block align-middle">
      {/* Das Icon */}
      <Info className="w-4 h-4 text-slate-300 hover:text-indigo-500 cursor-help transition-colors" />
      
      {/* Der Tooltip (Jetzt UNTEN positioniert) */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-3 bg-slate-800 text-white text-[10px] leading-tight rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
        {text}
        
        {/* Der kleine Pfeil (sitzt jetzt oben auf der Box und zeigt zum Icon) */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800" />
      </div>
    </div>
  );
}