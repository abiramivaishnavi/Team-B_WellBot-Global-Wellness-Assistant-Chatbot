import { useState, useEffect } from 'react';
import { Users, Activity, Droplets, Smile, MessageSquare, Brain, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchWithAuth } from '../../lib/api';

interface OverviewViewProps { darkMode: boolean; }

function StatCard({ icon: Icon, label, value, sub, color, darkMode }: any) {
  return (
    <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 animate-fade-in-up`}>
      <div className="mb-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <p className={`text-3xl font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{value}</p>
      <p className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      {sub && <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>}
    </div>
  );
}

function MoodBar({ mood, pct, color }: any) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold">
        <span>{mood}</span><span>{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function OverviewView({ darkMode }: OverviewViewProps) {
  const { user } = useAuth();

  // Global Stats
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [globalFeedback, setGlobalFeedback] = useState<string | null>(null);

  // Individual Stats
  const [wellnessScore, setWellnessScore] = useState<number | null>(null);
  const [avgHydration, setAvgHydration] = useState<number | null>(null);
  const [moodIndex, setMoodIndex] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState<string | null>(null);

  // Dynamic Charts Data
  const [weeklyWellness, setWeeklyWellness] = useState<{ day: string, score: number }[]>([]);
  const [moodDistribution, setMoodDistribution] = useState<{ mood: string, pct: number, color: string }[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);

  // Dynamic date — uses today's actual date
  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      // 1. Fetch Global Total Users via backend
      try {
        const countRes = await fetchWithAuth('/profiles/count');
        const countData = await countRes.json();
        setTotalUsers(countData.count ?? 0);
      } catch (e) {
        console.error('user count error:', e);
        setTotalUsers(0);
      }

      // 2. Fetch Global Feedback via backend
      try {
        const feedbackRes = await fetchWithAuth('/feedback/stats');
        const feedbackData = await feedbackRes.json();
        if (feedbackData && feedbackData.average_rating > 0) {
          setGlobalFeedback(`${Math.round((feedbackData.average_rating / 5) * 100)}%`);
        } else {
          setGlobalFeedback('No Data');
        }
      } catch (e) {
        setGlobalFeedback('No Data');
      }

      // 3. Fetch Individual Daily Check-ins (Mood, Hydration, Wellness Score, Charts)
      try {
        const response = await fetchWithAuth('/daily-checkins/');
        const checkins = await response.json();

        if (Array.isArray(checkins) && checkins.length > 0) {
          // Sort checkins by date to ensure chronological order
          const sortedCheckins = [...checkins].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          const recentCheckins = sortedCheckins.slice(-7);

          // Basic Stats
          const avgMood = recentCheckins.reduce((acc: number, curr: any) => acc + curr.mood, 0) / recentCheckins.length;
          const avgEnergy = recentCheckins.reduce((acc: number, curr: any) => acc + curr.energy, 0) / recentCheckins.length;

          setMoodIndex(Math.round(avgMood * 10) / 10);
          setWellnessScore(Math.round(((avgMood + avgEnergy) / 20) * 100));

          let totalHydration = 0;
          let hydrationDays = 0;
          for (const c of recentCheckins) {
            if (c.notes && c.notes.includes('Water:')) {
              const match = c.notes.match(/Water: (\d+)/);
              if (match) {
                totalHydration += parseInt(match[1], 10) * 250;
                hydrationDays++;
              }
            }
          }
          if (hydrationDays > 0) setAvgHydration(Math.round(totalHydration / hydrationDays));

          // 3a. Weekly Wellness Chart (Last 7 Days)
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const last7DaysData = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = [
              d.getFullYear(),
              String(d.getMonth() + 1).padStart(2, '0'),
              String(d.getDate()).padStart(2, '0')
            ].join('-');
            const dayName = days[d.getDay()];

            // Ensure we strictly compare the YYYY-MM-DD part
            const dayData = checkins.find((c: any) => c.date && c.date.split('T')[0] === dateStr);
            last7DaysData.push({
              day: dayName,
              score: dayData ? Math.round(((dayData.mood + dayData.energy) / 20) * 100) : 0
            });
          }
          setWeeklyWellness(last7DaysData);

          // 3b. Mood Distribution
          const moodCounts = { happy: 0, neutral: 0, stressed: 0, anxious: 0 };
          recentCheckins.forEach((c: any) => {
            if (c.mood >= 8) moodCounts.happy++;
            else if (c.mood >= 5) moodCounts.neutral++;
            else if (c.mood >= 3) moodCounts.stressed++;
            else moodCounts.anxious++;
          });
          const totalLogged = recentCheckins.length;
          setMoodDistribution([
            { mood: '😊 Happy', pct: Math.round((moodCounts.happy / totalLogged) * 100), color: 'bg-emerald-400' },
            { mood: '😐 Neutral', pct: Math.round((moodCounts.neutral / totalLogged) * 100), color: 'bg-amber-400' },
            { mood: '😔 Stressed', pct: Math.round((moodCounts.stressed / totalLogged) * 100), color: 'bg-orange-400' },
            { mood: '😰 Anxious', pct: Math.round((moodCounts.anxious / totalLogged) * 100), color: 'bg-red-400' },
          ]);
        }
      } catch (e) { console.error('checkins error:', e); }

      // 4. Fetch Individual Stress Level
      try {
        const response = await fetchWithAuth('/stress-logs/');
        const stressLogs = await response.json();
        if (Array.isArray(stressLogs) && stressLogs.length > 0) {
          const avgStress = stressLogs.slice(-3).reduce((acc: number, curr: any) => acc + curr.stress, 0) / Math.min(stressLogs.length, 3);
          if (avgStress <= 3) setStressLevel('Low');
          else if (avgStress <= 7) setStressLevel('Moderate');
          else setStressLevel('High');
        } else { setStressLevel('No Data'); }
      } catch (e) { setStressLevel('No Data'); }

      // 5. Fetch AI Recommendations (Insights)
      // Hardcoded for now to prevent free-tier quota issues
      setAiInsights([
        'Stay hydrated to keep your energy levels steady throughout the day.',
        'Taking short breaks every hour can significantly reduce stress.',
        'A consistent sleep schedule improves both mood and cognitive function.'
      ]);
    }

    fetchDashboardData();
  }, [user]);

  const stats = [
    { icon: Users, label: 'Total Users', value: totalUsers !== null ? totalUsers.toLocaleString() : '...', sub: 'Registered members', color: 'bg-indigo-500' },
    { icon: Activity, label: 'Wellness Score', value: wellnessScore !== null ? `${wellnessScore}/100` : 'N/A', sub: 'Based on your check-ins', color: 'bg-emerald-500' },
    { icon: Droplets, label: 'Avg Hydration', value: avgHydration !== null ? `${avgHydration}ml` : 'N/A', sub: 'Goal: 2,500ml', color: 'bg-cyan-500' },
    { icon: Smile, label: 'Mood Index', value: moodIndex !== null ? `${moodIndex}/10` : 'N/A', sub: '7-day average', color: 'bg-amber-500' },
    { icon: MessageSquare, label: 'Feedback Score', value: globalFeedback || '...', sub: 'Platform avg rating', color: 'bg-pink-500' },
    { icon: Brain, label: 'Stress Level', value: stressLevel || 'N/A', sub: 'Based on your logs', color: 'bg-orange-500' },
  ];

  const maxScore = weeklyWellness.length > 0 ? Math.max(...weeklyWellness.map(d => d.score), 1) : 100;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className={`text-2xl font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Dashboard Overview</h2>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Your wellness snapshot for today, {dateLabel}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((s, i) => <StatCard key={i} {...s} darkMode={darkMode} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Wellness Chart */}
        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm`}>
          <h3 className={`text-base font-bold mb-5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Weekly Wellness Score</h3>
          <div className="flex items-end gap-3 h-40">
            {(weeklyWellness.length > 0 ? weeklyWellness : [
              { day: 'Mon', score: 0 }, { day: 'Tue', score: 0 }, { day: 'Wed', score: 0 },
              { day: 'Thu', score: 0 }, { day: 'Fri', score: 0 }, { day: 'Sat', score: 0 }, { day: 'Sun', score: 0 }
            ]).map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-t-xl transition-all duration-700 hover:from-emerald-400 hover:to-cyan-300 cursor-pointer"
                  style={{ height: `${(d.score / maxScore) * 100}%`, minHeight: d.score > 0 ? '4px' : '0' }}
                  title={`${d.score}`}
                />
                <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mood Distribution */}
        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm`}>
          <h3 className={`text-base font-bold mb-5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Mood Distribution</h3>
          <div className="space-y-4">
            {(moodDistribution.length > 0 ? moodDistribution : [
              { mood: '😊 Happy', pct: 0, color: 'bg-emerald-400' },
              { mood: '😐 Neutral', pct: 0, color: 'bg-amber-400' },
              { mood: '😔 Stressed', pct: 0, color: 'bg-orange-400' },
              { mood: '😰 Anxious', pct: 0, color: 'bg-red-400' },
            ]).map((m, i) => <MoodBar key={i} {...m} />)}
          </div>
        </div>
      </div>

      {/* Quick Wellness Tips */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-100'} rounded-3xl p-6 border`}>
        <div className="flex items-center gap-3 mb-4">
          <Heart className="text-emerald-500" size={20} />
          <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Today's AI Wellness Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(aiInsights.length > 0 ? aiInsights : [
            'Log your daily mood and activity to get personalized wellness insights here.',
            'Consistency helps our AI understand your patterns better over time.',
            'Try to complete your first check-in to get started!'
          ]).map((tip, i) => (
            <div key={i} className={`${darkMode ? 'bg-slate-700' : 'bg-white'} rounded-2xl p-4 shadow-sm h-full`}>
              <span className="text-emerald-500 text-xl mb-2 block">💡</span>
              <p className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
