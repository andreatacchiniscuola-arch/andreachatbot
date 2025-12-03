import React, { useState } from 'react';
import { ArrowRight, Trophy, X, BrainCircuit } from 'lucide-react';

interface QuizProps {
  onClose: () => void;
  onComplete: (result: string) => void;
  isDarkMode: boolean;
}

type Category = 'ECONOMICO' | 'TURISMO' | 'COSTRUZIONI' | 'AGRARIA' | 'ELETTRONICA' | 'PROFESSIONALE';

interface Option {
  text: string;
  points: Partial<Record<Category, number>>;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Quali materie ti piacciono di più a scuola?",
    options: [
      { text: "Matematica, Informatica e numeri", points: { ECONOMICO: 3, ELETTRONICA: 2 } },
      { text: "Lingue straniere e Geografia", points: { TURISMO: 3, ECONOMICO: 1 } },
      { text: "Tecnologia, Disegno tecnico", points: { COSTRUZIONI: 3, ELETTRONICA: 1 } },
      { text: "Scienze, Biologia, Natura", points: { AGRARIA: 3, PROFESSIONALE: 1 } },
      { text: "Preferisco le attività pratiche e laboratoriali", points: { PROFESSIONALE: 3, AGRARIA: 1 } }
    ]
  },
  {
    id: 2,
    text: "Cosa ti piacerebbe fare 'da grande'?",
    options: [
      { text: "Lavorare in ufficio, gestire aziende o programmare", points: { ECONOMICO: 3, TURISMO: 1 } },
      { text: "Viaggiare, lavorare in hotel o aeroporti", points: { TURISMO: 3, ECONOMICO: 1 } },
      { text: "Progettare case, edifici o lavorare in cantiere", points: { COSTRUZIONI: 3 } },
      { text: "Costruire circuiti, robotica o impianti elettrici", points: { ELETTRONICA: 3 } },
      { text: "Cucinare o aiutare le persone (Sanità)", points: { PROFESSIONALE: 3 } }
    ]
  },
  {
    id: 3,
    text: "Come ti piace passare il tuo tempo libero?",
    options: [
      { text: "Al computer, videogiochi o social media", points: { ECONOMICO: 2, ELETTRONICA: 2 } },
      { text: "Guardare serie TV in lingua o scoprire posti nuovi", points: { TURISMO: 3 } },
      { text: "Stare all'aria aperta, natura o animali", points: { AGRARIA: 3 } },
      { text: "Smontare oggetti, capire come funzionano le cose", points: { ELETTRONICA: 3, COSTRUZIONI: 2 } },
      { text: "Stare con gli amici, cucinare o fare volontariato", points: { PROFESSIONALE: 3 } }
    ]
  },
  {
    id: 4,
    text: "Scegli la parola che ti rappresenta di più:",
    options: [
      { text: "Organizzazione e Logica", points: { ECONOMICO: 3 } },
      { text: "Comunicazione e Apertura", points: { TURISMO: 3 } },
      { text: "Precisione e Progettazione", points: { COSTRUZIONI: 3, ELETTRONICA: 2 } },
      { text: "Natura e Ambiente", points: { AGRARIA: 3 } },
      { text: "Creatività e Servizio", points: { PROFESSIONALE: 3 } }
    ]
  },
  {
    id: 5,
    text: "In quale ambiente ti vedresti meglio a lavorare?",
    options: [
      { text: "Un ufficio moderno e tecnologico", points: { ECONOMICO: 3, ELETTRONICA: 2 } },
      { text: "In giro per il mondo o a contatto con turisti", points: { TURISMO: 3 } },
      { text: "Uno studio di architettura o all'esterno", points: { COSTRUZIONI: 3, AGRARIA: 2 } },
      { text: "Un laboratorio tecnico o scientifico", points: { ELETTRONICA: 2, AGRARIA: 2 } },
      { text: "Un ristorante, un ospedale o a contatto con la gente", points: { PROFESSIONALE: 3 } }
    ]
  }
];

const RESULTS_MAP: Record<Category, string> = {
  ECONOMICO: "Istituto Tecnico Economico (AFM / Sistemi Informativi Aziendali)",
  TURISMO: "Istituto Tecnico Economico - Indirizzo Turismo",
  COSTRUZIONI: "Istituto Tecnico Tecnologico - Costruzioni, Ambiente e Territorio (CAT)",
  AGRARIA: "Istituto Tecnico Tecnologico - Agraria e Agroalimentare",
  ELETTRONICA: "Istituto Tecnico Tecnologico - Elettronica ed Automazione",
  PROFESSIONALE: "Istituto Professionale (Enogastronomia o Sanità/Assistenza)"
};

export const OrientationQuiz: React.FC<QuizProps> = ({ onClose, onComplete, isDarkMode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Record<Category, number>>({
    ECONOMICO: 0,
    TURISMO: 0,
    COSTRUZIONI: 0,
    AGRARIA: 0,
    ELETTRONICA: 0,
    PROFESSIONALE: 0
  });
  const [showResult, setShowResult] = useState(false);
  const [calculatedResult, setCalculatedResult] = useState<string>("");

  const handleOptionSelect = (points: Partial<Record<Category, number>>) => {
    const newScores = { ...scores };
    (Object.keys(points) as Category[]).forEach((key) => {
      newScores[key] = (newScores[key] || 0) + (points[key] || 0);
    });
    setScores(newScores);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      calculateResult(newScores);
    }
  };

  const calculateResult = (finalScores: Record<Category, number>) => {
    let maxScore = -1;
    let winningCategory: Category = 'ECONOMICO'; // Default fallback

    (Object.keys(finalScores) as Category[]).forEach((key) => {
      if (finalScores[key] > maxScore) {
        maxScore = finalScores[key];
        winningCategory = key;
      }
    });

    setCalculatedResult(RESULTS_MAP[winningCategory]);
    setShowResult(true);
  };

  const handleFinish = () => {
    onComplete(calculatedResult);
  };

  if (showResult) {
    return (
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-pop-in ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-lg">
             <Trophy size={40} className="text-yellow-300 drop-shadow-md" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Risultato Calcolato!</h2>
          <p className="opacity-90">Ecco l'indirizzo che fa per te</p>
        </div>
        
        <div className="p-8 text-center">
           <p className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
             Ti consigliamo:
           </p>
           <h3 className={`text-2xl font-extrabold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600`}>
             {calculatedResult}
           </h3>

           <p className={`text-sm mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
             Vuoi saperne di più su questo indirizzo? Chiedi al tutor virtuale!
           </p>

           <div className="flex gap-3">
             <button 
                onClick={onClose}
                className={`flex-1 py-3 rounded-xl font-semibold border transition-all ${
                    isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
             >
               Chiudi
             </button>
             <button 
                onClick={handleFinish}
                className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
             >
               Approfondisci col Tutor <ArrowRight size={18} />
             </button>
           </div>
        </div>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  return (
    <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-message relative ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
      
      {/* Header */}
      <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
         <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
              <BrainCircuit size={20} />
            </div>
            <div>
               <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Quiz Orientamento</h3>
               <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Scopri il tuo futuro in 5 domande</p>
            </div>
         </div>
         <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
           <X size={20} />
         </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-200 dark:bg-slate-700">
         <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Question Content */}
      <div className="p-6">
         <div className="mb-6">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
              Domanda {currentStep + 1} di {QUESTIONS.length}
            </span>
            <h2 className={`text-xl font-bold mt-2 leading-snug ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              {currentQuestion.text}
            </h2>
         </div>

         <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(option.points)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group active:scale-[0.98] ${
                   isDarkMode 
                   ? 'border-slate-700 bg-slate-800/50 hover:border-indigo-500 text-slate-300 hover:text-white' 
                   : 'border-slate-100 bg-slate-50 hover:border-indigo-500 text-slate-700 hover:text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                <span className="font-medium">{option.text}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                    isDarkMode ? 'border-indigo-400' : 'border-indigo-600'
                }`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'}`}></div>
                </div>
              </button>
            ))}
         </div>
      </div>
      
      <div className={`px-6 py-4 border-t text-center ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Scegli la risposta che ti descrive meglio</p>
      </div>
    </div>
  );
};