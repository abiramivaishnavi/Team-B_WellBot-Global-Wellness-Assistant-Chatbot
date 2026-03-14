import { useState } from 'react';
import {
  LayoutGrid, Apple, FileText, MessageSquare, Brain, Star, Sparkles, CalendarCheck,
  User, LogOut, Search, Bell, Moon, Sun, ChevronLeft, X, Menu
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import OverviewView from './views/OverviewView';
import NutritionPage from './NutritionPage';
import HealthReportsView from './views/HealthReportsView';
import StressTrackerView from './views/StressTrackerView';
import FeedbackView from './views/FeedbackView';
import RecommendationsView from './views/RecommendationsView';
import DailyCheckInView from './views/DailyCheckInView';
import ProfileView from './views/ProfileView';
import Wellbot from '../components/Wellbot';

type View = 'Overview' | 'Nutrition' | 'Health Reports' | 'Chat' | 'Stress Tracker' | 'Feedback' | 'Recommendations' | 'Daily Check-In' | 'Profile';

const SIDEBAR_ITEMS: { id: View; icon: any; label: string; highlight?: boolean }[] = [
  { id: 'Overview', icon: LayoutGrid, label: 'Overview' },
  { id: 'Nutrition', icon: Apple, label: 'Nutrition' },
  { id: 'Health Reports', icon: FileText, label: 'Health Reports' },
  { id: 'Stress Tracker', icon: Brain, label: 'Stress Tracker' },
  { id: 'Recommendations', icon: Sparkles, label: 'Recommendations' },
  { id: 'Daily Check-In', icon: CalendarCheck, label: 'Daily Check-In' },
  { id: 'Feedback', icon: Star, label: 'Feedback' },
  { id: 'Chat', icon: MessageSquare, label: 'Chat', highlight: true },
  { id: 'Profile', icon: User, label: 'Profile' },
];

const LANGUAGES = [
  { code: 'en', flag: '🇺🇸', label: 'EN' },
  { code: 'hi', flag: '🇮🇳', label: 'HI' },
  { code: 'te', flag: '🇮🇳', label: 'TE' },
];

export default function Dashboard() {
  const { signOut, user, profile } = useAuth();

  const displayName = profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  const [view, setView] = useState<View>('Overview');
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState('en');
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const meals = [
    { time: 'Breakfast', title: 'Oatmeal with berries', cal: 350, items: ['Oats', 'Berries', 'Almond milk'] },
    { time: 'Lunch', title: 'Grilled salmon quinoa bowl', cal: 550, items: ['Salmon', 'Quinoa', 'Spinach'] },
    { time: 'Snack', title: 'Brain Power Mix', cal: 180, items: ['Walnuts', 'Green Tea', 'Dark Chocolate'] },
    { time: 'Dinner', title: 'Chicken stir-fry', cal: 600, items: ['Chicken', 'Bell peppers', 'Broccoli'] },
  ];

  const notifications = [
    { text: 'Stress level elevated — try breathing exercises', time: '5m ago', color: 'text-orange-500' },
    { text: 'You\'ve completed your daily hydration goal! 💧', time: '1h ago', color: 'text-cyan-500' },
    { text: 'New AI recommendation available', time: '2h ago', color: 'text-indigo-500' },
  ];

  const SidebarItem = ({ item }: { item: typeof SIDEBAR_ITEMS[0] }) => {
    const isActive = view === item.id;
    return (
      <button
        onClick={() => { setView(item.id); setMobileOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${isActive
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
          : item.highlight
            ? darkMode ? 'bg-indigo-900/40 text-indigo-300 hover:bg-indigo-900/60' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            : darkMode
              ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
      >
        <item.icon size={18} className={isActive ? 'text-white' : ''} />
        {!collapsed && <span className="text-sm font-semibold truncate">{item.label}</span>}
      </button>
    );
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-9 h-9 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-lg shadow-emerald-500/20 flex-shrink-0">W</div>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>WellBot</span>
            <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded">PRO</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {SIDEBAR_ITEMS.slice(0, 7).map(item => <SidebarItem key={item.id} item={item} />)}
        <div className={`h-px mx-3 my-3 ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
        {SIDEBAR_ITEMS.slice(7).map(item => <SidebarItem key={item.id} item={item} />)}
      </nav>

      {/* Logout */}
      <button
        onClick={signOut}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all mt-2 ${darkMode ? 'text-slate-500 hover:bg-red-900/30 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-500'
          }`}
      >
        <LogOut size={18} />
        {!collapsed && <span className="text-sm font-semibold">Logout</span>}
      </button>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`mt-2 flex items-center gap-2 py-2 px-4 text-xs font-bold uppercase tracking-widest transition-colors ${darkMode ? 'text-slate-600 hover:text-slate-400' : 'text-slate-300 hover:text-slate-500'
          }`}
      >
        <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        {!collapsed && 'Minimize'}
      </button>
    </>
  );

  return (
    <div className={`flex min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-[#F5F7FA] text-slate-800'} transition-colors duration-300`}>

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className={`hidden lg:flex flex-col ${collapsed ? 'w-20' : 'w-64'} ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'} border-r p-5 sticky top-0 h-screen z-40 transition-all duration-300 flex-shrink-0`}>
        <SidebarContent />
      </aside>

      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className={`relative w-72 ${darkMode ? 'bg-slate-950' : 'bg-white'} h-full p-5 flex flex-col shadow-2xl`}>
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100">
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* TOP NAVBAR */}
        <header className={`sticky top-0 z-30 ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'} border-b backdrop-blur-md px-6 py-4 flex items-center gap-4`}>
          {/* Mobile menu */}
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100">
            <Menu size={20} />
          </button>

          {/* Logo (mobile) */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-xs">W</div>
            <span className={`font-black text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>WellBot</span>
          </div>

          {/* Search */}
          <div className={`hidden md:flex items-center gap-3 flex-1 max-w-sm px-4 py-2.5 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <Search size={16} className="text-slate-400 flex-shrink-0" />
            <input
              placeholder={`Search ${view.toLowerCase()}...`}
              className="bg-transparent text-sm font-medium outline-none w-full placeholder-slate-400"
            />
          </div>

          <div className="flex-1" />

          {/* Language selector */}
          <div className={`hidden sm:flex items-center rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className={`px-3 py-2 text-xs font-bold transition-all ${lang === l.code
                  ? 'bg-emerald-500 text-white'
                  : darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-white'
                  }`}
              >
                <span className="mr-1">{l.flag}</span>{l.label}
              </button>
            ))}
          </div>

          {/* Dark mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className={`p-2.5 rounded-2xl border relative transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {notifOpen && (
              <div className={`absolute top-full right-0 mt-2 w-80 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-2xl border shadow-2xl p-4 z-50 animate-fade-in-up`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>Notifications</span>
                  <button onClick={() => setNotifOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                    <X size={14} className="text-slate-400" />
                  </button>
                </div>
                <div className="space-y-2">
                  {notifications.map((n, i) => (
                    <div key={i} className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                      <p className={`text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{n.text}</p>
                      <p className={`text-[10px] mt-1 ${n.color} font-semibold`}>{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-9 h-9 rounded-2xl object-cover hover:shadow-lg transition-shadow cursor-pointer flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow">
              {initials}
            </div>
          )}
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {view === 'Overview' && <OverviewView darkMode={darkMode} />}
          {view === 'Nutrition' && (
            <NutritionPage
              weight={70} height={175}
              meals={meals}
              waterGoal={2500}
              tips={['Drink 250ml water every 2 hrs.', 'Protein-rich breakfast keeps you full.', 'Include leafy greens for iron.', 'Healthy snacks prevent energy crashes.']}
              darkMode={darkMode}
            />
          )}
          {view === 'Health Reports' && <HealthReportsView darkMode={darkMode} />}
          {view === 'Stress Tracker' && <StressTrackerView darkMode={darkMode} />}
          {view === 'Feedback' && <FeedbackView darkMode={darkMode} />}
          {view === 'Recommendations' && <RecommendationsView darkMode={darkMode} />}
          {view === 'Daily Check-In' && <DailyCheckInView darkMode={darkMode} />}
          {view === 'Profile' && <ProfileView darkMode={darkMode} setDarkMode={setDarkMode} />}
          {view === 'Chat' && <Wellbot inline />}
        </main>
      </div>

      {/* Floating WellBot Chat — hidden when Chat view is active */}
      {view !== 'Chat' && <Wellbot />}
    </div>
  );
}