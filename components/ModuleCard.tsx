
import React from 'react';
import { CurriculumModule } from '../types';

interface ModuleCardProps {
  module: CurriculumModule;
  index: number;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, index }) => {
  const colors = [
    'bg-blue-50 border-blue-200 text-blue-700',
    'bg-purple-50 border-purple-200 text-purple-700',
    'bg-emerald-50 border-emerald-200 text-emerald-700',
    'bg-amber-50 border-amber-200 text-amber-700',
  ];

  const colorClass = colors[index % colors.length];

  return (
    <div className={`p-4 rounded-xl border ${colorClass} transition-all hover:shadow-md`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold text-lg">{module.subject}</span>
      </div>
      <p className="text-sm font-medium mb-3 opacity-90">{module.focus}</p>
      <ul className="space-y-1">
        {module.activities.map((act, i) => (
          <li key={i} className="text-xs flex items-start gap-1">
            <span className="mt-1">•</span>
            <span>{act}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ModuleCard;
