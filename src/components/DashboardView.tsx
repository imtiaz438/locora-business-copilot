import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LocoraLogo } from './LocoraLogo';
import { ActivationChecklist } from './ActivationChecklist';
import { BrandVoiceWizardModal } from './BrandVoiceWizardModal';
import { ShareableReportCardModal } from './ShareableReportCardModal';
import { ReferralAskModal } from './ReferralAskModal';
import {
  TrendingUp,
  Users,
  FileSpreadsheet,
  MessageSquareText,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Globe,
  MapPin,
  DollarSign,
  FileText,
  Activity,
  Plus,
  Briefcase,
  AlertCircle,
  Mic,
  Share2,
  Trophy,
  Database,
  GraduationCap,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    businessProfile,
    customers,
    invoices,
    conversations,
    projects,
    proposals,
    activityLogs,
    setActiveTab,
    createConversation,
    updateProject,
    user,
  } = useApp();

  const [showBrandVoiceModal, setShowBrandVoiceModal] = useState(false);
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);

  const isUnlimited = false;
  const usedCredits = user.aiCreditsUsed || 0;
  const limitCredits = user.monthlyAiCredits || 25;
  const remainingCredits = Math.max(0, limitCredits - usedCredits);
  const creditPercent = Math.min(100, Math.round((usedCredits / limitCredits) * 100));

  const handleStartChat = () => {
    createConversation('Business Strategy Session');
    setActiveTab('chat');
  };

  // Live Database Metrics
  const activeCustomers = customers.filter((c) => c.status === 'client' || c.status === 'proposal_sent');
  const activeProjects = projects.filter((p) => p.status === 'in_progress' || p.status === 'planning');

  // Collect all project tasks
  const allProjectTasks = projects.flatMap((p) =>
    (p.tasks || []).map((t) => ({ ...t, projectId: p.id, projectTitle: p.title }))
  );
  const completedTasksCount = allProjectTasks.filter((t) => t.completed).length;

  // Revenue totals
  const totalPaidRevenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + (Number(i.total) || 0), 0);

  const totalPendingRevenue = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + (Number(i.total) || 0), 0);

  // Dynamic calculation for health & growth scores based strictly on real workspace activity added by user
  const totalInvoicesCount = invoices.length;
  const paidInvoicesCount = invoices.filter((i) => i.status === 'paid').length;
  const paidInvoiceRatio = totalInvoicesCount > 0 ? (paidInvoicesCount / totalInvoicesCount) * 30 : 0;
  const customerScore = Math.min(40, customers.length * 10);
  const invoiceScore = Math.min(30, paidInvoicesCount * 15) + Math.round(paidInvoiceRatio);
  const profileScore = businessProfile.name && businessProfile.name !== 'My Business Workspace' ? 20 : 0;
  const healthScore = Math.min(100, customerScore + invoiceScore + profileScore);

  // Growth Velocity (0 - 100)
  const projectScore = Math.min(40, projects.length * 15);
  const taskScore = Math.min(30, completedTasksCount * 10);
  const chatScore = Math.min(15, conversations.length * 5);
  const proposalScore = Math.min(15, proposals.length * 5);
  const growthScore = Math.min(100, projectScore + taskScore + chatScore + proposalScore);

  const handleToggleTask = (projectId: string, taskId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    const updatedTasks = (proj.tasks || []).map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    updateProject(projectId, { tasks: updatedTasks });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans text-slate-900">
      {/* Top Banner / Hero Workspace Greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#034e38] via-[#047857] to-[#065f46] p-6 md:p-8 shadow-md text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-100 text-xs font-semibold">
              <LocoraLogo assetType="hero" size={18} className="w-4 h-4" />
              <span>Locora AI Workspace • Live PostgreSQL Connected</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-heading text-white tracking-tight">
              Welcome back, {businessProfile.name || 'Business Owner'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed font-sans">
              Your business copilot is monitoring {customers.length} client record{customers.length === 1 ? '' : 's'}, {projects.length} project{projects.length === 1 ? '' : 's'}, and live database reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartChat}
              className="px-4 py-2.5 rounded-xl bg-white text-[#047857] hover:bg-emerald-50 text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer font-sans"
            >
              <MessageSquareText className="w-4 h-4 text-[#059669]" />
              <span>Open AI Copilot</span>
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer font-sans"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Create Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guided Activation Checklist */}
      <ActivationChecklist />

      {/* Metrics Row: Business Health & Growth Score */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Business Health */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-heading">Business Health</span>
            <ShieldCheck className="w-5 h-5 text-[#059669]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-heading text-slate-900">{healthScore}</span>
            <span className="text-xs font-bold text-[#059669]">/ 100</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-[#059669] h-full rounded-full transition-all duration-500" style={{ width: `${healthScore}%` }} />
          </div>
          <p className="text-xs text-slate-500 font-sans">
            {healthScore === 0 ? 'Add clients & invoices to calculate health score' : 'Calculated dynamically from live CRM & invoice data'}
          </p>
        </div>

        {/* Metric 2: Growth Velocity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-heading">Growth Velocity</span>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-heading text-slate-900">{growthScore}</span>
            <span className="text-xs font-bold text-indigo-600">{activeProjects.length} Active Proj</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${growthScore}%` }} />
          </div>
          <p className="text-xs text-slate-500 font-sans">
            {growthScore === 0 ? 'Create projects & AI sessions to increase velocity' : 'Calculated from completed tasks & active projects'}
          </p>
        </div>

        {/* Metric 3: Paid Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-heading">Collected Revenue</span>
            <DollarSign className="w-5 h-5 text-[#059669]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black font-heading text-slate-900">${totalPaidRevenue.toLocaleString()}</span>
          </div>
          <p className="text-xs text-[#059669] font-semibold font-sans">{invoices.filter((i) => i.status === 'paid').length} paid invoices</p>
        </div>

        {/* Metric 4: Pending Payments */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-heading">Pending Payments</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black font-heading text-slate-900">${totalPendingRevenue.toLocaleString()}</span>
          </div>
          <p className="text-xs text-amber-700 font-semibold font-sans">{invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').length} awaiting payment</p>
        </div>
      </div>

      {/* AI Copilot Credit Meter & Usage Criteria Card */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-md relative overflow-hidden font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Credit Meter • {user.planTier.toUpperCase()} Plan</span>
            </div>
            <h3 className="text-xl font-bold font-heading text-white">
              AI Copilot Credits & Operational Usage
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Every tool in your workspace consumes credits based on execution criteria. Monitor live usage progress below:
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> AI Chat: 1 Cr</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Docs & Local SEO: 2 Cr</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400"></span> Proposals & Marketing Plan: 5 Cr</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 md:w-80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">Credit Balance</span>
              <button
                onClick={() => setActiveTab('subscription')}
                className="text-[11px] font-bold text-emerald-400 hover:underline cursor-pointer"
              >
                Upgrade Plan →
              </button>
            </div>

            {isUnlimited ? (
              <div className="py-2 text-center text-emerald-400 font-bold text-lg flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>∞ Unlimited Credits</span>
              </div>
            ) : (
              <>
                <div className="flex items-baseline justify-between text-white font-heading">
                  <span className="text-2xl font-black">{usedCredits} <span className="text-xs text-slate-400 font-sans font-normal">/ {limitCredits} Used</span></span>
                  <span className="text-xs font-bold text-emerald-400 font-sans">{remainingCredits} Available</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${creditPercent >= 80 ? 'bg-amber-500' : 'bg-[#059669]'}`}
                    style={{ width: `${creditPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 text-right">Resets monthly</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">Quick Operational Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          <button
            onClick={handleStartChat}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center gap-2 text-center transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 font-sans">Chat AI</span>
          </button>

          <button
            onClick={() => setShowBrandVoiceModal(true)}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center gap-2 text-center transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 font-sans">Brand Voice</span>
          </button>

          <button
            onClick={() => setShowReportCardModal(true)}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center gap-2 text-center transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 font-sans">Report Card</span>
          </button>

          <button
            onClick={() => setShowReferralModal(true)}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center gap-2 text-center transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 font-sans">Referral Ask</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center gap-2 text-center transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 font-sans">New Invoice</span>
          </button>

          <button
            onClick={() => setActiveTab('proposals')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center gap-2 text-center transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 font-sans">AI Proposal</span>
          </button>

          <button
            onClick={() => setActiveTab('local_seo')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center gap-2 text-center transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 font-sans">Local SEO</span>
          </button>

          <button
            onClick={() => setActiveTab('lead_prospector')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center gap-2 text-center transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 font-sans">B2B Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('masterclass_kit')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center gap-2 text-center transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 font-sans">Agency Vault</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns (Tasks & Invoices vs. CRM & Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Spans): Priority Project Tasks & Recent Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Project Tasks */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                <h3 className="text-base font-bold font-heading text-slate-900">Project Action Items</h3>
              </div>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs font-semibold text-[#059669] hover:text-[#047857] flex items-center gap-1 cursor-pointer font-sans"
              >
                <span>View All Projects</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {allProjectTasks.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">No project tasks pending</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Create a project in the Projects workspace to assign and track client tasks automatically.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#059669] text-white text-xs font-semibold hover:bg-[#047857] transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Project</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {allProjectTasks.slice(0, 6).map((task) => (
                  <div
                    key={`${task.projectId}-${task.id}`}
                    onClick={() => handleToggleTask(task.projectId, task.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      task.completed
                        ? 'bg-slate-50 border-slate-200 opacity-60 line-through'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-[#059669] bg-slate-100 border-slate-300 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 font-sans">{task.title}</p>
                        <p className="text-[11px] text-slate-400">{task.projectTitle}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        task.completed ? 'bg-emerald-50 text-[#059669]' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.completed ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Invoices */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold font-heading text-slate-900">Recent Database Invoices</h3>
              </div>
              <button
                onClick={() => setActiveTab('invoices')}
                className="text-xs font-semibold text-[#059669] hover:text-[#047857] flex items-center gap-1 cursor-pointer font-sans"
              >
                <span>View All Invoices</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {invoices.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 font-heading">No invoices generated yet</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-sans">
                    Issue professional client invoices with itemized taxes, PDF exports, and payment tracking.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#059669] text-white text-xs font-semibold hover:bg-[#047857] transition-all inline-flex items-center gap-1.5 cursor-pointer font-sans"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate New Invoice</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {invoices.slice(0, 5).map((inv) => (
                  <div key={inv.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-heading text-slate-900">{inv.invoiceNumber}</span>
                        <span className="text-xs text-slate-500 font-sans">— {inv.customerName || 'Client'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">Issued: {inv.issueDate}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-900 font-sans">${Number(inv.total || 0).toLocaleString()}</span>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold capitalize font-sans ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-[#059669] border border-emerald-200'
                            : inv.status === 'sent'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Customers & AI Chats & Activity Feed */}
        <div className="space-y-6">
          {/* Recent Customers / Leads */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold font-heading text-slate-900">CRM Clients</h3>
              </div>
              <button
                onClick={() => setActiveTab('crm')}
                className="text-xs font-semibold text-[#059669] hover:text-[#047857] cursor-pointer font-sans"
              >
                Manage CRM
              </button>
            </div>

            {customers.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-slate-700 font-heading">No CRM contacts</p>
                <p className="text-[11px] text-slate-400 font-sans">Add client records to track deals and send AI proposals.</p>
                <button
                  onClick={() => setActiveTab('crm')}
                  className="px-3 py-1 rounded-md bg-[#059669] text-white text-xs font-semibold cursor-pointer font-sans"
                >
                  Add Customer
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {customers.slice(0, 4).map((cust) => (
                  <div key={cust.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold font-heading text-slate-900 text-xs sm:text-sm">{cust.name}</p>
                      <p className="text-xs text-slate-500 font-sans">{cust.company || cust.email}</p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase font-sans ${
                        cust.status === 'client'
                          ? 'bg-emerald-50 text-[#059669] border border-emerald-200'
                          : cust.status === 'proposal_sent'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {cust.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent AI Conversations */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareText className="w-5 h-5 text-[#059669]" />
                <h3 className="text-base font-bold font-heading text-slate-900">Recent AI Sessions</h3>
              </div>
              <button
                onClick={handleStartChat}
                className="text-xs font-semibold text-[#059669] hover:text-[#047857] cursor-pointer font-sans"
              >
                + New Chat
              </button>
            </div>

            {conversations.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-slate-700 font-heading">No active chat sessions</p>
                <p className="text-[11px] text-slate-400 font-sans">Ask AI Copilot for local business advice, strategy, or copy.</p>
                <button
                  onClick={handleStartChat}
                  className="px-3 py-1 rounded-md bg-[#059669] text-white text-xs font-semibold cursor-pointer font-sans"
                >
                  Start AI Chat
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.slice(0, 3).map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setActiveTab('chat')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition-colors"
                  >
                    <p className="font-semibold font-heading text-slate-800 text-xs sm:text-sm truncate">{conv.title}</p>
                    <p className="text-[11px] text-slate-500 font-sans">
                      {conv.messages.length} message{conv.messages.length === 1 ? '' : 's'} • {new Date(conv.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Activity Feed */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#059669]" />
                <h3 className="text-base font-bold font-heading text-slate-900">Live Activity Feed</h3>
              </div>
            </div>

            {activityLogs.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-1">
                <p className="text-xs font-bold text-slate-700 font-heading">No recent activity</p>
                <p className="text-[11px] text-slate-400 font-sans">Actions taken across CRM, invoices, and AI sessions will appear here in real time.</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600 font-sans max-h-64 overflow-y-auto">
                {activityLogs.slice(0, 6).map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-[#059669] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-slate-900 font-bold">{log.title}</p>
                      {log.description && <p className="text-[11px] text-slate-500">{log.description}</p>}
                      <p className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <BrandVoiceWizardModal isOpen={showBrandVoiceModal} onClose={() => setShowBrandVoiceModal(false)} />
      <ShareableReportCardModal isOpen={showReportCardModal} onClose={() => setShowReportCardModal(false)} />
      <ReferralAskModal isOpen={showReferralModal} onClose={() => setShowReferralModal(false)} />
    </div>
  );
};
