import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Globe, ArrowRight, CheckCircle } from 'lucide-react';

interface SignUpProps {
  onNavigate: (page: string) => void;
}

export default function SignUp({ onNavigate }: SignUpProps) {
  const { signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState(0);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setError('Please agree to the Terms & Conditions.'); return; }
    setError('');
    setLoading(true);
    const { error: authError } = await signUp(email, password, name, language);
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  const features = [
    'AI-powered wellness tracking',
    'Multi-language support',
    'Personalized health reports',
    'Stress & mood tracker',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4 font-sans">
      <div className="flex w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100/80">

        {/* LEFT: Illustration Panel */}
        <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-12 flex-col justify-between relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <span className="text-white font-black text-lg">W</span>
              </div>
              <span className="text-white font-black text-2xl tracking-tight">WellBot</span>
            </div>
            <h2 className="text-white text-3xl font-bold leading-snug mb-3">
              Your personal <br />
              <span className="text-emerald-100">wellness companion</span>
            </h2>
            <p className="text-emerald-100/80 text-sm leading-relaxed">
              Join thousands who've transformed their health with AI-powered insights.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-white/90 text-sm font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Form */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center overflow-y-auto">
          {/* Logo for mobile */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">W</span>
            </div>
            <span className="text-lg font-black text-slate-900">WellBot</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">Create Account</h1>
          <p className="text-slate-400 text-sm mb-8 font-medium">Join our wellness community today.</p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
              <div className="flex items-center gap-3 border-2 border-slate-100 rounded-2xl px-4 py-3 focus-within:border-emerald-400 transition-all group bg-slate-50/50">
                <User className="w-4 h-4 text-slate-300 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent flex-1 text-slate-800 placeholder-slate-300 text-sm font-medium outline-none"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
              <div className="flex items-center gap-3 border-2 border-slate-100 rounded-2xl px-4 py-3 focus-within:border-emerald-400 transition-all group bg-slate-50/50">
                <Mail className="w-4 h-4 text-slate-300 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent flex-1 text-slate-800 placeholder-slate-300 text-sm font-medium outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
              <div className="flex items-center gap-3 border-2 border-slate-100 rounded-2xl px-4 py-3 focus-within:border-emerald-400 transition-all group bg-slate-50/50">
                <Lock className="w-4 h-4 text-slate-300 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent flex-1 text-slate-800 placeholder-slate-300 text-sm font-medium outline-none"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-300 hover:text-emerald-500 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                <Globe className="w-3 h-3 inline mr-1" />
                Preferred Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all ${language === lang.code
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100'
                      : 'border-slate-100 text-slate-500 hover:border-slate-200 bg-slate-50/50'
                      }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <div
                onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer flex-shrink-0 mt-0.5 transition-all ${agreed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
              >
                {agreed && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                I agree to WellBot's{' '}
                <button type="button" className="text-emerald-600 font-semibold hover:underline">Terms of Service</button>{' '}
                and{' '}
                <button type="button" className="text-emerald-600 font-semibold hover:underline">Privacy Policy</button>
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-cyan-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating Account...</>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 border-2 border-slate-100 py-3 rounded-2xl font-semibold text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <button onClick={() => onNavigate('signin')} className="text-emerald-600 font-bold hover:underline">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
