import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  ExternalLink,
  ChevronRight,
  Clipboard,
  History,
  ShieldQuestion,
  Loader2,
  XCircle,
  Sun,
  Moon,
  ArrowRight,
  Shield
} from 'lucide-react';

const apiKey = ""; // Managed by environment
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

const App = () => {
  const [jobText, setJobText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const systemPrompt = `You are an expert Cybersecurity Analyst specializing in recruitment fraud. 
  Your task is to analyze the provided job description and determine if it's a "Scam" or "Legitimate".
  
  Look for these Red Flags:
  1. Unrealistic Salary: High pay for simple tasks.
  2. Vague Job Description: Lack of specific duties or requirements.
  3. Poor Grammar/Spelling: Unprofessional language.
  4. Suspicious Contact: Use of personal emails (gmail/yahoo) for high-level roles.
  5. Sense of Urgency: "Immediate start", "No experience needed".
  6. Request for Payment: Asking for fees for "training", "equipment", or "background checks".
  
  Provide your response in structured JSON format with:
  - status: "Scam", "Suspicious", or "Legitimate"
  - risk_score: (0-100, where 100 is definitely a scam)
  - primary_reason: A one-sentence summary.
  - red_flags: Array of specific indicators found.
  - recommendations: Array of advice for the candidate.`;

  const analyzeJob = async () => {
    if (!jobText || jobText.length < 50) {
      setError("Please provide a more detailed job description (at least 50 characters).");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const payload = {
      contents: [{ parts: [{ text: `Analyze this job description: \n\n${jobText}` }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
      }
    };

    let retries = 0;
    const maxRetries = 5;

    const makeRequest = async (retryCount) => {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        );

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (analysisText) {
          const parsed = JSON.parse(analysisText);
          setResult(parsed);
          setHistory(prev => [{
            id: Date.now(),
            title: jobText.substring(0, 30) + '...',
            status: parsed.status,
            date: new Date().toLocaleTimeString()
          }, ...prev].slice(0, 5));
        }
      } catch (err) {
        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => makeRequest(retryCount + 1), delay);
        } else {
          setError("Unable to complete analysis. Please try again later.");
        }
      } finally {
        setIsAnalyzing(false);
      }
    };

    makeRequest(0);
  };

  const clearInput = () => {
    setJobText('');
    setResult(null);
    setError(null);
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        
        .jobguard-app {
          margin: 0;
          padding: 0;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: #fdfdfe;
          color: #0f172a;
        }

        .dark .jobguard-app {
          background: #02040a;
          color: #f8fafc;
        }

        /* Ambient Backgrounds */
        .ambient-glow {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 100vh;
          pointer-events: none;
          z-index: 0;
          background: 
            radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(37, 99, 235, 0.05) 0%, transparent 40%);
        }

        .max-w-7xl { max-width: 1400px; margin: auto; width: 100%; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        
        /* Navigation */
        .nav-bar {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.8);
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
          height: 4.5rem;
          display: flex;
          align-items: center;
        }
        .dark .nav-bar {
          background: rgba(2, 4, 10, 0.8);
          border-color: rgba(30, 41, 59, 0.8);
        }

        /* Grid Layout */
        .app-grid {
          display: grid;
          gap: 2rem;
          padding: 2rem 0;
          position: relative;
          z-index: 1;
        }

        @media (min-width: 1024px) {
          .app-grid { grid-template-columns: 1fr 380px; align-items: start; }
        }

        /* Cards */
        .glass-card {
          border-radius: 1.5rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .dark .glass-card {
          background: #0b1120;
          border-color: #1e293b;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
        }

        /* Interactive Elements */
        .input-wrapper {
          position: relative;
          background: #f8fafc;
          border-radius: 1rem;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }
        .dark .input-wrapper { background: #131b2e; }
        .input-wrapper:focus-within {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .dark .input-wrapper:focus-within { background: #0b1120; }

        .input-area {
          width: 100%;
          min-height: 320px;
          padding: 1.5rem;
          background: transparent;
          border: none;
          color: inherit;
          font-family: inherit;
          font-size: 1rem;
          line-height: 1.6;
          resize: vertical;
          outline: none;
        }

        .btn-action {
          padding: 1rem 2rem;
          border-radius: 1rem;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1rem;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
          box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
        }
        .btn-primary:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 15px 25px -5px rgba(37, 99, 235, 0.5);
        }

        /* Result Sections */
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.5);
          margin-bottom: 2rem;
        }

        .risk-meter {
          height: 8px;
          border-radius: 4px;
          background: #e2e8f0;
          margin-top: 1rem;
          overflow: hidden;
        }
        .dark .risk-meter { background: #1e293b; }

        /* Animation */
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .analyzing-text { animation: pulse-slow 2s infinite; }
      `}</style>

      <div className={`jobguard-app ${darkMode ? 'dark' : ''}`}>
        <div className="ambient-glow" />
        
        <nav className="nav-bar">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div style={{
                background: 'linear-gradient(135deg, #2563eb, #60a5fa)', 
                padding: '0.6rem', 
                borderRadius: '0.75rem',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}>
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight block leading-none">JobGuard</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-500">Security Engine</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className="btn-toggle" style={{
                width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.5)', background: 'transparent'
              }}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button style={{
                padding: '0.6rem 1.25rem', borderRadius: '12px', 
                background: darkMode ? '#f8fafc' : '#0f172a', 
                color: darkMode ? '#0f172a' : '#f8fafc',
                fontWeight: '600', fontSize: '0.875rem', border: 'none'
              }}>
                Verify Portal
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 flex-grow">
          <div className="app-grid">
            
            {/* Main Content Area */}
            <div className="space-y-8">
              <header>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Diagnostic Scan</h1>
                <p style={{color: '#64748b'}} className="text-lg">Paste job details below to evaluate authenticity and safety risks.</p>
              </header>

              <section className="glass-card" style={{padding: '1.5rem'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 font-semibold">
                    <Search className="w-5 h-5 text-blue-500" />
                    <span>Raw Input Data</span>
                  </div>
                  {jobText && (
                    <button onClick={clearInput} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">
                      <XCircle className="w-4 h-4" /> Reset
                    </button>
                  )}
                </div>

                <div className="input-wrapper">
                  <textarea
                    className="input-area"
                    placeholder="Enter or paste the job description, company name, or contact details here..."
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                  />
                </div>

                {error && (
                  <div style={{
                    marginTop: '1rem', padding: '1rem', borderRadius: '0.75rem', 
                    background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', 
                    fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}>
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {error}
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <button 
                    onClick={analyzeJob} 
                    disabled={isAnalyzing || !jobText} 
                    className="btn-action btn-primary"
                    style={{width: 'auto', minWidth: '220px'}}
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="animate-spin w-5 h-5" /> <span className="analyzing-text">Analyzing Metadata...</span></>
                    ) : (
                      <><Shield className="w-5 h-5" /> Start Security Scan</>
                    )}
                  </button>
                </div>
              </section>

              {result && (
                <section className="glass-card" style={{padding: '2.5rem', animation: 'fadeIn 0.5s ease-out'}}>
                  <div className="result-header">
                    <div className="flex items-center gap-5">
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '1.25rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: result.status === 'Scam' ? 'rgba(239, 68, 68, 0.1)' : 
                                    result.status === 'Suspicious' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: result.status === 'Scam' ? '#ef4444' : 
                               result.status === 'Suspicious' ? '#f59e0b' : '#10b981'
                      }}>
                        {result.status === 'Scam' ? <ShieldAlert size={32} /> : 
                         result.status === 'Suspicious' ? <AlertTriangle size={32} /> : <ShieldCheck size={32} />}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">{result.status} Found</h2>
                        <div className="risk-meter">
                          <div style={{
                            width: `${result.risk_score}%`, height: '100%',
                            background: result.status === 'Scam' ? '#ef4444' : 
                                        result.status === 'Suspicious' ? '#f59e0b' : '#10b981',
                            transition: 'width 1s ease-out'
                          }} />
                        </div>
                      </div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <span className="text-4xl font-black">{100 - result.risk_score}</span>
                      <span className="text-lg font-bold text-slate-400">/100</span>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Trust Score</p>
                    </div>
                  </div>

                  <div style={{
                    padding: '1.5rem', borderRadius: '1rem', marginBottom: '2.5rem',
                    background: darkMode ? '#161e2e' : '#f8fafc',
                    borderLeft: `4px solid ${result.status === 'Scam' ? '#ef4444' : '#3b82f6'}`,
                    fontSize: '1.1rem', lineHeight: '1.6', color: darkMode ? '#cbd5e1' : '#334155'
                  }}>
                    "{result.primary_reason}"
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-500" /> Key Red Flags
                      </h3>
                      <div className="space-y-3">
                        {result.red_flags.map((flag, idx) => (
                          <div key={idx} style={{
                            padding: '1rem', borderRadius: '0.75rem', fontSize: '0.9rem',
                            background: darkMode ? 'rgba(239, 68, 68, 0.05)' : '#fffafa',
                            border: '1px solid rgba(239, 68, 68, 0.1)', display: 'flex', gap: '0.75rem'
                          }}>
                            <span className="text-red-500 font-bold">•</span> {flag}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" /> Safe Steps
                      </h3>
                      <div className="space-y-3">
                        {result.recommendations.map((rec, idx) => (
                          <div key={idx} style={{
                            padding: '1rem', borderRadius: '0.75rem', fontSize: '0.9rem',
                            background: darkMode ? 'rgba(16, 185, 129, 0.05)' : '#f0fdf4',
                            border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', gap: '0.75rem'
                          }}>
                            <ChevronRight size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar Controls */}
            <aside className="space-y-8">
              <div className="glass-card" style={{
                background: 'linear-gradient(135deg, #0f172a, #1e293b)', 
                color: 'white', padding: '2rem', border: 'none'
              }}>
                <div className="flex items-center gap-2 mb-6">
                  <ShieldQuestion className="text-blue-400 w-6 h-6" />
                  <h3 className="text-lg font-bold">Security Tips</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div style={{background: 'rgba(255,255,255,0.1)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>1</div>
                    <p className="text-sm text-slate-300">Always verify company emails end with the official domain name, not public providers.</p>
                  </div>
                  <div className="flex gap-4">
                    <div style={{background: 'rgba(255,255,255,0.1)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>2</div>
                    <p className="text-sm text-slate-300">Legitimate employers never ask for payment, processing fees, or crypto transfers.</p>
                  </div>
                  <div className="flex gap-4">
                    <div style={{background: 'rgba(255,255,255,0.1)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>3</div>
                    <p className="text-sm text-slate-300">Question interviews done exclusively through chat apps like WhatsApp or Telegram.</p>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{padding: '1.5rem'}}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2"><History className="w-4 h-4" /> Scan Log</div>
                  <span style={{background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: '4px'}} className="dark:bg-slate-800">{history.length}</span>
                </h3>
                {history.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">No recent activity detected.</p>
                ) : (
                  <div className="space-y-3">
                    {history.map(item => (
                      <div key={item.id} style={{
                        padding: '0.875rem', borderRadius: '1rem', border: '1px solid rgba(226, 232, 240, 0.5)',
                        display: 'flex', alignItems: 'center', justifyBetween: 'space-between', transition: 'all 0.2s'
                      }} className="hover:border-blue-200 dark:hover:border-blue-900 group">
                        <div className="flex-grow min-w-0 pr-3">
                          <p className="text-xs font-bold truncate mb-1">{item.title}</p>
                          <p className="text-[10px] text-slate-400">{item.date}</p>
                        </div>
                        <span style={{
                          fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '6px',
                          background: item.status === 'Scam' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: item.status === 'Scam' ? '#ef4444' : '#10b981'
                        }}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-card" style={{padding: '1.5rem', background: 'rgba(59, 130, 246, 0.03)', borderStyle: 'dashed'}}>
                <h3 className="text-sm font-bold mb-4">Manual Cross-Check</h3>
                <div className="grid grid-cols-1 gap-2">
                  <button style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0',
                    fontSize: '0.75rem', fontWeight: '600', color: '#334155'
                  }} className="dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200">
                    <span>Glassdoor Reviews</span> <ExternalLink size={14} className="text-blue-500" />
                  </button>
                  <button style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0',
                    fontSize: '0.75rem', fontWeight: '600', color: '#334155'
                  }} className="dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200">
                    <span>Official Registry</span> <ExternalLink size={14} className="text-blue-500" />
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </main>

        <footer className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6" style={{borderTop: '1px solid rgba(226, 232, 240, 0.5)', marginTop: '4rem'}}>
          <div className="flex items-center gap-2">
            <Shield className="text-slate-300 w-5 h-5" />
            <span className="text-sm font-bold text-slate-400">JobGuard Engine v2.4</span>
          </div>
          <div className="flex gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Security Standards</a>
            <a href="#" className="hover:text-blue-500 transition-colors">API Docs</a>
          </div>
          <p className="text-xs text-slate-400">© 2025 JobGuard Security. Global Recruitment Protection.</p>
        </footer>
      </div>
    </>
  );
};

export default App;