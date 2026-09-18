import React, { useState, useEffect } from 'react';
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Shield,
  Sliders,
  Eye,
  Ban,
  BadgeCheck,
  ExternalLink,
  Search,
  Check,
  X,
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

interface DirectoryProfileAdminRow {
  id: string;
  businessId: string;
  businessName: string;
  ownerEmail: string;
  status: string;
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

  const handleModerateProfile = async (businessId: string, action: 'suspend' | 'restore' | 'verify' | 'unverify') => {
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
        setActionSuccessMsg(`Profile action '${action}' applied successfully.`);
        setTimeout(() => setActionSuccessMsg(null), 3000);
        await fetchDirectoryData();
      } else {
        setErrorMsg(data.error || 'Failed to moderate profile.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error moderating profile.');
    } finally {
      setModeratingId(null);
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.businessName || '').toLowerCase().includes(q) ||
      (p.ownerEmail || '').toLowerCase().includes(q) ||
      (p.cityName || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
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
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Globe className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-heading">
                  Locora Business Directory — Global Rule Engine & Moderation
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Configure directory-wide eligibility criteria, country enforcement, auto-publishing limits, and listing moderation.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDirectoryData}
              disabled={loading}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <a
              href="https://directory.locoraai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Visit Directory</span>
            </a>
          </div>
        </div>

        {actionSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {settings && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Core System Flags */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 font-heading">Core Directory Governance</h3>
            </div>

            <div className="space-y-4">
              {/* Directory Global Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-900">Locora Business Directory Enabled</div>
                  <div className="text-[11px] text-slate-500">Master switch. If disabled, public directory returns offline page.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.directoryEnabled}
                    onChange={(e) => handleSaveSettings({ directoryEnabled: e.target.checked })}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Owner Self-Publishing */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-900">Owner Self-Publishing</div>
                  <div className="text-[11px] text-slate-500">Allows business owners to toggle ON publishing from their dashboard.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.selfPublishingEnabled}
                    onChange={(e) => handleSaveSettings({ selfPublishingEnabled: e.target.checked })}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Duplicate Detection */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-900">Duplicate Profile Detection</div>
                  <div className="text-[11px] text-slate-500">Blocks publishing if an identical business name + city/phone already exists.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.duplicateDetectionEnabled}
                    onChange={(e) => handleSaveSettings({ duplicateDetectionEnabled: e.target.checked })}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Discovered Unclaimed Listings */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-900">Show Discovered / Unclaimed Businesses</div>
                  <div className="text-[11px] text-slate-500">Whether seeded public discovery listings may appear before being claimed by an owner.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowDiscoveredUnclaimed}
                    onChange={(e) => handleSaveSettings({ allowDiscoveredUnclaimed: e.target.checked })}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Minimum Required Data & Region Limits */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Shield className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 font-heading">Eligibility Requirements & Regions</h3>
            </div>

            {/* Minimum Required Fields */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Mandatory Fields Required Before Business Can Publish
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'name', label: 'Business Name' },
                  { key: 'category', label: 'Category / Service' },
                  { key: 'city', label: 'Primary City' },
                  { key: 'country', label: 'Country / Region' },
                  { key: 'contactInfo', label: 'Phone or Website' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs font-semibold text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={settings.minRequiredData[item.key as keyof typeof settings.minRequiredData]}
                      onChange={(e) => {
                        const updatedMin = {
                          ...settings.minRequiredData,
                          [item.key]: e.target.checked,
                        };
                        setSettings({ ...settings, minRequiredData: updatedMin });
                        handleSaveSettings({ minRequiredData: updatedMin });
                      }}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Allowed Countries */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Allowed Operating Countries & Regions
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {settings.allowedCountries.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCountry(c)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCountryInput}
                  onChange={(e) => setNewCountryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCountry())}
                  placeholder="Add country (e.g. Germany, UK)..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleAddCountry}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Directory Profiles Moderation Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Published Directory Listings & Moderation ({filteredProfiles.length})
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Review live listings, quality scores, verified badges, and moderate suspended profiles.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search business, email, city..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Business</th>
                <th className="py-3 px-4">City / Category</th>
                <th className="py-3 px-4">Quality Status</th>
                <th className="py-3 px-4">Directory Status</th>
                <th className="py-3 px-4">URL Slug</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-semibold">
                    No directory profiles matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => {
                  const isSuspended = p.status === 'SUSPENDED';
                  const isVerified = p.isVerified || p.status === 'VERIFIED';
                  const publicUrl = `https://directory.locoraai.com/biz/${p.slug || p.businessId}`;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{p.businessName || 'Unnamed Business'}</span>
                          {isVerified && <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">{p.ownerEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{p.cityName || 'City not set'}</div>
                        <div className="text-[11px] text-slate-400">{p.category || 'General'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">{p.qualityScore}%</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                              p.qualityStatus === 'verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.qualityStatus === 'complete'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.qualityStatus}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            isSuspended
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : p.status === 'PUBLISHED' || p.status === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-emerald-700 underline inline-flex items-center gap-1"
                        >
                          <span>/biz/{p.slug || p.businessId}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isSuspended ? (
                            <button
                              type="button"
                              onClick={() => handleModerateProfile(p.businessId, 'restore')}
                              disabled={moderatingId === p.businessId}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleModerateProfile(p.businessId, 'suspend')}
                              disabled={moderatingId === p.businessId}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Suspend</span>
                            </button>
                          )}

                          {isVerified ? (
                            <button
                              type="button"
                              onClick={() => handleModerateProfile(p.businessId, 'unverify')}
                              disabled={moderatingId === p.businessId}
                              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              Unverify
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleModerateProfile(p.businessId, 'verify')}
                              disabled={moderatingId === p.businessId}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <BadgeCheck className="w-3 h-3" />
                              <span>Verify</span>
                            </button>
                          )}
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
    </div>
  );
};
