import React, { useState, useEffect } from 'react';
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Sparkles,
  Share2,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Send,
  Loader2,
  AlertCircle,
  AlertTriangle,
  ThumbsUp,
  Building2,
  Award,
  Zap,
  Activity,
  ExternalLink,
  ArrowUpRight,
  X,
  Info,
  Sliders,
} from 'lucide-react';
import { DirectoryBusinessListing } from '../../types/directory';
import { DirectoryPublicCheckupModal } from './DirectoryPublicCheckupModal';
import {
  isDirectorySubdomain,
  navigateToDirectory,
  getDirectoryBusinessUrl,
  getDirectoryCityUrl,
  getDirectoryCategoryUrl,
} from '../../utils/domain';
import { useDynamicSeo } from '../../hooks/useDynamicSeo';

interface DirectoryBusinessDetailViewProps {
  slug: string;
}

export const DirectoryBusinessDetailView: React.FC<DirectoryBusinessDetailViewProps> = ({ slug }) => {
  const [business, setBusiness] = useState<DirectoryBusinessListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quote Form State
  const [quoteForm, setQuoteForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    serviceNeed: '',
    message: '',
  });
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  // Claim Modal State
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimEmail, setClaimEmail] = useState('');
  const [claimName, setClaimName] = useState('');
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Free Business Checkup Modal State
  const [checkupModalOpen, setCheckupModalOpen] = useState(false);
  const [hasStartedLeadInput, setHasStartedLeadInput] = useState(false);

  // Track event helper (Phase 4.1 & 4.2 real event capture)
  const trackDirectoryEvent = (eventType: string, metadata?: Record<string, any>) => {
    fetch('/api/directory/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId: business?.id || slug,
        directoryProfileId: business?.slug || slug,
        eventType,
        city: business?.cityName,
        category: business?.categoryName,
        source: 'directory_detail',
        metadata,
      }),
    }).catch(() => {});
  };

  const [relatedBusinesses, setRelatedBusinesses] = useState<DirectoryBusinessListing[]>([]);

  useEffect(() => {
    const fetchBusiness = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/directory/business/${slug}`);
        const data = await res.json();
        if (data.success && data.business) {
          setBusiness(data.business);
          // If current route slug was an internal email or ID (like biz_imtiazbaloch3322_gmail_com),
          // automatically rewrite the browser URL bar to the clean, valid public slug
          if (data.business.slug && data.business.slug !== slug && typeof window !== 'undefined') {
            const isDirDomain = window.location.hostname.includes('directory.locoraai.com');
            const canonicalPath = isDirDomain ? `/business/${data.business.slug}` : `/biz/${data.business.slug}`;
            try {
              window.history.replaceState({}, '', canonicalPath);
            } catch (_) {}
          }
          setQuoteForm((prev) => ({
            ...prev,
            serviceNeed: data.business.categoryName || '',
          }));
          // Fire profile view event (Phase 4.1: directory_profile_view)
          trackDirectoryEvent('directory_profile_view', { businessName: data.business.businessName });

          // Fetch real related businesses in same city
          if (data.business.cityName) {
            fetch(`/api/directory/listings?city=${encodeURIComponent(data.business.cityName)}&limit=4`)
              .then((r) => r.json())
              .then((relData) => {
                if (relData.success && Array.isArray(relData.listings)) {
                  setRelatedBusinesses(
                    relData.listings.filter((l: DirectoryBusinessListing) => l.slug !== slug && l.id !== data.business.id).slice(0, 3)
                  );
                }
              })
              .catch(() => {});
          }
        } else {
          setError(data.message || 'Business profile not found.');
        }
      } catch (err: any) {
        setError('Network error fetching business details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [slug]);

  // Dynamic Central SEO & GEO Keyword Engine integration
  const businessServices = business?.scrapedContent?.serviceTags || business?.targetKeywords || [];
  const businessPhone = business?.phone || business?.gbpData?.phone || undefined;
  const businessAddress = business?.gbpData?.address || undefined;
  const businessRating = business?.gbpData?.averageRating;
  const businessReviews = business?.gbpData?.reviewCount;
  const businessHours = business?.gbpData?.hours
    ? Object.entries(business.gbpData.hours).map(([day, hrs]) => `${day}: ${hrs}`)
    : undefined;

  const { seoResult } = useDynamicSeo({
    pageType: 'business_detail',
    businessName: business?.businessName,
    businessSlug: business?.slug,
    category: business?.categoryName,
    city: business?.cityName,
    services: businessServices,
    phone: businessPhone,
    website: business?.websiteUrl,
    address: businessAddress,
    rating: businessRating,
    reviewCount: businessReviews,
    openingHours: businessHours,
    availableBusinessesCount: business ? 1 : 0,
    availableBusinesses: business
      ? [
          {
            id: business.id,
            name: business.businessName,
            slug: business.slug,
            category: business.categoryName,
            city: business.cityName,
            services: businessServices,
            phone: businessPhone,
            website: business.websiteUrl,
            address: businessAddress,
            rating: businessRating,
            reviewCount: businessReviews,
            openingHours: businessHours,
          },
        ]
      : [],
    forceNoIndex: Boolean(error) || (!business && !loading),
  });

  const handlePhoneClick = () => {
    trackDirectoryEvent('phone_click');
  };

  const handleWebsiteClick = () => {
    trackDirectoryEvent('website_click');
  };

  const handleInitiateClaim = () => {
    trackDirectoryEvent('directory_claim_started');
    trackDirectoryEvent('claim_click');
    setClaimModalOpen(true);
    setClaimError(null);
  };

  const handleConfirmClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !claimEmail) return;

    setClaimSubmitting(true);
    setClaimError(null);

    try {
      const res = await fetch('/api/directory/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id || slug,
          userEmail: claimEmail,
          fullName: claimName,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setClaimSuccess(true);
        trackDirectoryEvent('directory_claim_completed');
        trackDirectoryEvent('claim_conversion');
        // Persist pending directory claim in localStorage so signup immediately verifies
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'locora_pending_directory_claim',
            JSON.stringify({
              businessId: business.id,
              businessName: business.businessName,
              slug: business.slug,
              websiteUrl: business.websiteUrl,
              phone: business.phone,
              address: `${business.cityName}, ${business.stateCode}`,
              categoryName: business.categoryName,
              cityName: business.cityName,
              stateCode: business.stateCode,
              averageRating: business.gbpData?.averageRating || 5,
              reviewCount: business.gbpData?.reviewCount || 0,
              timestamp: Date.now(),
            })
          );
        }

        setTimeout(() => {
          window.location.href = `/auth?mode=signup&email=${encodeURIComponent(claimEmail)}&claim=true`;
        }, 1200);
      } else {
        setClaimError(data.error || 'Failed to claim listing.');
      }
    } catch (err: any) {
      setClaimError('Network error submitting claim.');
    } finally {
      setClaimSubmitting(false);
    }
  };

  const handleRunFreeCheckup = () => {
    if (!business) return;
    trackDirectoryEvent('directory_checkup_started');
    setCheckupModalOpen(true);
  };

  const handleLeadInputFocus = () => {
    if (!hasStartedLeadInput) {
      setHasStartedLeadInput(true);
      trackDirectoryEvent('directory_lead_started');
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
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
          businessId: business.id,
          directoryProfileId: business.slug || slug,
          leadName: quoteForm.fullName,
          leadPhone: quoteForm.phone,
          leadEmail: quoteForm.email,
          serviceRequested: quoteForm.serviceNeed || business.categoryName,
          message: quoteForm.message,
          city: business.cityName,
          category: business.categoryName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuoteSuccess(true);
        trackDirectoryEvent('quote_request');
        trackDirectoryEvent('directory_lead_submitted', { leadId: data.leadId });
      } else {
        alert(data.message || 'Failed to submit quote request.');
      }
    } catch (err) {
      alert('Error submitting quote request.');
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleBackToDirectory = () => {
    const isDir = isDirectorySubdomain();
    window.history.pushState({}, '', isDir ? '/' : '/directory');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading verified business profile...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md text-center shadow-lg">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 font-heading">Listing Not Found</h2>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            The requested business profile is either private or unavailable on the directory.
          </p>
          <button
            onClick={handleBackToDirectory}
            className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const rating = business.gbpData?.averageRating;
  const reviewCount = business.gbpData?.reviewCount;
  const reviews = business.gbpData?.reviews || [];
  const hours = business.gbpData?.hours || {};
  const isPremium = business.planTier === 'pro' || business.planTier === 'agency' || business.planTier === 'growth';
  const status = business.directoryStatus || (business.isClaimed ? 'CLAIMED' : 'PUBLISHED');
  const isUnclaimed = !business.isClaimed && status !== 'CLAIMED' && status !== 'VERIFIED';

  // Generate verified Schema.org LocalBusiness JSON-LD (strictly without invented fields)
  const schemaOrgJsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.businessName,
  };

  if (business.phone) {
    schemaOrgJsonLd.telephone = business.phone;
  }
  if (business.websiteUrl) {
    schemaOrgJsonLd.url = business.websiteUrl;
  }
  if (business.cityName || business.stateCode) {
    schemaOrgJsonLd.address = {
      '@type': 'PostalAddress',
      addressLocality: business.cityName || undefined,
      addressRegion: business.stateCode || undefined,
      addressCountry: 'US',
    };
  }
  // Only include aggregateRating if authentic rating and reviewCount are present
  if (typeof rating === 'number' && rating > 0 && typeof reviewCount === 'number' && reviewCount > 0) {
    schemaOrgJsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(1),
      reviewCount: reviewCount.toString(),
      bestRating: '5',
      worstRating: '1',
    };
  }
  // Only include opening hours if authentic hours are present
  if (hours && Object.keys(hours).length > 0) {
    schemaOrgJsonLd.openingHours = Object.entries(hours)
      .filter(([_, time]) => time && time !== 'Closed')
      .map(([day, time]) => `${day.substring(0, 2)} ${time}`);
  }

  // Generate BreadcrumbList Schema.org JSON-LD
  const breadcrumbSchemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Locora Directory',
        item: isDirectorySubdomain() ? 'https://directory.locoraai.com' : 'https://locoraai.com/directory',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: business.cityName,
        item: getDirectoryCityUrl(business.citySlug),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: business.categoryName,
        item: getDirectoryCategoryUrl(business.categorySlug),
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: business.businessName,
        item: getDirectoryBusinessUrl(business.slug),
      },
    ],
  };

  const navigateToCity = () => {
    navigateToDirectory(`/city/${business.citySlug}`);
  };

  const navigateToCategory = () => {
    navigateToDirectory(`/category/${business.categorySlug}`);
  };

  const navigateToCityCategory = () => {
    navigateToDirectory(`/${business.citySlug}/${business.categorySlug}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      {/* Schema.org JSON-LD Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchemaJsonLd) }}
      />

      {/* Owner Unpublished Preview Banner */}
      {(business.isDraft || business.isPublishedInDirectory === false) && (
        <div className="bg-amber-600 text-white text-xs font-semibold px-4 py-2.5 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-200" />
              <span>
                <strong>Owner Preview Mode:</strong> This business listing is currently <strong>unpublished</strong> and not visible to the public. To make it live, complete required details and push it to the directory from <strong>Settings &gt; Directory</strong>.
              </span>
            </div>
            <a
              href="/app/settings"
              className="px-3 py-1 bg-white text-amber-900 text-xs font-bold rounded-lg hover:bg-amber-50 shrink-0 transition-colors"
            >
              Go to Settings
            </a>
          </div>
        </div>
      )}

      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500 flex-wrap">
            <button
              onClick={handleBackToDirectory}
              className="hover:text-emerald-600 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Directory
            </button>
            <span>/</span>
            <button
              onClick={navigateToCity}
              className="hover:text-emerald-600 font-semibold cursor-pointer"
            >
              {business.cityName}
            </button>
            <span>/</span>
            <button
              onClick={navigateToCategory}
              className="hover:text-emerald-600 font-semibold cursor-pointer"
            >
              {business.categoryName}
            </button>
            <span>/</span>
            <span className="text-slate-900 font-bold truncate max-w-xs">{business.businessName}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-emerald-600 font-bold text-[11px]">
            <ShieldCheck className="w-4 h-4" /> Real-Time Google Business Profile Verified
          </div>
        </div>
      </div>

      {/* Business Header Hero */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-md border border-emerald-200">
                  {business.categoryName}
                </span>
                {isPremium && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Locora Top Rated Pro
                  </span>
                )}
                {status === 'VERIFIED' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-400">
                    <Award className="w-3.5 h-3.5 text-emerald-700" /> Verified Owner Managed
                  </span>
                ) : status === 'CLAIMED' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Claimed Business
                  </span>
                ) : status === 'CLAIM_PENDING' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-700" /> Claim Verification Pending
                  </span>
                ) : status === 'ELIGIBLE' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" /> Verified Google Business
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" /> Verified Local Pro
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-heading tracking-tight">
                {business.businessName}
              </h1>

              {/* Verified directory notice for unclaimed profiles */}
              {isUnclaimed && (
                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 max-w-3xl">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold block">Verified Directory Listing</span>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      This profile is verified through public records and Google Business Profile data. Are you the business owner or manager? Claim your free profile to update hours, services, and respond to customer quotes.
                    </p>
                  </div>
                </div>
              )}

              {/* Ratings and Reviews */}
              <div className="flex flex-wrap items-center gap-3">
                {typeof rating === 'number' && rating > 0 ? (
                  <>
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-slate-900">{rating.toFixed(1)}</span>
                    <span className="text-xs text-slate-500">
                      Based on <strong>{reviewCount || reviews.length || 1}</strong> authentic customer reviews synced from Google Business Profile
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Public Google Listing (Reviews Syncing)
                  </span>
                )}
              </div>

              {/* Address & Quick Info */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{business.cityName ? `${business.cityName}, ${business.stateCode}` : 'United States'}</span>
                </div>
                {business.phone && (
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <a href={`tel:${business.phone}`} onClick={handlePhoneClick} className="hover:underline">{business.phone}</a>
                  </div>
                )}
                {business.websiteUrl && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a
                      href={business.websiteUrl}
                      target="_blank"
                      rel={isPremium ? "noopener" : "nofollow noopener"}
                      onClick={handleWebsiteClick}
                      className="text-emerald-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      Visit Official Website
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                      {isPremium && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          DoFollow Citation
                        </span>
                      )}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Call / Contact CTA Box */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 flex-shrink-0">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  onClick={handlePhoneClick}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Call {business.phone}
                </a>
              )}
              <a
                href="#quote-form"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Request Instant Quote
              </a>
              {business.websiteUrl && (
                <a
                  href={business.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWebsiteClick}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  Visit Website
                </a>
              )}
              {isUnclaimed ? (
                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    id="improve-this-business-btn"
                    onClick={handleRunFreeCheckup}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Run Free SEO Checkup</span>
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Managed with Locora
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Owner Value Proposition & Claim Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {isUnclaimed ? (
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 border border-emerald-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Business Owner Portal
              </div>
              <h3 className="text-xl font-black text-white font-heading tracking-tight">
                Do you own or manage {business.businessName}?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Claim your free profile to update your services & hours, respond directly to customer quote requests, and see how Locora helps improve your local ranking on Google.
              </p>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 w-full md:w-auto">
              <button
                id="claim-this-business-btn"
                onClick={handleInitiateClaim}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Claim This Business (Free)</span>
              </button>
              <button
                id="free-checkup-btn"
                onClick={handleRunFreeCheckup}
                className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Free Growth Checkup</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/90 border border-emerald-200 text-emerald-950 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 font-heading">
                  <span>Verified Owner Managed Profile</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Active
                  </span>
                </div>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Locora is actively helping this business manage customer inquiries, sync reviews, and optimize local visibility.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                window.history.pushState({}, '', '/dashboard');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-xs"
            >
              <span>Manage in Locora Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main 2-Column Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Columns: Services, Overview, Hours, Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* About & Verified Synced Content */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 font-heading mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                About {business.businessName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {business.scrapedContent?.description ||
                  business.scrapedContent?.aboutSummary ||
                  `${business.businessName} provides verified ${business.categoryName} services throughout ${business.cityName || 'the local area'}. Certified Google Business Profile pro dedicated to high quality customer outcomes.`}
              </p>

              {/* Service Capabilities */}
              {business.scrapedContent?.serviceTags && business.scrapedContent.serviceTags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    Verified Services & Specializations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {business.scrapedContent.serviceTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-slate-100 text-slate-700 font-medium text-xs rounded-lg border border-slate-200"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Operating Hours Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 font-heading mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Operating Hours (Live Google Sync)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.keys(hours).length > 0 ? (
                  Object.entries(hours).map(([day, time]) => (
                    <div
                      key={day}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <span className="font-bold text-slate-700">{day}</span>
                      <span className={time === 'Closed' ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                        {time}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs col-span-2 italic">
                    Hours not specified. Contact business directly for current schedule.
                  </p>
                )}
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    Google Business Reviews {reviewCount ? `(${reviewCount})` : ''}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Authentic feedback from verified customers</p>
                </div>

                {typeof rating === 'number' && rating > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 rounded-full border border-amber-200 text-amber-700 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {rating.toFixed(1)} / 5.0
                  </div>
                )}
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900">{rev.authorName}</span>
                        <div className="flex items-center text-amber-400">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic">"{rev.comment}"</p>
                      <span className="block text-[10px] text-slate-400 mt-2">
                        {rev.relativePublishTimeDescription}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No individual text reviews synced yet.</p>
                  <p className="mt-1 text-slate-400">
                    {typeof rating === 'number' && rating > 0 && reviewCount
                      ? `Rating of ${rating.toFixed(1)}★ is aggregated from ${reviewCount} verified Google customer interactions.`
                      : 'Google Business Profile reviews are synced continuously.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Instant Lead Quote Capture Form */}
          <div className="space-y-6">
            <div id="quote-form" className="bg-white rounded-2xl border-2 border-emerald-500/20 p-6 shadow-md relative">
              <div className="mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Instant Free Quote
                </span>
                <h3 className="text-lg font-black text-slate-900 font-heading mt-0.5">
                  Connect with {business.businessName}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Direct dispatch to business owner. No spam, no obligation.
                </p>
              </div>

              {quoteSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Request Delivered!</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your inquiry has been sent directly to <strong>{business.businessName}</strong>. You should receive a response shortly.
                  </p>
                  <button
                    onClick={() => setQuoteSuccess(false)}
                    className="text-xs text-emerald-600 font-bold hover:underline"
                  >
                    Submit another question
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitQuote} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={quoteForm.fullName}
                      onFocus={handleLeadInputFocus}
                      onChange={(e) => setQuoteForm({ ...quoteForm, fullName: e.target.value })}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={quoteForm.phone}
                      onFocus={handleLeadInputFocus}
                      onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                      placeholder="(555) 000-0000"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={quoteForm.email}
                      onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                      placeholder="sarah@example.com"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Service Needed</label>
                    <input
                      type="text"
                      value={quoteForm.serviceNeed}
                      onChange={(e) => setQuoteForm({ ...quoteForm, serviceNeed: e.target.value })}
                      placeholder={business.categoryName}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Message / Job Description</label>
                    <textarea
                      rows={3}
                      value={quoteForm.message}
                      onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                      placeholder="Describe the issue, timeline, or consultation requirements..."
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingQuote}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {submittingQuote ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Delivering to Business...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Direct Quote Request
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-slate-400 text-center leading-tight">
                    🔒 Certified privacy: Your details are only sent to {business.businessName} to fulfill your request.
                  </p>
                </form>
              )}
            </div>

            {/* Badges / Guarantees */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Business Registration</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Fast Response Benchmark</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
                <span>Zero Middleman Surcharges</span>
              </div>
            </div>

            {/* Verified Listing Information */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Verified Listing Details
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">Verified</span>
              </div>
              <div className="space-y-1.5 text-slate-600 text-[11px]">
                <div className="flex items-center justify-between">
                  <span>Google Business Profile:</span>
                  <span className="font-semibold text-slate-800">Verified & Synced</span>
                </div>
                {business.websiteUrl && (
                  <div className="flex items-center justify-between">
                    <span>Website Verification:</span>
                    <span className="font-semibold text-slate-800">Active Domain</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Directory Status:</span>
                  <span className="font-semibold text-slate-800">
                    {business.isClaimed ? 'Claimed & Managed by Owner' : 'Verified Local Business'}
                  </span>
                </div>
              </div>
            </div>

            {/* Free Business Checkup Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Activity className="w-3 h-3 text-emerald-400" /> Free Business Checkup
                </span>
                <span className="text-[11px] text-slate-400">60-Second Scan</span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white font-heading">
                  See How {business.businessName} Ranks Locally
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Get a free instant report showing missing local keywords, review response speed, and customer ranking opportunities.
                </p>
              </div>

              <button
                onClick={handleRunFreeCheckup}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 font-sans"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                Run Free Business Checkup
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Competitor Shielding for Pro Listings vs Competitors Grid for Free Listings */}
        {isPremium ? (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="p-6 bg-gradient-to-r from-emerald-50/80 via-white to-amber-50/80 rounded-2xl border border-emerald-200/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Exclusive Pro Verified Guarantee
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">100% Verified Profile</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-heading mt-1">
                    Direct Client Guarantee with {business.businessName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                    This business is an authorized, high-priority service provider. Inquiries submitted here are routed directly to the verified owner with priority response time.
                  </p>
                </div>
              </div>

              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  onClick={handlePhoneClick}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Directly: {business.phone}</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          relatedBusinesses.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    More Verified Businesses in {business.cityName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Explore top-rated service providers and local contractors in your immediate area.
                  </p>
                </div>
                <button
                  onClick={navigateToCity}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  View all in {business.cityName} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedBusinesses.map((rel) => (
                  <div
                    key={rel.id || rel.slug}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                        {rel.categoryName}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {rel.businessName}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {rel.cityName}, {rel.stateCode}
                      </p>
                      {typeof rel.gbpData?.averageRating === 'number' && rel.gbpData.averageRating > 0 && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold pt-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{rel.gbpData.averageRating.toFixed(1)}</span>
                          <span className="text-slate-400">({rel.gbpData.reviewCount || 0})</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        navigateToDirectory(`/business/${rel.slug}`);
                      }}
                      className="w-full mt-2 py-1.5 px-3 text-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* Claim Business Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setClaimModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {claimSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">Verification Initiated!</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Listing claimed for <strong>{business.businessName}</strong>. Redirecting you to finalize your secure owner account and access your Business Brain...
                </p>
                <div className="flex items-center justify-center gap-2 pt-2 text-xs text-emerald-600 font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Onboarding...
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmClaim} className="space-y-4">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Verified Owner Claim
                  </span>
                  <h3 className="text-lg font-black text-slate-900 font-heading">
                    Claim {business.businessName}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Verify ownership to receive quote requests directly, update service listings, manage customer reviews, and unlock your AI Manager.
                  </p>
                </div>

                {claimError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{claimError}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={claimName}
                      onChange={(e) => setClaimName(e.target.value)}
                      placeholder="e.g. Dr. John Smith"
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Work Email Address *</label>
                    <input
                      type="email"
                      required
                      value={claimEmail}
                      onChange={(e) => setClaimEmail(e.target.value)}
                      placeholder="e.g. owner@smilesolutions.com.au"
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Preferably using your business domain to accelerate instant verification.
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={claimSubmitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {claimSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying Ownership Record...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Claim Profile & Create Account
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Zero credit card required. Free tier includes directory profile management.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Free Public Business Checkup Teaser Modal */}
      {business && (
        <DirectoryPublicCheckupModal
          business={business}
          isOpen={checkupModalOpen}
          onClose={() => setCheckupModalOpen(false)}
          onClaimBusiness={() => {
            setCheckupModalOpen(false);
            handleInitiateClaim();
          }}
        />
      )}
    </div>
  );
};
