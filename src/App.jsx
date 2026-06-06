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

  const handleGenerateFirstEvent = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/audit/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          event_type: 'sandbox_initialized',
          metadata_json: {
            title: 'First Telemetry Event Triggered',
            message: 'Manually simulated sandbox telemetry check passed.',
            client: 'ForgeTrack AI Sandbox Dashboard'
          }
        })
      });
      if (res.ok) {
        fetchLogs();
      }
    } catch (err) {
      console.error('Failed to generate test event:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0F172A] w-full flex justify-center items-stretch font-sans selection:bg-indigo-500/30 transition-colors duration-200">
      
      <div className="w-full max-w-[1440px] flex border-x border-[#E5E7EB] dark:border-[#334155] bg-[#F3F4F6] dark:bg-[#0F172A] relative min-h-screen shadow-2xl">
        {/* Background Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 dark:bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/5 dark:bg-cyan-600/5 rounded-full blur-[140px] pointer-events-none z-0" />

        {/* Sidebar Navigation */}
        <aside className="w-72 bg-white dark:bg-[#1E293B] border-r border-[#E5E7EB] dark:border-[#334155] flex flex-col z-20 sticky top-0 h-screen transition-colors duration-200 shrink-0">
          <div className="p-6 border-b border-[#E5E7EB] dark:border-[#334155] flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold text-[#1F2937] dark:text-white tracking-wide block">ForgeTrack</span>
              <span className="text-[10px] text-[#4B5563] dark:text-[#94A3B8] tracking-widest uppercase font-semibold">AI Testing Suite</span>
            </div>
          </div>

          {/* Tab Buttons */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'overview' 
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 shadow-sm' 
                  : 'text-[#4B5563] dark:text-[#94A3B8] hover:text-[#1F2937] dark:hover:text-white hover:bg-gray-150 dark:hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <span className="font-semibold">Overview & Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab('resume')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'resume' 
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 shadow-sm' 
                  : 'text-[#4B5563] dark:text-[#94A3B8] hover:text-[#1F2937] dark:hover:text-white hover:bg-gray-150 dark:hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <FileText className="w-5 h-5 shrink-0" />
              <div className="flex-1 flex justify-between items-center min-w-0">
                <span className="font-semibold truncate">Resume Analyzer</span>
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 dark:bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse shrink-0 ml-2" />
              </div>
            </button>

            <button
              onClick={() => setActiveTab('blueprint')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'blueprint' 
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 shadow-sm' 
                  : 'text-[#4B5563] dark:text-[#94A3B8] hover:text-[#1F2937] dark:hover:text-white hover:bg-gray-150 dark:hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Share2 className="w-5 h-5 shrink-0" />
              <span className="font-semibold">Blueprint Canvas</span>
            </button>
          </nav>

          {/* User profile & logout */}
          <div className="p-4 border-t border-[#E5E7EB] dark:border-[#334155] bg-white dark:bg-[#1E293B] transition-colors duration-200">
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-[#4B5563] dark:text-[#94A3B8] hover:text-red-655 dark:hover:text-red-400 hover:bg-red-500/5 dark:hover:bg-red-500/10 hover:border-red-500/10 dark:hover:border-red-500/20 border border-transparent transition-all"
            >
              <span className="flex items-center space-x-2">
                <LogOut className="w-4 h-4 text-red-500 dark:text-red-400" />
                <span className="font-semibold">Sign Out</span>
              </span>
            </button>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 flex flex-col z-10 overflow-x-hidden relative h-screen transition-colors duration-200">
          
          {/* Navigation Top Header */}
          <header className="h-20 bg-white/80 dark:bg-[#1E293B]/80 border-b border-[#E5E7EB] dark:border-[#334155] flex items-center justify-between px-8 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#1F2937] dark:text-white capitalize">{activeTab.replace('-', ' ')}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {analysis && (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-605 dark:text-emerald-400 rounded-full text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resume Loaded</span>
                </div>
              )}
              <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 dark:bg-blue-400/10 dark:border-blue-400/20 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span className="flex w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></span>
                <span>Shadow Auditor Active</span>
              </div>
              {/* Theme Toggle Button */}
              <button
                onClick={onToggleTheme}
                className="p-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#334155] text-[#4B5563] dark:text-[#94A3B8] hover:text-[#1F2937] dark:hover:text-white bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
              </button>
            </div>
          </header>

          {/* Main Workspace Frame */}
          <div className="flex-1 p-8 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-8 max-w-6xl mx-auto">
                
                {/* Welcome Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-blue-500/10 dark:bg-gradient-to-r dark:from-indigo-950/45 dark:via-slate-900/60 dark:to-indigo-900/40 border border-blue-100 dark:border-indigo-500/15 rounded-3xl p-8 shadow-sm dark:shadow-md transition-all">
                  <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
                  <div className="relative z-10 space-y-3">
                    <span className="text-xs bg-blue-100/80 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold px-3 py-1 rounded-full uppercase tracking-wider">Dashboard Overview</span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#1F2937] dark:text-white">Welcome to your ForgeTrack Sandbox</h2>
                    <p className="text-[#4B5563] dark:text-[#94A3B8] max-w-3xl text-sm md:text-base leading-relaxed">
                      This playground lets you test the core ForgeTrack telemetry flow. Analyze your resume, plan project designs in the Blueprint Flowchart, click "I'm Stuck" on tasks to fire events, and see how the AI dynamically audits and guides you.
                    </p>
                  </div>
                </div>

                {/* Status & Telemetry Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Status & Guide Column */}
                  <div className="lg:col-span-1 space-y-6">
                    
                    {/* Sandbox State Card */}
                    <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">
                      <h3 className="font-bold text-[#1F2937] dark:text-white text-lg mb-4 flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Sandbox State</span>
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-[#121212]/30 border border-[#E5E7EB] dark:border-[#334155]/60 rounded-xl">
                          <span className="text-[#4B5563] dark:text-[#94A3B8] font-medium">Resume Uploaded:</span>
                          {analysis ? (
                            <span className="text-emerald-605 dark:text-emerald-400 font-bold flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-1.5 stroke-[2.5]" /> Yes
                            </span>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-orange-550 dark:text-orange-400 font-semibold flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1 stroke-[2.5]" /> Missing
                              </span>
                              <button
                                onClick={() => setActiveTab('resume')}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-750 dark:bg-blue-500 dark:hover:bg-blue-450 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                              >
                                Upload Now
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-[#121212]/30 border border-[#E5E7EB] dark:border-[#334155]/60 rounded-xl">
                          <span className="text-[#4B5563] dark:text-[#94A3B8] font-medium">Skills Detected:</span>
                          <span className="text-[#1F2937] dark:text-white font-bold">{analysis?.skills_detected?.length || 0}</span>
                        </div>

                        <div className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-[#121212]/30 border border-[#E5E7EB] dark:border-[#334155]/60 rounded-xl">
                          <span className="text-[#4B5563] dark:text-[#94A3B8] font-medium">Critical Gaps:</span>
                          <span className={`font-bold ${analysis?.critical_gaps?.length > 0 ? 'text-red-500 dark:text-red-400' : 'text-[#4B5563] dark:text-[#94A3B8]'}`}>
                            {analysis?.critical_gaps?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Testing Guide Card */}
                    <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">
                      <h3 className="font-bold text-[#1F2937] dark:text-white text-lg mb-4 flex items-center space-x-2">
                        <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Testing Guide</span>
                      </h3>
                      
                      <div className="space-y-4">
                        {[
                          {
                            step: 1,
                            title: "Upload Resume Profile",
                            desc: "Go to the Resume Analyzer tab and upload your PDF resume to analyze your tech-stack."
                          },
                          {
                            step: 2,
                            title: "Forge Roadmaps",
                            desc: "Go to Blueprint Canvas, describe your project scope, and click \"Forge Blueprint\" to generate architecture nodes."
                          },
                          {
                            step: 3,
                            title: "Simulate stuck tasks",
                            desc: "Click on flowchart nodes, and select \"I'm Stuck\" on tasks to trigger shadow telemetry alerts."
                          },
                          {
                            step: 4,
                            title: "Dynamic AI Guidance",
                            desc: "Open the AI Assistant Chat. The AI will intercept and deliver specific code suggestions for your blocker."
                          },
                          {
                            step: 5,
                            title: "Audit Telemetry logs",
                            desc: "Observe the live logs populating the telemetry timeline right here in real-time."
                          }
                        ].map((item) => (
                          <div key={item.step} className="flex items-start space-x-3.5">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-605 dark:text-blue-400 text-xs font-bold shrink-0 mt-0.5 border border-blue-100 dark:border-slate-700">
                              {item.step}
                            </span>
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-semibold text-[#1F2937] dark:text-white leading-normal">{item.title}</h4>
                              <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] leading-relaxed font-normal">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Shadow Auditor Live Telemetry Timeline */}
                  <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col h-[600px] transition-all">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-[#1F2937] dark:text-white text-lg flex items-center space-x-2">
                        <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span>Shadow Auditor Telemetry Feed</span>
                      </h3>
                      <button 
                        onClick={fetchLogs} 
                        disabled={isRefreshingLogs}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-[#E5E7EB] dark:border-[#334155] text-[#4B5563] hover:text-[#1F2937] dark:text-[#94A3B8] dark:hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                        title="Refresh Telemetry Timeline"
                      >
                        <RefreshCw className={`w-4 h-4 ${isRefreshingLogs ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 flex flex-col justify-start">
                      {logs.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
                          {/* Radar animation SVG */}
                          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-blue-500/5 dark:bg-blue-400/5 border border-blue-500/10 dark:border-blue-400/10">
                            <svg className="w-16 h-16 text-blue-600 dark:text-blue-450" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                              {/* Concentric circles */}
                              <circle cx="12" cy="12" r="10" strokeDasharray="3 3" className="opacity-30" />
                              <circle cx="12" cy="12" r="6" strokeDasharray="2 2" className="opacity-50" />
                              <circle cx="12" cy="12" r="2" fill="currentColor" className="animate-ping text-blue-500 dark:text-blue-400" />
                              {/* Radar sweeper arm */}
                              <line x1="12" y1="12" x2="20" y2="7" className="animate-[spin_4s_linear_infinite]" style={{ transformOrigin: '12px 12px' }} />
                            </svg>
                          </div>
                          
                          <div className="space-y-1.5 max-w-sm">
                            <p className="text-sm font-semibold text-[#1F2937] dark:text-white">No telemetry events logged yet.</p>
                            <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] leading-relaxed">Interactions will appear here in real-time.</p>
                          </div>
                          
                          <button
                            onClick={handleGenerateFirstEvent}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-750 dark:bg-blue-500 dark:hover:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/15 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all duration-150 cursor-pointer"
                          >
                            Generate First Event
                          </button>
                        </div>
                      ) : (
                        logs.map((log) => {
                          let badgeBg = 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-150 dark:border-indigo-500/20';
                          if (log.event_type === 'task_stuck_clicked') {
                            badgeBg = 'bg-red-50 dark:bg-red-500/15 text-red-650 dark:text-red-400 border-red-150 dark:border-red-500/20 shadow-sm';
                          } else if (log.event_type === 'view_node') {
                            badgeBg = 'bg-blue-50 dark:bg-blue-500/10 text-blue-650 dark:text-blue-400 border-blue-150 dark:border-blue-500/20';
                          } else if (log.event_type.includes('complete') || log.event_type.includes('signup')) {
                            badgeBg = 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border-emerald-150 dark:border-emerald-500/20';
                          }
                          
                          return (
                            <div key={log.id} className="p-4 bg-white dark:bg-[#121212]/20 border border-[#E5E7EB] dark:border-[#334155]/60 hover:border-blue-200 dark:hover:border-blue-900/40 rounded-xl transition-all flex items-start space-x-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badgeBg} tracking-wide uppercase shrink-0 mt-0.5`}>
                                {log.event_type.replace('_', ' ')}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#1F2937] dark:text-white font-medium whitespace-pre-wrap">
                                  {log.metadata_json?.title ? `Viewed node: ${log.metadata_json.title}` : null}
                                  {log.metadata_json?.node_data?.label ? `Stuck on: ${log.metadata_json.node_data.label.split('\n')[0]}` : null}
                                  {!log.metadata_json?.title && !log.metadata_json?.node_data?.label ? (log.metadata_json?.message || JSON.stringify(log.metadata_json)) : null}
                                </p>
                                <span className="text-[10px] text-[#4B5563] dark:text-[#94A3B8] block mt-1.5 font-mono">
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
