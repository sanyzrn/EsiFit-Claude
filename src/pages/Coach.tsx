import { useState, useEffect } from 'react';
import { GraduationCap, Users, MessageSquare, BarChart3, User, Target } from 'lucide-react';
import { getState, subscribe } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { PageContainer } from '@/components/ui/PageContainer';

export default function Coach() {
  const [state, setState] = useState(getState());
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('clients');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  useEffect(() => { const u = subscribe(() => setState(getState())); return () => { u(); }; }, []);

  // RoleGate in App.tsx handles access
  if (!state.currentUser) return null;

  const clients = [
    { id: 'c1', name: 'John Smith', goal: 'Muscle Gain', tier: 'VIP', weight: '82 kg', lastActive: '2 hours ago', progress: '+3 kg muscle' },
    { id: 'c2', name: 'Lisa Davis', goal: 'Fat Loss', tier: 'ELITE', weight: '68 kg', lastActive: '1 day ago', progress: '-5 kg fat' },
    { id: 'c3', name: 'Alex Wong', goal: 'Strength', tier: 'VIP', weight: '90 kg', lastActive: '3 hours ago', progress: '+15 kg squat' },
  ];

  const tabs = [
    { id: 'clients', icon: Users, label: t({ en: 'My Clients', fa: 'مشتریان من' }) },
    { id: 'messages', icon: MessageSquare, label: t({ en: 'Messages', fa: 'پیام‌ها' }) },
    { id: 'programs', icon: Target, label: t({ en: 'Program Builder', fa: 'سازنده برنامه' }) },
  ];

  const client = clients.find(c => c.id === selectedClient);

  return (
    <PageContainer padY="md">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black">{t({ en: 'Coach Dashboard', fa: 'داشبورد مربی' })}</h1>
          <p className="text-sm text-fg-subtle">{t({ en: 'Manage your clients and programs', fa: 'مدیریت مشتریان و برنامه‌های خود' })}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-orange-500 text-white' : 'bg-elevated text-fg-muted hover:bg-elevated-hover'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'clients' && (
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-fg-subtle uppercase tracking-wider">{t({ en: 'Active Clients', fa: 'مشتریان فعال' })} ({clients.length})</h3>
            {clients.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedClient(c.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  selectedClient === c.id ? 'bg-elevated border-orange-500/30' : 'bg-surface border-border hover:border-strong'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-sm">
                    {c.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{c.name}</div>
                    <div className="text-xs text-fg-subtle">{c.goal} · {c.tier}</div>
                  </div>
                </div>
                <div className="text-xs text-fg-faint mt-2">{t({ en: 'Last active:', fa: 'آخرین فعالیت:' })} {c.lastActive}</div>
              </button>
            ))}
          </div>

          <div className="md:col-span-2">
            {client ? (
              <div className="space-y-4">
                <div className="bg-surface border border-border rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-2xl">
                      {client.name[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-black">{client.name}</h2>
                      <div className="text-sm text-fg-subtle">{client.goal} · {client.weight} · {client.tier}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-elevated rounded-lg p-3 text-center">
                      <div className="text-sm text-fg-subtle">{t({ en: 'Weight', fa: 'وزن' })}</div>
                      <div className="font-bold">{client.weight}</div>
                    </div>
                    <div className="bg-elevated rounded-lg p-3 text-center">
                      <div className="text-sm text-fg-subtle">{t({ en: 'Progress', fa: 'پیشرفت' })}</div>
                      <div className="font-bold text-green-400">{client.progress}</div>
                    </div>
                    <div className="bg-elevated rounded-lg p-3 text-center">
                      <div className="text-sm text-fg-subtle">{t({ en: 'Last Active', fa: 'آخرین فعالیت' })}</div>
                      <div className="font-bold text-sm">{client.lastActive}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6">
                  <h3 className="font-bold mb-4">{t({ en: 'Body Log History', fa: 'تاریخچه لاگ بدن' })}</h3>
                  <div className="space-y-2">
                    {[
                      { date: 'Dec 15', weight: '82 kg', bf: '16%' },
                      { date: 'Dec 8', weight: '81.5 kg', bf: '16.5%' },
                      { date: 'Dec 1', weight: '81 kg', bf: '17%' },
                      { date: 'Nov 24', weight: '80 kg', bf: '17.5%' },
                    ].map((log, i) => (
                      <div key={i} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                        <span className="text-fg-subtle">{log.date}</span>
                        <span>{log.weight}</span>
                        <span className="text-orange-400">{log.bf}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">
                    <Target className="w-4 h-4" /> {t({ en: 'Assign Program', fa: 'تخصیص برنامه' })}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-elevated-hover text-fg font-bold rounded-lg hover:bg-elevated-hover transition-colors">
                    <MessageSquare className="w-4 h-4" /> {t({ en: 'Send Message', fa: 'ارسال پیام' })}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-xl p-12 text-center">
                <User className="w-12 h-12 mx-auto mb-3 text-fg-faint" />
                <p className="text-fg-subtle">{t({ en: 'Select a client to view their details', fa: 'برای مشاهده جزئیات، یک مشتری انتخاب کنید' })}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-surface border border-border rounded-xl p-8 text-center animate-fade-in">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-fg-faint" />
          <h3 className="font-bold text-lg mb-2">Client Messages</h3>
          <p className="text-fg-subtle text-sm">Messages from your VIP and Elite clients will appear here.</p>
          <div className="mt-6 space-y-3 text-left max-w-lg mx-auto">
            {clients.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 bg-elevated rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-sm">{c.name[0]}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-fg-subtle">Thanks for the program update!</div>
                </div>
                <div className="text-xs text-fg-faint">2h ago</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'programs' && (
        <div className="bg-surface border border-border rounded-xl p-8 text-center animate-fade-in">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-fg-faint" />
          <h3 className="font-bold text-lg mb-2">Program Builder</h3>
          <p className="text-fg-subtle text-sm mb-4">Create and customize training programs for your clients.</p>
          <button className="px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">
            + Create New Program
          </button>
        </div>
      )}
    </PageContainer>
  );
}
