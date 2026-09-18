import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  Phone,
  ShieldCheck,
  Filter,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Building2,
  Lock,
  ThumbsUp,
  X,
  Send,
  Loader2,
} from 'lucide-react';
import { DirectoryBusinessListing } from '../../types/directory';
import { navigateToDirectory, isDirectorySubdomain } from '../../utils/domain';
import { GoogleAddressAutocomplete, LocationData } from '../GoogleAddressAutocomplete';
import { STANDARD_DIRECTORY_CATEGORIES } from '../../constants/directoryCategories';
import { useDynamicSeo } from '../../hooks/useDynamicSeo';
import { DynamicInternalLinks } from '../seo/DynamicInternalLinks';
import type { SeoPageType } from '../../lib/seo/types';

interface DirectoryHubViewProps {
  initialCategory?: string;
  initialCity?: string;
}

export const DirectoryHubView: React.FC<DirectoryHubViewProps> = ({
  initialCategory,
  initialCity,
}) => {
  const [listings, setListings] = useState<DirectoryBusinessListing[]>([]);
  const [allPublishedCategories, setAllPublishedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedCity, setSelectedCity] = useState<string>(initialCity || 'all');
  const [cityInputText, setCityInputText] = useState(initialCity && initialCity !== 'all' ? initialCity : '');
  
  // Lead Quote Modal State
  const [activeQuoteBiz, setActiveQuoteBiz] = useState<DirectoryBusinessListing | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    serviceNeed: '',
    message: '',
  });
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [quoteResponseMsg, setQuoteResponseMsg] = useState('');

  // Fetch all published categories once on mount so filters always reflect database records
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const res = await fetch('/api/directory/listings');
        const data = await res.json();
        if (data.success && Array.isArray(data.listings)) {
          const cats = Array.from(new Set(data.listings.map((l: DirectoryBusinessListing) => l.categoryName).filter(Boolean))) as string[];
          setAllPublishedCategories(cats);
        }
      } catch (err) {
        console.error('Failed to pre-fetch categories:', err);
      }
    };
    fetchAllCategories();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
      if (searchQuery.trim()) params.append('query', searchQuery.trim());

      const res = await fetch(`/api/directory/listings?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.listings)) {
        setListings(data.listings);
      }
    } catch (e) {
      console.error('Failed to load directory listings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    if (selectedCategory !== 'all' || selectedCity !== 'all') {
      fetch('/api/directory/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'directory_filter',
          source: 'directory_hub',
          city: selectedCity !== 'all' ? selectedCity : undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
        }),
      }).catch(() => {});
    }
  }, [selectedCategory, selectedCity]);

  // Dynamic Central SEO & GEO Keyword System integration
  const pageType: SeoPageType =
    selectedCategory !== 'all' && selectedCity !== 'all'
      ? 'category_city'
      : selectedCategory !== 'all'
      ? 'category_hub'
      : selectedCity !== 'all'
      ? 'city_hub'
      : 'directory_hub';

  const isSearchActive = Boolean(searchQuery.trim());
  const isThinPage = listings.length === 0 && !loading;

  const { seoResult } = useDynamicSeo({
    pageType,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    city: selectedCity !== 'all' ? selectedCity : undefined,
    availableBusinessesCount: listings.length,
    availableBusinesses: listings.map((l) => ({
      id: l.id,
      name: l.businessName,
      slug: l.slug,
      category: l.categoryName,
      city: l.cityName,
      services: l.scrapedContent?.serviceTags || l.targetKeywords || [],
      rating: l.gbpData?.averageRating,
      reviewCount: l.gbpData?.reviewCount,
    })),
    forceNoIndex: isSearchActive || isThinPage,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
    if (searchQuery.trim()) {
      fetch('/api/directory/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'directory_search',
          source: 'directory_hub',
          metadata: { query: searchQuery.trim(), city: selectedCity, category: selectedCategory },
        }),
      }).catch(() => {});
    }
  };

  const handleOpenQuoteModal = (biz: DirectoryBusinessListing, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveQuoteBiz(biz);
    setQuoteForm({
      fullName: '',
      phone: '',
      email: '',
      serviceNeed: biz.categoryName || '',
      message: '',
    });
    setQuoteSuccess(false);
    setQuoteResponseMsg('');

    // Phase 4.1: Track directory_lead_started
    fetch('/api/directory/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'directory_lead_started',
        businessId: biz.id,
        directoryProfileId: biz.slug,
        source: 'directory_hub_modal',
        city: biz.cityName,
        category: biz.categoryName,
      }),
    }).catch(() => {});
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuoteBiz) return;
    if (!quoteForm.fullName || !quoteForm.phone) {
      alert('Please provide your name and phone number.');
      return;
    }

    setSubmittingQuote(true);
    try {
      const res = await fetch('/api/directory/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: activeQuoteBiz.id,
          leadName: quoteForm.fullName,
          leadPhone: quoteForm.phone,
          leadEmail: quoteForm.email,
          serviceRequested: quoteForm.serviceNeed || activeQuoteBiz.categoryName,
          message: quoteForm.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuoteSuccess(true);
        setQuoteResponseMsg(data.message || 'Your inquiry was delivered to the verified pro.');
      } else {
        alert(data.message || 'Failed to submit quote request. Please try again.');
      }
    } catch (err: any) {
      alert('Network error submitting request. Please try again.');
    } finally {
      setSubmittingQuote(false);
    }
  };

  const navigateToBusinessDetail = (biz: DirectoryBusinessListing) => {
    const slug = biz.slug || biz.id;
    navigateToDirectory(`/business/${slug}`);
  };

  // Compile combined categories: standard catalog + real database categories + "Other" at the end
  const combinedCategoriesList = React.useMemo(() => {
    const items = new Set<string>();
    // Add all categories from published businesses in database first
    allPublishedCategories.forEach((c) => {
      if (c && c.toLowerCase() !== 'other') items.add(c);
    });
    // Add standard business taxonomy
    STANDARD_DIRECTORY_CATEGORIES.forEach((c) => {
      if (c && !c.toLowerCase().includes('other')) items.add(c);
    });
    const sorted = Array.from(items).sort((a, b) => a.localeCompare(b));
    // Always include "Other" at the end
    sorted.push('Other');
    return sorted;
  }, [allPublishedCategories]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-3 px-4 sm:px-8 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Locora Certified Directory
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">directory.locoraai.com</span>
        </div>
        <div className="text-slate-400 hidden sm:block">
          Verified Local Businesses • Direct Customer Quotes • No Middleman Fees
        </div>
      </div>

      {/* Directory Hero Search Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-850 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Verified Local Service Pros
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-heading">
            Find & Hire Verified Local Businesses
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Real Google Business Profile verified reviews, live operating hours, and instant direct quote requests with zero middleman markup.
          </p>

          {/* Search Box with Autocomplete Location */}
          <form onSubmit={handleSearchSubmit} className="max-w-4xl mx-auto mt-8 bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex flex-col md:flex-row items-center gap-2">
            <div className="flex-1 flex items-center gap-2.5 px-3 w-full border-b md:border-b-0 md:border-r border-slate-200 py-2">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search business name, service, or keyword..."
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
            </div>

            {/* Google Address Autocomplete Location Input */}
            <div className="w-full md:w-80 px-2 py-1">
              <GoogleAddressAutocomplete
                id="directory_city_autocomplete"
                label=""
                helperText=""
                placeholder="Enter city, state or address..."
                value={cityInputText}
                onChange={(val) => {
                  setCityInputText(val);
                  if (!val.trim()) {
                    setSelectedCity('all');
                  }
                }}
                onSelectLocation={(loc: LocationData) => {
                  const resolvedCity = loc.city || loc.formattedAddress?.split(',')[0] || '';
                  setCityInputText(loc.city ? `${loc.city}${loc.state ? `, ${loc.state}` : ''}` : loc.formattedAddress);
                  setSelectedCity(resolvedCity ? resolvedCity.toLowerCase() : 'all');
                }}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </form>

          {/* Quick Categories Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <span className="text-xs text-slate-400 font-medium mr-1">Popular:</span>
            {['All', 'Dentist / Dental Clinic', 'Plumbing Services', 'HVAC & Air Conditioning', 'Roofing & Gutters', 'Legal Services & Lawyers', 'Software & AI Marketing', 'Other'].map((cat) => {
              const val = cat.toLowerCase() === 'all' ? 'all' : cat.toLowerCase();
              const isSelected = selectedCategory === val || (selectedCategory === 'all' && cat === 'All');
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(val)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Listings Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-black text-slate-900 font-heading">
              {selectedCategory !== 'all' ? `${selectedCategory.toUpperCase()} Providers` : 'All Verified Businesses'}
              {selectedCity !== 'all' ? ` in ${selectedCity.toUpperCase()}` : ''}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Showing {listings.length} verified listings linked to real-time Google Business Profiles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Filter Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[280px]"
            >
              <option value="all">All Categories</option>
              {combinedCategoriesList.map((c) => (
                <option key={c} value={c.toLowerCase()}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">Querying verified local business directory...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-8 mt-6">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {selectedCategory === 'all' && selectedCity === 'all' && !searchQuery.trim()
                ? 'No directory listings yet.'
                : 'No matching business listings found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {selectedCategory === 'all' && selectedCity === 'all' && !searchQuery.trim()
                ? 'No businesses are currently published in the directory.'
                : 'Try broadening your search term, selecting a different category, or resetting your location filter.'}
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSelectedCity('all'); setCityInputText(''); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {listings.map((biz) => {
              const rating = biz.gbpData?.averageRating || 5;
              const reviewsCount = biz.gbpData?.reviewCount || 10;
              const isPremium = biz.planTier === 'pro' || biz.planTier === 'agency' || biz.planTier === 'growth';

              return (
                <div
                  key={biz.id}
                  onClick={() => navigateToBusinessDetail(biz)}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group cursor-pointer"
                >
                  {/* Card Header & Category Badge */}
                  <div className="p-5 border-b border-slate-100 flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {biz.categoryName}
                        </span>
                        {biz.isClaimed && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" /> Claimed
                          </span>
                        )}
                      </div>
                      {isPremium && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                          <CheckCircle2 className="w-3 h-3 text-amber-500" /> Featured Pro
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors font-heading flex items-center justify-between">
                      <span>{biz.businessName}</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </h3>

                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{rating.toFixed(1)}</span>
                      <span className="text-[11px] text-slate-400">({reviewsCount} Google reviews)</span>
                    </div>

                    {/* City & Address */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{biz.cityName ? `${biz.cityName}, ${biz.stateCode}` : 'United States'}</span>
                    </div>

                    {/* Scraped / About snippet */}
                    <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                      {biz.scrapedContent?.description || biz.scrapedContent?.aboutSummary || 'Verified local service provider offering certified customer satisfaction and quality work.'}
                    </p>

                    {/* Service Tags */}
                    {biz.scrapedContent?.serviceTags && biz.scrapedContent.serviceTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {biz.scrapedContent.serviceTags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={(e) => handleOpenQuoteModal(biz, e)}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Request Free Quote
                    </button>

                    {biz.phone && (
                      <a
                        href={`tel:${biz.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-xl transition-colors cursor-pointer"
                        title="Call Business"
                      >
                        <Phone className="w-4 h-4 text-emerald-600" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Directory Trust & Visitor Confidence Section */}
        <div className="mt-16 pt-12 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h3 className="text-2xl font-black text-slate-900 font-heading tracking-tight">
              A Real, Verified Business Directory
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-sans">
              Connecting local residents directly with trusted professionals. No inflated broker fees or hidden commissions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Star className="w-5 h-5 fill-emerald-600 text-emerald-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-heading">
                Verified Google Reviews
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Real customer ratings synchronized directly from Google Business Profiles, filtering out spam or fake feedback.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-heading">
                Direct Contact & Quotes
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Call pros directly or send instant quote requests. Your inquiry goes straight to the owner with zero middleman markup.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-heading">
                Live Hours & Availability
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Up-to-date operating schedules, verified addresses, and service specializations so you get help when you need it.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quote / Lead Request Modal */}
      {activeQuoteBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  Instant Quote Request
                </span>
                <h3 className="text-lg font-black text-slate-900 font-heading">
                  {activeQuoteBiz.businessName}
                </h3>
              </div>
              <button
                onClick={() => setActiveQuoteBiz(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {quoteSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Request Delivered!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  {quoteResponseMsg || 'Your service inquiry was forwarded directly to the business owner.'}
                </p>
                <button
                  onClick={() => setActiveQuoteBiz(null)}
                  className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuote} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={quoteForm.fullName}
                    onChange={(e) => setQuoteForm({ ...quoteForm, fullName: e.target.value })}
                    placeholder="e.g. John Miller"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                      placeholder="(555) 000-0000"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={quoteForm.email}
                      onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Needed</label>
                  <input
                    type="text"
                    value={quoteForm.serviceNeed}
                    onChange={(e) => setQuoteForm({ ...quoteForm, serviceNeed: e.target.value })}
                    placeholder="e.g. Emergency Pipe Repair, Consultation"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Details / Message</label>
                  <textarea
                    rows={3}
                    value={quoteForm.message}
                    onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                    placeholder="Briefly describe what you need done and when..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveQuoteBiz(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingQuote}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingQuote ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Delivering Quote...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Request to Pro
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
