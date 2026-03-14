import { useState, useEffect } from 'react';
import { Droplets, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchWithAuth } from '../../lib/api';

interface DailyCheckInViewProps { darkMode: boolean; }

const MOODS = [
  { id: 'great', label: 'Great', emoji: '😊', color: 'border-emerald-400 bg-emerald-50 text-emerald-600' },
  { id: 'good', label: 'Good', emoji: '🙂', color: 'border-cyan-400 bg-cyan-50 text-cyan-600' },
  { id: 'okay', label: 'Okay', emoji: '😐', color: 'border-amber-400 bg-amber-50 text-amber-600' },
  { id: 'low', label: 'Low', emoji: '😔', color: 'border-orange-400 bg-orange-50 text-orange-600' },
  { id: 'bad', label: 'Bad', emoji: '😰', color: 'border-red-400 bg-red-50 text-red-600' },
];

const GOALS = [
  { label: 'Morning meditation', done: true },
  { label: 'Drink 8 glasses of water', done: true },
  { label: '30-min walk', done: false },
  { label: 'Healthy breakfast', done: true },
  { label: 'Sleep before 10 PM', done: false },
];

export default function DailyCheckInView({ darkMode }: DailyCheckInViewProps) {
  const { user } = useAuth();
  const [mood, setMood] = useState('good');
  const [water, setWater] = useState(5);
  const [goals, setGoals] = useState(GOALS);
  const [energy, setEnergy] = useState(7);
  const [sleep, setSleep] = useState(7);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const today = new Date().toISOString().slice(0, 10);
        const response = await fetchWithAuth(`/daily-checkins/?start_date=${today}&end_date=${today}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const checkin = data[0];
            const moodId =
              checkin.mood >= 9 ? 'great' :
                checkin.mood >= 7 ? 'good' :
                  checkin.mood >= 5 ? 'okay' :
                    checkin.mood >= 3 ? 'low' : 'bad';

            setMood(moodId);
            setWater(checkin.hydration_glasses || 0);
            setEnergy(checkin.energy || 7);
            setSleep(checkin.sleep_hours || 7);
            if (checkin.goals_json && checkin.goals_json.length > 0) {
              // Merge saved done states into the default GOALS list by label
              // This prevents the full goals list from being replaced by a partial saved list
              const savedGoalMap: Record<string, boolean> = {};
              for (const g of checkin.goals_json) {
                if (g.label) savedGoalMap[g.label] = !!g.done;
              }
              setGoals(GOALS.map(g =>
                g.label in savedGoalMap ? { ...g, done: savedGoalMap[g.label] } : g
              ));
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch today\'s check-in', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayData();
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const moodScore =
        mood === 'great' ? 9 :
          mood === 'good' ? 7 :
            mood === 'okay' ? 5 :
              mood === 'low' ? 3 : 1;

      await fetchWithAuth('/daily-checkins/', {
        method: 'POST',
        body: JSON.stringify({
          date: today,
          mood: moodScore,
          stress: 10 - Math.min(Math.max(energy, 0), 10),
          energy,
          sleep_hours: sleep,
          hydration_glasses: water,
          goals_json: goals,
          notes: "",
        }),
      });

      setSubmitted(true);
    } catch (e) {
      console.error('Failed to save daily check-in', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = (i: number) => {
    setGoals(g => g.map((goal, idx) => idx === i ? { ...goal, done: !goal.done } : goal));
  };

  const doneCount = goals.filter(g => g.done).length;
  const progress = Math.round((doneCount / goals.length) * 100);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className={`text-2xl font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Daily Check-In</h2>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Track your mood, hydration and daily progress</p>
      </div>

      {loading && !submitted ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          <p className={`text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading your data...</p>
        </div>
      ) : submitted ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Check-In Complete!</h3>
          <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Great job tracking your wellness today. See you tomorrow!</p>
          <button onClick={() => setSubmitted(false)} className="mt-6 px-6 py-2.5 bg-emerald-500 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-colors">
            Check In Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left */}
          <div className="space-y-5">
            {/* Mood */}
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm`}>
              <h3 className={`font-bold text-sm mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>How are you feeling today?</h3>
              <div className="flex gap-2 flex-wrap">
                {MOODS.map(m => (
                  <button key={m.id} onClick={() => setMood(m.id)}
                    className={`flex flex-col items-center gap-1 py-3 px-4 rounded-2xl border-2 transition-all ${mood === m.id ? m.color + ' scale-105 shadow-md' : darkMode ? 'border-slate-600 hover:border-slate-500' : 'border-slate-100 hover:border-slate-200'
                      }`}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className={`text-xs font-bold ${mood === m.id ? '' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hydration */}
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <Droplets className="text-cyan-500" size={20} />
                <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>Glasses of Water Today</h3>
              </div>
              <div className="flex gap-2 flex-wrap mb-3">
                {Array.from({ length: 8 }, (_, i) => (
                  <button key={i} onClick={() => setWater(i + 1)}
                    className={`w-10 h-10 rounded-2xl border-2 text-lg transition-all ${i < water
                      ? 'border-cyan-400 bg-cyan-50'
                      : darkMode ? 'border-slate-600' : 'border-slate-100'
                      }`}
                  >
                    💧
                  </button>
                ))}
              </div>
              <p className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{water}/8 glasses — {water >= 8 ? '✅ Goal met!' : `${8 - water} more to go`}</p>
            </div>

            {/* Sliders */}
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm space-y-5`}>
              {[
                { label: '⚡ Energy Level', value: energy, setter: setEnergy, color: 'accent-amber-500' },
                { label: '😴 Sleep (hours)', value: sleep, setter: setSleep, max: 12, color: 'accent-indigo-500' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <label className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{s.label}</label>
                    <span className="text-emerald-500">{s.value}{i === 1 ? ' hrs' : '/10'}</span>
                  </div>
                  <input type="range" min={0} max={s.max ?? 10} value={s.value}
                    onChange={e => s.setter(Number(e.target.value))}
                    className={`w-full h-2 rounded-full cursor-pointer ${s.color}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Goals */}
          <div className="space-y-5">
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>Today's Goals</h3>
                <span className="text-xs font-bold text-emerald-500">{doneCount}/{goals.length} done</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-slate-100 rounded-full mb-5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>

              <div className="space-y-3">
                {goals.map((g, i) => (
                  <button key={i} onClick={() => toggleGoal(i)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${g.done
                      ? 'border-emerald-200 bg-emerald-50'
                      : darkMode ? 'border-slate-600 hover:border-slate-500' : 'border-slate-100 hover:border-slate-200'
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${g.done ? 'bg-emerald-500 border-emerald-500' : darkMode ? 'border-slate-500' : 'border-slate-200'}`
                    }>
                      {g.done && <CheckCircle size={14} className="text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${g.done
                      ? 'line-through text-emerald-500'
                      : darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || !user}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-2xl font-black text-sm hover:from-emerald-600 hover:to-cyan-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <CheckCircle size={18} /> {loading ? 'Saving...' : "Complete Today's Check-In"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
