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
  } = useApp();

  const displayName = businessTruth?.name ?? activeBusiness?.name ?? 'Business Workspace';
  const displayCategory = businessTruth?.category ?? activeBusiness?.category ?? null;
  const primaryLoc = businessTruth?.locations?.find((l) => l.isPrimary) || businessTruth?.locations?.[0];
  const displayCity = primaryLoc?.city ?? activeBusiness?.city ?? null;
  const displayState = primaryLoc?.state ?? activeBusiness?.state ?? null;
  const displayLocationName = primaryLoc?.name ?? activeBusiness?.locationName ?? 'Main Location';

  const [isOpen, setIsOpen] = useState(false);
  const [showAddBusinessModal, setShowAddBusinessModal] = useState(false);
  const [showEditBusinessModal, setShowEditBusinessModal] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [showAgencyUpgradeModal, setShowAgencyUpgradeModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const isAgency = user.planTier === 'agency';

  const handleCreateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;

    addBusiness({
      name: newBizName.trim(),
      category: newBizCategory.trim() || 'Local Business',
      address: newBizAddress.trim() || '',
      city: newBizCity.trim() || '',
      state: newBizState.trim() || '',
      country: newBizCountry.trim() || 'United States',
      zip: newBizZip.trim() || '',
      phone: newBizPhone.trim() || '',
      website: newBizWebsite.trim() || '',
    });

    logActivity('business_created', 'New Business Workspace Created', `Added business workspace for ${newBizName.trim()}`);

    setNewBizName('');
    setNewBizCategory('');
    setNewBizCity('');
    setNewBizState('');
    setNewBizAddress('');
    setNewBizZip('');
    setNewBizPhone('');
    setNewBizCountry('United States');
    setNewBizWebsite('');
    setShowAddBusinessModal(false);
    setIsOpen(false);
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
      setNewLocName(`${loc.city || 'Branch'} Clinic`);
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
                  <span className="text-[9px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                    1 Included ({user.planTier.toUpperCase()})
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Health: {activeBusiness.healthScore}/100
                </span>
              </div>
              <div className="flex items-center justify-between pt-1.5 gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 font-heading truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {displayCategory || 'Local Business'} {displayCity ? `• ${displayCity}${displayState ? `, ${displayState}` : ''}` : ''}
                  </p>
                  {businessTruth && (
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
              <button
                onClick={() => {
                  openEditBusiness();
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] font-bold text-[11px] transition-colors cursor-pointer border border-emerald-200"
                title="Customize this business profile with your real name & address"
              >
                <Pencil className="w-3 h-3 text-[#059669]" />
                <span>Edit Info</span>
              </button>
              <button
                onClick={() => {
                  setShowAddLocationModal(true);
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
                title="Add a physical branch or location"
              >
                <Plus className="w-3 h-3 text-slate-500" />
                <span>Add Branch</span>
              </button>
            </div>

            {/* Locations of this business */}
            <div className="p-2 border-b border-slate-100">
              <div className="flex items-center justify-between px-2 pb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                  Locations / Branches ({activeBusiness.locations?.length || 1})
                </span>
                <span className="text-[10px] text-slate-400">
                  {activeBusiness.locations?.length ? 'Multi-Branch' : 'Single Location'}
                </span>
              </div>

              <div className="space-y-1">
                {(activeBusiness.locations || [
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
                ))}
              </div>
            </div>

            {/* Multi-Client / Agency Portfolio Switcher */}
            <div className="p-2">
              <div className="flex items-center justify-between px-2 pb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                  {isAgency ? 'Client Workspaces' : 'Your Business'} ({businesses.length})
                </span>
                {isAgency ? (
                  <button
                    onClick={() => {
                      setActiveTab('clients');
                      setIsOpen(false);
                    }}
                    className="text-[10px] font-bold text-[#059669] hover:underline cursor-pointer"
                  >
                    Manage All
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowAgencyUpgradeModal(true);
                      setIsOpen(false);
                    }}
                    className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Lock className="w-2.5 h-2.5" />
                    <span>Agency Mode</span>
                  </button>
                )}
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto">
                {businesses.map((biz) => (
                  <button
                    key={biz.id}
                    onClick={() => handleSelectBusiness(biz.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      biz.id === activeBusinessId
                        ? 'bg-emerald-50 text-[#059669] font-bold'
                        : 'hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs truncate">{biz.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {biz.category} • {biz.city}
                      </p>
                    </div>
                    {biz.id === activeBusinessId && (
                      <Check className="w-4 h-4 text-[#059669] shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Add Client / Business Action */}
              <div className="pt-2 px-0.5 space-y-1.5">
                <button
                  type="button"
                  id="top-selector-onboard-business-btn"
                  onClick={() => {
                    setOnboardingModalOpen(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+ Run Business Onboarding Flow</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBusinessModal(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer border border-slate-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manual Business Entry</span>
                </button>
                {!isAgency && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAgencyUpgradeModal(true);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg text-amber-700 hover:text-amber-800 hover:bg-amber-50 text-[11px] font-semibold transition-colors cursor-pointer"
                    title="Agency Elite ($99/mo) lets you manage 10+ independent client businesses"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Manage 10+ Client Portfolios (Agency $99)</span>
                  </button>
                )}
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

      {/* Add Business Modal with Target Market Country Autocomplete */}
      {typeof document !== 'undefined' &&
        showAddBusinessModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex justify-center items-center font-sans animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddBusinessModal(false);
            }}
          >
            <div
              className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 animate-scaleUp font-sans my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#059669] flex items-center justify-center font-bold shadow-2xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                      Add New Business Workspace
                    </h3>
                    <p className="text-xs text-slate-500">
                      Create an isolated business workspace with dedicated AI Brain & rank tracker
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddBusinessModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBusiness} className="pt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBizName}
                    onChange={(e) => setNewBizName(e.target.value)}
                    placeholder="e.g. Apex Digital Solutions, Summit Law, Metro Plumbing"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Primary Industry / Category
                    </label>
                    <input
                      type="text"
                      value={newBizCategory}
                      onChange={(e) => setNewBizCategory(e.target.value)}
                      placeholder="e.g. Professional Services, Roofing, Auto, Retail"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Market (Country) *
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
                        value={newBizState}
                        onChange={(e) => setNewBizState(e.target.value)}
                        placeholder="State"
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
                    helperText="Select from autocomplete to auto-populate City, State, and Zip"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={newBizWebsite}
                      onChange={(e) => setNewBizWebsite(e.target.value)}
                      placeholder="e.g. acmebusiness.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={newBizPhone}
                      onChange={(e) => setNewBizPhone(e.target.value)}
                      placeholder="e.g. (512) 555-0100"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddBusinessModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Business Workspace</span>
                  </button>
                </div>
              </form>
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
                    Location / Branch Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLocName}
                    onChange={(e) => setNewLocName(e.target.value)}
                    placeholder="e.g. Downtown Branch / West Location"
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
                      Branch Phone Number
                    </label>
                    <input
                      type="text"
                      value={newLocPhone}
                      onChange={(e) => setNewLocPhone(e.target.value)}
                      placeholder="e.g. (512) 555-0244"
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
                      placeholder="e.g. (512) 555-0199"
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
