
import React from 'react';
import { Note, Reminder } from '../types';
import { Clock, CheckCircle2, ArrowRight, Star, Calendar, Zap, Layout, BrainCircuit } from 'lucide-react';
import { formatDate, formatTime } from '../utils/dateUtils';

interface DashboardProps {
  notes: Note[];
  reminders: Reminder[];
  dailyBriefing: string;
  onNavigate: (view: 'notes' | 'reminders') => void;
  onToggleReminder: (id: string) => void;
  isDarkMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ notes, reminders, dailyBriefing, onNavigate, onToggleReminder, isDarkMode }) => {
  const upcomingReminders = [...reminders]
    .filter(r => !r.completed)
    .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2, undefined: 3 };
        const pA = priorityOrder[a.priority || 'undefined'] || 3;
        const pB = priorityOrder[b.priority || 'undefined'] || 3;
        if (pA !== pB) return pA - pB;
        return new Date(a.time).getTime() - new Date(b.time).getTime();
    })
    .slice(0, 4);

  const pinnedNotes = notes.filter(n => n.isPinned);
  const displayNotes = pinnedNotes.length > 0 ? pinnedNotes : notes.slice(0, 6);

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'صباح الخير' : today.getHours() < 18 ? 'مساء الخير' : 'طاب مساؤك';
  
  const completedToday = reminders.filter(r => r.completed && new Date(r.time).getDate() === today.getDate()).length;
  const totalToday = reminders.filter(r => new Date(r.time).getDate() === today.getDate()).length;
  const progressPercentage = totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100);

  const getPriorityColor = (priority?: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-600 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'low': return 'bg-blue-100 text-blue-600 border-blue-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header & Stats */}
      <header className={`p-8 rounded-3xl relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-r from-indigo-900 to-purple-900' : 'bg-gradient-to-r from-indigo-600 to-purple-600'} text-white shadow-2xl shadow-indigo-500/20`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-bold mb-2 flex items-center gap-2">
              {greeting} <span className="animate-wave">👋</span>
            </h2>
            <p className="text-indigo-100 text-lg opacity-90 flex items-center gap-2">
              <Calendar size={18} />
              {formatDate(Date.now())}
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
             <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/20" />
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white transition-all duration-1000 ease-out" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * progressPercentage) / 100} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
                  {progressPercentage}%
                </div>
             </div>
             <div>
               <p className="text-sm text-indigo-100">إنجاز اليوم</p>
               <p className="font-bold text-xl">{completedToday} / {totalToday}</p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      </header>

      {/* Daily Briefing (AI) */}
      {dailyBriefing && (
        <div className={`p-6 rounded-2xl border-l-4 border-indigo-500 flex gap-4 ${isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
            <div className={`p-3 rounded-full h-fit ${isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                <BrainCircuit size={24} />
            </div>
            <div>
                <h3 className="font-bold text-lg mb-1">الموجز اليومي</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {dailyBriefing}
                </p>
            </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Reminders */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`font-bold text-xl flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <Clock size={22} className="text-indigo-500" />
              مهام قادمة
            </h3>
            <button onClick={() => onNavigate('reminders')} className="text-sm text-indigo-500 hover:text-indigo-600 font-medium">عرض الكل</button>
          </div>

          <div className="space-y-3">
            {upcomingReminders.length > 0 ? (
              upcomingReminders.map(reminder => (
                <div key={reminder.id} className={`p-4 rounded-2xl border transition-all group ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 hover:shadow-md'}`}>
                  <div className="flex items-center gap-4">
                      <button onClick={() => onToggleReminder(reminder.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isDarkMode ? 'border-slate-500' : 'border-slate-300'}`}>
                         <div className="w-0 h-0 bg-indigo-500 rounded-full group-active:w-3 group-active:h-3 transition-all" />
                      </button>
                      <div>
                        <h4 className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{reminder.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-500" dir="ltr">{formatTime(reminder.time)}</span>
                          {reminder.priority && (
                             <span className={`text-[10px] px-2 rounded-full ${getPriorityColor(reminder.priority)}`}>{reminder.priority}</span>
                          )}
                        </div>
                      </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`rounded-2xl p-8 text-center border border-dashed ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} text-slate-400`}>
                لا مهام حالياً
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual Memory Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`font-bold text-xl flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <Layout size={22} className="text-purple-500" />
              بطاقات الذاكرة
            </h3>
            <button onClick={() => onNavigate('notes')} className="text-sm text-purple-500 hover:text-purple-600 font-medium">كل الملاحظات</button>
          </div>

          <div className="columns-1 sm:columns-2 gap-4 space-y-4">
            {displayNotes.length > 0 ? (
              displayNotes.map(note => (
                <div 
                  key={note.id} 
                  className={`break-inside-avoid p-5 rounded-2xl border transition-all hover:scale-[1.02] shadow-sm relative overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
                  style={{ backgroundColor: !isDarkMode ? note.color : undefined }}
                >
                  {note.isPinned && <Star size={16} className="absolute left-4 top-4 text-yellow-500 fill-yellow-500" />}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold mb-2 inline-block bg-black/5 text-black/70`}>
                     {note.category}
                  </span>
                  <h4 className={`font-bold text-lg mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{note.title}</h4>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{note.content}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-slate-400">ابدأ بتثبيت الملاحظات لتظهر هنا كبطاقات بصرية.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
