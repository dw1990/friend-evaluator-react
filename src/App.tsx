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
        
        {/* LOGO & BRANDING (Prisma) */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-2xl">💎</span>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none mb-1">
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
            {/* Linke Seite: Die Matrix */}
            <div className="lg:col-span-8 h-full overflow-hidden flex flex-col">
              <FriendMatrix />
            </div>
            
            {/* Rechte Seite: Einstellungen / Traits */}
            <div className="lg:col-span-4 h-full overflow-hidden flex flex-col">
              <SettingsPanel />
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