
import React, { useState, useEffect } from 'react';
import { MOCK_INTERNATIONAL_MATCHES, MOCK_LOCAL_MATCHES } from './constants';
import { Match, MatchType } from './types';
import MatchCard from './components/MatchCard';
import ScoringInterface from './components/ScoringInterface';
import ThemeToggle from './components/ThemeToggle';
import { LayoutDashboard, PlusCircle, Trophy, User, Search, Bell, Loader2, RefreshCw } from 'lucide-react';
import { fetchLiveInternationalMatches } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'my-matches' | 'tournaments' | 'profile'>('home');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [localMatches, setLocalMatches] = useState<Match[]>(MOCK_LOCAL_MATCHES);
  const [internationalMatches, setInternationalMatches] = useState<Match[]>(MOCK_INTERNATIONAL_MATCHES);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  useEffect(() => {
    loadLiveMatches();
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

  const updateMatch = (updatedMatch: Match) => {
    if (updatedMatch.type === MatchType.LOCAL) {
      setLocalMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
    } else {
      setInternationalMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
    }
    setSelectedMatch(updatedMatch);
  };

  if (selectedMatch) {
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

      {/* Main Content Area */}
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
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              {activeTab === 'home' ? 'International Live' : activeTab === 'my-matches' ? 'My Scorecards' : 'League Stats'}
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <p className="text-slate-500 font-bold text-sm">Welcome back, Scorer Alex 👋</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search series or players..." 
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white font-medium"
              />
            </div>
            <button className="p-3.5 relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
              <Bell size={22} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
          </div>
        </header>

        {activeTab === 'home' && (
          <div className="space-y-12">
            <section>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black flex items-center gap-3 italic">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50"></div>
                  LIVE FIXTURES
                </h3>
                <button 
                  onClick={loadLiveMatches}
                  className="flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-600/10 transition-all"
                >
                  <RefreshCw size={16} className={isLoadingLive ? 'animate-spin' : ''} />
                  {isLoadingLive ? 'Updating...' : 'Refresh API'}
                </button>
              </div>

              {isLoadingLive && internationalMatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                  <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Real-time Matches via Gemini...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {internationalMatches.map(m => (
                    <MatchCard key={m.id} match={m} onClick={handleMatchClick} />
                  ))}
                </div>
              )}
            </section>

            <section className="bg-slate-900 dark:bg-blue-600 rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl shadow-blue-600/20">
               <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                 <div className="space-y-4">
                   <h2 className="text-4xl font-black text-white italic leading-tight">Host Your Own <br/>T20 Championship</h2>
                   <p className="text-slate-300 dark:text-blue-100 max-w-xl text-lg font-medium leading-relaxed">Professional-grade scoring engine with cloud backup, advanced statistics, and AI-powered performance analysis for your local games.</p>
                   <div className="flex gap-4">
                      <div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold text-white uppercase tracking-widest border border-white/10">Cloud Sync</div>
                      <div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold text-white uppercase tracking-widest border border-white/10">Offline First</div>
                   </div>
                 </div>
                 <button 
                  onClick={() => setActiveTab('my-matches')}
                  className="px-12 py-5 bg-white text-slate-900 font-black rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-2xl text-lg group/btn flex items-center gap-3"
                 >
                   CREATE MATCH <PlusCircle size={24} className="group-hover/btn:rotate-90 transition-transform" />
                 </button>
               </div>
               <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-1000"></div>
               <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
            </section>
          </div>
        )}

        {activeTab === 'my-matches' && (
          <section>
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black italic">LOCAL FIXTURES</h3>
              <button className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95">
                <PlusCircle size={20} /> START NEW GAME
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {localMatches.map(m => (
                  <MatchCard key={m.id} match={m} onClick={handleMatchClick} />
                ))}
            </div>
          </section>
        )}

        {/* Empty states */}
        {(activeTab === 'tournaments' || activeTab === 'profile') && (
           <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl border border-slate-100 dark:border-slate-700">
                <Trophy className="text-blue-600" size={40} />
              </div>
              <h3 className="text-2xl font-black italic mb-2">PRO FEATURES COMING SOON</h3>
              <p className="text-slate-500 max-w-sm font-medium">We're building advanced tournament management and career insights for professional scouts.</p>
           </div>
        )}
      </main>

      {/* Mobile Navigation Dock */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 px-6 py-4 rounded-[2.5rem] shadow-2xl">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <MobileNavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutDashboard size={24}/>} label="Live" />
          <MobileNavItem active={activeTab === 'my-matches'} onClick={() => setActiveTab('my-matches')} icon={<PlusCircle size={24}/>} label="Score" />
          <MobileNavItem active={activeTab === 'tournaments'} onClick={() => setActiveTab('tournaments')} icon={<Trophy size={24}/>} label="Leagues" />
          <MobileNavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={24}/>} label="Profile" />
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
        ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30 ring-4 ring-blue-500/10' 
        : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'} transition-colors`}>{icon}</span>
    <span className="tracking-tight">{label}</span>
  </button>
);

const MobileNavItem: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 transition-all relative ${
      active ? 'text-blue-600 scale-110' : 'text-slate-400'
    }`}
  >
    {icon}
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    {active && <span className="absolute -bottom-2 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>}
  </button>
);

export default App;
