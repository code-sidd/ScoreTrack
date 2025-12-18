
import React, { useState } from 'react';
import { X, Trophy, Users, ChevronRight, Hash } from 'lucide-react';
import { Match, MatchType, MatchStatus } from '../types';

interface CreateMatchFormProps {
  onClose: () => void;
  onSave: (match: Match) => void;
}

const CreateMatchForm: React.FC<CreateMatchFormProps> = ({ onClose, onSave }) => {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [overs, setOvers] = useState('20');
  const [playerCount, setPlayerCount] = useState('11');
  const [venue, setVenue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA || !teamB || !overs || !venue) return;

    const newMatch: Match = {
      id: `local-${Date.now()}`,
      type: MatchType.LOCAL,
      title: `${teamA} vs ${teamB}`,
      teamA,
      teamB,
      overs: parseInt(overs),
      status: MatchStatus.UPCOMING,
      statusText: 'Upcoming Local Match',
      venue,
      date: new Date().toISOString().split('T')[0],
      innings: [
        { teamId: teamA, totalRuns: 0, wickets: 0, overs: 0, balls: 0, deliveries: [] },
        { teamId: teamB, totalRuns: 0, wickets: 0, overs: 0, balls: 0, deliveries: [] }
      ],
      currentInning: 0
    };

    onSave(newMatch);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center">
               <Trophy className="text-white" size={20} />
             </div>
             <h2 className="text-xl font-black italic dark:text-white">START NEW GAME</h2>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
             <X size={20} className="text-slate-500" />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Team A Name</label>
              <input 
                value={teamA} onChange={e => setTeamA(e.target.value)} required
                placeholder="Enter team A"
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-bold dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Team B Name</label>
              <input 
                value={teamB} onChange={e => setTeamB(e.target.value)} required
                placeholder="Enter team B"
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-bold dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1 flex items-center gap-1">
                  <Hash size={10}/> Total Overs
                </label>
                <input 
                  type="number" value={overs} onChange={e => setOvers(e.target.value)} required
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-bold dark:text-white"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1 flex items-center gap-1">
                  <Users size={10}/> Players/Side
                </label>
                <input 
                  type="number" value={playerCount} onChange={e => setPlayerCount(e.target.value)} required
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-bold dark:text-white"
                />
             </div>
             <div className="space-y-2 md:col-span-1 col-span-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Venue</label>
                <input 
                  value={venue} onChange={e => setVenue(e.target.value)} required
                  placeholder="Stadium/Park"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-bold dark:text-white"
                />
             </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-200 dark:border-slate-700">
             <h4 className="text-sm font-black dark:text-white mb-4 italic">QUICK TEAM SETUP</h4>
             <p className="text-xs text-slate-500 mb-4">Players can be added later during the scoring process or profiles can be linked.</p>
             <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                   <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                   <span className="text-xs font-bold dark:text-slate-300">Squad A (Empty)</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                   <div className="w-2 h-2 rounded-full bg-red-500"></div>
                   <span className="text-xs font-bold dark:text-slate-300">Squad B (Empty)</span>
                </div>
             </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-3xl transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            START MATCH <ChevronRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMatchForm;
