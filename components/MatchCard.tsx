
import React from 'react';
import { Match, MatchStatus, MatchType } from '../types';
import { Clock, Globe, MapPin } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onClick: (match: Match) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onClick }) => {
  const inningA = match.innings?.[0];
  const inningB = match.innings?.[1];

  const getStatusColor = () => {
    switch(match.status) {
      case MatchStatus.LIVE: return 'bg-red-600';
      case MatchStatus.COMPLETED: return 'bg-slate-400';
      case MatchStatus.STUMPS: return 'bg-amber-500';
      default: return 'bg-indigo-600';
    }
  };

  return (
    <div 
      onClick={() => onClick(match)}
      className="group relative bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 cursor-pointer hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] hover:border-indigo-500 transition-all duration-500 transform hover:-translate-y-2 overflow-hidden flex flex-col justify-between min-h-[380px]"
    >
      <div className="flex justify-between items-start mb-10">
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${
            match.type === MatchType.INTERNATIONAL 
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
          }`}>
            {match.type}
          </span>
          {match.status === MatchStatus.LIVE && (
            <span className="flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-600/20 animate-pulse">
              LIVE
            </span>
          )}
        </div>
        <span className="text-[10px] font-black text-slate-400 flex items-center gap-2 italic uppercase">
          <Clock size={14} /> {match.date}
        </span>
      </div>

      <div className="space-y-10">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 space-y-1">
            <h3 className="text-2xl font-black dark:text-white truncate group-hover:text-indigo-600 transition-colors uppercase italic tracking-tighter leading-none">{match.teamA}</h3>
            <p className="text-3xl font-black tabular-nums dark:text-slate-200 tracking-tighter">
              {inningA ? `${inningA.totalRuns}/${inningA.wickets}` : '0/0'}
              {inningA && (inningA.overs > 0 || inningA.balls > 0) && (
                <span className="text-[11px] text-slate-400 font-black ml-2 opacity-60 uppercase tracking-widest">({inningA.overs}.{inningA.balls})</span>
              )}
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-black text-slate-200 dark:text-slate-800 italic uppercase">VS</span>
            <div className="w-px h-12 bg-slate-100 dark:bg-slate-800 my-2"></div>
          </div>

          <div className="flex-1 text-right space-y-1">
            <h3 className="text-2xl font-black dark:text-white truncate group-hover:text-indigo-600 transition-colors uppercase italic tracking-tighter leading-none">{match.teamB}</h3>
            <p className="text-3xl font-black tabular-nums dark:text-slate-200 tracking-tighter">
              {inningB ? `${inningB.totalRuns}/${inningB.wickets}` : '0/0'}
              {inningB && (inningB.overs > 0 || inningB.balls > 0) && (
                <span className="text-[11px] text-slate-400 font-black mr-2 opacity-60 uppercase tracking-widest">({inningB.overs}.{inningB.balls})</span>
              )}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-3 mb-2">
             <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor()} shadow-lg`}></div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Match Narrative</span>
          </div>
          <p className="text-xs font-black italic dark:text-white uppercase tracking-tight leading-relaxed">
            {match.statusText || 'Broadcasting Match Data...'}
          </p>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 max-w-[160px] truncate uppercase italic">
            <MapPin size={14} className="shrink-0 text-indigo-500" />
            <span className="truncate">{match.venue}</span>
          </div>
          {match.source && (
            <span className="text-[9px] font-black text-indigo-500/60 uppercase tracking-[0.2em] flex items-center gap-2 italic">
              <Globe size={12} /> {match.source}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
