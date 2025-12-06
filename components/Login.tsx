
import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { generateId } from '../utils/dateUtils';
import toast from 'react-hot-toast';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const storedUsers = JSON.parse(localStorage.getItem('users_db') || '[]');
      
      if (isLogin) {
        // Handle Login
        const user = storedUsers.find((u: any) => u.email === formData.email && u.password === formData.password);
        
        if (user) {
          const { password, ...safeUser } = user;
          onLogin(safeUser);
        } else {
          toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
      } else {
        // Handle Sign Up
        if (storedUsers.some((u: any) => u.email === formData.email)) {
          toast.error('البريد الإلكتروني مستخدم بالفعل');
          setLoading(false);
          return;
        }

        const newUser = {
          id: generateId(),
          name: formData.name,
          email: formData.email,
          password: formData.password, // In a real app, never store plain text passwords!
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
        };

        const updatedUsers = [...storedUsers, newUser];
        localStorage.setItem('users_db', JSON.stringify(updatedUsers));
        
        const { password, ...safeUser } = newUser;
        onLogin(safeUser);
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans" dir="rtl">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-600 to-purple-700 rounded-b-[3rem] lg:rounded-b-[5rem] z-0"></div>
      
      <div className="z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Right Side - Info (Hidden on mobile) */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div>
            <div className="flex items-center gap-2 mb-6">
               <span className="text-2xl">✦</span>
               <span className="text-2xl font-bold">رفيق</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              {isLogin ? 'أهلاً بعودتك!' : 'انضم إلينا اليوم'}
            </h2>
            <p className="text-indigo-100 leading-relaxed opacity-90">
              {isLogin 
                ? 'استكمل رحلة تنظيم حياتك وزيادة إنتاجيتك مع رفيق.' 
                : 'أنشئ حساباً جديداً وابدأ في تنظيم مهامك وملاحظاتك بذكاء.'}
            </p>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <Sparkles size={20} className="text-yellow-300" />
                <span className="text-sm font-medium">مساعد ذكي متطور</span>
             </div>
             <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <Lock size={20} className="text-emerald-300" />
                <span className="text-sm font-medium">بياناتك آمنة ومحفوظة</span>
             </div>
          </div>
        </div>

        {/* Left Side - Form */}
        <div className="w-full md:w-7/12 p-8 lg:p-12">
           <div className="text-center md:text-right mb-8">
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
              </h1>
              <p className="text-slate-500 text-sm">
                أدخل بياناتك للمتابعة
              </p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">الاسم الكامل</label>
                  <div className="relative">
                    <UserIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      name="name"
                      type="text" 
                      placeholder="مثال: أحمد محمد"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    name="email"
                    type="email" 
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {!isLogin && (
                   <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      يجب أن تتكون من 6 أحرف على الأقل
                   </p>
                )}
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isLogin ? 'دخول' : 'تسجيل حساب'}</span>
                    <ArrowRight size={18} className="rotate-180" />
                  </>
                )}
              </button>
           </form>

           <div className="mt-8 text-center">
              <p className="text-slate-600 text-sm">
                {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}{' '}
                <button 
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({ name: '', email: '', password: '' });
                  }}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  {isLogin ? 'أنشئ حساباً الآن' : 'سجل دخولك'}
                </button>
              </p>
           </div>
        </div>
      </div>
      
      <div className="mt-8 text-slate-400 text-xs text-center z-10">
        &copy; {new Date().getFullYear()} رفيق - تطبيق تنظيم المهام الذكي
      </div>
    </div>
  );
};
