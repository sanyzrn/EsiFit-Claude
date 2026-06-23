import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, DollarSign, TrendingUp, BarChart3, FileText, Dumbbell, Apple } from 'lucide-react';
import { getState, subscribe, PLANS, EXERCISES, PROGRAMS, DIET_PLANS, ARTICLES } from '@/lib/store';

export default function Admin() {
  const [state, setState] = useState(getState());
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);
  useEffect(() => {
    if (!state.currentUser || state.currentUser.role !== 'ADMIN') navigate('/');
  }, [state.currentUser, navigate]);

  if (!state.currentUser || state.currentUser.role !== 'ADMIN') return null;

  const tabs = [
    { id: 'overview', icon: BarChart3, label: 'Overview' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'exercises', icon: Dumbbell, label: 'Exercises' },
    { id: 'programs', icon: FileText, label: 'Programs' },
    { id: 'diet', icon: Apple, label: 'Diet Plans' },
    { id: 'articles', icon: FileText, label: 'Articles' },
  ];

  // Simulated users
  const demoUsers = [
    { id: '1', name: 'John Smith', email: 'john@example.com', role: 'USER', tier: 'VIP', created: '2024-10-15' },
    { id: '2', name: 'Sarah Connor', email: 'sarah@example.com', role: 'USER', tier: 'ECONOMY', created: '2024-11-01' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'USER', tier: 'FREE', created: '2024-11-20' },
    { id: '4', name: 'Coach Smith', email: 'coach@fitpro.com', role: 'COACH', tier: 'ELITE', created: '2024-09-01' },
    { id: '5', name: 'Admin User', email: 'admin@fitpro.com', role: 'ADMIN', tier: 'ELITE', created: '2024-08-01' },
    { id: '6', name: 'Lisa Davis', email: 'lisa@example.com', role: 'USER', tier: 'ELITE', created: '2024-12-01' },
  ];

  const vipCount = demoUsers.filter(u => u.tier === 'VIP').length;
  const economyCount = demoUsers.filter(u => u.tier === 'ECONOMY').length;
  const eliteCount = demoUsers.filter(u => u.tier === 'ELITE' && u.role === 'USER').length;
  const mrr = vipCount * 2999 + economyCount * 999 + eliteCount * 7999;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Admin Dashboard</h1>
          <p className="text-sm text-gray-400">Manage users, content, and revenue</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-green-400" /><span className="text-sm text-gray-400">MRR</span></div>
              <div className="text-3xl font-black text-green-400">${(mrr / 100).toFixed(0)}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-blue-400" /><span className="text-sm text-gray-400">Total Users</span></div>
              <div className="text-3xl font-black">{demoUsers.length}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-orange-400" /><span className="text-sm text-gray-400">New This Week</span></div>
              <div className="text-3xl font-black">3</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-purple-400" /><span className="text-sm text-gray-400">Paid Subscribers</span></div>
              <div className="text-3xl font-black">{vipCount + economyCount + eliteCount}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-bold mb-4">Revenue by Plan</h3>
              {PLANS.filter(p => p.priceMonthly > 0).map(plan => {
                const count = demoUsers.filter(u => u.tier === plan.tier && u.role === 'USER').length;
                return (
                  <div key={plan.id} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                    <span className="text-sm">{plan.name} ({count} users)</span>
                    <span className="text-sm font-bold text-green-400">${((plan.priceMonthly * count) / 100).toFixed(2)}/mo</span>
                  </div>
                );
              })}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-bold mb-4">Content Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Exercises</span>
                  <span className="font-bold">{EXERCISES.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Programs</span>
                  <span className="font-bold">{PROGRAMS.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Diet Plans</span>
                  <span className="font-bold">{DIET_PLANS.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Articles</span>
                  <span className="font-bold">{ARTICLES.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  <th className="text-left p-4 font-medium text-gray-400">Name</th>
                  <th className="text-left p-4 font-medium text-gray-400">Email</th>
                  <th className="p-4 text-center font-medium text-gray-400">Role</th>
                  <th className="p-4 text-center font-medium text-gray-400">Tier</th>
                  <th className="p-4 text-center font-medium text-gray-400">Joined</th>
                </tr>
              </thead>
              <tbody>
                {demoUsers.map(u => (
                  <tr key={u.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                    <td className="p-4 font-medium">{u.name}</td>
                    <td className="p-4 text-gray-400">{u.email}</td>
                    <td className="p-4 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                        u.role === 'COACH' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.tier === 'ELITE' ? 'bg-purple-500/20 text-purple-400' :
                        u.tier === 'VIP' ? 'bg-orange-500/20 text-orange-400' :
                        u.tier === 'ECONOMY' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {u.tier}
                      </span>
                    </td>
                    <td className="p-4 text-center text-gray-400">{u.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'exercises' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-bold">Exercise Library ({EXERCISES.length} exercises)</h3>
            <button className="px-3 py-1.5 bg-orange-500 text-white text-sm font-bold rounded-lg">+ Add Exercise</button>
          </div>
          <div className="divide-y divide-gray-800">
            {EXERCISES.map(ex => (
              <div key={ex.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/50">
                <div>
                  <div className="font-medium text-sm">{ex.name}</div>
                  <div className="text-xs text-gray-400">{ex.muscleGroups.join(', ')} · {ex.difficulty}</div>
                </div>
                <button className="text-xs text-gray-400 hover:text-white">Edit</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'programs' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-bold">Training Programs ({PROGRAMS.length})</h3>
            <button className="px-3 py-1.5 bg-orange-500 text-white text-sm font-bold rounded-lg">+ Add Program</button>
          </div>
          <div className="divide-y divide-gray-800">
            {PROGRAMS.map(p => (
              <div key={p.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/50">
                <div>
                  <div className="font-medium text-sm">{p.title}</div>
                  <div className="text-xs text-gray-400">{p.level} · {p.daysPerWeek} days/week · {p.requiredTier}</div>
                </div>
                <button className="text-xs text-gray-400 hover:text-white">Edit</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'diet' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-bold">Diet Plans ({DIET_PLANS.length})</h3>
            <button className="px-3 py-1.5 bg-orange-500 text-white text-sm font-bold rounded-lg">+ Add Diet Plan</button>
          </div>
          <div className="divide-y divide-gray-800">
            {DIET_PLANS.map(d => (
              <div key={d.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/50">
                <div>
                  <div className="font-medium text-sm">{d.title}</div>
                  <div className="text-xs text-gray-400">{d.totalCalories} kcal · {d.meals.length} meals · {d.requiredTier}</div>
                </div>
                <button className="text-xs text-gray-400 hover:text-white">Edit</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'articles' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-bold">Blog Articles ({ARTICLES.length})</h3>
            <button className="px-3 py-1.5 bg-orange-500 text-white text-sm font-bold rounded-lg">+ Add Article</button>
          </div>
          <div className="divide-y divide-gray-800">
            {ARTICLES.map(a => (
              <div key={a.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/50">
                <div>
                  <div className="font-medium text-sm">{a.title}</div>
                  <div className="text-xs text-gray-400">{a.category} · {a.publishedAt}</div>
                </div>
                <button className="text-xs text-gray-400 hover:text-white">Edit</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
