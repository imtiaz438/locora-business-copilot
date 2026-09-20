import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Building2,
  XCircle,
  Power,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Info,
} from 'lucide-react';

export const BusinessDirectoryTab: React.FC = () => {
  const {
    activeBusiness,
    businesses,
    switchBusiness,
    updateActiveBusiness,
    user,
    setActiveTab,
  } = useApp();

  const isPublished = Boolean(activeBusiness.isPublishedInDirectory);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Eligibility checks based on activeBusiness truth
  const hasName = Boolean(activeBusiness.name && activeBusiness.name.trim().length > 0);
  const hasCategory = Boolean(activeBusiness.category && activeBusiness.category.trim().length > 0);
  const hasLocation = Boolean(
    (activeBusiness.city && activeBusiness.city.trim().length > 0) ||
    (activeBusiness.address && activeBusiness.address.trim().length > 0)
  );
  const hasPublicInfo = Boolean(
    (activeBusiness.website && activeBusiness.website.trim().length > 0) ||
    (activeBusiness.phone && activeBusiness.phone.trim().length > 0) ||
    (activeBusiness.description && activeBusiness.description.trim().length > 0)
  );

  const isEligible = hasName && hasCategory && hasLocation && hasPublicInfo;

  const handlePublish = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/directory/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify({
          businessId: activeBusiness.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to publish to directory.');
      }

      if (updateActiveBusiness) {
        updateActiveBusiness({
          isPublishedInDirectory: true,
          slug: data.slug || activeBusiness.slug,
          directorySlug: data.slug || activeBusiness.slug,
        });
      }

      setFeedback({
        type: 'success',
        message: `"${activeBusiness.name}" is now Published to the public Directory! (Other businesses remain unchanged).`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error publishing to directory.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/directory/unpublish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify({
          businessId: activeBusiness.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to unpublish.');
      }

      if (updateActiveBusiness) {
        updateActiveBusiness({
          isPublishedInDirectory: false,
        });
      }

      setFeedback({
        type: 'success',
        message: `"${activeBusiness.name}" has been unpublished from the Directory.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error unpublishing from directory.',
      });
    } finally {
      setLoading(false);
    }
  };

  const directoryUrl = `https://directory.locoraai.com/biz/${activeBusiness.slug || activeBusiness.id}`;

  return (
    <div className="space-y-6 font-sans">
      {/* Header Context */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-50 text-[#059669] border border-emerald-200">
            <Globe className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold font-heading text-slate-900">
              Directory Publishing: {activeBusiness.name}
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Directory is an opt-in publishing feature belonging to this Business. Creating a business does not automatically publish it.
            </p>
          </div>
        </div>
      </div>

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
        </div>
      )}

      {/* 1. DIRECTORY STATUS CARD (Exact specification from prompt) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
              Current Publishing State
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h3 className="text-lg font-bold font-heading text-slate-900">
                Directory Status:
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isPublished
                    ? 'bg-emerald-100 text-[#059669] border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPublished ? 'bg-[#059669] animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span>{isPublished ? 'Published' : 'Not Published'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPublished ? (
              <>
                <a
                  href={directoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Live Listing</span>
                </a>
                <button
                  onClick={handleUnpublish}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Unpublish from Directory'}
                </button>
              </>
            ) : (
              <button
                onClick={handlePublish}
                disabled={loading || !isEligible}
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    <span>Publish to Directory</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 2. ELIGIBILITY CHECKLIST */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
              Eligibility Checklist
            </h4>
            <span className="text-[11px] text-slate-500">
              {isEligible ? 'All criteria met' : 'Complete missing fields in Business → Profile'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Checklist Item 1: Name */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {hasName ? (
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-900 font-heading">
                    ✓ Name
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {activeBusiness.name || 'Not set'}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold ${hasName ? 'text-[#059669]' : 'text-rose-500'}`}>
                {hasName ? 'Verified' : 'Required'}
              </span>
            </div>

            {/* Checklist Item 2: Category */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {hasCategory ? (
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-900 font-heading">
                    ✓ Category
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {activeBusiness.category || 'Not set'}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold ${hasCategory ? 'text-[#059669]' : 'text-rose-500'}`}>
                {hasCategory ? 'Verified' : 'Required'}
              </span>
            </div>

            {/* Checklist Item 3: Location */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {hasLocation ? (
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-900 font-heading">
                    ✓ Location
                  </p>
                  <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                    {activeBusiness.city ? `${activeBusiness.city}, ${activeBusiness.state || activeBusiness.country || ''}` : (activeBusiness.address || 'Not set')}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold ${hasLocation ? 'text-[#059669]' : 'text-rose-500'}`}>
                {hasLocation ? 'Verified' : 'Required'}
              </span>
            </div>

            {/* Checklist Item 4: Public Information */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {hasPublicInfo ? (
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-900 font-heading">
                    ✓ Public Information
                  </p>
                  <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                    {activeBusiness.phone || activeBusiness.website || 'Verified details'}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold ${hasPublicInfo ? 'text-[#059669]' : 'text-rose-500'}`}>
                {hasPublicInfo ? 'Verified' : 'Add phone/website'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INDEPENDENT PER-BUSINESS DIRECTORY MATRIX */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#059669]" />
          <h3 className="text-sm font-bold font-heading text-slate-900">
            Per-Business Directory Isolation
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Each Business controls its own directory status independently. Publishing <strong>{activeBusiness.name}</strong> will never publish your other businesses.
        </p>

        {/* Multi-business matrix */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-2xs">
          {businesses.map((biz) => {
            const isCurrent = biz.id === activeBusiness.id;
            const bizPublished = Boolean(biz.isPublishedInDirectory);

            return (
              <div
                key={biz.id}
                className={`p-3.5 flex items-center justify-between transition-colors ${
                  isCurrent ? 'bg-emerald-50/30' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 font-heading">
                        {biz.name}
                      </p>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-[#059669]">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {biz.city ? `${biz.city}, ${biz.state || ''}` : 'Location unconfigured'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      bizPublished
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        bizPublished ? 'bg-emerald-600' : 'bg-slate-400'
                      }`}
                    />
                    <span>Directory {bizPublished ? 'ON' : 'OFF'}</span>
                  </span>

                  {!isCurrent && (
                    <button
                      onClick={() => switchBusiness(biz.id)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer underline"
                    >
                      Switch to manage
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
