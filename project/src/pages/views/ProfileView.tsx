import { useState, useEffect } from 'react';
import { User, Globe, Moon, Sun, Bell, Camera, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileViewProps { darkMode: boolean; setDarkMode: (v: boolean) => void; }

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
];

export default function ProfileView({ darkMode, setDarkMode }: ProfileViewProps) {
  const { user, profile, signOut } = useAuth();

  const initialName = profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  const [lang, setLang] = useState(profile?.preferred_language || 'en');
  const [name, setName] = useState(initialName);

  // Update name if profile/user loads after mount
  useEffect(() => {
    if (user || profile) {
      setName(profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User');
    }
  }, [user, profile]);

  const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in-up max-w-2xl">
      <div>
        <h2 className={`text-2xl font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Profile & Settings</h2>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manage your personal information and preferences</p>
      </div>

      {/* Avatar */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm`}>
        <div className="flex items-center gap-5">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                {initials}
              </div>
            )}
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center hover:bg-indigo-600 transition-colors">
              <Camera size={12} className="text-white" />
            </button>
          </div>
          <div>
            <p className={`font-black text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>{name}</p>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{displayEmail}</p>
            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">Premium Member</span>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
            <User size={16} className="text-indigo-600" />
          </div>
          <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Personal Information</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Full Name</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              className={`w-full px-4 py-3 rounded-2xl border-2 text-sm font-medium outline-none transition-all ${darkMode
                ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-400'
                : 'bg-slate-50 border-slate-100 text-slate-800 focus:border-indigo-300'
                }`}
            />
          </div>
          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Email</label>
            <input
              value={displayEmail} disabled
              className={`w-full px-4 py-3 rounded-2xl border-2 text-sm font-medium outline-none opacity-60 cursor-not-allowed ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-800'
                }`}
            />
          </div>
        </div>
      </div>

      {/* Language */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Globe size={16} className="text-emerald-600" />
          </div>
          <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Language Preference</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {languages.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)}
              className={`flex items-center gap-2 py-3 px-4 rounded-2xl border-2 font-bold text-sm transition-all ${lang === l.code
                ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                : darkMode ? 'border-slate-600 text-slate-400 hover:border-slate-500' : 'border-slate-100 text-slate-500 hover:border-slate-200'
                }`}
            >
              <span>{l.flag}</span><span>{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm`}>
        <h3 className={`font-bold mb-5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>App Preferences</h3>
        <div className="space-y-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-500" />}
              <div>
                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{darkMode ? 'Dark Mode' : 'Light Mode'}</p>
                <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Toggle theme appearance</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition-all relative ${darkMode ? 'bg-indigo-500' : 'bg-slate-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-all ${darkMode ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={18} className={notifications ? 'text-emerald-500' : (darkMode ? 'text-slate-500' : 'text-slate-400')} />
              <div>
                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Push Notifications</p>
                <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Health reminders and updates</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-all relative ${notifications ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-all ${notifications ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-2xl font-bold text-sm hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-200"
        >
          <Save size={16} /> {saved ? '✅ Saved!' : 'Save Changes'}
        </button>
        <button onClick={signOut}
          className={`px-6 py-3.5 rounded-2xl font-bold text-sm border-2 transition-all ${darkMode ? 'border-red-700 text-red-400 hover:bg-red-900/30' : 'border-red-200 text-red-500 hover:bg-red-50'
            }`}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
