
import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { NotesView } from './components/NotesView';
import { RemindersView } from './components/RemindersView';
import { ChatInterface } from './components/ChatInterface';
import { Login } from './components/Login';
import { FocusMode } from './components/FocusMode';
import { SceneSelector } from './components/SceneSelector';
import { Note, Reminder, ChatMessage, View, User, SceneType } from './types';
import { generateId } from './utils/dateUtils';
import { Toaster, toast } from 'react-hot-toast';
import { assistant } from './services/geminiService';

const App: React.FC = () => {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // --- App State ---
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [currentScene, setCurrentScene] = useState<SceneType>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [dailyBriefing, setDailyBriefing] = useState<string>('');
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Filter content based on Scene
  const filteredNotes = currentScene === 'all' 
    ? notes 
    : notes.filter(n => n.category === currentScene || n.category === 'other' || n.category === 'ideas');

  const filteredReminders = currentScene === 'all'
    ? reminders
    : reminders.filter(r => r.category === currentScene || !r.category);

  // Update Assistant Context
  useEffect(() => {
    if (user) {
        assistant.updateContext(
            user.name, 
            user.aiMemory || { summary: '', preferences: [] }, 
            currentScene,
            notes, // Pass live notes
            reminders // Pass live reminders
        );
    }
  }, [user, currentScene, notes, reminders]);

  // Load Data
  useEffect(() => {
    if (user) {
        const userNotes = localStorage.getItem(`notes_${user.id}`);
        const userReminders = localStorage.getItem(`reminders_${user.id}`);
        const userChat = localStorage.getItem(`chat_${user.id}`);
        const savedBriefing = localStorage.getItem(`briefing_${user.id}_${new Date().toDateString()}`);

        const loadedNotes = userNotes ? JSON.parse(userNotes) : [];
        const loadedReminders = userReminders ? JSON.parse(userReminders) : [];

        setNotes(loadedNotes);
        setReminders(loadedReminders);
        setChatHistory(userChat ? JSON.parse(userChat) : []);
        setDailyBriefing(savedBriefing || '');

        // Generate Briefing if not exists for today and user has data
        if (!savedBriefing && (loadedNotes.length > 0 || loadedReminders.length > 0)) {
            assistant.generateDailyBriefing(loadedNotes, loadedReminders).then(text => {
                setDailyBriefing(text);
                localStorage.setItem(`briefing_${user.id}_${new Date().toDateString()}`, text);
            });
        }
        
        setActiveView('dashboard');
    } else {
        setNotes([]);
        setReminders([]);
        setChatHistory([]);
    }
  }, [user]);

  // Persistence
  useEffect(() => { if (user) localStorage.setItem(`notes_${user.id}`, JSON.stringify(notes)); }, [notes, user]);
  useEffect(() => { if (user) localStorage.setItem(`reminders_${user.id}`, JSON.stringify(reminders)); }, [reminders, user]);
  useEffect(() => { if (user) localStorage.setItem(`chat_${user.id}`, JSON.stringify(chatHistory)); }, [chatHistory, user]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Reminder Logic
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach(r => {
        if (!r.completed) {
          const rTime = new Date(r.time);
          if (now >= rTime && (now.getTime() - rTime.getTime()) < 60000) {
            toast(`تذكير: ${r.title}`, {
              icon: '⏰',
              style: { direction: 'rtl', fontFamily: 'Tajawal', background: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#333' }
            });
          }
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [reminders, isDarkMode, user]);


  // Actions
  const handleLogin = (user: User) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setUser(user);
    toast.success(`مرحباً بك يا ${user.name.split(' ')[0]}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    toast.success('تم تسجيل الخروج');
  };

  const addNote = (noteData: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote: Note = { ...noteData, id: generateId(), createdAt: Date.now(), color: noteData.color || '#ffffff', isPinned: false };
    setNotes(prev => [newNote, ...prev]);
    toast.success('تمت إضافة الملاحظة');
  };

  const updateMemory = (fact: string) => {
    if (!user) return;
    const newMemory = { ...user.aiMemory, preferences: [...(user.aiMemory?.preferences || []), fact], summary: user.aiMemory?.summary || '' };
    const updatedUser = { ...user, aiMemory: newMemory };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    // Also update in users_db if possible, but for local prototype this is fine for session persistence
  };

  const organizeNotes = () => {
     toast.promise(
         new Promise(resolve => setTimeout(resolve, 2000)),
         {
             loading: 'جاري تحليل ملاحظاتك...',
             success: 'تم تنظيم الملاحظات بنجاح!',
             error: 'حدث خطأ'
         }
     );
     // In a real app, this would use the AI response to actually update note categories
  };

  // AI Actions Object
  const aiActions = {
    createNote: addNote,
    createReminder: (data: any) => {
        setReminders(prev => [...prev, { ...data, id: generateId(), completed: false, priority: data.priority || 'medium' }]);
        toast.success('تم ضبط التذكير');
    },
    getNotes: () => filteredNotes,
    getReminders: () => filteredReminders,
    updateMemory: updateMemory,
    organizeNotes: organizeNotes
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <Toaster position="top-center" toastOptions={{ style: { background: isDarkMode ? '#334155' : '#fff', color: isDarkMode ? '#fff' : '#333' } }} />
      
      <FocusMode 
        isOpen={isFocusModeOpen} 
        onClose={() => setIsFocusModeOpen(false)} 
        tasks={filteredReminders}
        onCompleteTask={(id) => setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: true } : r))}
      />

      <Sidebar 
        activeView={activeView} setActiveView={setActiveView} 
        isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}
        isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)}
        user={user} onLogout={handleLogout}
        onTriggerFocus={() => setIsFocusModeOpen(true)}
      />

      <main className="flex-1 transition-all duration-300 ease-out md:mr-72 p-4 md:p-8">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="md:hidden flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold flex items-center gap-2"><span>✦</span> رفيق</h1>
            <button onClick={() => setIsSidebarOpen(true)} className={`p-2 rounded-xl shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-100 text-slate-600'}`}>
              <Menu size={24} />
            </button>
          </div>

          {/* Scene Selector */}
          <SceneSelector currentScene={currentScene} onSelect={setCurrentScene} isDarkMode={isDarkMode} />

          <div className="flex-1 animate-fade-in">
            {activeView === 'dashboard' && (
              <Dashboard 
                notes={filteredNotes} reminders={filteredReminders} dailyBriefing={dailyBriefing}
                onNavigate={setActiveView} onToggleReminder={(id) => setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r))}
                isDarkMode={isDarkMode}
              />
            )}
            
            {activeView === 'notes' && (
              <NotesView 
                notes={filteredNotes} 
                onAdd={addNote} onDelete={(id) => setNotes(prev => prev.filter(n => n.id !== id))}
                onUpdate={(n) => setNotes(prev => prev.map(old => old.id === n.id ? n : old))}
                onOrganize={organizeNotes}
                isDarkMode={isDarkMode}
              />
            )}
            
            {activeView === 'reminders' && (
              <RemindersView 
                reminders={filteredReminders} 
                onAdd={(r) => setReminders(prev => [...prev, { ...r, id: generateId(), completed: false, priority: r.priority || 'medium' }])} 
                onDelete={(id) => setReminders(prev => prev.filter(r => r.id !== id))} 
                onToggle={(id) => setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r))}
                isDarkMode={isDarkMode}
              />
            )}
            
            {activeView === 'assistant' && (
              <ChatInterface 
                chatHistory={chatHistory} setChatHistory={setChatHistory}
                actions={aiActions} isDarkMode={isDarkMode}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
