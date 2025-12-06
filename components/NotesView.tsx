
import React, { useState } from 'react';
import { Note } from '../types';
import { Plus, Trash2, Search, Pin, PinOff, Palette, Wand2 } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import toast from 'react-hot-toast';

interface NotesViewProps {
  notes: Note[];
  onAdd: (n: Omit<Note, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (note: Note) => void;
  onOrganize: () => void;
  isDarkMode: boolean;
}

const PASTEL_COLORS = ['#ffffff', '#fef2f2', '#fff7ed', '#fefce8', '#f0fdf4', '#eff6ff', '#faf5ff', '#fdf4ff'];

export const NotesView: React.FC<NotesViewProps> = ({ notes, onAdd, onDelete, onUpdate, onOrganize, isDarkMode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newNote, setNewNote] = useState<{
    title: string;
    content: string;
    category: Note['category'];
    color: string;
    isPinned: boolean;
  }>({ 
    title: '', content: '', category: 'personal', color: '#ffffff', isPinned: false
  });

  const filteredNotes = notes
    .filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (Number(b.isPinned) - Number(a.isPinned)) || (b.createdAt - a.createdAt));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newNote);
    setNewNote({ title: '', content: '', category: 'personal', color: '#ffffff', isPinned: false });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 h-full flex flex-col pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>ملاحظاتي</h2>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>ذاكرتك الثانية، منظمة وذكية.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={onOrganize}
                className={`px-4 py-3 rounded-xl font-medium border flex items-center gap-2 transition-colors ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                title="تنظيف ذكي (AI)"
            >
                <Wand2 size={18} />
                <span className="hidden sm:inline">ترتيب</span>
            </button>
            <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-2 active:scale-95 transition-transform"
            >
            <Plus size={20} />
            جديد
            </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="ابحث في أفكارك..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full rounded-xl py-3.5 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 overflow-y-auto">
        {filteredNotes.map(note => (
          <div 
            key={note.id} 
            className={`group rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 relative flex flex-col border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'border-slate-100 text-slate-800'}`}
            style={{ backgroundColor: !isDarkMode ? note.color : undefined }}
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold bg-black/5`}>
                {note.category}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onUpdate({ ...note, isPinned: !note.isPinned })} className={`p-1.5 rounded-full ${note.isPinned ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {note.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                </button>
                <button onClick={() => onDelete(note.id)} className="p-1.5 rounded-full text-slate-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {note.isPinned && <Pin size={16} className="absolute left-5 top-5 text-indigo-500 fill-indigo-500 rotate-45" />}
            <h3 className="font-bold text-lg mb-2">{note.title}</h3>
            <p className="text-sm whitespace-pre-line leading-relaxed mb-4 flex-1 opacity-80">{note.content}</p>
            <div className="text-xs border-t pt-3 opacity-50 flex justify-between border-black/10">
               <span>{formatDate(note.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-fade-in-up ${isDarkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white'}`}>
            <h3 className="text-2xl font-bold mb-6">فكرة جديدة</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 opacity-80">العنوان</label>
                <input required type="text" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/50 outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'border-slate-300'}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80">التصنيف</label>
                    <select value={newNote.category} onChange={e => setNewNote({...newNote, category: e.target.value as any})} className={`w-full border rounded-xl p-3 outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}>
                        <option value="personal">شخصي</option>
                        <option value="work">عمل</option>
                        <option value="study">دراسة</option>
                        <option value="ideas">أفكار</option>
                        <option value="other">عام</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80">لون</label>
                    <div className="flex gap-2 items-center h-[46px] overflow-x-auto">
                        {PASTEL_COLORS.slice(0, 5).map(c => (
                            <button key={c} type="button" onClick={() => setNewNote({...newNote, color: c})} className={`w-6 h-6 rounded-full border border-slate-200 transition-transform ${newNote.color === c ? 'scale-125 ring-2 ring-indigo-500' : ''}`} style={{ backgroundColor: c }} />
                        ))}
                    </div>
                 </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 opacity-80">المحتوى</label>
                <textarea required rows={5} value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'border-slate-300'}`} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className={`flex-1 px-4 py-3 border rounded-xl font-medium ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'}`}>إلغاء</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
