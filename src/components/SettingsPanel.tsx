import { useStore } from '../store';
import { TraitForm } from './settings/TraitForm';
import { TraitList } from './settings/TraitList';

export function SettingsPanel() {
  const { traits, addTrait, removeTrait } = useStore();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6 h-full overflow-y-auto">
      
      {/* 1. Formular Component */}
      <TraitForm onAdd={addTrait} />

      <hr className="border-slate-100" />

      {/* 2. Listen Component */}
      <TraitList traits={traits} onRemove={removeTrait} />

    </div>
  );
}