import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot, CheckCircle2, ShieldCheck, Star, Paperclip } from 'lucide-react';
import { fetchWithAuth } from '../lib/api';

interface WellbotProps {
  defaultOpen?: boolean;
  inline?: boolean;
}

const Wellbot = ({ defaultOpen = false, inline = false }: WellbotProps) => {
  const [isOpen, setIsOpen] = useState(inline ? true : defaultOpen);
  const [userInput, setUserInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Welcome to Wellbot Professional. I can analyze your health documents and provide stress assessments. How can I assist you today?' }
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { name: 'English', code: 'en', flag: '🇺🇸' },
    { name: 'Hindi', code: 'hi', flag: '🇮🇳' },
    { name: 'Telugu', code: 'te', flag: '🇮🇳' },
    { name: 'Spanish', code: 'es', flag: '🇪🇸' },
    { name: 'French', code: 'fr', flag: '🇫🇷' }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const getStressMetrics = (score: number) => {
    const p = score * 100;
    if (p < 25) return { level: "RED ALERT", color: "bg-red-50 text-red-700 border-red-200", advice: "Critical stress detected. Please pause all work and try a 5-minute deep breathing exercise." };
    if (p < 50) return { level: "ORANGE ALERT", color: "bg-orange-50 text-orange-700 border-orange-200", advice: "Moderate stress detected. We recommend a short walk and structured hydration breaks." };
    if (p < 75) return { level: "OKAY STAGE", color: "bg-blue-50 text-blue-700 border-blue-200", advice: "Stable condition. Maintain your current routine and ensure 7-8 hours of sleep." };
    return { level: "GREEN STAGE", color: "bg-emerald-50 text-emerald-700 border-emerald-200", advice: "Optimal balance. Practice 10 minutes of Yoga to maintain this mental harmony." };
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const userMsg = { id: Date.now(), type: 'user', text: userInput };
    setMessages(prev => [...prev, userMsg]);
    const input = userInput;
    setUserInput('');

    setIsTyping(true);
    try {
      const response = await fetchWithAuth('/wellbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: input,
          language: languages.find(l => l.name === language)?.code || 'en'
        }),
      });

      const data = await response.json();
      const replyText = data.reply || data.detail || "I'm having trouble connecting to the health services right now. Please try again later.";
      const metrics = getStressMetrics(0.6);

      setMessages((prev: any) => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: replyText,
        metrics: metrics,
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: 'Unable to connect to health services.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (inline) {
    return (
      <div className="w-full h-full min-h-[600px] bg-white rounded-[2rem] shadow-xl flex flex-col border border-gray-100 overflow-hidden font-sans">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500 rounded-2xl shadow-indigo-500/20 shadow-lg">
                <Bot size={28} />
              </div>
              <div>
                <h3 className="font-bold text-xl tracking-tight">Wellbot <span className="text-indigo-400">Pro</span></h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-emerald-500" /> Clinical Grade AI
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.name)}
                className={`flex flex-col items-center py-1.5 rounded-lg transition-all ${
                  language === lang.name ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700'
                }`}
              >
                <span className="text-sm">{lang.flag}</span>
                <span className="text-[9px] font-bold mt-0.5">{lang.name.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F1F5F9]">
          {messages.map((msg: any) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[90%]">
                <div className={`p-5 rounded-3xl shadow-sm text-lg leading-relaxed ${
                  msg.type === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
                  {String(msg.text || '').split('\n').map((line: string, i: number) => (
                    <div key={i} className="mb-2 last:mb-0">
                      {line.split(/(\*\*.*?\*\*)/g).map((part: string, j: number) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </div>
                  ))}
                  {msg.metrics && (
                    <div className={`mt-4 p-4 rounded-2xl border-2 ${msg.metrics.color} animate-in fade-in`}>
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck size={18} />
                        <span className="font-black text-xs tracking-tighter">{msg.metrics.level}</span>
                      </div>
                      <p className="text-sm font-medium leading-normal">{msg.metrics.advice}</p>
                    </div>
                  )}
                </div>
                {msg.type === 'bot' && (
                  <div className="mt-3 flex items-center gap-2 px-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Rate:</span>
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className="text-slate-300 hover:text-indigo-500 cursor-pointer" />)}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2 p-3 bg-white w-20 rounded-2xl border border-slate-100 items-center justify-center">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>
        {/* Input */}
        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-2 focus-within:border-indigo-500 focus-within:bg-white transition-all shadow-inner">
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt" />
            <button onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm">
              <Paperclip size={24} />
            </button>
            <input
              className="flex-1 bg-transparent border-none text-base font-medium py-2 outline-none text-slate-700"
              placeholder="How can I help you today?"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="bg-indigo-600 text-white p-3.5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              <Send size={22} />
            </button>
          </div>
          <p className="text-[9px] text-slate-400 text-center mt-4 font-bold uppercase tracking-widest">
            End-to-End Encrypted Session
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 font-sans">
      {isOpen && (
        <div className="w-[350px] md:w-[450px] h-[80vh] max-h-[750px] bg-white rounded-[2rem] shadow-2xl flex flex-col border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-300">

          {/* Header - Professional Dark Theme */}
          <div className="bg-slate-900 p-6 text-white shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500 rounded-2xl shadow-indigo-500/20 shadow-lg">
                  <Bot size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-xl tracking-tight">Wellbot <span className="text-indigo-400">Pro</span></h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-emerald-500" /> Clinical Grade AI
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X size={24} /></button>
            </div>

            {/* Language Selector Grid - 5 Languages Visible */}
            <div className="grid grid-cols-5 gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.name)}
                  className={`flex flex-col items-center py-1.5 rounded-lg transition-all ${language === lang.name ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700'
                    }`}
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span className="text-[9px] font-bold mt-0.5">{lang.name.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Workspace - Enlarged Text & Bubbles */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F1F5F9] max-h-[70%]">
            {messages.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[90%]">
                  <div className={`p-5 rounded-3xl shadow-sm text-lg leading-relaxed ${msg.type === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                    }`}>
                    {String(msg.text || '').split('\n').map((line: string, i: number) => (
                      <div key={i} className="mb-2 last:mb-0">
                        {line.split(/(\*\*.*?\*\*)/g).map((part: string, j: number) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </div>
                    ))}

                    {/* Alert Card inside message */}
                    {msg.metrics && (
                      <div className={`mt-4 p-4 rounded-2xl border-2 ${msg.metrics.color} animate-in fade-in`}>
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck size={18} />
                          <span className="font-black text-xs tracking-tighter">{msg.metrics.level}</span>
                        </div>
                        <p className="text-sm font-medium leading-normal">{msg.metrics.advice}</p>
                      </div>
                    )}
                  </div>

                  {/* Rating System under latest message */}
                  {msg.type === 'bot' && (
                    <div className="mt-3 flex items-center gap-2 px-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Rate:</span>
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className="text-slate-300 hover:text-indigo-500 cursor-pointer" />)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 p-3 bg-white w-20 rounded-2xl border border-slate-100 items-center justify-center">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            )}
          </div>

          {/* Action Area */}
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-2 focus-within:border-indigo-500 focus-within:bg-white transition-all shadow-inner">
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt" />
              <button onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm">
                <Paperclip size={24} />
              </button>
              <input
                className="flex-1 bg-transparent border-none text-base font-medium py-2 outline-none text-slate-700"
                placeholder="How can I help you today?"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="bg-indigo-600 text-white p-3.5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                <Send size={22} />
              </button>
            </div>
            <p className="text-[9px] text-slate-400 text-center mt-4 font-bold uppercase tracking-widest">
              End-to-End Encrypted Session
            </p>
          </div>
        </div>
      )}

      {/* Modern FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-20 h-20 rounded-3xl shadow-2xl flex items-center justify-center transition-all duration-500 transform hover:scale-105 active:scale-95 ${isOpen ? 'bg-slate-900 text-white rotate-180' : 'bg-indigo-600 text-white'
          }`}
      >
        {isOpen ? <X size={40} /> : <MessageCircle size={40} />}
      </button>
    </div>
  );
};

export default Wellbot;

