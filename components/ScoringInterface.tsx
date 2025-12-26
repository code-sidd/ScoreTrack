
import React, { useState, useMemo } from 'react';
import { Match, ExtraType, Delivery, MatchStatus, Inning, PlayerMatchStats } from '../types';
// Added X to the imported icons from lucide-react
import { ChevronLeft, Save, Users, History, Lightbulb, User, Target, ChevronDown, CheckCircle2, X } from 'lucide-react';
import { getMatchInsights } from '../services/geminiService';

interface ScoringInterfaceProps {
  match: Match;
  onBack: () => void;
  onUpdate: (match: Match) => void;
}

const ScoringInterface: React.FC<ScoringInterfaceProps> = ({ match, onBack, onUpdate }) => {
  const [activeView, setActiveView] = useState<'scoring' | 'squads' | 'logs'>('scoring');
  const [aiInsight, setAiInsight] = useState<string | null>(match.summary || null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // Match State
  const currentInningIndex = match.currentInning;
  const currentInning = match.innings[currentInningIndex];
  const bowlingInningIndex = currentInningIndex === 0 ? 1 : 0;
  const bowlingInning = match.innings[bowlingInningIndex];

  // Derived State for Current Interaction
  const striker = currentInning.strikerId ? currentInning.playerStats[currentInning.strikerId] : null;
  const nonStriker = currentInning.nonStrikerId ? currentInning.playerStats[currentInning.nonStrikerId] : null;
  const currentBowler = currentInning.currentBowlerId ? bowlingInning.playerStats[currentInning.currentBowlerId] : null;

  const availableBatters = Object.values(currentInning.playerStats).filter((p: PlayerMatchStats) => !p.isOut && p.id !== currentInning.strikerId && p.id !== currentInning.nonStrikerId);
  const availableBowlers = Object.values(bowlingInning.playerStats).filter((p: PlayerMatchStats) => p.id !== currentInning.currentBowlerId);

  const swapStrike = (inning: Inning) => {
    const temp = inning.strikerId;
    inning.strikerId = inning.nonStrikerId;
    inning.nonStrikerId = temp;
  };

  const handleScore = (runs: number, extra: ExtraType = ExtraType.NONE) => {
    if (match.status === MatchStatus.COMPLETED) return;
    if (!currentInning.strikerId || !currentInning.currentBowlerId) {
      alert("Please select striker and bowler first!");
      return;
    }

    const updatedMatch = { ...match };
    const inning = { ...updatedMatch.innings[currentInningIndex] };
    const bowlInning = { ...updatedMatch.innings[bowlingInningIndex] };
    
    let extraRuns = extra !== ExtraType.NONE ? 1 : 0;
    inning.totalRuns += runs + extraRuns;

    // Update Striker Stats
    const strikerStats = { ...inning.playerStats[inning.strikerId!] };
    if (extra === ExtraType.NONE || extra === ExtraType.BYE || extra === ExtraType.LEG_BYE) {
      strikerStats.runs += runs;
      strikerStats.balls += 1;
      if (runs === 4) strikerStats.fours += 1;
      if (runs === 6) strikerStats.sixes += 1;
    }
    inning.playerStats[strikerStats.id] = strikerStats;

    // Update Bowler Stats
    const bowlerStats = { ...bowlInning.playerStats[inning.currentBowlerId!] };
    if (extra === ExtraType.WIDE || extra === ExtraType.NO_BALL) {
      bowlerStats.runsConceded += (runs + extraRuns);
      // Extra ball for wide/no-ball: do not increment ball count for legal over
    } else {
      bowlerStats.runsConceded += runs;
      bowlerStats.ballsBowled += 1;
      if (bowlerStats.ballsBowled >= 6) {
        bowlerStats.overs += 1;
        bowlerStats.ballsBowled = 0;
      }
    }
    bowlInning.playerStats[bowlerStats.id] = bowlerStats;

    // Log Delivery
    const delivery: Delivery = {
      id: `del-${Date.now()}`,
      over: inning.overs,
      ball: inning.balls + 1,
      batsmanId: inning.strikerId!,
      bowlerId: inning.currentBowlerId!,
      runs,
      extraType: extra,
      extraRuns,
      isWicket: false,
      timestamp: Date.now()
    };
    inning.deliveries.push(delivery);

    // Rule: Strike rotation for odd runs
    if (runs % 2 !== 0) {
      swapStrike(inning);
    }

    // Ball & Over transition
    const isLegalBall = extra !== ExtraType.WIDE && extra !== ExtraType.NO_BALL;
    if (isLegalBall) {
      inning.balls += 1;
      if (inning.balls >= 6) {
        inning.overs += 1;
        inning.balls = 0;
        
        // Rule: Over ends, strike rotates *again* (because bowlers change ends)
        swapStrike(inning);
        
        // Rule: Requirement for new bowler
        inning.currentBowlerId = undefined;
      }
    }

    updatedMatch.innings[currentInningIndex] = inning;
    updatedMatch.innings[bowlingInningIndex] = bowlInning;

    // Innings / Match Completion Logic
    checkCompletion(updatedMatch, inning);
    
    onUpdate(updatedMatch);
  };

  const handleWicket = () => {
    if (!currentInning.strikerId || !currentInning.currentBowlerId) return;
    
    const updatedMatch = { ...match };
    const inning = { ...updatedMatch.innings[currentInningIndex] };
    const bowlInning = { ...updatedMatch.innings[bowlingInningIndex] };

    // Update Batter
    const strikerStats = { ...inning.playerStats[inning.strikerId!] };
    strikerStats.balls += 1;
    strikerStats.isOut = true;
    inning.playerStats[strikerStats.id] = strikerStats;

    // Update Bowler
    const bowlerStats = { ...bowlInning.playerStats[inning.currentBowlerId!] };
    bowlerStats.ballsBowled += 1;
    bowlerStats.wickets += 1;
    if (bowlerStats.ballsBowled >= 6) {
      bowlerStats.overs += 1;
      bowlerStats.ballsBowled = 0;
      inning.currentBowlerId = undefined;
      swapStrike(inning); // End of over strike rotation
    }
    bowlInning.playerStats[bowlerStats.id] = bowlerStats;

    inning.wickets += 1;
    inning.strikerId = undefined; // Require new batter selection
    
    inning.balls += 1;
    if (inning.balls >= 6) {
      inning.overs += 1;
      inning.balls = 0;
    }

    // Log Delivery
    inning.deliveries.push({
      id: `del-wkt-${Date.now()}`,
      over: inning.overs,
      ball: inning.balls,
      batsmanId: strikerStats.id,
      bowlerId: bowlerStats.id,
      runs: 0,
      extraType: ExtraType.NONE,
      extraRuns: 0,
      isWicket: true,
      timestamp: Date.now()
    });

    updatedMatch.innings[currentInningIndex] = inning;
    updatedMatch.innings[bowlingInningIndex] = bowlInning;

    checkCompletion(updatedMatch, inning);
    onUpdate(updatedMatch);
  };

  const checkCompletion = (m: Match, currentInn: Inning) => {
    const isTargetReached = m.currentInning === 1 && currentInn.totalRuns > m.innings[0].totalRuns;
    const isAllOut = currentInn.wickets >= m.playerCount - 1;
    const isOversFinished = currentInn.overs >= m.overs;

    if (isTargetReached || isAllOut || isOversFinished) {
      if (m.currentInning === 0) {
        m.currentInning = 1;
        m.statusText = `${m.innings[1].teamId} need ${currentInn.totalRuns + 1} to win`;
      } else {
        m.status = MatchStatus.COMPLETED;
        const target = m.innings[0].totalRuns;
        const current = currentInn.totalRuns;
        if (current > target) {
          m.result = `${currentInn.teamId} won by ${m.playerCount - 1 - currentInn.wickets} wickets`;
        } else if (current < target) {
          m.result = `${m.innings[0].teamId} won by ${target - current} runs`;
        } else {
          m.result = "Match Tied";
        }
        m.statusText = m.result;
      }
    }
  };

  const selectPlayer = (id: string, role: 'striker' | 'nonStriker' | 'bowler') => {
    const updatedMatch = { ...match };
    const inning = updatedMatch.innings[currentInningIndex];
    if (role === 'striker') inning.strikerId = id;
    else if (role === 'nonStriker') inning.nonStrikerId = id;
    else inning.currentBowlerId = id;
    onUpdate(updatedMatch);
  };

  const fetchAiInsight = async () => {
    setIsLoadingInsight(true);
    const insight = await getMatchInsights(match);
    setAiInsight(insight);
    setIsLoadingInsight(false);
  };

  const groupedDeliveries = useMemo(() => {
    const groups: Record<number, Delivery[]> = {};
    currentInning.deliveries.forEach(d => {
      const overNum = Math.floor(d.over);
      if (!groups[overNum]) groups[overNum] = [];
      groups[overNum].push(d);
    });
    return Object.entries(groups).reverse();
  }, [currentInning.deliveries]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h2 className="font-bold uppercase italic tracking-tight">{match.title}</h2>
            <div className="flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Live Scoring</p>
            </div>
          </div>
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/20 transition-all">
            <CheckCircle2 size={16} /> End Game
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-4 space-y-6">
        {/* Main Scorecard Banner */}
        <div className="bg-slate-900 dark:bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden transition-colors">
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2 italic">{currentInning.teamId} IS BATTING</p>
              <h1 className="text-6xl font-black tabular-nums tracking-tighter">
                {currentInning.totalRuns}<span className="text-3xl text-white/40 font-bold ml-1">/{currentInning.wickets}</span>
              </h1>
              {match.currentInning === 1 && (
                <p className="text-[10px] font-bold mt-2 text-white/80 uppercase">Target: {match.innings[0].totalRuns + 1}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">OVERS</p>
              <h2 className="text-4xl font-bold tabular-nums tracking-tight">
                {currentInning.overs}<span className="text-xl text-white/40 font-medium">.{currentInning.balls}</span>
                <span className="text-xs text-white/20 block font-black uppercase">Max {match.overs}</span>
              </h2>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        </div>

        {/* Tab View Selection */}
        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 shadow-inner">
           <button onClick={() => setActiveView('scoring')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeView === 'scoring' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-slate-500'}`}><Target size={14}/> Score</button>
           <button onClick={() => setActiveView('squads')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeView === 'squads' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-slate-500'}`}><Users size={14}/> Teams</button>
           <button onClick={() => setActiveView('logs')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeView === 'logs' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-slate-500'}`}><History size={14}/> Over log</button>
        </div>

        {activeView === 'scoring' && (
          <div className="space-y-6">
            {/* Active Batters & Bowlers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Batters */}
               <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Batting Lineup</h4>
                    <span className="text-[8px] bg-blue-100 text-blue-700 dark:bg-blue-500/10 px-2 py-0.5 rounded uppercase font-black">Current</span>
                  </div>
                  <div className="space-y-2">
                     <PlayerSlot 
                        label="ON STRIKE" 
                        player={striker} 
                        available={availableBatters} 
                        onSelect={(id) => selectPlayer(id, 'striker')} 
                        active={true}
                     />
                     <PlayerSlot 
                        label="NON-STRIKER" 
                        player={nonStriker} 
                        available={availableBatters} 
                        onSelect={(id) => selectPlayer(id, 'nonStriker')} 
                     />
                  </div>
               </div>

               {/* Bowler */}
               <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Active Bowler</h4>
                    {currentBowler && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                  </div>
                  <PlayerSlot 
                    label="BOWLER" 
                    player={currentBowler} 
                    available={availableBowlers} 
                    onSelect={(id) => selectPlayer(id, 'bowler')} 
                  />
                  <div className="p-3 bg-white dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Over History</p>
                     <div className="flex gap-1">
                        {currentInning.deliveries.slice(-6).map((d, i) => (
                          <span key={i} className="w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-800">{d.isWicket ? 'W' : d.runs}</span>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Main Controls */}
            <div className="grid grid-cols-4 gap-4">
              {[0, 1, 2, 3, 4, 6].map(runs => (
                <button
                  key={runs}
                  onClick={() => handleScore(runs)}
                  disabled={!striker || !currentBowler || match.status === MatchStatus.COMPLETED}
                  className="aspect-square flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-blue-500 transition-all disabled:opacity-30 group shadow-sm active:scale-95"
                >
                  <span className="text-3xl font-black dark:text-white group-hover:text-blue-600 italic tracking-tighter">{runs}</span>
                  <span className="text-[8px] uppercase text-slate-400 font-black mt-1">Runs</span>
                </button>
              ))}
              <button
                onClick={() => handleScore(0, ExtraType.WIDE)}
                disabled={!striker || !currentBowler || match.status === MatchStatus.COMPLETED}
                className="aspect-square flex flex-col items-center justify-center bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-3xl hover:bg-amber-100 transition-all disabled:opacity-30 active:scale-95"
              >
                <span className="text-2xl font-black text-amber-700 dark:text-amber-400 italic">WD</span>
                <span className="text-[8px] uppercase text-amber-600/60 font-black mt-1">+1 Run</span>
              </button>
              <button
                onClick={handleWicket}
                disabled={!striker || !currentBowler || match.status === MatchStatus.COMPLETED}
                className="aspect-square flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-3xl hover:bg-red-100 transition-all disabled:opacity-30 active:scale-95"
              >
                <span className="text-2xl font-black text-red-700 dark:text-red-400 italic">OUT</span>
                <span className="text-[8px] uppercase text-red-600/60 font-black mt-1">Wicket</span>
              </button>
            </div>

            {/* Insights at bottom */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="text-amber-500" size={18} />
                    <h3 className="font-black italic text-xs uppercase tracking-tight">AI Match Analysis</h3>
                  </div>
                  <button onClick={fetchAiInsight} disabled={isLoadingInsight} className="text-[9px] bg-slate-900 dark:bg-blue-600 text-white px-4 py-1.5 rounded-full font-black uppercase transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50">
                    {isLoadingInsight ? 'Computing...' : 'Refresh AI'}
                  </button>
               </div>
               <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold italic">"{aiInsight || "Press refresh to generate real-time professional analysis of the current match situation."}"</p>
            </div>
          </div>
        )}

        {activeView === 'squads' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TeamSquad title={`${match.innings[0].teamId} (1st Inn)`} squad={Object.values(match.innings[0].playerStats)} />
              <TeamSquad title={`${match.innings[1].teamId} (2nd Inn)`} squad={Object.values(match.innings[1].playerStats)} />
           </div>
        )}

        {activeView === 'logs' && (
           <div className="space-y-4">
              {groupedDeliveries.map(([overNum, dels]) => (
                <div key={overNum} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                   <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">OVER {parseInt(overNum) + 1}</h4>
                      <span className="text-[10px] font-bold text-slate-500">
                        {dels.reduce((sum, d) => sum + d.runs + d.extraRuns, 0)} Runs
                      </span>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {dels.map(d => (
                         <div key={d.id} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border transition-all ${
                            d.isWicket ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/20' :
                            d.runs === 4 ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                            d.runs === 6 ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' :
                            'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
                         }`}>
                           {d.isWicket ? 'W' : (d.extraType !== ExtraType.NONE ? `${d.runs}${d.extraType.charAt(0)}` : d.runs)}
                         </div>
                      ))}
                   </div>
                </div>
              ))}
              {groupedDeliveries.length === 0 && (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <History className="mx-auto text-slate-200 dark:text-slate-800 mb-2" size={32} />
                  <p className="text-slate-400 font-bold italic uppercase text-[10px]">No activity recorded</p>
                </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
};

const PlayerSlot: React.FC<{ label: string, player: PlayerMatchStats | null, available: PlayerMatchStats[], onSelect: (id: string) => void, active?: boolean }> = ({ label, player, available, onSelect, active }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(true)}
        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] ${
          player ? (active ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800') 
          : 'bg-slate-100 dark:bg-slate-800/50 border-dashed border-slate-300 dark:border-slate-700'
        }`}
      >
         <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <User size={14} />
            </div>
            <div>
               <p className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-white/60' : 'text-slate-400'}`}>{label}</p>
               <h5 className="font-bold text-xs truncate max-w-[100px]">{player?.name || 'SELECT'}</h5>
            </div>
         </div>
         {player && (
           <div className="text-right flex items-center gap-2">
              <div>
                <p className="text-[10px] font-black tabular-nums">{player.runs || player.wickets}</p>
                <p className={`text-[8px] font-bold uppercase ${active ? 'text-white/40' : 'text-slate-400'}`}>
                  {player.ballsBowled !== undefined ? (player.overs + '.' + player.ballsBowled) : player.balls}
                </p>
              </div>
              <ChevronDown size={12} className={active ? 'text-white/40' : 'text-slate-300'} />
           </div>
         )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black dark:text-white uppercase tracking-widest italic">SELECT {label}</h4>
                <button onClick={() => setIsOpen(false)}><X size={16} className="text-slate-400" /></button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1 no-scrollbar">
                 {available.map(p => (
                   <button 
                    key={p.id} 
                    onClick={() => { onSelect(p.id); setIsOpen(false); }}
                    className="w-full p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left font-bold transition-colors dark:text-slate-300 flex items-center justify-between group"
                   >
                     <span className="text-xs group-hover:text-blue-500 transition-colors uppercase">{p.name}</span>
                     <span className="text-[9px] font-black text-slate-400 uppercase">
                       {p.runs ? `${p.runs} R` : p.wickets ? `${p.wickets} W` : '-'}
                     </span>
                   </button>
                 ))}
                 {available.length === 0 && <p className="text-center py-4 text-[10px] text-slate-400 font-bold italic uppercase">No players available</p>}
              </div>
              <button onClick={() => setIsOpen(false)} className="w-full mt-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500">Close</button>
           </div>
        </div>
      )}
    </div>
  );
};

const TeamSquad: React.FC<{ title: string, squad: PlayerMatchStats[] }> = ({ title, squad }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
      <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
      <h3 className="text-sm font-black italic uppercase dark:text-white tracking-tight">{title}</h3>
    </div>
    <div className="space-y-2">
      {squad.map(p => (
        <div key={p.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400"><User size={14}/></div>
             <div>
                <p className="text-xs font-black dark:text-white uppercase tracking-tight">{p.name}</p>
                <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${p.isOut ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{p.isOut ? 'OUT' : 'Active'}</span>
             </div>
          </div>
          <div className="flex gap-4">
             <div className="text-center">
                <p className="text-[8px] font-black uppercase text-slate-400">R</p>
                <p className="text-[10px] font-black dark:text-slate-300 tabular-nums">{p.runs}</p>
             </div>
             <div className="text-center">
                <p className="text-[8px] font-black uppercase text-slate-400">W</p>
                <p className="text-[10px] font-black dark:text-slate-300 tabular-nums">{p.wickets}</p>
             </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ScoringInterface;
