
import React, { useState, useEffect } from 'react';
import { MOCK_INTERNATIONAL_MATCHES, MOCK_LOCAL_MATCHES } from './constants';
import { Match, MatchType, MatchStatus, UserTier } from './types';
import MatchCard from './components/MatchCard';
import ScoringInterface from './components/ScoringInterface';
import LiveMatchDetail from './components/LiveMatchDetail';
import CreateMatchForm from './components/CreateMatchForm';
import ThemeToggle from './components/ThemeToggle';
import ProfileView from './components/ProfileView';
import LeaguesView from './components/LeaguesView';
import { LayoutDashboard, PlusCircle, Trophy, User, Search, Loader2, RefreshCw, Radio } from 'lucide-react';
import { fetchLiveInternationalMatches } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'my-matches' | 'tournaments' | 'profile'>('home');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [localMatches, setLocalMatches] = useState<Match[]>(MOCK_LOCAL_MATCHES);
  const [internationalMatches, setInternationalMatches] = useState<Match[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<UserTier>(UserTier.FREE);

  useEffect(() => {
    loadLiveMatches();
    const interval = setInterval(loadLiveMatches, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadLiveMatches = async () => {
    setIsLoadingLive(true);
    setError(null);
    try {
      const live = await fetchLiveInternationalMatches();
      const liveOnly = live.filter(m => m.status === MatchStatus.LIVE);
      setInternationalMatches(liveOnly);
    } catch (err) {
      setError("Unable to load live scores. Please try again.");
    } finally {
      setIsLoadingLive(false);
    }
  };

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
  };

  const handleSaveLocalMatch = (match: Match) => {
    setLocalMatches(prev => [match, ...prev]);
    setShowCreateForm(false);
    setSelectedMatch(match);
  };

  const updateMatch = (updatedMatch: Match) => {
    if (updatedMatch.type === MatchType.LOCAL) {
      setLocalMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
    }
    setSelectedMatch(updatedMatch);
  };

  const handleUpgrade = () => {
    if (confirm("Experience the Elite Tier? Unlock career-deep analytics and historical trends for $4.99/mo.")) {
      setUserTier(UserTier.PRO);
      alert("Welcome to CricTrack Pro! All data limits removed.");
    }
  };

  if (selectedMatch) {
    if (selectedMatch.type === MatchType.INTERNATIONAL) {
      return (
        <LiveMatchDetail 
          match={selectedMatch} 
          onBack={() => setSelectedMatch(null)}
          onRefresh={loadLiveMatches}
        />
      );
    }
    return (
      <ScoringInterface 
        match={selectedMatch} 
        onBack={() => setSelectedMatch(null)}
        onUpdate={updateMatch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      {showCreateForm && <CreateMatchForm onClose={() => setShowCreateForm(false)} onSave={handleSaveLocalMatch} />}
      
      {/* Sidebar - Desktop */}
      <nav className="hidden md:flex flex-col w-80 h-screen sticky top-0 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 p-10">
        <div className="flex items-center gap-4 mb-14">
          <div className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-indigo-600/30">
            <Trophy className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight dark:text-white italic leading-none">Cric<span className="text-indigo-600">Pro</span></h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1.5">Elite Edition</p>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <NavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Radio size={22}/>} label="Live Center" />
          <NavItem active={activeTab === 'my-matches'} onClick={() => setActiveTab('my-matches')} icon={<PlusCircle size={22}/>} label="My Scorer" />
          <NavItem active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} icon={<Trophy size={22}/>} label="Leagues" />
          <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={22}/>} label="Profile" />
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
           <span className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Theme Mode</span>
           <ThemeToggle />
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-12 pb-32 md:pb-12 max-w-7xl mx-auto w-full">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-10">
           <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/30">
              <Trophy className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter dark:text-white italic">Cric<span className="text-indigo-600">Pro</span></h1>
          </div>
          <ThemeToggle />
        </div>

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-3">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
              {activeTab === 'home' ? 'Global Live' : activeTab === 'profile' ? 'My Profile' : activeTab === 'my-matches' ? 'Local Scorer' : activeTab === 'tournaments' ? 'Leagues & Scouting' : 'My Career'}
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] italic">Real-time Cricket Intelligence Active</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search series, teams or venues..." 
                className="w-full pl-14 pr-6 py-4.5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 outline-none transition-all dark:text-white font-black italic shadow-sm"
              />
            </div>
          </div>
        </header>

        {activeTab === 'home' && (
          <div className="space-y-16 animate-in fade-in duration-700">
            <section>
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-black flex items-center gap-4 italic uppercase tracking-tighter">
                  <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse"></div>
                  International Board
                </h3>
                <button 
                  onClick={loadLiveMatches}
                  className="flex items-center gap-3 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] px-6 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-600/10 hover:bg-indigo-100 transition-all shadow-sm"
                >
                  <RefreshCw size={16} className={isLoadingLive ? 'animate-spin' : ''} />
                  {isLoadingLive ? 'SYNCING DATA' : 'REFRESH SCORES'}
                </button>
              </div>

              {error ? (
                <div className="flex flex-col items-center justify-center py-24 bg-red-50 dark:bg-red-950/20 rounded-[3rem] border border-red-100 dark:border-red-900/30">
                  <p className="text-red-600 dark:text-red-400 font-black uppercase italic text-sm">{error}</p>
                </div>
              ) : isLoadingLive && internationalMatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                  <Loader2 className="animate-spin text-indigo-600 mb-6" size={48} />
                  <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[11px] italic">Fetching Global Match Feeds...</p>
                </div>
              ) : internationalMatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 text-center px-10">
                  <Radio className="text-slate-300 dark:text-slate-700 mb-6" size={64} />
                  <h4 className="text-xl font-black dark:text-white uppercase italic tracking-tighter">No live international matches</h4>
                  <p className="text-slate-500 font-bold text-xs uppercase mt-2 tracking-widest">Global feed is currently clear. Check upcoming fixtures.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {internationalMatches.map(m => (
                    <MatchCard key={m.id} match={m} onClick={handleMatchClick} />
                  ))}
                </div>
              )}
            </section>

            {/* Promo Banner */}
            <section className="bg-gradient-to-r from-indigo-700 to-blue-600 rounded-[3.5rem] p-12 relative overflow-hidden group shadow-2xl shadow-indigo-600/20">
               <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                 <div className="space-y-5">
                   <h2 className="text-5xl font-black text-white italic leading-[0.9] tracking-tighter">SCORING <br/>MADE ELITE</h2>
                   <p className="text-indigo-100/80 max-w-xl font-bold uppercase text-xs tracking-widest leading-relaxed">Turn your local games into professional broadcasts. AI insights, cloud statistics, and high-fidelity scorecards.</p>
                 </div>
                 <button 
                  onClick={() => setShowCreateForm(true)}
                  className="px-14 py-6 bg-white text-indigo-900 font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl text-xl flex items-center gap-4 uppercase italic tracking-tighter"
                 >
                   LAUNCH NEW GAME <PlusCircle size={28} />
                 </button>
               </div>
               <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            </section>
          </div>
        )}

        {activeTab === 'my-matches' && (
          <section className="animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter">My Local Board</h3>
              <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-4 px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 transition-all hover:scale-105 italic">
                <PlusCircle size={22} /> New Scorecard
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {localMatches.map(m => (
                  <MatchCard key={m.id} match={m} onClick={handleMatchClick} />
                ))}
                {localMatches.length === 0 && (
                  <div className="col-span-full py-32 text-center bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                    <PlusCircle className="mx-auto text-slate-300 mb-6" size={64} />
                    <h4 className="text-xl font-black dark:text-white uppercase italic tracking-tighter">No local scorecards</h4>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Start your first amateur game to see it here.</p>
                  </div>
                )}
            </div>
          </section>
        )}

        {activeTab === 'profile' && (
          <ProfileView userTier={userTier} onUpgrade={handleUpgrade} />
        )}

        {activeTab === 'tournaments' && (
           <LeaguesView />
        )}
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-8 left-8 right-8 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 px-8 py-5 rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <MobileNavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Radio size={28}/>} label="Live" />
          <MobileNavItem active={activeTab === 'my-matches'} onClick={() => setActiveTab('my-matches')} icon={<PlusCircle size={28}/>} label="Scorer" />
          <MobileNavItem active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} icon={<Trophy size={28}/>} label="Leagues" />
          <MobileNavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={28}/>} label="Profile" />
        </div>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-5 px-8 py-5 rounded-[1.5rem] font-black transition-all group ${
      active 
        ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 scale-[1.02]' 
        : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'} transition-colors`}>{icon}</span>
    <span className="tracking-tight italic uppercase text-sm">{label}</span>
  </button>
);

const MobileNavItem: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 ${
      active ? 'text-indigo-600 scale-125' : 'text-slate-400'
    }`}
  >
    {icon}
    <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
  </button>
);

export default App;
