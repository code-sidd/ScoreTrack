
import React, { useState } from 'react';
import { X, Trophy, Users, ChevronRight, Hash, UserPlus, Coins } from 'lucide-react';
import { Match, MatchType, MatchStatus, Inning, PlayerMatchStats } from '../types';

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
  const [squadA, setSquadA] = useState<string[]>([]);
  const [squadB, setSquadB] = useState<string[]>([]);
  const [currentInputA, setCurrentInputA] = useState('');
  const [currentInputB, setCurrentInputB] = useState('');
  
  // Toss State
  const [tossWinner, setTossWinner] = useState('');
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat');

  const addPlayer = (team: 'A' | 'B') => {
    const name = team === 'A' ? currentInputA : currentInputB;
    const max = parseInt(playerCount);
    if (!name) return;
    
    if (team === 'A') {
      if (squadA.length >= max) return;
      setSquadA([...squadA, name]);
      setCurrentInputA('');
    } else {
      if (squadB.length >= max) return;
      setSquadB([...squadB, name]);
      setCurrentInputB('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numOvers = parseInt(overs);
    const numPlayers = parseInt(playerCount);

    if (!teamA || !teamB || isNaN(numOvers) || numOvers <= 0 || !venue || !tossWinner) {
      alert("Please fill all fields, including toss details.");
      return;
    }

    // Determine who bats first
    const teamBatsFirst = tossDecision === 'bat' ? tossWinner : (tossWinner === teamA ? teamB : teamA);
    const teamBowlsFirst = teamBatsFirst === teamA ? teamB : teamA;

    // Helper to generate squad with placeholders
    const getFinalSquad = (customSquad: string[], teamName: string) => {
      const final = [...customSquad];
      for (let i = final.length; i < numPlayers; i++) {
        final.push(`${teamName} Player ${i + 1}`);
      }
      return final;
    };

    const finalSquadA = getFinalSquad(squadA, teamA);
    const finalSquadB = getFinalSquad(squadB, teamB);

    const createInitialStats = (squad: string[]) => {
      const stats: Record<string, PlayerMatchStats> = {};
      squad.forEach((name, idx) => {
        const id = `p-${idx}-${Date.now()}`;
        stats[id] = {
          id, name, runs: 0, balls: 0, fours: 0, sixes: 0,
          overs: 0, ballsBowled: 0, runsConceded: 0, wickets: 0, isOut: false
        };
      });
      return stats;
    };

    // Correctly assign innings based on toss
    const firstBattingSquad = teamBatsFirst === teamA ? finalSquadA : finalSquadB;
    const secondBattingSquad = teamBatsFirst === teamA ? finalSquadB : finalSquadA;

    const newMatch: Match = {
      id: `local-${Date.now()}`,
      type: MatchType.LOCAL,
      title: `${teamA} vs ${teamB}`,
      teamA,
      teamB,
      overs: numOvers,
      playerCount: numPlayers,
      status: MatchStatus.LIVE,
      statusText: 'In Progress',
      venue,
      date: new Date().toISOString().split('T')[0],
      innings: [
        { 
          teamId: teamBatsFirst, 
          totalRuns: 0, wickets: 0, overs: 0, balls: 0, deliveries: [],
          playerStats: createInitialStats(firstBattingSquad)
        },
        { 
          teamId: teamBowlsFirst, 
          totalRuns: 0, wickets: 0, overs: 0, balls: 0, deliveries: [],
          playerStats: createInitialStats(secondBattingSquad)
        }
      ],
      currentInning: 0,
      squadA: finalSquadA,
      squadB: finalSquadB,
      tossWinner,
      tossDecision
    };

    onSave(newMatch);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center">
               <Trophy className="text-white" size={20} />
             </div>
             <h2 className="text-xl font-black italic dark:text-white uppercase tracking-tight">Setup Local Match</h2>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
             <X size={20} className="text-slate-500" />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Team A Name</label>
              <input 
                value={teamA} onChange={e => setTeamA(e.target.value)} required
                placeholder="Tech Titans"
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-bold dark:text-white"
              />
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-slate-400">Add Players (Optional)</label>
                <div className="flex gap-2">
                  <input 
                    value={currentInputA} onChange={e => setCurrentInputA(e.target.value)}
                    placeholder="Enter player name"
                    className="flex-1 px-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none font-bold dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPlayer('A'))}
                  />
                  <button type="button" onClick={() => addPlayer('A')} className="p-2 bg-blue-600 text-white rounded-xl"><UserPlus size={18}/></button>
                </div>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                   {squadA.map((p, i) => <span key={i} className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{p}</span>)}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Team B Name</label>
              <input 
                value={teamB} onChange={e => setTeamB(e.target.value)} required
                placeholder="Code Crushers"
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-bold dark:text-white"
              />
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-slate-400">Add Players (Optional)</label>
                <div className="flex gap-2">
                  <input 
                    value={currentInputB} onChange={e => setCurrentInputB(e.target.value)}
                    placeholder="Enter player name"
                    className="flex-1 px-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none font-bold dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPlayer('B'))}
                  />
                  <button type="button" onClick={() => addPlayer('B')} className="p-2 bg-blue-600 text-white rounded-xl"><UserPlus size={18}/></button>
                </div>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                   {squadB.map((p, i) => <span key={i} className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{p}</span>)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1 flex items-center gap-1">
                  <Hash size={10}/> Match Overs
                </label>
                <input 
                  type="number" value={overs} onChange={e => setOvers(e.target.value)} required min="1"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-bold dark:text-white"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1 flex items-center gap-1">
                  <Users size={10}/> Players Per Side
                </label>
                <input 
                  type="number" value={playerCount} onChange={e => setPlayerCount(e.target.value)} required min="2"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-bold dark:text-white"
                />
             </div>
          </div>

          <div className="p-6 bg-slate-100 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Coins size={16} className="text-amber-500" />
                <h4 className="text-xs font-black uppercase tracking-widest italic">Toss Management</h4>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-slate-500">Who won the toss?</label>
                   <select 
                    value={tossWinner} onChange={e => setTossWinner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-sm outline-none dark:text-white"
                   >
                     <option value="">Select Team</option>
                     {teamA && <option value={teamA}>{teamA}</option>}
                     {teamB && <option value={teamB}>{teamB}</option>}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-bold text-slate-500">Decision</label>
                   <div className="flex bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
                      <button 
                        type="button" onClick={() => setTossDecision('bat')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${tossDecision === 'bat' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                      >
                        BAT
                      </button>
                      <button 
                        type="button" onClick={() => setTossDecision('bowl')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${tossDecision === 'bowl' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                      >
                        BOWL
                      </button>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Venue</label>
            <input 
              value={venue} onChange={e => setVenue(e.target.value)} required
              placeholder="Local Sports Ground"
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none transition-all font-bold dark:text-white"
            />
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
