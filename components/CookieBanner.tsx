
import React, { useState, useEffect } from 'react';
import { Cookie, Check, X } from 'lucide-react';

interface CookieBannerProps {
  isDarkMode: boolean;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ isDarkMode }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed z-[100] animate-message bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 md:bottom-6 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300 ${
      isDarkMode 
        ? 'bg-slate-900/90 border-slate-700 text-slate-100 shadow-black/50' 
        : 'bg-white/90 border-slate-200 text-slate-800 shadow-slate-200/50'
    }`}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full shrink-0 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <Cookie size={24} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-lg mb-1">Cookie Policy 🍪</h4>
            <p className={`text-sm leading-relaxed mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Utilizziamo i cookie tecnici per garantire il funzionamento del chatbot e migliorare la tua esperienza.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={handleAccept}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Check size={16} /> Accetta
              </button>
            </div>
          </div>
          <button 
             onClick={() => setIsVisible(false)}
             className={`p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
