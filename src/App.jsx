import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config';
import { 
  LayoutDashboard, 
  FileText, 
  Share2, 
  MessageSquare, 
  Terminal, 
  LogOut, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  RefreshCw,
  CheckCircle2,
  Lock,
  Sun,
  Moon
} from 'lucide-react';
import LandingPage from './LandingPage';
import Auth from './Auth';
import ResumeAnalyzer from './ResumeAnalyzer';
import IdeaForgeCanvas from './IdeaForgeCanvas';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/auth" />;
  return children;
};

const Dashboard = ({ theme, onToggleTheme }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'resume', 'blueprint', 'chat'
  const [analysis, setAnalysis] = useState(() => {
    const saved = localStorage.getItem('forgetrack_analysis');
    return saved ? JSON.parse(saved) : null;
  });
  const [logs, setLogs] = useState([]);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('forgetrack_analysis');
    navigate('/');
  };

  const handleAnalysisComplete = (newAnalysis) => {
    setAnalysis(newAnalysis);
    localStorage.setItem('forgetrack_analysis', JSON.stringify(newAnalysis));
    fetchLogs(); // refresh logs when resume is analyzed
  };

  const fetchLogs = async () => {
    setIsRefreshingLogs(true);
    try {
      const res = await fetch(`${API_BASE_URL}/audit/logs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setIsRefreshingLogs(false);
    }
  };

  // Poll logs in background every 5 seconds for live telemetry feel
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  // Listen to the open-chat-panel event to switch tabs to Resume Analyzer & Chat
  useEffect(() => {
    const handleOpenChat = () => {
      setActiveTab('resume');
    };
    window.addEventListener('open-chat-panel', handleOpenChat);
    return () => window.removeEventListener('open-chat-panel', handleOpenChat);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07070a] text-slate-900 dark:text-gray-100 flex font-sans selection:bg-indigo-500/30 transition-colors duration-200">
      
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 dark:bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/5 dark:bg-cyan-600/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white/80 dark:bg-[#0d0d15]/80 border-r border-slate-200 dark:border-white/5 flex flex-col z-20 backdrop-blur-md sticky top-0 h-screen transition-colors duration-200">
        <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-wide block">ForgeTrack</span>
            <span className="text-[10px] text-slate-500 dark:text-gray-500 tracking-widest uppercase font-semibold">AI Testing Suite</span>
          </div>
        </div>

        {/* Tab Buttons */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'overview' 
                ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm dark:shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]' 
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/[0.02] border border-transparent'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Overview & Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('resume')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'resume' 
                ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm dark:shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]' 
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/[0.02] border border-transparent'
            }`}
          >
            <FileText className="w-5 h-5" />
            <div className="flex-1 flex justify-between items-center">
              <span>Resume Analyzer</span>
              {analysis ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab('blueprint')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'blueprint' 
                ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-sm dark:shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]' 
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/[0.02] border border-transparent'
            }`}
          >
            <Share2 className="w-5 h-5" />
            <span>Blueprint Canvas</span>
          </button>


        </nav>

        {/* User profile & logout */}
        <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-[#0a0a0f]/50 transition-colors duration-200">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-white hover:bg-red-500/5 dark:hover:bg-red-500/10 hover:border-red-500/10 dark:hover:border-red-500/20 border border-transparent transition-all"
          >
            <span className="flex items-center space-x-2">
              <LogOut className="w-4 h-4 text-red-500 dark:text-red-400" />
              <span>Sign Out</span>
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col z-10 overflow-x-hidden relative h-screen transition-colors duration-200">
        
        {/* Navigation Top Header */}
        <header className="h-20 bg-slate-50/40 dark:bg-[#07070a]/40 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-8 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white capitalize">{activeTab.replace('-', ' ')}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {analysis && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resume Loaded</span>
              </div>
            )}
            <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span className="flex w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse"></span>
              <span>Shadow Auditor Active</span>
            </div>
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white bg-white dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all cursor-pointer shadow-sm"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Main Workspace Frame */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-6xl">
              
              {/* Welcome Banner */}
              <div className="relative overflow-hidden bg-gradient-to-r from-indigo-50/40 via-purple-50/20 to-slate-100/30 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-950/30 border border-indigo-100 dark:border-indigo-500/10 rounded-3xl p-8 shadow-sm dark:shadow-xl transition-all">
                <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold px-3 py-1 rounded-full uppercase tracking-wider">Dashboard Overview</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Welcome to your ForgeTrack Sandbox</h2>
                  <p className="text-slate-600 dark:text-gray-400 max-w-2xl text-base leading-relaxed">
                    This playground lets you test the core ForgeTrack telemetry flow. Analyze your resume, plan project designs in the Blueprint Flowchart, click "I'm Stuck" on tasks to fire events, and see how the AI dynamically audits and guides you.
                  </p>
                </div>
              </div>

              {/* Status & Telemetry Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Status Column */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white dark:bg-[#0e0e16]/80 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-lg transition-all">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4 flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                      <span>Sandbox State</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl">
                        <span className="text-slate-500 dark:text-gray-400">Resume Uploaded:</span>
                        {analysis ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center"><CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600 dark:text-emerald-400" /> Yes</span>
                        ) : (
                          <span className="text-amber-500 font-semibold flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> Missing</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl">
                        <span className="text-slate-500 dark:text-gray-400">Skills Detected:</span>
                        <span className="text-slate-900 dark:text-white font-bold">{analysis?.skills_detected?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl">
                        <span className="text-slate-500 dark:text-gray-400">Critical Gaps:</span>
                        <span className={`font-bold ${analysis?.critical_gaps?.length > 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-gray-400'}`}>
                          {analysis?.critical_gaps?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#0e0e16]/80 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-lg transition-all">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-3 flex items-center space-x-2">
                      <HelpCircle className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                      <span>Testing Guide</span>
                    </h3>
                    <ol className="text-sm text-slate-600 dark:text-gray-400 space-y-3 pl-4 list-decimal leading-relaxed">
                      <li>Go to <strong>Resume Analyzer</strong> and upload a PDF resume.</li>
                      <li>Go to <strong>Blueprint Canvas</strong>, describe a project, and hit "Forge Blueprint".</li>
                      <li>Click on flowchart nodes, click <strong>"I'm Stuck"</strong>.</li>
                      <li>Go to <strong>AI Assistant Chat</strong> and ask a question. Notice how the AI immediately intercepts with personalized guidelines!</li>
                      <li>Observe live logs in the telemetry timeline.</li>
                    </ol>
                  </div>
                </div>

                {/* Shadow Auditor Live Telemetry Timeline */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0e0e16]/80 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-lg flex flex-col h-[480px] transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center space-x-2">
                      <Terminal className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                      <span>Shadow Auditor Telemetry Feed</span>
                    </h3>
                    <button 
                      onClick={fetchLogs} 
                      disabled={isRefreshingLogs}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshingLogs ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {logs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-gray-500 space-y-2">
                        <Terminal className="w-8 h-8 text-slate-300 dark:text-gray-600" />
                        <p className="text-sm">No telemetry events logged yet.</p>
                        <p className="text-xs text-slate-400 dark:text-gray-600">Interactions will appear here in real-time.</p>
                      </div>
                    ) : (
                      logs.map((log) => {
                        let badgeBg = 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20';
                        if (log.event_type === 'task_stuck_clicked') {
                          badgeBg = 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20 shadow-sm dark:shadow-[0_0_8px_rgba(239,68,68,0.1)]';
                        } else if (log.event_type === 'view_node') {
                          badgeBg = 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20';
                        } else if (log.event_type.includes('complete') || log.event_type.includes('signup')) {
                          badgeBg = 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20';
                        }
                        
                        return (
                          <div key={log.id} className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.01] dark:hover:bg-white/[0.02] border border-slate-150 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 rounded-xl transition-all flex items-start space-x-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badgeBg} tracking-wide uppercase shrink-0 mt-0.5`}>
                              {log.event_type.replace('_', ' ')}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-800 dark:text-gray-200 font-medium whitespace-pre-wrap">
                                {log.metadata_json?.title ? `Viewed node: ${log.metadata_json.title}` : null}
                                {log.metadata_json?.node_data?.label ? `Stuck on: ${log.metadata_json.node_data.label.split('\n')[0]}` : null}
                                {!log.metadata_json?.title && !log.metadata_json?.node_data?.label ? JSON.stringify(log.metadata_json) : null}
                              </p>
                              <span className="text-[10px] text-slate-400 dark:text-gray-500 block mt-1.5 font-mono">
                                {new Date(log.timestamp).toLocaleTimeString()} · ID: {log.id}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {activeTab === 'resume' && (
            <div className="opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]">
              <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(8px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
              <ResumeAnalyzer onAnalysisComplete={handleAnalysisComplete} analysisData={analysis} theme={theme} />
            </div>
          )}

          {activeTab === 'blueprint' && (
            <div className="opacity-0 animate-[fadeIn_0.3s_ease-out_forwards] h-full flex flex-col">
              <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(8px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
              <IdeaForgeCanvas criticalGaps={analysis?.critical_gaps || []} theme={theme} />
            </div>
          )}



        </div>

      </main>
    </div>
  );
};

const AppContent = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<LandingPage theme={theme} onToggleTheme={toggleTheme} onNavigateToAuth={(type) => navigate('/auth', { state: { type } })} />} />
      <Route path="/auth" element={<Auth theme={theme} onToggleTheme={toggleTheme} onAuthenticated={() => navigate('/dashboard')} />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard theme={theme} onToggleTheme={toggleTheme} /></ProtectedRoute>} />
    </Routes>
  );
};

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <AppContent theme={theme} toggleTheme={toggleTheme} />
    </Router>
  );
}

export default App;
