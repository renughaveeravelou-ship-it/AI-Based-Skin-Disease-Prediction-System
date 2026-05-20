import React from 'react';
import { 
  FileText, 
  Calendar, 
  Activity, 
  Camera, 
  ShieldAlert, 
  MessageSquare,
  FileCheck2,
  CalendarCheck,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function Dashboard({ 
  user, 
  scans, 
  checklist, 
  onChecklistChange, 
  setActiveView 
}) {
  // Compute checklist score
  let score = 0;
  if (checklist.spf === 1) score += 33;
  if (checklist.cleanse === 1) score += 33;
  if (checklist.hydrate === 1) score += 34;

  const totalScans = scans.length;
  const latestCondition = totalScans > 0 ? scans[0].result : "None";

  // Actions for Quick Shortcuts
  const quickActions = [
    {
      title: "Scan New Lesion",
      desc: "Instant multi-model diagnosis & contours",
      icon: Camera,
      color: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400",
      view: "scanner"
    },
    {
      title: "Risk Assessment",
      desc: "Standard Fitzpatrick skin calculations",
      icon: ShieldAlert,
      color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
      view: "risk"
    },
    {
      title: "Ask Care Advisor",
      desc: "Conversational skin wellness advisor",
      icon: MessageSquare,
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
      view: "chatbot"
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-16 md:pb-0">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user ? user.username : "Guest"}!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Here is your daily clinical skin care overview.</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-[#1f293d] rounded-xl px-3 py-2 text-slate-600 dark:text-slate-300 font-semibold self-start md:self-auto">
          <Calendar size={14} className="text-indigo-600 dark:text-indigo-400" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Skincare Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Scans Count */}
        <div className="glass-panel glass-panel-hover p-5 flex items-center gap-4">
          <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-3 rounded-2xl border border-indigo-500/20">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Scans</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalScans}</h3>
          </div>
        </div>

        {/* Routine Score */}
        <div className="glass-panel glass-panel-hover p-5 flex items-center gap-4">
          <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-2xl border border-emerald-500/20">
            <FileCheck2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Compliance</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{score}%</h3>
          </div>
        </div>

        {/* Latest Condition */}
        <div className="glass-panel glass-panel-hover p-5 flex items-center gap-4">
          <div className="bg-violet-500/10 text-violet-600 dark:text-violet-400 p-3 rounded-2xl border border-violet-500/20">
            <ShieldAlert size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Latest Diagnosis</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 truncate">{latestCondition}</h3>
          </div>
        </div>
      </div>

      {/* Main Core Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Actions & Checklist */}
        <div className="lg:col-span-5 space-y-6">
          {/* Daily Routine Checklist */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#1f293d] pb-3">
              <CalendarCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-extrabold text-slate-800 dark:text-white">Daily Skincare Routine</h4>
            </div>

            <div className="space-y-3">
              {[
                { id: 'spf', label: "Apply Sunscreen (SPF 30+)" },
                { id: 'cleanse', label: "Morning & Night Gentle Cleansing" },
                { id: 'hydrate', label: "Epidermal Hydration Moisturizing" }
              ].map((item) => (
                <label 
                  key={item.id} 
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/25 border border-slate-200/50 dark:border-[#1f293d]/50 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.id] === 1}
                    onChange={(e) => onChecklistChange(item.id, e.target.checked ? 1 : 0)}
                    className="w-5 h-5 rounded border-slate-300 dark:border-[#1f293d] text-indigo-600 focus:ring-indigo-600/30 bg-white dark:bg-[#0b0f19] cursor-pointer"
                  />
                  <span className={`text-xs font-semibold ${checklist[item.id] === 1 ? 'text-slate-400 line-through opacity-70' : 'text-slate-600 dark:text-slate-300'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-3 flex items-start gap-2.5">
              <TrendingUp size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                Compliance Tip: Consistent daily routines substantially enhance protective barrier recovery and reduce atypical lesion growth factors.
              </p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="glass-panel p-5 space-y-4">
            <h4 className="font-extrabold text-slate-800 dark:text-white border-b border-slate-200 dark:border-[#1f293d] pb-3">
              Quick Diagnostic Services
            </h4>
            <div className="space-y-3">
              {quickActions.map((act, i) => {
                const Icon = act.icon;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveView(act.view)}
                    className={`flex items-center gap-4 w-full p-3 rounded-xl border text-left bg-gradient-to-br ${act.color} hover:scale-[1.01] hover:shadow-lg transition-all group`}
                  >
                    <div className="p-2.5 rounded-lg bg-slate-900/50">
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{act.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">{act.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Scan History List */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-5 h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1f293d] pb-3 mb-4">
              <h4 className="font-extrabold text-slate-800 dark:text-white">Assessment Archives</h4>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#1f293d] px-2 py-0.5 rounded-full text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                History ({totalScans})
              </span>
            </div>

            {totalScans === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4">
                <FileText size={48} className="text-slate-450 dark:text-slate-600 mb-3" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  No clinical assessments stored yet.
                </p>
                <button
                  onClick={() => setActiveView('scanner')}
                  className="mt-4 text-xs font-extrabold text-indigo-650 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
                >
                  Scan New Lesion &rarr;
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto max-h-[390px] pr-1 space-y-3">
                {scans.map((scan) => {
                  let badgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                  if (scan.severity.toLowerCase() === 'medium') {
                    badgeColor = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
                  } else if (scan.severity.toLowerCase() === 'high') {
                    badgeColor = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
                  }

                  const formattedDate = new Date(scan.created_at.replace(' ', 'T')).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  });

                  return (
                    <div 
                      key={scan.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-55 dark:bg-slate-800/20 border border-slate-200 dark:border-[#1f293d] hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-[#1f293d] bg-slate-100 dark:bg-slate-900 shrink-0" 
                          src={`/uploads/${scan.filename}`} 
                          alt="Lesion thumbnail" 
                          onError={(e) => { e.target.src = 'https://img.icons8.com/color/48/ffffff/image.png' }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">{scan.result}</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${badgeColor} uppercase tracking-wider`}>
                              {scan.severity}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                            {formattedDate} • {scan.doctor.split('(')[0].trim()}
                          </p>
                        </div>
                      </div>
                      <a 
                        href={`/download_report/${scan.id}`} 
                        className="flex items-center justify-center gap-1.5 py-2 px-3 sm:py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-650 dark:text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-transparent text-xs font-bold transition-all shrink-0"
                      >
                        <FileText size={13} />
                        <span>PDF Report</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
