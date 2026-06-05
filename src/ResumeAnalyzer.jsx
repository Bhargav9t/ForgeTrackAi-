import React, { useState, useRef, useEffect } from 'react';
import { FileText, Upload, Sparkles, AlertTriangle, Lightbulb, MessageSquare, Send, ArrowRight, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL, GEMINI_API_KEY } from './config';

const ResumeAnalyzer = ({ onAnalysisComplete, analysisData, justChat = false, theme }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(analysisData);

  // Synchronize internal analysis state with parent prop updates
  // In dynamic mode, analysis state updates from parent logic
  useEffect(() => {
    setAnalysis(analysisData);
  }, [analysisData]);

  // Chat State (persisted via sessionStorage for smooth navigation)
  const [sessionId, setSessionId] = useState(() => {
    return sessionStorage.getItem('forgetrack_session_id') || null;
  });
  const [chatMessages, setChatMessages] = useState(() => {
    const saved = sessionStorage.getItem('forgetrack_chat_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatLoading]);

  // Sync session & messages to session storage
  useEffect(() => {
    if (sessionId) {
      sessionStorage.setItem('forgetrack_session_id', sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      sessionStorage.setItem('forgetrack_chat_messages', JSON.stringify(chatMessages));
    }
  }, [chatMessages]);

  // Global open-chat-panel listener for stuck tasks
  useEffect(() => {
    const handleOpenChat = (event) => {
      const node = event.detail;
      const taskName = node.data?.label ? node.data.label.split('\n')[0] : `task ${node.id}`;
      
      // Auto create session if not present
      if (!sessionId) {
        const newSessionId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
        setSessionId(newSessionId);
        setChatMessages([{ role: 'ai', content: `I see you clicked "I'm Stuck" on "${taskName}". What questions or challenges are you facing with this task?` }]);
      } else {
        // Just append prompt
        setChatInput(`I'm stuck on the task: "${taskName}". Can you help me resolve this block?`);
      }

      // Small delay to ensure tab switch and input element render
      setTimeout(() => {
        const chatInputEl = document.getElementById('chat-input-field');
        if (chatInputEl) {
          chatInputEl.focus();
        }
      }, 100);
    };

    window.addEventListener('open-chat-panel', handleOpenChat);
    return () => window.removeEventListener('open-chat-panel', handleOpenChat);
  }, [sessionId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !sessionId || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          ...(GEMINI_API_KEY ? { 'X-Gemini-API-Key': GEMINI_API_KEY } : {})
        },
        body: JSON.stringify({ session_id: sessionId, message: userMessage }),
      });

      if (!response.ok) throw new Error('Chat request failed');
      
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'ai', content: data.response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error while trying to respond. Make sure the backend server is running.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze-resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          ...(GEMINI_API_KEY ? { 'X-Gemini-API-Key': GEMINI_API_KEY } : {})
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.analysis) {
        setAnalysis(data.analysis);
        if (onAnalysisComplete) {
          onAnalysisComplete(data.analysis);
        }
        
        const newSessionId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
        setSessionId(newSessionId);
        setChatMessages([{ 
          role: 'ai', 
          content: "Hi! I've analyzed your resume and parsed the skills, critical gaps, and recommendations. Ask me anything about the audit feedback or how to resolve your skill gaps!" 
        }]);
      } else {
        throw new Error('Invalid response format received from server.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the resume.');
    } finally {
      setLoading(false);
    }
  };

  // Chat interface helper to render within both modes
  const renderChatInterface = (heightClass = "h-[600px]") => {
    const handleInitChat = () => {
      const newSessionId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      setSessionId(newSessionId);
      setChatMessages([{ role: 'ai', content: "Hi! Ask me anything about your project architecture or skills gaps." }]);
    };

    return (
      <div className={`flex flex-col ${heightClass} overflow-hidden`}>
        {!sessionId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-50/50 dark:bg-white/[0.01]">
            <MessageSquare className="w-12 h-12 text-indigo-500/40" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Start a New Conversation</h4>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-1 max-w-xs">
                Activate the assistant to discuss code snippets, review gaps, or resolve architecture blocks.
              </p>
            </div>
            <button
              onClick={handleInitChat}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs rounded-xl shadow-lg transition-all cursor-pointer text-white"
            >
              Start Chat
            </button>
          </div>
        ) : (
          <>
            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-[#0a0a10]/60 transition-all">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none border border-indigo-500/20' 
                      : 'bg-white dark:bg-white/[0.04] text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-white/5 rounded-bl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/5 rounded-2xl rounded-bl-none px-4 py-3">
                    <div className="flex space-x-1.5 items-center h-4">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input field */}
            <div className="p-4 bg-white dark:bg-[#0d0d15] border-t border-slate-200 dark:border-white/5 transition-all">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  id="chat-input-field"
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={analysis ? "Ask about your resume & gaps..." : "Ask the AI developer assistant..."}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 focus:border-indigo-500/50 rounded-xl text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-gray-600 focus:bg-white dark:focus:bg-white/[0.05]"
                  disabled={isChatLoading}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    );
  };

  // Render just the chat panel if requested
  if (justChat) {
    return renderChatInterface("h-full");
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {!analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Upload Box */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0e0e16]/80 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl flex flex-col justify-between transition-all">
            <div className="p-8 bg-gradient-to-br from-indigo-50/10 via-white to-white dark:from-indigo-950/10 dark:via-[#0e0e16]/50 dark:to-[#0e0e16] h-full flex flex-col justify-between transition-all">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                  <span>AI Resume Analyzer</span>
                </h2>
                <p className="text-slate-600 dark:text-gray-400 mb-8 text-sm max-w-xl">
                  Upload your PDF resume to audit your tech-stack profile. The engine parses your skills and identifies critical missing gaps.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border border-slate-200 dark:border-white/10 hover:border-indigo-500/30 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100/50 dark:bg-white/[0.01] dark:hover:bg-white/[0.02] transition-all duration-200">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-indigo-500 dark:text-indigo-400/80" />
                        <p className="mb-2 text-sm text-slate-600 dark:text-gray-300">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-400 dark:text-gray-500">PDF documents only (.pdf)</p>
                      </div>
                      <input id="dropzone-file" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                    </label>
                  </div>
                  
                  {file && (
                    <div className="flex items-center space-x-3 text-sm text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-white/[0.02] border border-slate-205 dark:border-white/5 p-3.5 rounded-xl transition-all">
                      <FileText className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                      <span className="font-medium truncate flex-1">{file.name}</span>
                      <span className="text-xs text-slate-450 dark:text-gray-500 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading || !file}
                    className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all duration-200 cursor-pointer ${loading || !file ? 'opacity-40 cursor-not-allowed active:scale-100' : ''}`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing Profile...
                      </span>
                    ) : (
                      'Analyze Resume'
                    )}
                  </button>
                </form>
              </div>

              {error && (
                <div className="mt-6 bg-red-950/20 border border-red-500/20 p-4 rounded-xl shadow-sm flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-350 dark:text-red-300 font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Chat Assistant Pane */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0e0e16]/80 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl flex flex-col h-[580px] transition-all">
            <div className="p-4 bg-indigo-550/10 dark:bg-indigo-600/10 border-b border-slate-200 dark:border-white/5 flex items-center justify-between transition-all">
              <h3 className="font-bold text-sm flex items-center text-indigo-600 dark:text-indigo-400">
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Tech Recruiter Chat
              </h3>
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Online</span>
            </div>
            {renderChatInterface("flex-1")}
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Analysis Results */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Skills Detected */}
            <div className="bg-white dark:bg-[#0e0e16]/80 border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm dark:shadow-lg transition-all">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-1.5 rounded-lg mr-2.5">
                  <Sparkles className="w-4 h-4" />
                </span>
                Skills Detected
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.skills_detected?.map((skill, index) => (
                  <span key={index} className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full cursor-default transition-all">
                    {skill}
                  </span>
                ))}
                {(!analysis.skills_detected || analysis.skills_detected.length === 0) && (
                  <p className="text-slate-400 dark:text-gray-500 italic text-sm">No specific skills detected.</p>
                )}
              </div>
            </div>

            {/* Critical Gaps */}
            <div className="bg-white dark:bg-[#0e0e16]/80 border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm dark:shadow-lg transition-all">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <span className="bg-red-50 dark:bg-red-500/10 text-red-650 dark:text-red-400 p-1.5 rounded-lg mr-2.5">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                Critical Gaps
              </h3>
              <ul className="space-y-3">
                {analysis.critical_gaps?.map((gap, index) => (
                  <li key={index} className="flex items-start bg-red-50/50 dark:bg-red-950/5 border border-red-100 dark:border-red-500/5 hover:border-red-200 dark:hover:border-red-500/10 p-3 rounded-xl transition-all">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 mr-3 shrink-0" />
                    <span className="text-slate-700 dark:text-gray-300 leading-relaxed text-sm font-medium">{gap}</span>
                  </li>
                ))}
                {(!analysis.critical_gaps || analysis.critical_gaps.length === 0) && (
                  <p className="text-slate-400 dark:text-gray-500 italic text-sm">No critical gaps detected.</p>
                )}
              </ul>
            </div>

            {/* Recommended Actions */}
            <div className="bg-white dark:bg-[#0e0e16]/80 border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-sm dark:shadow-lg transition-all">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-605 dark:text-emerald-400 p-1.5 rounded-lg mr-2.5">
                  <Lightbulb className="w-4 h-4" />
                </span>
                Recommended Actions
              </h3>
              <div className="space-y-3">
                {analysis.recommended_actions?.map((action, index) => (
                  <div key={index} className="flex items-start bg-emerald-50/50 dark:bg-emerald-950/5 border border-emerald-100 dark:border-emerald-500/5 hover:border-emerald-150 dark:hover:border-emerald-500/10 p-3.5 rounded-xl transition-all">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs mr-3 border border-emerald-100 dark:border-emerald-500/20">
                      {index + 1}
                    </span>
                    <span className="text-slate-700 dark:text-gray-300 leading-relaxed text-sm font-medium">{action}</span>
                  </div>
                ))}
                {(!analysis.recommended_actions || analysis.recommended_actions.length === 0) && (
                  <p className="text-slate-400 dark:text-gray-500 italic text-sm">No recommended actions at this time.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Chat Assistant Pane */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0e0e16]/80 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl flex flex-col h-[580px] sticky top-24 transition-all">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-600/10 border-b border-slate-200 dark:border-white/5 flex items-center justify-between transition-all">
              <h3 className="font-bold text-sm flex items-center text-indigo-600 dark:text-indigo-400">
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Tech Recruiter Chat
              </h3>
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Online</span>
            </div>
            {renderChatInterface("flex-1")}
          </div>

        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
