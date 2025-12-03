
import React, { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { OrientationQuiz } from './components/OrientationQuiz';
import { HomePage } from './components/HomePage';
import { CookieBanner } from './components/CookieBanner';
import { Moon, Sun, HelpCircle, Lightbulb, X, Send, Sparkles, BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLanding, setShowLanding] = useState(true); // Control Landing vs App
  
  const [autoQuestion, setAutoQuestion] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Feedback Modal State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Quiz Modal State
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Toggle theme handler
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const faqItems = [
    { icon: "🏫", text: "Quali indirizzi offre la scuola?" },
    { icon: "💼", text: "Sbocchi lavorativi post-diploma" },
    { icon: "🧪", text: "Come sono i laboratori?" },
    { icon: "🌍", text: "Progetti Erasmus e viaggi" },
    { icon: "🚌", text: "Dove si trova la sede?" },
  ];

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    
    // Simulate sending feedback
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFeedbackText('');
      setIsFeedbackOpen(false);
    }, 1000); // Faster feedback loop
  };

  const handleFaqClick = (question: string) => {
    setAutoQuestion(question);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleQuizComplete = (result: string) => {
    setIsQuizOpen(false);
    setIsSidebarOpen(false);
    handleFaqClick(`Ho completato il quiz di orientamento e il risultato è: "${result}". Puoi darmi maggiori dettagli su questo indirizzo di studio e dirmi perché potrebbe essere adatto a me?`);
  };

  return (
    <div className={`h-[100dvh] w-screen flex overflow-hidden relative ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Classic Background Layer - Subtle and Static */}
      <div className="absolute inset-0 z-0 bg-classic transition-colors duration-500 pointer-events-none"></div>

      {showLanding ? (
        <HomePage 
          onStart={() => setShowLanding(false)} 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme}
        />
      ) : (
        <>
          {/* Mobile Sidebar Backdrop */}
          {isSidebarOpen && (
            <div 
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden animate-fade-in"
                onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar Navigation - Glassmorphism */}
          <div className={`
            fixed inset-y-0 left-0 z-50 w-72 flex flex-col transform transition-transform duration-300 ease-in-out
            md:relative md:translate-x-0 md:z-auto glass md:border-r-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            ${isDarkMode ? 'border-r border-white/5' : 'border-r border-slate-200'}
          `}>
            {/* Sidebar Header with Logo */}
            <div className="p-6 pb-2 flex justify-between items-start">
              <div className="relative group cursor-pointer" onClick={() => setShowLanding(true)}>
                <div className={`relative rounded-xl p-3 border shadow-sm flex items-center justify-center transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <img 
                    src="https://20.gdromagnosi.it/img/xtra/logo.png" 
                    alt="ISIS Romagnosi Logo" 
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <div className="mt-4">
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>ISIS G.D. Romagnosi • Erba</p>
                  <h1 className={`font-bold text-lg tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    Chatbot Orientamento
                  </h1>
                </div>
              </div>
              {/* Close button for mobile */}
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className={`md:hidden p-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-400 hover:bg-white/10' : 'text-slate-500 hover:bg-black/5'}`}
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Scrollable Middle Section */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2">
                <div className={`p-4 rounded-xl mb-6 text-sm leading-relaxed shadow-sm border ${
                    isDarkMode 
                    ? 'bg-slate-800/40 border-white/5 text-slate-300' 
                    : 'bg-white/80 border-slate-200 text-slate-600'
                }`}>
                    <div className="flex items-start gap-2">
                        <Sparkles size={16} className="text-blue-500 shrink-0 mt-0.5" />
                        <span>Ciao! Chiedimi qualsiasi cosa sulla nostra scuola. Sono qui per aiutarti a scegliere il tuo futuro!</span>
                    </div>
                </div>

                {/* Quiz CTA */}
                <button 
                    onClick={() => setIsQuizOpen(true)}
                    className="w-full mb-6 relative overflow-hidden group p-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="relative z-10 flex items-center justify-between text-white">
                        <div className="text-left">
                            <p className="font-bold text-lg">Quiz Orientamento</p>
                            <p className="text-xs text-indigo-100 opacity-90">Scopri la strada giusta per te!</p>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <BrainCircuit size={24} />
                        </div>
                    </div>
                </button>

                {/* FAQ Section */}
                <div className="mb-6">
                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 px-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        <HelpCircle size={12} />
                        Domande Frequenti
                    </h3>
                    <div className="space-y-2">
                        {faqItems.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleFaqClick(item.text)}
                                className={`w-full text-left p-3 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 group hover:translate-x-1 border border-transparent ${
                                    isDarkMode 
                                    ? 'hover:bg-slate-800 text-slate-300 hover:border-slate-700' 
                                    : 'hover:bg-white text-slate-700 hover:border-slate-200 hover:shadow-sm'
                                }`}
                            >
                                <span className="text-lg transition-all">{item.icon}</span>
                                <span className="font-medium">{item.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <div className={`p-4 space-y-3 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-200/60'}`}>
              
               {/* Feedback Button */}
              <button 
                 onClick={() => setIsFeedbackOpen(true)}
                 className={`w-full flex items-center gap-2 p-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.01] active:scale-95 shadow-sm border ${
                     isDarkMode 
                     ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' 
                     : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                 }`}
              >
                  <Lightbulb size={16} />
                  Suggerisci idee
              </button>

              <div className="flex justify-between items-center px-1 pt-1 opacity-60">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    System Online
                  </div>
                  <span className="text-[10px] text-slate-400">v2.1 Beta</span>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 h-full relative z-10 p-0 md:p-4 perspective-1000 flex flex-col overflow-hidden">
            <div className="w-full h-full md:rounded-2xl overflow-hidden shadow-xl glass-panel relative border-0 md:border">
               <ChatInterface 
                 isDarkMode={isDarkMode} 
                 externalMessage={autoQuestion}
                 onExternalMessageHandled={() => setAutoQuestion(null)}
                 onToggleSidebar={() => setIsSidebarOpen(true)}
                 toggleTheme={toggleTheme}
               />
            </div>
          </main>

          {/* Quiz Modal */}
          {isQuizOpen && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                 <OrientationQuiz 
                    onClose={() => setIsQuizOpen(false)}
                    onComplete={handleQuizComplete}
                    isDarkMode={isDarkMode}
                 />
             </div>
          )}

          {/* Feedback Modal */}
          {isFeedbackOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
               <div className={`w-full max-w-md rounded-2xl shadow-2xl transform transition-all scale-100 animate-message p-1 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                  <div className="p-6 h-full w-full bg-inherit rounded-xl relative overflow-hidden">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className={`font-bold text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            <span className="bg-amber-100 text-amber-600 p-1.5 rounded-lg"><Lightbulb size={20} /></span>
                            Migliora il Bot
                          </h3>
                          <button onClick={() => setIsFeedbackOpen(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                              <X size={20} />
                          </button>
                      </div>
                      
                      {feedbackSent ? (
                          <div className="text-center py-8 animate-message">
                              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                                  <Send size={28} />
                              </div>
                              <h4 className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Grazie! 🚀</h4>
                              <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Il tuo feedback ci aiuta a crescere.</p>
                          </div>
                      ) : (
                          <form onSubmit={handleSendFeedback}>
                              <textarea 
                                  required
                                  value={feedbackText}
                                  onChange={(e) => setFeedbackText(e.target.value)}
                                  className={`w-full h-32 p-4 rounded-xl border text-sm resize-none focus:ring-2 focus:ring-blue-500/50 outline-none transition-all ${
                                      isDarkMode 
                                      ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500' 
                                      : 'bg-slate-50 border-slate-200 text-slate-900'
                                  }`}
                                  placeholder="Hai trovato un bug? O hai un'idea geniale? Scrivici!"
                              />
                              <div className="mt-6 flex justify-end gap-3">
                                  <button 
                                      type="submit"
                                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-95"
                                  >
                                      Invia Idea
                                  </button>
                              </div>
                          </form>
                      )}
                  </div>
               </div>
            </div>
          )}
        </>
      )}

      {/* Cookie Banner */}
      <CookieBanner isDarkMode={isDarkMode} />
      
    </div>
  );
};

export default App;