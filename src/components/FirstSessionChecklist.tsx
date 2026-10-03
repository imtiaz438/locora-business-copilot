import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Circle, X, User, Link2, Wrench } from 'lucide-react';

const DISMISS_KEY = 'locora_first_session_checklist_dismissed';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  done: boolean;
  icon: React.ReactNode;
  actionLabel: string;
  onAction: () => void;
}

/**
 * First-session checklist: profile → Google Business Profile → first Fix-It.
 * Completion is derived from real state (never assumed). Hides itself once
 * every step is done; dismissible via localStorage.
 */
export const FirstSessionChecklist: React.FC = () => {
  const {
    businessTruth,
    activeBusiness,
    priorityActions,
    setActiveTab,
    setIsGbpSyncModalOpen,
  } = useApp();

  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  const businessName = businessTruth?.name ?? activeBusiness?.name ?? null;
  const businessCategory = businessTruth?.category ?? activeBusiness?.category ?? null;
  const businessCity =
    businessTruth?.locations?.find((l) => l.isPrimary)?.city ??
    businessTruth?.locations?.[0]?.city ??
    activeBusiness?.city ??
    null;
  const businessServices = businessTruth?.services ?? activeBusiness?.services ?? null;
  const isGoogleConnected = businessTruth?.googleProfile
    ? businessTruth.googleProfile.connected
    : Boolean(activeBusiness?.gbpConnected);

  const profileDone = Boolean(businessName && businessCategory && (businessCity || (businessServices && businessServices.length > 0)));
  const gbpDone = isGoogleConnected;
  const fixItDone =
    priorityActions.some((a) => a.isFixed) || (priorityActions.length === 0 && isGoogleConnected);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {}
    setDismissed(true);
  };

  if (dismissed || (profileDone && gbpDone && fixItDone)) return null;

  const scrollToFixIt = () => {
    const el = document.getElementById('fixit-actions');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const items: ChecklistItem[] = [
    {
      id: 'profile',
      title: 'Complete your business profile',
      description: 'Name, category, services, and service area power every AI feature.',
      done: profileDone,
      icon: <User className="w-4 h-4" />,
      actionLabel: 'Complete profile',
      onAction: () => setActiveTab('settings'),
    },
    {
      id: 'gbp',
      title: 'Connect Google Business Profile',
      description: 'Unlocks live reviews, ratings, and local 3-pack visibility.',
      done: gbpDone,
      icon: <Link2 className="w-4 h-4" />,
      actionLabel: 'Connect Google',
      onAction: () => setIsGbpSyncModalOpen(true),
    },
    {
      id: 'fixit',
      title: 'Run your first Fix-It',
      description: 'Pick a priority action below and generate your first AI fix.',
      done: fixItDone,
      icon: <Wrench className="w-4 h-4" />,
      actionLabel: 'View Fix-Its',
      onAction: scrollToFixIt,
    },
  ];

  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-4 shadow-xs relative">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss checklist"
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center justify-between pr-6">
        <h3 className="text-sm font-bold text-slate-900 font-heading">
          Getting started — {doneCount} of {items.length} complete
        </h3>
        <div className="w-28 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#059669] rounded-full transition-all"
            style={{ width: `${Math.round((doneCount / items.length) * 100)}%` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl border p-4 space-y-2 bg-white ${item.done ? 'border-emerald-200' : 'border-slate-200'}`}
          >
            <div className="flex items-center gap-2">
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300" />
              )}
              <span className="text-emerald-700">{item.icon}</span>
              <span className={`text-xs font-bold ${item.done ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                {item.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">{item.description}</p>
            {!item.done && (
              <button
                type="button"
                onClick={item.onAction}
                className="text-[11px] font-bold text-[#059669] hover:underline cursor-pointer"
              >
                {item.actionLabel} →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
