import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import Analytics from './components/Analytics';
import RiskAssessment from './components/RiskAssessment';
import Chatbot from './components/Chatbot';
import { Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles, Heart, Eye, EyeOff } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  
  // User Data State
  const [user, setUser] = useState(null);
  const [scans, setScans] = useState([]);
  const [checklist, setChecklist] = useState({ spf: 0, cleanse: 0, hydrate: 0 });

  // Auth Panel State
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Check login status & load data on startup
  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`/dashboard-data?t=${new Date().getTime()}`);
      const data = await res.json();
      if (data.success) {
        setUser({ username: data.username });
        setScans(data.scans || []);
        setChecklist(data.checklist || { spf: 0, cleanse: 0, hydrate: 0 });
        if (data.theme) {
          setTheme(data.theme);
        }
      } else {
        resetGuestState();
      }
    } catch (err) {
      console.warn("Unauthorized or guest session active.");
      resetGuestState();
    }
  };

  const resetGuestState = () => {
    setUser(null);
    setScans([]);
    setChecklist({ spf: 0, cleanse: 0, hydrate: 0 });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Sync dark class on document for Tailwind dark: modifiers
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Checklist updates
  const handleChecklistChange = async (field, val) => {
    if (!user) {
      alert("Please Sign In first to track your skincare routine compliance!");
      return;
    }

    const nextChecklist = { ...checklist, [field]: val };
    setChecklist(nextChecklist);

    try {
      await fetch("/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextChecklist)
      });
      fetchDashboardData(); // Re-fetch stats
    } catch (err) {
      console.error("Failed to save checklist:", err);
    }
  };

  // Theme save
  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);

    if (user) {
      try {
        await fetch("/theme", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: nextTheme })
        });
      } catch (err) {
        console.error("Failed to save theme settings:", err);
      }
    }
  };

  // Auth Forms Submission
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!authUsername || !authPassword) {
      setAuthError("Username and password are required.");
      return;
    }

    const isLogin = authMode === 'login';
    const endpoint = isLogin ? "/login" : "/register";
    const payload = { username: authUsername, password: authPassword };
    if (!isLogin) {
      payload.email = authEmail;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (isLogin || data.auto_login) {
          // Success login or auto login
          setUser({ username: data.username });
          fetchDashboardData();
          setActiveView('dashboard');
        } else {
          // Success register -> switch to login
          alert("Account registered successfully! Please sign in.");
          setAuthMode('login');
        }
        // Reset forms
        setAuthUsername("");
        setAuthPassword("");
        setAuthEmail("");
        setShowPassword(false);
      } else {
        setAuthError(data.message || "Authentication failed. Try again.");
      }
    } catch (err) {
      console.error("Auth server error:", err);
      setAuthError("Could not connect to authentication server.");
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch("/logout", { method: "POST" });
      resetGuestState();
      setActiveView('dashboard');
      alert("Logged out successfully.");
    } catch (err) {
      console.error("Logout request failed:", err);
    }
  };

  // View Router Dispatcher
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            scans={scans} 
            checklist={checklist} 
            onChecklistChange={handleChecklistChange} 
            setActiveView={setActiveView} 
          />
        );
      case 'scanner':
        return (
          <Scanner 
            user={user} 
            onScanCompleted={fetchDashboardData} 
            theme={theme}
          />
        );
      case 'analytics':
        return (
          <Analytics 
            scans={scans} 
            checklist={checklist} 
            theme={theme}
          />
        );
      case 'risk':
        return (
          <RiskAssessment theme={theme} />
        );
      case 'chatbot':
        return (
          <Chatbot theme={theme} />
        );
      default:
        return (
          <Dashboard 
            user={user} 
            scans={scans} 
            checklist={checklist} 
            onChecklistChange={handleChecklistChange} 
            setActiveView={setActiveView} 
          />
        );
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-800'} transition-colors duration-300`}>
      {!user && activeView !== 'guest_dashboard' ? (
        /* Dual-Column Split Authentication Landing Page */
        <div className="min-h-screen flex flex-col md:flex-row bg-[#0b0f19] relative overflow-hidden">
          {/* Neon background decorations */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Left Column: Clinical Branding & AI Features Visualizer */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#131926] to-[#0b0f19] border-r border-[#1f293d] p-12 flex-col justify-between relative">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600/20 text-indigo-400 p-2.5 rounded-xl border border-indigo-500/30">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  DermShield AI
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Clinical-Grade Dermatology screening
                </p>
              </div>
            </div>

            <div className="space-y-6 my-auto">
              <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight">
                Empowering Your Skin Health With <span className="bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">Multi-Model AI</span>
              </h2>
              <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                Connect your physical camera feed with localized CNN classifiers and state-of-the-art vision models to screening for skin conditions instantly.
              </p>

              <div className="space-y-3 pt-4">
                {[
                  { title: "Multi-Model Diagnostics", desc: "Toggle between local classifiers, Ensembles, Gemini-1.5, or OpenAI GPT-4o." },
                  { title: "Explainable Lesion Contours", desc: "Cross-examine scan findings with high-fidelity U-Net segment boundaries and Grad-CAM maps." },
                  { title: "Empathetic Care Advisor", desc: "Communicate with a highly intelligent clinical care advisor chatbot." }
                ].map((feat, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30 mt-0.5">
                      <Sparkles size={11} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{feat.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 tracking-wide uppercase">
              <Heart size={12} className="text-rose-500 animate-pulse" />
              <span>DermShield AI v1.2 • Secure HIPAA Aligned Encryption</span>
            </div>
          </div>

          {/* Right Column: Beautiful Login/Register form Card */}
          <div className="flex-1 flex items-center justify-center p-6 relative">
            <div className="w-full max-w-md glass-panel p-6 sm:p-8 space-y-6 animate-scale-up">
              {/* Form Mode Tabs Selector */}
              <div className="flex p-1 bg-slate-900 border border-[#1f293d] rounded-xl">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(""); setShowPassword(false); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'login' 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(""); setShowPassword(false); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'register' 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Branding for Mobile (Only visible when Left column hidden) */}
              <div className="text-center md:hidden">
                <div className="inline-flex p-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mb-2">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-black text-white">DermShield AI</h3>
              </div>

              <div className="space-y-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-white">
                  {authMode === 'login' ? "Welcome back!" : "Join DermShield today"}
                </h2>
                <p className="text-slate-400 text-xs font-semibold">
                  {authMode === 'login' 
                    ? "Access AI diagnostics and routine trackers." 
                    : "Create a private patient profile to start scans."}
                </p>
              </div>

              {authError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold p-3 rounded-xl text-center">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Username</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      placeholder="patient_username"
                      className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30"
                    />
                  </div>
                </div>

                {/* Email Address (Sign Up Mode Only) */}
                {authMode === 'register' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="patient@healthcare.com"
                        className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30"
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl pl-11 pr-10 py-2.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-indigo-400/20"
                >
                  <span>{authMode === 'login' ? "Sign In to Portal" : "Register Profile"}</span>
                  <ArrowRight size={14} />
                </button>
              </form>

              {/* Guest Preview Mode Switch */}
              <div className="border-t border-[#1f293d] pt-4 text-center">
                <button
                  onClick={() => {
                    setActiveView('dashboard');
                    setUser({ username: "Guest" }); // Temporary guest username
                  }}
                  className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-wider"
                >
                  &rarr; Continue as Guest Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Main Dashboard Core Layout */
        <div className="flex flex-col md:flex-row min-h-screen">
          {/* Navigation Sidebar */}
          <Sidebar 
            activeView={activeView} 
            setActiveView={setActiveView} 
            theme={theme} 
            toggleTheme={toggleTheme} 
            user={user} 
            onLogout={handleLogout} 
          />

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
            {renderActiveView()}
          </main>
        </div>
      )}
    </div>
  );
}
