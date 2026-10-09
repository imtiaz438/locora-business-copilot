import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import {
  Building2,
  ChevronDown,
  Check,
  Plus,
  Lock,
  MapPin,
  Briefcase,
  Users,
  Settings,
  X,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Pencil,
  Edit3,
  HelpCircle,
  Globe,
  Phone,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Search,
} from 'lucide-react';
import { CountryAutocomplete } from './CountryAutocomplete';
import { GoogleAddressAutocomplete, LocationData } from './GoogleAddressAutocomplete';

export const TopBusinessSelector: React.FC = () => {
  const {
    businesses,
    activeBusinessId,
    activeBusiness,
    businessTruth,
    switchBusiness,
    updateActiveBusiness,
    addBusiness,
    addLocation,
    setActiveTab,
    setCheckoutModalPlan,
    user,
    logActivity,
    setIsGbpSyncModalOpen,
    setOnboardingModalOpen,
    isAddBusinessModalOpen,
    setIsAddBusinessModalOpen,
  } = useApp();

  const hasBusiness = businesses.length > 0 && !!activeBusiness && activeBusiness.id !== 'workspace_pending';
  const displayName = hasBusiness ? (businessTruth?.name ?? activeBusiness?.name ?? 'No business yet') : 'No business yet';
  const displayCategory = hasBusiness ? (businessTruth?.category ?? activeBusiness?.category ?? null) : null;
  const primaryLoc = businessTruth?.locations?.find((l) => l.isPrimary) || businessTruth?.locations?.[0];
  const displayCity = hasBusiness ? (primaryLoc?.city ?? activeBusiness?.city ?? null) : null;
  const displayState = hasBusiness ? (primaryLoc?.state ?? activeBusiness?.state ?? null) : null;
  const displayLocationName = hasBusiness ? (primaryLoc?.name ?? activeBusiness?.locationName ?? 'Main Location') : 'No location yet';

  const [isOpen, setIsOpen] = useState(false);
  const [showAddBusinessModal, setShowAddBusinessModal] = useState(false);
  const [showEditBusinessModal, setShowEditBusinessModal] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [showAgencyUpgradeModal, setShowAgencyUpgradeModal] = useState(false);
  const [showLimitReachedModal, setShowLimitReachedModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Central Plan-Based Business Quota State
  const tier = (user.planTier || 'free').toLowerCase();
  const defaultLimit =
    tier === 'agency' || tier === 'agency_elite' || tier === 'elite'
      ? 10
      : tier === 'pro' || tier === 'growth'
      ? 3
      : 1;
  const [businessLimitInfo, setBusinessLimitInfo] = useState({
    limit: defaultLimit,
    currentCount: businesses.length,
    canAddMore: businesses.length === 0 || businesses.length < defaultLimit,
    display: `Businesses: ${businesses.length} / ${defaultLimit}`,
  });
  const [isCheckingLimit, setIsCheckingLimit] = useState(false);

  // 2-Step Add Business Workflow State (Input -> Discover & Confirm)
  const [addBusinessStep, setAddBusinessStep] = useState<1 | 2>(1);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [isCreatingBusiness, setIsCreatingBusiness] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  // Discovered / Confirmed fields for Step 2
  const [confirmedName, setConfirmedName] = useState('');
  const [confirmedLegalName, setConfirmedLegalName] = useState('');
  const [confirmedCategory, setConfirmedCategory] = useState('');
  const [confirmedWebsite, setConfirmedWebsite] = useState('');
  const [confirmedPhone, setConfirmedPhone] = useState('');
  const [confirmedAddress, setConfirmedAddress] = useState('');
  const [confirmedCity, setConfirmedCity] = useState('');
  const [confirmedState, setConfirmedState] = useState('');
  const [confirmedZip, setConfirmedZip] = useState('');
  const [confirmedDescription, setConfirmedDescription] = useState('');
  const [confirmedServices, setConfirmedServices] = useState<string[]>([]);
  const [newServiceInput, setNewServiceInput] = useState('');
  const [discoveredSources, setDiscoveredSources] = useState<string[]>([]);
  const [gbpFoundStatus, setGbpFoundStatus] = useState<string | null>(null);

  const fetchLimit = () => {
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
            const count = typeof data.currentCount === 'number' ? data.currentCount : businesses.length;
            const canAdd = count === 0 || count < data.limit;
            setBusinessLimitInfo({
              ...data,
              canAddMore: canAdd,
              display: `Businesses: ${count} / ${data.limit}`,
            });
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchLimit();
  }, [user.email, user.planTier, businesses.length]);

  // Form states for adding business workspace
  const [newBizName, setNewBizName] = useState('');
  const [newBizCategory, setNewBizCategory] = useState('');
  const [newBizCountry, setNewBizCountry] = useState('United States');
  const [newBizCity, setNewBizCity] = useState('');
  const [newBizState, setNewBizState] = useState('');
  const [newBizAddress, setNewBizAddress] = useState('');
  const [newBizZip, setNewBizZip] = useState('');
  const [newBizPhone, setNewBizPhone] = useState('');
  const [newBizWebsite, setNewBizWebsite] = useState('');

  // Form states for editing current active business (Free/Pro/Agency)
  const [editBizName, setEditBizName] = useState('');
  const [editBizCategory, setEditBizCategory] = useState('');
  const [editBizAddress, setEditBizAddress] = useState('');
  const [editBizCity, setEditBizCity] = useState('');
  const [editBizState, setEditBizState] = useState('');
  const [editBizCountry, setEditBizCountry] = useState('United States');
  const [editBizZip, setEditBizZip] = useState('');
  const [editBizPhone, setEditBizPhone] = useState('');
  const [editBizWebsite, setEditBizWebsite] = useState('');

  const openEditBusiness = () => {
    setEditBizName(activeBusiness.name || '');
    setEditBizCategory(activeBusiness.category || '');
    setEditBizAddress(activeBusiness.address || '');
    setEditBizCity(activeBusiness.city || '');
    setEditBizState(activeBusiness.state || '');
    setEditBizCountry(activeBusiness.country || 'United States');
    setEditBizZip(activeBusiness.zip || '');
    setEditBizPhone(activeBusiness.phone || '');
    setEditBizWebsite(activeBusiness.website || '');
    setShowEditBusinessModal(true);
  };

  const handleSaveEditBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBizName.trim()) return;

    updateActiveBusiness({
      name: editBizName.trim(),
      category: editBizCategory.trim() || 'Local Business',
      address: editBizAddress.trim() || '',
      city: editBizCity.trim() || '',
      state: editBizState.trim() || '',
      country: editBizCountry.trim() || 'United States',
      zip: editBizZip.trim(),
      phone: editBizPhone.trim(),
      website: editBizWebsite.trim(),
    });

    setShowEditBusinessModal(false);
  };

  const handleEditLocationSelectFromAutocomplete = (loc: LocationData) => {
    if (loc.address) setEditBizAddress(loc.address);
    if (loc.city) setEditBizCity(loc.city);
    if (loc.state) setEditBizState(loc.state);
    if (loc.country) setEditBizCountry(loc.country);
    if (loc.zip) setEditBizZip(loc.zip);
  };

  const handleNewLocationSelectFromAutocomplete = (loc: LocationData) => {
    if (loc.address) setNewBizAddress(loc.address);
    if (loc.city) setNewBizCity(loc.city);
    if (loc.state) setNewBizState(loc.state);
    if (loc.country) setNewBizCountry(loc.country);
    if (loc.zip) setNewBizZip(loc.zip);
  };

  // Form states for adding location
  const [newLocName, setNewLocName] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [newLocCity, setNewLocCity] = useState('');
  const [newLocState, setNewLocState] = useState('');
  const [newLocCountry, setNewLocCountry] = useState('United States');
  const [newLocZip, setNewLocZip] = useState('');
  const [newLocPhone, setNewLocPhone] = useState('');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key to close any open modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddBusinessModal(false);
        setShowEditBusinessModal(false);
        setShowAddLocationModal(false);
        setShowAgencyUpgradeModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectBusiness = (id: string) => {
    switchBusiness(id);
    setIsOpen(false);
  };

  const isAgency = ['agency', 'agency_elite', 'elite'].includes((user.planTier || '').toLowerCase());

  const handleAddBusinessClick = async () => {
    // GATING: Active workspace / onboarding must be established first before adding additional businesses
    if (!hasBusiness || businesses.length === 0) {
      setOnboardingModalOpen(true);
      setIsOpen(false);
      setIsAddBusinessModalOpen(false);
      return;
    }

    try {
      setIsCheckingLimit(true);
      const res = await fetch(
        `/api/workspace/business-limit?email=${encodeURIComponent(user.email || '')}&plan=${encodeURIComponent(user.planTier || '')}`,
        {
          headers: {
            'x-user-email': user.email || '',
            'x-user-plan': user.planTier || '',
          },
        }
      );
      const data = await res.json();
      setIsCheckingLimit(false);

      const effectiveLimit = data && typeof data.limit === 'number' ? data.limit : defaultLimit;
      const count = data && typeof data.currentCount === 'number' ? data.currentCount : businesses.length;
      const canAdd = count === 0 || count < effectiveLimit;

      if (data && typeof data.limit === 'number') {
        setBusinessLimitInfo({
          ...data,
          canAddMore: canAdd,
          display: `Businesses: ${count} / ${effectiveLimit}`,
        });
      }

      // CRITICAL: If the user has 0 businesses, NEVER lock them out on ANY plan.
      // Only show limit reached if count > 0 AND count >= effectiveLimit
      if (count > 0 && !canAdd) {
        setShowLimitReachedModal(true);
        setIsAddBusinessModalOpen(false);
        setIsOpen(false);
        return;
      }

      setNewBizName('');
      setNewBizCategory('');
      setNewBizCountry('United States');
      setNewBizCity('');
      setNewBizState('');
      setNewBizAddress('');
      setNewBizZip('');
      setNewBizPhone('');
      setNewBizWebsite('');
      setDiscoveryError(null);
      setCreationError(null);
      setAddBusinessStep(1);
      setShowAddBusinessModal(true);
      setIsOpen(false);
    } catch {
      setIsCheckingLimit(false);
      // Fallback: Never lock if businesses.length === 0
      if (businesses.length > 0 && businesses.length >= defaultLimit) {
        setShowLimitReachedModal(true);
        setIsAddBusinessModalOpen(false);
        setIsOpen(false);
        return;
      }
      setAddBusinessStep(1);
      setShowAddBusinessModal(true);
      setIsOpen(false);
    }
  };

  // Sync external open requests for Add Business (e.g. from zero-business state or management section)
  useEffect(() => {
    if (isAddBusinessModalOpen && !showAddBusinessModal) {
      handleAddBusinessClick();
    } else if (!isAddBusinessModalOpen && showAddBusinessModal) {
      setShowAddBusinessModal(false);
    }
  }, [isAddBusinessModalOpen]);

  const handleDiscoverBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) {
      setDiscoveryError('Business name is required.');
      return;
    }

    setIsDiscovering(true);
    setDiscoveryError(null);

    const primaryLocation = newBizAddress || (newBizCity ? `${newBizCity}${newBizState ? `, ${newBizState}` : ''}` : '');

    try {
      const res = await fetch('/api/onboarding/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: newBizName.trim(),
          websiteUrl: newBizWebsite.trim() || undefined,
          country: newBizCountry.trim() || 'United States',
          primaryLocation: primaryLocation || undefined,
          userEmail: user.email,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to discover business details.');
      }

      const discovered = json.data || {};

      setConfirmedName(discovered.businessName || newBizName.trim());
      setConfirmedLegalName(discovered.legalName || newBizName.trim());
      setConfirmedCategory(discovered.category || newBizCategory.trim() || 'Local Business');
      setConfirmedWebsite(discovered.website || newBizWebsite.trim());
      setConfirmedPhone(discovered.phone || newBizPhone.trim());
      // Location sanity: if discovery returns a city/state that contradicts what the
      // user typed, prefer the user's input and flag it — never silently corrupt.
      const userCity = newBizCity.trim().toLowerCase();
      const userState = newBizState.trim().toLowerCase();
      const discCity = (discovered.city || '').toLowerCase();
      const discState = (discovered.state || '').toLowerCase();
      const cityMismatch = userCity && discCity && userCity !== discCity;
      const stateMismatch = userState && discState && userState !== discState && !discState.startsWith(userState) && !userState.startsWith(discState);
      if (cityMismatch || stateMismatch) {
        setConfirmedAddress(newBizAddress.trim());
        setConfirmedCity(newBizCity.trim());
        setConfirmedState(newBizState.trim());
        setConfirmedZip(newBizZip.trim());
        setDiscoveryError(
          `We found a different location (${discovered.city || ''} ${discovered.state || ''}) than what you entered. We've kept your input — please verify the address below.`
        );
      } else {
        setConfirmedAddress(discovered.address || newBizAddress.trim());
        setConfirmedCity(discovered.city || newBizCity.trim());
        setConfirmedState(discovered.state || newBizState.trim());
        setConfirmedZip(discovered.postalCode || newBizZip.trim());
      }
      setConfirmedDescription(discovered.description || '');
      setConfirmedServices(Array.isArray(discovered.services) && discovered.services.length > 0 ? discovered.services : []);
      setDiscoveredSources(Array.isArray(discovered.sourcesList) ? discovered.sourcesList : ['User Input']);
      setGbpFoundStatus(discovered.gbp?.placeId ? `Connected (Place ID: ${discovered.gbp.placeId.slice(0, 10)}...)` : null);

      setIsDiscovering(false);
      setAddBusinessStep(2);
    } catch (err: any) {
      console.warn('[Discovery Notice]:', err);
      // Fall back smoothly to review what was provided
      setConfirmedName(newBizName.trim());
      setConfirmedLegalName(newBizName.trim());
      setConfirmedCategory(newBizCategory.trim() || 'Local Business');
      setConfirmedWebsite(newBizWebsite.trim());
      setConfirmedPhone(newBizPhone.trim());
      setConfirmedAddress(newBizAddress.trim());
      setConfirmedCity(newBizCity.trim());
      setConfirmedState(newBizState.trim());
      setConfirmedZip(newBizZip.trim());
      setConfirmedDescription('');
      setConfirmedServices([]);
      setDiscoveredSources(['User Input']);
      setGbpFoundStatus(null);
      setIsDiscovering(false);
      setAddBusinessStep(2);
    }
  };

  const handleConfirmAndCreateBusiness = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!confirmedName.trim()) {
      setCreationError('Business name is required.');
      return;
    }

    setIsCreatingBusiness(true);
    setCreationError(null);

    const formData = {
      businessName: confirmedName.trim(),
      legalName: confirmedLegalName.trim() || confirmedName.trim(),
      website: confirmedWebsite.trim(),
      country: newBizCountry.trim() || 'United States',
      primaryLocation: confirmedAddress || (confirmedCity ? `${confirmedCity}${confirmedState ? `, ${confirmedState}` : ''}` : 'United States'),
      address: confirmedAddress.trim(),
      city: confirmedCity.trim(),
      state: confirmedState.trim(),
      postalCode: confirmedZip.trim(),
      phone: confirmedPhone.trim(),
      businessCategory: confirmedCategory.trim() || 'Local Business',
      description: confirmedDescription.trim(),
      services: confirmedServices,
    };

    try {
      // Create a genuinely NEW business via the production businesses endpoint
      // (plan limits enforced server-side). NOTE: do NOT use
      // /api/onboarding/confirm-and-save here — it is idempotent by design and
      // would overwrite the existing business instead of adding one (data loss).
      const saveRes = await fetch('/api/production/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify({
          name: confirmedName.trim(),
          legalName: confirmedLegalName.trim() || confirmedName.trim(),
          category: confirmedCategory.trim() || 'Local Business',
          industry: confirmedCategory.trim() || 'Local Business',
          website: confirmedWebsite.trim(),
          phone: confirmedPhone.trim(),
          address: confirmedAddress.trim(),
          city: confirmedCity.trim(),
          state: confirmedState.trim(),
          zip: confirmedZip.trim(),
          country: newBizCountry.trim() || 'United States',
          description: confirmedDescription.trim(),
          services: confirmedServices,
          email: user.email,
        }),
      });

      const saveJson = await saveRes.json();
      if (!saveRes.ok) {
        if (saveJson.error?.includes('limit') || saveJson.code === 'BUSINESS_LIMIT_REACHED' || saveRes.status === 403) {
          setShowAddBusinessModal(false);
          setShowLimitReachedModal(true);
          return;
        }
        throw new Error(saveJson.error || 'Failed to save confirmed business.');
      }

      const newBizId = saveJson.id || saveJson.businessId || saveJson.business?.id;

      // 2. Initialize Business Brain from verified/user data
      if (newBizId) {
        await fetch('/api/onboarding/create-brain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: newBizId,
            userEmail: user.email,
          }),
        }).catch((err) => console.warn('Brain initialization notice:', err));
      }

      // 3. Update local context & switch business
      addBusiness({
        id: newBizId,
        name: confirmedName.trim(),
        category: confirmedCategory.trim() || 'Local Business',
        address: confirmedAddress.trim(),
        city: confirmedCity.trim(),
        state: confirmedState.trim(),
        country: newBizCountry.trim() || 'United States',
        zip: confirmedZip.trim(),
        phone: confirmedPhone.trim(),
        website: confirmedWebsite.trim(),
        services: confirmedServices,
      });

      logActivity('business_created', 'New Business Workspace Initialized', `Added ${confirmedName.trim()} with unified Profile & Brain`);

      fetchLimit();
      setShowAddBusinessModal(false);
      setIsAddBusinessModalOpen(false);
      setIsCreatingBusiness(false);
      if (newBizId) {
        switchBusiness(newBizId);
      }
    } catch (err: any) {
      console.error('[Create Business Error]:', err);
      setCreationError(err.message || 'Failed to create business workspace.');
      setIsCreatingBusiness(false);
    }
  };

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;

    addLocation(activeBusinessId, {
      name: newLocName.trim(),
      address: newLocAddress.trim() || '',
      city: newLocCity.trim() || activeBusiness.city || '',
      state: newLocState.trim() || activeBusiness.state || '',
      country: newLocCountry.trim() || 'United States',
      zip: newLocZip.trim() || activeBusiness.zip || '',
      phone: newLocPhone.trim() || activeBusiness.phone,
    });

    setNewLocName('');
    setNewLocAddress('');
    setNewLocCity('');
    setNewLocState('');
    setNewLocCountry('United States');
    setNewLocZip('');
    setNewLocPhone('');
    setShowAddLocationModal(false);
    setIsOpen(false);
  };

  const handleLocationSelectFromAutocomplete = (loc: LocationData) => {
    if (loc.address) setNewLocAddress(loc.address);
    if (loc.city) setNewLocCity(loc.city);
    if (loc.state) setNewLocState(loc.state);
    if (loc.country) setNewLocCountry(loc.country);
    if (loc.zip) setNewLocZip(loc.zip);
    if (!newLocName) {
      setNewLocName(`${loc.city || 'Location'} Clinic`);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Selector Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 transition-all cursor-pointer font-sans text-left group shadow-2xs"
          title="Switch Business or Location"
        >
          <span className="w-5 h-5 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 text-xs font-bold shrink-0">
            🏥
          </span>
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-xs font-bold text-slate-900 truncate max-w-[140px] sm:max-w-[180px] font-heading leading-tight group-hover:text-[#059669] transition-colors">
              {displayName}
            </span>
            <span className="text-[10px] text-slate-500 font-medium truncate leading-none">
              {displayLocationName}
            </span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform shrink-0 ${
              isOpen ? 'rotate-180 text-[#059669]' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden font-sans animate-fadeIn">
            {/* Active Business Summary */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                    Active Business
                  </span>
                  <span className="text-[10px] font-bold font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                    {businessLimitInfo.display}
                  </span>
                </div>
                {hasBusiness && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Health: {typeof activeBusiness.healthScore === 'number' && activeBusiness.healthScore > 0 ? `${activeBusiness.healthScore}/100` : '—'}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-1.5 gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 font-heading truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {displayCategory || (hasBusiness ? 'Local Business' : 'No active workspace')} {displayCity ? `• ${displayCity}${displayState ? `, ${displayState}` : ''}` : ''}
                  </p>
                  {businessTruth && hasBusiness && (
                    <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-800 text-[10px] font-medium">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Brain Verified</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    openEditBusiness();
                    setIsOpen(false);
                  }}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 text-[#059669] hover:text-[#047857] border border-emerald-200 text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                  title="Customize this business with your own company name & address"
                >
                  <Pencil className="w-3 h-3 text-[#059669]" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Quick Actions for Business / Location */}
            <div className="px-2 py-2 border-b border-slate-100 grid grid-cols-3 gap-1.5 text-xs">
              {(() => {
                // Free (single-business) plan: GBP connection is one-time and locked — once
                // connected there is no re-sync path, so don't offer the button either.
                // Paid multi-business plans keep per-business refresh.
                const gbpConnected = Boolean((activeBusiness as any)?.gbpConnected) || Boolean((businessTruth as any)?.googleProfile?.connected);
                const isSingleBusinessPlan = (user?.planTier || 'free').toLowerCase() === 'free';
                if (gbpConnected && isSingleBusinessPlan) return null;
                return (
              <button
                onClick={() => {
                  setIsGbpSyncModalOpen(true);
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                title="Sync directly from Google Business Profile or search Google Places"
              >
                <Globe className="w-3 h-3" />
                <span>Sync Google</span>
              </button>
                );
              })()}
              <button
                onClick={() => {
                  setActiveTab('business_profile');
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] font-bold text-[11px] transition-colors cursor-pointer border border-emerald-200"
                title="Manage Business Profile (Identity, services, hours, logo)"
              >
                <Pencil className="w-3 h-3 text-[#059669]" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  setShowAddLocationModal(true);
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
                title="Add a physical location to this business"
              >
                <Plus className="w-3 h-3 text-slate-500" />
                <span>Add Location</span>
              </button>
            </div>

            {/* Locations of this business */}
            <div className="p-2 border-b border-slate-100">
              <div className="flex items-center justify-between px-2 pb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                  Locations ({hasBusiness ? (activeBusiness.locations?.length || 1) : 0})
                </span>
                <span className="text-[10px] text-slate-400">
                  {hasBusiness ? (activeBusiness.locations?.length ? 'Multiple Locations' : 'Single Location') : '0 Locations'}
                </span>
              </div>

              <div className="space-y-1">
                {hasBusiness ? (
                  (activeBusiness.locations || [
                    {
                      id: 'main',
                      name: activeBusiness.locationName || 'Main Location',
                      address: activeBusiness.address,
                      city: activeBusiness.city,
                      state: activeBusiness.state,
                      phone: activeBusiness.phone,
                      isMain: true,
                    },
                  ]).map((loc, idx) => (
                    <div
                      key={loc.id || idx}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-700"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate text-[11px]">{loc.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {loc.address || `${activeBusiness.city}, ${activeBusiness.state}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono shrink-0">
                        Primary
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400 px-2.5 py-1.5 italic">
                    No locations configured yet.
                  </p>
                )}
              </div>
            </div>

            {/* Business Portfolio Switcher */}
            <div className="p-2">
              <div className="flex items-center justify-between px-2 pb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                  Businesses
                </span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {businessLimitInfo.display}
                </span>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto">
                {businesses.length > 0 ? (
                  businesses.map((biz) => {
                    const isSelected = biz.id === activeBusinessId;
                    return (
                      <button
                        key={biz.id}
                        onClick={() => handleSelectBusiness(biz.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 text-[#059669] font-bold'
                            : 'hover:bg-slate-50 text-slate-700 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="w-4 flex items-center justify-center shrink-0">
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 text-[#059669]" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs truncate">{biz.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {biz.category || 'Local Business'} {biz.city ? `• ${biz.city}` : ''}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-2.5 px-2 text-center text-xs text-slate-400">
                    No businesses yet.
                  </div>
                )}
              </div>

              {/* Add Business Action */}
              <div className="pt-2 px-0.5 space-y-1.5">
                <button
                  type="button"
                  id="top-selector-add-business-btn"
                  onClick={handleAddBusinessClick}
                  disabled={isCheckingLimit}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isCheckingLimit ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>{hasBusiness ? '+ Add Business' : '+ Complete Setup (Add Workspace)'}</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setIsOpen(false);
                }}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium text-[11px] cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Workspace Settings</span>
              </button>

              {!isAgency && (
                <button
                  onClick={() => {
                    setShowAgencyUpgradeModal(true);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#059669] hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Agency Elite ($99)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Agency Elite Multi-Business Lock Modal */}
      {typeof document !== 'undefined' &&
        showAgencyUpgradeModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex justify-center items-center font-sans animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAgencyUpgradeModal(false);
            }}
          >
            <div
              className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 animate-scaleUp font-sans my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      Agency Elite Tier Feature
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 font-heading mt-1">
                      Multi-Client Business Workspaces
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAgencyUpgradeModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3.5 text-xs text-slate-600">
                <p className="leading-relaxed">
                  Your current plan (<strong>{user.planTier.toUpperCase()}</strong>) includes <strong>1 dedicated Business Workspace</strong>.
                  Managing 10+ independent client accounts, team collaboration seats, and white-label PDF reports is available on <strong>Agency Elite ($99/mo)</strong>.
                </p>

                {/* Helpful callout for single-business customization */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Want to customize your business?</p>
                    <p className="text-[11px] text-emerald-700">Update your company name, category, address & website anytime for free.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAgencyUpgradeModal(false);
                      openEditBusiness();
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                </div>

                <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 space-y-2.5 text-indigo-950 font-medium">
                  <p className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Agency Elite Capabilities ($99/mo):</span>
                  </p>
                  <ul className="space-y-1.5 pl-1 text-[11px]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>10 Independent Client Workspaces & Dedicated AI Brains</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>White-Label Executive Client PDF Reports (Your Logo)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>5 Team Member Collaboration Seats</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Unified Agency Client Cockpit with Autonomous Health Audits</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-3 flex items-center gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAgencyUpgradeModal(false);
                    setActiveTab('pricing');
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer text-center"
                >
                  View Pricing Matrix
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAgencyUpgradeModal(false);
                    setCheckoutModalPlan('agency');
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Unlock Agency ($99)</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Plan Business Limit Reached Modal */}
      {typeof document !== 'undefined' &&
        showLimitReachedModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex justify-center items-center font-sans animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowLimitReachedModal(false);
            }}
          >
            <div
              className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 animate-scaleUp font-sans my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      {businessLimitInfo.display}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 font-heading mt-1">
                      Business Limit Reached
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLimitReachedModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3.5 text-xs text-slate-600">
                <p className="leading-relaxed">
                  You've reached your business limit on the <strong>{user.planTier ? user.planTier.toUpperCase() : 'FREE'}</strong> plan ({businessLimitInfo.display}).
                  Upgrade your plan to add and manage additional independent businesses with dedicated AI Brains.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-slate-700">
                  <p className="font-bold text-slate-900 text-xs">Locora Plan Business Allowances:</p>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <p className="text-slate-400 font-bold uppercase text-[9px]">Free</p>
                      <p className="font-extrabold text-slate-800 text-xs">1 Business</p>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                      <p className="text-emerald-700 font-bold uppercase text-[9px]">Pro</p>
                      <p className="font-extrabold text-emerald-900 text-xs">3 Businesses</p>
                    </div>
                    <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200">
                      <p className="text-indigo-700 font-bold uppercase text-[9px]">Agency Elite</p>
                      <p className="font-extrabold text-indigo-900 text-xs">10 Businesses</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLimitReachedModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLimitReachedModal(false);
                    const nextPlan = tier === 'free' ? 'pro' : 'agency';
                    setCheckoutModalPlan(nextPlan);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Upgrade Plan</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Add Business Modal (2-Step Unified Flow: Input -> Discovered Review & Confirm) */}
      {typeof document !== 'undefined' &&
        showAddBusinessModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex justify-center items-center font-sans animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isDiscovering && !isCreatingBusiness) {
                setShowAddBusinessModal(false);
                setIsAddBusinessModalOpen(false);
              }
            }}
          >
            <div
              className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-slate-200 animate-scaleUp font-sans my-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#059669] flex items-center justify-center font-bold shadow-2xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                        {addBusinessStep === 1 ? 'Add Business' : 'Confirm Business Details'}
                      </h3>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {businessLimitInfo.display}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {addBusinessStep === 1
                        ? 'Enter basic details to discover and set up your business profile & AI brain.'
                        : 'Review and verify discovered details before saving your business workspace.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBusinessModal(false);
                    setIsAddBusinessModalOpen(false);
                  }}
                  disabled={isDiscovering || isCreatingBusiness}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {addBusinessStep === 1 ? (
                /* Step 1: Input Business Details */
                <form onSubmit={handleDiscoverBusiness} className="pt-4 space-y-3.5">
                  {/* Highlighted Reviews Notice for Manual Business Entry */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-2xs flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-amber-950">Important Notice Regarding Google Reviews</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900">Required</span>
                      </div>
                      <p className="text-amber-800 text-[11px] leading-relaxed">
                        Google reviews and customer star ratings <strong>can only be pulled automatically when you connect your official Google Business Profile</strong>. If you enter or configure this business manually, reviews cannot be fetched from Google until your Google Business Profile is connected.
                      </p>
                      <p className="text-amber-700/90 text-[10px] font-medium">
                        (You can connect your Google account anytime after creating the workspace. Or upgrade your plan to connect review with out Google business profile or oauth required.)
                      </p>
                    </div>
                  </div>

                  {discoveryError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                      {discoveryError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newBizName}
                      onChange={(e) => setNewBizName(e.target.value)}
                      placeholder="e.g. Apex Dental, Austin Auto Repair, Summit Law"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Primary Category / Industry
                      </label>
                      <input
                        type="text"
                        value={newBizCategory}
                        onChange={(e) => setNewBizCategory(e.target.value)}
                        placeholder="e.g. Dentist, Plumber, Accountant"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Country *
                      </label>
                      <CountryAutocomplete
                        value={newBizCountry}
                        onChange={(c) => setNewBizCountry(c)}
                        placeholder="Select country..."
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={newBizCity}
                        onChange={(e) => setNewBizCity(e.target.value)}
                        placeholder="e.g. Austin"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State / Province & Zip
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newBizState}
                          onChange={(e) => setNewBizState(e.target.value)}
                          placeholder="TX"
                          className="w-1/2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                        />
                        <input
                          type="text"
                          value={newBizZip}
                          onChange={(e) => setNewBizZip(e.target.value)}
                          placeholder="78701"
                          className="w-1/2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <GoogleAddressAutocomplete
                      label="Street Address (Optional)"
                      placeholder="Search street address or enter manually..."
                      initialValue={newBizAddress}
                      value={newBizAddress}
                      onChange={(val) => setNewBizAddress(val)}
                      onSelectLocation={handleNewLocationSelectFromAutocomplete}
                      helperText="Helps pinpoint local Google Business Profile match"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Website (Optional)
                      </label>
                      <input
                        type="text"
                        value={newBizWebsite}
                        onChange={(e) => setNewBizWebsite(e.target.value)}
                        placeholder="e.g. yourbusiness.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={newBizPhone}
                        onChange={(e) => setNewBizPhone(e.target.value)}
                        placeholder="e.g. (512) 512-0199"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddBusinessModal(false)}
                      disabled={isDiscovering}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isDiscovering || !newBizName.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isDiscovering ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Discovering Business Data...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Continue to Review & Confirm</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Review & Confirm Discovered Details */
                <form onSubmit={handleConfirmAndCreateBusiness} className="pt-4 space-y-4">
                  {creationError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                      {creationError}
                    </div>
                  )}

                  {/* Discovered Summary Callout */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-900">Discovered Business Profile</span>
                        <p className="text-[11px] text-emerald-700">
                          Review and adjust any fields below. Saving sets up your Business Profile & AI Brain.
                        </p>
                      </div>
                    </div>
                    {gbpFoundStatus && (
                      <span className="shrink-0 px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-900 text-[10px] font-bold">
                        Google Verified
                      </span>
                    )}
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
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Category / Industry
                      </label>
                      <input
                        type="text"
                        value={confirmedCategory}
                        onChange={(e) => setConfirmedCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Website
                      </label>
                      <input
                        type="text"
                        value={confirmedWebsite}
                        onChange={(e) => setConfirmedWebsite(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={confirmedPhone}
                        onChange={(e) => setConfirmedPhone(e.target.value)}
                        placeholder="(512) 000-0000"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={confirmedAddress}
                        onChange={(e) => setConfirmedAddress(e.target.value)}
                        placeholder="Street Address"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                      />
                    </div>
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
                        State & Zip
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={confirmedState}
                          onChange={(e) => setConfirmedState(e.target.value)}
                          placeholder="State"
                          className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                        />
                        <input
                          type="text"
                          value={confirmedZip}
                          onChange={(e) => setConfirmedZip(e.target.value)}
                          placeholder="Zip"
                          className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Core Services
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {confirmedServices.map((service, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium"
                        >
                          {service}
                          <button
                            type="button"
                            onClick={() => setConfirmedServices(confirmedServices.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newServiceInput}
                        onChange={(e) => setNewServiceInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newServiceInput.trim()) {
                              setConfirmedServices([...confirmedServices, newServiceInput.trim()]);
                              setNewServiceInput('');
                            }
                          }
                        }}
                        placeholder="Add a service (press Enter)..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newServiceInput.trim()) {
                            setConfirmedServices([...confirmedServices, newServiceInput.trim()]);
                            setNewServiceInput('');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setAddBusinessStep(1)}
                      disabled={isCreatingBusiness}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      ← Back to Inputs
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingBusiness || !confirmedName.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isCreatingBusiness ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating Business Workspace...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Confirm & Create Business</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Add Location Modal with Google Autocomplete for address, city, state */}
      {typeof document !== 'undefined' &&
        showAddLocationModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex justify-center items-center font-sans animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddLocationModal(false);
            }}
          >
            <div
              className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 animate-scaleUp font-sans my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#059669] flex items-center justify-center font-bold shadow-2xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                      Add Location to {activeBusiness.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Google Places autocomplete enabled for address, city, and state
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddLocationModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLocation} className="pt-4 space-y-3.5">
                {/* Google Places Autocomplete Field */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                  <GoogleAddressAutocomplete
                    label="Search Address (Google Places Autocomplete)"
                    helperText="Select any address to auto-populate street, city, state & country"
                    onSelectLocation={handleLocationSelectFromAutocomplete}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLocName}
                    onChange={(e) => setNewLocName(e.target.value)}
                    placeholder="e.g. Downtown Office / West Location"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Physical Street Address
                  </label>
                  <input
                    type="text"
                    value={newLocAddress}
                    onChange={(e) => setNewLocAddress(e.target.value)}
                    placeholder="e.g. 4200 N Lamar Blvd, Suite 200"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                  />
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={newLocCity}
                      onChange={(e) => setNewLocCity(e.target.value)}
                      placeholder="Enter city..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={newLocState}
                      onChange={(e) => setNewLocState(e.target.value)}
                      placeholder="State / Province"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Country Autocomplete for Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Country
                  </label>
                  <CountryAutocomplete
                    value={newLocCountry}
                    onChange={(c) => setNewLocCountry(c)}
                    placeholder="Select country..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Postal / ZIP Code
                    </label>
                    <input
                      type="text"
                      value={newLocZip}
                      onChange={(e) => setNewLocZip(e.target.value)}
                      placeholder="e.g. 78756"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Location Phone Number
                    </label>
                    <input
                      type="text"
                      value={newLocPhone}
                      onChange={(e) => setNewLocPhone(e.target.value)}
                      placeholder="e.g. (512) 512-0244"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddLocationModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Save Location
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Edit / Customize Active Business Profile Modal */}
      {typeof document !== 'undefined' &&
        showEditBusinessModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex justify-center items-center font-sans animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowEditBusinessModal(false);
            }}
          >
            <div
              className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-slate-200 animate-scaleUp font-sans my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#059669] flex items-center justify-center font-bold shadow-2xs">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                      Set Up / Edit Business Profile
                    </h3>
                    <p className="text-xs text-slate-500">
                      Customize your company name and address for this workspace ({user.planTier.toUpperCase()} Plan)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditBusinessModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditBusiness} className="pt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editBizName}
                    onChange={(e) => setEditBizName(e.target.value)}
                    placeholder="e.g. Acme Services, Premier Consulting, Modern HVAC"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Industry / Primary Category
                    </label>
                    <input
                      type="text"
                      value={editBizCategory}
                      onChange={(e) => setEditBizCategory(e.target.value)}
                      placeholder="e.g. Professional Services, Roofing, Healthcare, Retail"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Market Country
                    </label>
                    <CountryAutocomplete
                      value={editBizCountry}
                      onChange={(c) => setEditBizCountry(c)}
                      placeholder="Select country..."
                    />
                  </div>
                </div>

                {/* Google Address Autocomplete */}
                <div>
                  <GoogleAddressAutocomplete
                    label="Business Street Address (Google Places Autocomplete)"
                    placeholder="Search and select street address..."
                    initialValue={editBizAddress}
                    value={editBizAddress}
                    onChange={(val) => setEditBizAddress(val)}
                    onSelectLocation={handleEditLocationSelectFromAutocomplete}
                    helperText="Select from Google Places to auto-populate City, State, and Zip"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editBizCity}
                      onChange={(e) => setEditBizCity(e.target.value)}
                      placeholder="Enter city..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      State / Province & Zip
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editBizState}
                        onChange={(e) => setEditBizState(e.target.value)}
                        placeholder="State"
                        className="w-1/2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                      />
                      <input
                        type="text"
                        value={editBizZip}
                        onChange={(e) => setEditBizZip(e.target.value)}
                        placeholder="78756"
                        className="w-1/2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={editBizWebsite}
                      onChange={(e) => setEditBizWebsite(e.target.value)}
                      placeholder="e.g. mybusiness.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editBizPhone}
                      onChange={(e) => setEditBizPhone(e.target.value)}
                      placeholder="e.g. (512) 512-0199"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEditBusinessModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save & Update Profile</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
