import React from 'react';
import { Sun, Moon } from 'lucide-react';

const LandingPage = ({ theme, onToggleTheme, onNavigateToAuth }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-gray-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative transition-colors duration-200">
      
      {/* Ambient Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/5 dark:bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <nav className="fixed w-full z-50 top-0 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">ForgeTrack</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme Toggle Button */}
              <button
                onClick={onToggleTheme}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white bg-slate-100/50 dark:bg-white/[0.02] hover:bg-slate-200/50 dark:hover:bg-white/[0.06] transition-all cursor-pointer shadow-sm"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button 
                onClick={() => onNavigateToAuth && onNavigateToAuth('login')}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button 
                onClick={() => onNavigateToAuth && onNavigateToAuth('signup')}
                className="text-sm font-medium px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white dark:text-white border border-slate-950 dark:border-white/5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="flex w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300 tracking-wide">ForgeTrack AI Engine v2.0 Live</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-slate-900 dark:text-white">
          Forge Your Engineering <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-550 via-cyan-555 to-indigo-555 dark:from-indigo-400 dark:via-cyan-400 dark:to-indigo-400 animate-gradient-x">
            Career Path with AI
          </span>
        </h1>
        
        <p className="max-w-2xl text-lg md:text-xl text-slate-600 dark:text-gray-400 mb-12 leading-relaxed">
          The ultimate project incubation platform. From intelligent resume analysis to node-based structural blueprints and real-time intervention monitoring, build exactly what you need to land your next role.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={() => onNavigateToAuth && onNavigateToAuth('signup')}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg transition-all hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.5)] hover:-translate-y-1 active:translate-y-0 cursor-pointer"
          >
            Start Forging Now
          </button>
          <button 
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-lg border border-slate-200 dark:border-white/10 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center group cursor-pointer"
          >
            View Demo 
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </button>
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">A Complete Engineering Ecosystem</h2>
          <p className="text-slate-500 dark:text-gray-500 max-w-2xl mx-auto">Everything you need to identify skill gaps, architect complex systems, and receive proactive guidance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Resume AI Chatbot */}
          <div className="group bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl p-8 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden shadow-sm dark:shadow-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-indigo-650 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Resume AI Chatbot</h3>
            <p className="text-slate-650 dark:text-gray-400 leading-relaxed text-sm">
              Upload your PDF resume for an automated critical gap analysis. Engage with a personalized tech-stack mentor to discover exactly which skills you need to acquire next.
            </p>
          </div>

          {/* Card 2: IdeaForge */}
          <div className="group bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl p-8 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:border-cyan-500/30 dark:hover:border-cyan-500/30 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden shadow-sm dark:shadow-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-500"></div>
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-cyan-650 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">IdeaForge Engine</h3>
            <p className="text-slate-650 dark:text-gray-400 leading-relaxed text-sm">
              Translate your raw project descriptions into interactive, node-based engineering blueprints. Visualize structural flowcharts and architecture diagrams instantly.
            </p>
          </div>

          {/* Card 3: Shadow Auditor */}
          <div className="group bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl p-8 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:border-purple-500/30 dark:hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden shadow-sm dark:shadow-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-purple-650 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Shadow Auditor</h3>
            <p className="text-slate-650 dark:text-gray-400 leading-relaxed text-sm">
              An intelligent observer that monitors your telemetry and workflow. It detects when you are stuck and injects contextual intervention mechanisms directly into your chat.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-200 dark:border-white/5 py-12 z-10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-550 dark:text-gray-400">ForgeTrack AI</span>
          </div>
          <p className="text-sm text-slate-400 dark:text-gray-600">
            © {new Date().getFullYear()} ForgeTrack Inc. Designed for elite developers.
          </p>
        </div>
      </footer>

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }
      `}</style>

    </div>
  );
};

export default LandingPage;
