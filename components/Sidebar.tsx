
import React from 'react';
import { LayoutDashboard, StickyNote, Bell, Sparkles, X, Moon, Sun, LogOut, Target } from 'lucide-react';
import { View, User } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  user: User | null;
  onLogout: () => void;
  onTriggerFocus: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, setActiveView, isOpen, setIsOpen, isDarkMode, toggleTheme, user, onLogout, onTriggerFocus
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'notes', label: 'ملاحظاتي', icon: StickyNote },
    { id: 'reminders', label: 'تنبيهات', icon: Bell },
    { id: 'assistant', label: 'المساعد الذكي', icon: Sparkles },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed top-0 right-0 h-full w-72 z-30 transform transition-transform duration-300 ease-out md:translate-x-0 md:static border-l flex flex-col ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl md:shadow-none'} ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                <span className="text-3xl">✦</span> رفيق
            </h1>
            <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600"><X size={24} /></button>
          </div>

          {user && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 mb-2 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                {user.avatar ? (
                    <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">{user.name.charAt(0)}</div>
                )}
                <div className="overflow-hidden">
                    <h3 className={`font-bold text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{user.name}</h3>
                    <p className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                </div>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id as View); setIsOpen(false); }}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-indigo-50 text-indigo-700 font-bold shadow-sm') : (isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium')}`}
              >
                {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-l-full"></div>}
                <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <button
             onClick={() => { onTriggerFocus(); setIsOpen(false); }}
             className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 text-teal-600 hover:bg-teal-50 font-medium mt-4 border border-dashed border-teal-200`}
          >
             <Target size={20} />
             <span>وضع التركيز</span>
          </button>
        </nav>

        <div className="p-4 mx-4 mb-6 space-y-2">
           <button onClick={toggleTheme} className={`w-full flex items-center justify-between p-3 rounded-2xl transition-colors border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
                <span className="text-sm font-medium flex items-center gap-3">{isDarkMode ? <Moon size={18} /> : <Sun size={18} />}{isDarkMode ? 'الوضع الليلي' : 'الوضع النهاري'}</span>
            </button>
            <button onClick={onLogout} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100`}>
                <LogOut size={18} /><span className="text-sm font-medium">تسجيل الخروج</span>
            </button>
        </div>
      </aside>
    </>
  );
};
