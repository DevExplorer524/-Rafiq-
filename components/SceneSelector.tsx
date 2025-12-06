
import React from 'react';
import { Briefcase, Home, GraduationCap, LayoutGrid } from 'lucide-react';
import { SceneType } from '../types';

interface SceneSelectorProps {
  currentScene: SceneType;
  onSelect: (scene: SceneType) => void;
  isDarkMode: boolean;
}

export const SceneSelector: React.FC<SceneSelectorProps> = ({ currentScene, onSelect, isDarkMode }) => {
  const scenes = [
    { id: 'all', label: 'الكل', icon: LayoutGrid },
    { id: 'work', label: 'العمل', icon: Briefcase },
    { id: 'study', label: 'الدراسة', icon: GraduationCap },
    { id: 'personal', label: 'البيت', icon: Home },
  ];

  return (
    <div className={`flex p-1.5 rounded-2xl mb-6 overflow-x-auto ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
      {scenes.map((scene) => {
        const Icon = scene.icon;
        const isActive = currentScene === scene.id;
        return (
          <button
            key={scene.id}
            onClick={() => onSelect(scene.id as SceneType)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-all whitespace-nowrap
              ${isActive 
                ? (isDarkMode ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-800 shadow-sm') 
                : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')}
            `}
          >
            <Icon size={16} />
            <span>{scene.label}</span>
          </button>
        );
      })}
    </div>
  );
};
