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
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 p-4 md:p-8">
      
      <header className="max-w-[1600px] mx-auto mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          {/* REBRANDING */}
          <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-2">
            The <span className="text-indigo-600">Mirror</span>
          </h1>
          <p className="text-slate-500 font-medium">Dein Umfeld ist dein Spiegelbild.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex">
            <button
              onClick={() => setActiveTab('matrix')}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition",
                activeTab === 'matrix' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <LayoutGrid className="w-4 h-4" /> Übersicht
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition",
                activeTab === 'analytics' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <PieChart className="w-4 h-4" /> Analyse
            </button>
          </div>

          <DataMenu />
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto h-[85vh]">
        
        {activeTab === 'matrix' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            <div className="lg:col-span-8 h-full overflow-hidden">
              <FriendMatrix />
            </div>
            <div className="lg:col-span-4 h-full overflow-hidden">
              <SettingsPanel />
            </div>
          </div>
        ) : (
          <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <AnalyticsView />
          </div>
        )}

      </main>
    </div>
  );
}

export default App;