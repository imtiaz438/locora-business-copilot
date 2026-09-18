import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  ExternalLink,
  Phone,
  Globe,
  Mail,
  MousePointerClick,
  TrendingUp,
  ShieldCheck,
  Eye,
  FileText,
  Calendar,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Search,
  CheckCircle2,
  UserCheck,
  Lock,
  Unlock,
  Clock,
  ArrowRight,
  DollarSign,
  Activity,
  Zap,
} from 'lucide-react';
import { ClientBusiness } from '../../types';
import { getDirectoryBusinessUrl } from '../../utils/domain';
import { DirectoryBusinessAnalytics, DirectoryLeadItem, DirectoryEventRecord } from '../../types/directory';

interface DirectoryLeadAnalyticsTabProps {
  activeBusiness: ClientBusiness;
}

interface AnalyticsApiResponse {
  totalPublishedListings: number;
  claimedListings: number;
  unclaimedListings: number;
  totalProfileViews: number;
  totalPhoneClicks: number;
  totalWebsiteClicks: number;
  totalQuoteRequests: number;
  totalClaimClicks: number;
  totalClaimConversions: number;
  overallConversionRate: number;
  citiesCount: number;
  categoriesCount: number;
  businessMetrics?: DirectoryBusinessAnalytics | null;
}

export const DirectoryLeadAnalyticsTab: React.FC<DirectoryLeadAnalyticsTabProps> = ({ activeBusiness }) => {
  const { businesses, switchBusiness } = useApp();
  const [selectedBizId, setSelectedBizId] = useState<string>(activeBusiness.id);
  const [data, setData] = useState<AnalyticsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'leads' | 'events' | 'benchmarks'>('leads');

  // Convert modal state
  const [convertModalLead, setConvertModalLead] = useState<DirectoryLeadItem | null>(null);
  const [convertRevenue, setConvertRevenue] = useState<string>('500');

  useEffect(() => {
    setSelectedBizId(activeBusiness.id);
  }, [activeBusiness.id]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const targetBiz = businesses.find((b) => b.id === selectedBizId) || activeBusiness;
      const targetQuery = targetBiz.directorySlug || targetBiz.slug || targetBiz.id;
      const res = await fetch(`/api/directory/analytics?businessId=${encodeURIComponent(targetQuery)}`);
      if (!res.ok) throw new Error('Failed to load directory analytics');
      const json = await res.json();
      if (json.success) {
        setData(json.analytics);
      } else {
        throw new Error(json.error || 'Unable to retrieve directory data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred loading analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedBizId, activeBusiness.id]);

  const biz = data?.businessMetrics;
  const isListingActive = Boolean(biz);

  const profileViews = biz?.profileViews || 0;
  const phoneClicks = biz?.phoneClicks || 0;
  const websiteClicks = biz?.websiteClicks || 0;
  const totalLeads = biz?.totalLeads || 0;
  const deliveredLeads = biz?.deliveredLeads || 0;
  const responsesCount = biz?.responsesCount || 0;
  const conversionsCount = biz?.conversionsCount || 0;
  const checkupsStarted = biz?.checkupsStarted || 0;
  const checkupsCompleted = biz?.checkupsCompleted || 0;
  const leadConversionRate = biz?.leadConversionRate || 0;
  const inquiryRate = biz?.inquiryRate || 0;

  const leadsList = biz?.leads || [];
  const eventsList = biz?.recentEvents || [];

  const handleMarkResponded = async (leadId: string) => {
    setActionLoadingId(leadId);
    try {
      const res = await fetch('/api/directory/lead/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          businessId: activeBusiness.id,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        setSuccessMessage('Lead marked as contacted. Event recorded in real-time logs.');
        setTimeout(() => setSuccessMessage(null), 3500);
        await fetchAnalytics();
      } else {
        alert(resJson.error || 'Failed to update lead status');
      }
    } catch (err: any) {
      alert('Network error updating lead.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertModalLead) return;

    setActionLoadingId(convertModalLead.id);
    try {
      const res = await fetch('/api/directory/lead/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: convertModalLead.id,
          businessId: activeBusiness.id,
          customerName: convertModalLead.leadName,
          customerEmail: convertModalLead.leadEmail,
          customerPhone: convertModalLead.leadPhone,
          value: parseFloat(convertRevenue) || 0,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        setConvertModalLead(null);
        setSuccessMessage('🎉 Lead successfully converted to customer! Conversion metrics updated.');
        setTimeout(() => setSuccessMessage(null), 4000);
        await fetchAnalytics();
      } else {
        alert(resJson.error || 'Failed to convert lead');
      }
    } catch (err) {
      alert('Network error converting lead');
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatEventType = (type: string) => {
    switch (type) {
      case 'directory_profile_view':
        return { label: 'Profile Viewed', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'directory_search':
        return { label: 'Directory Search', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'directory_filter':
        return { label: 'Filtered Catalog', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'directory_checkup_started':
        return { label: 'Checkup Started', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'directory_checkup_completed':
        return { label: 'Checkup Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'directory_claim_started':
        return { label: 'Claim Started', color: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'directory_claim_completed':
        return { label: 'Claim Verified', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'directory_lead_started':
        return { label: 'Lead Form Opened', color: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'directory_lead_submitted':
        return { label: 'Lead Submitted', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'directory_lead_delivered':
        return { label: 'Lead Delivered', color: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'directory_lead_response':
        return { label: 'Owner Contacted Lead', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'directory_lead_converted':
        return { label: 'Converted to Client', color: 'bg-emerald-600 text-white border-emerald-700' };
      case 'phone_click':
        return { label: 'Phone Clicked', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'website_click':
        return { label: 'Website Clicked', color: 'bg-slate-100 text-slate-700 border-slate-300' };
      default:
        return { label: type.replace(/_/g, ' '), color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  if (businesses.length === 0 || !activeBusiness || !activeBusiness.id) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-4 shadow-xs">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
        <h4 className="text-base font-bold text-slate-800">No business connected yet.</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Connect or register a business in your workspace to manage directory leads, inbound inquiries, and visibility analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner: Status & Real-time Verification */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Phase 4 Real Analytics Engine
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50/50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Zero Fabricated Metrics
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Attribution: source = directory
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
                <Building2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <span>{(businesses.find(b => b.id === selectedBizId)?.name || activeBusiness.name)} — Directory Value & Conversion</span>
              </h3>

              {businesses.length > 1 && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-2xs">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Active Business:</span>
                  <select
                    value={selectedBizId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setSelectedBizId(newId);
                      switchBusiness(newId);
                    }}
                    className="text-xs font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city || b.category || 'Location'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Verifiable measurement of whether your directory presence drives authentic business outcomes: profile impressions, instant website checkups, direct customer leads, owner response time, and converted customer value.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Logs</span>
            </button>

            {biz?.slug && (
              <a
                href={getDirectoryBusinessUrl(biz.slug)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>View Public Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Listing Status Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isListingActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {isListingActive
                  ? `Directory Status: ${biz?.isClaimed ? 'Active & Owner Verified' : 'Live Directory Listing'}`
                  : 'Processing Directory Profile'}
              </span>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {biz?.slug ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span>Public Directory Link:</span>
                    <a
                      href={getDirectoryBusinessUrl(biz.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 hover:underline font-mono font-bold inline-flex items-center gap-1"
                    >
                      {getDirectoryBusinessUrl(biz.slug)}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </span>
                ) : (
                  'Indexing directory profile...'
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-slate-400" />
              {profileViews} Real Views
            </span>
            <span className="flex items-center gap-1 text-emerald-700">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              {totalLeads} Direct Leads
            </span>
            <span className="flex items-center gap-1 text-blue-700">
              <UserCheck className="w-4 h-4 text-blue-600" />
              {conversionsCount} Converted Clients
            </span>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid: High-Contrast Value Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Direct Inbound Leads */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Direct Inbound Leads</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black font-heading text-slate-900">{totalLeads}</span>
            <span className="text-xs text-emerald-600 font-bold">{deliveredLeads} delivered</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Verified quote and service requests submitted via your public profile.
          </p>
        </div>

        {/* Conversion Rate to Paying Client */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Lead Conversion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black font-heading text-slate-900">{leadConversionRate}%</span>
            <span className="text-xs text-slate-500 font-semibold">{conversionsCount} converted</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Ratio of delivered directory leads converted into paying clients.
          </p>
        </div>

        {/* Free Public Checkups Funnel */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Checkups Initiated</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black font-heading text-slate-900">{checkupsStarted}</span>
            <span className="text-xs text-amber-600 font-bold">{checkupsCompleted} finished</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Prospects running the free website & SEO audit from your directory profile.
          </p>
        </div>

        {/* Total Inquiry Rate */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Overall Action Rate</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black font-heading text-slate-900">{inquiryRate}%</span>
            <span className="text-xs text-slate-500 font-semibold">{phoneClicks} calls + {websiteClicks} web</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Percentage of directory viewers who contacted or tapped your site.
          </p>
        </div>
      </div>

      {/* Tabs Navigation for In-Depth Data */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'leads'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Directory Leads Inbox</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'leads' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {leadsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'events'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Real-Time Event Audit Log</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'events' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {eventsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'benchmarks'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Network Benchmarks</span>
        </button>
      </div>

      {/* TAB 1: DIRECTORY LEADS INBOX */}
      {activeTab === 'leads' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold font-heading text-slate-900">
                Directory Customer Inquiries ({leadsList.length})
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Every lead originated through your public listing is cataloged here with persistent storage and lifecycle tracking.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> {responsesCount} Contacted
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-teal-600">
                <UserCheck className="w-3.5 h-3.5" /> {conversionsCount} Converted
              </span>
            </div>
          </div>

          {leadsList.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300">
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h5 className="text-sm font-bold text-slate-700">No Directory leads yet.</h5>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                When visitors request quotes or service estimates from your public directory profile, they will appear here in real time.
              </p>
              {biz?.slug && (
                <a
                  href={getDirectoryBusinessUrl(biz.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                >
                  Test Quote Request on Your Listing <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {leadsList.map((lead) => {
                const isContacted = lead.status === 'contacted' || lead.respondedAt != null;
                const isConverted = lead.status === 'converted' || lead.convertedAt != null;

                return (
                  <div
                    key={lead.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-slate-900">{lead.leadName}</h5>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {lead.serviceRequested || 'Service Quote'}
                          </span>
                          {lead.isUnlocked ? (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Unlock className="w-3 h-3 text-emerald-600" /> Pro Unmasked
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Lock className="w-3 h-3 text-amber-600" /> Masked (Free Tier)
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                          {lead.isUnlocked ? (
                            <>
                              {lead.leadPhone && (
                                <a
                                  href={`tel:${lead.leadPhone}`}
                                  className="text-emerald-600 font-bold hover:underline flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3" /> {lead.leadPhone}
                                </a>
                              )}
                              {lead.leadEmail && (
                                <a
                                  href={`mailto:${lead.leadEmail}`}
                                  className="text-slate-600 hover:underline flex items-center gap-1"
                                >
                                  <Mail className="w-3 h-3" /> {lead.leadEmail}
                                </a>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="font-mono text-slate-500 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" /> {lead.maskedPhone || '***-***-****'}
                              </span>
                              <span className="font-mono text-slate-500 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" /> {lead.maskedEmail || '***@***.com'}
                              </span>
                              <a
                                href="/pricing"
                                className="text-amber-600 font-bold hover:underline text-[11px]"
                              >
                                Upgrade to unlock full contact
                              </a>
                            </>
                          )}
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Received {new Date(lead.submittedAt).toLocaleDateString()} at {new Date(lead.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Lead Status Badge */}
                      <div>
                        {isConverted ? (
                          <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-teal-600" /> Converted Client
                          </span>
                        ) : isContacted ? (
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Contacted
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" /> New Inquiry
                          </span>
                        )}
                      </div>
                    </div>

                    {lead.message && (
                      <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 border border-slate-100">
                        <span className="font-semibold text-slate-800">Inquiry Message: </span>
                        "{lead.message}"
                      </div>
                    )}

                    {/* Action Controls: Mark Responded / Convert to Client */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Source: Locora Public Business Directory</span>
                        {lead.deliveredViaEmail && (
                          <span className="text-emerald-600 font-semibold">• Emailed to owner</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!isContacted && !isConverted && (
                          <button
                            onClick={() => handleMarkResponded(lead.id)}
                            disabled={actionLoadingId === lead.id}
                            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                            <span>Mark Contacted</span>
                          </button>
                        )}

                        {!isConverted && (
                          <button
                            onClick={() => setConvertModalLead(lead)}
                            disabled={actionLoadingId === lead.id}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Convert to Client</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REAL-TIME EVENT AUDIT STREAM */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold font-heading text-slate-900">
                Verifiable Event Audit Stream ({eventsList.length})
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Every event recorded chronologically with visitor session, source, and metadata. No simulated entries.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Disk Persistence: locora_directory_events.json
            </div>
          </div>

          {eventsList.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300">
              <Activity className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h5 className="text-sm font-bold text-slate-700">No Events Logged Yet</h5>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                As visitors search, view profiles, initiate checkups, or submit leads, real events will stream into this audit ledger.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
              {eventsList.map((ev) => {
                const badge = formatEventType(ev.eventType);
                return (
                  <div key={ev.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start sm:items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] border shrink-0 ${badge.color}`}>
                        {badge.label}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-800">
                          {ev.eventType}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                          <span>Source: {ev.source || 'directory'}</span>
                          {ev.city && <span>• City: {ev.city}</span>}
                          {ev.category && <span>• Cat: {ev.category}</span>}
                          {ev.sessionId && <span>• Session: {ev.sessionId.slice(0, 10)}...</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-400 shrink-0 font-mono">
                      {new Date(ev.timestamp).toLocaleDateString()} {new Date(ev.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: NETWORK BENCHMARKS */}
      {activeTab === 'benchmarks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h4 className="text-base font-bold font-heading text-slate-900">
                Customer Engagement Breakdown
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Verifiable interaction channels tracked across your Locora public business listing.
              </p>
            </div>

            <div className="space-y-4">
              {/* Phone Calls */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-700 flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Telephone Inquiries (Tap-to-Call)</h5>
                    <p className="text-[11px] text-slate-500">Inbound direct mobile dialing</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900">{phoneClicks}</span>
                  <span className="text-[10px] text-slate-400 block font-semibold">clicks</span>
                </div>
              </div>

              {/* Direct Estimate Requests */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Direct Quote & Lead Inquiries</h5>
                    <p className="text-[11px] text-slate-500">Form submissions sent to business inbox</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900">{totalLeads}</span>
                  <span className="text-[10px] text-slate-400 block font-semibold">requests</span>
                </div>
              </div>

              {/* Website Referral Clicks */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100/70 text-teal-700 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Website Referral Backlinks</h5>
                    <p className="text-[11px] text-slate-500">Direct SEO clicks to {activeBusiness.website || 'your website'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900">{websiteClicks}</span>
                  <span className="text-[10px] text-slate-400 block font-semibold">referrals</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Zero Synthetic Data: All interaction logs reflect authentic user sessions.
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Updated Live
              </span>
            </div>
          </div>

          {/* Right Col: Network Benchmark Context */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold font-heading text-white">
                Locora Organic Network Reach
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your business is part of an interconnected directory indexing verified service providers across metropolitan hubs.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Network Cities</span>
                  <span className="font-extrabold text-white">{data?.citiesCount || 1} Metropolitan Areas</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Published Listings</span>
                  <span className="font-extrabold text-white">{data?.totalPublishedListings || 1} Businesses</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Network Action Rate</span>
                  <span className="font-extrabold text-emerald-400">{data?.overallConversionRate || 0}%</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Maximize Directory Inbound Volume:
              </span>
              <ul className="text-[11px] text-slate-300 space-y-1">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Keep business operating hours updated
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Respond promptly to incoming quote requests
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Sync Google Business Profile reviews regularly
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Convert Lead to Customer Modal */}
      {convertModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Convert Lead to Paying Client</h4>
                  <p className="text-[11px] text-slate-500">Record customer conversion & business value</p>
                </div>
              </div>
              <button
                onClick={() => setConvertModalLead(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmConvert} className="space-y-4">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-900">{convertModalLead.leadName}</div>
                <div className="text-slate-500">{convertModalLead.serviceRequested}</div>
                {convertModalLead.leadPhone && <div className="text-slate-600">{convertModalLead.leadPhone}</div>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Customer Value / Booking Revenue ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={convertRevenue}
                    onChange={(e) => setConvertRevenue(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  This measures the direct financial ROI generated from the directory.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConvertModalLead(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === convertModalLead.id}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Customer Conversion</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
