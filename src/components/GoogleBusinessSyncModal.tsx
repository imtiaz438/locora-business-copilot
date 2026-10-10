import React, { useState, useEffect } from 'react';
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
  SearchX,
  Info,
  ExternalLink,
  Link2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDirectoryBusinessUrl } from '../utils/domain';

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
  isSuggestedListing?: boolean;
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
    updateActiveBusiness,
    syncGoogleBusinessProfile,
    businessProfile,
    updateBusinessProfile,
    logActivity,
    user,
    businessTruth,
    refreshBusinessTruth,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'search' | 'manual'>('search');

  // Search tab states
  const [searchQuery, setSearchQuery] = useState(
    activeBusiness.name && activeBusiness.name !== 'My Business Workspace' && activeBusiness.name !== 'Demo Growth Workspace'
      ? `${activeBusiness.name}${activeBusiness.city ? `, ${activeBusiness.city}` : ''}`
      : ''
  );
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');
  const [providerStatus, setProviderStatus] = useState<string | null>(null);
  const [providerStatusMessage, setProviderStatusMessage] = useState<string | null>(null);
  const [suggestedListing, setSuggestedListing] = useState<PlaceSearchResult | null>(null);
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);
  const [mapsUrl, setMapsUrl] = useState('');
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);

  // Syncing state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncedListingSlug, setSyncedListingSlug] = useState<string>('');

  // Reset transient sync state whenever the modal is (re)opened so a previous
  // session's success view never shows for a fresh open.
  useEffect(() => {
    if (isOpen) {
      setSyncSuccess(false);
      setSyncedListingSlug('');
      setIsSyncing(false);
    }
  }, [isOpen]);

  // GBP connection state: once connected, the profile is locked in.
  // Single-business (Free) plan = one-time connection; multi-business plans (Pro/Agency) = per business.
  // Unified source: businessTruth (verified server-side) OR the business record flag.
  const isGbpConnected =
    Boolean((activeBusiness as any)?.gbpConnected) ||
    Boolean((businessTruth as any)?.googleProfile?.connected);
  const planTier = (user?.planTier || 'free').toLowerCase();
  const isSingleBusinessPlan = planTier === 'free';

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

  // Resolve a pasted Google Maps share link directly to the listing.
  // For new/unindexed GBPs that text search cannot find yet.
  const handleResolveUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const url = mapsUrl.trim();
    if (!url || isGbpConnected) return;
    setIsResolvingUrl(true);
    setSearchError(null);
    try {
      const res = await fetch('/api/places/resolve-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not resolve that link.');
      if (data.provider_status) setProviderStatus(data.provider_status);
      if (data.providerStatusMessage) setProviderStatusMessage(data.providerStatusMessage);
      if (Array.isArray(data.results) && data.results.length > 0) {
        setSearchResults(data.results);
        setSelectedPlace(data.results[0]);
        setHasSearched(true);
      } else {
        setSearchError(data.providerStatusMessage || 'No Google listing found at that link. Make sure it is the Share link from your Google Business Profile.');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Could not resolve that link.');
    } finally {
      setIsResolvingUrl(false);
    }
  };

  const handleSearchPlaces = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToSearch = (customQuery !== undefined ? customQuery : searchQuery).trim();
    if (!queryToSearch) return;

    setIsSearching(true);
    setSearchError(null);
    setSelectedPlace(null);
    setHasSearched(true);
    setLastSearchedQuery(queryToSearch);
    setProviderStatus(null);
    setProviderStatusMessage(null);

    try {
      const res = await fetch(`/api/places/search-live?query=${encodeURIComponent(queryToSearch)}`);
      const data = await res.json();
      
      setProviderStatus(data.provider_status || null);
      setProviderStatusMessage(data.providerStatusMessage || null);
      if (data.suggestedListing) {
        setSuggestedListing(data.suggestedListing);
      }

      if (Array.isArray(data.results) && data.results.length > 0) {
        setSearchResults(data.results);
        setSelectedPlace(data.results[0]);
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

      if (place.placeId && !place.placeId.startsWith('direct_') && !place.placeId.startsWith('ws_') && !place.placeId.startsWith('custom_')) {
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
        rating: place.rating != null && !isNaN(Number(place.rating)) ? Number(place.rating) : 0,
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

      updateActiveBusiness({
        name: place.name,
        city: place.city,
        state: place.state,
        country: place.country || 'United States',
        address: place.address || place.formattedAddress,
        phone: detailedPhone || '',
        website: detailedWebsite || '',
        category: place.primaryType || 'Local Business',
        googleRating: place.rating != null && !isNaN(Number(place.rating)) ? Number(place.rating) : 0,
        reviewCount: place.reviewCount || 0,
        gbpConnected: true,
        gbpCompleteness: 98,
      });

      // Auto-populate every profile field we can honestly derive from the synced
      // Google data — only filling blanks, never overwriting user-entered values.
      // (Google Places does not expose business description or socials, so those
      // stay empty rather than invented.)
      const COUNTRY_CURRENCY: Record<string, string> = {
        'United States': 'USD', 'Canada': 'CAD', 'United Kingdom': 'GBP',
        'Australia': 'AUD', 'New Zealand': 'NZD', 'Ireland': 'EUR',
        'Germany': 'EUR', 'France': 'EUR', 'Spain': 'EUR', 'Italy': 'EUR',
        'Netherlands': 'EUR', 'India': 'INR', 'Pakistan': 'PKR',
        'United Arab Emirates': 'AED', 'Singapore': 'SGD', 'South Africa': 'ZAR',
      };
      const syncedCountry = place.country || 'United States';
      const inferredCurrency = COUNTRY_CURRENCY[syncedCountry] || '';
      const hoursText = Array.isArray(detailedHours) && detailedHours.length > 0
        ? detailedHours.join('\n')
        : '';

      updateBusinessProfile({
        name: place.name,
        city: place.city,
        state: place.state,
        country: syncedCountry,
        address: place.address || place.formattedAddress,
        phone: detailedPhone || '',
        website: detailedWebsite || '',
        industry: place.primaryType || 'Local Business',
        category: place.primaryType || 'Local Business',
        services: [place.primaryType || 'Core Service'],
        // Fill blanks only:
        ...(!businessProfile.legalName && place.name ? { legalName: place.name } : {}),
        ...(!businessProfile.hours && hoursText ? { hours: hoursText } : {}),
        ...(!businessProfile.currency && inferredCurrency ? { currency: inferredCurrency } : {}),
      });

      logActivity('integrations', 'Google Business Profile Synced', `Successfully linked live profile for ${place.name} in ${place.city || 'local area'}`);
      const resolvedSlug = responseData.business?.slug || responseData.business?.directorySlug || activeBusiness.slug || activeBusiness.id;
      setSyncedListingSlug(resolvedSlug);
      setSyncSuccess(true);
      // Refresh the server-verified business truth so every surface (dashboard card,
      // dossier, gaps, settings) agrees on the connected state immediately.
      try { await refreshBusinessTruth(activeBusiness.id); } catch (e) { /* non-blocking */ }
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

      updateActiveBusiness({
        name: manualName.trim(),
        city: manualCity.trim(),
        state: manualState.trim(),
        country: manualCountry.trim() || 'United States',
        address: manualAddress.trim(),
        zip: manualZip.trim(),
        phone: manualPhone.trim(),
        website: manualWebsite.trim(),
        category: manualCategory.trim(),
        googleRating: activeBusiness.googleRating || 0,
        reviewCount: activeBusiness.reviewCount || 0,
        gbpConnected: true,
        gbpCompleteness: 98,
      });

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
      const resolvedSlug = responseData.business?.slug || responseData.business?.directorySlug || activeBusiness.slug || activeBusiness.id;
      setSyncedListingSlug(resolvedSlug);
      setSyncSuccess(true);
    } catch (err: any) {
      alert(`Save failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70 shrink-0">
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
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-100/60 pt-2 gap-2 shrink-0">
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
        <div className="p-6 overflow-y-auto flex-1">
          {syncSuccess ? (
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce shadow-sm">
                <Check className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-md">
                <h4 className="text-xl font-black font-heading text-slate-900 tracking-tight">
                  Google Business Profile Linked!
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your business identity, live Google reviews, ratings, hours, and location have been synced to your workspace.
                </p>
              </div>

              <div className="w-full max-w-sm p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-xs font-bold text-slate-900">Directory listing: not published yet</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Add your phone number in Business Profile to publish your verified listing on directory.locoraai.com and start receiving inbound quote requests.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm pt-2">
                {syncedListingSlug ? (
                  <a
                    href={getDirectoryBusinessUrl(syncedListingSlug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View Directory Listing</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          ) : activeTab === 'search' ? (
            <div className="space-y-5">
              {/* Already-connected state: green mark + locked search */}
              {isGbpConnected && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-emerald-950">
                      Google Business Profile Connected
                    </p>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      {activeBusiness.name || 'Your business'} is linked and active. The business search is disabled — this profile is already synced to your workspace.
                      {isSingleBusinessPlan && ' On the Free plan this connection is one-time and cannot be changed.'}
                    </p>
                  </div>
                </div>
              )}

              {/* One-time notice for single-business plan */}
              {!isGbpConnected && isSingleBusinessPlan && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <span className="font-bold">One-time connection:</span> on the Free plan your Google Business Profile can only be connected once. Please choose carefully before syncing.
                  </p>
                </div>
              )}

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
                      disabled={isGbpConnected}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669] bg-white shadow-2xs disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim() || isGbpConnected}
                    className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                  {isGbpConnected
                    ? 'Search is disabled because a Google Business Profile is already connected and active for this business.'
                    : 'Tip: Include your business name and city/state for the most accurate Google Places match.'}
                </p>
              </form>

              {/* Direct link option for new/unindexed listings */}
              <form onSubmit={handleResolveUrl} className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-700">
                  Or paste your Google Maps link
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={mapsUrl}
                      onChange={(e) => setMapsUrl(e.target.value)}
                      placeholder="https://share.google/... or google.com/maps link"
                      disabled={isGbpConnected}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669] bg-white shadow-2xs disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isResolvingUrl || !mapsUrl.trim() || isGbpConnected}
                    className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResolvingUrl ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Resolving...</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Connect Link</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  New Google Business Profile? Recently created listings can take a few days to appear in search results. If your listing doesn't show up above, open it in Google Maps, tap <span className="font-semibold">Share</span>, and paste the link here to connect it directly.
                </p>
              </form>

              {searchError && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{searchError}</span>
                </div>
              )}

              {providerStatus === 'key_restricted' && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-blue-900">
                    <Info className="w-4 h-4 shrink-0 text-blue-600" />
                    <span>Google Maps API Key Note</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Your Google Maps API key has HTTP Referer restrictions configured in Google Cloud Console. To allow server-side Google Places lookups, set restrictions to "None" or "IP addresses". You can still sync your business profile directly below!
                  </p>
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
                              {result.source === 'workspace_database' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                                  Workspace Listing
                                </span>
                              )}
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
                            disabled={isSyncing || isGbpConnected}
                            className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* Not Found / Empty State */}
                {searchResults.length === 0 && !isSearching && (
                  hasSearched ? (
                    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                          <SearchX className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-900 font-heading">
                            No Google Business Profile Listing Found
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {providerStatusMessage || `We could not find a verified Google Maps listing matching "${lastSearchedQuery}".`}
                          </p>
                        </div>
                      </div>

                      {/* Direct 1-Click Sync & Setup Card */}
                      <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold text-slate-900">
                              Instant Sync: "{suggestedListing?.name || lastSearchedQuery}"
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Ready to Link
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Link "{suggestedListing?.name || lastSearchedQuery}" straight into your workspace dashboard. This activates all GBP widgets, review monitoring, local SEO diagnostics, and AI growth workflows.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const fallbackPlace: PlaceSearchResult = suggestedListing || {
                                placeId: `direct_${Date.now()}`,
                                name: lastSearchedQuery,
                                address: lastSearchedQuery,
                                city: activeBusiness.city || '',
                                state: activeBusiness.state || '',
                                country: activeBusiness.country || 'United States',
                                formattedAddress: `${lastSearchedQuery}${activeBusiness.city ? `, ${activeBusiness.city}` : ''}`,
                                rating: 5.0,
                                reviewCount: 0,
                                primaryType: 'Local Business',
                                source: 'custom_listing',
                              };
                              handleSyncSelectedPlace(fallbackPlace);
                            }}
                            disabled={isSyncing}
                            className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isSyncing ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Syncing...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>1-Click Sync "{suggestedListing?.name || lastSearchedQuery}"</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setManualName(suggestedListing?.name || lastSearchedQuery);
                              if (suggestedListing?.city) setManualCity(suggestedListing.city);
                              if (suggestedListing?.state) setManualState(suggestedListing.state);
                              setActiveTab('manual');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer border border-slate-200"
                          >
                            Customize Details (Address, Phone, Services)
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Active Workspace Business Card */}
                      {activeBusiness.name && activeBusiness.name !== 'Demo Growth Workspace' && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-[#059669]" />
                              <span className="text-xs font-bold text-slate-800">
                                Current Workspace Business
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              activeBusiness.gbpConnected
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {activeBusiness.gbpConnected ? 'Google Profile Linked' : 'Not Yet Linked'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{activeBusiness.name}</p>
                              <p className="text-xs text-slate-500">
                                {activeBusiness.category || 'Local Business'} • {activeBusiness.city || 'Location unconfigured'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSearchQuery(activeBusiness.name);
                                  handleSearchPlaces(undefined, activeBusiness.name);
                                }}
                                disabled={isGbpConnected}
                                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Search on Google
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const bizPlace: PlaceSearchResult = {
                                    placeId: `direct_${activeBusiness.id}`,
                                    name: activeBusiness.name,
                                    address: activeBusiness.address || activeBusiness.name,
                                    city: activeBusiness.city || '',
                                    state: activeBusiness.state || '',
                                    country: activeBusiness.country || 'United States',
                                    formattedAddress: activeBusiness.address ? `${activeBusiness.address}, ${activeBusiness.city || ''}` : `${activeBusiness.name}, ${activeBusiness.city || ''}`,
                                    rating: activeBusiness.googleRating || 0,
                                    reviewCount: activeBusiness.reviewCount || 0,
                                    primaryType: activeBusiness.category || 'Local Business',
                                    phone: activeBusiness.phone || '',
                                    website: activeBusiness.website || '',
                                    source: 'workspace_active',
                                  };
                                  handleSyncSelectedPlace(bizPlace);
                                }}
                                disabled={isSyncing || isGbpConnected}
                                className="px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isGbpConnected ? 'Already Connected' : 'Sync Active Business'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="py-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-6 space-y-2">
                        <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">
                          Search for your Google Business listing
                        </p>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Enter your business name and city above to search Google Maps and sync live profile data, reviews, and address information.
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            /* Manual Profile Fields Tab */
            <form onSubmit={handleSaveManualProfile} className="space-y-4">
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
                    Google reviews and verified star ratings <strong>can only be pulled automatically when you connect your official Google Business Profile</strong>. If you enter or configure this business manually, reviews cannot be fetched from Google until your Google Business Profile is connected.
                  </p>
                  <p className="text-amber-700/90 text-[10px] font-medium">
                    (Tip: You can connect your Google account anytime in Settings → Integrations. Or upgrade your plan to connect review with out Google business profile or oauth required.)
                  </p>
                </div>
              </div>

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
                    placeholder="e.g. (312) 512-0199"
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
