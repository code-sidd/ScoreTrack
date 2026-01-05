
import React, { useState, useEffect } from 'react';
import { PlayerProfile, UserTier } from '../types';
import { User, Globe, Shield, Zap, ChevronRight, X, Lock, Star, TrendingUp, Info } from 'lucide-react';

interface ProfileViewProps {
  userTier: UserTier;
  onUpgrade: () => void;
}

const MOCK_PROFILE: PlayerProfile = {
  id: 'user-1',
  name: 'Alex "The Ace" Morgan',
  country: 'United Kingdom',
  role: 'All-rounder',
  battingStyle: 'Right-hand',
  bowlingStyle: 'Right-arm Fast',
  batting: {
    matches: 48, innings: 42, runs: 1245, highScore: 82, average: 34.58, strikeRate: 142.1, ballsFaced: 876,
    fours: 98, sixes: 45, fifties: 7, hundreds: 0, ducks: 2, notOuts: 6
  },
  bowling: {
    matches: 48, overs: 112.4, runsConceded: 856, wickets: 34, average: 25.17, strikeRate: 19.8, economy: 7.61,
    threeWktHauls: 4, fiveWktHauls: 0, bestBowling: '3/14'
  },
  fielding: {
    matches: 48, catches: 18, runOuts: 4, stumpings: 0, totalDismissals: 22
  }
};

const ProfileView: React.FC<ProfileViewProps> = ({ userTier, onUpgrade }) => {
  const [activeStatTab, setActiveStatTab] = useState<'Overview' | 'Batting' | 'Bowling' | 'Fielding'>('Overview');
  const [checksRemaining, setChecksRemaining] = useState(3);
  const [showOverlay, setShowOverlay] = useState(true);

  // Decrement checks when visiting stats tab for the first time in a session
  useEffect(() => {
    if (userTier === UserTier.FREE && activeStatTab !== 'Overview') {
      setChecksRemaining(prev => Math.max(0, prev - 1));
    }
  }, [activeStatTab, userTier]);

  const isGated = userTier === UserTier.FREE;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700 relative">
      {/* Monetization Floating Card */}
      {isGated && showOverlay && (
        <div className="fixed bottom-24 right-8 z-50 w-80 bg-slate-900 dark:bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl border border-white/10 animate-in slide-in-from-right-10">
          <button onClick={() => setShowOverlay(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full">
            <X size={16} />
          </button>
          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                 <Zap size={20} className="text-amber-400" />
               </div>
               <p className="text-xs font-black uppercase tracking-widest italic">Free Tier Limits</p>
             </div>
             <p className="text-sm font-bold leading-tight">Career analytics are blurred. You have <span className="text-amber-400">{checksRemaining} free checks</span> remaining this month.</p>
             <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full transition-all duration-1000" style={{ width: `${(checksRemaining / 3) * 100}%` }}></div>
             </div>
             <button 
              onClick={onUpgrade}
              className="w-full py-4 bg-white text-indigo-900 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all uppercase italic text-xs tracking-widest shadow-xl"
             >
               Unlock Pro Stats
             </button>
          </div>
        </div>
      )}

      {/* Profile Header Card */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-indigo-900 dark:to-indigo-800 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-40 h-40 bg-white/10 rounded-[2.5rem] flex items-center justify-center border-4 border-white/20 shadow-inner group">
            <User size={80} className="text-white/40 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="text-center md:text-left space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
               <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">{MOCK_PROFILE.name}</h1>
               <span className="px-4 py-1.5 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-lg shadow-amber-500/30">
                 {userTier} PLAYER
               </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-6">
              <ProfileMeta icon={<Globe size={16}/>} label="Origin" value={MOCK_PROFILE.country} />
              <ProfileMeta icon={<Shield size={16}/>} label="Primary Role" value={MOCK_PROFILE.role} />
              <ProfileMeta icon={<Star size={16}/>} label="Style" value={MOCK_PROFILE.battingStyle} />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
      </section>

      {/* Stats Navigation */}
      <nav className="flex bg-slate-100 dark:bg-slate-900 rounded-[2rem] p-1.5 shadow-inner">
        {['Overview', 'Batting', 'Bowling', 'Fielding'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveStatTab(tab as any)}
            className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
              activeStatTab === tab 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xl' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Career Data Display */}
      <section className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
        {activeStatTab === 'Overview' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <QuickStat color="emerald" icon={<TrendingUp size={24}/>} label="Career Runs" value={MOCK_PROFILE.batting.runs} />
              <QuickStat color="indigo" icon={<Shield size={24}/>} label="Wickets" value={MOCK_PROFILE.bowling.wickets} />
              <QuickStat color="amber" icon={<Zap size={24}/>} label="Batting SR" value={MOCK_PROFILE.batting.strikeRate} />
           </div>
        )}

        {activeStatTab === 'Batting' && (
          <StatTable title="Batting & Scores" gated={isGated}>
            <StatRow label="Matches" value={MOCK_PROFILE.batting.matches} />
            <StatRow label="Innings" value={MOCK_PROFILE.batting.innings} />
            <StatRow label="Not Outs" value={MOCK_PROFILE.batting.notOuts} />
            <StatRow label="Runs" value={MOCK_PROFILE.batting.runs} highlight />
            <StatRow label="Highest Score" value={MOCK_PROFILE.batting.highScore} />
            <StatRow label="Average" value={MOCK_PROFILE.batting.average} />
            <StatRow label="Strike Rate" value={MOCK_PROFILE.batting.strikeRate} highlight />
            <StatRow label="Fours" value={MOCK_PROFILE.batting.fours} />
            <StatRow label="Sixes" value={MOCK_PROFILE.batting.sixes} />
            <StatRow label="50s / 100s" value={`${MOCK_PROFILE.batting.fifties} / ${MOCK_PROFILE.batting.hundreds}`} />
          </StatTable>
        )}

        {activeStatTab === 'Bowling' && (
          <StatTable title="Bowling Metrics" gated={isGated}>
            <StatRow label="Matches" value={MOCK_PROFILE.bowling.matches} />
            <StatRow label="Overs" value={MOCK_PROFILE.bowling.overs} />
            <StatRow label="Wickets" value={MOCK_PROFILE.bowling.wickets} highlight />
            <StatRow label="Runs Conceded" value={MOCK_PROFILE.bowling.runsConceded} />
            <StatRow label="Economy" value={MOCK_PROFILE.bowling.economy} highlight />
            <StatRow label="Average" value={MOCK_PROFILE.bowling.average} />
            <StatRow label="Strike Rate" value={MOCK_PROFILE.bowling.strikeRate} />
            <StatRow label="Best Figures" value={MOCK_PROFILE.bowling.bestBowling} />
            <StatRow label="3w / 5w Hauls" value={`${MOCK_PROFILE.bowling.threeWktHauls} / ${MOCK_PROFILE.bowling.fiveWktHauls}`} />
          </StatTable>
        )}

        {activeStatTab === 'Fielding' && (
          <StatTable title="Fielding Activity" gated={isGated}>
            <StatRow label="Matches" value={MOCK_PROFILE.fielding.matches} />
            <StatRow label="Catches" value={MOCK_PROFILE.fielding.catches} highlight />
            <StatRow label="Run Outs" value={MOCK_PROFILE.fielding.runOuts} />
            <StatRow label="Stumpings" value={MOCK_PROFILE.fielding.stumpings} />
            <StatRow label="Total Dismissals" value={MOCK_PROFILE.fielding.totalDismissals} highlight />
          </StatTable>
        )}
      </section>
    </div>
  );
};

const ProfileMeta: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="text-indigo-400">{icon}</div>
    <div>
      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 leading-none mb-1">{label}</p>
      <p className="text-xs font-black uppercase italic leading-none">{value}</p>
    </div>
  </div>
);

const QuickStat: React.FC<{ color: string, icon: React.ReactNode, label: string, value: string | number }> = ({ color, icon, label, value }) => {
  const colorMap: any = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border-emerald-100 dark:border-emerald-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 border-indigo-100 dark:border-indigo-800',
    amber: 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 border-amber-100 dark:border-amber-800'
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border ${colorMap[color]} shadow-sm space-y-4 group hover:scale-[1.02] transition-transform`}>
       <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-md">
         {icon}
       </div>
       <div>
         <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 italic leading-none mb-2">{label}</p>
         <h3 className="text-4xl font-black tabular-nums tracking-tighter leading-none dark:text-white">{value}</h3>
       </div>
    </div>
  );
};

const StatTable: React.FC<{ title: string, gated: boolean, children: React.ReactNode }> = ({ title, gated, children }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-2xl font-black italic uppercase tracking-tighter dark:text-white">{title}</h3>
      <Info size={16} className="text-slate-300" />
    </div>
    <div className={`space-y-4 ${gated ? 'blur-sm select-none pointer-events-none opacity-50' : ''}`}>
      {children}
    </div>
    {gated && (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/10 dark:bg-slate-950/20 backdrop-blur-[2px]">
         <div className="flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-indigo-600 rounded-full text-white shadow-2xl border border-white/10">
            <Lock size={16} />
            <span className="text-xs font-black uppercase italic tracking-widest">Upgrade to Pro to view stats</span>
         </div>
      </div>
    )}
  </div>
);

const StatRow: React.FC<{ label: string, value: string | number, highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`flex items-center justify-between p-4 rounded-2xl transition-colors ${highlight ? 'bg-indigo-50 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">{label}</span>
    <span className={`text-lg font-black tabular-nums ${highlight ? 'text-indigo-600' : 'dark:text-white'}`}>{value}</span>
  </div>
);

export default ProfileView;
