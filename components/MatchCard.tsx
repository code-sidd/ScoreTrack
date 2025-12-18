
import React from 'react';
import { Match, MatchStatus, MatchType } from '../types';
import { Trophy, Clock, Globe, MapPin, TrendingUp, Info } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onClick: (match: Match) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onClick }) => {
  const inningA = match.innings[0];
  const inningB = match.innings[1];

  const getStatusColor = () => {
    switch(match.status) {
      case MatchStatus.LIVE: return 'bg-red-500';
      case MatchStatus.COMPLETED: return 'bg-slate-500';
      case MatchStatus.STUMPS: return 'bg-amber-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div 
      onClick={() => onClick(match)}
      className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-7 cursor-pointer hover:shadow-2xl hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
            match.type === MatchType.INTERNATIONAL 
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
          }`}>
            {match.type}
          </span>
          {match.status === MatchStatus.LIVE && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-200 animate-pulse">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              LIVE
            </span>
          )}
        </div>
        <span className="text-[10px] font-black text-slate-400 flex items-center gap-1.5">
          <Clock size={12} /> {match.date}
        </span>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center gap-2">
          <div className="flex-1">
            <h3 className="text-xl font-black dark:text-white truncate group-hover:text-blue-600 transition-colors uppercase italic">{match.teamA}</h3>
            <p className="text-lg font-black tabular-nums dark:text-slate-300">
              {inningA.totalRuns}/{inningA.wickets}
              <span className="text-[10px] text-slate-400 font-bold ml-1">({inningA.overs}.{inningA.balls})</span>
            </p>
          </div>
          <div className="flex flex-col items-center px-2">
            <span className="text-[10px] font-black text-slate-200 dark:text-slate-800 italic">VS</span>
            <div className="w-px h-8 bg-slate-100 dark:bg-slate-800"></div>
          </div>
          <div className="flex-1 text-right">
            <h3 className="text-xl font-black dark:text-white truncate group-hover:text-blue-600 transition-colors uppercase italic">{match.teamB}</h3>
            <p className="text-lg font-black tabular-nums dark:text-slate-300">
              {inningB.totalRuns}/{inningB.wickets}
              <span className="text-[10px] text-slate-400 font-bold ml-1">({inningB.overs}.{inningB.balls})</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1">
             <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Match Status</span>
          </div>
          <p className="text-xs font-black italic dark:text-white uppercase tracking-tight">
            {match.statusText || 'Update Pending'}
          </p>
        </div>

        <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 max-w-[140px] truncate">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{match.venue}</span>
          </div>
          {match.source && (
            <span className="text-[9px] font-black text-blue-500/60 uppercase tracking-tighter flex items-center gap-1">
              <Globe size={10} /> {match.source}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
