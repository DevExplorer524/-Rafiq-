
import React, { useState } from 'react';
import { Reminder } from '../types';
import { Bell, Trash2, Check, Plus, AlertCircle, AlertTriangle, ArrowDown } from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';

interface RemindersViewProps {
  reminders: Reminder[];
  onAdd: (r: Omit<Reminder, 'id' | 'completed'>) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  isDarkMode: boolean;
}

export const RemindersView: React.FC<RemindersViewProps> = ({ reminders, onAdd, onDelete, onToggle, isDarkMode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReminder, setNewReminder] = useState<{
    title: string;
    date: string;
    time: string;
    priority: 'high' | 'medium' | 'low';
  }>({ 
    title: '', 
    date: '', 
    time: '',
    priority: 'medium'
  });

  const sortedReminders = [...reminders].sort((a, b) => {
      // Sort by completion first, then priority, then time
      if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
      
      const priorityVal = (p?: string) => p === 'high' ? 0 : p === 'medium' ? 1 : 2;
      if (priorityVal(a.priority) !== priorityVal(b.priority)) return priorityVal(a.priority) - priorityVal(b.priority);
      
      return new Date(a.time).getTime() - new Date(b.time).getTime();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.date || !newReminder.time) return;
    
    const isoDateTime = new Date(`${newReminder.date}T${newReminder.time}`).toISOString();
    
    onAdd({
      title: newReminder.title,
      time: isoDateTime,
      priority: newReminder.priority
    });
    
    setNewReminder({ title: '', date: '', time: '', priority: 'medium' });
    setIsModalOpen(false);
  };

  const PriorityIcon = ({ p }: { p?: string }) => {
      if (p === 'high') return <AlertCircle size={16} className="text-red-500" />;
      if (p === 'low') return <ArrowDown size={16} className="text-blue-500" />;
      return <AlertTriangle size={16} className="text-orange-500" />;
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>التنبيهات</h2>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>لا تنسى مواعيدك المهمة</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-transform active:scale-95"
        >
          <Plus size={20} />
          تنبيه جديد
        </button>
      </div>

      <div className="space-y-3">
        {sortedReminders.map(reminder => (
          <div 
            key={reminder.id} 
            className={`
              flex items-center justify-between p-4 rounded-2xl border transition-all group
              ${isDarkMode 
                 ? (reminder.completed ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-800 border-slate-700 hover:border-purple-500/50') 
                 : (reminder.completed ? 'bg-slate-50 border-slate-100 opacity-70' : 'bg-white border-slate-100 shadow-sm hover:border-purple-200 hover:shadow-md')}
            `}
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onToggle(reminder.id)}
                className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                  ${reminder.completed 
                    ? 'bg-purple-500 border-purple-500 text-white' 
                    : (isDarkMode ? 'border-slate-500 hover:border-purple-400' : 'border-slate-300 hover:border-purple-500')}
                `}
              >
                <Check size={14} className={reminder.completed ? 'opacity-100' : 'opacity-0'} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-lg ${reminder.completed ? 'line-through text-slate-500' : (isDarkMode ? 'text-slate-200' : 'text-slate-800')}`}>
                    {reminder.title}
                    </h3>
                    {!reminder.completed && <PriorityIcon p={reminder.priority} />}
                </div>
                
                <div className={`flex items-center gap-1.5 text-sm mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Bell size={14} className={reminder.completed ? '' : 'text-purple-500'} />
                  <span dir="ltr">{formatDateTime(reminder.time)}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => onDelete(reminder.id)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {reminders.length === 0 && (
          <div className={`text-center py-16 rounded-3xl border border-dashed ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            لا توجد تنبيهات حالياً
          </div>
        )}
      </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl w-full max-w-md p-8 shadow-2xl animate-fade-in-up ${isDarkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white'}`}>
            <h3 className="text-xl font-bold mb-6">إضافة تنبيه جديد</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 opacity-80">العنوان</label>
                <input 
                  required
                  type="text" 
                  value={newReminder.title}
                  onChange={e => setNewReminder({...newReminder, title: e.target.value})}
                  className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'border-slate-300'}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 opacity-80">الأهمية</label>
                <div className="flex gap-2">
                    {['low', 'medium', 'high'].map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setNewReminder({...newReminder, priority: p as any})}
                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                                ${newReminder.priority === p 
                                    ? (p === 'high' ? 'bg-red-100 border-red-500 text-red-700' : p === 'medium' ? 'bg-orange-100 border-orange-500 text-orange-700' : 'bg-blue-100 border-blue-500 text-blue-700')
                                    : (isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50')}
                            `}
                        >
                            {p === 'high' ? 'عالي' : p === 'medium' ? 'متوسط' : 'عادي'}
                        </button>
                    ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1.5 opacity-80">التاريخ</label>
                   <input 
                    required
                    type="date" 
                    value={newReminder.date}
                    onChange={e => setNewReminder({...newReminder, date: e.target.value})}
                    className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-purple-500/50 outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'border-slate-300'}`}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1.5 opacity-80">الوقت</label>
                   <input 
                    required
                    type="time" 
                    value={newReminder.time}
                    onChange={e => setNewReminder({...newReminder, time: e.target.value})}
                    className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-purple-500/50 outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'border-slate-300'}`}
                   />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className={`flex-1 px-4 py-3 border rounded-xl font-medium transition-colors ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-500/30"
                >
                  حفظ التنبيه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
