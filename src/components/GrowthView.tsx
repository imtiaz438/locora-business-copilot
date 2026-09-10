import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FixItModal } from './FixItModal';
import { PriorityAction } from '../types';
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  UserCheck,
  Calendar,
  CheckSquare,
  ChevronRight,
  Plus,
  Target,
  BarChart3,
  ShieldCheck,
  AlertCircle,
  Zap,
  Users,
  Award,
  ExternalLink,
} from 'lucide-react';

interface WeeklyActionItem {
  id: string;
  number: number;
  title: string;
  impactLevel: 'high' | 'medium' | 'low'; // 🔴 🟡 🟢
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  dueDate?: string;
  actionKey: 'reviews' | 'service_page' | 'gbp_services' | 'google_post' | 'homepage_cta';
  description: string;
}

interface MonthPlanItem {
  id: string;
  text: string;
  completed: boolean;
  actionKey?: string;
}

interface MonthWeek {
  weekNumber: number;
  title: string;
  items: MonthPlanItem[];
}

export const GrowthView: React.FC = () => {
  const {
    activeBusiness,
    priorityActions,
    setActiveTab,
    logActivity,
    addLocalSeoItem,
    addDocument,
  } = useApp();

  // Growth Score and 4 Pillar Metrics from User Specs
  const growthScore = activeBusiness.healthScore || 78;
  const metrics = [
    { label: 'Visibility', score: 72, target: 85, color: 'emerald' },
    { label: 'Trust', score: 84, target: 90, color: 'blue' },
    { label: 'Conversion', score: 76, target: 85, color: 'amber' },
    { label: 'Reputation', score: 81, target: 90, color: 'purple' },
  ];

  // SECTION 9: AI WEEKLY PLAN - 5 Highest-Impact Actions
  const [weeklyActions, setWeeklyActions] = useState<WeeklyActionItem[]>([
    {
      id: 'act_1',
      number: 1,
      title: `Respond to ${activeBusiness.unansweredReviews || 17} reviews`,
      impactLevel: 'high',
      status: 'pending',
      actionKey: 'reviews',
      description: 'Clear Google review backlog to lift Local Map Pack ranking signals and boost conversion.',
    },
    {
      id: 'act_2',
      number: 2,
      title: 'Fix missing service page',
      impactLevel: 'high',
      status: 'pending',
      actionKey: 'service_page',
      description: `Deploy dedicated /services landing page with LocalBusiness schema for local search volume.`,
    },
    {
      id: 'act_3',
      number: 3,
      title: 'Add core GBP services',
      impactLevel: 'medium',
      status: 'pending',
      actionKey: 'gbp_services',
      description: 'Sync specialized sub-services and category attributes to Google listing.',
    },
    {
      id: 'act_4',
      number: 4,
      title: 'Publish Google post',
      impactLevel: 'medium',
      status: 'pending',
      actionKey: 'google_post',
      description: 'Launch seasonal promotion or service spotlight with direct contact link.',
    },
    {
      id: 'act_5',
      number: 5,
      title: 'Update homepage CTA',
      impactLevel: 'low',
      status: 'pending',
      actionKey: 'homepage_cta',
      description: 'Optimize high-intent contact button in hero banner to boost direct inquiry conversions.',
    },
  ]);

  // SECTION 8: THIS MONTH'S PLAN (Week 1 to Week 4)
  const [monthPlan, setMonthPlan] = useState<MonthWeek[]>([
    {
      weekNumber: 1,
      title: 'Week 1',
      items: [
        { id: 'w1_1', text: 'Audit GBP services', completed: true, actionKey: 'gbp_services' },
        { id: 'w1_2', text: 'Respond to customer reviews', completed: true, actionKey: 'reviews' },
      ],
    },
    {
      weekNumber: 2,
      title: 'Week 2',
      items: [
        { id: 'w2_1', text: 'Create high-intent service page', completed: false, actionKey: 'service_page' },
        { id: 'w2_2', text: 'Add client FAQ content', completed: false, actionKey: 'faq' },
      ],
    },
    {
      weekNumber: 3,
      title: 'Week 3',
      items: [
        { id: 'w3_1', text: 'Publish 2 Google posts', completed: false, actionKey: 'google_post' },
      ],
    },
    {
      weekNumber: 4,
      title: 'Week 4',
      items: [
        { id: 'w4_1', text: 'Competitor review', completed: false, actionKey: 'competitors' },
      ],
    },
  ]);

  // Modals and Action Triggers
  const [assignModalAction, setAssignModalAction] = useState<WeeklyActionItem | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState('Dr. Sarah Jenkins (Owner)');
  const [assignDueDate, setAssignDueDate] = useState('This Friday');
  const [assignNote, setAssignNote] = useState('High priority for local ranking.');

  const [activeFixItAction, setActiveFixItAction] = useState<PriorityAction | null>(null);
  const [quickServiceModalOpen, setQuickServiceModalOpen] = useState(false);
  const [ctaModalOpen, setCtaModalOpen] = useState(false);

  // Toggle month plan item completion
  const handleToggleMonthItem = (weekIndex: number, itemId: string) => {
    setMonthPlan((prev) =>
      prev.map((w, wIdx) => {
        if (wIdx !== weekIndex) return w;
        return {
          ...w,
          items: w.items.map((it) =>
            it.id === itemId ? { ...it, completed: !it.completed } : it
          ),
        };
      })
    );
  };

  // Execution Handler: [ Do It ]
  const handleDoIt = (action: WeeklyActionItem) => {
    if (action.actionKey === 'reviews') {
      setActiveTab('reputation');
      return;
    }

    if (action.actionKey === 'service_page') {
      const emergencyAction = priorityActions.find((a) => a.id.includes('emergency')) || priorityActions[0];
      setActiveFixItAction(emergencyAction);
      return;
    }

    if (action.actionKey === 'gbp_services') {
      setQuickServiceModalOpen(true);
      return;
    }

    if (action.actionKey === 'google_post') {
      setActiveTab('ai_manager');
      return;
    }

    if (action.actionKey === 'homepage_cta') {
      setCtaModalOpen(true);
      return;
    }
  };

  // Assign Handler: [ Assign ]
  const handleConfirmAssign = () => {
    if (!assignModalAction) return;

    setWeeklyActions((prev) =>
      prev.map((a) =>
        a.id === assignModalAction.id
          ? {
              ...a,
              assignedTo: selectedAssignee,
              dueDate: assignDueDate,
              status: 'in_progress',
            }
          : a
      )
    );

    logActivity(
      'task',
      `Action Assigned: ${assignModalAction.title}`,
      `Assigned to ${selectedAssignee} (Due: ${assignDueDate})`
    );

    setAssignModalAction(null);
  };

  const getImpactBadge = (level: WeeklyActionItem['impactLevel']) => {
    if (level === 'high') {
      return (
        <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>🔴 High Impact</span>
        </span>
      );
    }
    if (level === 'medium') {
      return (
        <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>🟡 Medium Impact</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>🟢 Optimization</span>
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto font-sans text-slate-900 space-y-8 pb-20">
      {/* 1. TOP HEADER & GROWTH SCORE */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                Operating System Overview
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              Growth
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-emerald-50/80 border border-emerald-200/90 px-4 py-2.5 rounded-2xl">
            <TrendingUp className="w-5 h-5 text-[#059669]" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-heading block">
                Current Growth Score
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-heading text-emerald-950">
                  {growthScore}
                </span>
                <span className="text-xs font-bold text-[#059669]">/ 100</span>
                <span className="text-[11px] font-bold text-[#059669] bg-emerald-100/90 px-1.5 py-0.2 rounded ml-1">
                  +6 this month
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* This Month 4 Pillars Breakdown (Visibility 72, Trust 84, Conversion 76, Reputation 81) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              This Month
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Live Aggregate Benchmark
            </span>
          </div>

          <div className="h-px bg-slate-200 w-full" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2 hover:bg-white hover:shadow-2xs transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{m.label}</span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    Goal: {m.target}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black font-heading text-slate-900">
                    {m.score}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                    Good
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      m.color === 'emerald'
                        ? 'bg-[#059669]'
                        : m.color === 'blue'
                        ? 'bg-blue-600'
                        : m.color === 'amber'
                        ? 'bg-amber-500'
                        : 'bg-purple-600'
                    }`}
                    style={{ width: `${m.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. SECTION 9: AI WEEKLY PLAN - 5 HIGHEST-IMPACT ACTIONS */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#059669] font-heading">
                THIS WEEK
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold font-heading text-slate-900">
              Your 5 highest-impact actions
            </h2>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Ranked by expected revenue and Google Maps velocity
          </span>
        </div>

        <div className="space-y-3">
          {weeklyActions.map((action) => (
            <div
              key={action.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs group"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center font-heading">
                    {action.number}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-heading">
                    {action.title}
                  </h3>
                  {getImpactBadge(action.impactLevel)}

                  {action.assignedTo && (
                    <span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      <span>{action.assignedTo} ({action.dueDate})</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  {action.description}
                </p>
              </div>

              {/* Action Buttons: Execute Task or Assign */}
              <div className="flex items-center gap-2 shrink-0 pl-8 md:pl-0">
                <button
                  onClick={() => handleDoIt(action)}
                  className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer font-sans"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Execute Task</span>
                </button>

                <button
                  onClick={() => setAssignModalAction(action)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer font-sans"
                >
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assign</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SECTION 8: THIS MONTH'S PLAN (Week 1 to Week 4) */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
              Cadence & Roadmap
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold font-heading text-slate-900">
              THIS MONTH'S PLAN
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-[#059669] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              2 of 6 Completed
            </span>
          </div>
        </div>

        {/* 4-Week Column / Stack Structure */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {monthPlan.map((week, wIdx) => {
            const allDone = week.items.every((it) => it.completed);
            return (
              <div
                key={week.weekNumber}
                className={`p-5 rounded-2xl border transition-all space-y-3.5 ${
                  allDone
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                  <h4 className="text-sm font-bold font-heading text-slate-900">
                    {week.title}
                  </h4>
                  {allDone ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Done
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      In Flight
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {week.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleMonthItem(wIdx, item.id)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${
                        item.completed
                          ? 'bg-emerald-100/60 text-emerald-950 font-medium'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/80 font-normal'
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-xs ${item.completed ? 'line-through text-slate-500' : ''}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. GOALS & SYSTEM METRICS */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-heading">
              Strategic Target
            </span>
            <h3 className="text-lg font-bold font-heading">
              Next Milestone: Reach 85 Growth Score
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('ai_manager')}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult AI Manager</span>
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          Completing the 5 highest-impact actions this week is projected to lift {activeBusiness.name}'s Google Maps calls by <strong>+28%</strong> and push your growth score to <strong>84/100</strong>.
        </p>
      </section>

      {/* ASSIGN ACTION MODAL */}
      {assignModalAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                  Delegate Task
                </span>
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Assign Action
                </h3>
              </div>
              <button
                onClick={() => setAssignModalAction(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Task:</span>
                <p className="text-slate-600">{assignModalAction.title}</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Assign To Team Member</label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                >
                  <option>Dr. Sarah Jenkins (Owner)</option>
                  <option>Front Desk & Patient Intake</option>
                  <option>Michael Torres (Growth & SEO)</option>
                  <option>Locora Agency Partner</option>
                  <option>Office Manager</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Target Due Date</label>
                <select
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                >
                  <option>Today (Urgent)</option>
                  <option>This Friday</option>
                  <option>Within 7 Days</option>
                  <option>End of Month</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Notes & Context</label>
                <input
                  type="text"
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setAssignModalAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssign}
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK GBP SERVICES ADDER MODAL */}
      {quickServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-heading">
                  Google Business Profile
                </span>
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Add 4 High-Demand GBP Services
                </h3>
              </div>
              <button
                onClick={() => setQuickServiceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Adding structured primary capabilities to your Google listing directly expands search queries you rank for on Google Maps in {activeBusiness.city || 'your area'}.
            </p>

            <div className="space-y-2 text-xs">
              {[
                { name: `${activeBusiness.category || 'Core Service'} Consultation`, desc: `Immediate priority inquiry triage and consultation for ${activeBusiness.name}.` },
                { name: 'Comprehensive Operational Assessment', desc: 'Detailed diagnostic evaluation and transparent scope estimate.' },
                { name: 'Priority Rapid Turnaround Service', desc: 'Expedited service dispatch and dedicated account attention.' },
                { name: 'Ongoing Support & Preventative Maintenance', desc: 'Scheduled follow-ups and long-term customer care.' },
              ].map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900">{s.name}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">{s.desc}</p>
                  </div>
                  <span className="text-[#059669] font-bold shrink-0">✓ Ready</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setQuickServiceModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  logActivity('gbp', 'Core Services Synced', `Added primary services for ${activeBusiness.name}`);
                  setQuickServiceModalOpen(false);
                  alert('Successfully synced core services to Google Business Profile!');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Sync to Google Maps
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOMEPAGE CTA OPTIMIZER MODAL */}
      {ctaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] font-heading">
                  Conversion Rate Optimization
                </span>
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Update Homepage Call-to-Action
                </h3>
              </div>
              <button
                onClick={() => setCtaModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Replacing the passive generic "Contact Us" button with direct high-intent action copy increases mobile conversions by <strong>+34%</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                <span className="font-bold text-rose-900">Current Hero Button:</span>
                <div className="text-slate-600 font-mono bg-white p-2 rounded border border-rose-100">
                  "Contact Us" → /contact (Conversion: 2.1%)
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-950">Recommended High-Converting Button:</span>
                <div className="text-emerald-900 font-mono bg-white p-2 rounded border border-emerald-100">
                  "Schedule Service Now" → {activeBusiness.phone ? `tel:${activeBusiness.phone.replace(/[^0-9+]/g, '')}` : '/contact'} (Expected: 5.8%)
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setCtaModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logActivity('cro', 'Homepage CTA Optimized', 'Set to "Schedule Service Now"');
                  setCtaModalOpen(false);
                  alert('Homepage hero CTA draft created and queued for deployment!');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Deploy Optimized CTA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controlled Fix It Execution Modal */}
      <FixItModal
        action={activeFixItAction}
        onClose={() => setActiveFixItAction(null)}
      />
    </div>
  );
};
