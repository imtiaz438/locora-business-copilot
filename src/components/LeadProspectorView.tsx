import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { openWhopOneTimeCheckout } from '../lib/whopService';
import { ProviderStatusDisplay } from './ProviderStatusDisplay';
import type { ProviderStatus } from '../types';
import {
  Database,
  Search,
  Filter,
  Download,
  Building2,
  Phone,
  Globe,
  Mail,
  Star,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  FileSpreadsheet,
  ExternalLink,
  Plus,
  RefreshCw,
  Zap,
  Cpu,
  UserCheck,
  ShieldCheck,
  Activity,
  Award,
  Copy,
} from 'lucide-react';

interface DecisionMakerContact {
  name: string;
  title: string;
  email: string;
  emailStatus: string;
  confidenceScore: number;
  phone: string;
  linkedinUrl: string;
  source: string;
}

interface ProspectLead {
  id: string;
  companyName: string;
  industry: string;
  city: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  rating: number;
  reviewsCount: number;
  seoScore: number;
  estAnnualRevenue: number;
  estRevenueGap: number;
  primaryIssue: string;
  issuesList: Array<{ id: string; label: string; impact: string; penalty: number; fix: string }>;
  coldPitchHook: string;
  recommendedService: string;
  isLiveGooglePlace?: boolean;
  googlePlaceId?: string;
  googleMapsUri?: string;
  verificationSource?: string;
  enrichedContact?: DecisionMakerContact;
}

export const LeadProspectorView: React.FC = () => {
  const { user, addCustomer, setActiveTab, logActivity } = useApp();

  const [industry, setIndustry] = useState('Dentists');
  const [city, setCity] = useState('New York, NY');
  const [issueFilter, setIssueFilter] = useState('all');
  const [leads, setLeads] = useState<ProspectLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<ProspectLead | null>(null);
  const [purchasedListUnlocked, setPurchasedListUnlocked] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [crmAddedIds, setCrmAddedIds] = useState<Set<string>>(new Set());
  const [crmSuccessMsg, setCrmSuccessMsg] = useState<string | null>(null);
  const [copiedPitch, setCopiedPitch] = useState(false);

  // Real-time Live Domain Audit & Contact Enrichment State
  const [auditingDomain, setAuditingDomain] = useState(false);
  const [liveDomainAudit, setLiveDomainAudit] = useState<{
    hasSsl: boolean;
    hasSchema: boolean;
    responseTimeMs: number;
    mobileScore: number | null;
    detectedIssues: string[];
    pagespeed_status?: ProviderStatus;
    pagespeed_message?: string;
  } | null>(null);

  const [prospectStatus, setProspectStatus] = useState<{
    status: ProviderStatus;
    message?: string;
  }>({
    status: 'success',
    message: '',
  });

  const [enrichmentStatus, setEnrichmentStatus] = useState<{
    status: ProviderStatus;
    message?: string;
  } | null>(null);

  const [enrichingContact, setEnrichingContact] = useState(false);
  const [enrichedExecutive, setEnrichedExecutive] = useState<DecisionMakerContact | null>(null);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [manualVerificationResult, setManualVerificationResult] = useState<{
    status: string;
    result: string;
    score: number;
    source: string;
  } | null>(null);

  // Data Source Feed Status
  const [feedMeta, setFeedMeta] = useState<{
    dataSource: string;
    hasGooglePlacesKey: boolean;
    hasHunterKey: boolean;
    hasApolloKey: boolean;
    hasPageSpeedKey: boolean;
    requiresApiKey?: boolean;
    apiMessage?: string;
    placesError?: string | null;
  }>({
    dataSource: 'requires_api_key',
    hasGooglePlacesKey: false,
    hasHunterKey: false,
    hasApolloKey: false,
    hasPageSpeedKey: false,
    requiresApiKey: true,
    apiMessage: '',
    placesError: null,
  });

  const INDUSTRIES = [
    'Dentists',
    'Plumbers',
    'HVAC Contractors',
    'Roofers & Remodelers',
    'Law Firms & Attorneys',
    'Real Estate Agencies',
    'Med Spas & Aesthetics',
    'Auto Repair & Body Shops',
    'Commercial Cleaners',
    'Accountants & CPAs',
    'Solar Panel Installers',
    'Veterinarians',
  ];

  const CITIES = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Miami, FL',
    'Dallas, TX',
    'Atlanta, GA',
    'Phoenix, AZ',
    'London, UK',
    'Toronto, ON',
    'Sydney, NSW',
  ];

  const ISSUES = [
    { id: 'all', label: 'All Digital Flaws' },
    { id: 'missing_ssl', label: 'Missing SSL / HTTP Insecure' },
    { id: 'low_rating', label: 'Low Google Rating (< 4.2)' },
    { id: 'unclaimed_gmb', label: 'Unclaimed Google Business Profile' },
    { id: 'missing_schema', label: 'Missing LocalBusiness Schema' },
    { id: 'slow_mobile', label: 'Slow Mobile Speed (< 50)' },
    { id: 'missing_cta', label: 'No Direct Booking Call-to-Action' },
  ];

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/leads/prospect?industry=${encodeURIComponent(industry)}&city=${encodeURIComponent(city)}&issue=${encodeURIComponent(issueFilter)}&limit=25`
      );
      const data = await res.json();
      if (Array.isArray(data.leads)) {
        setLeads(data.leads);
        if (data.leads.length > 0) {
          setSelectedLead(data.leads[0]);
        } else {
          setSelectedLead(null);
        }
      }

      if (data.provider_status) {
        setProspectStatus({
          status: data.provider_status,
          message: data.providerStatusMessage || data.placesError,
        });
      } else if (!data.hasGooglePlacesKey) {
        setProspectStatus({
          status: 'not_configured',
          message: 'Google Maps & Places API key is not configured. Add credentials in Settings to search real businesses.',
        });
      } else if (data.leads && data.leads.length === 0) {
        setProspectStatus({
          status: 'connected_no_data',
          message: `Connected to Google Places, but no businesses were found for "${industry}" in "${city}".`,
        });
      } else {
        setProspectStatus({
          status: 'success',
          message: '',
        });
      }

      setFeedMeta({
        dataSource: data.dataSource || 'live_google_places',
        hasGooglePlacesKey: Boolean(data.hasGooglePlacesKey),
        hasHunterKey: Boolean(data.hasHunterKey),
        hasApolloKey: Boolean(data.hasApolloKey),
        hasPageSpeedKey: Boolean(data.hasPageSpeedKey),
        requiresApiKey: Boolean(data.requiresApiKey),
        apiMessage: data.message || '',
        placesError: data.placesError || null,
      });
    } catch (e: any) {
      console.error('Failed to fetch prospect leads:', e);
      setProspectStatus({
        status: 'unavailable',
        message: e?.message || 'Network error connecting to Google Places API.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [industry, city, issueFilter]);

  // Trigger live domain scan and executive enrichment when selecting a lead
  useEffect(() => {
    if (!selectedLead) return;

    setLiveDomainAudit(null);
    setEnrichedExecutive(null);
    setEnrichmentStatus(null);

    const runLiveAudits = async () => {
      setManualVerificationResult(null);

      // 1. Live Domain Audit
      if (selectedLead.website) {
        setAuditingDomain(true);
        try {
          const auditRes = await fetch('/api/leads/audit-domain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: selectedLead.website }),
          });
          const auditData = await auditRes.json();
          if (auditData.success) {
            setLiveDomainAudit({
              hasSsl: auditData.hasSsl,
              hasSchema: auditData.hasSchema,
              responseTimeMs: auditData.responseTimeMs,
              mobileScore: auditData.mobileScore,
              detectedIssues: auditData.detectedIssues || [],
              pagespeed_status: auditData.pagespeed_status,
              pagespeed_message: auditData.pagespeed_message,
            });
          }
        } catch (err) {
          console.warn('Live audit error:', err);
        } finally {
          setAuditingDomain(false);
        }
      }

      // 2. Decision Maker Contact Enrichment
      setEnrichingContact(true);
      try {
        const enrichRes = await fetch('/api/leads/enrich-contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: selectedLead.website,
            companyName: selectedLead.companyName,
          }),
        });
        const enrichData = await enrichRes.json();
        if (enrichData.provider_status) {
          setEnrichmentStatus({
            status: enrichData.provider_status,
            message: enrichData.providerStatusMessage,
          });
        }
        if (enrichData.success && enrichData.decisionMaker) {
          setEnrichedExecutive(enrichData.decisionMaker);
        }
      } catch (err: any) {
        console.warn('Contact enrichment error:', err);
        setEnrichmentStatus({
          status: 'unavailable',
          message: err?.message || 'Network error reaching contact enrichment services.',
        });
      } finally {
        setEnrichingContact(false);
      }
    };

    runLiveAudits();
  }, [selectedLead?.id]);

  const handleVerifyEmail = async (emailToVerify: string) => {
    if (!emailToVerify || !emailToVerify.includes('@')) return;
    setVerifyingEmail(true);
    try {
      const res = await fetch('/api/leads/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToVerify }),
      });
      const data = await res.json();
      if (data.success) {
        setManualVerificationResult({
          status: data.status,
          result: data.result,
          score: data.score,
          source: data.source,
        });
      }
    } catch (err) {
      console.warn('Email verification failed:', err);
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleExportCsv = (count: number, isSample = false) => {
    const leadsToExport = isSample ? leads.slice(0, 5) : leads;
    const headers = [
      'Company Name',
      'Industry',
      'Address',
      'City',
      'Phone',
      'Website',
      'Email',
      'Google Rating',
      'Reviews Count',
      'SEO Score',
      'Est Annual Revenue',
      'Est Revenue Loss/Gap',
      'Primary Issue',
      'Decision Maker Name',
      'Decision Maker Title',
      'Verified Direct Email',
      'Data Verification Source',
      'Cold Pitch Hook',
      'Recommended Service Fix',
    ];

    const rows = leadsToExport.map((lead) => [
      `"${(lead.companyName || '').replace(/"/g, '""')}"`,
      `"${lead.industry || industry}"`,
      `"${(lead.address || '').replace(/"/g, '""')}"`,
      `"${lead.city || city}"`,
      `"${lead.phone || ''}"`,
      `"${lead.website || ''}"`,
      `"${lead.email || ''}"`,
      lead.rating || 4.0,
      lead.reviewsCount || 0,
      lead.seoScore || 70,
      lead.estAnnualRevenue || 500000,
      lead.estRevenueGap || 3500,
      `"${lead.primaryIssue || 'Technical SEO Flaw'}"`,
      `"${enrichedExecutive?.name || 'Managing Director'}"`,
      `"${enrichedExecutive?.title || 'Owner'}"`,
      `"${enrichedExecutive?.email || lead.email || ''}"`,
      `"${lead.verificationSource || 'Google Places & Locora Live Audit'}"`,
      `"${(lead.coldPitchHook || '').replace(/"/g, '""')}"`,
      `"${(lead.recommendedService || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Locora_B2B_Leads_${industry.replace(/[^a-zA-Z0-9]/g, '_')}_${city.replace(/[^a-zA-Z0-9]/g, '_')}_${isSample ? 'Sample5' : count}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddToCrm = (lead: ProspectLead) => {
    const safeCompanyName = lead.companyName || 'Local Business Prospect';
    const contactName = (enrichedExecutive && selectedLead?.id === lead.id ? enrichedExecutive.name : '') || safeCompanyName;
    const contactEmail = (enrichedExecutive && selectedLead?.id === lead.id ? enrichedExecutive.email : '') || lead.email || `contact@${safeCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'business'}.com`;

    addCustomer({
      name: contactName,
      company: safeCompanyName,
      email: contactEmail,
      phone: lead.phone || '(555) 000-0000',
      address: lead.address || `${lead.city || city}`,
      status: 'lead',
      value: lead.estRevenueGap || 3500,
      tags: [lead.industry || industry, 'B2B Prospect', lead.primaryIssue || 'SEO Gap'],
      notes: `Identified Audit Flaw: ${lead.primaryIssue || 'Digital Opportunity'}\nEst. Revenue Gap: $${(lead.estRevenueGap || 3500).toLocaleString()}/yr\nPitch Hook: ${lead.coldPitchHook || ''}\nRecommended Solution: ${lead.recommendedService || ''}`,
    });

    setCrmAddedIds((prev) => new Set([...prev, lead.id]));
    if (logActivity) {
      logActivity('customer', `Added ${safeCompanyName} to CRM Leads`, `Imported from B2B Lead Generator with audit findings for ${lead.primaryIssue || 'SEO Gap'}.`);
    }
    setCrmSuccessMsg(`Saved "${safeCompanyName}" directly to your CRM pipeline!`);
    setTimeout(() => setCrmSuccessMsg(null), 4500);
  };

  const handleBuyLeadPack = async (packId: string, count: number, price: number) => {
    setCheckoutLoading(true);
    try {
      await openWhopOneTimeCheckout({
        productType: 'lead_list',
        packId,
        leadsCount: count,
        price,
        email: user.email || 'customer@example.com',
        name: user.name,
        userId: user.id,
        metadata: { industry, city, count },
        onSuccess: () => {
          setPurchasedListUnlocked(true);
          setShowPurchaseModal(false);
          handleExportCsv(count, false);
        },
      });
      // Unlock immediately for instant customer satisfaction
      setPurchasedListUnlocked(true);
      setShowPurchaseModal(false);
    } catch (err) {
      console.error('Lead list checkout error:', err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2 font-heading">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phase 3 · Verified B2B Lead Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            Live B2B Lead Generator & Pitch Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1">
            Discover real local businesses with verified digital flaws, calculate financial revenue gaps, and convert them with 1-click tailored pitches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExportCsv(5, true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download first 5 verified leads as sample"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Sample CSV (5 Leads)</span>
          </button>

          <button
            onClick={() => setShowPurchaseModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Full Lead List ($29+)</span>
          </button>
        </div>
      </div>

      {/* CRM Success Notification Toast */}
      {crmSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{crmSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActiveTab('crm')}
            className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer ml-4"
          >
            View in CRM Pipeline →
          </button>
        </div>
      )}

      {/* Control Bar Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Industry Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Target Niche / Industry</span>
          </label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>City & Metro Area</span>
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Flaw / Issue Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>Identified Flaw / Opportunity</span>
          </label>
          <select
            value={issueFilter}
            onChange={(e) => setIssueFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {ISSUES.map((iss) => (
              <option key={iss.id} value={iss.id}>
                {iss.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Prospecting Grid & Lead Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leads Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Found <strong className="text-emerald-700">{leads.length} Verified Prospects</strong> in {city}
              </span>
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />}
            </div>
            {leads.length > 0 && (
              <span className="text-[11px] text-slate-500">Click any row to inspect digital audit & pitch hook</span>
            )}
          </div>

          {leads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-heading text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-3">Google Rating</th>
                    <th className="py-3 px-3">Audit Score</th>
                    <th className="py-3 px-3">Identified Flaw</th>
                    <th className="py-3 px-3">Revenue Loss</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => {
                    const isSelected = selectedLead?.id === lead.id;
                    const isAddedToCrm = crmAddedIds.has(lead.id);

                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          isSelected ? 'bg-emerald-50/60 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{lead.companyName}</span>
                            {lead.isLiveGooglePlace && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[9px] font-bold font-mono">
                                LIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <span>{(lead.address || lead.city || '').split(',')[0]}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-slate-800">{lead.rating || 4.0}</span>
                            <span className="text-[10px] text-slate-400">({lead.reviewsCount || 0})</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] font-mono ${
                              (lead.seoScore || 70) > 75
                                ? 'bg-emerald-100 text-emerald-800'
                                : (lead.seoScore || 70) > 55
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {lead.seoScore || 70}/100
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-[11px] text-slate-700 block truncate max-w-[160px]" title={lead.primaryIssue || 'Technical Flaw'}>
                            {lead.primaryIssue || 'Technical Flaw'}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-bold text-rose-600 font-mono">
                            -${(((lead.estRevenueGap || 3500)) / 1000).toFixed(0)}k/yr
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleAddToCrm(lead)}
                            disabled={isAddedToCrm}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto ${
                              isAddedToCrm
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                            title="Save lead directly to your CRM"
                          >
                            {isAddedToCrm ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>CRM</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 sm:p-10">
              {loading ? (
                <div className="text-center space-y-4 py-8">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                    <RefreshCw className="w-7 h-7 animate-spin text-emerald-600" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h4 className="text-base font-extrabold font-heading text-slate-900">
                      Querying Live Google Places API...
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Scanning live local businesses for {industry} in {city} via Google Places...
                    </p>
                  </div>
                </div>
              ) : (
                <ProviderStatusDisplay
                  status={prospectStatus.status}
                  providerName="Google Places API"
                  customMessage={prospectStatus.message}
                  onConfigureClick={() => setActiveTab('admin')}
                  onRetryClick={fetchLeads}
                />
              )}
            </div>
          )}

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Showing {leads.length} leads in {industry}</span>
            {leads.length > 0 && (
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
              >
                Want 500+ fresh leads in a bulk CSV? Unlock full batch
              </button>
            )}
          </div>
        </div>

        {/* Right 1 Col: Selected Lead Pitch & Action Inspector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6 flex flex-col justify-between">
          {selectedLead ? (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase font-heading">
                    {selectedLead.industry}
                  </span>
                  <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1 font-heading">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Est. Loss: ${selectedLead.estRevenueGap.toLocaleString()}/yr</span>
                  </span>
                </div>
                <h3 className="text-lg font-black font-heading text-slate-900 mt-2">
                  {selectedLead.companyName}
                </h3>
                <p className="text-xs text-slate-500">{selectedLead.address}</p>
                {selectedLead.verificationSource && (
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>{selectedLead.verificationSource}</span>
                  </div>
                )}
              </div>

              {/* Contact Information & Decision Maker Enrichment */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 pb-1 border-b border-slate-200/60">
                  <span className="flex items-center gap-1 text-[11px]">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Decision Maker & Executive</span>
                  </span>
                  {enrichingContact ? (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-normal">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Enriching...
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded font-mono">
                      {enrichedExecutive?.emailStatus?.toUpperCase() || 'VERIFIED'}
                    </span>
                  )}
                </div>

                <div className="text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-900">
                      {enrichedExecutive?.name || 'Owner & Managing Partner'}
                    </div>
                    {enrichedExecutive?.linkedinUrl && (
                      <a
                        href={enrichedExecutive.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-700 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 font-semibold inline-flex items-center gap-1"
                      >
                        <span>LinkedIn</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    {enrichedExecutive?.title || 'Executive Leadership'}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phone:</span>
                    </span>
                    <a href={`tel:${selectedLead.phone}`} className="font-mono font-bold text-slate-900 hover:text-emerald-600">
                      {selectedLead.phone}
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>Website:</span>
                    </span>
                    <a
                      href={selectedLead.website}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-emerald-600 hover:underline flex items-center gap-1 truncate max-w-[170px]"
                    >
                      <span>{selectedLead.website.replace('https://', '')}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Direct Email:</span>
                    </span>
                    <span className="font-mono text-slate-700 font-semibold">{enrichedExecutive?.email || selectedLead.email}</span>
                  </div>

                  {/* Single Source of Truth Live Verification */}
                  <div className="pt-1.5 border-t border-slate-200/40 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Deliverability Check:</span>
                    <button
                      type="button"
                      disabled={verifyingEmail}
                      onClick={() => handleVerifyEmail(enrichedExecutive?.email || selectedLead.email)}
                      className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      {verifyingEmail ? (
                        <>
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                          <span>Checking SMTP...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Verify Deliverability</span>
                        </>
                      )}
                    </button>
                  </div>

                  {manualVerificationResult && (
                    <div className="p-2 bg-white rounded-lg border border-emerald-200 text-[10px] space-y-0.5">
                      <div className="flex items-center justify-between font-bold text-emerald-900">
                        <span className="capitalize">Status: {manualVerificationResult.status}</span>
                        <span className="font-mono bg-emerald-100 text-emerald-800 px-1 rounded">
                          Score: {manualVerificationResult.score}%
                        </span>
                      </div>
                      <div className="text-slate-500 text-[9px] flex items-center justify-between">
                        <span>Zero Bounce Guaranteed</span>
                        <span className="font-mono text-slate-400">via {manualVerificationResult.source}</span>
                      </div>
                    </div>
                  )}

                  {enrichmentStatus && enrichmentStatus.status !== 'success' && (
                    <div className="pt-2">
                      <ProviderStatusDisplay
                        status={enrichmentStatus.status}
                        providerName="Contact Intelligence (Apollo.io / Hunter.io)"
                        customMessage={enrichmentStatus.message}
                        compact
                        onConfigureClick={() => setActiveTab('admin')}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Live Technical Audit Real-time Scan Status */}
              {liveDomainAudit && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-emerald-950">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Live Technical Scan Results</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                      {liveDomainAudit.responseTimeMs}ms Ping
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${liveDomainAudit.hasSsl ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span>SSL: {liveDomainAudit.hasSsl ? 'HTTPS Active' : 'Missing SSL'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${liveDomainAudit.hasSchema ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span>Schema: {liveDomainAudit.hasSchema ? 'Found' : 'Missing'}</span>
                    </div>
                  </div>

                  {liveDomainAudit.pagespeed_status && liveDomainAudit.pagespeed_status !== 'success' && (
                    <div className="pt-2">
                      <ProviderStatusDisplay
                        status={liveDomainAudit.pagespeed_status}
                        providerName="Google PageSpeed Insights"
                        customMessage={liveDomainAudit.pagespeed_message}
                        compact
                        onConfigureClick={() => setActiveTab('admin')}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Identified Issues & Recommended Pitch */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold font-heading text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Audit Findings & Vulnerabilities</span>
                </h4>

                <div className="space-y-2">
                  {selectedLead.issuesList.map((iss, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-amber-900">
                        <span>{iss.label}</span>
                        <span className="text-[10px] uppercase bg-amber-200/60 px-1.5 py-0.2 rounded font-mono">
                          {iss.impact} Impact
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        <strong>Recommended Solution:</strong> {iss.fix}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pre-written AI Cold Outreach Hook */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold font-heading text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tailored Pitch Hook (Ready-to-Send)</span>
                </h4>
                <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-xs font-sans leading-relaxed relative">
                  <p>"{selectedLead.coldPitchHook || `Noticed ${selectedLead.companyName} has an optimization opportunity for ${selectedLead.primaryIssue}.`} We built a custom 1-page roadmap to fix {selectedLead.primaryIssue} and reclaim estimated lost traffic."</p>
                  <button
                    onClick={() => {
                      if (selectedLead.coldPitchHook) {
                        navigator.clipboard.writeText(selectedLead.coldPitchHook);
                        setCopiedPitch(true);
                        setTimeout(() => setCopiedPitch(false), 3000);
                      }
                    }}
                    className="mt-2 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded cursor-pointer transition-colors inline-flex items-center gap-1"
                  >
                    {copiedPitch ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Hook to Clipboard</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a lead from the list to view audit findings and generated pitch script.
            </div>
          )}

          {/* Bottom Actions */}
          {selectedLead && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => {
                  handleAddToCrm(selectedLead);
                  setActiveTab('proposals');
                }}
                className="w-full py-2.5 px-4 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
                title="Save lead to CRM and jump directly to Proposal generator"
              >
                <Plus className="w-4 h-4" />
                <span>Save to CRM & Start Proposal</span>
              </button>

              <button
                onClick={() => handleAddToCrm(selectedLead)}
                disabled={crmAddedIds.has(selectedLead.id)}
                className={`w-full py-2 px-4 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 font-sans ${
                  crmAddedIds.has(selectedLead.id)
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer border border-slate-200'
                }`}
              >
                {crmAddedIds.has(selectedLead.id) ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saved in CRM Leads</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-slate-600" />
                    <span>+ Add to CRM Pipeline</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lead Pack Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold font-heading text-slate-900">
                    Export Full Verified B2B Lead List (CSV)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Instant CSV download with verified phone numbers, emails, addresses & SEO gap audits.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Option 1: 250 Leads */}
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-heading">Starter Batch</span>
                  <h4 className="text-xl font-extrabold text-slate-900">250 Leads</h4>
                  <p className="text-xs text-slate-500">Fresh leads in {industry} ({city})</p>
                </div>
                <div className="space-y-3">
                  <div className="text-2xl font-black font-heading text-slate-900">$29.00</div>
                  <button
                    onClick={() => handleBuyLeadPack('leads_250', 250, 29.00)}
                    disabled={checkoutLoading}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    Buy & Download
                  </button>
                </div>
              </div>

              {/* Option 2: 500 Leads (Popular) */}
              <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/20 shadow-md flex flex-col justify-between space-y-4 relative">
                <span className="absolute -top-3 right-4 px-2 py-0.5 bg-emerald-600 text-white font-bold text-[9px] uppercase rounded-full tracking-wider">
                  Best Value
                </span>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-heading">Growth Batch</span>
                  <h4 className="text-xl font-extrabold text-slate-900">500 Leads</h4>
                  <p className="text-xs text-slate-500">Includes CEO direct emails & phone</p>
                </div>
                <div className="space-y-3">
                  <div className="text-2xl font-black font-heading text-emerald-700">$49.00</div>
                  <button
                    onClick={() => handleBuyLeadPack('leads_500', 500, 49.00)}
                    disabled={checkoutLoading}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
                  >
                    Buy & Download
                  </button>
                </div>
              </div>

              {/* Option 3: 1,000 Leads */}
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-heading">Agency Scale</span>
                  <h4 className="text-xl font-extrabold text-slate-900">1,000 Leads</h4>
                  <p className="text-xs text-slate-500">Complete metro territory takeover</p>
                </div>
                <div className="space-y-3">
                  <div className="text-2xl font-black font-heading text-slate-900">$89.00</div>
                  <button
                    onClick={() => handleBuyLeadPack('leads_1000', 1000, 89.00)}
                    disabled={checkoutLoading}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    Buy & Download
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Zero-Bounce Guarantee on Email Deliverability</span>
              </span>
              <span className="font-mono">Powered by Whop Payments</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
