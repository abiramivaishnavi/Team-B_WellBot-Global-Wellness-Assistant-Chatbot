import { useState, useEffect } from 'react';
import { FileText, TrendingUp, TrendingDown, Calendar, Filter, Download } from 'lucide-react';
import { fetchWithAuth } from '../../lib/api';

interface HealthReportsViewProps { darkMode: boolean; }

interface ReportItem {
  id: string;
  title: string;
  date: string;
  type: string;
  score: number;
  trend: number;
}

interface HistoryItem {
  month: string;
  score: number | null;
  has_data: boolean;
}

const FILTER_TABS = ['All', 'Wellness', 'Stress', 'Nutrition', 'Sleep', 'Mental'];

export default function HealthReportsView({ darkMode }: HealthReportsViewProps) {
  const [filter, setFilter] = useState('All');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      try {
        const [reportsRes, historyRes] = await Promise.all([
          fetchWithAuth('/reports/list'),
          fetchWithAuth('/reports/history')
        ]);

        const reportsData = await reportsRes.json();
        const historyData = await historyRes.json();

        if (Array.isArray(reportsData)) setReports(reportsData);
        if (Array.isArray(historyData)) setHistory(historyData);
      } catch (err) {
        console.error('Failed to load reports overview', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const handleDownload = async (reportId: string, title: string) => {
    try {
      setLoadingId(reportId);
      const res = await fetchWithAuth(`/reports/download/${reportId}`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download report', err);
    } finally {
      setLoadingId(null);
    }
  };

  // Chart: only months with real data contribute to the max
  const scores = history.map(h => h.score ?? 0);
  const maxScore = Math.max(...scores, 1);

  // Trend label
  const dataMonths = history.filter(h => h.has_data);
  let trendText = '+0pts over 6 months';
  if (dataMonths.length >= 2) {
    const first = dataMonths[0].score ?? 0;
    const last = dataMonths[dataMonths.length - 1].score ?? 0;
    const diff = last - first;
    trendText = `${diff >= 0 ? '+' : ''}${diff}pts over ${dataMonths.length} months`;
  }
  const trendPositive = !trendText.startsWith('-');

  // Filtered reports
  const filteredReports = filter === 'All' ? reports : reports.filter(r => r.type === filter);

  const card = `${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-2xl p-5 border shadow-sm`;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-black mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Health Reports</h2>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>View, analyse and export your health history</p>
        </div>
        <button
          onClick={() => handleDownload('monthly-summary', 'Monthly_Wellness_Summary')}
          disabled={loadingId === 'monthly-summary'}
          className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-xl transition-all flex-shrink-0 ${
            loadingId === 'monthly-summary'
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
          }`}
        >
          {loadingId === 'monthly-summary' ? (
            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
          ) : (
            <><Download size={14} /> Export PDF</>
          )}
        </button>
      </div>

      {/* Wellness Score History Chart */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Wellness Score History</h3>
          <span className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 ${trendPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {trendText}
          </span>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex items-end gap-4 h-40">
            {history.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className={`text-xs font-bold ${h.has_data ? (darkMode ? 'text-slate-300' : 'text-slate-600') : (darkMode ? 'text-slate-600' : 'text-slate-300')}`}>
                  {h.has_data && h.score !== null ? h.score : '—'}
                </span>
                <div
                  className={`w-full rounded-t-2xl transition-all duration-700 ${
                    !h.has_data
                      ? (darkMode ? 'bg-slate-700' : 'bg-slate-100')
                      : i === history.length - 1
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                        : 'bg-gradient-to-t from-indigo-400 to-indigo-300'
                  }`}
                  style={{ height: h.has_data && h.score ? `${Math.max(10, ((h.score ?? 0) / maxScore) * 100)}%` : '8%' }}
                />
                <span className={`text-xs font-semibold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{h.month}</span>
              </div>
            ))}
          </div>
        )}

        {!loading && dataMonths.length === 0 && (
          <p className={`text-center text-xs mt-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Complete daily check-ins to see your wellness score history
          </p>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter size={16} className={darkMode ? 'text-slate-400' : 'text-slate-400'} />
        {FILTER_TABS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${filter === f
              ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
              : darkMode ? 'border-slate-600 text-slate-400 hover:border-slate-500' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className={`${card} h-20 animate-pulse`}>
              <div className={`h-4 w-1/3 rounded ${darkMode ? 'bg-slate-700' : 'bg-slate-100'} mb-2`} />
              <div className={`h-3 w-1/4 rounded ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
            </div>
          ))
        ) : filteredReports.length === 0 ? (
          <div className={`text-center p-8 rounded-2xl border-2 border-dashed ${darkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            <p className="font-bold">No reports in this category</p>
            <p className="text-xs mt-1">Complete daily check-ins to generate health reports</p>
          </div>
        ) : filteredReports.map((r) => (
          <div key={r.id} className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-4`}>
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <FileText size={20} className="text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{r.title}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-xs flex items-center gap-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Calendar size={11} /> {r.date}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${r.trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                  {r.trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {r.trend >= 0 ? '+' : ''}{r.trend}%
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-2xl font-black ${r.score >= 80 ? 'text-emerald-500' : r.score >= 70 ? 'text-amber-500' : 'text-red-500'}`}>{r.score}</p>
              <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Score</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
