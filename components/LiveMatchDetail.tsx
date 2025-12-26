
import React, { useState, useEffect } from 'react';
import { Match, MatchStatus } from '../types';
import { ChevronLeft, Globe, Zap, History, Loader2, RefreshCw } from 'lucide-react';
import { fetchRecentOverInsights, getMatchInsights } from '../services/geminiService';

interface LiveMatchDetailProps {
  match: Match;
  onBack: () => void;
  onRefresh: () => void;
}

const LiveMatchDetail: React.FC<LiveMatchDetailProps> = ({ match, onBack, onRefresh }) => {
  const [overData, setOverData] = useState<any[]>([]);
  const [insight, setInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLiveDetails();
  }, [match.id]);

  const loadLiveDetails = async () => {
    setIsLoading(true);
    const [over, aiSummary] = await Promise.all([
      fetchRecentOverInsights(match),
      getMatchInsights(match)
    ]);
    setOverData(over || []);
    setInsight(aiSummary || 'No summary available.');
    setIsLoading(false);
  };

  const inningA = match.innings?.[0] || { totalRuns: 0, wickets: 0, overs: 0, balls: 0 };
  const inningB = match.innings?.[1] || { totalRuns: 0, wickets: 0, overs: 0, balls: 0 };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Live Match Tracking</span>
             </div>
             <h2 className="text-sm font-black dark:text-white truncate max-w-[200px]">{match.teamA} vs {match.teamB}</h2>
          </div>
          <button 
            onClick={() => { onRefresh(); loadLiveDetails(); }}
            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 rounded-xl transition-colors"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 space-y-8">
        {/* Match Header Info */}
        <div className="bg-slate-900 dark:bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
           <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-center gap-4">
                 <div className="text-center flex-1">
                    <h3 className="text-xl font-black mb-1 italic">{match.teamA}</h3>
                    <p className="text-3xl font-black tabular-nums">{inningA.totalRuns}/{inningA.wickets}</p>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{inningA.overs}.{inningA.balls} OV</p>
                 </div>
                 <div className="w-px h-12 bg-white/10"></div>
                 <div className="text-center flex-1">
                    <h3 className="text-xl font-black mb-1 italic">{match.teamB}</h3>
                    <p className="text-3xl font-black tabular-nums">{inningB.totalRuns}/{inningB.wickets}</p>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{inningB.overs}.{inningB.balls} OV</p>
                 </div>
              </div>
              <div className="bg-white/10 py-3 rounded-2xl text-center border border-white/10">
                 <span className="text-sm font-black italic tracking-tight">{match.statusText || 'Match in Progress'}</span>
              </div>
           </div>
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-transparent"></div>
        </div>

        {/* AI Insight */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                 <Zap className="text-amber-600" size={18} />
              </div>
              <h4 className="font-black italic text-slate-900 dark:text-white">CRIC-AI SUMMARY</h4>
           </div>
           {isLoading ? (
             <div className="h-20 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
           ) : (
             <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">"{insight}"</p>
           )}
        </div>

        {/* Ball-by-ball Tiles */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <History size={14} /> Last Over Insight
              </h4>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded uppercase">Real-time Analysis</span>
           </div>
           
           <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-1">
              {isLoading ? (
                [1,2,3,4,5,6].map(i => <div key={i} className="min-w-[140px] h-[180px] rounded-3xl animate-pulse bg-slate-100 dark:bg-slate-800"></div>)
              ) : overData.length > 0 ? overData.map((ball, i) => (
                <div key={i} className="min-w-[160px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-5 shadow-lg group hover:border-blue-500 transition-all">
                   <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Ball {ball.ball}</span>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
                        ball.isWicket ? 'bg-red-600 text-white' : 
                        ball.runs >= 4 ? 'bg-emerald-600 text-white' : 
                        'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      }`}>
                        {ball.isWicket ? 'W' : ball.runs}
                      </div>
                   </div>
                   <p className="text-xs font-bold leading-relaxed dark:text-slate-300 min-h-[60px]">{ball.desc}</p>
                   <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Inning {match.currentInning + 1}</span>
                   </div>
                </div>
              )) : (
                <div className="w-full text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Recent ball data not available yet
                </div>
              )}
           </div>
        </section>

        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
           <div className="flex items-center gap-3 text-slate-500">
              <Globe size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Source: {match.source}</span>
           </div>
        </div>
      </main>
    </div>
  );
};

export default LiveMatchDetail;
