import { useState } from 'react';
import { SettingsPanel } from './components/SettingsPanel';
import { FriendMatrix } from './components/FriendMatrix';
import { DataMenu } from './components/DataMenu';
import { AnalyticsView } from './components/AnalyticsView';
import { LayoutGrid, PieChart } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'analytics'>('matrix');

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      
      {/* --- HEADER --- */}
      <header className="max-w-[1600px] mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        
        {/* LOGO & BRANDING */}
        <div className="flex items-center gap-4">
          {/* NEU: Das Bild-Logo statt Emoji */}
          {/* Stelle sicher, dass 'prisma-logo.png' im 'public' Ordner liegt */}
          <img 
            src="/prisma.svg" 
            alt="Prisma Logo" 
            className="w-16 h-16 object-contain rounded-xl"
          />
          
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none mb-1">
              Prisma
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Erkenne die Facetten. Finde den Kern.
            </p>
          </div>
        </div>

        {/* NAVIGATION & DATA */}
        <div className="flex items-center gap-4">
          
          {/* Tabs Switcher */}
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex">
            <button
              onClick={() => setActiveTab('matrix')}
              className={clsx(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all",
                activeTab === 'matrix' 
                  ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <LayoutGrid className="w-4 h-4" /> Übersicht
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={clsx(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all",
                activeTab === 'analytics' 
                  ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <PieChart className="w-4 h-4" /> Analyse
            </button>
          </div>

          {/* Daten Menü (Import/Export/Reset) */}
          <DataMenu />
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-[1600px] mx-auto h-[82vh]">
        
        {activeTab === 'matrix' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            
            {/* LINKES PANEL: Einstellungen / Traits (Steuerpult) */}
            <div className="lg:col-span-4 h-full overflow-hidden flex flex-col order-1">
              <SettingsPanel />
            </div>

            {/* RECHTES PANEL: Die Matrix (Ergebnis) */}
            <div className="lg:col-span-8 h-full overflow-hidden flex flex-col order-2">
              <FriendMatrix />
            </div>
            
          </div>
        ) : (
          /* Analyse View (Full Width) */
          <div className="h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <AnalyticsView />
          </div>
        )}

      </main>
    </div>
  );
}

export default App;