import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Circle,
  Building2,
  Users,
  FileSpreadsheet,
  MapPin,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';

export const ActivationChecklist: React.FC = () => {
  const {
    businessProfile,
    customers,
    invoices,
    localSeoItems,
    latestWebsiteAudit,
    setActiveTab,
  } = useApp();

  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('locora_activation_dismissed') === 'true';
  });

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('locora_activation_dismissed', 'true');
  };

  if (dismissed) return null;

  const steps = [
    {
      id: 'profile',
      title: 'Complete Business Profile',
      desc: 'Add company name, services, and branding details for AI accuracy.',
      isDone: Boolean(businessProfile.name && businessProfile.email),
      tab: 'settings',
      icon: Building2,
    },
    {
      id: 'client',
      title: 'Add First Client or Lead',
      desc: 'Create a client record to track proposals, deals, and invoices.',
      isDone: customers.length > 0,
      tab: 'crm',
      icon: Users,
    },
    {
      id: 'invoice',
      title: 'Generate First Invoice',
      desc: 'Issue a professional PDF invoice with automated tax calculation.',
      isDone: invoices.length > 0,
      tab: 'invoices',
      icon: FileSpreadsheet,
    },
    {
      id: 'seo',
      title: 'Run Local SEO Audit or Assistant',
      desc: 'Generate Google Business Profile content or audit website health.',
      isDone: localSeoItems.length > 0 || latestWebsiteAudit !== null,
      tab: 'local_seo',
      icon: MapPin,
    },
  ];

  const completedCount = steps.filter((s) => s.isDone).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  // Auto hide if 100% complete
  if (completedCount === steps.length) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white border border-emerald-800/60 rounded-3xl p-6 shadow-lg relative overflow-hidden font-sans">
      {/* Glow background accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between relative z-10 mb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guided Activation Checklist</span>
          </div>
          <h3 className="text-xl font-bold font-heading tracking-tight text-white">
            Set Up Your Business Operating System
          </h3>
          <p className="text-xs text-slate-300 max-w-xl font-sans">
            Complete these 4 foundational steps to activate automated CRM, invoicing, and AI copilot capabilities for your business.
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          title="Dismiss checklist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 mb-6 relative z-10">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-emerald-300">{completedCount} of {steps.length} Steps Completed</span>
          <span className="text-slate-300">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className="bg-[#059669] h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              onClick={() => setActiveTab(step.tab)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                step.isDone
                  ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-100'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${step.isDone ? 'bg-emerald-900/60 text-emerald-300' : 'bg-slate-700 text-slate-300'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {step.isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold font-heading text-white">{step.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{step.desc}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] font-semibold border-t border-white/5">
                <span className={step.isDone ? 'text-emerald-400' : 'text-emerald-400 hover:underline'}>
                  {step.isDone ? 'Completed' : 'Start Task'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
