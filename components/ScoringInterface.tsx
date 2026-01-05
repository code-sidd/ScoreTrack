import React, { useState, useMemo } from 'react';
import { Match, ExtraType, Delivery, MatchStatus, Inning, PlayerMatchStats } from '../types';
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

  // Current Inning Data
  const currentInningIdx = match.currentInning;
  const bowlingInningIdx = currentInningIdx === 0 ? 1 : 0;
  const inning = match.innings[currentInningIdx];
  const bowlingTeamInning = match.innings[bowlingInningIdx];

  // Current Active Players
  const striker = inning.strikerId ? inning.playerStats[inning.strikerId] : null;
  const nonStriker = inning.nonStrikerId ? inning.playerStats[inning.nonStrikerId] : null;
  const currentBowler = inning.currentBowlerId ? bowlingTeamInning.playerStats[inning.currentBowlerId] : null;

  // Selection Options
  // Fix: Added explicit type assertions to Object.values results to resolve 'unknown' type inference errors
  const availableBatters = (Object.values(inning.playerStats) as PlayerMatchStats[]).filter(p => !p.isOut && p.id !== inning.strikerId && p.id !== inning.nonStrikerId);
  const availableBowlers = (Object.values(bowlingTeamInning.playerStats) as PlayerMatchStats[]).filter(p => p.id !== inning.currentBowlerId);

  const swapStrike = (inn: Inning) => {
    const temp = inn.strikerId;
    inn.strikerId = inn.nonStrikerId;
    inn.nonStrikerId = temp;
  };

  const handleScore = (runs: number, extra: ExtraType = ExtraType.NONE) => {
    if (match.status === MatchStatus.COMPLETED) return;
    if (!inning.strikerId || !inning.currentBowlerId) {
      alert("Please select both Striker and Bowler!");
      return;
    }

    const updatedMatch = { ...match };
    const curInn = { ...updatedMatch.innings[currentInningIdx] };
    const bowlInn = { ...updatedMatch.innings[bowlingInningIdx] };
    
    let extraRuns = (extra === ExtraType.WIDE || extra === ExtraType.NO_BALL) ? 1 : 0;
    curInn.totalRuns += runs + extraRuns;

    // Update Striker Stats
    const sStats = { ...curInn.playerStats[curInn.strikerId!] };
    if (extra === ExtraType.NONE || extra === ExtraType.BYE || extra === ExtraType.LEG_BYE) {
      sStats.runs += runs;
      sStats.balls += 1;
      if (runs === 4) sStats.fours += 1;
      if (runs === 6) sStats.sixes += 1;
    }
    curInn.playerStats[sStats.id] = sStats;

    // Update Bowler Stats
    const bStats = { ...bowlInn.playerStats[curInn.currentBowlerId!] };
    if (extra === ExtraType.WIDE || extra === ExtraType.NO_BALL) {
      bStats.runsConceded += (runs + extraRuns);
    } else {
      bStats.runsConceded += runs;
      bStats.ballsBowled += 1;
      if (bStats.ballsBowled >= 6) {
        bStats.overs += 1;
        bStats.ballsBowled = 0;
      }
    }
    bowlInn.playerStats[bStats.id] = bStats;

    // Log Ball
    curInn.deliveries.push({
      id: `ball-${Date.now()}`,
      over: curInn.overs,
      ball: curInn.balls + 1,
      batsmanId: curInn.strikerId!,
      bowlerId: curInn.currentBowlerId!,
      runs,
      extraType: extra,
      extraRuns,
      isWicket: false,
      timestamp: Date.now()
    });

    // Rule 1: Odd runs rotate strike
    if (runs % 2 !== 0) {
      swapStrike(curInn);
    }

    // Ball/Over progression
    if (extra !== ExtraType.WIDE && extra !== ExtraType.NO_BALL) {
      curInn.balls += 1;
      if (curInn.balls >= 6) {
        curInn.overs += 1;
        curInn.balls = 0;
        // Rule 2: Over ends, bowlers swap ends, so strike rotates AGAIN
        swapStrike(curInn);
        curInn.currentBowlerId = undefined; // Forces user to pick a new bowler
      }
    }

    updatedMatch.innings[currentInningIdx] = curInn;
    updatedMatch.innings[bowlingInningIdx] = bowlInn;

    checkMatchEnd(updatedMatch, curInn);
    onUpdate(updatedMatch);
  };

  const handleWicket = () => {
    if (!inning.strikerId || !inning.currentBowlerId) return;

    const updatedMatch = { ...match };
    const curInn = { ...updatedMatch.innings[currentInningIdx] };
    const bowlInn = { ...updatedMatch.innings[bowlingInningIdx] };

    const sStats = { ...curInn.playerStats[curInn.strikerId!] };
    sStats.balls += 1;
    sStats.isOut = true;
    curInn.playerStats[sStats.id] = sStats;

    const bStats = { ...bowlInn.playerStats[curInn.currentBowlerId!] };
    bStats.ballsBowled += 1;
    bStats.wickets += 1;
    if (bStats.ballsBowled >= 6) {
      bStats.overs += 1;
      bStats.ballsBowled = 0;
      curInn.currentBowlerId = undefined;
      swapStrike(curInn);
    }
    bowlInn.playerStats[bStats.id] = bStats;

    curInn.wickets += 1;
    curInn.strikerId = undefined; // Force selection of new batter

    curInn.balls += 1;
    if (curInn.balls >= 6) {
      curInn.overs += 1;
      curInn.balls = 0;
    }

    curInn.deliveries.push({
      id: `ball-wkt-${Date.now()}`,
      over: curInn.overs,
      ball: curInn.balls,
      batsmanId: sStats.id,
      bowlerId: bStats.id,
      runs: 0,
      extraType: ExtraType.NONE,
      extraRuns: 0,
      isWicket: true,
      timestamp: Date.now()
    });

    updatedMatch.innings[currentInningIdx] = curInn;
    updatedMatch.innings[bowlingInningIdx] = bowlInn;

    checkMatchEnd(updatedMatch, curInn);
    onUpdate(updatedMatch);
  };

  const checkMatchEnd = (m: Match, inn: Inning) => {
    const isAllOut = inn.wickets >= m.playerCount - 1;
    const isOversOver = inn.overs >= m.overs;
    const targetReached = m.currentInning === 1 && inn.totalRuns > m.innings[0].totalRuns;

    if (isAllOut || isOversOver || targetReached) {
      if (m.currentInning === 0) {
        m.currentInning = 1;
        m.statusText = `${m.innings[1].teamId} needs ${inn.totalRuns + 1} to win`;
      } else {
        m.status = MatchStatus.COMPLETED;
        const target = m.innings[0].totalRuns;
        const current = inn.totalRuns;
        if (current > target) {
          m.result = `${inn.teamId} won by ${m.playerCount - 1 - inn.wickets} wickets`;
        } else if (current < target) {
          m.result = `${m.innings[0].teamId} won by ${target - current} runs`;
        } else {
          m.result = "Match Tied";
        }
        m.statusText = m.result;
      }
    }
  };

  const setPlayerRole = (id: string, role: 'striker' | 'nonStriker' | 'bowler') => {
    const updatedMatch = { ...match };
    const inn = updatedMatch.innings[currentInningIdx];
    if (role === 'striker') inn.strikerId = id;
    else if (role === 'nonStriker') inn.nonStrikerId = id;
    else inn.currentBowlerId = id;
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
    inning.deliveries.forEach(d => {
      const ov = Math.floor(d.over);
      if (!groups[ov]) groups[ov] = [];
      groups[ov].push(d);
    });
    return Object.entries(groups).reverse();
  }, [inning.deliveries]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-32">
      {/* Dynamic Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h2 className="font-black uppercase italic tracking-tighter leading-none">{match.title}</h2>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Live Console</p>
            </div>
          </div>
          <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black italic shadow-lg shadow-blue-600/30 transition-all uppercase">
            <CheckCircle2 size={16} /> End Game
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-4 space-y-8">
        {/* Behance-Style Scoreboard */}
        <div className="bg-gradient-to-br from-indigo-700 to-blue-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic leading-none">{inning.teamId} IS BATTING</p>
              <h1 className="text-8xl font-black tabular-nums tracking-tighter leading-none">
                {inning.totalRuns}<span className="text-3xl text-white/30 font-bold ml-2">/{inning.wickets}</span>
              </h1>
              {match.currentInning === 1 && (
                <div className="inline-block mt-6 px-4 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                   <p className="text-[10px] font-black uppercase italic tracking-widest">Target: {match.innings[0].totalRuns + 1}</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em] mb-4">OVERS</p>
              <h2 className="text-6xl font-black tabular-nums tracking-tight leading-none">
                {inning.overs}<span className="text-2xl text-white/30 font-medium">.{inning.balls}</span>
                <span className="text-[10px] text-white/20 block font-black uppercase mt-2">Max {match.overs} Overs</span>
              </h2>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-200/50 dark:bg-slate-900 rounded-[2.5rem] p-1.5 shadow-inner">
           <TabBtn active={activeView === 'scoring'} onClick={() => setActiveView('scoring')} icon={<Target size={16}/>} label="Live Score" />
           <TabBtn active={activeView === 'squads'} onClick={() => setActiveView('squads')} icon={<Users size={16}/>} label="Squads" />
           <TabBtn active={activeView === 'logs'} onClick={() => setActiveView('logs')} icon={<History size={16}/>} label="Ball Log" />
        </div>

        {activeView === 'scoring' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
            {/* Field Setup Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                  <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Active Batters</h4>
                  <div className="space-y-4">
                     <PlayerSelectSlot label="STRIKER" player={striker} available={availableBatters} onSelect={id => setPlayerRole(id, 'striker')} active={true} />
                     <PlayerSelectSlot label="NON-STRIKER" player={nonStriker} available={availableBatters} onSelect={id => setPlayerRole(id, 'nonStriker')} />
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                  <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Active Bowler</h4>
                  <PlayerSelectSlot label="BOWLER" player={currentBowler} available={availableBowlers} onSelect={id => setPlayerRole(id, 'bowler')} color="indigo" />
                  <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3">CURRENT OVER</p>
                     <div className="flex gap-2">
                        {inning.deliveries.filter(d => Math.floor(d.over) === inning.overs).map((d, i) => (
                          <span key={i} className={`w-8 h-8 flex items-center justify-center text-[10px] font-black rounded-xl shadow-sm ${d.isWicket ? 'bg-red-600 text-white' : 'bg-white dark:bg-slate-800 dark:text-slate-300'}`}>
                            {d.isWicket ? 'W' : d.runs}
                          </span>
                        ))}
                        {/* Fix: Simplified empty slot calculation and fixed misplaced slice() call using inning.balls */}
                        {Array.from({ length: Math.max(0, 6 - inning.balls) }).map((_, i) => (
                          <span key={`empty-${i}`} className="w-8 h-8 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl"></span>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Score Pad */}
            <div className="grid grid-cols-4 gap-4">
              {[0, 1, 2, 3, 4, 6].map(runs => (
                <button
                  key={runs}
                  onClick={() => handleScore(runs)}
                  disabled={!striker || !currentBowler}
                  className="aspect-square flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] hover:border-blue-500 hover:shadow-2xl transition-all active:scale-90 disabled:opacity-20 group"
                >
                  <span className="text-5xl font-black italic tracking-tighter dark:text-white group-hover:text-blue-600">{runs}</span>
                  <span className="text-[9px] uppercase text-slate-400 font-black mt-1">Runs</span>
                </button>
              ))}
              <button
                onClick={() => handleScore(0, ExtraType.WIDE)}
                disabled={!striker || !currentBowler}
                className="aspect-square flex flex-col items-center justify-center bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-[2.5rem] hover:bg-amber-100 transition-all active:scale-90 disabled:opacity-20"
              >
                <span className="text-4xl font-black italic text-amber-600 dark:text-amber-500">WD</span>
                <span className="text-[9px] uppercase text-amber-500/60 font-black mt-1">+1 Run</span>
              </button>
              <button
                onClick={handleWicket}
                disabled={!striker || !currentBowler}
                className="aspect-square flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-[2.5rem] hover:bg-red-100 transition-all active:scale-90 disabled:opacity-20"
              >
                <span className="text-4xl font-black italic text-red-600 dark:text-red-500">OUT</span>
                <span className="text-[9px] uppercase text-red-500/60 font-black mt-1">Wicket</span>
              </button>
            </div>

            {/* AI Insights Bar */}
            <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Lightbulb className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-black italic text-xl uppercase tracking-tight">Match Intelligence</h3>
                      <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">Powered by Gemini Pro</p>
                    </div>
                  </div>
                  <button 
                    onClick={fetchAiInsight} 
                    disabled={isLoadingInsight} 
                    className="text-[10px] bg-white/10 hover:bg-white/20 px-8 py-3 rounded-full font-black uppercase tracking-widest transition-all"
                  >
                    {isLoadingInsight ? 'Analyzing...' : 'Refresh AI'}
                  </button>
               </div>
               <p className="text-base text-slate-400 leading-relaxed font-bold italic relative z-10">"{aiInsight || "Tap refresh to get a professional AI analysis of current match dynamics."}"</p>
               <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        )}

        {activeView === 'squads' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
              <SquadView title={`${match.innings[0].teamId} SQUAD`} squad={Object.values(match.innings[0].playerStats)} />
              <SquadView title={`${match.innings[1].teamId} SQUAD`} squad={Object.values(match.innings[1].playerStats)} />
           </div>
        )}

        {activeView === 'logs' && (
           <div className="space-y-6 animate-in fade-in duration-500">
              {groupedDeliveries.map(([ovNum, dels]) => (
                <div key={ovNum} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
                   <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">OVER {parseInt(ovNum) + 1}</h4>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-full uppercase tracking-widest">
                        {dels.reduce((sum, d) => sum + d.runs + d.extraRuns, 0)} TOTAL RUNS
                      </span>
                   </div>
                   <div className="flex flex-wrap gap-4">
                      {dels.map(d => (
                         <div key={d.id} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-base font-black border transition-all shadow-sm ${
                            d.isWicket ? 'bg-red-600 border-red-500 text-white shadow-lg' :
                            d.runs === 4 ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' :
                            d.runs === 6 ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' :
                            'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                         }`}>
                           {d.isWicket ? 'W' : (d.extraType !== ExtraType.NONE ? `${d.runs}${d.extraType.charAt(0)}` : d.runs)}
                         </div>
                      ))}
                   </div>
                </div>
              ))}
              {groupedDeliveries.length === 0 && (
                <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                  <History className="mx-auto text-slate-200 dark:text-slate-800 mb-6" size={56} />
                  <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] italic">No activity recorded</p>
                </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
      active ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xl' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    {icon} {label}
  </button>
);

const PlayerSelectSlot: React.FC<{ label: string, player: PlayerMatchStats | null, available: PlayerMatchStats[], onSelect: (id: string) => void, active?: boolean, color?: 'blue' | 'indigo' }> = ({ label, player, available, onSelect, active, color = 'blue' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const colorClass = color === 'indigo' ? 'bg-indigo-600 border-indigo-500 shadow-indigo-600/30' : 'bg-blue-600 border-blue-500 shadow-blue-600/30';

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(true)}
        className={`p-5 rounded-[1.5rem] border cursor-pointer transition-all flex items-center justify-between hover:scale-[1.03] active:scale-[0.98] ${
          player ? (active ? `${colorClass} text-white shadow-xl border-transparent` : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800') 
          : 'bg-slate-100 dark:bg-slate-800/50 border-dashed border-slate-300 dark:border-slate-700'
        }`}
      >
         <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
              <User size={20} />
            </div>
            <div>
               <p className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${active ? 'text-white/60' : 'text-slate-400'}`}>{label}</p>
               <h5 className="font-black text-sm uppercase italic tracking-tight truncate max-w-[140px] leading-none">{player?.name || 'SELECT PLAYER'}</h5>
            </div>
         </div>
         {player && (
           <div className="text-right flex items-center gap-4">
              <div>
                <p className="text-sm font-black tabular-nums">{player.runs || player.wickets}</p>
                <p className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-white/40' : 'text-slate-400'}`}>
                  {player.ballsBowled !== undefined ? (player.overs + '.' + player.ballsBowled) : player.balls}
                </p>
              </div>
              <ChevronDown size={14} className={active ? 'text-white/40' : 'text-slate-300'} />
           </div>
         )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-sm font-black dark:text-white uppercase tracking-[0.2em] italic">Pick {label}</h4>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl"><X size={20} className="text-slate-400" /></button>
              </div>
              <div className="max-h-80 overflow-y-auto space-y-3 no-scrollbar pr-1">
                 {available.map(p => (
                   <button 
                    key={p.id} 
                    onClick={() => { onSelect(p.id); setIsOpen(false); }}
                    className="w-full p-5 rounded-2xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-left font-black transition-all dark:text-slate-300 flex items-center justify-between group bg-slate-50 dark:bg-slate-800/50"
                   >
                     <span className="text-sm uppercase italic tracking-tight">{p.name}</span>
                     <span className="text-[10px] font-black text-slate-400 group-hover:text-white/60 uppercase tabular-nums">
                       {p.runs ? `${p.runs} R` : p.wickets ? `${p.wickets} W` : 'READY'}
                     </span>
                   </button>
                 ))}
                 {available.length === 0 && <p className="text-center py-8 text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] italic">No players available</p>}
              </div>
              <button onClick={() => setIsOpen(false)} className="w-full mt-8 py-5 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Close</button>
           </div>
        </div>
      )}
    </div>
  );
};

const SquadView: React.FC<{ title: string, squad: PlayerMatchStats[] }> = ({ title, squad }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm">
    <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-5">
      <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
      <h3 className="text-xl font-black italic uppercase dark:text-white tracking-tighter">{title}</h3>
    </div>
    <div className="space-y-4">
      {squad.map(p => (
        <div key={p.id} className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
          <div className="flex items-center gap-5">
             <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 font-black text-sm uppercase italic">{p.name.charAt(0)}</div>
             <div>
                <p className="text-sm font-black dark:text-white uppercase italic tracking-tight leading-none mb-1">{p.name}</p>
                <span className={`text-[7px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${p.isOut ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{p.isOut ? 'OUT' : 'READY'}</span>
             </div>
          </div>
          <div className="flex gap-8">
             <div className="text-center">
                <p className="text-[8px] font-black uppercase text-slate-400 mb-1">RUNS</p>
                <p className="text-sm font-black dark:text-slate-300 tabular-nums">{p.runs}</p>
             </div>
             <div className="text-center">
                <p className="text-[8px] font-black uppercase text-slate-400 mb-1">WKTS</p>
                <p className="text-sm font-black dark:text-slate-300 tabular-nums">{p.wickets}</p>
             </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ScoringInterface;