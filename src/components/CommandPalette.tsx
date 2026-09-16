import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Bot,
  Sparkles,
  ArrowRight,
  X,
  Star,
  Users,
  Briefcase,
  Crosshair,
  BarChart3,
  Building2,
  FileText,
  MapPin,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const {
    setActiveTab,
    switchBusiness,
    activeBusiness,
    customers,
    invoices,
    documents,
    businesses,
    logActivity,
  } = useApp();

  const [query, setQuery] = useState('');

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fast Action Shortcuts
  const intentActions = useMemo(
    () => [
      {
        triggers: ['service page', 'landing page', 'improve rank', 'content studio', 'new page', 'seo page'],
        title: 'Create high-intent service page',
        destination: 'Content Studio → Service Page Generator',
        icon: FileText,
        badge: 'Content Studio',
        color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
        execute: () => {
          setActiveTab('content');
          logActivity('ai_search', 'Action Executed', 'Opened Content Studio for Service Page Generator');
        },
      },
      {
        triggers: ['reviews', 'unanswered', 'fix reviews', 'review inbox', 'fix unanswered reviews', 'reply reviews'],
        title: 'Fix unanswered reviews',
        destination: 'Review Inbox → Unanswered',
        icon: Star,
        badge: 'Reputation',
        color: 'text-amber-800 bg-amber-50 border-amber-200',
        execute: () => {
          setActiveTab('reputation');
          logActivity('ai_search', 'Action Executed', 'Navigated to Review Inbox: Unanswered');
        },
      },
      {
        triggers: ['who is beating me', 'competitor', 'competitors', 'beating me', 'rivals'],
        title: 'Who is beating me?',
        destination: 'Competitor Intelligence',
        icon: Crosshair,
        badge: 'Competitors',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        execute: () => {
          setActiveTab('competitors');
          logActivity('ai_search', 'Action Executed', 'Navigated to Competitors view');
        },
      },
      {
        triggers: ['create proposal', 'proposal', 'new proposal', 'draft proposal', 'generate proposal'],
        title: 'Create proposal',
        destination: 'Work → Proposals → New',
        icon: Briefcase,
        badge: 'Work Hub',
        color: 'text-purple-800 bg-purple-50 border-purple-200',
        execute: () => {
          setActiveTab('work');
          logActivity('ai_search', 'Action Executed', 'Opened Work → Proposals');
        },
      },
      {
        triggers: ['monthly report', 'report', 'growth report', 'monthly growth', 'pdf report'],
        title: 'Monthly report',
        destination: 'Monthly Growth Report',
        icon: BarChart3,
        badge: 'Reports',
        color: 'text-blue-800 bg-blue-50 border-blue-200',
        execute: () => {
          setActiveTab('reports');
          logActivity('ai_search', 'Action Executed', 'Opened Monthly Growth Report');
        },
      },
      {
        triggers: ['business brain', 'brain', 'client profile', 'active business', 'workspace info'],
        title: `${activeBusiness.name} Business Brain`,
        destination: `${activeBusiness.name} Knowledge Base`,
        icon: Building2,
        badge: 'Business Brain',
        color: 'text-orange-700 bg-orange-50 border-orange-200',
        execute: () => {
          setActiveTab('business_brain');
          logActivity('ai_search', 'Action Executed', `Opened ${activeBusiness.name} Business Brain`);
        },
      },
      {
        triggers: ['add customer', 'new customer', 'customer', 'lead', 'add contact', 'crm'],
        title: 'Add customer',
        destination: 'Customers → New Customer form',
        icon: Users,
        badge: 'Customers',
        color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
        execute: () => {
          setActiveTab('customers');
          logActivity('ai_search', 'Action Executed', 'Opened Customers CRM');
        },
      },
    ],
    [setActiveTab, switchBusiness, logActivity]
  );

  if (!isOpen) return null;

  // Filter intent actions based on user typing
  const matchedActions = query.trim()
    ? intentActions.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.destination.toLowerCase().includes(q) ||
          item.triggers.some((t) => t.includes(q) || q.includes(t))
        );
      })
    : intentActions; // Show all 7 actions by default for instant one-click execution!

  const handleExecute = (actionFn: () => void) => {
    actionFn();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-sans overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleUp mb-8">
        {/* Search Header strictly reflecting Section 27 Spec: [ ⌘ K  Ask Locora anything... ] */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" />
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Locora anything... (e.g. 'Review ranking opportunities', 'Who is outranking me?')"
              className="w-full bg-transparent border-0 text-sm font-semibold text-slate-900 focus:outline-none placeholder-slate-400 font-sans"
              autoFocus
            />
          </div>

          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-bold px-1"
            >
              Clear
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Results Container */}
        <div className="max-h-[460px] overflow-y-auto p-3 sm:p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-heading flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-[#059669]" />
                <span>Locora Autonomous Actions</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {matchedActions.length} Actions Available
              </span>
            </div>

            <div className="space-y-1.5">
              {matchedActions.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleExecute(act.execute)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-emerald-50/60 hover:border-emerald-200 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-[#059669] group-hover:border-emerald-300 transition-colors shadow-2xs shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 font-heading group-hover:text-[#059669] transition-colors">
                          "{act.title}"
                        </h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span>Opens:</span>
                          <strong className="text-slate-700 font-semibold">{act.destination}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${act.color}`}>
                        {act.badge}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#059669] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}

              {matchedActions.length === 0 && (
                <div className="p-8 text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    No predefined intent matches "{query}". Ask Locora AI directly:
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('ai_manager');
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#059669] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Ask AI Manager →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-sans px-5">
          <div className="flex items-center gap-2">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-600">Esc</kbd> to close</span>
            <span>•</span>
            <span>Click any action to execute immediately</span>
          </div>
          <span className="font-mono text-[#059669] font-semibold">Locora OS</span>
        </div>
      </div>
    </div>
  );
};
