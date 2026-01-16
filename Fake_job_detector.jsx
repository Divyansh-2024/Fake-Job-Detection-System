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
  Moon
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

  // Toggle dark mode by adding/removing class from the root element
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
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans`}>
      {/* Header */}
      <nav className={`border-b sticky top-0 z-10 transition-colors duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              JobGuard <span className="text-blue-600">Security</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-all active:scale-95 ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="#" className={`transition-colors ${darkMode ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'}`}>How it works</a>
              <button className={`px-4 py-2 rounded-full transition-all ${darkMode ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                Verify Company
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <section className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                Analyze Job Posting
              </h2>
              <button 
                onClick={clearInput}
                className={`text-xs flex items-center gap-1 transition-colors ${darkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
              >
                <XCircle className="w-3 h-3" /> Clear
              </button>
            </div>
            
            <textarea
              className={`w-full h-64 p-4 rounded-xl border transition-all outline-none resize-none text-slate-700 leading-relaxed ${
                darkMode 
                ? 'bg-slate-800 border-slate-700 text-slate-200 focus:bg-slate-800/50 focus:ring-blue-500/50' 
                : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:ring-blue-500'
              } focus:ring-2 focus:border-transparent`}
              placeholder="Paste the full job description here, including company details and requirements..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={analyzeJob}
              disabled={isAnalyzing || !jobText}
              className={`w-full mt-4 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 
                ${isAnalyzing ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Running Security Diagnostics...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5" />
                  Scan for Fraud
                </>
              )}
            </button>
          </section>

          {result && (
            <section className={`rounded-2xl p-6 shadow-md border animate-in zoom-in-95 duration-300 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${
                    result.status === 'Scam' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                    result.status === 'Suspicious' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 
                    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {result.status === 'Scam' ? <ShieldAlert /> : result.status === 'Suspicious' ? <AlertTriangle /> : <ShieldCheck />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{result.status} Result</h3>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      System Confidence: {result.risk_score}% risk probability
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{100 - result.risk_score}%</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Safety Score</div>
                </div>
              </div>

              <div className={`rounded-xl p-4 mb-6 border-l-4 italic transition-colors ${
                darkMode ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-700'
              }`}>
                "{result.primary_reason}"
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-sm uppercase text-slate-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" /> Detected Red Flags
                  </h4>
                  <ul className="space-y-2">
                    {result.red_flags.map((flag, idx) => (
                      <li key={idx} className={`flex gap-2 text-sm p-2 rounded border transition-colors ${
                        darkMode ? 'text-slate-300 bg-red-900/10 border-red-900/30' : 'text-slate-600 bg-red-50/50 border-red-100'
                      }`}>
                        <span className="text-red-500 font-bold">•</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase text-slate-400 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" /> Recommended Actions
                  </h4>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className={`flex gap-2 text-sm p-2 rounded border transition-colors ${
                        darkMode ? 'text-slate-300 bg-blue-900/10 border-blue-900/30' : 'text-slate-600 bg-blue-50/50 border-blue-100'
                      }`}>
                        <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShieldQuestion className="text-blue-400" /> Pro Tips
              </h3>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex gap-3">
                  <div className="bg-slate-800 p-1 rounded h-fit">01</div>
                  <p>Check if the recruiter's email domain matches the official company website.</p>
                </li>
                <li className="flex gap-3">
                  <div className="bg-slate-800 p-1 rounded h-fit">02</div>
                  <p>Real companies never ask for payment to start a job or for interview equipment.</p>
                </li>
                <li className="flex gap-3">
                  <div className="bg-slate-800 p-1 rounded h-fit">03</div>
                  <p>Beware of interviews conducted solely via text-based apps like Telegram or WhatsApp.</p>
                </li>
              </ul>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          </div>

          <div className={`rounded-2xl p-6 shadow-sm border transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 flex items-center gap-2">
              <History className="w-4 h-4" /> Recent Scans
            </h3>
            {history.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No recent scans yet.</p>
            ) : (
              <div className="space-y-3">
                {history.map(item => (
                  <div key={item.id} className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-default border border-transparent ${
                    darkMode ? 'hover:bg-slate-800 hover:border-slate-700' : 'hover:bg-slate-50 hover:border-slate-100'
                  }`}>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium truncate w-32">{item.title}</span>
                      <span className="text-[10px] text-slate-400">{item.date}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      item.status === 'Scam' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                      item.status === 'Suspicious' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 
                      'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`rounded-2xl p-6 border transition-colors ${darkMode ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50 border-blue-100'}`}>
            <h3 className={`text-sm font-bold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-900'}`}>Manual Verification</h3>
            <p className={`text-xs mb-4 ${darkMode ? 'text-blue-300/70' : 'text-blue-700'}`}>Can't decide? Cross-reference the company on these platforms:</p>
            <div className="grid grid-cols-2 gap-2">
              <button className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-colors ${
                darkMode ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-100'
              }`}>
                <ExternalLink className="w-3 h-3" /> Glassdoor
              </button>
              <button className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-colors ${
                darkMode ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-100'
              }`}>
                <ExternalLink className="w-3 h-3" /> LinkedIn
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-400 text-sm">
        <div className="flex items-center justify-center gap-4 mb-4">
          <a href="#" className="hover:text-blue-600 underline">Privacy Policy</a>
          <a href="#" className="hover:text-blue-600 underline">Terms of Service</a>
          <a href="#" className="hover:text-blue-600 underline">Report a Scam</a>
        </div>
        <p>© 2025 JobGuard Security Engine. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;