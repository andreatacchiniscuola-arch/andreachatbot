import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, User, Loader2, FileText, X, Volume2, VolumeX, StopCircle, Trash2, Menu, Sparkles, MapPin, Beaker, GraduationCap, Sun, Moon, ArrowRight } from 'lucide-react';
import { Chat } from "@google/genai";
import { createSchoolChat, generateSpeech } from '../services/geminiService';
import { Message, Role } from '../types';

// Helper to read file as base64
const readFileBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Audio helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface ChatInterfaceProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  externalMessage?: string | null;
  onExternalMessageHandled?: () => void;
  onToggleSidebar?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ isDarkMode, toggleTheme, externalMessage, onExternalMessageHandled, onToggleSidebar }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      text: "Ciao! 👋 Sono il tuo assistente virtuale per l'ISIS G.D. Romagnosi. \n\nPosso aiutarti a scoprire i nostri indirizzi, i laboratori e le attività extrascolastiche. Di cosa vuoi parlare?",
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [chatInstance, setChatInstance] = useState<Chat | null>(null);
  
  // Context file state
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  // Audio state
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCache = useRef<Map<string, AudioBuffer>>(new Map());
  const isAutoPlayRef = useRef(isAutoPlay);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const AVATAR_URL = "https://20.gdromagnosi.it/img/xtra/logo.png";

  // Quick Action Cards Data
  const quickActions = [
    { icon: <GraduationCap size={28} />, text: "Indirizzi", prompt: "Quali indirizzi di studio ci sono?", color: "blue" },
    { icon: <Beaker size={28} />, text: "Laboratori", prompt: "Come sono i laboratori della scuola?", color: "purple" },
    { icon: <MapPin size={28} />, text: "Sedi", prompt: "Dove si trovano le sedi della scuola?", color: "emerald" },
    { icon: <Sparkles size={28} />, text: "Progetti", prompt: "Quali progetti extrascolastici fate?", color: "amber" },
  ];

  // Sync ref
  useEffect(() => {
    isAutoPlayRef.current = isAutoPlay;
  }, [isAutoPlay]);

  // Initialize chat
  useEffect(() => {
    const chat = createSchoolChat();
    setChatInstance(chat);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Handle external messages (FAQ clicks)
  useEffect(() => {
    if (externalMessage && !isThinking && chatInstance) {
        handleSendMessage(undefined, externalMessage);
        if (onExternalMessageHandled) {
            onExternalMessageHandled();
        }
    }
  }, [externalMessage, isThinking, chatInstance]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setAttachedFile(file);
      } else {
        alert("Per favore seleziona un file PDF.");
      }
    }
  };

  const clearFile = () => {
    setAttachedFile(null);
  };

  const handlePlayAudio = async (messageId: string, text: string) => {
    // If clicking the currently playing message, stop it
    if (playingMessageId === messageId) {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
      }
      setPlayingMessageId(null);
      return;
    }

    // Stop any other playing message
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      setPlayingMessageId(null);
    }

    try {
      setLoadingAudioId(messageId);

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Check cache first
      let buffer = audioCache.current.get(messageId);

      if (!buffer) {
          const base64Audio = await generateSpeech(text);
          let audioBytes = decode(base64Audio);
          
          // Safety: Int16Array requires even byte length
          if (audioBytes.length % 2 !== 0) {
            audioBytes = audioBytes.subarray(0, audioBytes.length - 1);
          }

          buffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
          audioCache.current.set(messageId, buffer);
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        setPlayingMessageId(null);
        audioSourceRef.current = null;
      };

      audioSourceRef.current = source;
      source.start();
      setPlayingMessageId(messageId);

    } catch (err) {
      console.error("Error playing audio:", err);
    } finally {
      setLoadingAudioId(null);
    }
  };

  const handleClearChat = () => {
    setMessages([{
      id: 'welcome',
      role: Role.MODEL,
      text: "Chat resettata! 👋 \nCome posso aiutarti ora?",
      timestamp: Date.now()
    }]);
    audioCache.current.clear();
    setChatInstance(createSchoolChat());
  };

  const handleSendMessage = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();
    
    const textToSend = overrideText || inputValue.trim();

    if ((!textToSend && !attachedFile) || !chatInstance || isThinking) return;

    const tempFile = attachedFile;
    
    if (!overrideText) {
        setInputValue('');
    }
    setAttachedFile(null);

    const newMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: textToSend || (tempFile ? `Inviato file: ${tempFile.name}` : ''),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);
    setIsThinking(true);

    try {
      let responseText = "";
      
      if (tempFile) {
        const base64 = await readFileBase64(tempFile);
        const result = await chatInstance.sendMessageStream({
          message: [
            { inlineData: { mimeType: 'application/pdf', data: base64 } },
            { text: textToSend || "Ecco un documento aggiuntivo. Usalo per rispondere." }
          ]
        });
        
        for await (const chunk of result) {
            const text = chunk.text;
            if (text) {
                responseText += text;
                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last.role === Role.MODEL && last.id === 'temp-response') {
                         return [...prev.slice(0, -1), { ...last, text: responseText }];
                    } else {
                         return [...prev, { id: 'temp-response', role: Role.MODEL, text: responseText, timestamp: Date.now() }];
                    }
                });
            }
        }
      } else {
        const result = await chatInstance.sendMessageStream({ message: textToSend });
        for await (const chunk of result) {
            const text = chunk.text;
             if (text) {
                responseText += text;
                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last.role === Role.MODEL && last.id === 'temp-response') {
                         return [...prev.slice(0, -1), { ...last, text: responseText }];
                    } else {
                         return [...prev, { id: 'temp-response', role: Role.MODEL, text: responseText, timestamp: Date.now() }];
                    }
                });
            }
        }
      }
      
      // Finalize the message ID
      setMessages(prev => {
         const last = prev[prev.length - 1];
         if (last.role === Role.MODEL && last.id === 'temp-response') {
             const finalMsg = { ...last, id: Date.now().toString() };
             
             // Auto-play check
             if (isAutoPlayRef.current) {
                 setTimeout(() => handlePlayAudio(finalMsg.id, finalMsg.text), 100);
             }
             
             return [...prev.slice(0, -1), finalMsg];
         }
         return prev;
      });

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: Role.MODEL,
        text: "Mi dispiace, si è verificato un errore. Riprova più tardi.",
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  // UI Components for Messages
  const renderUserMessage = (msg: Message) => (
    <div key={msg.id} className="flex justify-end mb-6 animate-message group">
        <div className="max-w-[85%] relative">
             <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-md border border-indigo-500/20">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.text}</p>
             </div>
             <p className={`text-[10px] text-right mt-1.5 mr-1 font-medium opacity-60 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Tu
             </p>
        </div>
    </div>
  );

  const renderModelMessage = (msg: Message) => (
    <div key={msg.id} className="flex items-start gap-3 mb-6 animate-message group">
        {/* Avatar */}
        <div className="shrink-0 mt-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center p-0.5 shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
               <img src={AVATAR_URL} alt="Bot" className="w-full h-full object-contain rounded-full" />
            </div>
        </div>

        {/* Bubble */}
        <div className="max-w-[85%]">
            <div className={`rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm border ${
                isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-slate-100 shadow-black/20' 
                : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
            }`}>
               <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.text}</div>
               
               {/* Audio Controls embedded in bubble */}
               {!isThinking && !msg.isError && (
                 <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700/50 flex items-center gap-2">
                    <button 
                        onClick={() => handlePlayAudio(msg.id, msg.text)}
                        className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                            playingMessageId === msg.id 
                               ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300' 
                               : (isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-50 text-slate-500')
                        }`}
                        disabled={loadingAudioId === msg.id}
                    >
                        {loadingAudioId === msg.id ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : playingMessageId === msg.id ? (
                            <StopCircle size={14} />
                        ) : (
                            <Volume2 size={14} />
                        )}
                        {playingMessageId === msg.id ? 'Stop' : 'Ascolta'}
                    </button>
                 </div>
               )}
            </div>
            <p className={`text-[10px] ml-1 mt-1.5 font-medium opacity-60 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
               Assistente
            </p>
        </div>
    </div>
  );

  return (
    <div className={`flex flex-col h-full relative font-sans ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        
        {/* Top Actions */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
             <button 
                onClick={handleClearChat}
                className={`p-2 rounded-full border shadow-sm backdrop-blur-sm transition-all hover:text-red-500 ${
                    isDarkMode 
                    ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-700' 
                    : 'bg-white/80 border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
                title="Cancella Chat"
             >
                <Trash2 size={16} />
             </button>
             <button 
                onClick={onToggleSidebar}
                className={`md:hidden p-2 rounded-full border shadow-sm backdrop-blur-sm transition-all ${
                    isDarkMode 
                    ? 'bg-slate-800/80 border-slate-700 text-slate-400' 
                    : 'bg-white/80 border-slate-200 text-slate-500'
                }`}
             >
                <Menu size={16} />
             </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 pt-16 pb-4 custom-scrollbar">
            <div className="max-w-3xl mx-auto">
                {messages.map((msg) => (
                    msg.role === Role.USER ? renderUserMessage(msg) : renderModelMessage(msg)
                ))}

                {/* Thinking Indicator */}
                {isThinking && (
                   <div className="flex items-start gap-3 mb-6 animate-pulse">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                         <img src={AVATAR_URL} alt="Bot" className="w-5 h-5 opacity-50" />
                      </div>
                      <div className={`px-4 py-3 rounded-2xl rounded-tl-sm border ${
                          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                      }`}>
                         <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                         </div>
                      </div>
                   </div>
                )}

                {/* Quick Actions (Show if only welcome message exists) */}
                {messages.length === 1 && !isThinking && (
                    <div className="mt-8 animate-message [animation-delay:0.2s]">
                        <p className={`text-xs font-bold uppercase tracking-wider mb-4 text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            Suggerimenti rapidi
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendMessage(undefined, action.prompt)}
                                    className={`group relative p-5 rounded-2xl border-2 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between h-full min-h-[160px] ${
                                        isDarkMode 
                                        ? 'bg-slate-800 border-slate-700 hover:border-slate-500 shadow-black/20' 
                                        : 'bg-white border-slate-200 shadow-slate-200/50 hover:border-indigo-200'
                                    }`}
                                >
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                                        isDarkMode ? `bg-${action.color}-900/30 text-${action.color}-400` : `bg-${action.color}-50 text-${action.color}-600`
                                    }`}>
                                        {action.icon}
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`block text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {action.text}
                                            </span>
                                            <ArrowRight size={20} className={`opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                                        </div>
                                        <span className={`block text-sm font-medium leading-snug ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {action.prompt}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>
        </div>

        {/* Input Area - Solid Footer */}
        <div className={`p-4 z-10 border-t transition-colors duration-300 ${
            isDarkMode 
            ? 'bg-slate-900 border-slate-800' 
            : 'bg-white border-slate-200'
        }`}>
             <div className="max-w-3xl mx-auto relative">
                
                {/* File Attachment Preview */}
                {attachedFile && (
                    <div className="mb-3 animate-message">
                        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl shadow-lg border backdrop-blur-md ${
                            isDarkMode 
                            ? 'bg-slate-800/90 border-slate-600 text-slate-200' 
                            : 'bg-white/90 border-indigo-100 text-indigo-900'
                        }`}>
                            <div className="bg-red-100 p-1.5 rounded-lg text-red-500">
                                <FileText size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold truncate max-w-[150px]">{attachedFile.name}</span>
                                <span className="text-[10px] opacity-70">PDF Pronto per l'analisi</span>
                            </div>
                            <button onClick={clearFile} className="hover:bg-black/5 p-1 rounded-full transition-colors ml-1">
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Input Bar */}
                <form 
                    onSubmit={handleSendMessage} 
                    className={`flex items-center gap-2 p-2 pl-4 rounded-2xl border transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/30 ${
                        isDarkMode 
                        ? 'bg-slate-800 border-slate-700' 
                        : 'bg-slate-100 border-slate-200'
                    }`}
                >
                    <button
                        type="button"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className={`p-2 rounded-xl transition-colors shrink-0 ${
                            isDarkMode 
                            ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200' 
                            : 'text-slate-500 hover:bg-white hover:text-indigo-600'
                        }`}
                        title="Allega PDF"
                    >
                        <Paperclip size={20} />
                    </button>
                    <input 
                        id="file-upload" 
                        type="file" 
                        accept="application/pdf" 
                        className="hidden" 
                        onChange={handleFileSelect}
                    />

                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Chiedi qualcosa..."
                        className={`flex-1 bg-transparent border-none outline-none text-sm px-2 h-10 ${
                            isDarkMode ? 'text-white placeholder:text-slate-500' : 'text-slate-800 placeholder:text-slate-400'
                        }`}
                        disabled={isThinking}
                    />

                    <button
                        type="submit"
                        disabled={(!inputValue.trim() && !attachedFile) || isThinking}
                        className={`p-3 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:scale-95 ${
                            (!inputValue.trim() && !attachedFile) 
                            ? (isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400')
                            : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95'
                        }`}
                    >
                        {isThinking ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </form>
                
                <div className="mt-3 flex justify-center items-center gap-4">
                    <button 
                        onClick={() => setIsAutoPlay(!isAutoPlay)}
                        className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors ${
                            isAutoPlay 
                            ? 'text-indigo-500' 
                            : (isDarkMode ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600')
                        }`}
                    >
                        {isAutoPlay ? <Volume2 size={12} /> : <VolumeX size={12} />}
                        {isAutoPlay ? 'Auto-lettura ON' : 'Auto-lettura OFF'}
                    </button>
                </div>

             </div>
        </div>

    </div>
  );
};