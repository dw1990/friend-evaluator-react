import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Download, Upload, Trash2, Database, X } from 'lucide-react';
import clsx from 'clsx';

export function DataMenu() {
  const { friends, traits, loadData, resetAll } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Klick außerhalb schließt das Menü (UX Best Practice)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = () => {
    const data = { friends, traits, exportDate: new Date().toISOString(), version: 1 };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `friend-evaluator-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json.friends) && Array.isArray(json.traits)) {
          if (confirm('Achtung: Aktuelle Daten werden überschrieben.')) {
            loadData({ friends: json.friends, traits: json.traits });
          }
        } else {
          alert('Ungültiges Format.');
        }
      } catch (err) { console.error(err); }
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsOpen(false);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Alles löschen?')) resetAll();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Der Trigger Button (im Header sichtbar) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition shadow-sm border",
          isOpen 
            ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
        )}
      >
        <Database className="w-4 h-4" />
        <span className="hidden sm:inline">Daten verwalten</span>
      </button>

      {/* Das Dropdown (Absolute Position) */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          
          <div className="flex justify-between items-center px-3 py-2 border-b border-slate-50 mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Optionen</span>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1">
            <button 
              onClick={handleExport}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition text-left"
            >
              <Download className="w-4 h-4 text-indigo-500" /> Backup speichern
            </button>

            <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            <button 
              onClick={handleImportClick}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition text-left"
            >
              <Upload className="w-4 h-4 text-emerald-500" /> Backup laden
            </button>

            <div className="h-px bg-slate-100 my-1"></div>

            <button 
              onClick={handleReset}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition text-left"
            >
              <Trash2 className="w-4 h-4" /> Alles zurücksetzen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}