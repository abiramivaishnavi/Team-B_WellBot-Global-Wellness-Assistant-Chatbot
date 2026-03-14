import React, { useState, useEffect } from 'react';
import { Star, Send, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchWithAuth } from '../../lib/api';

interface FeedbackViewProps { darkMode: boolean; }

interface CommunityReview {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  category?: string;
  comment: string;
  time: string;
}

interface FeedbackStats {
  average_rating: number;
  total_reviews: number;
  satisfaction_pct: number;
}

export default function FeedbackView({ darkMode }: FeedbackViewProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState('Overall');
  const [sending, setSending] = useState(false);

  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [categories] = useState(['Overall', 'Nutrition', 'Chat', 'Stress Tracker', 'Health Reports']);
  const [error, setError] = useState<string | null>(null);

  const loadStats = () => {
    setLoadingStats(true);
    fetchWithAuth('/feedback/stats')
      .then(res => {
        if (!res.ok) throw new Error(`Stats ${res.status}`);
        return res.json();
      })
      .then((data: FeedbackStats) => {
        console.log('[Feedback] stats:', data);
        setStats(data);
      })
      .catch(err => console.error('[Feedback] stats error:', err))
      .finally(() => setLoadingStats(false));
  };

  const loadReviews = () => {
    setLoadingReviews(true);
    fetchWithAuth('/feedback/community')
      .then(res => {
        if (!res.ok) throw new Error(`Reviews ${res.status}`);
        return res.json();
      })
      .then((data: CommunityReview[]) => {
        console.log('[Feedback] community reviews:', data);
        setReviews(data);
      })
      .catch(err => console.error('[Feedback] reviews error:', err))
      .finally(() => setLoadingReviews(false));
  };

  useEffect(() => {
    loadStats();
    loadReviews();
  }, []);

  // Refresh stats and reviews after successful submit
  const refreshData = () => {
    // Small delay to let DB write propagate
    setTimeout(() => {
      loadStats();
      loadReviews();
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setSending(true);
    try {
      await fetchWithAuth('/feedback/', {
        method: 'POST',
        body: JSON.stringify({
          rating,
          category,
          comment,
          anonymous: !user,
        }),
      });
      setSubmitted(true);
      refreshData();
      setError(null);
    } catch (err: any) {
      console.error('Failed to submit feedback', err);
      setError(err.message || 'Failed to submit feedback. Please check if the backend is running.');
    } finally {
      setSending(false);
    }
  };

  const statCards = [
    {
      label: 'Average Rating',
      value: loadingStats ? '…' : stats ? stats.average_rating.toFixed(1) : '0.0',
      sub: 'Out of 5 stars',
      emoji: '⭐',
    },
    {
      label: 'Total Reviews',
      value: loadingStats ? '…' : stats ? stats.total_reviews.toLocaleString() : '0',
      sub: 'From all users',
      emoji: '💬',
    },
    {
      label: 'Satisfaction',
      value: loadingStats ? '…' : stats ? `${stats.satisfaction_pct}%` : '0%',
      sub: 'Positive feedback',
      emoji: '👍',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className={`text-2xl font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Feedback Center</h2>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Share your experience and help us improve</p>
      </div>

      {/* Summary Cards */}
      <div className="flex items-center justify-between gap-5 mb-5 flex-wrap">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1">
          {statCards.map((s, i) => (
            <div key={i} className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm text-center`}>
              <span className="text-3xl mb-2 block">{s.emoji}</span>
              <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{s.value}</p>
              <p className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{s.label}</p>
              <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{s.sub}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => { loadStats(); loadReviews(); }}
          className={`p-4 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-100 text-slate-400 hover:text-slate-900'} shadow-sm`}
          title="Refresh Data"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Feedback */}
        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center">
              <MessageSquare size={18} className="text-pink-500" />
            </div>
            <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Leave Your Review</h3>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🎉</div>
              <p className={`font-black text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>Thank You!</p>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>Your feedback helps us serve you better.</p>
              <button onClick={() => { setSubmitted(false); setRating(0); setComment(''); }} className="mt-4 text-sm text-emerald-500 font-semibold hover:underline">
                Submit Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <button key={c} type="button" onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${category === c
                      ? 'border-pink-400 bg-pink-50 text-pink-600'
                      : darkMode ? 'border-slate-600 text-slate-400 hover:border-slate-500' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}>
                    {c}
                  </button>
                ))}
              </div>

              {/* Stars */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star size={28} className={`transition-colors ${s <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Comments</label>
                <textarea
                  rows={4} value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  className={`w-full px-4 py-3 rounded-2xl border-2 text-sm font-medium resize-none outline-none transition-all ${darkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-pink-400'
                    : 'bg-slate-50 border-slate-100 text-slate-800 placeholder-slate-300 focus:border-pink-300'
                    }`}
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border-2 border-red-100 text-red-600 text-xs font-bold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={sending || rating === 0}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-2xl font-bold text-sm hover:from-pink-600 hover:to-rose-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-pink-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send size={16} /> {sending ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}
        </div>

        {/* Community Reviews */}
        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm`}>
          <h3 className={`text-base font-bold mb-5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Community Reviews</h3>
          <div className="space-y-4 overflow-y-auto max-h-80 pr-1">
            {loadingReviews ? (
              <p className={`text-sm text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Loading reviews…</p>
            ) : reviews.length === 0 ? (
              <p className={`text-sm text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>No reviews yet. Be the first!</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className={`p-4 rounded-2xl ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                      {r.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{r.name}</span>
                        <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{r.time}</span>
                      </div>
                      <div className="flex gap-0.5 mt-1 mb-2">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />)}
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{r.comment}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 pt-3 border-t border-slate-200/50">
                    <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-500 transition-colors">
                      <ThumbsUp size={12} /> Helpful
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors">
                      <ThumbsDown size={12} /> Not Helpful
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
