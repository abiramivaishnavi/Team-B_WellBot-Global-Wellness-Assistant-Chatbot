import React, { useState } from 'react';
import { Sparkles, Coffee, Moon, Dumbbell, BookOpen, Apple, Heart, ChevronRight } from 'lucide-react';

interface RecommendationsViewProps { darkMode: boolean; }

const TIPS = [
  { icon: Coffee, label: 'Morning Ritual', desc: 'Start with warm lemon water and 5 min deep breathing to activate your metabolism.', color: 'bg-amber-100 text-amber-600', tag: 'Daily' },
  { icon: Apple, label: 'Balanced Nutrition', desc: 'Include protein, healthy fats and fibre in every meal to stabilise blood sugar.', color: 'bg-emerald-100 text-emerald-600', tag: 'Nutrition' },
  { icon: Dumbbell, label: 'Micro-Movement', desc: '10-minute brisk walk after each meal improves digestion and energy levels.', color: 'bg-indigo-100 text-indigo-600', tag: 'Exercise' },
  { icon: Moon, label: 'Sleep Hygiene', desc: 'Dim lights 1 hour before bed and maintain 7–9 hrs. Avoid screens after 9 PM.', color: 'bg-purple-100 text-purple-600', tag: 'Sleep' },
  { icon: BookOpen, label: 'Mindful Journaling', desc: 'Write 3 things you are grateful for each morning. It rewires your brain positively.', color: 'bg-pink-100 text-pink-600', tag: 'Mental' },
  { icon: Heart, label: 'Social Connection', desc: 'Spend 30 minutes with loved ones or call a friend. Social bonds reduce cortisol.', color: 'bg-rose-100 text-rose-600', tag: 'Habits' },
];

const PLANS = [
  { label: '5-min Morning Meditat.', emoji: '🧘', days: 5, total: 7 },
  { label: '10K Steps Challenge', emoji: '🚶', days: 3, total: 7 },
  { label: 'Hydration Goals', emoji: '💧', days: 6, total: 7 },
  { label: 'Sleep Consistency', emoji: '😴', days: 4, total: 7 },
];

export default function RecommendationsView({ darkMode }: RecommendationsViewProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className={`text-2xl font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>AI Recommendations</h2>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Personalised tips for your daily wellness routine</p>
      </div>

      {/* AI Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles size={22} />
          <span className="font-black text-lg">Today's AI Health Brief</span>
        </div>
        <p className="text-white/90 text-sm leading-relaxed max-w-2xl">
          Based on your health data, you've been showing elevated stress indicators. I recommend prioritising sleep and hydration today.
          Your wellness score improved by 5% this week — keep it up! 🎉
        </p>
      </div>

      {/* Weekly Challenge Trackers */}
      <div>
        <h3 className={`text-lg font-black mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Weekly Habit Challenges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLANS.map((p, i) => {
            const pct = Math.round((p.days / p.total) * 100);
            return (
              <div key={i} className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-2xl p-5 border shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.emoji}</span>
                    <span className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{p.label}</span>
                  </div>
                  <span className={`text-xs font-bold ${pct >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>{p.days}/{p.total}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${pct >= 70 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className={`text-xs mt-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{pct}% complete this week</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips Grid */}
      <div>
        <h3 className={`text-lg font-black mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Daily Wellness Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TIPS.map((tip, i) => (
            <div
              key={i}
              onClick={() => setExpanded(expanded === i ? null : i)}
              className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tip.color}`}>
                  <tip.icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tip.label}</span>
                    <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">{tip.tag}</span>
                  </div>
                  {expanded === i && (
                    <p className={`text-xs mt-2 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{tip.desc}</p>
                  )}
                  {expanded !== i && (
                    <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Tap to expand <ChevronRight size={10} className="inline" /></p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
