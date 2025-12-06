
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { ChatMessage, Note, Reminder } from '../types';
import { assistant } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  actions: {
    createNote: (n: Omit<Note, 'id' | 'createdAt'>) => void;
    createReminder: (r: Omit<Reminder, 'id' | 'completed'>) => void;
    getNotes: () => Note[];
    getReminders: () => Reminder[];
    updateMemory: (fact: string) => void;
    organizeNotes: (mappings: any) => void;
  };
  isDarkMode: boolean;
}

const SUGGESTIONS = [
    "لخص ملاحظاتي الأخيرة",
    "أضف تذكير لشرب الماء كل ساعتين",
    "ما هي مهامي لليوم؟",
    "اقترح خطة لتنظيم يومي"
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  chatHistory, 
  setChatHistory,
  actions,
  isDarkMode
}) => {
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isThinking]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const responseText = await assistant.sendMessage(userMsg.text, actions);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      
      setChatHistory(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: "عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.",
        timestamp: Date.now(),
        isError: true
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-6rem)] rounded-3xl shadow-xl overflow-hidden border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 flex items-center gap-4 text-white">
        <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
          <Sparkles size={24} />
        </div>
        <div>
          <h3 className="font-bold text-xl">مساعدك الذكي</h3>
          <p className="text-sm text-indigo-100 opacity-90">متاح للمساعدة في التنظيم والإنتاجية</p>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className={`flex-1 overflow-y-auto p-5 space-y-6 ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}
      >
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-sm mb-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <Sparkles size={40} className="text-indigo-500" />
            </div>
            <p className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>مرحباً بك في رفيق!</p>
            <p className={`text-base max-w-sm mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>أنا هنا لمساعدتك. جرب أحد الأوامر التالية:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTIONS.map((s, i) => (
                    <button 
                        key={i}
                        onClick={() => handleSend(s)}
                        className={`p-3 text-sm rounded-xl border transition-all hover:scale-105 active:scale-95 text-right
                            ${isDarkMode 
                                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-indigo-500' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-500 hover:shadow-md'}
                        `}
                    >
                        <span className="mr-2">✨</span> {s}
                    </button>
                ))}
            </div>
          </div>
        )}

        {chatHistory.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
             {msg.role === 'model' && (
               <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 mt-1 shadow-lg shadow-indigo-500/20">
                 <Bot size={20} />
               </div>
             )}
             
             <div className={`
                relative max-w-[85%] px-6 py-4 rounded-2xl leading-relaxed text-sm md:text-base shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tl-none shadow-indigo-500/20' 
                  : (isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-slate-700 border-slate-100') + ' border rounded-tr-none'}
                ${msg.isError ? 'bg-red-50 text-red-600 border-red-100' : ''}
             `}>
               <ReactMarkdown>{msg.text}</ReactMarkdown>
               <span className={`text-[10px] absolute bottom-1 ${msg.role === 'user' ? 'left-4 text-indigo-200' : 'right-4 text-slate-400'}`}>
                 {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
               </span>
             </div>

             {msg.role === 'user' && (
               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-1 ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-500'}`}>
                 <User size={20} />
               </div>
             )}
          </div>
        ))}

        {isThinking && (
          <div className="flex w-full gap-3 justify-start animate-pulse">
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0">
               <Bot size={20} />
             </div>
             <div className={`px-5 py-4 rounded-2xl rounded-tr-none border flex items-center gap-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
               <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="flex gap-3 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اطلب مني إضافة ملاحظة أو تذكير..."
            className={`flex-1 border rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'}`}
            disabled={isThinking}
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isThinking}
            className={`
              p-4 rounded-xl flex items-center justify-center transition-all duration-200 aspect-square
              ${!input.trim() || isThinking
                ? (isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400') + ' cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transform hover:-translate-y-1 active:translate-y-0'}
            `}
          >
            {isThinking ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} className={document.dir === 'rtl' ? 'rotate-180' : ''} />}
          </button>
        </div>
      </div>
    </div>
  );
};