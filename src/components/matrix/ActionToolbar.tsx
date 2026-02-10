import { useState, useRef } from 'react';
import { useStore } from '../../store';
import { UserPlus, Plus, FolderPlus, Filter, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface Props {
  activeGroupId: string | null;
  onToggleFilter: (groupId: string | null) => void;
}

export function ActionToolbar({ activeGroupId, onToggleFilter }: Props) {
  const { groups, addFriend, addGroup, removeGroup } = useStore();

  const [newFriendName, setNewFriendName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const friendInputRef = useRef<HTMLInputElement>(null);

  // HELPER: Macht den ersten Buchstaben groß
  const formatInput = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return '';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  const handleAddFriend = () => {
    if (!newFriendName.trim()) return;
    // HIER: formatInput nutzen
    addFriend(formatInput(newFriendName));
    setNewFriendName('');
    setTimeout(() => friendInputRef.current?.focus(), 0);
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    // HIER: formatInput nutzen
    addGroup(formatInput(newGroupName));
    setNewGroupName('');
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
      {/* ... Rest bleibt gleich (JSX Code) ... */}
      
      {/* ZEILE 1: Person hinzufügen */}
      <div className="flex gap-2 w-full">
        <div className="relative flex-1">
          <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={friendInputRef}
            type="text"
            placeholder="Name einer neuen Person..."
            value={newFriendName}
            onChange={(e) => setNewFriendName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-sm"
          />
        </div>
        <button
          onClick={handleAddFriend}
          className="bg-slate-800 text-white px-4 rounded-lg hover:bg-slate-900 transition active:scale-95 shadow-sm flex items-center justify-center font-medium text-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Hinzufügen
        </button>
      </div>

      {/* ZEILE 2: Gruppen & Filter */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
        
        {/* Input Neue Gruppe */}
        <div className="flex gap-1">
          <div className="relative w-40">
            <FolderPlus className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Neue Gruppe..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
              className="w-full pl-8 pr-2 py-1.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-slate-50 focus:bg-white transition"
            />
          </div>
          <button
            onClick={handleAddGroup}
            className="bg-white text-slate-500 border border-slate-200 px-2 rounded-md hover:bg-slate-50 hover:text-indigo-600 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ... Rest der Filter-Logik bleibt gleich ... */}
        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
        {/* ... Filter Chips ... */}
        {/* (Hier muss nichts geändert werden) */}
        <div className="flex flex-wrap gap-2 items-center flex-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button onClick={() => onToggleFilter(null)} className={clsx("px-2.5 py-1 rounded-full text-xs font-bold border transition", activeGroupId === null ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300")}>Alle</button>
          <AnimatePresence mode="popLayout">
            {groups.map(g => (
              <motion.div key={g.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="relative group">
                <button onClick={() => onToggleFilter(g.id)} className={clsx("pl-2.5 pr-7 py-1 rounded-full text-xs font-bold border transition flex items-center gap-1", activeGroupId === g.id ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-indigo-50 text-indigo-700 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-100")}>{g.name}</button>
                <button onClick={(e) => { e.stopPropagation(); removeGroup(g.id); }} className={clsx("absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-black/20 transition", activeGroupId === g.id ? "text-white/70 hover:text-white" : "text-indigo-400 hover:text-red-600")}>{activeGroupId === g.id ? <X className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}</button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}