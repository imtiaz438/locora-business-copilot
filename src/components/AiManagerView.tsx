import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FixItModal } from './FixItModal';
import { PriorityAction } from '../types';
import { generateFullReportSnapshot } from '../services/reportEngine';
import { saveReportSnapshot } from '../services/reportStorageService';
import { exportReportToPdf } from './reports/ReportPdfExport';
import { getDirectoryBusinessUrl } from '../utils/domain';
import { trackAiChatStarted } from '../lib/analytics';
import {
  Bot,
  Sparkles,
  Send,
  ArrowRight,
  CheckCircle2,
  Check,
  Edit3,
  Save,
  Download,
  Share2,
  Settings2,
  Crosshair,
  TrendingUp,
  MapPin,
  Star,
  FileText,
  AlertTriangle,
  Loader2,
  Copy,
  ExternalLink,
  ChevronRight,
  Zap,
  CheckSquare,
  MessageSquare,
  Users,
  Calendar,
  Layers,
  AlertCircle,
  Phone,
  UserCheck,
  ListTodo,
  Briefcase,
  CalendarCheck,
  BadgeAlert,
  BarChart3,
  Globe,
  Eye,
  Building2,
  MousePointerClick,
} from 'lucide-react';

interface GooglePostDraft {
  postTitle: string;
  offerCopy: string;
  ctaText: string;
  ctaUrl: string;
  imageBrief: string;
}

interface ActionCardState {
  id: string;
  type:
    | 'business_brain_overview'
    | 'google_post'
    | 'competitor_weakness'
    | 'unanswered_reviews'
    | 'seo_opportunity'
    | 'growth_plan'
    | 'content_plan'
    | 'leads_followup'
    | 'monthly_report'
    | 'weekly_work'
    | 'directory_performance'
    | 'directory_improvement'
    | 'directory_leads_analysis'
    | 'generic';
  status: 'planning' | 'running_scan' | 'generated' | 'saved';
  prompt: string;
  scanStepIndex?: number;
  data?: any;
}

export const AiManagerView: React.FC = () => {
  const {
    user,
    activeBusiness,
    businessTruth,
    priorityActions,
    customers,
    contentRecords,
    workTasks,
    projects,
    proposals,
    invoices,
    productionDashboard,
    setActiveTab,
    consumeAiCredit,
    addDocument,
    addLocalSeoItem,
    logActivity,
    addWorkTask,
    addContentRecord,
    createAIAction,
    setSelectedAIActionForApproval,
  } = useApp();

  const businessName = businessTruth?.name ?? activeBusiness?.name ?? null;
  const businessCategory = businessTruth?.category ?? activeBusiness?.category ?? null;
  const businessCity = businessTruth?.locations?.find((l) => l.isPrimary)?.city ?? businessTruth?.locations?.[0]?.city ?? activeBusiness?.city ?? null;
  const businessState = businessTruth?.locations?.find((l) => l.isPrimary)?.state ?? businessTruth?.locations?.[0]?.state ?? activeBusiness?.state ?? null;
  const businessWebsite = businessTruth?.website ?? activeBusiness?.website ?? null;
  const businessPhone = businessTruth?.phone ?? activeBusiness?.phone ?? null;
  const businessServices = businessTruth?.services ?? activeBusiness?.services ?? null;
  const businessAddress = businessTruth?.address ?? activeBusiness?.address ?? null;

  const [inputQuery, setInputQuery] = useState('');
  const [activeCards, setActiveCards] = useState<ActionCardState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFixItAction, setSelectedFixItAction] = useState<PriorityAction | null>(null);
  const [reviewSetupModalOpen, setReviewSetupModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [createdTaskIds, setCreatedTaskIds] = useState<Record<string, boolean>>({});
  const [createdContentBatch, setCreatedContentBatch] = useState<Record<string, boolean>>({});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const actionFeedEndRef = useRef<HTMLDivElement>(null);

  // Suggested Examples from User Specs
  const exampleQueries = [
    "Create this month's content plan.",
    'Show me leads that need follow-up.',
    'Prepare my monthly report.',
    'What should I work on this week?',
    'Find my biggest SEO opportunity.',
    'Show me unanswered reviews.',
    'Analyze my competitors.',
    'How is my directory profile performing?',
    'What can I improve on my directory profile?',
    'How can I get more directory leads?',
    'Why did my directory leads change?',
  ];

  // LOCORA SUGGESTS items connected to real modules
  const locoraSuggestions = [
    {
      id: 'sugg_directory_perf',
      label: 'Directory Performance & Views',
      query: 'How is my directory profile performing?',
      type: 'leads' as const,
    },
    {
      id: 'sugg_directory_improve',
      label: 'Improve Directory Profile',
      query: 'What can I improve on my directory profile?',
      type: 'growth' as const,
    },
    {
      id: 'sugg_directory_leads',
      label: 'Get More Directory Leads',
      query: 'How can I get more directory leads?',
      type: 'leads' as const,
    },
    {
      id: 'sugg_directory_variance',
      label: 'Why Directory Leads Changed',
      query: 'Why did my directory leads change?',
      type: 'leads' as const,
    },
    {
      id: 'sugg_content_plan',
      label: "Create this month's content plan",
      query: "Create this month's content plan.",
      type: 'content' as const,
    },
    {
      id: 'sugg_leads',
      label: 'Show leads needing follow-up',
      query: 'Show me leads that need follow-up.',
      type: 'leads' as const,
    },
    {
      id: 'sugg_report',
      label: 'Prepare my monthly report',
      query: 'Prepare my monthly report.',
      type: 'report' as const,
    },
    {
      id: 'sugg_work',
      label: 'What should I work on this week?',
      query: 'What should I work on this week?',
      type: 'work' as const,
    },
    {
      id: 'sugg_reviews',
      label: 'Address unanswered reviews',
      query: 'Show me unanswered reviews.',
      type: 'reputation' as const,
    },
    {
      id: 'sugg_seo',
      label: 'Find biggest SEO opportunity',
      query: 'Find my biggest SEO opportunity.',
      type: 'content' as const,
    },
  ];

  useEffect(() => {
    actionFeedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeCards, isProcessing]);

  // Execute Action Trigger - Strictly Enforces Business Brain + Provider Data
  const handleExecute = (customPrompt?: string) => {
    const q = (customPrompt || inputQuery).trim();
    if (!q || isProcessing) return;

    trackAiChatStarted(q, 'ai_manager');

    consumeAiCredit(1);
    setInputQuery('');
    setIsProcessing(true);

    const cardId = `card_${Date.now()}`;
    const targetBusinessId = businessTruth?.businessId || activeBusiness?.id || 'biz_locora_canonical';

    const scopedCustomers = (customers || []).filter((c) => c.businessId === targetBusinessId);
    const scopedContent = (contentRecords || []).filter(
      (c) => c.business_id === targetBusinessId || (c as any).businessId === targetBusinessId
    );
    const scopedTasks = (workTasks || []).filter((t) => t.businessId === targetBusinessId);
    const scopedProjects = (projects || []).filter((p) => p.businessId === targetBusinessId);
    const scopedProposals = (proposals || []).filter((p) => p.businessId === targetBusinessId);
    const scopedInvoices = (invoices || []).filter((i) => i.businessId === targetBusinessId);

    fetch('/api/ai-manager/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId: targetBusinessId,
        query: q,
        userEmail: user?.email || 'demo@locora.ai',
        customers: scopedCustomers,
        contentRecords: scopedContent,
        workTasks: scopedTasks,
        projects: scopedProjects,
        proposals: scopedProposals,
        invoices: scopedInvoices,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        // If data is unavailable or unverified, render strict honest response
        if (!result.hasEnoughData) {
          setActiveCards((prev) => [
            {
              id: cardId,
              type: result.cardType || 'generic',
              status: 'generated',
              prompt: q,
              data: {
                text: result.answer || " I don't have enough verified data to answer this yet.",
                sourcesUsed: result.sourcesUsed || ['Business Truth'],
                hasEnoughData: false,
                missingDataReason: result.missingDataReason,
                ...(result.data || {}),
              },
            },
            ...prev,
          ]);
          return;
        }

        // When verified data exists, render the appropriate card based on the backend verified response
        const cardType = result.cardType || 'generic';
        setActiveCards((prev) => [
          {
            id: cardId,
            type: cardType,
            status: cardType === 'google_post' ? 'planning' : 'generated',
            prompt: q,
            data: result.data || { text: result.answer },
          },
          ...prev,
        ]);
      })
      .catch((err) => {
        console.error('[AI Manager Frontend Error]:', err);
        setActiveCards((prev) => [
          {
            id: cardId,
            type: 'generic',
            status: 'generated',
            prompt: q,
            data: {
              text: " I don't have enough verified data to answer this yet.",
              hasEnoughData: false,
              missingDataReason: 'Connection to verified Business Brain service failed',
            },
          },
          ...prev,
        ]);
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  // Helper: Create Content Drafts from Content Plan
  const handleCreateDraftContent = async (cardId: string, items: any[]) => {
    try {
      const targetBizId = businessTruth?.businessId || activeBusiness?.id || 'biz_locora_canonical';
      for (const item of items) {
        await addContentRecord({
          business_id: targetBizId,
          title: item.title,
          content_type: item.contentType,
          platform: item.platform,
          status: 'draft',
          source: 'business_brain',
          created_by: user.name || 'AI Growth Manager',
          AI_generated: true,
          target_service: item.targetService,
          target_location: item.targetLocation,
          body: `${item.hook}\n\nCall to Action: ${item.callToAction}\n\nStrategic Rationale: ${item.rationale}`,
        });
      }
      setCreatedContentBatch((prev) => ({ ...prev, [cardId]: true }));
      logActivity('content', 'Content Drafts Generated', `Generated ${items.length} content drafts from Business Brain Content Plan.`);
    } catch (e) {
      console.error('Failed to create content drafts:', e);
    }
  };

  // Helper: Add Content Items as Work Tasks
  const handleAddContentTasks = async (cardId: string, items: any[]) => {
    try {
      const targetBizId = businessTruth?.businessId || activeBusiness?.id || 'biz_locora_canonical';
      for (const item of items) {
        await addWorkTask({
          businessId: targetBizId,
          title: `Draft: ${item.title}`,
          description: `Target: ${item.targetService} in ${item.targetLocation}\nPlatform: ${item.platform.toUpperCase()}\nRationale: ${item.rationale}`,
          priority: 'medium',
          status: 'todo',
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        });
      }
      setCreatedTaskIds((prev) => ({ ...prev, [`batch_${cardId}`]: true }));
    } catch (e) {
      console.error('Failed to add content work tasks:', e);
    }
  };

  // Helper: Request Approval for Content Plan
  const handleRequestPlanApproval = (card: ActionCardState) => {
    const targetBizId = businessTruth?.businessId || activeBusiness?.id || 'biz_locora_canonical';
    createAIAction({
      type: 'CREATE_GROWTH_PLAN',
      title: `Approve Monthly Content Plan for ${card.data.businessName || businessName}`,
      business_id: targetBizId,
      status: 'draft',
      created_by: 'ai',
      input: {
        plannedItems: card.data.plannedItems,
        targetCity: card.data.targetCity,
      },
      isSafeInternal: false,
      explanation: {
        diagnosis: `Deploy 4-week verified content plan for ${card.data.businessName || businessName} targeting ${card.data.verifiedServices?.join(', ')} in ${card.data.targetCity}.`,
        whyItMatters: `Directly attacks verified SEO opportunity: ${card.data.topOpportunity}. Aligns with brand voice "${card.data.brandVoice}".`,
        previewSummary: 'Drafts require explicit manual review and approval before scheduling.',
        expectedImpact: 'Increases local organic impressions and captures high-intent service queries.',
      },
    });
  };

  // Helper: Create Lead Follow-up Task
  const handleCreateLeadFollowupTask = async (lead: any) => {
    try {
      const targetBizId = businessTruth?.businessId || activeBusiness?.id || 'biz_locora_canonical';
      await addWorkTask({
        businessId: targetBizId,
        title: `Follow up with ${lead.name} (${lead.service || 'Inquiry'})`,
        description: `Reason: ${lead.reason}\nLead Value: $${(lead.value || 0).toLocaleString()}\nContact: ${lead.phone || lead.email || 'Check CRM'}\nDays since activity: ${lead.daysSinceContact}`,
        priority: 'high',
        status: 'todo',
        dueDate: new Date().toISOString().split('T')[0],
      });
      setCreatedTaskIds((prev) => ({ ...prev, [lead.id]: true }));
      logActivity('work', 'Lead Follow-up Created', `Created follow-up task for stale lead ${lead.name}.`);
    } catch (e) {
      console.error('Failed to create lead task:', e);
    }
  };

  // Helper: Create All Lead Follow-up Tasks
  const handleCreateAllLeadFollowupTasks = async (cardId: string, leads: any[]) => {
    try {
      const targetBizId = businessTruth?.businessId || activeBusiness?.id || 'biz_locora_canonical';
      for (const lead of leads) {
        await addWorkTask({
          businessId: targetBizId,
          title: `Follow up with ${lead.name} (${lead.service || 'Inquiry'})`,
          description: `Reason: ${lead.reason}\nLead Value: $${(lead.value || 0).toLocaleString()}\nContact: ${lead.phone || lead.email || 'Check CRM'}\nDays since activity: ${lead.daysSinceContact}`,
          priority: 'high',
          status: 'todo',
          dueDate: new Date().toISOString().split('T')[0],
        });
        setCreatedTaskIds((prev) => ({ ...prev, [lead.id]: true }));
      }
      setCreatedTaskIds((prev) => ({ ...prev, [`leads_batch_${cardId}`]: true }));
    } catch (e) {
      console.error('Failed to create batch lead tasks:', e);
    }
  };

  // Helper: View Full Monthly Report (Generates Snapshot and Switches Tab)
  const handleViewFullReport = async () => {
    try {
      if (activeBusiness) {
        const snapshot = await generateFullReportSnapshot({
          businessId: activeBusiness.id,
          reportType: 'business_health',
          period: 'current_month',
          businessTruth,
          activeBusiness,
          productionDashboard: productionDashboard || null,
          customers: customers || [],
          invoices: invoices || [],
          proposals: proposals || [],
          workTasks: workTasks || [],
          projects: projects || [],
          contentRecords: contentRecords || [],
        });
        await saveReportSnapshot(snapshot);
      }
    } catch (e) {
      console.warn('Auto-save snapshot warning:', e);
    }
    setActiveTab('monthly_report');
  };

  // Helper: Download Monthly Report PDF
  const handleDownloadReportPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      if (activeBusiness) {
        const snapshot = await generateFullReportSnapshot({
          businessId: activeBusiness.id,
          reportType: 'business_health',
          period: 'current_month',
          businessTruth,
          activeBusiness,
          productionDashboard: productionDashboard || null,
          customers: customers || [],
          invoices: invoices || [],
          proposals: proposals || [],
          workTasks: workTasks || [],
          projects: projects || [],
          contentRecords: contentRecords || [],
        });
        exportReportToPdf(snapshot);
      }
    } catch (e) {
      console.error('Failed to generate PDF:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Helper: Add Weekly Action to Work Hub
  const handleAddWeeklyActionTask = async (action: any) => {
    try {
      const targetBizId = businessTruth?.businessId || activeBusiness?.id || 'biz_locora_canonical';
      await addWorkTask({
        businessId: targetBizId,
        title: action.taskData?.title || action.title,
        description: action.taskData?.description || action.whyItMatters,
        priority: action.urgency === 'high' ? 'high' : 'medium',
        status: 'todo',
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      });
      setCreatedTaskIds((prev) => ({ ...prev, [action.id]: true }));
      logActivity('work', 'Weekly Priority Added', `Added weekly priority to Work Hub: ${action.title}`);
    } catch (e) {
      console.error('Failed to add weekly task:', e);
    }
  };

  // Helper: Add All Weekly Actions to Work Hub
  const handleAddAllWeeklyActions = async (cardId: string, actions: any[]) => {
    try {
      const targetBizId = businessTruth?.businessId || activeBusiness?.id || 'biz_locora_canonical';
      for (const action of actions) {
        await addWorkTask({
          businessId: targetBizId,
          title: action.taskData?.title || action.title,
          description: action.taskData?.description || action.whyItMatters,
          priority: action.urgency === 'high' ? 'high' : 'medium',
          status: 'todo',
          dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        });
        setCreatedTaskIds((prev) => ({ ...prev, [action.id]: true }));
      }
      setCreatedTaskIds((prev) => ({ ...prev, [`weekly_batch_${cardId}`]: true }));
    } catch (e) {
      console.error('Failed to add all weekly tasks:', e);
    }
  };

  // Trigger Section 33 AI Action Approval Modal for Directory Recommendations
  const handleTriggerApprovalForOpportunity = (opp: any) => {
    const actionId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const actionPayload = opp.payload || {};
    const newAction: any = {
      id: actionId,
      type: opp.actionType || 'CREATE_DIRECTORY_TASK',
      title: opp.title,
      business_id: businessTruth?.businessId || activeBusiness?.id || 'biz_locora_canonical',
      input: actionPayload,
      output: typeof actionPayload === 'object' ? JSON.stringify(actionPayload, null, 2) : String(actionPayload || ''),
      status: 'draft',
      created_by: 'ai',
      isSafeInternal: false,
      explanation: {
        diagnosis: opp.diagnosis || `Directory optimization opportunity identified: ${opp.title}`,
        whyItMatters: opp.whyItMatters || 'Maximizes directory ranking, customer trust, and lead generation.',
        previewSummary: `Target Action: ${opp.actionType || 'CREATE_DIRECTORY_TASK'}\n${JSON.stringify(actionPayload, null, 2)}`,
        expectedImpact: opp.expectedImpact || 'Increased lead conversion and organic visibility',
      },
      createdAt: new Date().toISOString(),
    };
    createAIAction(newAction);
    setSelectedAIActionForApproval(newAction);
  };

  // Generate Google Post Trigger using verified Business Truth
  const handleGenerateGooglePost = (cardId: string) => {
    setActiveCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        if (c.data?.offerCopy) {
          return { ...c, status: 'generated' };
        }
        const primaryService = businessServices?.[0] || businessTruth?.services?.[0] || businessCategory || 'Professional Services';
        const primaryCity = businessCity || businessTruth?.locations?.[0]?.city || 'our service area';
        const phoneLine = businessPhone ? `\n\nContact us directly at ${businessPhone} to book.` : '';
        const addressLine = businessAddress ? `\n✓ Conveniently located at ${businessAddress}` : '';

        return {
          ...c,
          status: 'generated',
          data: {
            postTitle: `Special Offer: ${primaryService} in ${primaryCity} – ${businessName}`,
            offerCopy: `Looking for top-rated ${primaryService.toLowerCase()} in ${primaryCity}? ${businessName} provides verified, high-quality solutions tailored for you.\n\n✓ Experienced specialists\n✓ Direct communication and transparent estimates${addressLine}${phoneLine}`,
            ctaText: 'Learn More',
            ctaUrl: businessWebsite ? `https://${businessWebsite.replace(/^https?:\/\//, '')}` : 'https://maps.google.com',
            imageBrief: `Professional photo representing ${primaryService.toLowerCase()} specialists with clean lighting and modern branding.`,
          } as GooglePostDraft,
        };
      })
    );
  };

  const handleSaveGooglePost = (cardId: string, post: GooglePostDraft) => {
    const primaryService = businessServices?.[0] || businessTruth?.services?.[0] || businessCategory || 'Professional Services';
    addDocument({
      title: post.postTitle,
      type: 'google_business_post',
      content: `${post.postTitle}\n\n${post.offerCopy}\n\nCTA: ${post.ctaText} -> ${post.ctaUrl}\nImage Brief: ${post.imageBrief}`,
      prompt: `Google post for ${primaryService}`,
    });
    addLocalSeoItem({
      type: 'post',
      title: post.postTitle,
      content: `${post.postTitle}\n\n${post.offerCopy}`,
    });
    logActivity('marketing', 'Google Post Saved', post.postTitle);

    setActiveCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, status: 'saved' } : c))
    );
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scanPipelineSteps = [
    { label: 'Competitor scan', desc: `Analyzing local market rivals in ${activeBusiness.city || 'your area'}` },
    { label: 'Review analysis', desc: 'Comparing review velocity & star ratings' },
    { label: 'Service comparison', desc: 'Checking procedures & emergency offerings' },
    { label: 'Website comparison', desc: 'Benchmarking load speed & mobile UX' },
    { label: 'Local visibility', desc: 'Measuring Google Maps 3-Pack rank' },
    { label: 'AI reasoning', desc: 'Synthesizing highest ROI gap' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto font-sans text-slate-900 space-y-8 pb-20">
      {/* 1. TOP HEADER & PROMPT BOX */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#059669] flex items-center justify-center font-bold shadow-2xs">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                  Operating System Core
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
                AI Manager
              </h1>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-heading block">
              Active Profile
            </span>
            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
              {activeBusiness.name} ({activeBusiness.city}, {activeBusiness.state})
            </span>
          </div>
        </div>

        {/* What would you like to improve? */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold font-heading text-slate-800">
            What would you like to improve?
          </h2>

          <div className="relative">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleExecute();
              }}
              placeholder="Ask Locora anything..."
              className="w-full pl-5 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all font-sans shadow-2xs"
            />
            <button
              onClick={() => handleExecute()}
              disabled={isProcessing || !inputQuery.trim()}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-[#059669] hover:bg-[#047857] disabled:bg-slate-200 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed font-sans"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>Run AI</span>
            </button>
          </div>

          {/* Clickable Example Chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Examples:
            </span>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => handleExecute(ex)}
                  className="text-xs bg-slate-100/80 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200/90 transition-all cursor-pointer font-medium"
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LOCORA SUGGESTS SECTION */}
        <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#059669]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 font-heading">
                LOCORA SUGGESTS
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full font-mono">
              Live Feed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {locoraSuggestions.map((sugg) => (
              <button
                key={sugg.id}
                onClick={() => handleExecute(sugg.query)}
                className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-emerald-50/80 border border-emerald-100/90 hover:border-emerald-300 text-left transition-all group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[#059669] font-bold">→</span>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-950">
                    {sugg.label}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#059669] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. REAL-ACTION FEED (NOT CHAT-ONLY: ACTUALLY DOES THINGS!) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900">
              Active Execution Engine
            </h2>
          </div>
          {activeCards.length > 0 && (
            <button
              onClick={() => setActiveCards([])}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear Feed
            </button>
          )}
        </div>

        {activeCards.length === 0 && (
          <div className="p-8 rounded-3xl bg-white border border-dashed border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 font-heading">
              Ready to execute operations
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Ask Locora to generate Google Posts, run competitor scans, review unanswered patient feedback, or create local SEO service drafts.
            </p>
            <div className="pt-2">
              {(() => {
                const samplePrompt = activeBusiness.services?.[0]
                  ? `Create a Google post highlighting our ${activeBusiness.services[0]} service.`
                  : `Create an introductory Google update for ${activeBusiness.name || 'our business'}.`;
                return (
                  <button
                    onClick={() => handleExecute(samplePrompt)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Try: "{samplePrompt}"</span>
                  </button>
                );
              })()}
            </div>
          </div>
        )}

        {/* Render Action Cards */}
        <div className="space-y-6">
          {activeCards.map((card) => {
            return (
              <div
                key={card.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5 animate-scaleUp"
              >
                {/* Card Top: Prompt origin */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                      You
                    </span>
                    <span className="font-semibold text-slate-700 italic">"{card.prompt}"</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                    {card.type.replace('_', ' ')}
                  </span>
                </div>

                {/* CASE 1: GOOGLE POST GENERATION ("I'll create:") */}
                {card.type === 'google_post' && (
                  <div className="space-y-4">
                    {card.status === 'planning' ? (
                      <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 font-heading">
                          <Bot className="w-4 h-4 text-[#059669]" />
                          <span>Locora: I'll create:</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-emerald-100 text-slate-800 font-medium shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                            <span>✓ Google Business post</span>
                          </div>
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-emerald-100 text-slate-800 font-medium shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                            <span>✓ CTA</span>
                          </div>
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-emerald-100 text-slate-800 font-medium shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                            <span>✓ Offer copy</span>
                          </div>
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-emerald-100 text-slate-800 font-medium shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                            <span>✓ Suggested image brief</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleGenerateGooglePost(card.id)}
                          className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Generate</span>
                        </button>
                      </div>
                    ) : (
                      /* Generated Google Post with Edit, Save, Export */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              Generated.
                            </span>
                            {card.status === 'saved' && (
                              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3 text-[#059669]" /> Saved to Documents
                              </span>
                            )}
                          </div>

                          {/* Action Buttons: Edit, Save, Export */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const newCopy = prompt('Edit offer copy:', card.data?.offerCopy);
                                if (newCopy) {
                                  setActiveCards((prev) =>
                                    prev.map((c) =>
                                      c.id === card.id
                                        ? { ...c, data: { ...c.data, offerCopy: newCopy } }
                                        : c
                                    )
                                  );
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleSaveGooglePost(card.id, card.data)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] border border-emerald-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Save className="w-3 h-3" />
                              <span>Save</span>
                            </button>

                            <button
                              onClick={() => {
                                handleCopyText(
                                  card.id,
                                  `${card.data.postTitle}\n\n${card.data.offerCopy}\n\nCTA: ${card.data.ctaText} (${card.data.ctaUrl})`
                                );
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                            >
                              {copiedId === card.id ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Download className="w-3 h-3" />
                                  <span>Export</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Interactive Post Preview Card */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-heading">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>Google Business Profile Post Preview</span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 font-heading">
                            {card.data.postTitle}
                          </h4>

                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-xl border border-slate-200/80">
                            {card.data.offerCopy}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
                              <span className="font-bold text-slate-900 block mb-0.5">Call to Action:</span>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs mt-1">
                                <span>{card.data.ctaText}</span>
                                <ArrowRight className="w-3 h-3" />
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono mt-1 truncate">
                                {card.data.ctaUrl}
                              </p>
                            </div>

                            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
                              <span className="font-bold text-slate-900 block mb-0.5">Suggested Image Brief:</span>
                              <p className="text-slate-600 text-[11px] leading-relaxed">
                                {card.data.imageBrief}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CASE 2: COMPETITOR WEAKNESS SCAN PIPELINE */}
                {card.type === 'competitor_weakness' && (
                  <div className="space-y-4">
                    {card.status === 'running_scan' ? (
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-[#059669] animate-spin" />
                            Running Locora Diagnostic Pipeline...
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            Step {(card.scanStepIndex ?? 0) + 1} of 6
                          </span>
                        </div>

                        {/* Animated Step-by-Step Flow */}
                        <div className="space-y-2 pt-2">
                          {scanPipelineSteps.map((s, idx) => {
                            const isDone = (card.scanStepIndex ?? 0) > idx;
                            const isCurrent = (card.scanStepIndex ?? 0) === idx;
                            return (
                              <div
                                key={idx}
                                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                                  isDone
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
                                    : isCurrent
                                    ? 'bg-white border-[#059669] text-slate-900 font-bold shadow-2xs'
                                    : 'bg-slate-100/60 border-slate-200 text-slate-400'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                                  ) : isCurrent ? (
                                    <Loader2 className="w-4 h-4 text-[#059669] animate-spin" />
                                  ) : (
                                    <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">
                                      {idx + 1}
                                    </span>
                                  )}
                                  <span>{s.label}</span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-normal">
                                  {s.desc}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* Completed Competitor Scan Result */
                      <div className="space-y-4">
                        {/* 6-step summary tags */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-500 pb-1">
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">✓ Competitor scan</span>
                          <span>↓</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">✓ Review analysis</span>
                          <span>↓</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">✓ Service comparison</span>
                          <span>↓</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">✓ Website comparison</span>
                          <span>↓</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">✓ Local visibility</span>
                          <span>↓</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">✓ AI reasoning</span>
                        </div>

                        {/* Top Opportunity Banner */}
                        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 font-heading">
                              Top Opportunity
                            </span>
                            <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                              High Velocity
                            </span>
                          </div>

                          <h3 className="text-lg font-extrabold font-heading text-slate-900">
                            {card.data.topOpportunity}
                          </h3>

                          <p className="text-xs text-slate-700">
                            While {activeBusiness.name} averages steady customer reviews with {activeBusiness.reviewCount || 0} total, top competitors {activeBusiness.competitors?.[0] || 'in your category'} average higher monthly acquisition rates. Accelerating review velocity will protect and elevate your local Google 3-Pack prominence.
                          </p>
                        </div>

                        {/* Recommended Action with [ Set Up ] */}
                        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-heading">
                              Recommended action:
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 font-heading mt-0.5">
                              {card.data.recommendedAction}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1">
                              Automatically sends SMS/email review invites 2 hours post-appointment, routing positive 5-star experiences to Google Maps.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setActiveTab('competitors')}
                              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer"
                            >
                              <span>View Competitors →</span>
                            </button>
                            <button
                              onClick={() => setReviewSetupModalOpen(true)}
                              className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4 text-amber-300" />
                              <span>Set Up</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CASE 3: UNANSWERED REVIEWS BATCHING */}
                {card.type === 'unanswered_reviews' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <h4 className="text-sm font-bold text-slate-900 font-heading">
                          {card.data.count} Customer Reviews Awaiting Response
                        </h4>
                      </div>
                      <button
                        onClick={() => setActiveTab('reputation')}
                        className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Reputation Center</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {card.data.pendingReviews.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                          <p className="text-xs font-bold text-slate-800">
                            No unanswered reviews found for {activeBusiness.name}.
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {activeBusiness.gbpConnected
                              ? 'All reviews on your connected listing have responses.'
                              : 'Connect your Google Business Profile in the Reputation Center to sync and answer reviews.'}
                          </p>
                        </div>
                      ) : (
                        card.data.pendingReviews.map((rev: any, rIdx: number) => (
                          <div key={rIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{rev.author}</span>
                                <div className="flex text-amber-400">
                                  {[...Array(rev.rating)].map((_, s) => (
                                    <Star key={s} className="w-3 h-3 fill-amber-400" />
                                  ))}
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-400">{rev.date}</span>
                            </div>

                            <p className="text-slate-600 italic">"{rev.text}"</p>

                            <div className="pt-2 border-t border-slate-200/80 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#059669] uppercase tracking-wider font-heading">
                                  AI HIPAA-Compliant Reply:
                                </span>
                                <button
                                  onClick={() => handleCopyText(`rev_${rIdx}`, rev.suggestedReply)}
                                  className="text-[11px] font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedId === `rev_${rIdx}` ? 'Copied ✓' : 'Copy Reply'}
                                </button>
                              </div>
                              <p className="text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200">
                                {rev.suggestedReply}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* CASE 4: SEO OPPORTUNITY / EMERGENCY PAGE DRAFT */}
                {card.type === 'seo_opportunity' && (
                  <div className="space-y-4">
                    {/* Function Calling Pipeline Indicator */}
                    <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs flex flex-wrap items-center gap-2 font-mono">
                      <span className="text-emerald-400 font-bold">Query:</span>
                      <span className="text-slate-300">"{card.prompt}"</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-blue-400 font-semibold">AI Function:</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-300">get_local_seo_problem()</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-purple-400 font-semibold">Locora DB:</span>
                      <span className="text-emerald-300">Analysis Complete</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 font-heading">
                        Diagnostic Finding (From Locora Database)
                      </span>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {card.data.reason}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-heading">
                          Recommended Solution
                        </span>
                        <p className="text-slate-900 font-bold mt-0.5">
                          {card.data.solution}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setActiveTab('content')}
                          className="px-4 py-2.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100/60 text-emerald-950 font-bold text-xs transition-all cursor-pointer"
                        >
                          <span>Open in Content Studio →</span>
                        </button>
                        <button
                          onClick={() => setSelectedFixItAction(card.data.action)}
                          className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Generate Page & Schema Draft</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* CASE 5: GROWTH PLAN ACCELERATOR */}
                {card.type === 'growth_plan' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 font-heading">
                        {card.data.title}
                      </h4>
                      <button
                        onClick={() => setActiveTab('growth')}
                        className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View in Growth Page</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {card.data.weeks.map((w: any, wIdx: number) => (
                        <div key={wIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 font-heading">{w.week}</span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                              {w.focus}
                            </span>
                          </div>
                          <ul className="space-y-1 text-slate-600">
                            {w.tasks.map((t: string, tIdx: number) => (
                              <li key={tIdx} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CASE: BUSINESS BRAIN MONTHLY CONTENT PLAN */}
                {card.type === 'content_plan' && (
                  <div className="space-y-4">
                    {/* Pipeline Grounding Bar */}
                    <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs flex flex-wrap items-center gap-2 font-mono">
                      <span className="text-emerald-400 font-bold">Query:</span>
                      <span className="text-slate-300">"{card.prompt}"</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-blue-400 font-semibold">Business Truth:</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-300">
                        {card.data.businessName || businessName}
                      </span>
                      <span className="text-slate-500">→</span>
                      <span className="text-purple-400 font-semibold">SEO Grounding:</span>
                      <span className="text-emerald-300 truncate max-w-xs">{card.data.topOpportunity}</span>
                    </div>

                    {/* Grounding Summary Pill Header */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] font-heading">
                            Grounding Parameters
                          </span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                            {card.data.plannedItems?.length || 0} Planned Deliverables
                          </span>
                        </div>
                        <div className="text-slate-600 text-[11px] flex flex-wrap gap-x-4 gap-y-1">
                          <span>
                            <strong>Target Market:</strong> {card.data.targetCity || 'Local Service Area'}
                          </span>
                          <span>
                            <strong>Voice:</strong> {card.data.brandVoice || 'Professional'}
                          </span>
                          <span>
                            <strong>Existing Assets:</strong> {card.data.existingContentCount || 0} in Content Studio
                          </span>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setActiveTab('content')}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          <span>Open Content Studio</span>
                        </button>
                      </div>
                    </div>

                    {/* Planned Deliverables Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {card.data.plannedItems?.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-md font-mono uppercase">
                              {item.week} • {item.platform?.toUpperCase() || 'LOCAL POST'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium truncate">
                              {item.targetLocation}
                            </span>
                          </div>

                          <div>
                            <h5 className="font-bold text-slate-900 text-sm leading-snug">
                              {item.title}
                            </h5>
                            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                              Service Focus: {item.targetService}
                            </p>
                          </div>

                          <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] italic">
                            "{item.hook}"
                          </p>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                            <span className="text-slate-500">
                              <strong>CTA:</strong> {item.callToAction}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-400 bg-slate-50/70 p-2 rounded-lg">
                            <strong className="text-slate-600">Why this works:</strong> {item.rationale}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Operational Action Execution Bar */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 font-heading block">
                          Execute Content Plan
                        </span>
                        <p className="text-emerald-950 font-medium text-[11px]">
                          Push these {card.data.plannedItems?.length || 4} verified items directly into Content Studio or assign as Work Tasks.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* 1. Create Drafts in Content Studio */}
                        <button
                          onClick={() => handleCreateDraftContent(card.id, card.data.plannedItems || [])}
                          disabled={createdContentBatch[card.id]}
                          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            createdContentBatch[card.id]
                              ? 'bg-emerald-200 text-emerald-800 cursor-default'
                              : 'bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-950 shadow-xs'
                          }`}
                        >
                          {createdContentBatch[card.id] ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Drafts Created in Studio ✓</span>
                            </>
                          ) : (
                            <>
                              <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Create Draft Content</span>
                            </>
                          )}
                        </button>

                        {/* 2. Add as Work Tasks */}
                        <button
                          onClick={() => handleAddContentTasks(card.id, card.data.plannedItems || [])}
                          disabled={createdTaskIds[`batch_${card.id}`]}
                          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            createdTaskIds[`batch_${card.id}`]
                              ? 'bg-emerald-200 text-emerald-800 cursor-default'
                              : 'bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-950 shadow-xs'
                          }`}
                        >
                          {createdTaskIds[`batch_${card.id}`] ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Added to Work Hub ✓</span>
                            </>
                          ) : (
                            <>
                              <ListTodo className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Add as Work Tasks</span>
                            </>
                          )}
                        </button>

                        {/* 3. Request Plan Approval */}
                        <button
                          onClick={() => handleRequestPlanApproval(card)}
                          className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Request Plan Approval</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* CASE: LEADS REQUIRING FOLLOW-UP (CRM INTEGRATION) */}
                {card.type === 'leads_followup' && (
                  <div className="space-y-4">
                    {/* Pipeline Grounding Bar */}
                    <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs flex flex-wrap items-center gap-2 font-mono">
                      <span className="text-emerald-400 font-bold">Query:</span>
                      <span className="text-slate-300">"{card.prompt}"</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-blue-400 font-semibold">CRM Scan:</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-300">
                        {card.data.totalLeadsChecked || 0} Records Evaluated
                      </span>
                      <span className="text-slate-500">→</span>
                      <span className="text-purple-400 font-semibold">Priority Stale Leads:</span>
                      <span className="text-emerald-300 font-bold">{card.data.staleLeads?.length || 0} Found</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 font-heading">
                          Leads Requiring Immediate Follow-Up
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Identified from your CRM database using last contacted timestamps and stage velocity.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('crm')}
                        className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 text-[#059669]" />
                        <span>Open CRM Pipeline</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {(!card.data.staleLeads || card.data.staleLeads.length === 0) ? (
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                        <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                        <p className="text-xs font-bold text-slate-800">
                          No stale leads requiring immediate action!
                        </p>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          All leads in your CRM have recent interaction records or are closed. New inquiries will appear here automatically.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {card.data.staleLeads.map((lead: any, lIdx: number) => (
                          <div
                            key={lead.id || lIdx}
                            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 text-xs"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-sm">{lead.name}</span>
                                  {lead.company && (
                                    <span className="text-[11px] text-slate-500">({lead.company})</span>
                                  )}
                                  <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                    {lead.daysSinceContact} Days Inactive
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                                  {lead.email && <span>Email: {lead.email}</span>}
                                  {lead.phone && <span>Phone: {lead.phone}</span>}
                                  {lead.service && <span>Inquiry: {lead.service}</span>}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-[10px] text-slate-400 block uppercase font-mono">
                                  Estimated Value
                                </span>
                                <span className="font-bold text-emerald-700 text-sm">
                                  ${(lead.value || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Diagnostic Reasoning */}
                            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900">
                              <strong>Diagnostic Reason:</strong> {lead.reason}
                            </div>

                            {/* Task Creation Trigger */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                              <div className="text-[11px] text-slate-600">
                                <strong>Suggested Action:</strong> {lead.suggestedTask}
                              </div>

                              <button
                                onClick={() => handleCreateLeadFollowupTask(lead)}
                                disabled={createdTaskIds[lead.id]}
                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                                  createdTaskIds[lead.id]
                                    ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                    : 'bg-[#059669] hover:bg-[#047857] text-white shadow-xs'
                                }`}
                              >
                                {createdTaskIds[lead.id] ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Task Created ✓</span>
                                  </>
                                ) : (
                                  <>
                                    <ListTodo className="w-3.5 h-3.5 text-amber-200" />
                                    <span>Create Follow-up Task</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Batch Action Bar */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="font-bold text-slate-900 block">Batch Task Assignment</span>
                            <span className="text-[11px] text-slate-500">
                              Generate follow-up tasks in Work Hub for all {card.data.staleLeads.length} stale leads at once.
                            </span>
                          </div>

                          <button
                            onClick={() => handleCreateAllLeadFollowupTasks(card.id, card.data.staleLeads)}
                            disabled={createdTaskIds[`leads_batch_${card.id}`]}
                            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                              createdTaskIds[`leads_batch_${card.id}`]
                                ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                            }`}
                          >
                            {createdTaskIds[`leads_batch_${card.id}`] ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span>All Tasks Added to Work Hub ✓</span>
                              </>
                            ) : (
                              <>
                                <CheckSquare className="w-4 h-4 text-amber-300" />
                                <span>Create All {card.data.staleLeads.length} Follow-up Tasks</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CASE: MONTHLY REPORT INTEGRATION */}
                {card.type === 'monthly_report' && (
                  <div className="space-y-4">
                    {/* Pipeline Grounding Bar */}
                    <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs flex flex-wrap items-center gap-2 font-mono">
                      <span className="text-emerald-400 font-bold">Query:</span>
                      <span className="text-slate-300">"{card.prompt}"</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-blue-400 font-semibold">Report Engine:</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-300">Real Data Pipeline</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-purple-400 font-semibold">Sources Verified:</span>
                      <span className="text-emerald-300 font-bold">{card.data.connectedSources?.length || 0} Connected</span>
                    </div>

                    {/* Executive Health Overview Card */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-heading">
                            {card.data.reportPeriod || 'Current Month'} Report
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {card.data.businessName || businessName}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 font-heading">
                          Monthly Operational & Growth Health Snapshot
                        </h4>
                        <p className="text-xs text-slate-600">
                          {card.data.reportNarrative}
                        </p>
                      </div>

                      {/* Overall Health Score Badge */}
                      <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 shrink-0">
                        <div className="text-center">
                          <div className="text-2xl font-bold font-mono text-emerald-700">
                            {card.data.overallScore || 82}
                            <span className="text-xs text-slate-400 font-normal">/100</span>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 font-heading">
                            Health Index
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Verified Data Sources Badges */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-heading block">
                        Verified Connected Data Pipelines (Only Real Records Included)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(card.data.connectedSources || []).map((source: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1.5 shadow-2xs"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{source}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Summary Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block font-heading">
                          Customer Reviews
                        </span>
                        <div className="text-lg font-bold text-slate-900 mt-1">
                          {card.data.summaryMetrics?.reviewCount || 0}
                        </div>
                        <span className="text-[10px] text-amber-700 font-medium">
                          {card.data.summaryMetrics?.unansweredReviewsCount || 0} awaiting reply
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block font-heading">
                          CRM Leads
                        </span>
                        <div className="text-lg font-bold text-slate-900 mt-1">
                          {card.data.summaryMetrics?.leadsCount || 0}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          ${(card.data.summaryMetrics?.totalPipelineValue || 0).toLocaleString()} pipeline
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block font-heading">
                          Content Assets
                        </span>
                        <div className="text-lg font-bold text-slate-900 mt-1">
                          {card.data.summaryMetrics?.contentCount || 0}
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Published & Drafts
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block font-heading">
                          Work Hub Tasks
                        </span>
                        <div className="text-lg font-bold text-slate-900 mt-1">
                          {card.data.summaryMetrics?.tasksCompletedCount || 0}
                        </div>
                        <span className="text-[10px] text-blue-700 font-medium">
                          {card.data.summaryMetrics?.tasksActiveCount || 0} in progress
                        </span>
                      </div>
                    </div>

                    {/* Top Strategic Finding */}
                    {card.data.summaryMetrics?.topPriority && (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 font-heading block">
                          Top Strategic Recommendation for This Period
                        </span>
                        <p className="font-medium text-[11px] leading-relaxed">
                          {card.data.summaryMetrics.topPriority}
                        </p>
                      </div>
                    )}

                    {/* Executive Report Actions */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 font-heading block">
                          Access Complete Multi-Source Audit
                        </span>
                        <p className="text-emerald-950 font-medium text-[11px]">
                          Dive into interactive breakdowns across SEO, Reputation, Content, and Financials.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={handleDownloadReportPdf}
                          disabled={isGeneratingPdf}
                          className="px-4 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          {isGeneratingPdf ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                          ) : (
                            <Download className="w-3.5 h-3.5 text-emerald-700" />
                          )}
                          <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
                        </button>

                        <button
                          onClick={handleViewFullReport}
                          className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-amber-300" />
                          <span>View Full Interactive Report</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* CASE: PRIORITIZED WEEKLY WORK PLAN (WORK HUB INTEGRATION) */}
                {card.type === 'weekly_work' && (
                  <div className="space-y-4">
                    {/* Pipeline Grounding Bar */}
                    <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs flex flex-wrap items-center gap-2 font-mono">
                      <span className="text-emerald-400 font-bold">Query:</span>
                      <span className="text-slate-300">"{card.prompt}"</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-blue-400 font-semibold">Prioritization Engine:</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-300">
                        {card.data.groundingSources?.join(' + ') || 'Business Brain + Hubs'}
                      </span>
                      <span className="text-slate-500">→</span>
                      <span className="text-purple-400 font-semibold">Actions:</span>
                      <span className="text-emerald-300 font-bold">{card.data.prioritizedActions?.length || 0} Ranked</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 font-heading">
                          Ranked Action Priorities for {card.data.businessName || businessName}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Prioritized based on customer impact, reputation risk, and high-velocity SEO opportunities.
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveTab('work')}
                        className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-[#059669]" />
                        <span>Open Work Hub</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Action Items List */}
                    <div className="space-y-2.5">
                      {(card.data.prioritizedActions || []).map((action: any, aIdx: number) => (
                        <div
                          key={action.id || aIdx}
                          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 text-xs hover:border-emerald-300 transition-all"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center font-mono">
                                {aIdx + 1}
                              </span>
                              <span className="font-bold text-slate-900 text-sm">{action.title}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase ${
                                  action.urgency === 'high'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {action.urgency === 'high' ? 'High Impact' : 'Scheduled'}
                              </span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                                {action.category}
                              </span>
                            </div>
                          </div>

                          <p className="text-slate-600 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <strong>Why it matters:</strong> {action.whyItMatters}
                          </p>

                          <div className="flex items-center justify-end pt-1">
                            <button
                              onClick={() => handleAddWeeklyActionTask(action)}
                              disabled={createdTaskIds[action.id]}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                createdTaskIds[action.id]
                                  ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                  : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 shadow-2xs'
                              }`}
                            >
                              {createdTaskIds[action.id] ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Added to Work Tasks ✓</span>
                                </>
                              ) : (
                                <>
                                  <ListTodo className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Add to Work Tasks</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Batch Add All Actions */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-emerald-900 block font-heading">
                          Add Entire Week's Priorities to Work Hub
                        </span>
                        <span className="text-[11px] text-emerald-950 font-medium">
                          Populates your Work Tasks board with all {card.data.prioritizedActions?.length || 0} grounded priorities.
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddAllWeeklyActions(card.id, card.data.prioritizedActions || [])}
                        disabled={createdTaskIds[`weekly_batch_${card.id}`]}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                          createdTaskIds[`weekly_batch_${card.id}`]
                            ? 'bg-emerald-200 text-emerald-800 cursor-default'
                            : 'bg-[#059669] hover:bg-[#047857] text-white shadow-xs'
                        }`}
                      >
                        {createdTaskIds[`weekly_batch_${card.id}`] ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-800" />
                            <span>All Tasks Added to Work Hub ✓</span>
                          </>
                        ) : (
                          <>
                            <CheckSquare className="w-4 h-4 text-amber-300" />
                            <span>Add All Priorities to Work Hub</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* CASE: DIRECTORY PERFORMANCE CARD */}
                {card.type === 'directory_performance' && card.data && (
                  <div className="space-y-4">
                    {/* Status & Verification Header */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold font-heading">{card.data.businessName}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              card.data.isPublished ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                            }`}>
                              {card.data.isPublished ? 'Published Live' : 'Unpublished'}
                            </span>
                            {card.data.isClaimed ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Claimed Owner
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Unclaimed Listing
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            Locora Public Directory: <a href={getDirectoryBusinessUrl(card.data.slug)} target="_blank" rel="noopener noreferrer" className="font-mono text-emerald-300 hover:underline inline-flex items-center gap-1">{getDirectoryBusinessUrl(card.data.slug)}<ExternalLink className="w-2.5 h-2.5" /></a>
                          </p>
                        </div>
                      </div>

                      {card.data.slug && (
                        <a
                          href={getDirectoryBusinessUrl(card.data.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>View Public Page</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Profile Completeness Bar */}
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-slate-800 font-heading flex items-center gap-1.5">
                            <span>Profile Completeness</span>
                            <span className="text-[11px] text-slate-400 font-normal">({card.data.completenessScore || 0}% optimized)</span>
                          </span>
                          <span className="font-bold font-mono text-slate-900">{card.data.completenessScore || 0}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              (card.data.completenessScore || 0) >= 80
                                ? 'bg-emerald-500'
                                : (card.data.completenessScore || 0) >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, card.data.completenessScore || 0))}%` }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleExecute("What can I improve on my directory profile?")}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Audit & Improve</span>
                      </button>
                    </div>

                    {/* 6 Real Metric Counters */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="text-[9px] uppercase font-bold tracking-wider">Views</span>
                          <Eye className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <div className="text-lg font-black text-slate-900 font-heading">
                          {(card.data.metrics?.profileViews || 0).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-500">Organic visitors</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="text-[9px] uppercase font-bold tracking-wider">Calls</span>
                          <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <div className="text-lg font-black text-emerald-700 font-heading">
                          {(card.data.metrics?.phoneClicks || 0).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-500">Direct tap-to-call</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="text-[9px] uppercase font-bold tracking-wider">Web Clicks</span>
                          <MousePointerClick className="w-3.5 h-3.5 text-purple-500" />
                        </div>
                        <div className="text-lg font-black text-purple-700 font-heading">
                          {(card.data.metrics?.websiteClicks || 0).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-500">Referrals</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="text-[9px] uppercase font-bold tracking-wider">Quote Leads</span>
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <div className="text-lg font-black text-amber-700 font-heading">
                          {(card.data.metrics?.deliveredLeads ?? card.data.metrics?.quoteRequests ?? 0).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-500">To CRM</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="text-[9px] uppercase font-bold tracking-wider">Inquiries</span>
                          <Zap className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <div className="text-lg font-black text-indigo-700 font-heading">
                          {(card.data.metrics?.totalInquiries || 0).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-500">{card.data.metrics?.inquiryRate || 0}% rate</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="text-[9px] uppercase font-bold tracking-wider">Converted</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                        </div>
                        <div className="text-lg font-black text-teal-700 font-heading">
                          {(card.data.metrics?.conversionsCount || 0).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-500">{card.data.metrics?.leadConversionRate || 0}% won</span>
                      </div>
                    </div>

                    {/* Checkup Findings if present */}
                    {card.data.checkup && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">Checkup SEO:</span>
                            <span className="font-bold text-slate-900 font-mono">{card.data.checkup.seoScore ?? 'N/A'}/100</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">Mobile Speed:</span>
                            <span className="font-bold text-slate-900 font-mono">{card.data.checkup.performanceScore ?? 'N/A'}/100</span>
                          </div>
                          {card.data.checkup.issuesCount > 0 && (
                            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              {card.data.checkup.issuesCount} Technical Opportunities
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">Grounded in live Google PSI & Crawl data</span>
                      </div>
                    )}

                    {/* AI Opportunities & Actions */}
                    {card.data.opportunities && card.data.opportunities.length > 0 && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Actionable Directory Priorities ({card.data.opportunities.length})</span>
                          </h5>
                          <span className="text-[11px] text-slate-500">Requires User Approval</span>
                        </div>

                        {card.data.opportunities.map((opp: any, oIdx: number) => (
                          <div
                            key={opp.id || oIdx}
                            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition-all text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${opp.urgency === 'high' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                                <span className="font-bold text-slate-900">{opp.title}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                opp.urgency === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {opp.urgency === 'high' ? 'High Impact' : 'Recommended'}
                              </span>
                            </div>

                            <p className="text-slate-600 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <strong>Why it matters:</strong> {opp.whyItMatters}
                              {opp.expectedImpact && (
                                <span className="block text-emerald-700 font-semibold mt-1">
                                  Expected Impact: {opp.expectedImpact}
                                </span>
                              )}
                            </p>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                onClick={() => handleTriggerApprovalForOpportunity(opp)}
                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Preview & Approve AI Action</span>
                              </button>
                              <button
                                onClick={() => handleAddWeeklyActionTask(opp)}
                                disabled={createdTaskIds[opp.id]}
                                className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                  createdTaskIds[opp.id]
                                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800 cursor-default'
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                {createdTaskIds[opp.id] ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Added to Work ✓</span>
                                  </>
                                ) : (
                                  <>
                                    <ListTodo className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Add to Work Tasks</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action recommendations & Lead sync prompt */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-emerald-950 block font-heading">
                          Lead Flow Sync Active
                        </span>
                        <span className="text-[11px] text-emerald-900">
                          Direct quote requests from your public listing automatically populate in your Customers & Leads pipeline.
                        </span>
                      </div>

                      <button
                        onClick={() => setActiveTab('customers')}
                        className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs"
                      >
                        <Users className="w-3.5 h-3.5 text-amber-300" />
                        <span>Open CRM & Leads</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* CASE: DIRECTORY IMPROVEMENT / AUDIT CARD */}
                {card.type === 'directory_improvement' && card.data && (
                  <div className="space-y-4">
                    {/* Header with Score */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold font-heading text-slate-900">Directory Profile Audit</h4>
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                            {card.data.businessName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Complete profiles rank higher in local search, build instant consumer trust, and yield 2.8x more quote submissions.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Completeness</span>
                          <span className="text-2xl font-black font-heading text-slate-900">
                            {card.data.completenessScore || 0}%
                          </span>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 font-mono">
                          {card.data.auditBreakdown ? `${card.data.auditBreakdown.filter((i: any) => i.passed).length}/10` : '—'}
                        </div>
                      </div>
                    </div>

                    {/* 10-Item Audit Checklist */}
                    {card.data.auditBreakdown && (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          10-Point Directory Verification Checklist
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {card.data.auditBreakdown.map((item: any, iIdx: number) => (
                            <div
                              key={iIdx}
                              className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                                item.passed
                                  ? 'bg-emerald-50/50 border-emerald-100 text-slate-800'
                                  : 'bg-rose-50/50 border-rose-100 text-slate-900'
                              }`}
                            >
                              {item.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold">{item.item}</span>
                                  <span className={`text-[10px] font-semibold uppercase ${
                                    item.passed ? 'text-emerald-700' : 'text-rose-600 font-bold'
                                  }`}>
                                    {item.passed ? 'Verified' : 'Missing'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">{item.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommended Optimization Actions with Preview & Approval */}
                    {card.data.opportunities && card.data.opportunities.length > 0 && (
                      <div className="space-y-2.5">
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Immediate Optimization Actions</span>
                        </h5>

                        {card.data.opportunities.map((opp: any, oIdx: number) => (
                          <div
                            key={opp.id || oIdx}
                            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-slate-900 text-sm">{opp.title}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                opp.urgency === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700'
                              }`}>
                                {opp.urgency === 'high' ? 'Priority' : 'Enhancement'}
                              </span>
                            </div>

                            <p className="text-slate-600 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                              <strong>Diagnosis:</strong> {opp.diagnosis}
                              <br />
                              <strong>Why it matters:</strong> {opp.whyItMatters}
                              {opp.expectedImpact && (
                                <span className="block text-emerald-700 font-semibold mt-1">
                                  Expected Impact: {opp.expectedImpact}
                                </span>
                              )}
                            </p>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                onClick={() => handleTriggerApprovalForOpportunity(opp)}
                                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Preview & Approve AI Action</span>
                              </button>
                              <button
                                onClick={() => handleAddWeeklyActionTask(opp)}
                                disabled={createdTaskIds[opp.id]}
                                className={`px-3.5 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
                                  createdTaskIds[opp.id]
                                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800 cursor-default'
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                {createdTaskIds[opp.id] ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Added to Work ✓</span>
                                  </>
                                ) : (
                                  <>
                                    <ListTodo className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Add to Work Tasks</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* CASE: DIRECTORY LEADS ANALYSIS & VARIANCE */}
                {card.type === 'directory_leads_analysis' && card.data && (
                  <div className="space-y-4">
                    {/* Baseline Safeguard Notice if hasEnoughData === false */}
                    {!card.data.hasEnoughData && (
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Strict Baseline Verification Notice</span>
                          <span className="text-[11px] text-amber-800">
                            Historical trend analysis requires at least two full tracking cycles to calculate statistically valid week-over-week variance. Displaying verified real-time volume below without speculation.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Conversion Funnel */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold font-heading text-slate-900">Directory Conversion Funnel</h4>
                          <p className="text-[11px] text-slate-500">Live conversion math from real visitor events</p>
                        </div>
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          {card.data.leadConversionRate || 0}% Lead-to-Customer Win Rate
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">1. Profile Views</span>
                          <span className="text-lg font-black text-slate-900 font-heading">
                            {(card.data.profileViews || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Top of funnel</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">2. Inquiries</span>
                          <span className="text-lg font-black text-indigo-700 font-heading">
                            {(card.data.totalInquiries || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-500 block">{card.data.inquiryRate || 0}% click rate</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">3. Delivered Leads</span>
                          <span className="text-lg font-black text-amber-700 font-heading">
                            {(card.data.deliveredLeads || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-500 block">In CRM pipeline</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">4. Won Customers</span>
                          <span className="text-lg font-black text-teal-700 font-heading">
                            {(card.data.conversionsCount || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Revenue generated</span>
                        </div>
                      </div>
                    </div>

                    {/* Historical Lead Trend Card when data exists */}
                    {card.data.hasEnoughData && card.data.leadTrends && (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">7-Day Lead Variance</h5>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex-1">
                            <span className="text-[10px] text-slate-400 block">Prior 7 Days</span>
                            <span className="text-base font-bold font-mono text-slate-700">
                              {card.data.leadTrends.previous7DaysLeads} leads
                            </span>
                          </div>
                          <span className="text-slate-400">→</span>
                          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex-1">
                            <span className="text-[10px] text-emerald-600 block">Current 7 Days</span>
                            <span className="text-base font-bold font-mono text-emerald-800">
                              {card.data.leadTrends.last7DaysLeads} leads
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900 text-white flex-1">
                            <span className="text-[10px] text-slate-300 block">Net Change</span>
                            <span className={`text-base font-bold font-mono ${
                              card.data.leadTrends.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {card.data.leadTrends.variance >= 0 ? `+${card.data.leadTrends.variance}` : card.data.leadTrends.variance} leads
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Services in Demand */}
                    {card.data.servicesWithInquiries && card.data.servicesWithInquiries.length > 0 && (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Services Receiving Inquiries
                        </h5>
                        <div className="space-y-1.5">
                          {card.data.servicesWithInquiries.map((s: any, sIdx: number) => (
                            <div key={sIdx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="font-semibold text-slate-800">{s.service}</span>
                              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {s.count} {s.count === 1 ? 'inquiry' : 'inquiries'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Uncontacted Leads Quick Action */}
                    {card.data.uncontactedLeads && card.data.uncontactedLeads.length > 0 && (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="font-bold text-amber-950 block font-heading flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span>{card.data.uncontactedLeads.length} Uncontacted Directory Leads Awaiting Response</span>
                          </span>
                          <span className="text-[11px] text-amber-900">
                            Responding within 5 minutes increases lead conversion by up to 391%.
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveTab('customers')}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs"
                        >
                          <Users className="w-3.5 h-3.5 text-amber-300" />
                          <span>Respond in CRM</span>
                        </button>
                      </div>
                    )}

                    {/* Recommended Growth Actions with Preview & Approval */}
                    {card.data.opportunities && card.data.opportunities.length > 0 && (
                      <div className="space-y-2.5">
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Recommended Lead Growth Actions</span>
                        </h5>

                        {card.data.opportunities.map((opp: any, oIdx: number) => (
                          <div
                            key={opp.id || oIdx}
                            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-slate-900 text-sm">{opp.title}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                opp.urgency === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700'
                              }`}>
                                {opp.urgency === 'high' ? 'Urgent' : 'Opportunity'}
                              </span>
                            </div>

                            <p className="text-slate-600 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                              <strong>Why it matters:</strong> {opp.whyItMatters}
                              {opp.expectedImpact && (
                                <span className="block text-emerald-700 font-semibold mt-1">
                                  Expected Impact: {opp.expectedImpact}
                                </span>
                              )}
                            </p>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                onClick={() => handleTriggerApprovalForOpportunity(opp)}
                                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>Preview & Approve AI Action</span>
                              </button>
                              <button
                                onClick={() => handleAddWeeklyActionTask(opp)}
                                disabled={createdTaskIds[opp.id]}
                                className={`px-3.5 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
                                  createdTaskIds[opp.id]
                                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800 cursor-default'
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                {createdTaskIds[opp.id] ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Added to Work ✓</span>
                                  </>
                                ) : (
                                  <>
                                    <ListTodo className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Add to Work Tasks</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* CASE 6: GENERIC ADVICE / EVIDENCE-BOUND ANSWERS */}
                {card.type === 'generic' && (
                  <div className="space-y-3">
                    {card.data.hasEnoughData === false && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <span className="font-bold block">Strict Verification Safeguard Active</span>
                          <span className="text-[11px] text-amber-800">
                            Locora AI Manager strictly prevents hallucinated metrics and unverified business facts.
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="prose prose-xs max-w-none text-slate-700 leading-relaxed whitespace-pre-line text-xs">
                      {card.data.text}
                    </div>
                    {card.data.sourcesUsed && card.data.sourcesUsed.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                        <span className="font-bold uppercase tracking-wider text-slate-500">Verified Sources:</span>
                        <span>{card.data.sourcesUsed.join(' • ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div ref={actionFeedEndRef} />
      </section>

      {/* REVIEW WORKFLOW SETUP MODAL */}
      {reviewSetupModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReviewSetupModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto my-auto animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#059669] flex items-center justify-center font-bold shrink-0">
                  <Star className="w-5 h-5 fill-[#059669]" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900">
                    Automated Review Request Workflow
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure SMS & email review triggers for {businessName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewSetupModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors font-bold text-xs cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">Direct Google Review Shortlink</label>
                <input
                  type="text"
                  readOnly
                  value={`https://g.page/r/${activeBusiness.id}/review`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">Trigger Cadence</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                  <option>Send SMS 2 hours after service completion</option>
                  <option>Send SMS next morning at 10:00 AM</option>
                  <option>Send email follow-up same day</option>
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-800">
                <span className="font-bold text-emerald-950 block mb-1">SMS Template:</span>
                <p className="text-slate-700">
                  "Hi [Customer Name], thank you for choosing {businessName} today! Our team would appreciate 30 seconds of your honest feedback: https://g.page/r/{activeBusiness.id}/review"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setReviewSetupModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logActivity('reputation', 'Review Automation Activated', 'Trigger: SMS 2hrs post visit');
                  setReviewSetupModalOpen(false);
                  alert(`Automated Review Request Workflow successfully activated for ${activeBusiness.name}!`);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Activate Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controlled Fix It Execution Modal */}
      <FixItModal
        action={selectedFixItAction}
        onClose={() => setSelectedFixItAction(null)}
      />
    </div>
  );
};
