
import React from 'react';
import { X, Trophy, Target, Shield, Zap } from 'lucide-react';
import { Player } from '../types';

interface PlayerStatsModalProps {
  player: Player | null;
  onClose: () => void;
}

const PlayerStatsModal: React.FC<PlayerStatsModalProps> = ({ player, onClose }) => {
  if (!player) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="relative h-32 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 flex items-end">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
              <span className="text-2xl font-black text-blue-600">{player.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">{player.name}</h2>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">{player.role}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={<Trophy className="text-amber-500" size={16}/>} label="Matches" value={player.stats.matches} />
            <StatCard icon={<Zap className="text-blue-500" size={16}/>} label="Strike Rate" value={player.stats.strikeRate} />
            <StatCard icon={<Target className="text-emerald-500" size={16}/>} label="Avg" value={player.stats.average} />
            <StatCard icon={<Shield className="text-purple-500" size={16}/>} label="Wickets" value={player.stats.wickets} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500">Career Runs</span>
              <span className="font-bold dark:text-white">{player.stats.runs}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500">Highest Score</span>
              <span className="font-bold dark:text-white">{player.stats.highScore}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-500">Economy</span>
              <span className="font-bold dark:text-white">{player.stats.economy}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-500">Best Bowling</span>
              <span className="font-bold dark:text-white">{player.stats.bestBowling}</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-2xl transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: number | string }> = ({ icon, label, value }) => (
  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</span>
    </div>
    <div className="text-xl font-black dark:text-white">{value}</div>
  </div>
);

export default PlayerStatsModal;
