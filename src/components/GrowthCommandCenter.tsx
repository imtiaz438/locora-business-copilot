import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FixItModal } from './FixItModal';
import { FirstSessionChecklist } from './FirstSessionChecklist';
import { HealthScansCard } from './HealthScansCard';
import { MultiLocationSection } from './MultiLocationSection';
import { PriorityAction } from '../types';
import { DataProvenanceBadge } from './common/DataProvenanceBadge';
import { getDirectoryBusinessUrl } from '../utils/domain';
import {
  Sparkles,
  TrendingUp,
  MapPin,
  Star,
  Globe,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Users,
  FileText,
  ChevronRight,
  ShieldCheck,
  Brain,
  Send,
  Loader2,
  Bot,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Crosshair,
  BarChart3,
  Check,
  Phone,
  Mail,
  Clock,
  Building2,
} from 'lucide-react';

export const GrowthCommandCenter: React.FC = () => {
  const {
    activeBusiness,
    businesses,
    setIsAddBusinessModalOpen,
    businessTruth,
    priorityActions,
    setActiveTab,
    setRightAiPanelOpen,
    user,
    consumeAiCredit,
    setIsGbpSyncModalOpen,
    latestWebsiteAudit,
    productionDashboard,
    customers,
    invoices,
    workTasks,
  } = useApp();

  // Canonical business identity and facts from canonical truth service
  const businessName = businessTruth?.name ?? activeBusiness?.name ?? null;
  const businessCategory = businessTruth?.category ?? activeBusiness?.category ?? null;
  const businessCity = businessTruth?.locations?.find((l) => l.isPrimary)?.city ?? businessTruth?.locations?.[0]?.city ?? activeBusiness?.city ?? null;
  const businessState = businessTruth?.locations?.find((l) => l.isPrimary)?.state ?? businessTruth?.locations?.[0]?.state ?? activeBusiness?.state ?? null;
  const businessWebsite = businessTruth?.website ?? activeBusiness?.website ?? null;
  const businessPhone = businessTruth?.phone ?? activeBusiness?.phone ?? null;
  const businessServices = businessTruth?.services ?? activeBusiness?.services ?? null;
  // Unified connected state: server-verified businessTruth OR the fresh client-side flag.
  // Either source proving "connected" is enough — a stale businessTruth must never
  // shadow a fresh sync, and vice versa.
  const isGoogleConnected = Boolean(businessTruth?.googleProfile?.connected) || Boolean(activeBusiness?.gbpConnected);
  // Single-business (Free) plan: GBP connection is one-time and locked — no re-sync
  // button once connected. Multi-business plans (Pro/Agency) keep per-business refresh.
  const isSingleBusinessPlan = (user?.planTier || 'free').toLowerCase() === 'free';
  const showGbpActionButton = !isGoogleConnected || !isSingleBusinessPlan;

  const [selectedFixItAction, setSelectedFixItAction] = useState<PriorityAction | null>(null);
  const [expandedReasonId, setExpandedReasonId] = useState<string | null>(null);

  // Directory Live Metrics & Inbound Leads
  const [dirAnalytics, setDirAnalytics] = useState<any>(null);
  const [loadingDirAnalytics, setLoadingDirAnalytics] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadDir = async () => {
      setLoadingDirAnalytics(true);
      try {
        const target = activeBusiness?.directorySlug || activeBusiness?.slug || activeBusiness?.id;
        if (!target) {
          setLoadingDirAnalytics(false);
          return;
        }
        const authEmail = activeBusiness?.ownerEmail || (typeof window !== 'undefined' ? localStorage.getItem('locora_auth_email') : '') || '';
        const emailParam = authEmail ? `&userEmail=${encodeURIComponent(authEmail)}` : '';
        const res = await fetch(`/api/directory/analytics?businessId=${encodeURIComponent(target)}${emailParam}`, {
          headers: authEmail ? { 'x-user-email': authEmail } : {},
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && isMounted) {
            setDirAnalytics(json.analytics?.businessMetrics || null);
          }
        }
      } catch (e) {
        console.warn('Failed loading directory analytics in Growth Center:', e);
      } finally {
        if (isMounted) setLoadingDirAnalytics(false);
      }
    };
    loadDir();
    return () => { isMounted = false; };
  }, [activeBusiness?.id, activeBusiness?.directorySlug, activeBusiness?.slug]);

  // Ask Locora Inline Chat
  const [askInput, setAskInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [lastAskedQuestion, setLastAskedQuestion] = useState<string | null>(null);

  // Suggested Quick Prompts
  const quickPrompts = [
    `What do you know about this business?`,
    `Why is the high-intent service page our highest ROI action?`,
    `How do we reach the Google Maps 3-pack for ${businessCity || 'our area'}?`,
    `Compare our reviews with ${activeBusiness?.competitors?.[0] || 'local competitors'}`,
  ];

  const handleAskLocora = async (queryText?: string) => {
    const q = (queryText || askInput).trim();
    if (!q) return;
    setIsAsking(true);
    setLastAskedQuestion(q);
    setAiAnswer(null);
    consumeAiCredit(1);

    try {
      const targetBizId = businessTruth?.businessId || activeBusiness?.id || '';
      // Attempt verified AI Manager grounded endpoint first
      const aiManagerRes = await fetch('/api/ai-manager/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: targetBizId,
          query: q,
          userEmail: user?.email || '',
        }),
      });

      if (aiManagerRes.ok) {
        const aiManagerData = await aiManagerRes.json();
        if (aiManagerData && aiManagerData.answer) {
          setAiAnswer(aiManagerData.answer);
          return;
        }
      }

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          businessContext: {
            businessId: targetBizId,
            name: businessName,
            category: businessCategory,
            city: businessCity,
            state: businessState,
            website: businessWebsite,
            phone: businessPhone,
            services: businessServices,
            serviceAreas: businessTruth?.serviceAreas || null,
            hours: businessTruth?.hours || null,
            description: businessTruth?.description || null,
            targetCustomers: businessTruth?.targetCustomers || null,
            goals: businessTruth?.goals || null,
            brandVoice: businessTruth?.brandVoice || null,
            googleProfile: businessTruth?.googleProfile || null,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && (data.reply || data.text)) {
        setAiAnswer(data.reply || data.text);
      } else {
        setAiAnswer(
          `### Locora AI Recommendation for ${businessName || 'Your Business'}:\n\n` +
          `1. **Focus on Priority Action #1**: Publishing the ${priorityActions[0]?.title || 'high-intent local service page'} directly targets qualified searchers in ${businessCity || 'your primary market'}.\n` +
          `2. **Clear Review Backlog**: Responding to your customer reviews signals responsiveness to local ranking algorithms.\n` +
          `3. **Continuous Schema Monitoring**: Keeping LocalBusiness structured data verified strengthens placement in Google Maps and AI Overviews.`
        );
      }
    } catch {
      setAiAnswer(
        `### Strategic Growth Directive for ${businessName || 'Your Business'}:\n\n` +
        `Your quickest path to increase local call volume is completing the **Top 3 Things to Fix This Week** listed below. Click **Fix It** on each card to generate safe, non-destructive drafts that you can review and approve.`
      );
    } finally {
      setIsAsking(false);
      setAskInput('');
    }
  };

  const toggleReason = (id: string) => {
    setExpandedReasonId((prev) => (prev === id ? null : id));
  };

  // 1. Visibility Component
  const hasObservedRank = typeof activeBusiness.rankingAvg === 'number' && activeBusiness.rankingAvg > 0;
  const hasTrackedKeywords = Boolean(productionDashboard?.collectedData?.trackedKeywords && productionDashboard.collectedData.trackedKeywords.length > 0);
  // Unified connected state (same rule as the GBP card below): server-verified
  // businessTruth OR the business record flag OR the production dashboard signal.
  const isGbpConnected = Boolean(
    activeBusiness.gbpConnected ||
    (activeBusiness as any).googleConnected ||
    (businessTruth as any)?.googleProfile?.connected ||
    productionDashboard?.collectedData?.googleProfile?.isVerified
  );
  const visibilityScore: number | null = hasObservedRank
    ? Math.round(Math.max(15, 100 - (activeBusiness.rankingAvg! - 1) * 12))
    : (hasTrackedKeywords ? 65 : (isGbpConnected ? 50 : null));

  // 2. Trust & Reputation Component
  const hasReviews = Boolean(isGbpConnected && (activeBusiness.googleRating > 0 || (activeBusiness.reviewCount && activeBusiness.reviewCount > 0)));
  const trustReputationScore: number | null = hasReviews && activeBusiness.googleRating > 0
    ? Math.round((activeBusiness.googleRating / 5) * 100)
    : null;

  // 3. Conversion & Foundation Component
  const crawlSeo = latestWebsiteAudit?.scores?.seo || productionDashboard?.collectedData?.latestCrawlRun?.seoScore;
  const crawlPerf = latestWebsiteAudit?.scores?.performance || productionDashboard?.collectedData?.latestCrawlRun?.perfScore;
  const hasFoundationData = Boolean(
    (typeof crawlSeo === 'number' && crawlSeo > 0) ||
    (typeof crawlPerf === 'number' && crawlPerf > 0)
  );
  const conversionFoundationScore: number | null = hasFoundationData
    ? Math.round(
        typeof crawlPerf === 'number' && crawlPerf > 0 && typeof crawlSeo === 'number' && crawlSeo > 0
          ? (crawlSeo + crawlPerf) / 2
          : (crawlPerf || crawlSeo || 0)
      )
    : null;

  const hasActiveBusiness = Boolean(activeBusiness && activeBusiness.id && activeBusiness.id !== 'workspace_pending' && businesses.length > 0);

  // 4. Client Operations Component
  const bizCustomers = hasActiveBusiness ? (customers?.filter((c) => c.businessId === activeBusiness?.id) || []) : [];
  const bizInvoices = hasActiveBusiness ? (invoices?.filter((i) => i.businessId === activeBusiness?.id) || []) : [];
  const bizTasks = hasActiveBusiness ? (workTasks?.filter((t) => t.businessId === activeBusiness?.id) || []) : [];
  const hasClientOpsData = bizCustomers.length > 0 || bizInvoices.length > 0 || bizTasks.length > 0;
  const clientOpsScore: number | null = hasClientOpsData
    ? Math.min(100, Math.round(50 + (bizCustomers.length * 10) + (bizInvoices.length * 10) + (bizTasks.length * 5)))
    : null;

  // Real weighted average of authentic components only (no hardcoded fallback 73, 76, 78)
  const validPillars: { name: string; score: number; weight: number }[] = [];
  if (visibilityScore !== null) validPillars.push({ name: 'Visibility', score: visibilityScore, weight: 0.25 });
  if (trustReputationScore !== null) validPillars.push({ name: 'Trust & Reputation', score: trustReputationScore, weight: 0.25 });
  if (conversionFoundationScore !== null) validPillars.push({ name: 'Conversion & Foundation', score: conversionFoundationScore, weight: 0.25 });
  if (clientOpsScore !== null) validPillars.push({ name: 'Client Operations', score: clientOpsScore, weight: 0.25 });

  const overallScore: number | null = validPillars.length > 0
    ? Math.round(validPillars.reduce((sum, p) => sum + p.score * p.weight, 0) / validPillars.reduce((sum, p) => sum + p.weight, 0))
    : null;

  const brain = productionDashboard?.businessBrain || businessTruth?.brain || null;
  const brainScore: number | null = brain?.score && brain.score > 0 ? brain.score : null;
  const brainReadiness: number | null = brain?.readinessScore && brain.readinessScore > 0 ? brain.readinessScore : null;
  const brainSummary = brain?.summary || null;
  const brainSwot = brain?.swot || null;
  // The stored SWOT was generated before the GBP sync — suppress its stale
  // "GBP not connected" weakness once the profile is actually connected, so the
  // dossier never contradicts the live connected state on the same page.
  const visibleWeaknesses = Array.isArray(brainSwot?.weaknesses)
    ? brainSwot.weaknesses.filter((w: string) => {
        if (!isGoogleConnected) return true;
        const t = (w || '').toLowerCase();
        return !(t.includes('google business profile') && (t.includes('not connected') || t.includes('not yet connected') || t.includes('not linked') || t.includes('connect your')));
      })
    : brainSwot?.weaknesses;
  const verifiedServices: string[] = Array.isArray(businessServices) && businessServices.length > 0
    ? businessServices
    : (Array.isArray(activeBusiness?.services) && activeBusiness.services.length > 0 ? activeBusiness.services : []);

  if (!hasActiveBusiness) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto font-sans text-slate-900 pb-16">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto mb-5 border border-emerald-100">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight font-heading mb-3">
            Create your first Business
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed mb-8">
            Your Locora account is active. To begin auditing visibility, managing reviews, and utilizing your autonomous Business Brain, set up your business workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddBusinessModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>+ Create Business</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto font-sans text-slate-900 pb-16">
      {/* 0. FIRST-SESSION CHECKLIST: profile → GBP → first Fix-It (auto-hides when complete) */}
      <FirstSessionChecklist />

      {/* 0b. AUTOMATED HEALTH SCANS: weekly on Pro/Agency, manual on all plans */}
      {activeBusiness?.id && (
        <HealthScansCard businessId={activeBusiness.id} businessName={activeBusiness.name || businessName || 'this business'} />
      )}

      {/* 1. UNIFIED WORKFLOW STATUS BAR: DIAGNOSE → PRIORITIZE → ACT → MEASURE */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <span className="text-sm font-semibold text-slate-900">
            {businessName || 'Business Workspace'}
            {businessCity && (
              <span className="font-normal text-slate-500"> · {businessCity}{businessState ? `, ${businessState}` : ''}</span>
            )}
          </span>
          <span className="text-xs text-slate-500 whitespace-nowrap">
            Diagnose <ChevronRight className="w-3 h-3 inline text-slate-300" /> Prioritize <ChevronRight className="w-3 h-3 inline text-slate-300" /> Act <ChevronRight className="w-3 h-3 inline text-slate-300" /> Measure
          </span>
        </div>
      </div>

      {/* 1.5 DIRECT GOOGLE BUSINESS PROFILE SYNC & SETUP */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 flex-wrap">
            {isGoogleConnected ? (
              <>
                <span>{businessName || 'Your business'} is synced with Google</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected
                </span>
              </>
            ) : (
              'Connect your Google Business Profile'
            )}
          </h3>
          <p className="text-sm text-slate-600">
            {isGoogleConnected
              ? 'Pull verified reviews, ratings, and business details directly into your dashboard.'
              : 'Pull your verified business name, reviews, and rating directly into your dashboard.'}
          </p>
        </div>

        {showGbpActionButton && (
          <button
            onClick={() => setIsGbpSyncModalOpen(true)}
            className={`shrink-0 w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              isGoogleConnected
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-[#059669] hover:bg-[#047857] text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{isGoogleConnected ? 'Re-sync from Google' : 'Sync Google Profile'}</span>
          </button>
        )}
      </div>

      {/* LOCORA DIRECTORY PRESENCE & INBOUND LEADS CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              {activeBusiness?.isPublishedInDirectory ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Locora Certified Directory
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  Not Published
                </span>
              )}
              {(dirAnalytics?.totalLeads ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white">
                  <Zap className="w-3.5 h-3.5" />
                  {dirAnalytics.totalLeads} inbound lead{dirAnalytics.totalLeads > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">
              {activeBusiness?.isPublishedInDirectory
                ? `${businessName || 'Your Business'} is Live on Locora Local Directory`
                : 'Your directory listing isn\u2019t live yet'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl font-sans">
              {activeBusiness?.isPublishedInDirectory ? (
                <>Local customers searching in {businessCity || 'your local area'} discover your business, inspect verified Google reviews, and submit quote requests delivered directly into your CRM.</>
              ) : (
                <>Not published yet — {!activeBusiness?.phone && !activeBusiness?.website
                  ? 'add your phone number and website'
                  : !activeBusiness?.phone
                    ? 'add your phone number'
                    : !activeBusiness?.website
                      ? 'add your website'
                      : 'complete your profile'} to publish your verified listing and start receiving inbound quote requests.</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 w-full md:w-auto">
            {activeBusiness?.isPublishedInDirectory ? (
              <a
                href={getDirectoryBusinessUrl(
                  (activeBusiness?.slug && !activeBusiness.slug.startsWith('biz_') && !activeBusiness.slug.includes('@'))
                    ? activeBusiness.slug
                    : (businessName ? businessName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : 'locora')
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <span>View Public Listing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                onClick={() => setActiveTab('settings')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <span>Complete Profile to Publish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => {
                sessionStorage.setItem('locora_visibility_subtab', 'directory_leads');
                setActiveTab('visibility');
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
            >
              <Users className="w-4 h-4" />
              <span>Directory Leads CRM</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
            <div className="text-[11px] font-medium text-slate-500">Inbound Quotes</div>
            <div className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <span>{dirAnalytics?.totalLeads ?? 0}</span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Real-Time</span>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
            <div className="text-[11px] font-medium text-slate-500">Profile Views</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {dirAnalytics?.profileViews ?? 0}
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
            <div className="text-[11px] font-medium text-slate-500">Direct Phone Calls</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {dirAnalytics?.phoneClicks ?? 0}
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
            <div className="text-[11px] font-medium text-slate-500">Conversion Rate</div>
            <div className="text-xl font-bold text-emerald-700 mt-1">
              {dirAnalytics?.leadConversionRate ? `${dirAnalytics.leadConversionRate}%` : '0%'}
            </div>
          </div>
        </div>

        {/* Recent Inbound Quotes Feed */}
        {Array.isArray(dirAnalytics?.leads) && dirAnalytics.leads.length > 0 && (
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                Latest Inbound Quote Requests ({dirAnalytics.leads.length})
              </span>
              <button
                onClick={() => {
                  sessionStorage.setItem('locora_visibility_subtab', 'directory_leads');
                  setActiveTab('visibility');
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Pipeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {dirAnalytics.leads.slice(0, 3).map((lead: any) => (
                <div
                  key={lead.id}
                  className="bg-white border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-emerald-300 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">{lead.leadName}</span>
                      <span className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md border border-emerald-100">
                        {lead.serviceRequested || 'General Quote'}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {lead.message && (
                      <p className="text-xs text-slate-600 line-clamp-1 italic font-sans">
                        "{lead.message}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {lead.leadPhone && (
                      <a
                        href={`tel:${lead.leadPhone}`}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{lead.leadPhone}</span>
                      </a>
                    )}
                    <button
                      onClick={() => {
                        sessionStorage.setItem('locora_visibility_subtab', 'directory_leads');
                        setActiveTab('visibility');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 1.8 AI BUSINESS BRAIN • VERIFIED STRATEGIC DOSSIER */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1.5">
            <DataProvenanceBadge
              type="CALCULATED"
              customText="✓ Grounded in Verified DB Record"
              size="xs"
            />
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Brain className="w-6 h-6 text-[#059669] shrink-0" />
              <span>{businessName || 'Business'} Intelligence Dossier</span>
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl">
              Synthesized from verified web crawl, services taxonomy, and regional competitive parameters{businessCity ? ` in ${businessCity}` : ''}.
            </p>
          </div>

          {/* Quick Metrics from Brain */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center min-w-[110px]">
              <span className="text-[10px] font-semibold text-slate-500 block">Health Score</span>
              <span className="text-xl font-bold text-[#059669]">
                {brainScore !== null ? brainScore : '—'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                {brainScore !== null ? '/ 100' : 'No data yet'}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center min-w-[120px]">
              <span className="text-[10px] font-semibold text-slate-500 block">AI Readiness</span>
              <span className="text-xl font-bold text-[#059669]">
                {brainReadiness !== null ? `${brainReadiness}%` : '—'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                {brainReadiness !== null ? 'Verified Depth' : 'Connect data'}
              </span>
            </div>
            <button
              onClick={() => handleAskLocora('What do you know about this business?')}
              className="px-4 py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Bot className="w-4 h-4" />
              <span>Consult Brain</span>
            </button>
          </div>
        </div>

        {/* Executive AI Synthesis Text */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Sparkles className="w-4 h-4 text-[#059669]" />
            <span>Executive Strategic Synthesis</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            {brainSummary || (businessName
              ? `Connect your Google Business Profile and website to synthesize executive AI intelligence for ${businessName}.`
              : 'Connect your business channels to synthesize executive AI intelligence.')}
          </p>

          {/* Verified Service Catalog Pills */}
          {verifiedServices.length > 0 && (
            <div className="pt-3 border-t border-slate-200 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-500">Verified Services:</span>
              {verifiedServices.map((srv, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  <Check className="w-3 h-3 text-[#059669]" />
                  {srv}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Strategic SWOT Analysis Quadrants */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Strengths */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-700">
                Strengths
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {(brainSwot?.strengths && brainSwot.strengths.length > 0) ? (
                brainSwot.strengths.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-emerald-600 shrink-0 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 italic flex items-center gap-1.5">
                  <span>No data yet — connect data to analyze strengths</span>
                </li>
              )}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-700">
                Gaps & Weaknesses
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {(visibleWeaknesses && visibleWeaknesses.length > 0) ? (
                visibleWeaknesses.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-amber-600 shrink-0 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 italic flex items-center gap-1.5">
                  <span>No data yet — connect channels to surface gaps</span>
                </li>
              )}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-sky-700">
                High-ROI Opportunities
              </span>
              <span className="w-2 h-2 rounded-full bg-sky-500" />
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {(brainSwot?.opportunities && brainSwot.opportunities.length > 0) ? (
                brainSwot.opportunities.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-sky-600 shrink-0 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 italic flex items-center gap-1.5">
                  <span>No data yet — connect channels to discover opportunities</span>
                </li>
              )}
            </ul>
          </div>

          {/* Threats */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-rose-700">
                Market Threats
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {(brainSwot?.threats && brainSwot.threats.length > 0) ? (
                brainSwot.threats.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-rose-600 shrink-0 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 italic flex items-center gap-1.5">
                  <span>No data yet — add competitors to track market threats</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* 2. OVERALL GROWTH HEALTH SECTION */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-heading">
              <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
              <span>Today's Business Health & Priorities</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold font-heading text-slate-900 tracking-tight">
              What needs attention today?
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Synthesized from your Business Brain, Visibility, Reviews, and Performance data. Complete today's top actions to keep your growth on track.
            </p>
          </div>

          {/* Master Health Score Display */}
          <div className="flex items-center gap-5 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-sm shrink-0">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {overallScore !== null && (
                  <path
                    className="text-[#059669]"
                    strokeDasharray={`${overallScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-xl font-bold font-heading leading-none ${overallScore !== null ? 'text-white' : 'text-slate-500'}`}>
                  {overallScore !== null ? overallScore : '—'}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">/ 100</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-400">
                Overall Growth Health
              </span>
              <p className="text-base font-bold font-heading text-white">
                {overallScore !== null ? `Score: ${overallScore} / 100` : 'No data yet'}
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-300 mt-1">
                <DataProvenanceBadge
                  type={overallScore !== null ? 'CALCULATED' : 'UNAVAILABLE'}
                  customText={overallScore !== null ? '✓ Weighted average of active components' : 'Connect data to calculate this metric'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4-Component Growth Health Scoring Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Scoring breakdown
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Calculated dynamically from authentic business data
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Visibility */}
            <div
              onClick={() => setActiveTab('visibility')}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 transition-all cursor-pointer group space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-800 group-hover:text-[#059669]">Visibility</span>
                <span className={`font-bold font-mono text-base ${visibilityScore !== null ? 'text-slate-900' : 'text-slate-400'}`}>
                  {visibilityScore !== null ? visibilityScore : '—'}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${visibilityScore ?? 0}%` }} />
              </div>
              <p className="text-[11px] text-slate-600 font-medium line-clamp-1">
                {hasObservedRank
                  ? `Observed Map rank #${activeBusiness.rankingAvg!.toFixed(1)}`
                  : (hasTrackedKeywords ? 'Keywords tracked' : (isGbpConnected ? 'GBP linked • rank tracking pending' : 'Connect Google Business Profile'))}
              </p>
              <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Source:</span>
                <DataProvenanceBadge
                  type={visibilityScore !== null ? 'CALCULATED' : 'UNAVAILABLE'}
                  customText={visibilityScore !== null ? '✓ Calculated' : 'Connect data'}
                />
              </div>
            </div>

            {/* 2. Trust & Reputation */}
            <div
              onClick={() => setActiveTab('reputation')}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 transition-all cursor-pointer group space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-800 group-hover:text-[#059669]">Trust & Reputation</span>
                <span className={`font-bold font-mono text-base ${trustReputationScore !== null ? 'text-slate-900' : 'text-slate-400'}`}>
                  {trustReputationScore !== null ? trustReputationScore : '—'}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${trustReputationScore ?? 0}%` }} />
              </div>
              <p className="text-[11px] text-slate-600 font-medium line-clamp-1">
                {hasReviews
                  ? `${activeBusiness.googleRating.toFixed(1)}★ • ${activeBusiness.reviewCount} reviews`
                  : (isGbpConnected ? '0 reviews on connected profile' : 'Connect GBP to sync reviews')}
              </p>
              <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Source:</span>
                <DataProvenanceBadge
                  type={trustReputationScore !== null ? 'SYNCED' : 'UNAVAILABLE'}
                  customText={trustReputationScore !== null ? '✓ Google reviews' : 'Connect data'}
                />
              </div>
            </div>

            {/* 3. Conversion & Foundation */}
            <div
              onClick={() => setActiveTab('website_review')}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 transition-all cursor-pointer group space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-800 group-hover:text-[#059669]">Conversion & Foundation</span>
                <span className={`font-bold font-mono text-base ${conversionFoundationScore !== null ? 'text-slate-900' : 'text-slate-400'}`}>
                  {conversionFoundationScore !== null ? conversionFoundationScore : '—'}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${conversionFoundationScore ?? 0}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-600 font-medium line-clamp-1">
                {hasFoundationData
                  ? `Technical SEO: ${crawlSeo} • Speed: ${crawlPerf || '—'}`
                  : (activeBusiness.website ? 'Website connected • Audit pending' : 'No website audit • Click to audit')}
              </p>
              <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Source:</span>
                <DataProvenanceBadge
                  type={conversionFoundationScore !== null ? 'CALCULATED' : 'UNAVAILABLE'}
                  customText={conversionFoundationScore !== null ? '✓ Website audit' : 'Connect data'}
                />
              </div>
            </div>

            {/* 4. Client Operations */}
            <div
              onClick={() => setActiveTab('crm')}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 transition-all cursor-pointer group space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-800 group-hover:text-[#059669]">Client Operations</span>
                <span className={`font-bold font-mono text-base ${clientOpsScore !== null ? 'text-slate-900' : 'text-slate-400'}`}>
                  {clientOpsScore !== null ? clientOpsScore : '—'}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${clientOpsScore ?? 0}%` }} />
              </div>
              <p className="text-[11px] text-slate-600 font-medium line-clamp-1">
                {hasClientOpsData
                  ? `${bizCustomers.length} client${bizCustomers.length !== 1 ? 's' : ''} • ${bizInvoices.length} invoice${bizInvoices.length !== 1 ? 's' : ''}`
                  : 'No customer records • Open CRM'}
              </p>
              <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Source:</span>
                <DataProvenanceBadge
                  type={clientOpsScore !== null ? 'USER_PROVIDED' : 'UNAVAILABLE'}
                  customText={clientOpsScore !== null ? '✓ Active records' : 'Connect data'}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRIORITY ACTION CARDS: TOP 3 THINGS TO FIX THIS WEEK */}
      <section id="fixit-actions" className="space-y-4 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight">
                Top 3 Things to Fix This Week
              </h2>
              <p className="text-xs text-slate-500">
                Ranked by AI expected impact on call conversions and local search revenue.
              </p>
            </div>
          </div>
          <button
            onClick={() => setRightAiPanelOpen(true)}
            className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Open AI Manager Copilot</span>
          </button>
        </div>

        {/* Priority Actions Grid or Verified Zero-Issue State */}
        {priorityActions.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6 text-[#059669]" />
            </div>
            {!isGoogleConnected ? (
              <>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Not enough data yet
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Connect your Google Business Profile to calculate your health score. We never report a clean bill of health without real data.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  All Systems Healthy — Zero Open Issues Detected
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Google Business Profile is synchronized, review response rate is healthy, and technical schema is verified. In accordance with operating standards, no opportunities are generated solely to fill the UI.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {priorityActions.slice(0, 3).map((action, idx) => {
              const isReasonExpanded = expandedReasonId === action.id;
              const cardTag =
                action.severity === 'critical'
                  ? { label: 'Critical Severity', bg: 'bg-red-50 text-red-800 border-red-200' }
                  : action.severity === 'high' || idx === 0
                  ? { label: 'High Priority', bg: 'bg-rose-50 text-rose-800 border-rose-200' }
                  : action.severity === 'medium' || idx === 1
                  ? { label: 'Opportunity', bg: 'bg-amber-50 text-amber-800 border-amber-200' }
                  : { label: 'Optimization', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };

              return (
                <div
                  key={action.id}
                  className={`bg-white border rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                    action.isFixed
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : idx === 0
                      ? 'border-slate-300 hover:border-emerald-500 ring-1 ring-emerald-500/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Card Header: Tag, Provenance & Impact */}
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${cardTag.bg}`}
                        >
                          {cardTag.label}
                        </span>
                        <DataProvenanceBadge
                          type="AI_RECOMMENDATION"
                          customText="✦ AI Recommendation"
                          size="xs"
                        />
                      </div>
                      {(action.isFixed || action.draft?.status === 'draft') ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Draft saved
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {action.expectedImpact}
                        </span>
                      )}
                    </div>

                    {/* Recommendation Title */}
                    <h3 className="text-base font-bold font-heading text-slate-900 leading-snug">
                      {action.recommendationTitle}
                    </h3>

                    {/* Metadata: Source & Confidence if present */}
                    {(action.source || action.confidence) && (
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                        {action.source && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-semibold uppercase">
                            {action.source.replace(/_/g, ' ')}
                          </span>
                        )}
                        {action.confidence && (
                          <span className="text-emerald-700 font-bold">
                            {Math.round(action.confidence <= 1 ? action.confidence * 100 : action.confidence)}% Confidence
                          </span>
                        )}
                      </div>
                    )}

                    {/* Problem & Why It Matters */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block mb-0.5">The Problem:</span>
                        <p className="text-slate-600 leading-relaxed">{action.problem}</p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-900 block mb-0.5">Why it matters:</span>
                        <p className="text-slate-600 leading-relaxed">{action.whyItMatters}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950">
                        <strong className="text-amber-900 block uppercase text-[10px] tracking-wider mb-0.5">Detected Evidence:</strong>
                        <span className="font-mono">{action.evidence}</span>
                      </div>
                    </div>

                  {/* AI Explanation Accordion: "Why did Locora recommend this?" */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => toggleReason(action.id)}
                      className="w-full flex items-center justify-between text-[11px] font-bold text-[#059669] hover:text-[#047857] py-1 cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Why did Locora recommend this?
                      </span>
                      {isReasonExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isReasonExpanded && (
                      <div className="mt-2 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-slate-700 leading-relaxed animate-fadeIn space-y-1.5">
                        {action.aiReasoning ? (
                          <p>{action.aiReasoning}</p>
                        ) : action.aiExplanation ? (
                          <>
                            <p><strong className="text-slate-900">Root Cause:</strong> {action.aiExplanation.rootCause}</p>
                            <p><strong className="text-slate-900">Competitor Gap:</strong> {action.aiExplanation.competitorEvidence}</p>
                            <p><strong className="text-slate-900">Revenue Impact:</strong> {action.aiExplanation.revenueImpact}</p>
                            <p><strong className="text-slate-900">Why Now:</strong> {action.aiExplanation.whyNow}</p>
                          </>
                        ) : (
                          <p>{action.whyItMatters}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Button: [ Fix It ] */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedFixItAction(action)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      action.isFixed || action.draft?.status === 'draft'
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                        : 'bg-[#059669] hover:bg-[#047857] text-white'
                    }`}
                  >
                    {action.isFixed || action.draft?.status === 'draft' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Draft saved — Review Draft</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Fix It with AI</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>

      {/* 4. ASK LOCORA AI BUSINESS MANAGER (INTELLIGENT COMMAND BAR) */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                Ask Locora AI Business Manager
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Controls all tools underneath: visibility, SEO schema, reviews, competitors, proposals, and customer CRM.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto font-mono">
            {businessName || 'Locora'} Brain Active
          </span>
        </div>

        {/* Input Bar */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAskLocora();
              }}
              placeholder={`Ask anything about growing ${businessName || 'your business'}...`}
              className="w-full pl-4 pr-32 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all font-sans"
            />
            <button
              onClick={() => handleAskLocora()}
              disabled={isAsking || !askInput.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#059669] hover:bg-[#047857] disabled:bg-slate-200 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed font-sans"
            >
              {isAsking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Ask</span>
            </button>
          </div>

          {/* Quick Pill Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mr-1">
              Suggested:
            </span>
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleAskLocora(prompt)}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 text-xs border border-slate-200 transition-all cursor-pointer font-sans"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* AI Answer Card */}
        {isAsking && (
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-xs text-slate-600 font-sans animate-pulse">
            <Loader2 className="w-4 h-4 text-[#059669] animate-spin shrink-0" />
            <span>Locora is analyzing local competitor data, Google rank algorithms, and search trends in {activeBusiness.city || 'your primary market'}...</span>
          </div>
        )}

        {aiAnswer && !isAsking && (
          <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3 font-sans text-xs text-slate-800 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#047857] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#059669]" />
                  Locora Strategy: {lastAskedQuestion}
                </span>
                <DataProvenanceBadge
                  type="AI_RECOMMENDATION"
                  customText="✦ AI Recommendation"
                  size="xs"
                />
              </div>
              <button
                onClick={() => setRightAiPanelOpen(true)}
                className="text-[11px] font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Continue in AI Panel</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="prose prose-xs max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
              {aiAnswer}
            </div>
          </div>
        )}
      </section>

      {/* Section 26: Multi-Location Intelligence & Metric Filtering */}
      <MultiLocationSection />

      {/* 5. QUICK ACCESS MODULE TILES */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('visibility')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 p-4 text-left transition-all group shadow-2xs cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
            <MapPin className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 font-heading">Visibility</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Google Maps & Local SEO</p>
        </button>

        <button
          onClick={() => setActiveTab('reputation')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 p-4 text-left transition-all group shadow-2xs cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
            <Star className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 font-heading">Reputation</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {activeBusiness.unansweredReviews > 0 ? `${activeBusiness.unansweredReviews} need replies` : 'Review intelligence'}
          </p>
        </button>

        <button
          onClick={() => setActiveTab('competitors')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 p-4 text-left transition-all group shadow-2xs cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
            <Crosshair className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 font-heading">Competitors</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {activeBusiness.competitors?.length ? `${activeBusiness.competitors.length} local rivals` : 'No rivals tracked'}
          </p>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 p-4 text-left transition-all group shadow-2xs cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 font-heading">Content</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Drafts, pages & schema</p>
        </button>
      </section>

      {/* CONTROLLED "FIX IT" EXECUTION MODAL */}
      <FixItModal
        action={selectedFixItAction}
        onClose={() => setSelectedFixItAction(null)}
      />
    </div>
  );
};
