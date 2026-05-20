import React from 'react';
import { 
  LayoutDashboard, 
  Camera, 
  BarChart3, 
  ShieldAlert, 
  MessageSquare, 
  Sun, 
  Moon, 
  LogOut, 
  LogIn 
} from 'lucide-react';

export default function Sidebar({ 
  activeView, 
  setActiveView, 
  theme, 
  toggleTheme, 
  user, 
  onLogout 
}) {
  const menuItems = [
    { id: 'dashboard', label: "Dashboard", icon: LayoutDashboard },
    { id: 'scanner', label: "AI Scanner", icon: Camera },
    { id: 'analytics', label: "Analytics", icon: BarChart3 },
    { id: 'risk', label: "Risk Predictor", icon: ShieldAlert },
    { id: 'chatbot', label: "Care Advisor", icon: MessageSquare },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#131926] border-r border-slate-200 dark:border-[#1f293d] h-screen sticky top-0 p-4 shrink-0 transition-all duration-300">
        {/* App Branding */}
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-xl border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              DermShield AI
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              AI Dermatologist
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Lower Controls & Profile */}
        <div className="pt-4 border-t border-slate-200 dark:border-[#1f293d] space-y-3">
          {/* Controls row */}
          <div className="flex items-center justify-end px-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-[#1f293d] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          {/* User Section */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-[#1f293d]/50">
            {user ? (
              <>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {user.username}
                  </p>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                    Active Patient
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Log Out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Guest</p>
                  <p className="text-[10px] text-slate-400">Offline</p>
                </div>
                <button
                  onClick={() => setActiveView('auth')}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
                >
                  <LogIn size={14} />
                  <span>Sign In</span>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#131926]/90 backdrop-blur-lg border-t border-slate-200 dark:border-[#1f293d] flex items-center justify-around py-2 px-1 z-40 shadow-2xl">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon size={20} />
              <span className="text-[9px] font-bold">{item.label}</span>
            </button>
          );
        })}
        {/* Mobile Settings/Auth */}
        <button
          onClick={() => user ? onLogout() : setActiveView('auth')}
          className="flex flex-col items-center gap-0.5 py-1 px-3 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
        >
          {user ? <LogOut size={20} className="text-red-400" /> : <LogIn size={20} />}
          <span className="text-[9px] font-bold">
            {user ? "Log Out" : "Sign In"}
          </span>
        </button>
      </nav>
    </>
  );
}
