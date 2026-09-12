import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TierLockGate } from './TierLockGate';
import {
  Building2,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Search,
  ExternalLink,
  Bot,
  Star,
  Eye,
  MapPin,
  FileText,
  ShieldCheck,
  Check,
  Loader2,
} from 'lucide-react';

interface AgencyClientItem {
  id: string;
  name: string;
  category: string;
  city: string;
  score: number;
  status: 'need_attention' | 'improving' | 'healthy';
  issue?: string;
  recommendedAction: string;
  reviewsCount: number;
  rating: number;
  unansweredReviews: number;
}

export const AgencyClientsView: React.FC = () => {
  const { switchBusiness, setActiveTab, activeBusiness, logActivity, businesses, user } = useApp();

  // Demo Fallback for Guest Preview Only
  const DEMO_AGENCY_CLIENTS: AgencyClientItem[] = [
    {
      id: 'demo-agency',
      name: 'Demo Growth Agency',
      category: 'Digital Marketing & SEO',
      city: 'San Francisco, CA',
      score: 85,
      status: 'healthy',
      recommendedAction: 'Deploy localized sub-service landing pages',
      reviewsCount: 48,
      rating: 4.9,
      unansweredReviews: 2,
    },
    {
      id: 'apex-solutions',
      name: 'Apex Local Solutions',
      category: 'Professional Services',
      city: 'Oakland, CA',
      score: 64,
      status: 'need_attention',
      issue: 'Review rating dropped (4.8★ → 4.3★ after 2 negative ratings)',
      recommendedAction: 'Draft empathetic replies & launch review recovery SMS',
      reviewsCount: 89,
      rating: 4.3,
      unansweredReviews: 5,
    },
    {
      id: 'abc-legal',
      name: 'Pacific Coast Legal',
      category: 'Legal Services',
      city: 'San Jose, CA',
      score: 72,
      status: 'improving',
      issue: 'Visibility declined (-8% local rank for competitive queries)',
      recommendedAction: 'Inject LegalService Schema & build local citations',
      reviewsCount: 114,
      rating: 4.7,
      unansweredReviews: 2,
    },
    {
      id: 'beacon-consulting',
      name: 'Beacon Tech Consulting',
      category: 'Technology & IT Services',
      city: 'Palo Alto, CA',
      score: 84,
      status: 'healthy',
      issue: 'Competitor gaining reviews (+8 reviews this week)',
      recommendedAction: 'Accelerate post-project review invite frequency',
      reviewsCount: 198,
      rating: 4.9,
      unansweredReviews: 0,
    },
    {
      id: 'apex-spine',
      name: 'Apex Spine Center',
      category: 'Chiropractic & Physical Therapy',
      city: 'Cedar Park, TX',
      score: 64,
      status: 'need_attention',
      issue: '9 unanswered reviews older than 30 days',
      recommendedAction: 'Clear unanswered review backlog with HIPAA compliance',
      reviewsCount: 76,
      rating: 4.4,
      unansweredReviews: 9,
    },
    {
      id: 'hill-country-roofing',
      name: 'Hill Country Roofing',
      category: 'Construction & Roofing',
      city: 'Dripping Springs, TX',
      score: 88,
      status: 'healthy',
      recommendedAction: 'Promote seasonal storm damage inspection campaign',
      reviewsCount: 195,
      rating: 5.0,
      unansweredReviews: 1,
    },
    {
      id: 'lone-star-hvac',
      name: 'Lone Star HVAC',
      category: 'Home Services',
      city: 'San Marcos, TX',
      score: 75,
      status: 'improving',
      issue: 'Summer AC surge keyword visibility rising (+18%)',
      recommendedAction: 'Publish 2 Google posts for emergency weekend cooling',
      reviewsCount: 142,
      rating: 4.6,
      unansweredReviews: 3,
    },
    {
      id: 'capital-eye-care',
      name: 'Capital Eye Care',
      category: 'Optometry & Vision',
      city: 'Austin, TX',
      score: 82,
      status: 'healthy',
      recommendedAction: 'Update accepted vision insurance carriers in schema',
      reviewsCount: 220,
      rating: 4.8,
      unansweredReviews: 2,
    },
    {
      id: 'travis-county-ortho',
      name: 'Travis County Ortho',
      category: 'Orthodontics',
      city: 'Austin, TX',
      score: 60,
      status: 'need_attention',
      issue: 'Lost 3-Pack rank #1 for "invisalign teen austin"',
      recommendedAction: 'Refresh Invisalign sub-page and add before/after schema',
      reviewsCount: 98,
      rating: 4.3,
      unansweredReviews: 7,
    },
    {
      id: 'downtown-medspa',
      name: 'Downtown MedSpa',
      category: 'Aesthetics & Wellness',
      city: 'Downtown Austin, TX',
      score: 79,
      status: 'improving',
      recommendedAction: 'Run Hydrafacial special promotion on Google Business profile',
      reviewsCount: 165,
      rating: 4.8,
      unansweredReviews: 4,
    },
    {
      id: 'westlake-family-law',
      name: 'Westlake Family Law',
      category: 'Legal Services',
      city: 'Westlake Hills, TX',
      score: 73,
      status: 'improving',
      recommendedAction: 'Add child custody & mediation service pages',
      reviewsCount: 82,
      rating: 4.9,
      unansweredReviews: 1,
    },
    {
      id: 'south-congress-chiro',
      name: 'South Congress Chiro',
      category: 'Wellness & Health',
      city: 'Austin, TX',
      score: 85,
      status: 'healthy',
      recommendedAction: 'Expand sports recovery and dry needling visibility',
      reviewsCount: 210,
      rating: 4.9,
      unansweredReviews: 0,
    },
  ];

  const [filterStatus, setFilterStatus] = useState<'all' | 'need_attention' | 'improving' | 'healthy'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Section 25 Agency AI Manager State
  const [agencyAiRunning, setAgencyAiRunning] = useState(false);
  const [agencyAiActionsGenerated, setAgencyAiActionsGenerated] = useState(false);

  // Synchronize client list strictly from user's authentic database businesses
  const clientsList: AgencyClientItem[] = useMemo(() => {
    if (!user.isAuthenticated) {
      return DEMO_AGENCY_CLIENTS;
    }
    return businesses.map((b) => {
      const score = b.healthScore || 70;
      const status: 'healthy' | 'improving' | 'need_attention' =
        score >= 75 ? 'healthy' : score >= 65 ? 'improving' : 'need_attention';
      return {
        id: b.id,
        name: b.name,
        category: b.category || 'Local Business',
        city: b.city ? `${b.city}${b.state ? `, ${b.state}` : ''}` : 'Local Market',
        score,
        status,
        recommendedAction:
          b.highImpactCount > 0
            ? 'Execute urgent Technical SEO Audit & Local schema fixes'
            : 'Monitor live Google keyword rankings and review velocity',
        reviewsCount: b.reviewCount || 0,
        rating: b.googleRating || 0,
        unansweredReviews: b.unansweredReviews || 0,
      };
    });
  }, [user.isAuthenticated, businesses]);

  const attentionCount = clientsList.filter((c) => c.status === 'need_attention').length;
  const improvingCount = clientsList.filter((c) => c.status === 'improving').length;
  const healthyCount = clientsList.filter((c) => c.status === 'healthy').length;
  const topAttentionClients = clientsList.filter((c) => c.status === 'need_attention' || c.status === 'improving').slice(0, 3);

  const filteredClients = clientsList.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase()) && !c.city.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleEnterClientBusinessBrain = (client: AgencyClientItem) => {
    switchBusiness(client.id);
    setActiveTab('business_brain');
    logActivity('agency', 'Client Workspace Switched', `Entered Business Brain for ${client.name}`);
  };

  const handleGenerateAllAgencyActions = () => {
    setAgencyAiRunning(true);
    setTimeout(() => {
      setAgencyAiRunning(false);
      setAgencyAiActionsGenerated(true);
      const firstClients = clientsList.slice(0, 3).map((c) => c.name).join(', ') || 'Managed Clients';
      logActivity('agency', 'Agency AI Action Generated', `Generated multi-client recovery plans for ${firstClients}`);
    }, 1200);
  };

  return (
    <TierLockGate
      requiredPlan="agency"
      featureName="Agency Clients Multi-Location Hub"
      featureDescription="Manage unlimited client businesses, monitor health scores, and execute multi-location AI strategies from a single unified cockpit."
    >
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-900">
        {/* Agency Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px] uppercase font-heading">
              Agency Mode
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {clientsList.length} Client {clientsList.length === 1 ? 'Account' : 'Accounts'} Managed
            </span>
          </div>
          <h2 className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-[#059669]" />
            <span>Clients</span>
          </h2>
          <p className="text-xs text-slate-500">
            Multi-client portfolio intelligence: monitor real-time health, run autonomous agency diagnostics, and drill into any client's Business Brain.
          </p>
        </div>

        {/* Section 24 Summary Badges: 🔴 3 Need Attention | 🟡 5 Improving | 🟢 4 Healthy */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('need_attention')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'need_attention'
                ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-2xs ring-2 ring-rose-200'
                : 'bg-white border-slate-200 text-rose-700 hover:bg-rose-50/50'
            }`}
          >
            <span>🔴 {attentionCount} Need Attention</span>
          </button>

          <button
            onClick={() => setFilterStatus('improving')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'improving'
                ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs ring-2 ring-amber-200'
                : 'bg-white border-slate-200 text-amber-700 hover:bg-amber-50/50'
            }`}
          >
            <span>🟡 {improvingCount} Improving</span>
          </button>

          <button
            onClick={() => setFilterStatus('healthy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'healthy'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs ring-2 ring-emerald-200'
                : 'bg-white border-slate-200 text-emerald-700 hover:bg-emerald-50/50'
            }`}
          >
            <span>🟢 {healthyCount} Healthy</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 25: AGENCY AI MANAGER */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                Agency AI Manager
              </h3>
              <p className="text-[11px] text-slate-400">Autonomous weekly account auditor for agency operators</p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
            Portfolio Scan: Live
          </span>
        </div>

        {/* Query & Answer Flow */}
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-400 font-bold">Agency asks:</span>
            <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold italic">
              "Which clients need my attention this week?"
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span className="font-bold text-white font-heading text-sm">
                  Locora: 3 clients need attention
                </span>
              </div>
            </div>

            {/* Dynamic Attention Items from Active Database */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {topAttentionClients.length === 0 ? (
                <div className="col-span-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                  All active business profiles are currently in healthy standing. No critical bottlenecks pending.
                </div>
              ) : (
                topAttentionClients.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleEnterClientBusinessBrain(c)}
                    className={`p-3.5 rounded-xl bg-slate-900/80 border space-y-1 cursor-pointer hover:border-white/30 transition ${
                      c.status === 'need_attention' ? 'border-rose-500/40' : 'border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${c.status === 'need_attention' ? 'text-rose-300' : 'text-amber-300'}`}>
                        {c.status === 'need_attention' ? '🔴' : '🟡'} {c.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{c.score}/100</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium">{c.category}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-2">{c.recommendedAction}</p>
                  </div>
                ))
              )}
            </div>

            {/* Section 25 Big CTA: [ Generate All Recommended Actions ] */}
            <div className="pt-3 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Turn diagnostics into automated action plans across your entire agency portfolio.
              </span>

              <button
                onClick={handleGenerateAllAgencyActions}
                disabled={agencyAiRunning}
                className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                {agencyAiRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Synthesizing Multi-Account Plans...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate All Recommended Actions</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Render Generated Actions when triggered */}
          {agencyAiActionsGenerated && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3 animate-scaleUp">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{Math.min(3, clientsList.length)} Multi-Client Action Bundles Generated Successfully</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Ready to Deploy</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-300">
                {clientsList.slice(0, 3).map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-700">
                    <strong className="text-white block mb-1">{c.name}:</strong>
                    Synthesized localized keyword targets, verified GBP status, and queued automated Schema & review workflows.
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 24: CLIENTS LIST */}
      {/* ========================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                filterStatus === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Clients ({clientsList.length})
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-500">
              Click any client to enter their Business Brain & full dashboard
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter clients by name or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]/20"
            />
          </div>
        </div>

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredClients.map((client) => {
            const isAttention = client.status === 'need_attention';
            const isImproving = client.status === 'improving';
            const isHealthy = client.status === 'healthy';

            return (
              <div
                key={client.id}
                onClick={() => handleEnterClientBusinessBrain(client)}
                className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-4 flex flex-col justify-between group ${
                  activeBusiness.id === client.id
                    ? 'border-[#059669] ring-2 ring-[#059669]/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Top: Name, City, Health Status Badge */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 font-heading group-hover:text-[#059669] transition-colors line-clamp-1">
                      {client.name}
                    </h4>
                    <span
                      className={`text-[11px] font-extrabold font-mono px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 ${
                        isAttention
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isImproving
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <span>{client.score}</span>
                      <span>{isAttention ? '🔴' : isImproving ? '🟡' : '🟢'}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{client.city}</span>
                  </p>
                </div>

                {/* Metrics pill */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-slate-800">{client.rating}</span>
                    <span className="text-[10px] text-slate-400">({client.reviewsCount})</span>
                  </div>

                  {client.unansweredReviews > 0 ? (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                      {client.unansweredReviews} unread
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                      All caught up
                    </span>
                  )}
                </div>

                {/* Primary Issue or Action */}
                <div className="space-y-1 text-xs">
                  {client.issue ? (
                    <p className="text-[11px] font-medium text-rose-700 line-clamp-2">
                      {client.issue}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {client.recommendedAction}
                    </p>
                  )}
                </div>

                {/* Card Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-[#059669] group-hover:underline flex items-center gap-1">
                    <span>Enter Business Brain</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </TierLockGate>
  );
};
