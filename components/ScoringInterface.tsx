
import React, { useState } from 'react';
import { Match, ExtraType, Delivery, Player } from '../types';
import { ChevronLeft, Save, Users, History, Lightbulb, User } from 'lucide-react';
import { getMatchInsights } from '../services/geminiService';
import PlayerStatsModal from './PlayerStatsModal';

interface ScoringInterfaceProps {
  match: Match;
  onBack: () => void;
  onUpdate: (match: Match) => void;
}

// Dummy player data for the demo
const MOCK_PLAYERS: Record<string, Player> = {
  'p1': { id: 'p1', name: 'Virat Kohli', role: 'batsman', stats: { matches: 250, runs: 12000, wickets: 4, strikeRate: 93.5, economy: 5.4, average: 58.6, highScore: 183, bestBowling: '1/15' } },
  'p2': { id: 'p2', name: 'Rohit Sharma', role: 'batsman', stats: { matches: 240, runs: 10000, wickets: 8, strikeRate: 90.2, economy: 4.8, average: 49.2, highScore: 264, bestBowling: '2/20' } },
  'p3': { id: 'p3', name: 'Jasprit Bumrah', role: 'bowler', stats: { matches: 150, runs: 500, wickets: 220, strikeRate: 45.0, economy: 4.6, average: 22.3, highScore: 34, bestBowling: '6/19' } },
};

const ScoringInterface: React.FC<ScoringInterfaceProps> = ({ match, onBack, onUpdate }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(match.summary || null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const currentInning = match.innings[0];
  const striker = MOCK_PLAYERS['p1'];
  const nonStriker = MOCK_PLAYERS['p2'];
  const bowler = MOCK_PLAYERS['p3'];
  
  const handleScore = (runs: number, extra: ExtraType = ExtraType.NONE) => {
    const newInning = { ...currentInning };
    let extraRuns = extra !== ExtraType.NONE ? 1 : 0;
    newInning.totalRuns += runs + extraRuns;
    
    if (extra !== ExtraType.WIDE && extra !== ExtraType.NO_BALL) {
      newInning.balls += 1;
      if (newInning.balls >= 6) {
        newInning.overs += 1;
        newInning.balls = 0;
      }
    }

    onUpdate({ ...match, innings: [newInning] });
  };

  const handleWicket = () => {
    const newInning = { ...currentInning };
    newInning.wickets += 1;
    newInning.balls += 1;
    if (newInning.balls >= 6) {
      newInning.overs += 1;
      newInning.balls = 0;
    }
    onUpdate({ ...match, innings: [newInning] });
  };

  const fetchAiInsight = async () => {
    setIsLoadingInsight(true);
    const insight = await getMatchInsights(match);
    setAiInsight(insight);
    setIsLoadingInsight(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <PlayerStatsModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h2 className="font-bold">{match.title}</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{match.teamA} vs {match.teamB}</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all">
            <Save size={16} /> Save
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-4 space-y-6">
        {/* Score Board */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-600/30 overflow-hidden relative">
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">{currentInning.battingTeamId}</p>
              <h1 className="text-6xl font-black tabular-nums">
                {currentInning.totalRuns}<span className="text-4xl text-blue-200/80">/{currentInning.wickets}</span>
              </h1>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Overs</p>
              <h2 className="text-4xl font-bold tabular-nums">
                {currentInning.overs}.<span className="text-2xl text-blue-200/80">{currentInning.balls}</span>
              </h2>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        </div>

        {/* Dynamic Player Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Current Batters</h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">Active</span>
              </div>
              <div className="space-y-3">
                 <button onClick={() => setSelectedPlayer(striker)} className="w-full flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-slate-800 p-2 -m-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                          <User size={16} />
                       </div>
                       <span className="font-bold group-hover:text-blue-600 transition-colors">{striker.name}*</span>
                    </div>
                    <span className="font-black tabular-nums">42 <span className="text-slate-400 font-medium text-sm">(28)</span></span>
                 </button>
                 <button onClick={() => setSelectedPlayer(nonStriker)} className="w-full flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-slate-800 p-2 -m-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <User size={16} />
                       </div>
                       <span className="font-bold group-hover:text-blue-600 transition-colors">{nonStriker.name}</span>
                    </div>
                    <span className="font-black tabular-nums">18 <span className="text-slate-400 font-medium text-sm">(15)</span></span>
                 </button>
              </div>
           </div>

           <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Current Bowler</h4>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              </div>
              <button onClick={() => setSelectedPlayer(bowler)} className="w-full flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-slate-800 p-2 -m-2 rounded-xl transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                       <User size={16} />
                    </div>
                    <span className="font-bold group-hover:text-blue-600 transition-colors">{bowler.name}</span>
                 </div>
                 <div className="text-right">
                    <span className="font-black block">1/24</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">3.4 Overs</span>
                 </div>
              </button>
           </div>
        </div>

        {/* AI Insight Section */}
        <div className="bg-slate-900 dark:bg-blue-600/10 rounded-[2rem] p-6 text-white overflow-hidden relative group border border-slate-800 dark:border-blue-500/20">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Lightbulb className="text-white" size={18} />
                </div>
                <h3 className="font-black italic">CricGenie AI Insights</h3>
              </div>
              <button 
                onClick={fetchAiInsight}
                disabled={isLoadingInsight}
                className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {isLoadingInsight ? 'ANALYZING...' : 'GENERATE INSIGHT'}
              </button>
           </div>
           {aiInsight ? (
             <p className="text-sm text-slate-300 dark:text-blue-100 leading-relaxed italic border-l-2 border-blue-500 pl-4 py-1">"{aiInsight}"</p>
           ) : (
             <p className="text-sm text-slate-400 dark:text-blue-300/60">Get match analysis and real-time predictions powered by Gemini.</p>
           )}
        </div>

        {/* Scoring Controls */}
        <div className="grid grid-cols-4 gap-4">
          {[0, 1, 2, 3, 4, 6].map(runs => (
            <button
              key={runs}
              onClick={() => handleScore(runs)}
              className="aspect-square flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all active:scale-95 group"
            >
              <span className="text-3xl font-black group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">{runs}</span>
              <span className="text-[10px] uppercase text-slate-400 font-black tracking-widest mt-1">Runs</span>
            </button>
          ))}
          <button
            onClick={() => handleScore(0, ExtraType.WIDE)}
            className="aspect-square flex flex-col items-center justify-center bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-3xl hover:bg-amber-100 transition-all active:scale-95 group"
          >
            <span className="text-2xl font-black text-amber-700 dark:text-amber-400">WD</span>
            <span className="text-[10px] uppercase text-amber-600/60 font-black tracking-widest mt-1">+1 Run</span>
          </button>
          <button
            onClick={handleWicket}
            className="aspect-square flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-3xl hover:bg-red-100 transition-all active:scale-95 group"
          >
            <span className="text-2xl font-black text-red-700 dark:text-red-400">OUT</span>
            <span className="text-[10px] uppercase text-red-600/60 font-black tracking-widest mt-1">Wicket</span>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-4">
           <button className="flex items-center justify-center gap-3 py-4 px-6 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl font-black text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
              <Users size={20} /> Squads
           </button>
           <button className="flex items-center justify-center gap-3 py-4 px-6 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl font-black text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all">
              <History size={20} /> Ball Log
           </button>
        </div>
      </div>
      
      {/* Footer Status */}
      <div className="p-4 text-center bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
         <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Auto-Sync Enabled</span>
         </div>
      </div>
    </div>
  );
};

export default ScoringInterface;
