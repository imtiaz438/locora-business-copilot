import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Link2,
  FileEdit,
  Building2,
  MapPin,
  Tag,
  Phone,
  Mail,
  Info,
} from 'lucide-react';
import { getDirectoryBusinessUrl, getDirectorySiteUrl } from '../utils/domain';

interface DirectoryPublishingCardProps {
  activeBusiness: any;
  businessProfile: any;
  user: any;
  profileForm: any;
  setProfileForm: React.Dispatch<React.SetStateAction<any>>;
  updateBusinessProfile: (data: any) => void;
  onNavigateToProfileDetails?: () => void;
}

interface EligibilityData {
  loading: boolean;
  eligible: boolean;
  status: 'UNPUBLISHED' | 'ELIGIBLE' | 'PUBLISHED' | 'CLAIM_PENDING' | 'CLAIMED' | 'VERIFIED' | 'SUSPENDED';
  reasons: string[];
  missingFields: string[];
  qualityStatus: 'basic' | 'good' | 'complete' | 'verified';
  qualityScore: number;
  slug: string;
  publicProfileUrl: string | null;
  qualitySignals?: {
    hasWebsite: boolean;
    hasPhone: boolean;
    hasDescription: boolean;
    hasServices: boolean;
    hasGbpData: boolean;
    hasCity: boolean;
    hasCategory: boolean;
  };
}

export const DirectoryPublishingCard: React.FC<DirectoryPublishingCardProps> = ({
  activeBusiness,
  businessProfile,
  user,
  profileForm,
  setProfileForm,
  updateBusinessProfile,
  onNavigateToProfileDetails,
}) => {
  const [eligibility, setEligibility] = useState<EligibilityData>({
    loading: true,
    eligible: false,
    status: profileForm.isPublishedInDirectory ? 'PUBLISHED' : 'UNPUBLISHED',
    reasons: [],
    missingFields: [],
    qualityStatus: 'basic',
    qualityScore: 0,
    slug: activeBusiness?.slug || '',
    publicProfileUrl: activeBusiness?.slug ? getDirectoryBusinessUrl(activeBusiness.slug) : null,
  });

  const [publishing, setPublishing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const fetchEligibility = async () => {
    if (!activeBusiness?.id) return;
    setEligibility((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`/api/directory/eligibility?businessId=${encodeURIComponent(activeBusiness.id)}`);
      const data = await res.json();
      if (data.success) {
        setEligibility({
          loading: false,
          eligible: data.eligible,
          status: data.status,
          reasons: data.reasons || [],
          missingFields: data.missingFields || [],
          qualityStatus: data.qualityStatus || 'basic',
          qualityScore: data.qualityScore || 0,
          slug: data.slug || activeBusiness.slug || '',
          publicProfileUrl: data.publicProfileUrl || (data.slug ? getDirectoryBusinessUrl(data.slug) : null),
          qualitySignals: data.qualitySignals,
        });

        if (data.isPublishedInDirectory !== undefined) {
          setProfileForm((prev: any) => ({
            ...prev,
            isPublishedInDirectory: data.isPublishedInDirectory,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch directory eligibility:', err);
    } finally {
      setEligibility((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchEligibility();
  }, [activeBusiness?.id]);

  const handleToggle = async (checked: boolean) => {
    setPublishing(true);
    setFeedback(null);
    try {
      const endpoint = checked ? '/api/directory/publish' : '/api/directory/unpublish';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: activeBusiness.id,
          userEmail: user?.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfileForm((prev: any) => ({ ...prev, isPublishedInDirectory: checked }));
        updateBusinessProfile({ isPublishedInDirectory: checked });
        setFeedback({
          type: 'success',
          message: checked
            ? '🎉 Business published to the Locora Business Directory! Your public listing is live.'
            : 'Business listing unpublished from directory.',
        });
        await fetchEligibility();
      } else {
        const errorMsg = data.reasons?.length ? data.reasons.join(' ') : (data.error || data.message || 'Failed to update directory publishing status.');
        setFeedback({
          type: 'error',
          message: errorMsg,
        });
        // Revert toggle
        setProfileForm((prev: any) => ({ ...prev, isPublishedInDirectory: !checked }));
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Network error updating directory status.',
      });
    } finally {
      setPublishing(false);
    }
  };

  const dynamicSlug = useMemo(() => {
    const raw = eligibility.slug || activeBusiness?.slug || '';
    if (raw && !raw.startsWith('biz_') && !raw.includes('@') && !raw.includes('_gmail')) {
      return raw.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    const name = activeBusiness?.name || 'Locora';
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'locora';
  }, [eligibility.slug, activeBusiness?.slug, activeBusiness?.name]);

  const publicUrl = eligibility.publicProfileUrl || getDirectoryBusinessUrl(dynamicSlug);

  const handleCopyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isLive = eligibility.status === 'PUBLISHED' || eligibility.status === 'VERIFIED';
  const isEligible = eligibility.eligible;
  const isSuspended = eligibility.status === 'SUSPENDED';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Globe className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                <span>Publish my business to the Locora Business Directory</span>
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Feature your verified business profile, location, services, hours, and customer inquiry form on{' '}
                <span className="font-semibold text-slate-700">directory.locoraai.com</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Directory Status Pill */}
        <div className="flex items-center gap-2">
          {eligibility.loading ? (
            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
              <span>Checking...</span>
            </span>
          ) : isSuspended ? (
            <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-xs font-bold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Status: Suspended by Admin</span>
            </span>
          ) : isLive ? (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Directory Status: Published</span>
            </span>
          ) : isEligible ? (
            <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Directory Status: Eligible</span>
            </span>
          ) : (
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-full text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Directory Status: Not Eligible</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Publishing Switch Box */}
      <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              Directory Publishing Status:
            </span>
            <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-md ${
              profileForm.isPublishedInDirectory
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-200 text-slate-700'
            }`}>
              {profileForm.isPublishedInDirectory ? 'ON' : 'OFF'}
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            {profileForm.isPublishedInDirectory
              ? 'Your business is currently live in the public directory and indexed for local search.'
              : 'Turn ON to push this business to the public directory. Only requires standard profile info.'}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={profileForm.isPublishedInDirectory === true}
              onChange={(e) => handleToggle(e.target.checked)}
              disabled={publishing || (!isEligible && !profileForm.isPublishedInDirectory)}
              className="sr-only peer"
            />
            <div className={`w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
              !isEligible && !profileForm.isPublishedInDirectory ? 'opacity-50 cursor-not-allowed' : 'peer-checked:bg-emerald-600'
            }`}></div>
          </label>

          <button
            type="button"
            onClick={() => handleToggle(!profileForm.isPublishedInDirectory)}
            disabled={publishing || (!isEligible && !profileForm.isPublishedInDirectory)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer ${
              profileForm.isPublishedInDirectory
                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {publishing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : profileForm.isPublishedInDirectory ? (
              <span>Unpublish Listing</span>
            ) : (
              <span>Publish to Locora Directory</span>
            )}
          </button>
        </div>
      </div>

      {/* Missing Requirements Alert if Not Eligible */}
      {!isEligible && !eligibility.loading && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-amber-900 font-heading">
                Complete your Business Profile to become eligible.
              </div>
              <div className="mt-1 text-amber-800">
                Missing required data: <span className="font-bold underline">{eligibility.missingFields.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-amber-200/60 text-xs text-amber-900 space-y-1.5">
            <div className="font-semibold text-[11px] uppercase tracking-wider text-amber-800">
              Reasons for Ineligibility:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {eligibility.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          {onNavigateToProfileDetails && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onNavigateToProfileDetails}
                className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Edit Business Profile Details</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Feedback Messages */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-rose-50 text-rose-900 border border-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Public Profile URL Box */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 font-heading flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Public Directory Profile URL</span>
          </span>
          <button
            type="button"
            onClick={fetchEligibility}
            disabled={eligibility.loading}
            className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${eligibility.loading ? 'animate-spin' : ''}`} />
            <span>Re-check Eligibility</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 select-all overflow-x-auto truncate">
            {publicUrl}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>View Live Listing</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Real Data & Quality Signals Section */}
      <div className="border-t border-slate-100 pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 font-heading">
              Directory Quality Score & Signals
            </h4>
            <p className="text-[11px] text-slate-500 font-sans">
              Computed strictly from verified business profile data. No AI hallucinations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-xs font-extrabold text-slate-900">{eligibility.qualityScore}%</div>
              <div className="text-[10px] text-slate-400 capitalize">{eligibility.qualityStatus} Profile</div>
            </div>
            <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${eligibility.qualityScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quality signals grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className={`p-3 rounded-xl border ${
            profileForm.name ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Name</span>
            </div>
            <span className="text-[11px] truncate block font-medium">
              {profileForm.name || 'Missing'}
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${
            profileForm.category ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Tag className="w-3.5 h-3.5" />
              <span>Category</span>
            </div>
            <span className="text-[11px] truncate block font-medium">
              {profileForm.category || 'Missing'}
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${
            profileForm.city ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Primary City</span>
            </div>
            <span className="text-[11px] truncate block font-medium">
              {profileForm.city || 'Missing'}
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${
            profileForm.country ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Globe className="w-3.5 h-3.5" />
              <span>Country</span>
            </div>
            <span className="text-[11px] truncate block font-medium">
              {profileForm.country || 'Missing'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
            profileForm.phone ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] truncate">{profileForm.phone ? 'Phone Provided' : 'No Phone'}</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
            profileForm.website ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] truncate">{profileForm.website ? 'Website Linked' : 'No Website'}</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
            profileForm.description ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <FileEdit className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] truncate">{profileForm.description ? 'Bio Written' : 'No Bio'}</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
            (profileForm.services && profileForm.services.length > 0) ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] truncate">
              {profileForm.services?.length ? `${profileForm.services.length} Services` : '0 Services'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
