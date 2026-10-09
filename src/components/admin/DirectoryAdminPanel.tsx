import React, { useState, useEffect } from 'react';
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Shield,
  Sliders,
  Eye,
  EyeOff,
  Ban,
  BadgeCheck,
  ExternalLink,
  Search,
  Check,
  X,
  User,
  Trash2,
  Users,
  Building2,
} from 'lucide-react';

interface DirectorySettings {
  id: string;
  directoryEnabled: boolean;
  selfPublishingEnabled: boolean;
  minRequiredData: {
    name: boolean;
    category: boolean;
    city: boolean;
    country: boolean;
    contactInfo: boolean;
  };
  allowedCountries: string[];
  duplicateDetectionEnabled: boolean;
  allowDiscoveredUnclaimed: boolean;
  requireAdminApproval: boolean;
  updatedAt: string;
}

interface LinkedUser {
  name: string | null;
  email: string;
  role: string;
  companyName: string | null;
  planTier: string;
  createdAt: string | null;
}

interface DirectoryProfileAdminRow {
  id: string;
  businessId: string;
  businessName: string;
  ownerEmail: string;
  linkedUser?: LinkedUser;
  status: string; // 'PUBLISHED' | 'SUSPENDED' | 'UNPUBLISHED' | 'VERIFIED'
  slug: string;
  publishedAt: string | null;
  lastSyncedAt: string;
  qualityScore: number;
  qualityStatus: 'basic' | 'good' | 'complete' | 'verified';
  isClaimed: boolean;
  isVerified: boolean;
  cityName: string;
  category: string;
  isPublishedInDirectory: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const DirectoryAdminPanel: React.FC = () => {
  const [settings, setSettings] = useState<DirectorySettings | null>(null);
  const [profiles, setProfiles] = useState<DirectoryProfileAdminRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [newCountryInput, setNewCountryInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'published' | 'suspended' | 'unpublished' | 'verified'>('all');
  const [listingToDelete, setListingToDelete] = useState<DirectoryProfileAdminRow | null>(null);

  const fetchDirectoryData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [settingsRes, profilesRes] = await Promise.all([
        fetch('/api/admin/directory/settings'),
        fetch('/api/admin/directory/profiles'),
      ]);

      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        if (sData.settings) setSettings(sData.settings);
      }

      if (profilesRes.ok) {
        const pData = await profilesRes.json();
        if (pData.profiles) setProfiles(pData.profiles);
      }
    } catch (err: any) {
      console.error('Error loading directory admin data:', err);
      setErrorMsg(err.message || 'Failed to fetch directory administration data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectoryData();
  }, []);

  const handleSaveSettings = async (updatedSettings: Partial<DirectorySettings>) => {
    if (!settings) return;
    setSaving(true);
    setActionSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/directory/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setActionSuccessMsg('Global Directory Rules updated successfully!');
        setTimeout(() => setActionSuccessMsg(null), 4000);
      } else {
        setErrorMsg(data.error || 'Failed to update directory settings.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCountry = () => {
    if (!settings || !newCountryInput.trim()) return;
    const country = newCountryInput.trim();
    if (settings.allowedCountries.includes(country)) return;
    const updated = [...settings.allowedCountries, country];
    setSettings({ ...settings, allowedCountries: updated });
    handleSaveSettings({ allowedCountries: updated });
    setNewCountryInput('');
  };

  const handleRemoveCountry = (countryToRemove: string) => {
    if (!settings) return;
    const updated = settings.allowedCountries.filter((c) => c !== countryToRemove);
    setSettings({ ...settings, allowedCountries: updated });
    handleSaveSettings({ allowedCountries: updated });
  };

  const handleModerateProfile = async (
    businessId: string,
    action: 'suspend' | 'restore' | 'publish' | 'unpublish' | 'hide' | 'verify' | 'unverify' | 'remove' | 'delete'
  ) => {
    setModeratingId(businessId);
    setActionSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/directory/profiles/${businessId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        const actionLabels: Record<string, string> = {
          suspend: 'Business listing suspended and removed from directory.',
          restore: 'Business listing restored and published to directory.',
          publish: 'Business listing published live to directory.',
          unpublish: 'Business listing hidden from directory.',
          verify: 'Business listing marked as Verified.',
          unverify: 'Business listing unverified.',
          remove: 'Business listing permanently removed from directory.',
          delete: 'Business listing permanently removed from directory.',
        };
        setActionSuccessMsg(actionLabels[action] || `Action '${action}' applied successfully.`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
        await fetchDirectoryData();
      } else {
        setErrorMsg(data.error || 'Failed to moderate profile.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error moderating profile.');
    } finally {
      setModeratingId(null);
      setListingToDelete(null);
    }
  };

  // KPI counts
  const totalBusinessesCount = profiles.length;
  const livePublishedCount = profiles.filter((p) => p.isPublishedInDirectory && p.status !== 'SUSPENDED').length;
  const suspendedCount = profiles.filter((p) => p.status === 'SUSPENDED').length;
  const unpublishedCount = profiles.filter((p) => !p.isPublishedInDirectory && p.status !== 'SUSPENDED').length;
  const verifiedCount = profiles.filter((p) => p.isVerified || p.status === 'VERIFIED').length;

  const filteredProfiles = profiles.filter((p) => {
    // 1. Status Tab filter
    if (activeFilterTab === 'published' && (!p.isPublishedInDirectory || p.status === 'SUSPENDED')) return false;
    if (activeFilterTab === 'suspended' && p.status !== 'SUSPENDED') return false;
    if (activeFilterTab === 'unpublished' && (p.isPublishedInDirectory || p.status === 'SUSPENDED')) return false;
    if (activeFilterTab === 'verified' && !p.isVerified && p.status !== 'VERIFIED') return false;

    // 2. Search query filter
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.businessName || '').toLowerCase().includes(q) ||
      (p.ownerEmail || '').toLowerCase().includes(q) ||
      (p.linkedUser?.name || '').toLowerCase().includes(q) ||
      (p.linkedUser?.companyName || '').toLowerCase().includes(q) ||
      (p.cityName || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.slug || '').toLowerCase().includes(q) ||
      (p.status || '').toLowerCase().includes(q)
    );
  });

  if (loading && !settings) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
        <p className="text-xs font-semibold text-slate-500">Loading Directory Administration Controls...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Feedback Messages */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Directory Administration & Business Controls
              </h2>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Full authority over public directory listings, user provenance, suspension, and verification.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDirectoryData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
          <a
            href="/directory"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View Public Directory</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* KPI Cards: Total, Live, Suspended, Unpublished */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Listings</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-heading text-slate-900">{totalBusinessesCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">All registered businesses</p>
        </div>

        <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Live in Directory</span>
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-emerald-800">{livePublishedCount}</div>
          <p className="text-[11px] text-emerald-600 mt-0.5">Actively visible to public</p>
        </div>

        <div className="p-4 bg-rose-50/50 border border-rose-200/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Suspended</span>
            <Ban className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-rose-800">{suspendedCount}</div>
          <p className="text-[11px] text-rose-600 mt-0.5">Blocked from public view</p>
        </div>

        <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Hidden / Draft</span>
            <EyeOff className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-heading text-slate-700">{unpublishedCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">{verifiedCount} officially verified</p>
        </div>
      </div>

      {/* Section 1: Global Directory Rules & Master Switches */}
      {settings && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Directory Automation & Security Switches
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Master Toggle */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Public Directory Engine</span>
                <span className="text-[11px] text-slate-500">Enable/disable entire /directory module</span>
              </div>
              <button
                type="button"
                onClick={() => handleSaveSettings({ directoryEnabled: !settings.directoryEnabled })}
                disabled={saving}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.directoryEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    settings.directoryEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Self-Publishing */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Self-Publishing Allowed</span>
                <span className="text-[11px] text-slate-500">Business owners can publish directly</span>
              </div>
              <button
                type="button"
                onClick={() => handleSaveSettings({ selfPublishingEnabled: !settings.selfPublishingEnabled })}
                disabled={saving}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.selfPublishingEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    settings.selfPublishingEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Require Admin Approval */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Admin Approval Required</span>
                <span className="text-[11px] text-slate-500">Listings hold in draft until approved</span>
              </div>
              <button
                type="button"
                onClick={() => handleSaveSettings({ requireAdminApproval: !settings.requireAdminApproval })}
                disabled={saving}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.requireAdminApproval ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    settings.requireAdminApproval ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Directory Profiles Moderation Table with Linked User Provenance */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        {/* Table Header and Search */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Directory Listings & User Provenance Controls
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Every business registered in the platform, the linked user who created it, and instant show/hide/suspend controls.
            </p>
          </div>

          <div className="w-full md:w-72">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search business, linked user, email, city..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-5 pt-3 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilterTab === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>All Listings</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">{totalBusinessesCount}</span>
          </button>

          <button
            onClick={() => setActiveFilterTab('published')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilterTab === 'published'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span>Live in Directory</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-800/30 text-[10px]">{livePublishedCount}</span>
          </button>

          <button
            onClick={() => setActiveFilterTab('suspended')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilterTab === 'suspended'
                ? 'bg-rose-600 text-white font-bold'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span>Suspended</span>
            <span className="px-1.5 py-0.2 rounded-md bg-rose-800/30 text-[10px]">{suspendedCount}</span>
          </button>

          <button
            onClick={() => setActiveFilterTab('unpublished')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilterTab === 'unpublished'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Hidden / Draft</span>
            <span className="px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700 text-[10px]">{unpublishedCount}</span>
          </button>

          <button
            onClick={() => setActiveFilterTab('verified')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilterTab === 'verified'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <span>Verified</span>
            <span className="px-1.5 py-0.2 rounded-md bg-blue-800/30 text-[10px]">{verifiedCount}</span>
          </button>
        </div>

        {/* Profiles Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Business Listing</th>
                <th className="py-3 px-4">Linked User / Creator</th>
                <th className="py-3 px-4">City / Category</th>
                <th className="py-3 px-4">Directory Status</th>
                <th className="py-3 px-4">Public URL</th>
                <th className="py-3 px-4 text-right">Admin Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs font-semibold">
                    No business listings matching selected filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => {
                  const isSuspended = p.status === 'SUSPENDED';
                  const isVerified = Boolean(p.isVerified || p.status === 'VERIFIED');
                  const isPublishedLive = Boolean(p.isPublishedInDirectory && !isSuspended && p.status !== 'UNPUBLISHED');
                  const publicUrl = `https://directory.locoraai.com/biz/${p.slug || p.businessId}`;
                  const isBusy = moderatingId === p.businessId;

                  const linkedUser = p.linkedUser;
                  const userNameDisplay = linkedUser?.name || linkedUser?.companyName || (p.ownerEmail ? p.ownerEmail.split('@')[0] : 'Unassigned User');
                  const userRole = linkedUser?.role || 'customer';
                  const userPlan = (linkedUser?.planTier || 'free').toUpperCase();

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Business Column */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs">{p.businessName || 'Unnamed Business'}</span>
                          {isVerified && (
                            <span title="Verified Business Badge">
                              <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                          ID: <span className="font-mono text-[10px] text-slate-500">{p.businessId}</span>
                        </div>
                      </td>

                      {/* Linked User / Creator Column */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <User className="w-3 h-3" />
                          </div>
                          <span className="font-bold text-slate-900 text-xs">{userNameDisplay}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5 pl-6 flex items-center gap-1.5">
                          <span>{p.ownerEmail || linkedUser?.email || 'No email attached'}</span>
                        </div>
                        <div className="mt-1 pl-6 flex items-center gap-1.5">
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                            userPlan === 'AGENCY' || userPlan === 'ELITE'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : userPlan === 'PRO'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {userPlan}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400 uppercase">
                            {userRole}
                          </span>
                        </div>
                      </td>

                      {/* City / Category */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-medium text-slate-800">{p.cityName || '—'}</div>
                        <div className="text-[11px] text-slate-400">{p.category || 'Local Business'}</div>
                      </td>

                      {/* Directory Status Badge */}
                      <td className="py-3.5 px-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                            <Ban className="w-3 h-3" />
                            <span>SUSPENDED</span>
                          </span>
                        ) : isPublishedLive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            <span>LIVE IN DIRECTORY</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                            <EyeOff className="w-3 h-3" />
                            <span>HIDDEN / DRAFT</span>
                          </span>
                        )}
                      </td>

                      {/* Public URL Slug */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {isSuspended ? (
                          <span className="text-slate-400 line-through" title="Listing suspended - public link disabled">
                            /biz/{p.slug || p.businessId}
                          </span>
                        ) : (
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-900 underline inline-flex items-center gap-1"
                          >
                            <span>/biz/{p.slug || p.businessId}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        )}
                      </td>

                      {/* Action Controls: Show/Hide, Suspend/Restore, Verify/Unverify, Remove */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Show or Hide Toggle */}
                          {isSuspended ? (
                            <button
                              type="button"
                              onClick={() => handleModerateProfile(p.businessId, 'restore')}
                              disabled={isBusy}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Restore and make listing live in directory"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Restore</span>
                            </button>
                          ) : isPublishedLive ? (
                            <button
                              type="button"
                              onClick={() => handleModerateProfile(p.businessId, 'unpublish')}
                              disabled={isBusy}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                              title="Hide listing from public directory without suspending account"
                            >
                              <EyeOff className="w-3 h-3 text-slate-500" />
                              <span>Hide</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleModerateProfile(p.businessId, 'publish')}
                              disabled={isBusy}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="Show listing live in public directory"
                            >
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>Show in Directory</span>
                            </button>
                          )}

                          {/* Suspend Button (if not suspended) */}
                          {!isSuspended && (
                            <button
                              type="button"
                              onClick={() => handleModerateProfile(p.businessId, 'suspend')}
                              disabled={isBusy}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="Suspend and strictly block business from directory"
                            >
                              <Ban className="w-3 h-3 text-rose-600" />
                              <span>Suspend</span>
                            </button>
                          )}

                          {/* Verify / Unverify Badge Toggle */}
                          {isVerified ? (
                            <button
                              type="button"
                              onClick={() => handleModerateProfile(p.businessId, 'unverify')}
                              disabled={isBusy}
                              className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                              title="Remove verified badge"
                            >
                              Unverify
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleModerateProfile(p.businessId, 'verify')}
                              disabled={isBusy}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="Grant verified checkmark badge"
                            >
                              <BadgeCheck className="w-3 h-3 text-blue-600" />
                              <span>Verify</span>
                            </button>
                          )}

                          {/* Remove from directory button */}
                          <button
                            type="button"
                            onClick={() => setListingToDelete(p)}
                            disabled={isBusy}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Remove listing from directory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Removing Listing */}
      {listingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Remove Listing from Directory?
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-1">
                Are you sure you want to remove <strong className="text-slate-800">"{listingToDelete.businessName}"</strong> from the public directory? It will be delisted immediately.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="text-slate-500">Linked User: <strong className="text-slate-800">{listingToDelete.ownerEmail}</strong></div>
              <div className="text-slate-500">Business ID: <span className="font-mono text-slate-700">{listingToDelete.businessId}</span></div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setListingToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleModerateProfile(listingToDelete.businessId, 'remove')}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
