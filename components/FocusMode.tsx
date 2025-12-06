
import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Reminder } from '../types';

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Reminder[];
  onCompleteTask: (id: string) => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ isOpen, onClose, tasks, onCompleteTask }) => {
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
  const [isActive, setIsActive] = useState(false);
  const [activeTask, setActiveTask] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsActive(false);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const priorityTask = tasks.filter(t => !t.completed && t.priority === 'high')[0] || tasks.filter(t => !t.completed)[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-center animate-fade-in">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <X size={32} />
      </button>

      <div className="text-center max-w-2xl w-full px-4">
        <h2 className="text-indigo-400 font-medium tracking-widest uppercase mb-8">وضع التركيز العميق</h2>
        
        <div className="text-9xl font-bold font-mono mb-12 tabular-nums tracking-tighter">
          {formatTime(timeLeft)}
        </div>

        <div className="mb-12 min-h-[100px]">
          {priorityTask ? (
             <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-slate-400 text-sm mb-2">مهمتك الآن</p>
                <h3 className="text-3xl font-bold">{priorityTask.title}</h3>
                <button 
                   onClick={() => onCompleteTask(priorityTask.id)}
                   className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors border border-emerald-500/30"
                >
                  <CheckCircle2 size={20} />
                  إتمام المهمة
                </button>
             </div>
          ) : (
            <p className="text-2xl text-slate-400">لا توجد مهام عاجلة. استرخِ أو أضف مهمة.</p>
          )}
        </div>

        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-white text-black hover:bg-slate-200'}`}
          >
            {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </button>
          
          <button 
            onClick={() => {
              setIsActive(false);
              setTimeLeft(45 * 60);
            }}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>
        
        <p className="mt-8 text-slate-500 text-sm">
           يتم حجب جميع التنبيهات غير الضرورية أثناء عمل المؤقت
        </p>
      </div>
    </div>
  );
};
