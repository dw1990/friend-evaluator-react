import { useMemo, useState } from 'react';
import { useStore } from '../store';
import clsx from 'clsx';
import { MissingValuesCard } from './analytics/MissingValuesCard';
import { AmbivalenceCard } from './analytics/AmbivalenceCard';
import { SystemicIssuesCard } from './analytics/SystemicIssuesCard';
import { EnergyBalanceCard } from './analytics/EnergyBalanceCard';
import { DominantTraitsCard } from './analytics/DominantTraitsCard';
import { GroupRanking } from './analytics/GroupRanking';

export function AnalyticsView() {
  const { friends, traits, groups } = useStore();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');

  const filteredFriends = useMemo(() => {
    if (selectedGroupId === 'ALL') return friends;
    if (selectedGroupId === 'NONE') return friends.filter(f => !f.groupId);
    return friends.filter(f => f.groupId === selectedGroupId);
  }, [friends, selectedGroupId]);

  if (friends.length === 0) return <div className="p-10 text-center text-slate-400">Erfasse erst ein paar Personen für eine Analyse.</div>;

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      
      {/* FILTER HEADER */}
      <div className="bg-white border-b border-slate-200 p-4 flex gap-2 overflow-x-auto no-scrollbar">
        <button onClick={() => setSelectedGroupId('ALL')} className={clsx("px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition", selectedGroupId === 'ALL' ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>Alle ({friends.length})</button>
        {groups.map(g => (
          <button key={g.id} onClick={() => setSelectedGroupId(g.id)} className={clsx("px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition", selectedGroupId === g.id ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300")}>{g.name}</button>
        ))}
        <button onClick={() => setSelectedGroupId('NONE')} className={clsx("px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition", selectedGroupId === 'NONE' ? "bg-slate-400 text-white" : "bg-white border border-slate-200 text-slate-400 hover:border-slate-400")}>Ohne Gruppe</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* ROW 1: Die "Problem-Finder" */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MissingValuesCard friends={filteredFriends} traits={traits} />
            <AmbivalenceCard friends={filteredFriends} traits={traits} />
            <SystemicIssuesCard friends={filteredFriends} traits={traits} />
          </div>

          {/* ROW 2: Die "Statistiken" */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnergyBalanceCard friends={filteredFriends} traits={traits} />
            <DominantTraitsCard friends={filteredFriends} traits={traits} />
          </div>

          {/* ROW 3: Gruppen (Nur sichtbar, wenn "Alle" ausgewählt) */}
          {selectedGroupId === 'ALL' && (
            <GroupRanking friends={friends} groups={groups} traits={traits} />
          )}

        </div>
      </div>
    </div>
  );
}