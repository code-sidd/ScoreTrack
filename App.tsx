
import React, { useState, useEffect } from 'react';
import { MOCK_INTERNATIONAL_MATCHES, MOCK_LOCAL_MATCHES } from './constants';
import { Match, MatchType } from './types';
import MatchCard from './components/MatchCard';
import ScoringInterface from './components/ScoringInterface';
import LiveMatchDetail from './components/LiveMatchDetail';
import CreateMatchForm from './components/CreateMatchForm';
import ThemeToggle from './components/ThemeToggle';
import { LayoutDashboard, PlusCircle, Trophy, User, Search, Bell, Loader2, RefreshCw } from 'lucide-react';
import { fetchLiveInternationalMatches } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'my-matches' | 'tournaments' | 'profile'>('home');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [localMatches, setLocalMatches] = useState<Match[]>(MOCK_LOCAL_MATCHES);
  const [internationalMatches, setInternationalMatches] = useState<Match[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadLiveMatches();
    // 60-second auto-refresh for live matches
    const interval = setInterval(loadLiveMatches, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadLiveMatches = async () => {
    setIsLoadingLive(true);
    const live = await fetchLiveInternationalMatches();
    if (live && live.length > 0) {
      setInternationalMatches(live);
    }
    setIsLoadingLive(false);
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
      <nav className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 p-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20">
            <Trophy className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight dark:text-white italic leading-none">CricTrack<span className="text-blue-600">Pro</span></h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Premium Edition</p>
          </div>
        </div>

        <div className="space-y-3 flex-1">
          <NavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutDashboard size={20}/>} label="Live Center" />
          <NavItem active={activeTab === 'my-matches'} onClick={() => setActiveTab('my-matches')} icon={<PlusCircle size={20}/>} label="My Scorecards" />
          <NavItem active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} icon={<Trophy size={20}/>} label="Tournaments" />
          <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={20}/>} label="My Statistics" />
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Theme</span>
           <ThemeToggle />
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-10 pb-28 md:pb-10 max-w-7xl mx-auto w-full">
        {/* Mobile Navbar */}
        <div className="md:hidden flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Trophy className="text-white" size={22} />
            </div>
            <h1 className="text-xl font-black tracking-tighter dark:text-white italic">CricTrack<span className="text-blue-600">Pro</span></h1>
          </div>
          <ThemeToggle />
        </div>

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2 uppercase italic">
              {activeTab === 'home' ? 'International' : activeTab === 'my-matches' ? 'Local Board' : 'Statistics'}
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-slate-500 font-black text-xs uppercase tracking-widest">Scorer Dashboard Active</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search series or teams..." 
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 outline-none transition-all dark:text-white font-bold"
              />
            </div>
          </div>
        </header>

        {activeTab === 'home' && (
          <div className="space-y-12">
            <section>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black flex items-center gap-3 italic">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  LIVE FEED
                </h3>
                <button 
                  onClick={loadLiveMatches}
                  className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-600/10 transition-all"
                >
                  <RefreshCw size={14} className={isLoadingLive ? 'animate-spin' : ''} />
                  {isLoadingLive ? 'SYNCING...' : 'FORCE REFRESH'}
                </button>
              </div>

              {isLoadingLive && internationalMatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                  <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Gathering Live Data from World Feeds...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {internationalMatches.map(m => (
                    <MatchCard key={m.id} match={m} onClick={handleMatchClick} />
                  ))}
                </div>
              )}
            </section>

            <section className="bg-slate-900 dark:bg-blue-600 rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl">
               <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                 <div className="space-y-4">
                   <h2 className="text-4xl font-black text-white italic leading-tight">Host Your Own <br/>Tournament</h2>
                   <p className="text-slate-300 dark:text-blue-100 max-w-xl font-bold">Start tracking local games with professional precision. Cloud sync, AI analysis, and player profiling.</p>
                 </div>
                 <button 
                  onClick={() => setShowCreateForm(true)}
                  className="px-12 py-5 bg-white text-slate-900 font-black rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-2xl text-lg flex items-center gap-3"
                 >
                   NEW GAME <PlusCircle size={24} />
                 </button>
               </div>
               <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
            </section>
          </div>
        )}

        {activeTab === 'my-matches' && (
          <section>
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black italic uppercase">LOCAL FIXTURES</h3>
              <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all hover:scale-105">
                <PlusCircle size={18} /> START SCORING
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {localMatches.map(m => (
                  <MatchCard key={m.id} match={m} onClick={handleMatchClick} />
                ))}
                {localMatches.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                    <PlusCircle className="mx-auto text-slate-300 mb-4" size={48} />
                    <h4 className="font-black dark:text-white uppercase italic">No Local Games Found</h4>
                    <p className="text-slate-500 text-sm mt-1">Start your first game to see it here.</p>
                  </div>
                )}
            </div>
          </section>
        )}

        {(activeTab === 'tournaments' || activeTab === 'profile') && (
           <div className="flex flex-col items-center justify-center py-32 text-center">
              <Trophy className="text-slate-200 dark:text-slate-800 mb-6" size={80} />
              <h3 className="text-2xl font-black italic mb-2 uppercase">Feature Locked</h3>
              <p className="text-slate-500 max-w-sm font-bold uppercase text-[10px] tracking-widest">Available in Pro Tier only</p>
           </div>
        )}
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-40 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 px-6 py-4 rounded-[2.5rem] shadow-2xl">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {/* Fix: Added missing closing parentheses to setActiveTab calls in onClick handlers */}
          <MobileNavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutDashboard size={24}/>} label="Live" />
          <MobileNavItem active={activeTab === 'my-matches'} onClick={() => setActiveTab('my-matches')} icon={<PlusCircle size={24}/>} label="Local" />
          <MobileNavItem active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} icon={<Trophy size={24}/>} label="Leagues" />
          <MobileNavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={24}/>} label="Stats" />
        </div>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all group ${
      active 
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' 
        : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`}>{icon}</span>
    <span className="tracking-tight italic">{label}</span>
  </button>
);

const MobileNavItem: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 transition-all ${
      active ? 'text-blue-600 scale-110' : 'text-slate-400'
    }`}
  >
    {icon}
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
