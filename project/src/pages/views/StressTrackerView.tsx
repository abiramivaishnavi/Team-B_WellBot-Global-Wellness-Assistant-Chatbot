import { useState } from 'react';
import {
  Wind, Leaf, Music, Dumbbell, PenLine, Eye, PersonStanding, Footprints,
  AlertTriangle, Play, Zap, Droplets
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchWithAuth } from '../../lib/api';

interface StressTrackerViewProps { darkMode: boolean; }

const ICON_MAP: Record<string, React.FC<any>> = {
  'Wind': Wind,
  'Leaf': Leaf,
  'Music': Music,
  'Dumbbell': Dumbbell,
  'PenLine': PenLine,
  'Eye': Eye,
  'PersonStanding': PersonStanding,
  'Footprints': Footprints,
  'Droplets': Droplets
};

// Fallback zone representing the baseline load state
const INITIAL_ZONE = {
  key: 'high', label: 'HIGH', emoji: '🟠', range: '50 / 100',
  color: 'bg-orange-500', light: 'bg-orange-50 border-orange-200 text-orange-700',
  badge: 'bg-orange-100 text-orange-700', sliderAccent: '#f97316',
  desc: 'Elevated stress. Generating personalized protocol...',
  intensity: 'Standard Protocol',
  exercises: [
    { name: 'Progressive Muscle Relaxation', meta: 'Tense & release muscle groups', icon: 'Dumbbell' },
    { name: 'Nature Soundscape', meta: '5-minute immersive audio', icon: 'Music' }
  ]
};

export default function StressTrackerView({ darkMode }: StressTrackerViewProps) {
  const { user } = useAuth();
  const [balanceScore, setBalanceScore] = useState(50);
  const [saving, setSaving] = useState(false);

  const [zone, setZone] = useState<any>(INITIAL_ZONE);
  const [debouncedScore, setDebouncedScore] = useState(balanceScore);
  const [isGenerating, setIsGenerating] = useState(false);

  // Debouncer Effect
  import('react').then(R => {
    R.useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedScore(balanceScore);
      }, 500);
      return () => clearTimeout(handler);
    }, [balanceScore]);
  });

  // AI Protocol Fetch Effect
  import('react').then(R => {
    R.useEffect(() => {
      async function fetchProtocol() {
        setIsGenerating(true);
        try {
          const res = await fetchWithAuth(`/stress-logs/protocol?score=${debouncedScore}`);
          const data = await res.json();
          if (data && data.key) {
            setZone(data);
          }
        } catch (e) {
          console.error("Failed to fetch protocol", e);
        } finally {
          setIsGenerating(false);
        }
      }
      fetchProtocol();
    }, [debouncedScore]);
  });

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await fetchWithAuth('/stress-logs/', {
        method: 'POST',
        body: JSON.stringify({
          date: today,
          stress: 100 - balanceScore,
          trigger: null,
          coping_strategy: null,
          notes: `Zone: ${zone.label}, range: ${zone.range}`,
        }),
      });
    } catch (e) {
      console.error('Failed to save stress log', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`p-6 min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-900'}`}>
      <div className="max-w-2xl mx-auto space-y-8">

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Stress Harmony</h1>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Balance Score: <span className="font-mono font-bold text-xl">{balanceScore}</span>
          </p>
        </div>

        <div className={`p-8 rounded-3xl border transition-all duration-500 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex justify-between items-center mb-6">
            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${zone.badge}`}>
              {zone.emoji} {zone.label}
            </span>
            <span className="text-sm font-medium opacity-60">Range: {zone.range}</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={balanceScore}
            onChange={(e) => setBalanceScore(parseInt(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer mb-6"
            style={{ accentColor: zone.sliderAccent }}
          />

          <div className={`p-4 rounded-xl border transition-all duration-300 ${zone.light}`}>
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{zone.intensity}</p>
                  {isGenerating && <div className="text-[10px] font-bold tracking-widest uppercase opacity-50 animate-pulse flex items-center gap-1"><Zap size={10} /> AI Analyzing</div>}
                </div>
                <p className="text-sm opacity-90 leading-relaxed mt-1">{zone.desc}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-bold">Recommended Protocol</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !user}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Today'}
            </button>
            <Zap className="w-5 h-5" style={{ color: zone.sliderAccent }} />
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-4 transition-all duration-500 ${isGenerating ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}`}>
          {zone.exercises.map((ex: any, i: number) => {
            const IconCmp = ICON_MAP[ex.icon] || Dumbbell;
            return (
              <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${zone.color} text-white transition-colors duration-500`}>
                    <IconCmp size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">{ex.name}</h3>
                    <p className="text-xs opacity-60">{ex.meta}</p>
                  </div>
                </div>
                <button className={`p-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-100'} hover:opacity-80`}>
                  <Play size={16} fill="currentColor" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
