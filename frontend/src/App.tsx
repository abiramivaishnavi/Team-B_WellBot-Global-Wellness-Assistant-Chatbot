import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/views/LandingPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<'landing' | 'signup' | 'signin'>('landing');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto mb-4 animate-pulse">W</div>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-400 border-t-transparent"></div>
          <p className="mt-4 text-slate-500 font-semibold text-sm">Loading WellBot...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (page === 'landing') {
      return <LandingPage onNavigate={(p) => setPage(p)} />;
    }
    return (
      <>
        {page === 'signup' ? (
          <SignUp onNavigate={(p) => setPage(p as 'signup' | 'signin')} />
        ) : (
          <SignIn onNavigate={(p) => setPage(p as 'signup' | 'signin')} />
        )}
      </>
    );
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
