
import React, { useState } from 'react';
import { X, Trophy, Users, ChevronRight, Hash, UserPlus, Coins } from 'lucide-react';
import { Match, MatchType, MatchStatus, PlayerMatchStats } from '../types';

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

    if (!teamA || !teamB || isNaN(numOvers) || numOvers <= 0 || !venue) {
      alert("Please fill in team names, overs, and venue.");
      return;
    }

    if (!tossWinner) {
      alert("Please select who won the toss!");
      return;
    }

    // Determine batting order based on toss winner and decision
    const teamBatsFirst = tossDecision === 'bat' ? tossWinner : (tossWinner === teamA ? teamB : teamA);
    const teamBowlsFirst = teamBatsFirst === teamA ? teamB : teamA;

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
        const id = `p-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        stats[id] = {
          id, name, runs: 0, balls: 0, fours: 0, sixes: 0,
          overs: 0, ballsBowled: 0, runsConceded: 0, wickets: 0, isOut: false
        };
      });
      return stats;
    };

    const firstBattingSquadNames = teamBatsFirst === teamA ? finalSquadA : finalSquadB;
    const secondBattingSquadNames = teamBatsFirst === teamA ? finalSquadB : finalSquadA;

    const newMatch: Match = {
      id: `local-${Date.now()}`,
      type: MatchType.LOCAL,
      title: `${teamA} vs ${teamB}`,
      teamA,
      teamB,
      overs: numOvers,
      playerCount: numPlayers,
      status: MatchStatus.LIVE,
      statusText: 'Match Started',
      venue,
      date: new Date().toISOString().split('T')[0],
      innings: [
        { 
          teamId: teamBatsFirst, 
          totalRuns: 0, wickets: 0, overs: 0, balls: 0, deliveries: [],
          playerStats: createInitialStats(firstBattingSquadNames)
        },
        { 
          teamId: teamBowlsFirst, 
          totalRuns: 0, wickets: 0, overs: 0, balls: 0, deliveries: [],
          playerStats: createInitialStats(secondBattingSquadNames)
        }
      ],
      currentInning: 0,
      tossWinner,
      tossDecision
    };

    onSave(newMatch);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-500">
        <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
           <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
               <Trophy className="text-white" size={32} />
             </div>
             <div>
               <h2 className="text-3xl font-black italic dark:text-white uppercase tracking-tighter leading-none">Console Setup</h2>
               <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mt-2 italic">Initialization Layer</p>
             </div>
           </div>
           <button onClick={onClose} className="p-4 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-3xl transition-all">
             <X size={28} className="text-slate-400" />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10 max-h-[75vh] overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-5">
              <label className="text-[11px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2 italic">Team A Name</label>
              <input 
                value={teamA} onChange={e => setTeamA(e.target.value)} required
                placeholder="HOST TEAM"
                className="w-full px-8 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all font-black dark:text-white uppercase italic"
              />
              <div className="flex gap-3">
                <input 
                  value={currentInputA} onChange={e => setCurrentInputA(e.target.value)}
                  placeholder="ADD PLAYER"
                  className="flex-1 px-5 py-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none text-xs font-black uppercase tracking-widest italic"
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addPlayer('A'))}
                />
                <button type="button" onClick={() => addPlayer('A')} className="p-4 bg-indigo-600 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"><UserPlus size={20}/></button>
              </div>
              <div className="flex flex-wrap gap-2">{squadA.map((p, i) => <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-tighter">{p}</span>)}</div>
            </div>
            
            <div className="space-y-5">
              <label className="text-[11px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2 italic">Team B Name</label>
              <input 
                value={teamB} onChange={e => setTeamB(e.target.value)} required
                placeholder="VISITOR TEAM"
                className="w-full px-8 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all font-black dark:text-white uppercase italic"
              />
               <div className="flex gap-3">
                <input 
                  value={currentInputB} onChange={e => setCurrentInputB(e.target.value)}
                  placeholder="ADD PLAYER"
                  className="flex-1 px-5 py-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 outline-none text-xs font-black uppercase tracking-widest italic"
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addPlayer('B'))}
                />
                <button type="button" onClick={() => addPlayer('B')} className="p-4 bg-indigo-600 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"><UserPlus size={20}/></button>
              </div>
              <div className="flex flex-wrap gap-2">{squadB.map((p, i) => <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-tighter">{p}</span>)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10">
             <div className="space-y-4">
                <label className="text-[11px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2 flex items-center gap-3 italic"><Hash size={16}/> Game Overs</label>
                <input 
                  type="number" value={overs} onChange={e => setOvers(e.target.value)} required min="1"
                  className="w-full px-8 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all font-black dark:text-white text-xl tabular-nums"
                />
             </div>
             <div className="space-y-4">
                <label className="text-[11px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2 flex items-center gap-3 italic"><Users size={16}/> Players/Side</label>
                <input 
                  type="number" value={playerCount} onChange={e => setPlayerCount(e.target.value)} required min="2"
                  className="w-full px-8 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all font-black dark:text-white text-xl tabular-nums"
                />
             </div>
          </div>

          <div className="p-10 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border border-slate-200 dark:border-slate-800/50 space-y-8">
             <div className="flex items-center gap-4">
                <Coins size={24} className="text-amber-500" />
                <h4 className="text-lg font-black uppercase tracking-tighter italic">The Toss Control</h4>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <p className="text-[11px] font-black text-slate-400 uppercase ml-2 italic">Who won the toss?</p>
                   <div className="flex bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 p-2">
                      <button 
                        type="button" onClick={() => setTossWinner(teamA)}
                        disabled={!teamA}
                        className={`flex-1 py-4 rounded-xl text-[11px] font-black transition-all truncate px-4 uppercase italic ${tossWinner === teamA ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        {teamA || 'TEAM A'}
                      </button>
                      <button 
                        type="button" onClick={() => setTossWinner(teamB)}
                        disabled={!teamB}
                        className={`flex-1 py-4 rounded-xl text-[11px] font-black transition-all truncate px-4 uppercase italic ${tossWinner === teamB ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        {teamB || 'TEAM B'}
                      </button>
                   </div>
                </div>
                <div className="space-y-3">
                   <p className="text-[11px] font-black text-slate-400 uppercase ml-2 italic">Their Decision?</p>
                   <div className="flex bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 p-2">
                      <button 
                        type="button" onClick={() => setTossDecision('bat')}
                        className={`flex-1 py-4 rounded-xl text-[11px] font-black transition-all uppercase italic ${tossDecision === 'bat' ? 'bg-amber-500 text-white shadow-xl' : 'text-slate-400'}`}
                      >
                        BATTING
                      </button>
                      <button 
                        type="button" onClick={() => setTossDecision('bowl')}
                        className={`flex-1 py-4 rounded-xl text-[11px] font-black transition-all uppercase italic ${tossDecision === 'bowl' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400'}`}
                      >
                        BOWLING
                      </button>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2 italic">Arena Venue</label>
            <input 
              value={venue} onChange={e => setVenue(e.target.value)} required
              placeholder="E.G. MADISON SQUARE GROUND"
              className="w-full px-8 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none transition-all font-black dark:text-white uppercase italic"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-7 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-full transition-all shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-4 text-2xl uppercase italic tracking-tighter"
          >
            Launch Scorer Console <ChevronRight size={32} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMatchForm;
