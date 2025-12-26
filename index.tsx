// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Copy, Gift, Send, Heart, Check, Eye, Share2, MailOpen, Sparkles, ArrowLeft } from 'lucide-react';

// --- Types ---
type Theme = 'rose' | 'tropical' | 'lavender';

interface ThemeConfig {
  bg: string;
  accent: string;
  secondary: string;
  name: string;
}

const THEMES: Record<Theme, ThemeConfig> = {
  rose: {
    name: 'Classic Rose',
    bg: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=2000',
    accent: 'rose',
    secondary: '#fff1f2'
  },
  tropical: {
    name: 'Tropical Brights',
    bg: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=2000',
    accent: 'orange',
    secondary: '#fff7ed'
  },
  lavender: {
    name: 'Soft Lavender',
    bg: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=2000',
    accent: 'purple',
    secondary: '#f5f3ff'
  }
};

// --- Helpers ---
// Using a robust UTF-8 safe base64 encoding
const encodeData = (str: string) => {
  try {
    const bytes = new TextEncoder().encode(str);
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
    return btoa(binString);
  } catch (e) {
    return "";
  }
};

const decodeData = (str: string) => {
  try {
    if (!str) return "";
    // Handle potential URL decoding issues
    const normalized = decodeURIComponent(str);
    const binString = atob(normalized);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
    return new TextDecoder().decode(bytes);
  } catch (e) {
    return "";
  }
};

const App = () => {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState<Theme>('rose');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'card'>('editor');
  const [isOpened, setIsOpened] = useState(false);
  const [cardData, setCardData] = useState({ name: '', msg: '', theme: 'rose' as Theme });
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    // Check URL parameters on mount
    const params = new URLSearchParams(window.location.search);
    const n = params.get('n');
    const m = params.get('m');
    const t = params.get('t') as Theme || 'rose';

    if (n && m) {
      setCardData({
        name: decodeData(n),
        msg: decodeData(m),
        theme: t in THEMES ? t : 'rose'
      });
      setViewMode('card');
    }
  }, []);

  const handleOpenCard = () => {
    setIsOpened(true);
    triggerConfetti();
  };

  const triggerConfetti = () => {
    // @ts-ignore
    if (typeof confetti !== 'undefined') {
      // @ts-ignore
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#fff1f2']
      });
      
      setTimeout(() => {
        // @ts-ignore
        confetti({
          particleCount: 100,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#f43f5e', '#fb7185']
        });
        // @ts-ignore
        confetti({
          particleCount: 100,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#f43f5e', '#fb7185']
        });
      }, 400);
    }
  };

  const handleGenerate = () => {
    if (!recipient || !message) return;

    try {
      // 1. Get the current URL without any parameters (clean base)
      const baseUrl = window.location.href.split('?')[0].split('#')[0];
      
      // 2. Build the query string using the native API
      const params = new URLSearchParams();
      params.set('n', encodeData(recipient));
      params.set('m', encodeData(message));
      params.set('t', theme);

      // 3. Combine them safely
      const finalUrl = `${baseUrl}?${params.toString()}`;
      setGeneratedUrl(finalUrl);
    } catch (err) {
      console.error("URL Generation failed:", err);
      // Absolute fallback
      const fallbackBase = window.location.origin + window.location.pathname;
      setGeneratedUrl(`${fallbackBase}?n=${encodeURIComponent(encodeData(recipient))}&m=${encodeURIComponent(encodeData(message))}&t=${theme}`);
    }
  };

  const copyToClipboard = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsapp = () => {
    if (!generatedUrl) return;
    const text = `Hey ${recipient}, I made a special birthday card for you! Open it here: ${generatedUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSeePreview = () => {
    setCardData({
      name: recipient,
      msg: message,
      theme: theme
    });
    setIsPreview(true);
    setViewMode('card');
  };

  const exitPreview = () => {
    if (isPreview) {
      setViewMode('editor');
      setIsPreview(false);
      setIsOpened(false);
    } else {
      // Clean URL back to editor
      const baseUrl = window.location.href.split('?')[0].split('#')[0];
      window.history.pushState({}, '', baseUrl);
      
      setViewMode('editor');
      setIsOpened(false);
      setRecipient('');
      setMessage('');
      setGeneratedUrl('');
    }
  };

  if (viewMode === 'card') {
    const currentTheme = THEMES[cardData.theme];
    const accentClass = `text-${currentTheme.accent}-500`;

    return (
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-900">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-[20s] scale-110 parallax-bg opacity-40 blur-[2px]"
          style={{ backgroundImage: `url("${currentTheme.bg}")` }}
        />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className={`absolute animate-pulse opacity-20 bg-${currentTheme.accent}-300 rounded-full blur-xl`}
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 5 + 3}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {!isOpened ? (
          <div className="relative z-20 animate-card">
            <button 
              onClick={handleOpenCard}
              className="group relative flex flex-col items-center gap-6"
            >
              <div className="relative w-64 h-48 bg-white rounded-lg shadow-2xl flex items-center justify-center border-b-4 border-slate-200 group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-slate-50 opacity-50" />
                <div className="absolute inset-x-0 bottom-0 h-1 bg-rose-400" />
                <MailOpen className="w-16 h-16 text-rose-500 relative z-10 animate-bounce" />
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-rose-100 rounded-full blur-2xl opacity-50" />
              </div>
              <div className="text-center">
                <p className="text-white text-xl font-playfair italic mb-2">A surprise for {cardData.name || 'you'}...</p>
                <span className="px-6 py-2 bg-rose-500 text-white rounded-full text-sm font-bold shadow-lg shadow-rose-900/40 animate-pulse uppercase tracking-widest">
                  TAP TO OPEN
                </span>
              </div>
            </button>
          </div>
        ) : (
          <div className="relative z-20 w-full max-w-2xl px-6 animate-card">
            <div className="glass p-12 md:p-16 rounded-[3rem] shadow-2xl text-center border-white/50 border-2 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6">
                <Sparkles className={`w-8 h-8 opacity-20 ${accentClass}`} />
              </div>
              
              <div className="mb-10">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce bg-${currentTheme.accent}-50`}>
                  <Gift className={`w-12 h-12 ${accentClass}`} />
                </div>
              </div>

              <h1 className="font-playfair text-5xl md:text-7xl text-slate-800 mb-8 leading-tight tracking-tight">
                Happy Birthday, <br/>
                <span className={`${accentClass} italic drop-shadow-sm`}>{cardData.name}!</span>
              </h1>

              <div className={`w-20 h-1 mx-auto mb-10 rounded-full bg-${currentTheme.accent}-200`}></div>

              <p className="text-2xl md:text-3xl text-slate-700 leading-relaxed font-light font-playfair italic whitespace-pre-wrap">
                "{cardData.msg}"
              </p>

              <div className="mt-20 flex flex-col items-center gap-6">
                <button 
                  onClick={exitPreview}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white/60 hover:bg-white transition-all rounded-full text-sm font-bold text-slate-600 shadow-sm border border-white group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  {isPreview ? 'Back to Editor' : 'Make Someone Else\'s Day'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50 flex items-center justify-center overflow-auto">
      <div className="max-w-lg w-full bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 md:p-12 border border-slate-100">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl mb-6 shadow-sm border border-rose-100">
            <Heart className="w-10 h-10 fill-rose-500/10" />
          </div>
          <h2 className="text-4xl font-black text-slate-800 font-playfair tracking-tight">Card Studio</h2>
          <p className="text-slate-400 mt-2 font-medium">Create a beautiful digital surprise.</p>
        </div>

        <div className="space-y-8">
          <div className="space-y-5">
            <div className="group">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">The Birthday Star</label>
              <input
                type="text"
                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 focus:border-rose-400 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white text-lg font-medium"
                placeholder="Name"
                value={recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                  setGeneratedUrl('');
                }}
              />
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Your Message</label>
              <textarea
                className="w-full px-6 py-5 rounded-2xl border-2 border-slate-100 focus:border-rose-400 outline-none transition-all h-40 resize-none text-slate-700 bg-slate-50 focus:bg-white text-lg leading-relaxed"
                placeholder="Write your wishes..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setGeneratedUrl('');
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Choose an Aesthetic</label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(THEMES) as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTheme(t);
                    setGeneratedUrl('');
                  }}
                  className={`relative p-1 rounded-2xl border-2 transition-all ${theme === t ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-100 opacity-60 hover:opacity-100'}`}
                >
                  <div className="h-16 rounded-xl bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url(${THEMES[t].bg})` }}>
                    <div className="w-full h-full bg-black/10 flex items-center justify-center">
                      {theme === t && <Check className="w-5 h-5 text-white" />}
                    </div>
                  </div>
                  <span className="block mt-2 text-[10px] font-bold text-slate-600 uppercase tracking-tighter truncate">{THEMES[t].name}</span>
                </button>
              ))}
            </div>
          </div>

          {!generatedUrl ? (
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleGenerate}
                disabled={!recipient || !message}
                className="bg-slate-900 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl shadow-slate-200"
              >
                <Send className="w-4 h-4" />
                Generate Link
              </button>
            </div>
          ) : (
            <div className="animate-card space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center gap-4">
                <div className="flex-1 truncate text-xs text-slate-400 font-mono pl-1">
                  {generatedUrl}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-5 py-3 bg-white text-slate-900 rounded-xl hover:bg-slate-50 transition-all border border-slate-200 font-bold text-sm shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={handleSeePreview}
                  className="flex flex-col items-center justify-center gap-3 p-5 bg-rose-50 text-rose-600 rounded-[1.5rem] hover:bg-rose-100 transition-all font-bold text-xs"
                >
                  <Eye className="w-6 h-6" />
                  PREVIEW CARD
                </button>
                <button
                  onClick={shareOnWhatsapp}
                  className="flex flex-col items-center justify-center gap-3 p-5 bg-green-50 text-green-600 rounded-[1.5rem] hover:bg-green-100 transition-all font-bold text-xs"
                >
                  <Share2 className="w-6 h-6" />
                  SEND WHATSAPP
                </button>
              </div>

              <button 
                onClick={() => setGeneratedUrl('')}
                className="w-full mt-4 text-[10px] font-black text-slate-300 hover:text-rose-400 transition-colors uppercase tracking-[0.2em] text-center"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);