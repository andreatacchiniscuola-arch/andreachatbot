
import React from 'react';
import { ArrowRight, School, Compass, MessageCircle, Moon, Sun, BookOpen, Sparkles } from 'lucide-react';

interface HomePageProps {
  onStart: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStart, isDarkMode, toggleTheme }) => {
  const AVATAR_URL = "https://20.gdromagnosi.it/img/xtra/logo.png";

  const features = [
    {
      icon: <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />,
      title: "Indirizzi Studio",
      desc: "Scopri Tecnico Economico, Tecnologico e Professionale.",
      color: "blue"
    },
    {
      icon: <Compass className="text-purple-600 dark:text-purple-400" size={24} />,
      title: "Orientamento",
      desc: "Non sai cosa scegliere? Fai il quiz e trova la tua strada.",
      color: "purple"
    },
    {
      icon: <School className="text-emerald-600 dark:text-emerald-400" size={24} />,
      title: "Vita a Scuola",
      desc: "Laboratori, progetti, orari e tutto quello che serve.",
      color: "emerald"
    }
  ];

  return (
    <div className={`min-h-[100dvh] w-full flex flex-col relative overflow-hidden transition-colors duration-500 font-sans ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {/* Decorative Background Blobs - Reduced size for compactness */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-purple-400/20 rounded-full blur-[80px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[250px] h-[250px] bg-blue-400/20 rounded-full blur-[80px] pointer-events-none animate-pulse [animation-delay:2s]"></div>

      {/* Navbar - Compact */}
      <nav className="w-full px-5 py-3 flex justify-between items-center z-20 relative animate-message">
        <div className="flex items-center gap-2">
           <div className="relative group cursor-default">
              <div className={`relative w-9 h-9 rounded-lg shadow-sm flex items-center justify-center p-1 transition-all ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                <img src={AVATAR_URL} alt="Logo" className="w-full h-full object-contain" />
              </div>
           </div>
           <div>
            <h1 className="font-bold text-base tracking-tight leading-none">ISIS Romagnosi</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Orientamento</p>
            </div>
          </div>
        </div>
        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-all border shadow-sm hover:scale-105 active:scale-95 ${
             isDarkMode 
             ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' 
             : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </nav>

      {/* Main Content - Compact & Visible */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 w-full max-w-4xl mx-auto py-2">
        
        <div className="text-center max-w-xl mx-auto space-y-4 animate-pop-in relative">
           
           {/* Badge */}
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 cursor-default select-none">
              <Sparkles size={12} />
              <span>Il tuo assistente personale</span>
           </div>
           
           {/* Hero Title - Compact */}
           <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">
             Scegliere la scuola <br className="hidden sm:block" />
             non è mai stato <br className="sm:hidden" />
             <span className="relative inline-block mt-1 sm:mt-0">
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 drop-shadow-sm">
                  così semplice.
                </span>
             </span>
           </h1>
           
           <p className={`text-sm md:text-base leading-relaxed max-w-md mx-auto font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
             Ciao! Sono il Chatbot dell'ISIS Romagnosi. <br/>
             Chiedimi tutto su indirizzi, laboratori e futuro. 
           </p>

           {/* CTA Button - HIGH VISIBILITY */}
           <div className="pt-4 pb-2 flex justify-center w-full">
             <button 
                onClick={onStart}
                className="group relative w-full sm:w-auto min-w-[280px] px-8 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 overflow-hidden text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 border border-white/20"
             >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <MessageCircle className="relative z-10 w-6 h-6 animate-pulse" />
                <span className="relative z-10">INIZIA A CHATTARE</span>
                <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform w-6 h-6" />
             </button>
           </div>
        </div>

        {/* Feature Cards - Compact Spacing & High Visibility */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mt-6 animate-message [animation-delay:0.3s]">
           {features.map((feat, idx) => (
             <div 
               key={idx}
               className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 group overflow-hidden ${
                 isDarkMode 
                 ? 'bg-slate-800 border-slate-600 shadow-lg hover:border-slate-400' 
                 : 'bg-white border-slate-200 shadow-lg hover:border-indigo-300'
               }`}
             >
               <div className="flex items-center gap-3 mb-2">
                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                       isDarkMode 
                       ? 'bg-slate-900 border-slate-700 text-white' 
                       : 'bg-slate-50 border-slate-100 text-slate-800'
                   }`}>
                     {feat.icon}
                   </div>
                   <h3 className={`font-bold text-base leading-tight group-hover:text-${feat.color}-600 dark:group-hover:text-${feat.color}-400 transition-colors`}>{feat.title}</h3>
               </div>
               <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{feat.desc}</p>
             </div>
           ))}
        </div>

      </main>

      {/* Simple Footer */}
      <footer className="p-3 text-center text-[9px] opacity-50 relative z-10 uppercase tracking-widest">
        <p className="flex justify-center items-center gap-2">
            © {new Date().getFullYear()} ISIS G.D. Romagnosi 
            <span className="w-1 h-1 rounded-full bg-current"></span> 
            Erba (CO)
        </p>
      </footer>
    </div>
  );
};
