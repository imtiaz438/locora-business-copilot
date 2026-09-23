import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  MapPin,
  Globe,
  CheckCircle2,
  ExternalLink,
  Sliders,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  X,
  Lock,
  ChevronRight,
  MapPinned,
  AlertTriangle,
} from 'lucide-react';
import { GoogleAddressAutocomplete, LocationData } from './GoogleAddressAutocomplete';
import { CountryAutocomplete } from './CountryAutocomplete';

interface BusinessesManagementSectionProps {
  onNavigateToBusinessTab?: (subTab: 'profile' | 'locations' | 'directory') => void;
}

const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  starter: 1,
  pro: 3,
  growth: 3,
  agency: 10,
  agency_elite: 10,
  elite: 10,
};

export const BusinessesManagementSection: React.FC<BusinessesManagementSectionProps> = ({
  onNavigateToBusinessTab,
}) => {
  const {
    businesses,
    activeBusiness,
    activeBusinessId,
    switchBusiness,
    deleteBusiness,
    user,
    setActiveTab,
    setCheckoutModalPlan,
    refreshBusinessTruth,
    setOnboardingModalOpen,
  } = useApp();

  // Dynamic Quota & Limit State
  const planTier = (user.planTier || 'free').toLowerCase();
  const defaultMax = PLAN_LIMITS[planTier] || 1;
  const [remoteLimit, setRemoteLimit] = useState<{ limit: number; currentCount: number; canAddMore: boolean } | null>(null);

  useEffect(() => {
    if (user.email) {
      fetch(`/api/workspace/business-limit?email=${encodeURIComponent(user.email)}&plan=${encodeURIComponent(user.planTier || '')}`, {
        headers: {
          'x-user-email': user.email,
          'x-user-plan': user.planTier || '',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.limit === 'number') {
            setRemoteLimit(data);
          }
        })
        .catch(() => {});
    }
  }, [user.email, user.planTier, businesses.length]);

  const maxAllowed = remoteLimit?.limit ?? defaultMax;
  const currentCount = businesses.length;
  const hasActiveWorkspace = businesses.length > 0 && Boolean(activeBusinessId);
  // Limit is ONLY reached if user has at least 1 business AND count >= limit
  const isLimitReached = currentCount > 0 && (remoteLimit ? !remoteLimit.canAddMore : currentCount >= maxAllowed);

  // Manage modal state
  const [selectedBizForManage, setSelectedBizForManage] = useState<any | null>(null);
  const [businessToDelete, setBusinessToDelete] = useState<any | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Upgrade Modal
  const [showUpgradeLimitModal, setShowUpgradeLimitModal] = useState(false);

  // Add Business Modal (2-Step Unified Flow)
  const [showAddModal, setShowAddModal] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

  // Form states for Step 1
  const [nameInput, setNameInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [countryInput, setCountryInput] = useState('United States');
  const [categoryInput, setCategoryInput] = useState('Local Business');
  const [websiteInput, setWebsiteInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Step 2 Discovered Data confirmation
  const [discoveredData, setDiscoveredData] = useState<any | null>(null);
  const [confirmedName, setConfirmedName] = useState('');
  const [confirmedLegalName, setConfirmedLegalName] = useState('');
  const [confirmedAddress, setConfirmedAddress] = useState('');
  const [confirmedCity, setConfirmedCity] = useState('');
  const [confirmedState, setConfirmedState] = useState('');
  const [confirmedCountry, setConfirmedCountry] = useState('');
  const [confirmedZip, setConfirmedZip] = useState('');
  const [confirmedPhone, setConfirmedPhone] = useState('');
  const [confirmedWebsite, setConfirmedWebsite] = useState('');
  const [confirmedCategory, setConfirmedCategory] = useState('');
  const [confirmedServices, setConfirmedServices] = useState<string[]>([]);
  const [newServiceTag, setNewServiceTag] = useState('');

  const handleOpenAddBusiness = () => {
    // GATING: Active workspace / onboarding must be completed before adding additional businesses
    if (!hasActiveWorkspace) {
      setOnboardingModalOpen(true);
      return;
    }

    // If the user has reached quota
    if (currentCount > 0 && isLimitReached) {
      setShowUpgradeLimitModal(true);
      return;
    }
    // Reset & open Step 1
    setNameInput('');
    setLocationInput('');
    setCountryInput('United States');
    setCategoryInput('Local Business');
    setWebsiteInput('');
    setPhoneInput('');
    setDiscoveryError(null);
    setStep(1);
    setShowAddModal(true);
  };

  const handleLocationSelect = (loc: LocationData) => {
    if (loc.city && loc.state) {
      setLocationInput(`${loc.city}, ${loc.state}`);
    } else if (loc.address) {
      setLocationInput(loc.address);
    }
    if (loc.country) {
      setCountryInput(loc.country);
    }
  };

  const handleRunDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setIsDiscovering(true);
    setDiscoveryError(null);

    try {
      const res = await fetch('/api/onboarding/discover-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: nameInput.trim(),
          primaryLocation: locationInput.trim(),
          country: countryInput.trim() || 'United States',
          businessCategory: categoryInput.trim() || 'Local Business',
          website: websiteInput.trim() || undefined,
          phone: phoneInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to discover business records.');
      }

      setDiscoveredData(data);
      setConfirmedName(data.businessName || nameInput.trim());
      setConfirmedLegalName(data.legalName || data.businessName || nameInput.trim());
      setConfirmedAddress(data.address || '');
      setConfirmedCity(data.city || (locationInput.split(',')[0] || '').trim());
      setConfirmedState(data.state || (locationInput.split(',')[1] || '').trim());
      setConfirmedCountry(data.country || countryInput.trim() || 'United States');
      setConfirmedZip(data.postalCode || '');
      setConfirmedPhone(data.phone || phoneInput.trim() || '');
      setConfirmedWebsite(data.website || websiteInput.trim() || '');
      setConfirmedCategory(data.businessCategory || categoryInput.trim() || 'Local Business');
      setConfirmedServices(data.services && data.services.length > 0 ? data.services : ['Customer Consultations', 'General Services']);
      setStep(2);
    } catch (err: any) {
      console.warn('[Discovery fallback]:', err);
      // Fallback cleanly to step 2 with user inputs
      const locParts = locationInput.split(',').map((s) => s.trim());
      setDiscoveredData({ fallback: true });
      setConfirmedName(nameInput.trim());
      setConfirmedLegalName(nameInput.trim());
      setConfirmedAddress('');
      setConfirmedCity(locParts[0] || '');
      setConfirmedState(locParts[1] || '');
      setConfirmedCountry(countryInput.trim() || 'United States');
      setConfirmedZip('');
      setConfirmedPhone(phoneInput.trim() || '');
      setConfirmedWebsite(websiteInput.trim() || '');
      setConfirmedCategory(categoryInput.trim() || 'Local Business');
      setConfirmedServices(['Primary Services']);
      setStep(2);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleConfirmAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedName.trim()) return;

    setIsSaving(true);
    setDiscoveryError(null);

    try {
      const res = await fetch('/api/onboarding/confirm-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          businessName: confirmedName.trim(),
          legalName: confirmedLegalName.trim() || confirmedName.trim(),
          businessCategory: confirmedCategory.trim() || 'Local Business',
          address: confirmedAddress.trim() || undefined,
          city: confirmedCity.trim() || undefined,
          state: confirmedState.trim() || undefined,
          country: confirmedCountry.trim() || 'United States',
          postalCode: confirmedZip.trim() || undefined,
          phone: confirmedPhone.trim() || undefined,
          website: confirmedWebsite.trim() || undefined,
          services: confirmedServices,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        if (res.status === 403 || data.code === 'BUSINESS_LIMIT_REACHED') {
          setShowAddModal(false);
          setShowUpgradeLimitModal(true);
          return;
        }
        throw new Error(data.error || 'Failed to save confirmed business.');
      }

      setShowAddModal(false);
      setFeedback({
        type: 'success',
        message: `Business "${confirmedName}" created successfully with dedicated Business Profile & Brain!`,
      });
      setTimeout(() => setFeedback(null), 4000);

      // Reload businesses or switch
      if (data.business?.id) {
        switchBusiness(data.business.id);
      }
      if (refreshBusinessTruth) {
        refreshBusinessTruth();
      }
    } catch (err: any) {
      console.error('[Save Business Error]:', err);
      setDiscoveryError(err.message || 'Error saving business.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenBusiness = (bizId: string) => {
    switchBusiness(bizId);
    setFeedback({
      type: 'success',
      message: `Switched active workspace to "${businesses.find((b) => b.id === bizId)?.name || 'selected business'}".`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDeleteBusiness = async (bizId: string) => {
    if (businesses.length <= 1) {
      setFeedback({
        type: 'error',
        message: 'You must maintain at least one business workspace.',
      });
      setTimeout(() => setFeedback(null), 4000);
      setBusinessToDelete(null);
      setSelectedBizForManage(null);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteBusiness(bizId);
      setFeedback({
        type: 'success',
        message: 'Business workspace and all associated data permanently deleted.',
      });
      setTimeout(() => setFeedback(null), 4000);
      setSelectedBizForManage(null);
      setBusinessToDelete(null);
      setDeleteConfirmText('');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to delete business.',
      });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* SECTION HEADER: Your Businesses           2 / 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-[#059669] border border-emerald-200">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold font-heading text-slate-900 tracking-tight">
                Your Businesses
              </h2>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Manage your businesses, check directory & Google status, or initialize new workspaces.
              </p>
            </div>
          </div>
        </div>

        {/* Quota indicator: e.g. 2 / 3 */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
            <span className="text-xs font-medium text-slate-500">Plan Quota:</span>
            <span className="font-heading font-extrabold text-sm text-slate-900">
              {currentCount} / {maxAllowed}
            </span>
          </div>

          <button
            onClick={handleOpenAddBusiness}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{hasActiveWorkspace ? '+ Add Business' : '+ Complete Setup First'}</span>
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BUSINESSES LIST */}
      <div className="space-y-3">
        {businesses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 text-center shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#059669] border border-emerald-100 flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-heading text-slate-900">
              No Active Business Workspace
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Complete your initial business setup onboarding to activate your primary workspace. Once onboarded, you can add and manage business locations and directory profiles.
            </p>
            <button
              onClick={() => setOnboardingModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start Onboarding Setup</span>
            </button>
          </div>
        ) : (
          businesses.map((biz) => {
          const isActive = biz.id === activeBusinessId;
          const isPublished = Boolean(biz.isPublishedInDirectory);
          const isGoogleConnected = Boolean(
            biz.gbpConnected ||
            (biz as any).googleConnected ||
            (biz as any).googleBusinessProfile?.connected ||
            (biz as any).truthData?.googleConnected
          );

          // Format location string: Melbourne, VIC
          const locationDisplay = biz.city
            ? `${biz.city}${biz.state ? `, ${biz.state}` : biz.country ? `, ${biz.country}` : ''}`
            : biz.address || 'Address not configured';

          return (
            <div
              key={biz.id}
              className={`bg-white border rounded-2xl p-5 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isActive
                  ? 'border-emerald-500/70 ring-2 ring-emerald-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Business Info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    {biz.name}
                  </h3>
                  {isActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#059669] border border-emerald-200">
                      Active Workspace
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{locationDisplay}</span>
                </p>

                {/* Status Badges: Directory & Google */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* Directory Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      isPublished
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Directory: {isPublished ? 'Published' : 'Not Published'}
                    </span>
                  </span>

                  {/* Google Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      isGoogleConnected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                      />
                    </svg>
                    <span>
                      Google: {isGoogleConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Action Buttons: [Open Business] [Manage] */}
              <div className="flex items-center gap-2 sm:self-center shrink-0">
                <button
                  onClick={() => handleOpenBusiness(biz.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-50 text-[#059669] border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                  title={isActive ? 'Currently Active Workspace' : 'Switch to this business'}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isActive ? 'Active Business' : 'Open Business'}</span>
                </button>

                <button
                  onClick={() => setSelectedBizForManage(biz)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Manage profile, locations, or directory settings"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>Manage</span>
                </button>
              </div>
            </div>
          );
        })
      )}
      </div>

      {/* MODAL 1: Manage Business Dialog */}
      {selectedBizForManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                  Business Management
                </span>
                <h3 className="text-lg font-bold font-heading text-slate-900">
                  {selectedBizForManage.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedBizForManage.city ? `${selectedBizForManage.city}, ${selectedBizForManage.state || selectedBizForManage.country || ''}` : 'No location specified'}
                </p>
              </div>
              <button
                onClick={() => setSelectedBizForManage(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Links to Business Sub-sections */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  switchBusiness(selectedBizForManage.id);
                  setSelectedBizForManage(null);
                  if (onNavigateToBusinessTab) {
                    onNavigateToBusinessTab('profile');
                  } else {
                    setActiveTab('business_profile');
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-white border border-slate-200 text-[#059669]">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 font-heading">
                      Business → Profile
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Edit services, hours, logo, contact, and identity
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#059669] transition-colors" />
              </button>

              <button
                onClick={() => {
                  switchBusiness(selectedBizForManage.id);
                  setSelectedBizForManage(null);
                  if (onNavigateToBusinessTab) {
                    onNavigateToBusinessTab('locations');
                  } else {
                    setActiveTab('business_locations');
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-white border border-slate-200 text-[#059669]">
                    <MapPinned className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 font-heading">
                      Business → Locations
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Manage physical locations without consuming business slots
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#059669] transition-colors" />
              </button>

              <button
                onClick={() => {
                  switchBusiness(selectedBizForManage.id);
                  setSelectedBizForManage(null);
                  if (onNavigateToBusinessTab) {
                    onNavigateToBusinessTab('directory');
                  } else {
                    setActiveTab('business_directory');
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-white border border-slate-200 text-[#059669]">
                    <Globe className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 font-heading">
                      Business → Directory
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Check eligibility & publish live to public directory
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#059669] transition-colors" />
              </button>
            </div>

            {/* Delete Trigger */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setBusinessToDelete(selectedBizForManage);
                  setDeleteConfirmText('');
                  setSelectedBizForManage(null);
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Business...</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Upgrade Business Limit Modal */}
      {showUpgradeLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-fadeIn text-center font-sans">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold font-heading text-slate-900 tracking-tight">
                Business Limit Reached
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You've reached your business limit ({currentCount} / {maxAllowed}). Upgrade your plan to manage additional businesses.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Current Plan:</span>
                <span className="font-bold font-heading text-slate-900 uppercase">
                  {user.planTier} ({maxAllowed} Business{maxAllowed > 1 ? 'es' : ''})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Pro Plan:</span>
                <span className="font-bold text-emerald-700">3 Businesses</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Agency Elite:</span>
                <span className="font-bold text-emerald-700">10 Businesses</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={() => setShowUpgradeLimitModal(false)}
                className="w-full sm:w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUpgradeLimitModal(false);
                  setCheckoutModalPlan(user.planTier === 'pro' ? 'agency' : 'pro');
                }}
                className="w-full sm:w-1/2 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: 2-Step Add Business Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl space-y-5 animate-fadeIn font-sans my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#059669] uppercase tracking-wider font-heading">
                  Step {step} of 2 • {step === 1 ? 'Business Discovery' : 'Review & Confirm Truth Record'}
                </span>
                <h3 className="text-lg font-bold font-heading text-slate-900">
                  {step === 1 ? 'Add New Business' : 'Confirm Business Profile'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {discoveryError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{discoveryError}</span>
              </div>
            )}

            {step === 1 ? (
              /* STEP 1: INPUT FORM */
              <form onSubmit={handleRunDiscovery} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. ABC Dental"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <GoogleAddressAutocomplete
                    value={locationInput}
                    onChange={setLocationInput}
                    label="Primary Location (City, State / Region) *"
                    helperText="Select or type your primary city & state"
                    onSelectLocation={handleLocationSelect}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Country
                    </label>
                    <CountryAutocomplete
                      value={countryInput}
                      onChange={setCountryInput}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      placeholder="e.g. Dental Clinic"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Website (Optional)
                    </label>
                    <input
                      type="text"
                      value={websiteInput}
                      onChange={(e) => setWebsiteInput(e.target.value)}
                      placeholder="e.g. abcdental.com.au"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="e.g. +61 3 9000 1234"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDiscovering || !nameInput.trim()}
                    className="px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isDiscovering ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Discovering Records...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to Step 2</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* STEP 2: CONFIRMATION FORM */
              <form onSubmit={handleConfirmAndSave} className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                    <span>Review & finalize your verified business information</span>
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    This automatically creates the Business Profile & dedicated Business Brain together.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={confirmedName}
                      onChange={(e) => setConfirmedName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Legal Name
                    </label>
                    <input
                      type="text"
                      value={confirmedLegalName}
                      onChange={(e) => setConfirmedLegalName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={confirmedAddress}
                    onChange={(e) => setConfirmedAddress(e.target.value)}
                    placeholder="e.g. 123 Collins St"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={confirmedCity}
                      onChange={(e) => setConfirmedCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={confirmedState}
                      onChange={(e) => setConfirmedState(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={confirmedZip}
                      onChange={(e) => setConfirmedZip(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={confirmedPhone}
                      onChange={(e) => setConfirmedPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={confirmedWebsite}
                      onChange={(e) => setConfirmedWebsite(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Services */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Services
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {confirmedServices.map((srv, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                      >
                        <span>{srv}</span>
                        <button
                          type="button"
                          onClick={() => setConfirmedServices(confirmedServices.filter((_, i) => i !== idx))}
                          className="hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newServiceTag}
                      onChange={(e) => setNewServiceTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newServiceTag.trim()) {
                            setConfirmedServices([...confirmedServices, newServiceTag.trim()]);
                            setNewServiceTag('');
                          }
                        }
                      }}
                      placeholder="Type a service and press Enter..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newServiceTag.trim()) {
                          setConfirmedServices([...confirmedServices, newServiceTag.trim()]);
                          setNewServiceTag('');
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || !confirmedName.trim()}
                    className="px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSaving ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Business Workspace...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Save & Initialize Business</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Explicit Destructive Delete Confirmation Modal */}
      {businessToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5 mb-4">
              <span className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold font-heading text-slate-900">
                    Delete Business Workspace
                  </h3>
                  <button
                    onClick={() => {
                      setBusinessToDelete(null);
                      setDeleteConfirmText('');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-sans">
                  You are about to permanently delete <strong className="text-slate-900">{businessToDelete.name}</strong>. This is an explicit, irreversible destructive action.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-rose-50/70 border border-rose-200/80 p-3.5 mb-4 text-xs text-rose-900 space-y-1.5 font-sans">
              <p className="font-bold text-rose-950 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                All data scoped to this business will be permanently purged:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-800 ml-1">
                <li>Business Profile identity, brand settings, and logo media</li>
                <li>Business Brain knowledge base and custom context</li>
                <li>Physical branch locations & coordinates</li>
                <li>Data connections (Google Business Profile, Search Console, Analytics)</li>
                <li>SEO audit data, website crawl history, and tracked keyword rankings</li>
                <li>Reviews, sentiment metrics, and reply history</li>
                <li>Content assets, projects, proposals, invoices, and work tasks</li>
                <li>Customer records and CRM activity history</li>
                <li>Directory profile, public local SEO pages, and inbound leads</li>
              </ul>
              <p className="text-[11px] text-rose-700 font-medium pt-1">
                ✓ Unrelated businesses in your account will remain completely unaffected.
              </p>
            </div>

            <div className="space-y-2 mb-5">
              <label className="block text-xs font-bold text-slate-700 font-heading">
                To confirm deletion, type the business name <span className="text-rose-600 font-extrabold">"{businessToDelete.name}"</span> below:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={businessToDelete.name}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setBusinessToDelete(null);
                  setDeleteConfirmText('');
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBusiness(businessToDelete.id)}
                disabled={isDeleting || deleteConfirmText.trim().toLowerCase() !== businessToDelete.name.trim().toLowerCase()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting Workspace...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete Business</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
