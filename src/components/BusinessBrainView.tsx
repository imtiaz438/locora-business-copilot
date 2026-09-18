import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Brain,
  Sparkles,
  Building2,
  Briefcase,
  MapPin,
  Users,
  Megaphone,
  Target,
  Edit3,
  CheckCircle2,
  Plus,
  X,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Globe,
  Phone,
  Save,
  AlertTriangle,
  Info,
  ExternalLink,
  Activity,
  Search,
  Database,
  Layers,
} from 'lucide-react';

export const BusinessBrainView: React.FC = () => {
  const {
    activeBusiness,
    businessProfile,
    updateBusinessProfile,
    setActiveTab,
    logActivity,
    setIsGbpSyncModalOpen,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form State initialized from businessProfile / activeBusiness
  const [businessName, setBusinessName] = useState(businessProfile.name || activeBusiness?.name || '');
  const [tagline, setTagline] = useState(businessProfile.tagline || activeBusiness?.tagline || '');
  const [phone, setPhone] = useState(businessProfile.phone || activeBusiness?.phone || '');
  const [website, setWebsite] = useState(businessProfile.website || activeBusiness?.website || '');

  // Core Section 18 arrays - dynamically derived from user's authentic profile & active business
  const [services, setServices] = useState<string[]>(
    businessProfile.services?.length
      ? businessProfile.services
      : activeBusiness?.services?.length
        ? activeBusiness.services
        : []
  );
  const [newServiceInput, setNewServiceInput] = useState('');

  const [locations, setLocations] = useState<string[]>(
    businessProfile.targetLocations?.length
      ? businessProfile.targetLocations
      : activeBusiness?.city
        ? [activeBusiness.city]
        : []
  );
  const [newLocationInput, setNewLocationInput] = useState('');

  const [audiences, setAudiences] = useState<string[]>(
    Array.isArray(businessProfile.targetAudience) && businessProfile.targetAudience.length > 0
      ? businessProfile.targetAudience
      : typeof businessProfile.targetAudience === 'string' && businessProfile.targetAudience.trim()
        ? [businessProfile.targetAudience.trim()]
        : []
  );
  const [newAudienceInput, setNewAudienceInput] = useState('');

  const [brandVoice, setBrandVoice] = useState(
    businessProfile.toneOfVoice || ''
  );

  const [goals, setGoals] = useState<string[]>(
    businessProfile.businessGoals?.length
      ? businessProfile.businessGoals
      : []
  );
  const [newGoalInput, setNewGoalInput] = useState('');

  const [competitors, setCompetitors] = useState<string[]>(
    businessProfile.primaryCompetitors?.length
      ? businessProfile.primaryCompetitors
      : (activeBusiness?.competitors && activeBusiness.competitors.length > 0)
        ? activeBusiness.competitors
        : []
  );
  const [newCompetitorInput, setNewCompetitorInput] = useState('');

  // Sync state whenever the active business changes
  useEffect(() => {
    if (activeBusiness) {
      setBusinessName(businessProfile.name || activeBusiness.name || '');
      setTagline(businessProfile.tagline || activeBusiness.tagline || '');
      setPhone(businessProfile.phone || activeBusiness.phone || '');
      setWebsite(businessProfile.website || activeBusiness.website || '');
      setServices(
        businessProfile.services?.length
          ? businessProfile.services
          : activeBusiness.services?.length
            ? activeBusiness.services
            : []
      );
      setLocations(
        businessProfile.targetLocations?.length
          ? businessProfile.targetLocations
          : activeBusiness.city
            ? [activeBusiness.city]
            : []
      );
      setCompetitors(
        businessProfile.primaryCompetitors?.length
          ? businessProfile.primaryCompetitors
          : (activeBusiness.competitors && activeBusiness.competitors.length > 0)
            ? activeBusiness.competitors
            : []
      );
      setBrandVoice(businessProfile.toneOfVoice || '');
      setGoals(businessProfile.businessGoals || []);
    }
  }, [activeBusiness?.id, businessProfile?.id]);

  // Missing Information Detection (USER INTENT DIRECTIVE: Show what information is missing instead of inventing it)
  const missingItems = useMemo(() => {
    const missing: { key: string; label: string; action: string; tab?: string; onClick?: () => void }[] = [];

    if (!businessName.trim()) {
      missing.push({
        key: 'name',
        label: 'Business Name is missing from profile.',
        action: 'Enter Business Name',
        onClick: () => setIsEditing(true),
      });
    }
    if (!phone.trim() && !website.trim()) {
      missing.push({
        key: 'contact',
        label: 'Website URL and Phone number have not been provided.',
        action: 'Add Website / Phone',
        onClick: () => setIsEditing(true),
      });
    }
    if (services.length === 0) {
      missing.push({
        key: 'services',
        label: 'No core services or specialties defined.',
        action: 'Add Services',
        onClick: () => setIsEditing(true),
      });
    }
    if (locations.length === 0) {
      missing.push({
        key: 'locations',
        label: 'Target geographic locations and service areas have not been specified.',
        action: 'Add Locations',
        onClick: () => setIsEditing(true),
      });
    }
    if (!activeBusiness?.gbpConnected) {
      missing.push({
        key: 'gbp',
        label: 'Google Business Profile is not connected (Real Google review & 3-pack data pending).',
        action: 'Connect Google',
        onClick: () => setIsGbpSyncModalOpen(true),
      });
    }
    if (!(activeBusiness as any)?.websiteAudit && !website.trim()) {
      missing.push({
        key: 'crawl',
        label: 'Website technical discovery crawl has not been run.',
        action: 'Run SEO Audit',
        tab: 'audit',
      });
    }
    if (!brandVoice.trim()) {
      missing.push({
        key: 'brandVoice',
        label: 'Brand communication voice and tone settings are empty.',
        action: 'Set Brand Voice',
        onClick: () => setIsEditing(true),
      });
    }
    if (goals.length === 0) {
      missing.push({
        key: 'goals',
        label: 'Strategic growth goals are not yet set.',
        action: 'Define Goals',
        onClick: () => setIsEditing(true),
      });
    }

    return missing;
  }, [businessName, phone, website, services, locations, activeBusiness, brandVoice, goals, setIsGbpSyncModalOpen]);

  // Dynamically calculate real memory readiness score based on authentic profile attributes
  const brainReadinessScore = useMemo(() => {
    let score = 0;
    if (businessName.trim()) score += 15;
    if (phone.trim() || website.trim()) score += 15;
    if (services.length > 0) score += 20;
    if (locations.length > 0) score += 15;
    if (activeBusiness?.gbpConnected) score += 15;
    if (brandVoice.trim() || goals.length > 0) score += 10;
    if (audiences.length > 0 || competitors.length > 0) score += 10;
    return Math.min(100, score);
  }, [businessName, phone, website, services, locations, activeBusiness?.gbpConnected, brandVoice, goals, audiences, competitors]);

  const handleSaveBrain = () => {
    updateBusinessProfile({
      name: businessName,
      tagline,
      phone,
      website,
      services,
      targetLocations: locations,
      toneOfVoice: brandVoice,
      businessGoals: goals,
      primaryCompetitors: competitors,
      brainReadinessScore,
      lastBrainSyncAt: new Date().toISOString(),
    });

    logActivity('profile', 'Business Brain Updated', 'Updated global brand memory and context parameters');
    setIsEditing(false);
  };

  const handleSyncGBP = () => {
    setIsGbpSyncModalOpen(true);
  };

  const handleAddChip = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    input: string,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const trimmed = input.trim();
    if (!trimmed || list.includes(trimmed)) return;
    setList([...list, trimmed]);
    setInput('');
  };

  const handleRemoveChip = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    setList(list.filter((x) => x !== item));
  };

  if (!activeBusiness?.id || activeBusiness.id === 'workspace_pending') {
    return (
      <div className="p-6 sm:p-10 max-w-4xl mx-auto font-sans text-slate-900 space-y-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
            <Brain className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-900">No Business Selected</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Business Brain operates strictly on your authenticated business data. Please select or onboard a business to initialize its AI memory.
          </p>
          <button
            onClick={() => setActiveTab('settings')}
            className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            Go to Business Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto font-sans text-slate-900 space-y-8 pb-20">
      {/* 1. TOP HERO HEADER */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#059669] font-heading">
                AI Memory & Core Entity Architecture
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
              <Brain className="w-7 h-7 text-[#059669]" />
              Business Brain
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Grounded entirely in <strong>{businessName || activeBusiness.name || 'your business'}</strong>. Synthesizes verified user inputs, real website telemetry, and connected Google data with zero invented facts.
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncGBP}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#059669]' : ''}`} />
              <span>{isSyncing ? 'Syncing GBP...' : 'Sync GBP Live'}</span>
            </button>

            {isEditing ? (
              <button
                onClick={handleSaveBrain}
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Business Brain</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Edit Business Brain</span>
              </button>
            )}
          </div>
        </div>

        {/* Readiness Meter & Knowledge Callout */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs ${
          brainReadinessScore >= 80
            ? 'bg-emerald-50/70 border-emerald-200/90'
            : brainReadinessScore >= 40
            ? 'bg-amber-50/70 border-amber-200/90'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl text-white flex items-center justify-center font-black text-sm shadow-sm ${
              brainReadinessScore >= 80
                ? 'bg-[#059669]'
                : brainReadinessScore >= 40
                ? 'bg-amber-600'
                : 'bg-slate-500'
            }`}>
              {brainReadinessScore}%
            </div>
            <div>
              <span className="font-extrabold text-slate-900 block text-sm">
                {brainReadinessScore >= 80
                  ? 'Memory Readiness: Primed & Synchronized'
                  : brainReadinessScore >= 40
                  ? 'Memory Readiness: Partially Configured'
                  : 'Business Brain is still learning about your business'}
              </span>
              <span className="text-slate-600">
                {brainReadinessScore >= 80
                  ? 'AI Content Studio, Visibility probers, and Review Inbox draw directly from this verified business context.'
                  : 'Grounded in your business truth. Information is added as it is connected, never fabricated.'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('content')}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <span>Create with Memory in Content Studio</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* 5 DATA SOURCES BREAKDOWN PILLARS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-[11px]">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>User Provided</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Name, services, locations, tone</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              {website ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-amber-500" />
              )}
              <span>Website Discovery</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Latency, SSL, Schema markup</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              {activeBusiness.gbpConnected ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-amber-500" />
              )}
              <span>Real Google Data</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Ratings, reviews, 3-pack rank</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Activity className="w-3 h-3 text-emerald-600" />
              <span>Connected Sources</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">GBP API, Analytics streams</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Database className="w-3 h-3 text-emerald-600" />
              <span>Calculated Data</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Health score, SWOT matrix</p>
          </div>
        </div>
      </section>

      {/* 2. INSUFFICIENT INFORMATION LEARNING BANNER (USER INTENT DIRECTIVE) */}
      {missingItems.length > 0 && (
        <section className="bg-amber-50/80 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-extrabold font-heading text-slate-900 text-base">
                Business Brain is still learning about your business.
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Locora never invents artificial facts or uses generic templates. To provide 100% accurate AI generations, local ranking analysis, and review responses, here is the information currently missing for <strong>{businessName || activeBusiness.name || 'your business'}</strong>:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {missingItems.map((item) => (
              <div
                key={item.key}
                className="p-3 rounded-2xl bg-white border border-amber-200/80 flex items-center justify-between gap-3 text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-slate-700 font-medium">{item.label}</span>
                </div>
                <button
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    else if (item.tab) setActiveTab(item.tab as any);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] shrink-0 transition-colors cursor-pointer"
                >
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. CORE BRAIN ATTRIBUTES (Section 18 Specifications) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Overview */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#059669]" />
              <h2 className="text-sm font-bold font-heading text-slate-900">
                Business Identity
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Core Identity
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#059669] bg-slate-50"
                  placeholder="e.g. Apex Mechanical"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tagline / Mission</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#059669] bg-slate-50"
                  placeholder="e.g. Trusted HVAC & Refrigeration Specialists"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#059669] bg-slate-50"
                    placeholder="(555) 000-0000"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Website</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#059669] bg-slate-50"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block">Entity Name:</span>
                <span className="font-extrabold text-slate-900 text-sm">{businessName || 'Name not provided yet'}</span>
                {tagline && <p className="text-slate-600 mt-1 italic">"{tagline}"</p>}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-slate-600 px-1 pt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {phone || <span className="text-slate-400 italic">No phone configured</span>}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {website || <span className="text-slate-400 italic">No website configured</span>}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Brand Voice */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#059669]" />
              <h2 className="text-sm font-bold font-heading text-slate-900">
                Brand Voice
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Tone & Style
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">Brand Voice & Communication Style</label>
              <textarea
                rows={4}
                value={brandVoice}
                placeholder="e.g., Warm, Professional, Direct, and Trustworthy..."
                onChange={(e) => setBrandVoice(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#059669] bg-slate-50 text-slate-900 leading-relaxed"
              />
              <span className="text-[11px] text-slate-400 block">
                Define the tone for AI-generated posts, review responses, and web pages.
              </span>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {brandVoice ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-heading">
                    Active Tone Setting
                  </span>
                  <p className="font-extrabold text-slate-900 text-sm">
                    {brandVoice}
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    Used by Locora to write updates, review responses, and service pages tailored to your brand identity.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center py-6 text-slate-400">
                  <p className="text-xs">No brand voice configured yet.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Click "Edit Business Brain" to configure your tone.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Services */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#059669]" />
              <h2 className="text-sm font-bold font-heading text-slate-900">
                Services
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              {services.length} Listed
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-500 text-[11px]">
              Core offerings and specialties referenced when drafting landing pages and schema:
            </p>

            {services.length === 0 && !isEditing ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center py-6 text-slate-400">
                <p className="text-xs">No services listed yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Click "Edit Business Brain" to add your core services.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {services.map((svc) => (
                  <span
                    key={svc}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-bold flex items-center gap-1.5 border border-slate-200 shadow-2xs"
                  >
                    <span>{svc}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveChip(services, setServices, svc)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            {isEditing && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add service (e.g., Emergency Repair, System Replacement)..."
                  value={newServiceInput}
                  onChange={(e) => setNewServiceInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChip(services, setServices, newServiceInput, setNewServiceInput)}
                  className="flex-1 p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-[#059669]"
                />
                <button
                  onClick={() => handleAddChip(services, setServices, newServiceInput, setNewServiceInput)}
                  className="px-3 py-2 bg-[#059669] text-white rounded-xl font-bold cursor-pointer hover:bg-[#047857]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Locations */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#059669]" />
              <h2 className="text-sm font-bold font-heading text-slate-900">
                Operating Locations
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              {locations.length} Geotargets
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-500 text-[11px]">
              Geographic footprint and suburb catchment zones monitored for local search relevance:
            </p>

            {locations.length === 0 && !isEditing ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center py-6 text-slate-400">
                <p className="text-xs">No locations configured yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Click "Edit Business Brain" to specify target cities or suburbs.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {locations.map((loc) => (
                  <span
                    key={loc}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-bold flex items-center gap-1.5 border border-slate-200 shadow-2xs"
                  >
                    <MapPin className="w-3 h-3 text-[#059669]" />
                    <span>{loc}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveChip(locations, setLocations, loc)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            {isEditing && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add location (e.g., Downtown Metro)..."
                  value={newLocationInput}
                  onChange={(e) => setNewLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChip(locations, setLocations, newLocationInput, setNewLocationInput)}
                  className="flex-1 p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-[#059669]"
                />
                <button
                  onClick={() => handleAddChip(locations, setLocations, newLocationInput, setNewLocationInput)}
                  className="px-3 py-2 bg-[#059669] text-white rounded-xl font-bold cursor-pointer hover:bg-[#047857]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Audience */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#059669]" />
              <h2 className="text-sm font-bold font-heading text-slate-900">
                Audience
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Target Segments
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-500 text-[11px]">
              Target customer personas that guide messaging tone and value proposition highlights:
            </p>

            {audiences.length === 0 && !isEditing ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center py-6 text-slate-400">
                <p className="text-xs">No audience segments configured yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Click "Edit Business Brain" to specify target personas.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {audiences.map((aud) => (
                  <span
                    key={aud}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-bold flex items-center gap-1.5 border border-slate-200 shadow-2xs"
                  >
                    <span>{aud}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveChip(audiences, setAudiences, aud)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            {isEditing && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add audience (e.g., Local Homeowners, Commercial Property Managers)..."
                  value={newAudienceInput}
                  onChange={(e) => setNewAudienceInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChip(audiences, setAudiences, newAudienceInput, setNewAudienceInput)}
                  className="flex-1 p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-[#059669]"
                />
                <button
                  onClick={() => handleAddChip(audiences, setAudiences, newAudienceInput, setNewAudienceInput)}
                  className="px-3 py-2 bg-[#059669] text-white rounded-xl font-bold cursor-pointer hover:bg-[#047857]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Goals */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#059669]" />
              <h2 className="text-sm font-bold font-heading text-slate-900">
                Goals
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Targets
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-500 text-[11px]">
              Strategic objectives that guide AI prioritization and growth recommendations:
            </p>

            {goals.length === 0 && !isEditing ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center py-6 text-slate-400">
                <p className="text-xs">No growth goals defined yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Click "Edit Business Brain" to define strategic goals.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {goals.map((g) => (
                  <div
                    key={g}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 font-bold text-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                      <span>{g}</span>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveChip(goals, setGoals, g)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isEditing && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add goal (e.g., 20 new qualified local leads per month)..."
                  value={newGoalInput}
                  onChange={(e) => setNewGoalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChip(goals, setGoals, newGoalInput, setNewGoalInput)}
                  className="flex-1 p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-[#059669]"
                />
                <button
                  onClick={() => handleAddChip(goals, setGoals, newGoalInput, setNewGoalInput)}
                  className="px-3 py-2 bg-[#059669] text-white rounded-xl font-bold cursor-pointer hover:bg-[#047857]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER CALLOUT */}
      <section className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-heading block">
            Verified Business Memory
          </span>
          <p className="font-bold text-sm text-slate-100">
            Whenever you launch Content Studio, SEO tools, or AI Review Inbox, this Business Brain is auto-injected.
          </p>
          <p className="text-slate-300">
            All AI actions are grounded in your business data and connected sources, preventing hallucinated information.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('content')}
          className="px-6 py-3 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md transition-colors cursor-pointer shrink-0"
        >
          Open Content Studio →
        </button>
      </section>
    </div>
  );
};
