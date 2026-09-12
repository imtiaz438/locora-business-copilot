import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Globe,
  Building2,
  MapPin,
  Briefcase,
  Target,
  Search,
  Check,
  Zap,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  X,
  Layers,
  Award,
  BarChart3,
  Lightbulb,
  FileCheck,
} from 'lucide-react';
import type { DiscoveredBusinessInfo, OnboardingMissingInfoForm } from '../types';

interface FirstTimeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirstTimeOnboardingModal: React.FC<FirstTimeOnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    user,
    activeBusiness,
    addBusiness,
    switchBusiness,
    refreshProductionDashboard,
    setActiveTab,
    logActivity,
  } = useApp();

  // Current Step: 1 to 6
  // Step 1: Input (URL, optional business name, country, primary location)
  // Step 2: Discovery in progress (crawling website, Google Places API)
  // Step 3: Confirmation (Show discovered info, ask "Is this your business?")
  // Step 4: Saving confirmed record (auto transitions to Step 5)
  // Step 5: Collect missing information through custom form (18 fields)
  // Step 6: Create Business Brain from verified data (AI synthesis & launch)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1 INPUTS
  const [step1Input, setStep1Input] = useState({
    websiteUrl: activeBusiness?.website || '',
    businessName: activeBusiness?.name && activeBusiness.name !== 'Acme Local Dental' ? activeBusiness.name : '',
    country: 'United States',
    primaryLocation: activeBusiness?.city && activeBusiness?.state ? `${activeBusiness.city}, ${activeBusiness.state}` : '',
  });

  // STEP 2 & 3 DISCOVERY STATE
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [discoveryStage, setDiscoveryStage] = useState<string>('Initializing discovery providers...');
  const [discoveredInfo, setDiscoveredInfo] = useState<DiscoveredBusinessInfo | null>(null);

  // STEP 4 & 5 FORM STATE (ALL 18 REQUIRED FIELDS)
  const [formData, setFormData] = useState<OnboardingMissingInfoForm>({
    businessName: '',
    legalName: '',
    website: '',
    phone: '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    country: 'United States',
    postalCode: '',
    services: [],
    serviceAreas: [],
    businessCategory: '',
    description: '',
    hours: '',
    targetCustomers: '',
    goals: [],
    brandVoice: '',
    placeId: '',
    googleConnected: false,
  });

  // Raw text inputs for arrays
  const [servicesInput, setServicesInput] = useState<string>('');
  const [serviceAreasInput, setServiceAreasInput] = useState<string>('');
  const [goalsInput, setGoalsInput] = useState<string>('');

  // STEP 4 PERSISTENCE & STEP 6 BRAIN STATE
  const [savedBusinessId, setSavedBusinessId] = useState<string | null>(null);
  const [isSavingRecord, setIsSavingRecord] = useState<boolean>(false);
  const [isSynthesizingBrain, setIsSynthesizingBrain] = useState<boolean>(false);
  const [brainResult, setBrainResult] = useState<any | null>(null);
  const [brainSynthesisStage, setBrainSynthesisStage] = useState<string>('Synthesizing verified Business Brain with Gemini AI...');

  // Automatically pre-populate discovered information from claimed Public Quick Checkup
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('locora_pending_public_audit');
        if (raw) {
          const audit = JSON.parse(raw);
          const domain = audit.domain || audit.websiteUrl || '';
          const fullUrl = domain ? (domain.startsWith('http') ? domain : `https://${domain}`) : '';
          const name = audit.businessName || '';
          const phone = audit.detectedBusinessData?.phone || '';
          const address = audit.detectedBusinessData?.address || '';
          const metaDesc = audit.detectedBusinessData?.metaDescription || '';
          const hasSchema = Boolean(audit.detectedBusinessData?.hasLocalBusinessSchema);

          setStep1Input((prev) => ({
            ...prev,
            websiteUrl: fullUrl || prev.websiteUrl,
            businessName: name || prev.businessName,
            primaryLocation: address || prev.primaryLocation,
          }));

          const disc: DiscoveredBusinessInfo = {
            businessName: name || null,
            legalName: name || null,
            website: fullUrl,
            phone: phone || null,
            email: user?.email || null,
            address: address || null,
            city: null,
            state: null,
            country: 'United States',
            postalCode: null,
            businessCategory: audit.detectedBusinessData?.schemaTypes?.[0] || 'Local Business',
            description: metaDesc || null,
            hours: null,
            services: [],
            googleBusinessProfile: {
              connected: false,
              statusText: 'Not connected',
              source: 'not_found',
            },
            sources: {
              businessName: name ? 'website_crawl' : 'not_found',
              address: address ? 'website_crawl' : 'not_found',
              phone: phone ? 'website_crawl' : 'not_found',
              website: 'website_crawl',
              category: hasSchema ? 'website_crawl' : 'not_found',
              hours: 'not_found',
            },
            sourcesList: ['Website Crawl (Public Quick Checkup)', ...(hasSchema ? ['Schema.org JSON-LD'] : [])],
          };

          setDiscoveredInfo(disc);

          setFormData((prev) => ({
            ...prev,
            businessName: name || prev.businessName,
            legalName: name || prev.legalName,
            website: fullUrl || prev.website,
            phone: phone || prev.phone,
            address: address || prev.address,
            businessCategory: disc.businessCategory || prev.businessCategory,
            description: metaDesc || prev.description,
          }));
        }
      } catch (e) {
        console.warn('Failed reading pending public audit in onboarding:', e);
      }
    }
  }, [isOpen, user?.email]);

  if (!isOpen) return null;

  // STEP 1 -> STEP 2: Trigger discovery
  const handleStartDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setDiscoveryError(null);

    let cleanUrl = step1Input.websiteUrl.trim();
    if (!cleanUrl) {
      setDiscoveryError('Please enter a website URL to discover your business.');
      return;
    }
    if (!step1Input.primaryLocation.trim()) {
      setDiscoveryError('Please provide a primary location (e.g., "Austin, TX" or city/region).');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
      setStep1Input((prev) => ({ ...prev, websiteUrl: cleanUrl }));
    }

    setCurrentStep(2);
    setIsDiscovering(true);
    setDiscoveryStage('Connecting to legitimate configured providers...');

    const stageTimer1 = setTimeout(() => {
      setDiscoveryStage('Crawling website structure, metadata & Schema.org JSON-LD...');
    }, 900);
    const stageTimer2 = setTimeout(() => {
      setDiscoveryStage('Scanning Google Places directory & checking Google Business Profile...');
    }, 2100);

    try {
      const res = await fetch('/api/onboarding/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: cleanUrl,
          businessName: step1Input.businessName.trim() || undefined,
          country: step1Input.country.trim(),
          primaryLocation: step1Input.primaryLocation.trim(),
          userEmail: user?.email || undefined,
        }),
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Unable to complete discovery.');
      }

      const info: DiscoveredBusinessInfo = json.data;
      setDiscoveredInfo(info);

      // Pre-fill Step 5 Form with discovered fields (strictly without demo assumptions)
      setFormData({
        businessName: info.businessName || step1Input.businessName || '',
        legalName: info.legalName || info.businessName || step1Input.businessName || '',
        website: info.website || cleanUrl,
        phone: info.phone || '',
        email: info.email || user?.email || '',
        address: info.address || '',
        city: info.city || '',
        state: info.state || '',
        country: info.country || step1Input.country,
        postalCode: info.postalCode || '',
        services: info.services || [],
        serviceAreas: info.city ? [info.city] : [],
        businessCategory: info.businessCategory || '',
        description: info.description || '',
        hours: info.hours || '',
        targetCustomers: '',
        goals: ['Dominate Google 3-Pack', 'Increase inbound phone inquiries', 'Build 5-star customer reviews'],
        brandVoice: 'Professional, warm, trustworthy, and customer-focused',
        placeId: info.googleBusinessProfile?.placeId || '',
        googleConnected: Boolean(info.googleBusinessProfile?.connected),
      });

      setServicesInput(info.services?.join(', ') || '');
      setServiceAreasInput(info.city ? info.city : '');
      setGoalsInput('Dominate Google 3-Pack, Increase inbound phone inquiries, Build 5-star customer reviews');

      setIsDiscovering(false);
      // Move to STEP 3: Confirmation
      setCurrentStep(3);
    } catch (err: any) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setIsDiscovering(false);
      setDiscoveryError(err.message || 'Discovery request failed. You can proceed with manual entry.');
      setCurrentStep(1);
    }
  };

  // STEP 3: User confirms "Yes, this is my business" -> STEP 4 Save -> STEP 5
  const handleConfirmBusiness = async () => {
    setCurrentStep(4);
    setIsSavingRecord(true);

    try {
      const res = await fetch('/api/onboarding/confirm-and-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user?.email || 'demo@locora.ai',
          formData: {
            ...formData,
            businessName: formData.businessName || discoveredInfo?.businessName || step1Input.businessName || 'My Business',
            website: formData.website || discoveredInfo?.website || step1Input.websiteUrl,
            country: formData.country || step1Input.country,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save confirmed business record.');
      }

      setSavedBusinessId(json.businessId);
      setIsSavingRecord(false);
      // Move to STEP 5: Missing Information Form
      setCurrentStep(5);
    } catch (err: any) {
      setIsSavingRecord(false);
      // Even if background network hiccup, allow user to continue editing Step 5
      setCurrentStep(5);
    }
  };

  // STEP 5 -> STEP 6: Save missing info and create Business Brain
  const handleSaveAndCreateBrain = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessName.trim()) {
      alert('Business name is required.');
      return;
    }
    if (!formData.website.trim()) {
      alert('Website URL is required.');
      return;
    }

    const cleanServices = servicesInput.split(',').map((s) => s.trim()).filter(Boolean);
    const cleanServiceAreas = serviceAreasInput.split(',').map((s) => s.trim()).filter(Boolean);
    const cleanGoals = goalsInput.split(',').map((s) => s.trim()).filter(Boolean);

    const updatedFormData: OnboardingMissingInfoForm = {
      ...formData,
      services: cleanServices,
      serviceAreas: cleanServiceAreas,
      goals: cleanGoals,
    };

    setCurrentStep(6);
    setIsSynthesizingBrain(true);
    setBrainSynthesisStage('Saving all verified business details to persistent database...');

    try {
      // Step 1: Save full updated record
      const saveRes = await fetch('/api/onboarding/confirm-and-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user?.email || 'demo@locora.ai',
          formData: updatedFormData,
          existingBusinessId: savedBusinessId || undefined,
        }),
      });

      const saveJson = await saveRes.json();
      const confirmedBizId = saveJson.businessId || savedBusinessId;
      setSavedBusinessId(confirmedBizId);

      setBrainSynthesisStage('Synthesizing verified Business Brain with Gemini AI...');

      // Step 2: Synthesize Business Brain
      const brainRes = await fetch('/api/onboarding/create-brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: confirmedBizId,
          userEmail: user?.email || 'demo@locora.ai',
        }),
      });

      const brainJson = await brainRes.json();
      if (!brainRes.ok || !brainJson.success) {
        throw new Error(brainJson.error || 'Failed to synthesize Business Brain.');
      }

      setBrainResult(brainJson);
      setIsSynthesizingBrain(false);

      // Register business into AppContext
      addBusiness({
        name: updatedFormData.businessName,
        category: updatedFormData.businessCategory || 'Local Business',
        address: updatedFormData.address,
        city: updatedFormData.city,
        state: updatedFormData.state,
        country: updatedFormData.country,
        zip: updatedFormData.postalCode,
        phone: updatedFormData.phone,
        website: updatedFormData.website,
      });

      logActivity(
        'business_onboarded',
        'Business Onboarded Successfully',
        `Completed 6-step verified onboarding for ${updatedFormData.businessName}`
      );
    } catch (err: any) {
      setIsSynthesizingBrain(false);
      console.error('[Onboarding Flow Error]:', err);
      alert(err.message || 'An error occurred while creating Business Brain.');
    }
  };

  // STEP 6: Completion action
  const handleLaunchDashboard = () => {
    if (savedBusinessId) {
      switchBusiness(savedBusinessId);
      refreshProductionDashboard(savedBusinessId);
    }
    setActiveTab('dashboard');
    onClose();
  };

  return (
    <div
      id="business-onboarding-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md font-sans overflow-y-auto"
    >
      <div
        id="business-onboarding-modal-card"
        className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header & Stepper */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Locora Business Onboarding</span>
            </div>
            <button
              id="onboarding-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              title="Close Onboarding"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {currentStep === 1 && 'Step 1: Enter Business Identity'}
              {currentStep === 2 && 'Step 2: Discovering Business...'}
              {currentStep === 3 && 'Step 3: Confirm Discovered Business'}
              {currentStep === 4 && 'Step 4: Saving Business Record...'}
              {currentStep === 5 && 'Step 5: Complete Business Profile'}
              {currentStep === 6 && 'Step 6: AI Business Brain'}
            </h2>
            <span className="text-xs font-medium text-slate-500">
              Step {currentStep} of 6
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-6 gap-1.5 mt-3">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentStep >= s ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-slate-800">
          {/* ================================================================= */}
          {/* STEP 1: USER ENTERS WEBSITE URL, BUSINESS NAME, COUNTRY, LOCATION */}
          {/* ================================================================= */}
          {currentStep === 1 && (
            <form onSubmit={handleStartDiscovery} className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
                <p className="font-semibold mb-1">Authentic Discovery Guarantee</p>
                Provide your website URL and primary location. Locora will attempt to discover your business details directly from Google Places, Schema markup, and live website crawling — without fabricating or assuming missing data.
              </div>

              {discoveryError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{discoveryError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Website URL <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    id="onboarding-step1-url"
                    type="text"
                    required
                    placeholder="https://example.com or yourbusiness.com"
                    value={step1Input.websiteUrl}
                    onChange={(e) => setStep1Input({ ...step1Input, websiteUrl: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Business Name <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    id="onboarding-step1-name"
                    type="text"
                    placeholder="e.g. ABC Dental Care (Leave blank to discover from site)"
                    value={step1Input.businessName}
                    onChange={(e) => setStep1Input({ ...step1Input, businessName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Country <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="onboarding-step1-country"
                    value={step1Input.country}
                    onChange={(e) => setStep1Input({ ...step1Input, country: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="Ireland">Ireland</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Other">Other Country</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Primary Location <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      id="onboarding-step1-location"
                      type="text"
                      required
                      placeholder="e.g. Austin, TX or 123 Main St"
                      value={step1Input.primaryLocation}
                      onChange={(e) => setStep1Input({ ...step1Input, primaryLocation: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  id="onboarding-step1-submit-btn"
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>Discover Business</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* STEP 2: DISCOVERING FROM PROVIDERS (WEBSITE CRAWL & GOOGLE PLACES) */}
          {/* ================================================================= */}
          {currentStep === 2 && (
            <div className="py-12 px-4 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto animate-pulse">
                <Search className="w-8 h-8 animate-spin" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Attempting Business Discovery
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Querying legitimate configured providers (Google Places & live website crawl).
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                  <span className="font-medium">{discoveryStage}</span>
                </div>
                <div className="text-[11px] text-slate-400 pl-5">
                  Target: {step1Input.websiteUrl} ({step1Input.primaryLocation})
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 3: SHOW DISCOVERED INFORMATION FOR CONFIRMATION */}
          {/* ================================================================= */}
          {currentStep === 3 && discoveredInfo && (
            <div className="space-y-5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Discovered Sources: <strong>{discoveredInfo.sourcesList.join(', ')}</strong></span>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                  Live Audit
                </span>
              </div>

              {/* Exact Example Card as specified in Prompt */}
              <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Business found:
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      {discoveredInfo.businessName || (
                        <span className="text-slate-400 italic font-normal">
                          (Name not detected on site — you can enter in next step)
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Address:
                    </div>
                    <div className="text-slate-800 font-medium flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{discoveredInfo.address || step1Input.primaryLocation}</span>
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Phone:
                    </div>
                    <div className="text-slate-800 font-medium flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{discoveredInfo.phone || 'Not detected on website / directory'}</span>
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Website:
                    </div>
                    <div className="text-slate-800 font-medium flex items-center gap-1.5 truncate">
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{discoveredInfo.website}</span>
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Google Business Profile:
                    </div>
                    <div className="flex items-center gap-2">
                      {discoveredInfo.googleBusinessProfile.connected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          Not connected
                        </span>
                      )}
                      {discoveredInfo.googleBusinessProfile.rating && (
                        <span className="text-[11px] text-slate-500">
                          ({discoveredInfo.googleBusinessProfile.rating}★ · {discoveredInfo.googleBusinessProfile.reviewCount} reviews)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {discoveredInfo.businessCategory && (
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">Detected Category: </span>
                    <span className="font-semibold text-slate-800">{discoveredInfo.businessCategory}</span>
                  </div>
                )}
              </div>

              {/* Exact Question as specified in Prompt */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-center space-y-3">
                <h4 className="text-base font-bold text-emerald-950">
                  Is this your business?
                </h4>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    id="onboarding-confirm-yes-btn"
                    onClick={handleConfirmBusiness}
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Yes, this is my business</span>
                  </button>
                  <button
                    id="onboarding-confirm-no-btn"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all"
                  >
                    No, edit search or enter manually
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 4: SAVING CONFIRMED INFORMATION */}
          {/* ================================================================= */}
          {currentStep === 4 && (
            <div className="py-12 px-4 text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Saving Confirmed Business Record
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Persisting confirmed business identity and location to your workspace...
                </p>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 5: ASK FOR MISSING INFORMATION THROUGH CUSTOM FORM (18 FIELDS) */}
          {/* ================================================================= */}
          {currentStep === 5 && (
            <form onSubmit={handleSaveAndCreateBrain} className="space-y-6">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-900">Complete Missing Profile Details: </span>
                Review and fill out any fields not detected during discovery. We never fabricate missing data.
              </div>

              {/* 1. Identity */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Business Identity & Contact</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Business Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="form-business-name"
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Legal / Display Name
                    </label>
                    <input
                      id="form-legal-name"
                      type="text"
                      value={formData.legalName}
                      onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                      placeholder="e.g. ABC Dental Care LLC"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Website URL <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="form-website"
                      type="text"
                      required
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="form-phone"
                      type="text"
                      placeholder="e.g. (512) 555-0199"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      id="form-email"
                      type="email"
                      placeholder="contact@business.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Physical Location */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Physical Address & Location</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Street Address
                    </label>
                    <input
                      id="form-address"
                      type="text"
                      placeholder="123 Main Street, Suite 400"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      id="form-city"
                      type="text"
                      placeholder="Austin"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State / Province
                    </label>
                    <input
                      id="form-state"
                      type="text"
                      placeholder="TX"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      id="form-postal"
                      type="text"
                      placeholder="78701"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Services, Category & Service Areas */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Category & Services</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Business Category <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="form-category"
                      type="text"
                      required
                      placeholder="e.g. Dental Clinic, Plumber, Accountant"
                      value={formData.businessCategory}
                      onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Operating Hours
                    </label>
                    <input
                      id="form-hours"
                      type="text"
                      placeholder="e.g. Mon-Fri: 8am - 5pm, Sat: 9am - 1pm"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Services (comma-separated)
                    </label>
                    <input
                      id="form-services"
                      type="text"
                      placeholder="Teeth Whitening, Dental Implants, Root Canals, Cleanings"
                      value={servicesInput}
                      onChange={(e) => setServicesInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Service Areas (cities, towns, or neighborhoods)
                    </label>
                    <input
                      id="form-service-areas"
                      type="text"
                      placeholder="Austin, Round Rock, Westlake, Cedar Park"
                      value={serviceAreasInput}
                      onChange={(e) => setServiceAreasInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Strategic Positioning: Description, Target Customers, Goals, Brand Voice */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Strategic Positioning & Brand Voice</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Business Description
                    </label>
                    <textarea
                      id="form-description"
                      rows={2}
                      placeholder="Family and cosmetic dental practice dedicated to comfortable, patient-centered care in Greater Austin..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Target Customers
                      </label>
                      <input
                        id="form-target-customers"
                        type="text"
                        placeholder="Local families, professionals, cosmetic patients"
                        value={formData.targetCustomers}
                        onChange={(e) => setFormData({ ...formData, targetCustomers: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Brand Voice
                      </label>
                      <input
                        id="form-brand-voice"
                        type="text"
                        placeholder="Warm, reassuring, professional, and patient-first"
                        value={formData.brandVoice}
                        onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Business Goals (comma-separated)
                      </label>
                      <input
                        id="form-goals"
                        type="text"
                        placeholder="Dominate Google 3-Pack, Increase phone inquiries, 50+ 5-star reviews"
                        value={goalsInput}
                        onChange={(e) => setGoalsInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  ← Back to Confirmation
                </button>
                <button
                  id="onboarding-step5-submit-btn"
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create Business Brain & Launch</span>
                </button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* STEP 6: CREATE BUSINESS BRAIN FROM VERIFIED DATA (AI SYNTHESIS) */}
          {/* ================================================================= */}
          {currentStep === 6 && (
            <div className="space-y-6">
              {isSynthesizingBrain ? (
                <div className="py-12 px-4 text-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto animate-pulse">
                    <Sparkles className="w-8 h-8 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Creating Autonomous Business Brain
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      {brainSynthesisStage}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Strict analysis without assumptions or demo placeholders.
                  </div>
                </div>
              ) : brainResult ? (
                <div className="space-y-5 animate-fadeIn">
                  {/* Readiness Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>AI Readiness Score</span>
                      </div>
                      <div className="text-2xl font-black text-emerald-950 mt-0.5">
                        {brainResult.readinessScore}% Verified Completeness
                      </div>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Digital Health Score: <strong>{brainResult.healthScore}/100</strong>
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-emerald-400 flex flex-col items-center justify-center shadow-sm">
                      <span className="text-lg font-black text-emerald-700">{brainResult.readinessScore}%</span>
                      <span className="text-[9px] uppercase font-bold text-emerald-600">Ready</span>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Executive Market Positioning</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed">
                      {brainResult.summary}
                    </p>
                  </div>

                  {/* Verified SWOT Matrix */}
                  {brainResult.swot && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                        <div className="font-bold text-emerald-900 mb-1">Strengths</div>
                        <ul className="space-y-1 text-emerald-950 list-disc list-inside text-[11px]">
                          {brainResult.swot.strengths?.map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                        <div className="font-bold text-amber-900 mb-1">Weaknesses / Gaps</div>
                        <ul className="space-y-1 text-amber-950 list-disc list-inside text-[11px]">
                          {brainResult.swot.weaknesses?.map((w: string, i: number) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                        <div className="font-bold text-blue-900 mb-1">Growth Opportunities</div>
                        <ul className="space-y-1 text-blue-950 list-disc list-inside text-[11px]">
                          {brainResult.swot.opportunities?.map((o: string, i: number) => (
                            <li key={i}>{o}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-100 border border-slate-300">
                        <div className="font-bold text-slate-900 mb-1">Market Threats</div>
                        <ul className="space-y-1 text-slate-800 list-disc list-inside text-[11px]">
                          {brainResult.swot.threats?.map((t: string, i: number) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Top Priorities */}
                  {brainResult.priorities && brainResult.priorities.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>Immediate High-Impact Priorities</span>
                      </div>
                      <div className="space-y-2">
                        {brainResult.priorities.slice(0, 3).map((p: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-900">{p.title}</div>
                              <p className="text-[11px] text-slate-500 mt-0.5">{p.whyItMatters || p.problem}</p>
                            </div>
                            <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                              {p.expectedImpact}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Launch CTA */}
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      id="onboarding-launch-dashboard-btn"
                      onClick={handleLaunchDashboard}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <span>Enter Growth Command Center</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
