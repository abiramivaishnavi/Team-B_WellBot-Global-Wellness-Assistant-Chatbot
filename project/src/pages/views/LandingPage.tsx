import { Brain, ArrowRight, Activity, Shield, Globe, Users, Heart } from 'lucide-react';

interface LandingPageProps {
    onNavigate: (page: 'signin' | 'signup') => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden selection:bg-emerald-200">

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <span className="font-black text-sm">W</span>
                        </div>
                        <span className="font-black text-xl text-slate-900 tracking-tight">WellBot</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onNavigate('signin')}
                            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => onNavigate('signup')}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-6 relative">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] opacity-30 pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                    <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Your personal <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
                            health companion.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Track your mood, analyze your daily habits, and receive personalized AI recommendations to live a healthier, more balanced life.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <button
                            onClick={() => onNavigate('signup')}
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                            Start for free <ArrowRight size={18} />
                        </button>
                        <button
                            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            View demo
                        </button>
                    </div>
                </div>
            </main>

            {/* Features Grid */}
            <section className="bg-white py-24 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Everything you need to thrive</h2>
                        <p className="text-slate-500 text-lg">WellBot combines advanced AI with proven wellness practices to give you actionable insights every day.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Brain,
                                color: 'text-purple-500',
                                bg: 'bg-purple-100',
                                title: 'AI Stress Analysis',
                                desc: 'Our intelligent algorithms analyze your daily inputs to predict and help manage your stress levels before they escalate.'
                            },
                            {
                                icon: Activity,
                                color: 'text-emerald-500',
                                bg: 'bg-emerald-100',
                                title: 'Interactive Health Reports',
                                desc: 'Generate comprehensive visual reports of your health trends, sleep patterns, and hydration over time.'
                            },
                            {
                                icon: Globe,
                                color: 'text-blue-500',
                                bg: 'bg-blue-100',
                                title: 'Multi-language Support',
                                desc: 'Experience WellBot in your native language. Fully supported in English, Hindi, and Telugu.'
                            },
                            {
                                icon: Shield,
                                color: 'text-amber-500',
                                bg: 'bg-amber-100',
                                title: 'Secure & Private',
                                desc: 'Your health data is encrypted and securely stored. We prioritize your privacy above everything else.'
                            },
                            {
                                icon: Users,
                                color: 'text-rose-500',
                                bg: 'bg-rose-100',
                                title: 'Community Insights',
                                desc: 'See how your wellness score compares anonymously with the community and stay motivated.'
                            },
                            {
                                icon: Heart,
                                color: 'text-cyan-500',
                                bg: 'bg-cyan-100',
                                title: 'Daily Check-ins',
                                desc: 'Log your mood, energy, and habits in less than 30 seconds to build a historical map of your wellbeing.'
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-[2rem] bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 group">
                                <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon size={24} className={feature.color} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 pt-20 pb-10 px-6 border-t border-slate-900">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                            <span className="font-black text-sm">W</span>
                        </div>
                        <span className="font-black text-xl text-white tracking-tight">WellBot</span>
                    </div>

                    <div className="text-slate-500 text-sm font-medium">
                        © {new Date().getFullYear()} WellBot Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
