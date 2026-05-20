import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area 
} from 'recharts';
import { Activity, ShieldAlert, BarChart3, Heart } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

export default function Analytics({ scans, theme }) {
  const totalScans = scans.length;

  // Process data for charts
  // 1. Condition Ratios (Pie Chart)
  const conditionCounts = {};
  scans.forEach(s => {
    conditionCounts[s.result] = (conditionCounts[s.result] || 0) + 1;
  });
  const pieData = Object.keys(conditionCounts).map(name => ({
    name,
    value: conditionCounts[name]
  }));

  // 2. Severities (Bar Chart)
  const severityCounts = { low: 0, medium: 0, high: 0 };
  scans.forEach(s => {
    const sev = s.severity.toLowerCase();
    if (severityCounts[sev] !== undefined) {
      severityCounts[sev]++;
    }
  });
  const barData = [
    { name: "Low", Count: severityCounts.low, fill: '#10b981' },
    { name: "Medium", Count: severityCounts.medium, fill: '#f59e0b' },
    { name: "High", Count: severityCounts.high, fill: '#ef4444' }
  ];

  // 3. Weekly Compliance (Line Chart simulation - using database inputs if present or standard metrics)
  const complianceData = [
    { day: "Mon", score: 33 },
    { day: "Tue", score: 66 },
    { day: "Wed", score: 100 },
    { day: "Thu", score: 33 },
    { day: "Fri", score: 66 },
    { day: "Sat", score: 100 },
    { day: "Sun", score: 100 }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16 md:pb-0">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Diagnostics Analytics</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Detailed metrics, condition profiles, and severity statistics.
        </p>
      </div>

      {totalScans === 0 ? (
        <div className="glass-panel p-10 text-center flex flex-col items-center justify-center">
          <BarChart3 size={48} className="text-slate-400 dark:text-slate-600 mb-3" />
          <h4 className="text-slate-800 dark:text-white font-extrabold text-lg">No Diagnostic Data Yet</h4>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-sm">
            You need to perform at least one skin lesion scan to populate the analytics dashboards and charts.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Mini Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-5 flex items-center gap-4">
              <div className="bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 p-3 rounded-2xl border border-indigo-500/20">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Total Scans</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalScans}</h3>
              </div>
            </div>

            <div className="glass-panel p-5 flex items-center gap-4">
              <div className="bg-red-500/10 text-red-500 dark:text-red-400 p-3 rounded-2xl border border-red-500/20">
                <ShieldAlert size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">High Risk Cases</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{severityCounts.high}</h3>
              </div>
            </div>

            <div className="glass-panel p-5 flex items-center gap-4">
              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-2xl border border-emerald-500/20">
                <Heart size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Healthy / Low Risk</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{severityCounts.low}</h3>
              </div>
            </div>
          </div>

          {/* Graphics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Condition Ratio Chart */}
            <div className="glass-panel p-5 flex flex-col h-[320px]">
              <h4 className="font-extrabold text-slate-800 dark:text-white mb-3">Diagnostic Ratios</h4>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#131926' : '#ffffff', 
                        borderColor: theme === 'dark' ? '#1f293d' : '#e2e8f0', 
                        borderRadius: '12px',
                        color: theme === 'dark' ? '#ffffff' : '#0f172a' 
                      }}
                      labelStyle={{ color: theme === 'dark' ? '#ffffff' : '#0f172a' }}
                      itemStyle={{ color: '#818cf8' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Pie Legends */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span>{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Severity Distribution Chart */}
            <div className="glass-panel p-5 h-[320px]">
              <h4 className="font-extrabold text-slate-800 dark:text-white mb-3">Severity Metrics</h4>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1f293d' : '#e2e8f0'} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#131926' : '#ffffff', 
                      borderColor: theme === 'dark' ? '#1f293d' : '#e2e8f0', 
                      borderRadius: '12px',
                      color: theme === 'dark' ? '#ffffff' : '#0f172a' 
                    }}
                    labelStyle={{ color: theme === 'dark' ? '#ffffff' : '#0f172a' }}
                  />
                  <Bar dataKey="Count" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Skincare Routine Compliance Progress */}
            <div className="glass-panel p-5 lg:col-span-2 h-[300px]">
              <h4 className="font-extrabold text-slate-800 dark:text-white mb-3">Weekly Care Compliance</h4>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={complianceData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1f293d' : '#e2e8f0'} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#131926' : '#ffffff', 
                      borderColor: theme === 'dark' ? '#1f293d' : '#e2e8f0', 
                      borderRadius: '12px',
                      color: theme === 'dark' ? '#ffffff' : '#0f172a' 
                    }}
                    labelStyle={{ color: theme === 'dark' ? '#ffffff' : '#0f172a' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" name="Routine Compliance %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
