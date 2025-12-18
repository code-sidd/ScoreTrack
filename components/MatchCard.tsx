
import React from 'react';
import { Match, MatchStatus, MatchType } from '../types';
import { Trophy, Clock, Globe, MapPin, TrendingUp } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onClick: (match: Match) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onClick }) => {
  const currentInning = match.innings[0];

  return (
    <div 
      onClick={() => onClick(match)}
      className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 cursor-pointer hover:shadow-2xl hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500"></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] ${
            match.type === MatchType.INTERNATIONAL 
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' 
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
          }`}>
            {match.type}
          </span>
          {match.status === MatchStatus.LIVE && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border border-red-200 dark:border-red-500/20 animate-pulse">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
              LIVE
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg">
          <Clock size={12} className="text-slate-400" /> {match.date}
        </span>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 flex flex-col">
            <h3 className="text-xl font-black group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors truncate">{match.teamA}</h3>
            {currentInning && match.status !== MatchStatus.UPCOMING && currentInning.battingTeamId === match.teamA && (
              <p className="text-sm font-black text-slate-500 mt-1 tabular-nums">
                {currentInning.totalRuns}/{currentInning.wickets} <span className="text-slate-400 font-medium text-xs">({currentInning.overs}.{currentInning.balls})</span>
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-center">
             <div className="text-[10px] font-black text-slate-300 dark:text-slate-700 italic mb-1 uppercase tracking-tighter">VS</div>
             <div className="w-8 h-px bg-slate-100 dark:bg-slate-800"></div>
          </div>

          <div className="flex-1 flex flex-col text-right">
            <h3 className="text-xl font-black group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors truncate">{match.teamB}</h3>
            {currentInning && match.status !== MatchStatus.UPCOMING && currentInning.battingTeamId === match.teamB && (
              <p className="text-sm font-black text-slate-500 mt-1 tabular-nums text-right">
                {currentInning.totalRuns}/{currentInning.wickets} <span className="text-slate-400 font-medium text-xs">({currentInning.overs}.{currentInning.balls})</span>
              </p>
            )}
          </div>
        </div>

        {match.summary && (
          <div className="bg-blue-50/50 dark:bg-blue-500/5 p-3 rounded-xl border border-blue-100/50 dark:border-blue-500/10">
             <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={12} className="text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Live Insight</span>
             </div>
             <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
               {match.summary}
             </p>
          </div>
        )}

        <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 truncate bg-slate-50 dark:bg-slate-800/30 px-2 py-1 rounded-lg">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{match.venue}</span>
          </div>
          {match.source && (
            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 italic uppercase tracking-tighter shrink-0">
              <Globe size={11} /> {match.source}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
