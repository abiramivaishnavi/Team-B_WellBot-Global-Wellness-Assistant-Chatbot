import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Globe } from 'lucide-react';

interface SignInProps {
  onNavigate: (page: string) => void;
}

export default function SignIn({ onNavigate }: SignInProps) {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
  };

  if (showForgot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100/80">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">W</span>
            </div>
            <span className="text-lg font-black text-slate-900">WellBot</span>
          </div>

          {!forgotSent ? (
            <>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Reset Password</h2>
              <p className="text-slate-400 text-sm mb-8">Enter your email to receive a reset link.</p>
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="flex items-center gap-3 border-2 border-slate-100 rounded-2xl px-4 py-3 focus-within:border-emerald-400 transition-all bg-slate-50/50">
                    <Mail className="w-4 h-4 text-slate-300" />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="bg-transparent flex-1 text-slate-800 placeholder-slate-300 text-sm font-medium outline-none"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-200"
                >
                  Send Reset Link <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-2">Check Your Email</h2>
              <p className="text-slate-400 text-sm mb-6">We've sent a password reset link to <strong>{forgotEmail}</strong></p>
            </div>
          )}

          <button onClick={() => { setShowForgot(false); setForgotSent(false); }} className="w-full text-center text-sm text-slate-400 hover:text-emerald-600 font-medium mt-4 transition-colors">
            ← Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4 font-sans">
      <div className="flex w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100/80">

        {/* LEFT: Visual */}
        <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-400/20 to-transparent" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <span className="text-white font-black text-lg">W</span>
              </div>
              <span className="text-white font-black text-2xl tracking-tight">WellBot</span>
            </div>
            <h2 className="text-white text-3xl font-bold leading-snug mb-3">
              Welcome back! <br />
              <span className="text-indigo-200">We missed you.</span>
            </h2>
            <p className="text-indigo-200/80 text-sm leading-relaxed">
              Your wellness journey continues here. Let's check in on your health today.
            </p>
          </div>


        </div>

        {/* RIGHT: Form */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">W</span>
            </div>
            <span className="text-lg font-black text-slate-900">WellBot</span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 text-sm mb-8 font-medium">Sign in to continue your wellness journey.</p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
              <div className="flex items-center gap-3 border-2 border-slate-100 rounded-2xl px-4 py-3 focus-within:border-indigo-400 transition-all group bg-slate-50/50">
                <Mail className="w-4 h-4 text-slate-300 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent flex-1 text-slate-800 placeholder-slate-300 text-sm font-medium outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-indigo-500 font-semibold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="flex items-center gap-3 border-2 border-slate-100 rounded-2xl px-4 py-3 focus-within:border-indigo-400 transition-all group bg-slate-50/50">
                <Lock className="w-4 h-4 text-slate-300 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent flex-1 text-slate-800 placeholder-slate-300 text-sm font-medium outline-none"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-300 hover:text-indigo-500 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                <Globe className="w-3 h-3 inline mr-1" />
                Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all ${language === lang.code
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                      : 'border-slate-100 text-slate-500 hover:border-slate-200 bg-slate-50/50'
                      }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-purple-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing In...</>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
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
            Don't have an account?{' '}
            <button onClick={() => onNavigate('signup')} className="text-indigo-600 font-bold hover:underline">
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}