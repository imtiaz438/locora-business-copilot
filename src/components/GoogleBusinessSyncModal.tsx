import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Star,
  Globe,
  Phone,
  RefreshCw,
  Building2,
  Sliders,
  Check,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface GoogleBusinessSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlaceSearchResult {
  placeId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip?: string;
  formattedAddress: string;
  rating: number;
  reviewCount: number;
  primaryType: string;
  phone?: string;
  website?: string;
  source: string;
}

const COMMON_COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'United Arab Emirates',
  'Pakistan',
  'India',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
  'Singapore',
  'South Africa',
  'New Zealand',
  'Ireland',
  'Saudi Arabia',
];

export const GoogleBusinessSyncModal: React.FC<GoogleBusinessSyncModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeBusiness,
    syncGoogleBusinessProfile,
    businessProfile,
    updateBusinessProfile,
    logActivity,
    user,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'search' | 'manual'>('search');

  // Search tab states
  const [searchQuery, setSearchQuery] = useState(
    activeBusiness.name && activeBusiness.name !== 'My Business Workspace' && activeBusiness.name !== 'Demo Growth Workspace'
      ? `${activeBusiness.name}${activeBusiness.city ? `, ${activeBusiness.city}` : ''}`
      : ''
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);

  // Syncing state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Manual Profile Fields setup states
  const [manualName, setManualName] = useState(
    activeBusiness.name !== 'Demo Growth Workspace' ? activeBusiness.name : ''
  );
  const [manualCountry, setManualCountry] = useState(
    activeBusiness.country || businessProfile.country || 'United States'
  );
  const [manualCity, setManualCity] = useState(
    activeBusiness.city || businessProfile.city || ''
  );
  const [manualState, setManualState] = useState(
    activeBusiness.state || businessProfile.state || ''
  );
  const [manualAddress, setManualAddress] = useState(
    activeBusiness.address || businessProfile.address || ''
  );
  const [manualZip, setManualZip] = useState(
    activeBusiness.zip || businessProfile.zip || ''
  );
  const [manualCategory, setManualCategory] = useState(
    activeBusiness.category || businessProfile.industry || 'Local Business'
  );
  const [manualPhone, setManualPhone] = useState(
    activeBusiness.phone || businessProfile.phone || ''
  );
  const [manualWebsite, setManualWebsite] = useState(
    activeBusiness.website || businessProfile.website || ''
  );
  const [manualServices, setManualServices] = useState<string>(
    (activeBusiness.services && activeBusiness.services.length > 0)
      ? activeBusiness.services.join(', ')
      : 'Core Service, Consultations, Support'
  );
  const [manualAudience, setManualAudience] = useState(
    businessProfile.targetAudience || 'Local clients and residents'
  );
  const [manualTone, setManualTone] = useState(
    businessProfile.toneOfVoice || 'Professional, Trustworthy & Direct'
  );

  if (!isOpen) return null;

  const handleSearchPlaces = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSelectedPlace(null);

    try {
      const res = await fetch(`/api/places/search-live?query=${encodeURIComponent(searchQuery.trim())}`);
      if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        setSearchResults(data.results);
        if (data.results.length === 1) {
          setSelectedPlace(data.results[0]);
        }
      } else {
        setSearchResults([]);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setSearchError(err.message || 'Unable to connect to Google Places. Please enter details manually.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSyncSelectedPlace = async (place: PlaceSearchResult) => {
    setIsSyncing(true);
    setSyncSuccess(false);

    try {
      // If place details can be fetched
      let detailedPhone = place.phone;
      let detailedWebsite = place.website;
      let detailedReviews: any[] = [];
      let detailedHours: string[] = [];

      if (place.placeId && !place.placeId.startsWith('direct_')) {
        try {
          const detRes = await fetch(`/api/places/details?place_id=${encodeURIComponent(place.placeId)}`);
          if (detRes.ok) {
            const detData = await detRes.json();
            if (detData) {
              if (detData.phone) detailedPhone = detData.phone;
              if (detData.website) detailedWebsite = detData.website;
              if (detData.reviews) detailedReviews = detData.reviews;
              if (detData.businessHours) detailedHours = detData.businessHours;
            }
          }
        } catch (dErr) {
          console.warn('Place details fetch failed:', dErr);
        }
      }

      const syncPayload = {
        userEmail: user?.email || '',
        businessId: activeBusiness.id,
        name: place.name,
        placeId: place.placeId,
        address: place.address || place.formattedAddress,
        city: place.city,
        state: place.state,
        country: place.country || 'United States',
        zip: place.zip || '',
        phone: detailedPhone || '',
        website: detailedWebsite || '',
        category: place.primaryType || 'Local Business',
        rating: place.rating || 0,
        reviewCount: place.reviewCount || 0,
        unansweredReviews: detailedReviews.filter((r: any) => !r.replyText && !r.isAnswered).length,
        businessHours: detailedHours,
        reviews: detailedReviews,
        services: [place.primaryType || 'Core Service'],
      };

      const res = await fetch('/api/gbp/sync-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(syncPayload),
      });

      if (!res.ok) throw new Error('Failed to save to database');
      const responseData = await res.json();

      // Update global application context state
      syncGoogleBusinessProfile(responseData.business || syncPayload);

      updateBusinessProfile({
        name: place.name,
        city: place.city,
        state: place.state,
        country: place.country || 'United States',
        address: place.address || place.formattedAddress,
        phone: detailedPhone || '',
        website: detailedWebsite || '',
        industry: place.primaryType || 'Local Business',
        services: [place.primaryType || 'Core Service'],
      });

      logActivity('integrations', 'Google Business Profile Synced', `Successfully linked live profile for ${place.name} in ${place.city || 'local area'}`);
      setSyncSuccess(true);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(`Sync failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveManualProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) {
      alert('Please enter your business name.');
      return;
    }

    setIsSyncing(true);

    const parsedServices = manualServices
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const manualPayload = {
      userEmail: user?.email || '',
      businessId: activeBusiness.id,
      name: manualName.trim(),
      city: manualCity.trim(),
      state: manualState.trim(),
      country: manualCountry.trim() || 'United States',
      address: manualAddress.trim(),
      zip: manualZip.trim(),
      phone: manualPhone.trim(),
      website: manualWebsite.trim(),
      category: manualCategory.trim() || 'Local Business',
      rating: activeBusiness.googleRating || 0,
      reviewCount: activeBusiness.reviewCount || 0,
      unansweredReviews: 0,
      services: parsedServices.length > 0 ? parsedServices : [manualCategory.trim()],
    };

    try {
      const res = await fetch('/api/gbp/sync-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualPayload),
      });

      if (!res.ok) throw new Error('Failed to save business profile');
      const responseData = await res.json();

      syncGoogleBusinessProfile(responseData.business || manualPayload);

      updateBusinessProfile({
        name: manualName.trim(),
        city: manualCity.trim(),
        state: manualState.trim(),
        country: manualCountry.trim() || 'United States',
        address: manualAddress.trim(),
        zip: manualZip.trim(),
        phone: manualPhone.trim(),
        website: manualWebsite.trim(),
        industry: manualCategory.trim(),
        services: parsedServices,
        targetAudience: manualAudience.trim(),
        toneOfVoice: manualTone.trim(),
      });

      logActivity('settings', 'Profile Fields Updated', `Updated core business profile for ${manualName.trim()} in ${manualCity.trim() || 'local area'}`);
      setSyncSuccess(true);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(`Save failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#059669]/10 border border-[#059669]/20 flex items-center justify-center text-[#059669] shrink-0">
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-heading text-slate-900">
                  Google Business Profile Sync & Setup
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  Live Operations
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Directly sync verified business data, reviews, and address into your workspace database.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-100/60 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'search'
                ? 'border-[#059669] text-[#059669]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search & Sync from Google</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'manual'
                ? 'border-[#059669] text-[#059669]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Custom Profile Fields (Country, City, Services)</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {syncSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce shadow-sm">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold font-heading text-slate-900">
                  Data Successfully Synced & Stored!
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm">
                  Your business profile, reviews, geographic rankings, and services have been saved to the database. All dashboard modules are now live.
                </p>
              </div>
            </div>
          ) : activeTab === 'search' ? (
            <div className="space-y-5">
              {/* Search form */}
              <form onSubmit={handleSearchPlaces} className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Search Your Google Business Profile
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Apex Auto Repair Chicago, or Acme Legal London..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669] bg-white shadow-2xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSearching ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Find Business</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Tip: Include your business name and city/state for the most accurate Google Places match.
                </p>
              </form>

              {searchError && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{searchError}</span>
                </div>
              )}

              {/* Search Results */}
              <div className="space-y-3">
                {searchResults.length > 0 && (
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading block">
                    Found Profiles ({searchResults.length}):
                  </span>
                )}

                <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                  {searchResults.map((result) => {
                    const isSelected = selectedPlace?.placeId === result.placeId;
                    return (
                      <div
                        key={result.placeId}
                        onClick={() => setSelectedPlace(result)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/70 border-[#059669] shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900 font-heading">
                                {result.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                                {result.primaryType}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{result.formattedAddress}</span>
                            </p>

                            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                              {result.rating > 0 ? (
                                <span className="flex items-center gap-1 text-amber-700 font-bold">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  <span>{result.rating.toFixed(1)}</span>
                                  <span className="text-slate-400 font-normal">
                                    ({result.reviewCount} Google reviews)
                                  </span>
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">
                                  Google Listing Ready
                                </span>
                              )}

                              {result.country && (
                                <span className="text-[11px] font-mono text-slate-400">
                                  {result.country}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSyncSelectedPlace(result);
                            }}
                            disabled={isSyncing}
                            className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isSyncing && isSelected ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Syncing...</span>
                              </>
                            ) : (
                              <>
                                <span>Sync to Workspace</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {searchResults.length === 0 && !isSearching && (
                  <div className="py-10 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-6 space-y-2">
                    <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      Search for your Google Business listing
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Locora AI connects with Google Maps data to import your real business name, category, customer reviews, and address.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Manual Profile Fields Tab */
            <form onSubmit={handleSaveManualProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. Apex Electrical Services"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669] bg-white shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Country *</label>
                  <select
                    value={manualCountry}
                    onChange={(e) => setManualCountry(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669] bg-white shadow-2xs"
                  >
                    {COMMON_COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">City *</label>
                  <input
                    type="text"
                    required
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    placeholder="e.g. Chicago, London, Toronto, Sydney"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669] bg-white shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">State / Province / Region</label>
                  <input
                    type="text"
                    value={manualState}
                    onChange={(e) => setManualState(e.target.value)}
                    placeholder="e.g. Illinois, Ontario, NSW"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669] bg-white shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Street Address</label>
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="e.g. 1200 Commercial Way"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669] bg-white shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Postal / Zip Code</label>
                  <input
                    type="text"
                    value={manualZip}
                    onChange={(e) => setManualZip(e.target.value)}
                    placeholder="e.g. 60601"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669] bg-white shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Primary Category *</label>
                  <input
                    type="text"
                    required
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    placeholder="e.g. HVAC Contractor, Law Firm, Marketing Agency"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669] bg-white shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Business Phone</label>
                  <input
                    type="text"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="e.g. (312) 555-0199"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669] bg-white shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Website URL</label>
                  <input
                    type="text"
                    value={manualWebsite}
                    onChange={(e) => setManualWebsite(e.target.value)}
                    placeholder="e.g. www.apexservices.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669] bg-white shadow-2xs"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">
                    Core Services Offered (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={manualServices}
                    onChange={(e) => setManualServices(e.target.value)}
                    placeholder="e.g. Emergency Repairs, System Installation, Maintenance, Consultations"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669] bg-white shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Target Audience</label>
                  <input
                    type="text"
                    value={manualAudience}
                    onChange={(e) => setManualAudience(e.target.value)}
                    placeholder="e.g. Commercial clients, property owners"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669] bg-white shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tone of Voice</label>
                  <input
                    type="text"
                    value={manualTone}
                    onChange={(e) => setManualTone(e.target.value)}
                    placeholder="e.g. Professional, Friendly, Authoritative"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669] bg-white shadow-2xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save & Apply to Workspace</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
