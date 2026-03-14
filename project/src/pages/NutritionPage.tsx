import { useState, useEffect } from 'react';
import { Droplets, Plus, Minus, Utensils, Scale, Flame, Beef, Wheat, Leaf, ChevronDown, Sparkles } from 'lucide-react';
import { fetchWithAuth } from '../lib/api';

interface NutritionProps {
  weight: number; height: number;
  meals: { time: string; title: string; cal: number; items: string[] }[];
  waterGoal: number; tips: string[];
  darkMode: boolean;
}

const COLORS = ['bg-emerald-400', 'bg-cyan-400', 'bg-indigo-400', 'bg-amber-400'];

// ─── Diet plans data ──────────────────────────────────────────────────────────
type DietKey = 'underweight_veg' | 'underweight_nonveg' | 'normal_veg' | 'normal_nonveg' | 'overweight_veg' | 'overweight_nonveg';

const DIET_PLANS: Record<DietKey, { time: string; title: string; cal: number; items: string[] }[]> = {
  underweight_veg: [
    { time: 'Breakfast', title: 'Peanut Butter Banana Smoothie', cal: 520, items: ['Banana', 'Peanut butter', 'Full-fat milk', 'Oats', 'Honey'] },
    { time: 'Lunch', title: 'Paneer Butter Masala + Rice', cal: 680, items: ['Paneer 150g', 'Basmati rice', 'Butter', 'Whole-wheat roti'] },
    { time: 'Snack', title: 'Nuts & Dried Fruit Mix', cal: 300, items: ['Almonds', 'Cashews', 'Raisins', 'Dark chocolate'] },
    { time: 'Dinner', title: 'Dal Makhani + Chapati', cal: 600, items: ['Black dal', 'Cream', 'Whole-wheat chapati', 'Ghee', 'Salad'] },
  ],
  underweight_nonveg: [
    { time: 'Breakfast', title: 'Egg & Cheese Omelette Toast', cal: 560, items: ['3 eggs', 'Cheese', 'Whole-wheat toast', 'Butter', 'Avocado'] },
    { time: 'Lunch', title: 'Chicken Biryani Bowl', cal: 720, items: ['Chicken 200g', 'Basmati rice', 'Ghee', 'Yogurt raita'] },
    { time: 'Snack', title: 'Tuna on Crackers', cal: 320, items: ['Canned tuna', 'Whole-grain crackers', 'Cheese', 'Olive oil'] },
    { time: 'Dinner', title: 'Grilled Fish + Brown Rice', cal: 640, items: ['Salmon 180g', 'Brown rice', 'Stir-fried vegetables', 'Coconut oil'] },
  ],
  normal_veg: [
    { time: 'Breakfast', title: 'Oatmeal with Berries', cal: 350, items: ['Rolled oats', 'Mixed berries', 'Almond milk', 'Chia seeds', 'Honey'] },
    { time: 'Lunch', title: 'Quinoa Vegetable Bowl', cal: 480, items: ['Quinoa', 'Chickpeas', 'Spinach', 'Olive oil', 'Lemon'] },
    { time: 'Snack', title: 'Greek Yogurt & Walnuts', cal: 200, items: ['Greek yogurt', 'Walnuts', 'Green tea'] },
    { time: 'Dinner', title: 'Tofu Stir-fry + Millet', cal: 520, items: ['Tofu 150g', 'Bell peppers', 'Broccoli', 'Millet', 'Ginger'] },
  ],
  normal_nonveg: [
    { time: 'Breakfast', title: 'Scrambled Eggs & Toast', cal: 380, items: ['2 eggs', 'Whole-wheat toast', 'Low-fat milk', 'Fresh fruit'] },
    { time: 'Lunch', title: 'Grilled Chicken Quinoa Bowl', cal: 520, items: ['Chicken breast 150g', 'Quinoa', 'Spinach', 'Tomatoes', 'Olive oil'] },
    { time: 'Snack', title: 'Brain Power Mix', cal: 180, items: ['Walnuts', 'Green tea', 'Dark chocolate'] },
    { time: 'Dinner', title: 'Baked Fish + Veggies', cal: 550, items: ['Salmon 150g', 'Sweet potato', 'Steamed broccoli', 'Lemon'] },
  ],
  overweight_veg: [
    { time: 'Breakfast', title: 'Moong Dal Chilla', cal: 260, items: ['Moong dal', 'Grated veggies', 'Coriander', 'Cumin', 'Green chutney'] },
    { time: 'Lunch', title: 'Jowar Roti + Sabzi', cal: 380, items: ['Jowar roti x2', 'Palak sabzi', 'Small portion dal', 'Salad'] },
    { time: 'Snack', title: 'Sprouts Chaat', cal: 140, items: ['Mixed sprouts', 'Cucumber', 'Tomato', 'Lemon juice'] },
    { time: 'Dinner', title: 'Vegetable Soup + Salad', cal: 300, items: ['Clear vegetable soup', 'Large green salad', 'Flaxseed dressing'] },
  ],
  overweight_nonveg: [
    { time: 'Breakfast', title: 'Boiled Eggs + Fruit', cal: 280, items: ['2 boiled eggs', 'Apple', 'Green tea', 'Cucumber slices'] },
    { time: 'Lunch', title: 'Grilled Chicken Salad', cal: 400, items: ['Chicken breast 120g', 'Mixed greens', 'Cherry tomatoes', 'Olive oil dressing'] },
    { time: 'Snack', title: 'Roasted Chickpeas', cal: 150, items: ['Roasted chickpeas', 'Green tea', 'Lemon water'] },
    { time: 'Dinner', title: 'Steamed Fish + Veggies', cal: 350, items: ['White fish 130g', 'Steamed zucchini', 'Broccoli', 'Herbs'] },
  ],
};

const DIET_TIPS: Record<string, string[]> = {
  underweight: [
    'Eat 5–6 small meals daily to increase caloric intake gradually.',
    'Include healthy calorie-dense foods like nuts, seeds, and avocado.',
    'Add protein shakes between meals if needed.',
    'Do light strength training to build muscle mass alongside eating more.',
  ],
  normal: [
    'Drink 250ml water every 2 hours to stay hydrated.',
    'Start your day with a protein-rich breakfast for sustained energy.',
    'Include at least 5 servings of fruits and vegetables daily.',
    'Limit processed foods and added sugars for optimal wellness.',
  ],
  overweight: [
    'Create a modest caloric deficit of 300–500 kcal/day — no crash dieting.',
    'Prioritise high-fibre vegetables to stay full with fewer calories.',
    'Drink a glass of water before each meal to reduce portion size naturally.',
    'Walk 30 minutes daily — even two 15-minute walks count.',
  ],
};

// ─── BMI Gauge component ───────────────────────────────────────────────────────
function BmiGauge({ bmi, category }: { bmi: number; category: string }) {
  const clampedBmi = Math.min(Math.max(bmi, 10), 40);
  const pct = ((clampedBmi - 10) / 30) * 100; // map 10–40 → 0–100%

  const catStyle = category === 'Underweight'
    ? { color: 'text-blue-500', bg: 'bg-blue-100', bar: 'bg-blue-400', emoji: '📉' }
    : category === 'Normal'
      ? { color: 'text-emerald-500', bg: 'bg-emerald-100', bar: 'bg-emerald-400', emoji: '✅' }
      : { color: 'text-orange-500', bg: 'bg-orange-100', bar: 'bg-orange-400', emoji: '⚠️' };

  return (
    <div className="relative w-full">
      {/* Scale labels */}
      <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 px-1">
        <span>10</span><span>18.5</span><span>25</span><span>40</span>
      </div>
      {/* Track */}
      <div className="h-4 rounded-full overflow-hidden flex">
        <div className="flex-[0.28] bg-blue-200" />
        <div className="flex-[0.22] bg-emerald-200" />
        <div className="flex-1 bg-orange-200" />
      </div>
      {/* Needle */}
      <div
        className="absolute top-4 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-4 shadow-md transition-all duration-700"
        style={{ left: `${pct}%`, borderColor: catStyle.bar.replace('bg-', '#').length > 4 ? undefined : undefined }}
      >
        <div className={`w-full h-full rounded-full ${catStyle.bar}`} />
      </div>
      {/* Zone labels */}
      <div className="flex justify-between text-[9px] font-black mt-2 px-1">
        <span className="text-blue-400">Underweight</span>
        <span className="text-emerald-500">Normal</span>
        <span className="text-orange-500">Overweight</span>
      </div>
    </div>
  );
}

export default function NutritionPage(props: NutritionProps) {
  const { waterGoal, darkMode } = props;

  // BMI state — user can override
  const [weightKg, setWeightKg] = useState(props.weight ?? 70);
  const [heightCm, setHeightCm] = useState(props.height ?? 175);
  const [dietType, setDietType] = useState<'veg' | 'nonveg'>('veg');
  const [activeMeal, setActiveMeal] = useState<number | null>(null);

  // Backend dynamic state
  const [fetchedMeals, setFetchedMeals] = useState<any[] | null>(null);
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null); // Kept to avoid breaking any other potential refs, though currently unused in UI
  const [fetchedGoals, setFetchedGoals] = useState<any>(null);
  const [actualWaterIntake, setActualWaterIntake] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const goalsResponse = await fetchWithAuth('/nutrition/goals');
        const goals = await goalsResponse.json();

        if (goals && !goals.detail) {
          setFetchedGoals(goals);
          // Set inputs to match user's actual saved goals
          if (goals.weight_kg) setWeightKg(goals.weight_kg);
          if (goals.height_cm) setHeightCm(goals.height_cm);
          if (goals.diet_preference) {
            setDietType(goals.diet_preference.toLowerCase().includes('non') ? 'nonveg' : 'veg');
          }
        }

        const planResponse = await fetchWithAuth('/nutrition/meal-plan');
        const plan = await planResponse.json();
        if (plan && plan.plan_json) {
          const p = plan.plan_json;
          if (p.response) setGeminiResponse("Focus on whole foods, lean proteins, and plenty of hydration. Remember that consistency over time yields the best results for your wellness goals.");
          setFetchedMeals([
            { time: 'Breakfast', title: p.Breakfast.name, cal: p.Breakfast.kcal, items: p.Breakfast.items || [] },
            { time: 'Lunch', title: p.Lunch.name, cal: p.Lunch.kcal, items: p.Lunch.items || [] },
            { time: 'Snack', title: p.Snack.name, cal: p.Snack.kcal, items: p.Snack.items || [] },
            { time: 'Dinner', title: p.Dinner.name, cal: p.Dinner.kcal, items: p.Dinner.items || [] },
          ]);
        }

        // Fetch today's hydration from daily check-ins
        const checkins = await fetchWithAuth('/daily-checkins/');
        if (Array.isArray(checkins)) {
          const todayStr = new Date().toLocaleDateString('en-CA');
          const todayCheckin = checkins.find((c: any) => c.date && c.date.split('T')[0] === todayStr);
          if (todayCheckin && todayCheckin.notes && todayCheckin.notes.includes('Water:')) {
            const match = todayCheckin.notes.match(/Water: (\d+)/);
            if (match) {
              setActualWaterIntake(parseInt(match[1], 10) * 250);
            }
          }
        }
      } catch (e) { }
    }
    init();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    try {
      const dietStr = dietType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian';
      const goalsResponse = await fetchWithAuth('/nutrition/goals', {
        method: 'POST',
        body: JSON.stringify({ weight_kg: weightKg, height_cm: heightCm, diet_preference: dietStr })
      });
      const goals = await goalsResponse.json();
      if (goals && !goals.detail) setFetchedGoals(goals);

      const planResponse = await fetchWithAuth('/nutrition/meal-plan?regenerate=true');
      const plan = await planResponse.json();
      if (plan && plan.plan_json) {
        const p = plan.plan_json;
        if (p.response) setGeminiResponse("Focus on whole foods, lean proteins, and plenty of hydration. Remember that consistency over time yields the best results for your wellness goals.");
        setFetchedMeals([
          { time: 'Breakfast', title: p.Breakfast.name, cal: p.Breakfast.kcal, items: p.Breakfast.items || [] },
          { time: 'Lunch', title: p.Lunch.name, cal: p.Lunch.kcal, items: p.Lunch.items || [] },
          { time: 'Snack', title: p.Snack.name, cal: p.Snack.kcal, items: p.Snack.items || [] },
          { time: 'Dinner', title: p.Dinner.name, cal: p.Dinner.kcal, items: p.Dinner.items || [] },
        ]);
      }
    } catch (e) { }
    setIsSaving(false);
  }

  // Compute BMI
  const computedBmi = parseFloat((weightKg / ((heightCm / 100) ** 2)).toFixed(1));
  const bmiNum = fetchedGoals ? fetchedGoals.bmi : computedBmi;

  const bmiCategory: 'Underweight' | 'Normal' | 'Overweight' =
    bmiNum < 18.5 ? 'Underweight' : bmiNum < 25 ? 'Normal' : 'Overweight';

  const catKey = bmiCategory.toLowerCase() as 'underweight' | 'normal' | 'overweight';
  const dietKey: DietKey = `${catKey}_${dietType}`;

  const dynamicMeals = fetchedMeals || DIET_PLANS[dietKey];
  const dynamicTips = DIET_TIPS[catKey]; // Kept for future use if reverting

  const internalCals = Math.round(25 * weightKg);
  const internalPro = Math.round(0.8 * weightKg);
  const internalCarbs = Math.round((internalCals * 0.5) / 4);
  const internalFats = Math.round((internalCals * 0.25) / 9);

  const targetCalories = fetchedGoals ? fetchedGoals.target_calories : internalCals;
  const targetProtein = fetchedGoals ? fetchedGoals.target_protein : internalPro;
  const targetCarbs = fetchedGoals ? fetchedGoals.target_carbs : internalCarbs;
  const targetFats = fetchedGoals ? fetchedGoals.target_fats : internalFats;

  const waterPct = Math.min((actualWaterIntake / waterGoal) * 100, 100);

  const catStyle = bmiCategory === 'Underweight'
    ? { gradient: 'from-blue-500 to-indigo-500', light: 'bg-blue-50 border-blue-200 text-blue-700', badge: 'bg-blue-100 text-blue-700', emoji: '📉' }
    : bmiCategory === 'Normal'
      ? { gradient: 'from-emerald-500 to-cyan-500', light: 'bg-emerald-50 border-emerald-200 text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', emoji: '✅' }
      : { gradient: 'from-orange-500 to-amber-500', light: 'bg-orange-50 border-orange-200 text-orange-700', badge: 'bg-orange-100 text-orange-700', emoji: '⚠️' };

  const card = `${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm`;
  const input = `w-full px-4 py-3 rounded-2xl border-2 text-sm font-semibold outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-400' : 'bg-slate-50 border-slate-100 text-slate-800 focus:border-emerald-400'
    }`;

  const macros = [
    { label: 'Protein', value: `${targetProtein}g`, icon: Beef, color: 'bg-rose-100 text-rose-600', bar: 'bg-rose-400', pct: 30 },
    { label: 'Carbs', value: `${targetCarbs}g`, icon: Wheat, color: 'bg-amber-100 text-amber-600', bar: 'bg-amber-400', pct: 50 },
    { label: 'Fats', value: `${targetFats}g`, icon: Flame, color: 'bg-orange-100 text-orange-600', bar: 'bg-orange-400', pct: 20 },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Nutrition</h2>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Personalised meal plan based on your BMI and diet preference</p>
      </div>

      {/* ── BMI CALCULATOR ────────────────────────────────────────────── */}
      <div className={card}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Scale size={18} className="text-indigo-600" />
          </div>
          <div>
            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>BMI Calculator</h3>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Enter your measurements to get a personalised diet plan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Weight */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Weight (kg)
            </label>
            <div className="flex items-center gap-2">
              <button onClick={() => setWeightKg(w => Math.max(30, w - 1))}
                className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 font-bold transition-colors ${darkMode ? 'border-slate-600 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                <Minus size={14} />
              </button>
              <input type="number" value={weightKg} min={30} max={200}
                onChange={e => setWeightKg(Math.max(30, Math.min(200, Number(e.target.value))))}
                className={input}
              />
              <button onClick={() => setWeightKg(w => Math.min(200, w + 1))}
                className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 font-bold transition-colors ${darkMode ? 'border-slate-600 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Height */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Height (cm)
            </label>
            <div className="flex items-center gap-2">
              <button onClick={() => setHeightCm(h => Math.max(100, h - 1))}
                className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 font-bold transition-colors ${darkMode ? 'border-slate-600 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                <Minus size={14} />
              </button>
              <input type="number" value={heightCm} min={100} max={250}
                onChange={e => setHeightCm(Math.max(100, Math.min(250, Number(e.target.value))))}
                className={input}
              />
              <button onClick={() => setHeightCm(h => Math.min(250, h + 1))}
                className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 font-bold transition-colors ${darkMode ? 'border-slate-600 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* BMI Result Banner */}
        <div className={`flex flex-col md:flex-row md:items-center gap-5 p-5 rounded-2xl border-2 ${catStyle.light} mb-5`}>
          <div className="text-center md:text-left">
            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">Your BMI</p>
            <p className="text-5xl font-black">{bmiNum}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl">{catStyle.emoji}</span>
              <span className="font-black text-lg">{bmiCategory}</span>
            </div>
          </div>

          <div className="flex-1">
            <BmiGauge bmi={bmiNum} category={bmiCategory} />
          </div>

          {/* Meaning */}
          <div className={`text-xs font-medium leading-relaxed max-w-xs ${darkMode ? '' : 'opacity-80'}`}>
            {bmiCategory === 'Underweight' && 'Your BMI is below 18.5. You may need to increase caloric intake and gain healthy weight through nutrient-dense foods.'}
            {bmiCategory === 'Normal' && 'Your BMI is in the healthy range (18.5–24.9). Maintain your balanced diet and active lifestyle.'}
            {bmiCategory === 'Overweight' && 'Your BMI is 25 or above. A calorie-conscious, high-fibre diet combined with regular exercise can help you reach a healthy weight.'}
          </div>
        </div>

        {/* BMI Range Reference */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Underweight', range: '< 18.5', color: 'bg-blue-50 border-blue-100 text-blue-600', active: bmiCategory === 'Underweight' },
            { label: 'Normal', range: '18.5 – 24.9', color: 'bg-emerald-50 border-emerald-100 text-emerald-600', active: bmiCategory === 'Normal' },
            { label: 'Overweight', range: '≥ 25', color: 'bg-orange-50 border-orange-100 text-orange-600', active: bmiCategory === 'Overweight' },
          ].map((z, i) => (
            <div key={i} className={`rounded-2xl border-2 p-3 text-center transition-all ${z.color} ${z.active ? 'ring-2 ring-offset-1 ring-current scale-105 shadow-md' : 'opacity-60'}`}>
              <p className="font-black text-xs">{z.label}</p>
              <p className="text-xs opacity-70 mt-0.5">BMI {z.range}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── DIET TYPE SELECTOR ──────────────────────────────────────────── */}
      <div className={card}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Leaf size={18} className="text-emerald-600" />
          </div>
          <div>
            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Diet Preference</h3>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Choose your diet type to get a tailored meal plan</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setDietType('veg')}
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${dietType === 'veg'
              ? 'border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-100'
              : darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-100 hover:border-slate-200'
              }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${dietType === 'veg' ? 'bg-emerald-500' : 'bg-slate-100'}`}>
              🥦
            </div>
            <div className="text-left">
              <p className={`font-black text-sm ${dietType === 'veg' ? 'text-emerald-700' : darkMode ? 'text-white' : 'text-slate-900'}`}>Vegetarian</p>
              <p className={`text-xs ${dietType === 'veg' ? 'text-emerald-600' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Plant-based meals</p>
            </div>
            {dietType === 'veg' && (
              <div className="ml-auto w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-black">✓</div>
            )}
          </button>

          <button
            onClick={() => setDietType('nonveg')}
            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${dietType === 'nonveg'
              ? 'border-rose-400 bg-rose-50 shadow-md shadow-rose-100'
              : darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-100 hover:border-slate-200'
              }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${dietType === 'nonveg' ? 'bg-rose-500' : 'bg-slate-100'}`}>
              🍗
            </div>
            <div className="text-left">
              <p className={`font-black text-sm ${dietType === 'nonveg' ? 'text-rose-700' : darkMode ? 'text-white' : 'text-slate-900'}`}>Non-Vegetarian</p>
              <p className={`text-xs ${dietType === 'nonveg' ? 'text-rose-600' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Includes meat & fish</p>
            </div>
            {dietType === 'nonveg' && (
              <div className="ml-auto w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-black">✓</div>
            )}
          </button>
        </div>

        {/* Dynamic summary pill */}
        <div className={`mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full`}>
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl ${catStyle.badge} w-fit`}>
            <span className="text-base">{catStyle.emoji}</span>
            <span className="text-xs font-black">
              Showing {bmiCategory} · {dietType === 'veg' ? '🥦 Vegetarian' : '🍗 Non-Vegetarian'} meal plan
            </span>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-8 py-3.5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 text-sm ${darkMode ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'} ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Plan...
              </>
            ) : (
              'Save & Generate Plan'
            )}
          </button>
        </div>
      </div>

      {/* ── STATS ROW ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Scale, label: 'Your BMI', value: String(bmiNum), color: 'bg-indigo-100 text-indigo-600', sub: bmiCategory },
          { icon: Flame, label: 'Daily Calories', value: String(targetCalories), color: 'bg-orange-100 text-orange-600', sub: 'kcal needed' },
          { icon: Beef, label: 'Protein', value: `${targetProtein}g`, color: 'bg-rose-100 text-rose-600', sub: 'Daily goal' },
          { icon: Wheat, label: 'Carbs / Fats', value: `${targetCarbs}/${targetFats}g`, color: 'bg-amber-100 text-amber-600', sub: 'Macro split' },
        ].map((s, i) => (
          <div key={i} className={`${card} flex items-center gap-4`}>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{s.value}</p>
              <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</p>
              <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── HYDRATION + MACRO ROW ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hydration Tracker */}
        <div className={card}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-100 flex items-center justify-center">
              <Droplets size={18} className="text-cyan-600" />
            </div>
            <div>
              <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>Daily Hydration</h3>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{actualWaterIntake}ml / {waterGoal}ml</p>
            </div>
            <span className="ml-auto text-sm font-black text-cyan-500">{Math.round(waterPct)}%</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all duration-700" style={{ width: `${waterPct}%` }} />
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={`w-8 h-8 rounded-xl flex items-center justify-center text-base border-2 transition-all ${i < Math.round(waterPct / 10) ? 'border-cyan-400 bg-cyan-50' : darkMode ? 'border-slate-700' : 'border-slate-100'
                }`}>💧</div>
            ))}
          </div>
          <p className={`text-xs italic ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>* Log your water in your Daily Check-In</p>
        </div>

        {/* Macro Breakdown */}
        <div className={card}>
          <h3 className={`font-bold text-sm mb-5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Macro Breakdown</h3>
          <div className="space-y-4">
            {macros.map((m, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${m.color}`}><m.icon size={14} /></div>
                  <span className={`text-sm font-bold flex-1 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{m.label}</span>
                  <span className="text-sm font-black text-slate-500">{m.value}</span>
                  <span className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{m.pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${m.bar} rounded-full transition-all duration-700`} style={{ width: `${m.pct * 2}%` }} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── DYNAMIC MEAL PLAN ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Utensils size={18} className="text-emerald-500" />
            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Recommended Meal Plan
            </h3>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black ${catStyle.badge}`}>
            {catStyle.emoji} {bmiCategory} · {dietType === 'veg' ? '🥦 Veg' : '🍗 Non-Veg'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dynamicMeals.map((meal, i) => (
            <div
              key={`${dietKey}-${i}`}
              onClick={() => setActiveMeal(activeMeal === i ? null : i)}
              className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5`}
            >
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wide mb-3 ${COLORS[i]} text-white`}>
                {meal.time}
              </div>
              <h4 className={`font-bold text-sm mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{meal.title}</h4>
              <div className="flex items-center justify-between">
                <p className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{meal.cal} kcal</p>
                <ChevronDown size={14} className={`text-slate-300 transition-transform ${activeMeal === i ? 'rotate-180' : ''}`} />
              </div>
              {activeMeal === i && (
                <ul className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  {meal.items.map((item: string, j: number) => (
                    <li key={j} className={`text-xs flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Total calories for the day */}
        <div className={`mt-4 flex items-center justify-end gap-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <Flame size={14} className="text-orange-500" />
          <span className="font-semibold">Total:</span>
          <span className="font-black text-slate-700 dark:text-white">
            {dynamicMeals.reduce((s, m) => s + m.cal, 0)} kcal/day
          </span>
        </div>
      </div>

      {/* ── AI NUTRITIONIST ADVICE ──────────────────────────────────────── ──────── */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100'} rounded-3xl p-6 border`}>
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={18} className="text-purple-500" />
          <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            AI Nutritionist Advice
          </h3>
          <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${darkMode ? 'bg-slate-700 text-purple-400' : 'bg-purple-200 text-purple-700'} ml-auto`}>
            Powered by Gemini
          </span>
        </div>

        <div className={`text-sm leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          Focus on whole foods, lean proteins, and plenty of hydration. Remember that consistency over time yields the best results for your wellness goals.
        </div>
      </div>
    </div>
  );
}