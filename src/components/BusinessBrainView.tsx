import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Brain,
  Sparkles,
  Building2,
  Stethoscope,
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
  Sliders,
} from 'lucide-react';

export const BusinessBrainView: React.FC = () => {
  const {
    activeBusiness,
    businessProfile,
    updateBusinessProfile,
    setActiveTab,
    logActivity,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form State initialized from businessProfile / activeBusiness
  const [businessName, setBusinessName] = useState(businessProfile.name || activeBusiness.name);
  const [tagline, setTagline] = useState(businessProfile.tagline || activeBusiness.tagline);
  const [phone, setPhone] = useState(businessProfile.phone || activeBusiness.phone);
  const [website, setWebsite] = useState(businessProfile.website || activeBusiness.website);

  // Core Section 18 arrays
  const [services, setServices] = useState<string[]>(
    businessProfile.services?.length
      ? businessProfile.services
      : ['General Dentistry', 'Cosmetic Dentistry', 'Emergency Dentistry', 'Same-Day Crowns', 'Invisalign Orthodontics']
  );
  const [newServiceInput, setNewServiceInput] = useState('');

  const [locations, setLocations] = useState<string[]>(
    businessProfile.targetLocations?.length
      ? businessProfile.targetLocations
      : ['Downtown Austin', 'South Congress', 'Round Rock', 'Westlake Hills']
  );
  const [newLocationInput, setNewLocationInput] = useState('');

  const [audiences, setAudiences] = useState<string[]>(
    ['Families', 'Young Professionals', 'Emergency (Acute Tooth Pain)', 'Corporate Commuters']
  );
  const [newAudienceInput, setNewAudienceInput] = useState('');

  const [brandVoice, setBrandVoice] = useState(
    businessProfile.toneOfVoice || 'Warm, Professional, Clinical but Friendly'
  );

  const [goals, setGoals] = useState<string[]>(
    businessProfile.businessGoals?.length
      ? businessProfile.businessGoals
      : ['30 new patients/mo', '#1 for emergency dentist', '100% review response rate', 'Dominate local Maps 3-Pack']
  );
  const [newGoalInput, setNewGoalInput] = useState('');

  const [competitors, setCompetitors] = useState<string[]>(
    businessProfile.primaryCompetitors?.length
      ? businessProfile.primaryCompetitors
      : activeBusiness.competitors || ['Apex Dental Specialists', 'Austin Emergency Smiles', 'Capital City Dental Studio']
  );
  const [newCompetitorInput, setNewCompetitorInput] = useState('');

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
      brainReadinessScore: 98,
      lastBrainSyncAt: new Date().toISOString(),
    });

    logActivity('profile', 'Business Brain Updated', 'Updated global brand memory and context parameters');
    setIsEditing(false);
    alert('Business Brain updated successfully! All AI tools will immediately reflect these parameters.');
  };

  const handleSyncGBP = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      logActivity('profile', 'Business Brain Synced', 'Refreshed entity schema with Google Business Profile live feed');
      alert('Business Brain successfully synced with live Google Business Profile!');
    }, 900);
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
              Shows what Locora currently knows. This solves the biggest problem with AI tools: <strong>it never treats your prompts like day one</strong>.
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
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#059669] text-white flex items-center justify-center font-black text-sm shadow-sm">
              98%
            </div>
            <div>
              <span className="font-extrabold text-emerald-950 block text-sm">
                Memory Readiness: Primed & Synchronized
              </span>
              <span className="text-slate-600">
                AI Content Studio, Visibility probers, and Review Inbox draw directly from this context.
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('content')}
            className="px-4 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-900 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <span>Create with Memory in Content Studio</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </section>

      {/* 2. CORE BRAIN ATTRIBUTES (Section 18 Specifications) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Overview */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#059669]" />
              <h2 className="text-sm font-bold font-heading text-slate-900">
                Business
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Core Identity
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Practice Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#059669] bg-slate-50"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tagline / Mission</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#059669] bg-slate-50"
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
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Website</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#059669] bg-slate-50"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] text-slate-400 font-medium block">Entity Name:</span>
                <span className="font-extrabold text-slate-900 text-sm">{businessName}</span>
                <p className="text-slate-600 mt-1 italic">"{tagline}"</p>
              </div>

              <div className="flex items-center gap-4 text-slate-600 px-1 pt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {phone}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {website}
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
              <label className="font-bold text-slate-700 block">Brand Voice & Clinical Style</label>
              <textarea
                rows={4}
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#059669] bg-slate-50 text-slate-900 leading-relaxed"
              />
              <span className="text-[11px] text-slate-400 block">
                Standard: Warm, Professional, Clinical but Friendly.
              </span>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-heading">
                  Active Tone Setting
                </span>
                <p className="font-extrabold text-slate-900 text-sm">
                  {brandVoice}
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Used by Locora to write blog posts, review responses, and service pages without sounding robotic or overly clinical.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#059669] border border-emerald-200 font-bold text-[11px]">
                  ✓ Warm & Empathetic
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#059669] border border-emerald-200 font-bold text-[11px]">
                  ✓ Board-Certified Authority
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#059669] border border-emerald-200 font-bold text-[11px]">
                  ✓ Plain English (No Jargon)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Services */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#059669]" />
              <h2 className="text-sm font-bold font-heading text-slate-900">
                Services
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              {services.length} Monitored
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-500 text-[11px]">
              Core clinical specialties known to AI generator when drafting service landing pages and meta descriptions:
            </p>

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

            {isEditing && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add service (e.g., Sedation Dentistry)..."
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
                Locations
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

            {isEditing && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add location (e.g., Domain Northside)..."
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
              Patient Segments
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-500 text-[11px]">
              Key target personas that guide reading level, call-to-actions, and value proposition highlights:
            </p>

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

            {isEditing && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add audience (e.g., Anxious Patients)..."
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
              Business objectives that guide AI manager prioritization:
            </p>

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

            {isEditing && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add goal (e.g., 50 new implants/yr)..."
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
            Automatic Zero-Friction Workflow
          </span>
          <p className="font-bold text-sm text-slate-100">
            Whenever you launch Content Studio or AI Manager, this Business Brain is auto-injected.
          </p>
          <p className="text-slate-300">
            You don't need to fill 12 tedious form fields every time you need a new page, Google post, or reply.
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
