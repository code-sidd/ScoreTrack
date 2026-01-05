
import React from 'react';
import { X, ShieldAlert, Target, Zap, ChevronRight, Sparkles, BrainCircuit, TrendingDown, ArrowUpRight } from 'lucide-react';

interface MatchPrepModalProps {
  match: any;
  onClose: () => void;
}

const MatchPrepModal: React.FC<MatchPrepModalProps> = ({ match, onClose }) => {
  const opponent = match.team1 === "Titans XI" ? match.team2 : match.team1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="bg-slate-900 w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-lime-400/20 animate-in zoom-in-95 duration-500 relative">
        {/* Futuristic Background Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lime-400 to-transparent"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-lime-400/10 rounded-full blur-[100px]"></div>

        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
           <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-lime-400 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(163,230,53,0.2)]">
               <BrainCircuit className="text-slate-900" size={32} />
             </div>
             <div>
               <div className="flex items-center gap-2 mb-1">
                 <Sparkles size={12} className="text-lime-400" />
                 <p className="text-[10px] font-black text-lime-400 uppercase tracking-[0.4em] italic">AI Tactical Intelligence</p>
               </div>
               <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">Scouting: {opponent}</h2>
             </div>
           </div>
           <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-3xl transition-all">
             <X size={28} className="text-slate-500" />
           </button>
        </div>

        <div className="p-10 space-y-10 max-h-[75vh] overflow-y-auto no-scrollbar relative">
          {/* Opponent Analysis Card */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 relative group overflow-hidden">
             <div className="flex items-center gap-4 text-lime-400">
               <Target size={24} />
               <h4 className="text-lg font-black uppercase italic tracking-tighter">Strategic Overview</h4>
             </div>
             <div className="space-y-4">
                <InsightRow icon={<Zap size={16} className="text-amber-400" />} text="Aggressive Opener Analysis: Their lead batter scores 60% of runs behind square. Set a fine-leg and deep-third immediately." />
                <InsightRow icon={<ShieldAlert size={16} className="text-red-400" />} text="Spin Threat: They frequently deploy 2 Spinners (Leggie & Offie) in the Powerplay to stifle run flow." />
                <InsightRow icon={<TrendingDown size={16} className="text-indigo-400" />} text="Middle Order Weakness: Statistical trend shows 70% collapse probability against short-pitched bowling between overs 7-12." />
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-lime-400/10 transition-colors"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-slate-800/50 p-8 rounded-[2rem] border border-white/5 space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Win Condition</p>
                <h5 className="text-xl font-black text-white italic uppercase tracking-tight">Early Wickets (0-6 Overs)</h5>
                <p className="text-xs text-slate-400 leading-relaxed font-bold">Data shows {opponent} loses 80% of matches when 2+ wickets fall in the Powerplay. Use your lead pace bowler with a fuller length.</p>
             </div>
             <div className="bg-slate-800/50 p-8 rounded-[2rem] border border-white/5 space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">User Recommendation</p>
                <h5 className="text-xl font-black text-white italic uppercase tracking-tight">Promote Alex Morgan</h5>
                <p className="text-xs text-slate-400 leading-relaxed font-bold">Alex has a 165.2 SR against their primary off-spinner. Consider promotion if spin is introduced early.</p>
             </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={onClose}
              className="w-full py-7 bg-lime-400 hover:bg-lime-500 text-slate-900 font-black rounded-full transition-all shadow-[0_20px_40px_rgba(163,230,53,0.3)] flex items-center justify-center gap-4 text-2xl uppercase italic tracking-tighter"
            >
              Copy To Team Chat <ArrowUpRight size={32} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InsightRow: React.FC<{ icon: React.ReactNode, text: string }> = ({ icon, text }) => (
  <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
    <div className="shrink-0 pt-1">{icon}</div>
    <p className="text-sm text-slate-300 font-bold leading-relaxed italic">{text}</p>
  </div>
);

export default MatchPrepModal;
