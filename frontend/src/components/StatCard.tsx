import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  accentColor?: 'blue' | 'rose' | 'amber' | 'emerald' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'blue',
}) => {
  const colorMap = {
    blue: 'from-blue-500/10 to-indigo-500/5 border-blue-500/20 text-blue-400',
    rose: 'from-rose-500/10 to-pink-500/5 border-rose-500/20 text-rose-400',
    amber: 'from-amber-500/10 to-yellow-500/5 border-amber-500/20 text-amber-400',
    emerald: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-400',
    purple: 'from-purple-500/10 to-violet-500/5 border-purple-500/20 text-purple-400',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 backdrop-blur transition hover:border-slate-700 bg-slate-900/60 ${colorMap[accentColor]}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
        {trend && <span className="text-xs font-semibold text-emerald-400">{trend}</span>}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};
