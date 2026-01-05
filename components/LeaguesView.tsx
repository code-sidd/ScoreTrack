
import React, { useState } from 'react';
import { Trophy, Calendar, Shield, Zap, Lock, Info, ChevronRight, Swords, Sparkles } from 'lucide-react';
import MatchPrepModal from './MatchPrepModal';

interface LeagueMatch {
  id: string;
  team1: string;
  team2: string;
  date: string;
  time: string;
  venue: string;
}

const USER_TEAM = "Titans XI";

const LEAGUE_MATCHES: LeagueMatch[] = [
  { id: 'lm-1', team1: "Titans XI", team2: "City Warriors", date: "May 28, 2026", time: "10:00 AM", venue: "Metro Arena 1" },
  { id: 'lm-2', team1: "Royal Strikers", team2: "Thunder Bolts", date: "May 28, 2026", time: "02:30 PM", venue: "Metro Arena 2" },
  { id: 'lm-3', team1: "Thunder Bolts", team2: "Titans XI", date: "June 01, 2026", time: "10:00 AM", venue: "City Grounds" },
  { id: 'lm-4', team1: "City Warriors", team2: "Royal Strikers", date: "June 01, 2026", time: "02:30 PM", venue: "Central Stadium" },
];

const LeaguesView: React.FC = () => {
  const [selectedMatch, setSelectedMatch] = useState<LeagueMatch | null>(null);

  const handleMatchPrepClick = (match: LeagueMatch) => {
    const isUserMatch = match.team1 === USER_TEAM || match.team2 === USER_TEAM;
    if (isUserMatch) {
      setSelectedMatch(match);
    } else {
      alert("🔒 Upgrade to PRO to scout neutral teams and unlock competitor analytics!");
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Header section */}
      <section className="bg-slate-900 dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Trophy className="text-lime-400" size={24} />
              <h3 className="text-lime-400 text-xs font-black uppercase tracking-[0.4em] italic">Active Tournament</h3>
            </div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Metro Premier League 2026</h2>
          </div>
          <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-3xl border border-slate-700">
             <div className="w-12 h-12 bg-lime-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                <Shield className="text-slate-900" size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Team</p>
                <p className="text-white font-black italic uppercase">Titans XI</p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/5 rounded-full blur-[80px]"></div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Teams List */}
        <div className="lg:col-span-1 space-y-6">
          <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 italic">Participating Teams</h4>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
             {["Titans XI", "City Warriors", "Royal Strikers", "Thunder Bolts"].map(team => (
               <div key={team} className={`flex items-center justify-between p-4 rounded-2xl border ${team === USER_TEAM ? 'bg-lime-400/10 border-lime-400/30' : 'bg-slate-50 dark:bg-slate-800 border-transparent'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${team === USER_TEAM ? 'bg-lime-400 text-slate-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                      {team.charAt(0)}
                    </div>
                    <span className={`font-black italic uppercase text-sm ${team === USER_TEAM ? 'text-lime-400' : 'text-slate-600 dark:text-slate-300'}`}>{team}</span>
                  </div>
                  {team === USER_TEAM && <span className="text-[8px] font-black bg-lime-400 text-slate-900 px-2 py-1 rounded uppercase italic">Owner</span>}
               </div>
             ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 italic">Upcoming Schedule</h4>
          <div className="space-y-4">
            {LEAGUE_MATCHES.map(match => {
              const isUserMatch = match.team1 === USER_TEAM || match.team2 === USER_TEAM;
              return (
                <div key={match.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 hover:border-lime-400/50 transition-all group">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="space-y-6 flex-1">
                        <div className="flex items-center gap-4 text-slate-400">
                          <Calendar size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{match.date} • {match.time}</span>
                          <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest ml-auto md:ml-0 italic">Group Stage</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-center md:text-left">
                            <h5 className={`text-xl font-black italic uppercase tracking-tighter ${match.team1 === USER_TEAM ? 'text-lime-400' : 'dark:text-white'}`}>{match.team1}</h5>
                          </div>
                          <div className="flex flex-col items-center opacity-30">
                            <Swords size={20} className="text-slate-400" />
                          </div>
                          <div className="text-center md:text-right">
                            <h5 className={`text-xl font-black italic uppercase tracking-tighter ${match.team2 === USER_TEAM ? 'text-lime-400' : 'dark:text-white'}`}>{match.team2}</h5>
                          </div>
                        </div>
                      </div>

                      <div className="md:w-px h-12 bg-slate-100 dark:bg-slate-800 hidden md:block"></div>

                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={() => handleMatchPrepClick(match)}
                          className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                            isUserMatch 
                              ? 'bg-lime-400 text-slate-900 shadow-[0_10px_20px_rgba(163,230,53,0.2)] hover:scale-105 active:scale-95' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {isUserMatch ? <><Sparkles size={16} /> View AI Match Prep</> : <><Lock size={16} /> Match Prep (PRO)</>}
                        </button>
                        <p className="text-[9px] text-center text-slate-500 font-bold uppercase tracking-widest">Venue: {match.venue}</p>
                      </div>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedMatch && <MatchPrepModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}
    </div>
  );
};

export default LeaguesView;
