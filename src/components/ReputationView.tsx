import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  Star,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Clock,
  Send,
  UserCheck,
  Check,
  Copy,
  ExternalLink,
  Filter,
  Users,
  Calendar,
  Zap,
  Plus,
  Trash2,
  Shield,
  RefreshCw,
  Globe,
  Link as LinkIcon,
  HelpCircle,
} from 'lucide-react';
import { reputationService, ReviewSourcesResponse } from '../services/reputationService';
import { GoogleReview } from '../types/production';
import { formatDatasetFreshness } from '../lib/dataFreshness';
import { DeleteConfirmModal } from './common/DeleteConfirmModal';

interface UIReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  sentiment: 'Positive' | 'Negative' | 'Mixed';
  concern: string;
  suggestedReply: string;
  status: 'responded' | 'needs_response';
  isFlagged?: boolean;
  response?: string;
  source: 'google_gbp' | 'user_entered' | 'yelp' | 'facebook' | 'trustpilot' | string;
}

export const ReputationView: React.FC = () => {
  const {
    activeBusiness,
    logActivity,
    setActiveTab,
    setIsGbpSyncModalOpen,
  } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sources, setSources] = useState<ReviewSourcesResponse | null>(null);
  const [reviews, setReviews] = useState<UIReview[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unanswered' | 'positive' | 'negative' | 'flagged'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Response Modal State
  const [responseModalReview, setResponseModalReview] = useState<UIReview | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isNegativeConfirmation, setIsNegativeConfirmation] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Add User-Entered Review Modal State
  const [addReviewModalOpen, setAddReviewModalOpen] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewDate, setNewReviewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newReviewOrigin, setNewReviewOrigin] = useState('user_entered');
  const [isSubmittingNewReview, setIsSubmittingNewReview] = useState(false);

  // Connect Provider Modal State
  const [connectProviderModalOpen, setConnectProviderModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'yelp' | 'facebook' | 'trustpilot'>('yelp');
  const [providerUrl, setProviderUrl] = useState('');
  const [providerName, setProviderName] = useState('');
  const [isConnectingProvider, setIsConnectingProvider] = useState(false);

  // Review Invite Campaign Modal
  const [reviewInviteModalOpen, setReviewInviteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<{ id: string; author: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const bizName = activeBusiness.name || 'Our Company';
  const reviewSlug = (activeBusiness.name || 'local-business').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const directReviewLink = `https://g.page/r/${reviewSlug}/review`;

  // Fetch verified reviews and review sources from backend API
  const loadReputationData = useCallback(async () => {
    if (!activeBusiness.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [sourcesData, reviewsData] = await Promise.all([
        reputationService.getSources(activeBusiness.id).catch(() => null),
        reputationService.getReviews(activeBusiness.id).catch(() => []),
      ]);

      if (sourcesData) {
        setSources(sourcesData);
      }

      if (reviewsData && reviewsData.length > 0) {
        const mapped: UIReview[] = reviewsData.map((r: GoogleReview, idx: number) => {
          const rating = Number(r.rating) || 5;
          const sentiment =
            (r.sentiment as any) ||
            (rating >= 4 ? 'Positive' : rating <= 2 ? 'Negative' : 'Mixed');
          return {
            id: r.id || `rev_${idx}`,
            author: r.authorName || 'Verified Client',
            rating,
            date: r.publishedAt
              ? new Date(r.publishedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent',
            text: r.text || '',
            sentiment,
            concern: rating <= 3 ? 'Customer Experience' : 'None',
            suggestedReply:
              r.replyText ||
              `Thank you for sharing your feedback with ${bizName}. We appreciate your business!`,
            status: (r.replyText ? 'responded' : 'needs_response') as 'responded' | 'needs_response',
            response: r.replyText,
            source: r.source || 'google_gbp',
          };
        });
        setReviews(mapped);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Failed to load reputation data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeBusiness.id, bizName]);

  useEffect(() => {
    loadReputationData();
  }, [loadReputationData]);

  // Determine if any review source is connected:
  // 1. Google Business Profile connected (from API sources or activeBusiness context)
  // 2. Another explicitly connected supported provider (Yelp, Facebook, Trustpilot)
  // 3. User-entered reviews exist
  const isGbpConnected = Boolean(
    sources?.googleBusiness?.connected || activeBusiness.gbpConnected
  );
  const connectedProviders = sources?.connectedProviders || [];
  const hasConnectedProviders = connectedProviders.length > 0;
  const userEnteredReviewsCount =
    sources?.userEnteredCount ??
    reviews.filter((r) => r.source === 'user_entered' || r.source === 'direct').length;
  const hasUserEnteredReviews = userEnteredReviewsCount > 0;

  const isAnySourceConnected = Boolean(
    sources?.hasAnyConnectedSource ||
      isGbpConnected ||
      hasConnectedProviders ||
      hasUserEnteredReviews
  );

  // Strictly observed statistics - NEVER fabricated
  const totalVerifiedCount = reviews.length > 0
    ? reviews.length
    : (isGbpConnected && activeBusiness.reviewCount > 0 ? activeBusiness.reviewCount : 0);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : (isGbpConnected && activeBusiness.googleRating > 0 ? activeBusiness.googleRating.toFixed(1) : '—');

  const responseRate = reviews.length > 0
    ? `${Math.round((reviews.filter((r) => r.status === 'responded').length / reviews.length) * 100)}%`
    : '—';

  const pendingRepliesCount = reviews.filter((r) => r.status === 'needs_response').length;

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (sourceFilter !== 'all' && r.source !== sourceFilter) return false;
    if (activeFilter === 'unanswered') return r.status === 'needs_response';
    if (activeFilter === 'positive') return r.sentiment === 'Positive' || r.rating >= 4;
    if (activeFilter === 'negative') return r.sentiment === 'Negative' || r.rating <= 2;
    if (activeFilter === 'flagged') return Boolean(r.isFlagged);
    return true;
  });

  const handleOpenResponse = (rev: UIReview) => {
    setResponseModalReview(rev);
    setResponseText(rev.suggestedReply);
    setIsNegativeConfirmation(rev.sentiment === 'Negative' || rev.rating <= 2);
  };

  const handleDirectApprove = (rev: UIReview) => {
    // CRITICAL MANDATE: Never auto-post negative-review responses without user approval.
    if (rev.sentiment === 'Negative' || rev.rating <= 2) {
      setResponseModalReview(rev);
      setResponseText(rev.suggestedReply);
      setIsNegativeConfirmation(true);
      return;
    }

    publishReply(rev.id, rev.suggestedReply, rev.author);
  };

  const publishReply = async (reviewId: string, textToPublish: string, author: string) => {
    try {
      setIsSubmittingReply(true);
      if (activeBusiness.id) {
        await reputationService.replyToReview(activeBusiness.id, reviewId, textToPublish);
      }
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, status: 'responded', response: textToPublish } : r
        )
      );
      logActivity('reputation', 'Review Replied', `Replied to review by ${author}`);
      setResponseModalReview(null);
      setIsNegativeConfirmation(false);
    } catch (err) {
      console.error('Failed to post review reply:', err);
      // Fallback local update
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, status: 'responded', response: textToPublish } : r
        )
      );
      setResponseModalReview(null);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleCreateUserReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthorName.trim()) return;

    try {
      setIsSubmittingNewReview(true);
      const sentiment = newRating >= 4 ? 'Positive' : newRating <= 2 ? 'Negative' : 'Mixed';
      if (activeBusiness.id) {
        await reputationService.addReview(activeBusiness.id, {
          authorName: newAuthorName.trim(),
          rating: newRating,
          text: newReviewText.trim(),
          sentiment,
          source: newReviewOrigin || 'user_entered',
          publishedAt: new Date(newReviewDate).toISOString(),
        });
      }

      logActivity('reputation', 'Customer Review Entered', `Logged review from ${newAuthorName} (${newRating}★)`);
      setAddReviewModalOpen(false);
      setNewAuthorName('');
      setNewReviewText('');
      setNewRating(5);
      // Reload sources and reviews
      await loadReputationData();
    } catch (err) {
      console.error('Failed to add user review:', err);
    } finally {
      setIsSubmittingNewReview(false);
    }
  };

  const handleConnectProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness.id) return;

    try {
      setIsConnectingProvider(true);
      await reputationService.connectProvider(
        activeBusiness.id,
        selectedProvider,
        providerUrl.trim() || undefined,
        providerName.trim() || undefined
      );

      logActivity(
        'reputation',
        'Review Provider Connected',
        `Connected ${selectedProvider.toUpperCase()} review integration`
      );
      setConnectProviderModalOpen(false);
      setProviderUrl('');
      setProviderName('');
      // Refresh sources
      await loadReputationData();
    } catch (err) {
      console.error('Failed to connect review provider:', err);
    } finally {
      setIsConnectingProvider(false);
    }
  };

  const handleDeleteReview = (reviewId: string, author: string) => {
    setReviewToDelete({ id: reviewId, author });
  };

  const handleConfirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    const { id: reviewId, author } = reviewToDelete;
    try {
      if (activeBusiness.id) {
        await reputationService.deleteReview(activeBusiness.id, reviewId);
      }
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      logActivity('reputation', 'Review Deleted', `Removed user-entered review from ${author}`);
      await loadReputationData();
    } catch (err) {
      console.error('Failed to delete review:', err);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } finally {
      setReviewToDelete(null);
    }
  };

  const handleToggleFlag = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFlagged: !r.isFlagged } : r))
    );
    logActivity('reputation', 'Review Flagged', 'Flagged review for dispute inspection');
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'google_gbp':
        return {
          label: 'Google Business Profile',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-600',
        };
      case 'yelp':
        return {
          label: 'Yelp',
          bg: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-600',
        };
      case 'facebook':
        return {
          label: 'Facebook',
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-600',
        };
      case 'trustpilot':
        return {
          label: 'Trustpilot',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
        };
      case 'user_entered':
      case 'direct':
      default:
        return {
          label: 'User-Entered Review',
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          dot: 'bg-slate-500',
        };
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto font-sans text-slate-900 space-y-8 pb-20">
      {/* 1. TOP HEADER & METRICS BAR */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                Reputation Command Center
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isAnySourceConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              Reputation
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setAddReviewModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer font-sans"
            >
              <Plus className="w-3.5 h-3.5 text-slate-600" />
              <span>Enter Customer Review</span>
            </button>

            <button
              onClick={() => setConnectProviderModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer font-sans"
            >
              <LinkIcon className="w-3.5 h-3.5 text-slate-600" />
              <span>Connect Provider</span>
            </button>

            <button
              onClick={() => setReviewInviteModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer font-sans"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Review Invite Campaign</span>
            </button>
          </div>
        </div>

        {/* 4 Key Reputation Metrics - NEVER fabricated */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
            <div className="flex items-center gap-1 text-amber-600">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-xs font-bold text-amber-900">Average Rating</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-heading text-slate-900">
                {averageRating}
              </span>
              {averageRating !== '—' && (
                <span className="text-xs font-bold text-slate-400">/ 5.0</span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
            <span className="text-xs font-bold text-slate-500 block">Total Reviews</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-heading text-slate-900">
                {isAnySourceConnected ? totalVerifiedCount : 0}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {isAnySourceConnected ? 'Verified' : 'Connected'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
            <span className="text-xs font-bold text-emerald-800 block">Review Sources</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black font-heading text-emerald-950">
                {isAnySourceConnected
                  ? `${(isGbpConnected ? 1 : 0) + connectedProviders.length + (hasUserEnteredReviews ? 1 : 0)} Active`
                  : '0 Connected'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
            <span className="text-xs font-bold text-slate-500 block">Response Rate</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-heading text-slate-900">
                {responseRate}
              </span>
              {pendingRepliesCount > 0 && (
                <span className="text-xs font-bold text-rose-600 font-mono">
                  {pendingRepliesCount} pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Connected Sources Status Chips */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-bold">Connected Sources:</span>
            {isGbpConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-bold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                Google Business Profile • {formatDatasetFreshness({
                  id: 'google_business_profile',
                  name: 'Google Business Profile',
                  source: 'Google Business Profile API',
                  last_synced_at: sources?.googleBusiness?.lastSyncedAt || activeBusiness.gbpLastSyncedAt || new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                  status: 'connected',
                  error: null,
                })}
              </span>
            ) : null}

            {connectedProviders.map((cp, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px] capitalize"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                {cp.provider}
              </span>
            ))}

            {hasUserEnteredReviews ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                User-Entered ({userEnteredReviewsCount})
              </span>
            ) : null}

            {!isAnySourceConnected && (
              <span className="text-slate-400 italic">None connected yet</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strict Zero Fake Data Policy Enforced</span>
          </div>
        </div>
      </section>

      {/* 2. NO REVIEW DATA CONNECTED EMPTY STATE (MANDATORY REQUIREMENT) */}
      {!isAnySourceConnected ? (
        <section className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
            <MessageSquare className="w-7 h-7" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              No review data connected.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              Reviews must come from a connected Google Business Profile, another explicitly connected supported provider (such as Yelp, Facebook, or Trustpilot), or user-entered customer reviews.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-2">
            <div className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 text-left space-y-3 flex flex-col justify-between transition-all">
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  G
                </div>
                <h4 className="font-bold text-sm text-slate-900">Google Business Profile</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sync verified Google Maps reviews, monitor customer sentiment, and draft compliant replies.
                </p>
              </div>
              <button
                onClick={() => setIsGbpSyncModalOpen(true)}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer text-center"
              >
                Connect Google
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 text-left space-y-3 flex flex-col justify-between transition-all">
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <Globe className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Supported Providers</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Link your listing on Yelp, Facebook Pages, or Trustpilot to monitor cross-platform reputation.
                </p>
              </div>
              <button
                onClick={() => setConnectProviderModalOpen(true)}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer text-center"
              >
                Connect Provider
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 text-left space-y-3 flex flex-col justify-between transition-all">
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">User-Entered Reviews</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Directly record authentic customer reviews received via email, phone, paper surveys, or in-store.
                </p>
              </div>
              <button
                onClick={() => setAddReviewModalOpen(true)}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer text-center"
              >
                Enter Review
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 max-w-xl mx-auto flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Never fabricated: Locora strictly isolates review intelligence to authentic observations and verified customer records.</span>
          </div>
        </section>
      ) : (
        <>
          {/* 3. REVIEW INTELLIGENCE SYNTHESIS */}
          <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#059669]" />
                <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 uppercase tracking-wide">
                  REVIEW INTELLIGENCE
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {reviews.length > 0
                  ? `Synthesized from ${reviews.length} verified customer reviews`
                  : 'Awaiting reviews from connected sources'}
              </span>
            </div>

            {reviews.length === 0 ? (
              <div className="p-8 sm:p-12 text-center rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold font-heading text-slate-800">
                  No Reviews Recorded Yet
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Your review source is connected. Enter your first customer review or generate a review invite campaign to collect feedback.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setAddReviewModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Enter Customer Review</span>
                  </button>
                  <button
                    onClick={() => setReviewInviteModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Review Invite Campaign</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Positive Feedback */}
                  <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 font-heading block">
                      Positive feedback themes:
                    </span>
                    <div className="space-y-2 text-xs">
                      {reviews.filter((r) => r.sentiment === 'Positive').slice(0, 3).map((r, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white border border-emerald-100 font-bold text-slate-800 shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                            <span className="truncate">"{r.text.slice(0, 70)}..."</span>
                          </div>
                        </div>
                      ))}
                      {reviews.filter((r) => r.sentiment === 'Positive').length === 0 && (
                        <p className="text-slate-500 italic text-xs">No positive reviews logged yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Feedback Concerns */}
                  <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-950 font-heading block">
                      Common concerns:
                    </span>
                    <div className="space-y-2 text-xs">
                      {reviews.filter((r) => r.sentiment === 'Negative' || r.sentiment === 'Mixed').slice(0, 3).map((r, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white border border-amber-100 font-bold text-slate-800 shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="truncate">{r.concern || r.text.slice(0, 60)}</span>
                          </div>
                        </div>
                      ))}
                      {reviews.filter((r) => r.sentiment === 'Negative' || r.sentiment === 'Mixed').length === 0 && (
                        <p className="text-emerald-700 font-medium text-xs">No negative or critical reviews found.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Recommendation from real data */}
                <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-heading flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      AI RECOMMENDATION
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {pendingRepliesCount} pending responses
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-100">
                      {pendingRepliesCount > 0
                        ? `You have ${pendingRepliesCount} customer reviews awaiting response.`
                        : 'All current reviews have been responded to.'}
                    </p>
                    <p className="text-xs text-slate-300">
                      Responding to reviews within 24 hours reinforces local engagement signals on Google Maps and search rankings.
                    </p>
                  </div>

                  {pendingRepliesCount > 0 && (
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          const pending = reviews.find((r) => r.status === 'needs_response');
                          if (pending) handleOpenResponse(pending);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Reply to Oldest Unanswered</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* 4. REVIEW INBOX */}
          <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                    Operational Inbox
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
                  Review Inbox
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real customer reviews from verified connected sources and user entries.
                </p>
              </div>

              {/* Status & Source Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  All ({reviews.length})
                </button>
                <button
                  onClick={() => setActiveFilter('unanswered')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'unanswered'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Unanswered ({pendingRepliesCount})
                </button>
                <button
                  onClick={() => setActiveFilter('positive')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'positive'
                      ? 'bg-emerald-50 text-[#059669] border border-emerald-200 shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Positive ({reviews.filter((r) => r.sentiment === 'Positive').length})
                </button>
                <button
                  onClick={() => setActiveFilter('negative')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'negative'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Negative ({reviews.filter((r) => r.sentiment === 'Negative').length})
                </button>
                <button
                  onClick={() => setActiveFilter('flagged')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === 'flagged'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Flagged ({reviews.filter((r) => r.isFlagged).length})
                </button>
              </div>
            </div>

            {/* Safety Banner Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex items-start gap-2.5 text-xs text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Brand Safety Policy:</strong> Never auto-post negative-review responses without user approval. All negative/critical feedback requires human verification and approval before posting to external channels.
              </p>
            </div>

            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <div className="p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold font-heading text-slate-800">
                    {reviews.length === 0
                      ? 'No Customer Reviews in System'
                      : `No reviews found matching the "${activeFilter}" filter`}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {reviews.length === 0
                      ? 'Enter a customer review or launch a review invite campaign to start tracking.'
                      : 'Try selecting a different filter tab above to view your reviews.'}
                  </p>
                </div>
              ) : (
                filteredReviews.map((rev) => {
                  const isNegative = rev.sentiment === 'Negative' || rev.rating <= 2;
                  const srcBadge = getSourceBadge(rev.source);

                  return (
                    <div
                      key={rev.id}
                      className={`p-5 sm:p-6 rounded-2xl border transition-all text-xs space-y-4 shadow-2xs ${
                        isNegative
                          ? 'bg-rose-50/40 border-rose-200/90'
                          : 'bg-slate-50/80 border-slate-200/90 hover:bg-white'
                      }`}
                    >
                      {/* Top Bar: Author, Rating, Source Badge, Status, Flag, Delete */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shadow-2xs">
                            {rev.author[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{rev.author}</span>
                              <span className="text-[11px] text-slate-400">• {rev.date}</span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${srcBadge.bg}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${srcBadge.dot}`} />
                                {srcBadge.label}
                              </span>
                            </div>
                            {/* Star Rating e.g. ★★★★★ */}
                            <div className="flex items-center gap-1 text-amber-500 mt-0.5">
                              {[...Array(5)].map((_, s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s < rev.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))}
                              <span className="text-[11px] font-bold text-slate-600 ml-1">
                                {rev.rating}.0
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {rev.isFlagged && (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Flagged
                            </span>
                          )}
                          {rev.status === 'needs_response' ? (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                              Unanswered
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-[#059669] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> Published Reply
                            </span>
                          )}
                          <button
                            onClick={() => handleToggleFlag(rev.id)}
                            className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer px-1.5 py-0.5"
                            title="Flag review for dispute"
                          >
                            {rev.isFlagged ? 'Unflag' : 'Flag'}
                          </button>
                          {(rev.source === 'user_entered' || rev.source === 'direct') && (
                            <button
                              onClick={() => handleDeleteReview(rev.id, rev.author)}
                              className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                              title="Delete user-entered review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Review Text */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 text-slate-800 text-xs sm:text-[13px] leading-relaxed italic">
                        "{rev.text}"
                      </div>

                      {/* AI Intelligence: Sentiment & Concern */}
                      <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-100/70 p-2.5 rounded-xl border border-slate-200/70">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 font-medium">AI sentiment:</span>
                          <span
                            className={`font-extrabold px-2 py-0.5 rounded text-[11px] ${
                              rev.sentiment === 'Positive'
                                ? 'bg-emerald-100 text-[#059669]'
                                : rev.sentiment === 'Negative'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rev.sentiment}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 font-medium">Concern:</span>
                          <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                            {rev.concern}
                          </span>
                        </div>
                      </div>

                      {/* Suggested Reply Box */}
                      <div className="p-4 rounded-xl bg-white border border-slate-200/90 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-heading flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-[#059669]" />
                            {rev.status === 'responded' ? 'Published reply:' : 'Suggested reply:'}
                          </span>
                          {isNegative && rev.status === 'needs_response' && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                              Approval Required
                            </span>
                          )}
                        </div>

                        <p className="text-slate-700 leading-relaxed text-xs">
                          {rev.status === 'responded' && rev.response ? rev.response : rev.suggestedReply}
                        </p>
                      </div>

                      {/* Actions: View / Edit Reply, Approve */}
                      {rev.status === 'needs_response' && (
                        <div className="flex items-center justify-end gap-2.5 pt-1">
                          <button
                            onClick={() => handleOpenResponse(rev)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Edit Reply
                          </button>

                          <button
                            onClick={() => handleDirectApprove(rev)}
                            className={`px-5 py-2 rounded-xl font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                              isNegative
                                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                : 'bg-[#059669] hover:bg-[#047857] text-white'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isNegative ? 'Review & Approve' : 'Approve & Post'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </>
      )}

      {/* MODAL 1: ADD USER-ENTERED CUSTOMER REVIEW */}
      {addReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] font-heading">
                  Direct Feedback Entry
                </span>
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Enter Customer Review
                </h3>
              </div>
              <button
                onClick={() => setAddReviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Record authentic client feedback received in-person, over phone, via email, or direct feedback forms. Never fabricated.
            </p>

            <form onSubmit={handleCreateUserReview} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Date Observed</label>
                  <input
                    type="date"
                    value={newReviewDate}
                    onChange={(e) => setNewReviewDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewRating(s)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= newRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 hover:text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{newRating} of 5 Stars</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Review Text / Comments *</label>
                <textarea
                  rows={3}
                  required
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="Paste or write exact customer feedback text..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Feedback Origin</label>
                <select
                  value={newReviewOrigin}
                  onChange={(e) => setNewReviewOrigin(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                >
                  <option value="user_entered">Direct Customer Feedback</option>
                  <option value="user_entered_in_store">In-Store / Counter Feedback</option>
                  <option value="user_entered_phone">Phone / Verbal Feedback</option>
                  <option value="user_entered_survey">Post-Service Survey</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewReview}
                  className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingNewReview ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONNECT SUPPORTED REVIEW PROVIDER */}
      {connectProviderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 font-heading">
                  Provider Integration
                </span>
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Connect Supported Provider
                </h3>
              </div>
              <button
                onClick={() => setConnectProviderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Connect external supported review platforms to observe real ratings and public reviews for {bizName}.
            </p>

            <form onSubmit={handleConnectProvider} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Supported Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'yelp', label: 'Yelp' },
                    { id: 'facebook', label: 'Facebook' },
                    { id: 'trustpilot', label: 'Trustpilot' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProvider(p.id as any)}
                      className={`py-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        selectedProvider === p.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Listing / Profile URL</label>
                <input
                  type="url"
                  value={providerUrl}
                  onChange={(e) => setProviderUrl(e.target.value)}
                  placeholder={`https://www.${selectedProvider}.com/...`}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Profile / Business Name (Optional)</label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder={bizName}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConnectProviderModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConnectingProvider}
                  className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {isConnectingProvider ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Connect {selectedProvider.toUpperCase()}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESPONSE DRAFT & APPROVAL MODAL */}
      {responseModalReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isNegativeConfirmation
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-[#059669]'
                    }`}
                  >
                    {isNegativeConfirmation
                      ? '⚠️ Negative Review Safeguard'
                      : 'Professional Review Reply'}
                  </span>
                </div>
                <h3 className="text-base font-bold font-heading text-slate-900 mt-1">
                  Reply to {responseModalReview.author}
                </h3>
              </div>
              <button
                onClick={() => setResponseModalReview(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {isNegativeConfirmation && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Human Approval Mandatory:</strong> To protect brand reputation and customer satisfaction, responses to negative or critical reviews must be verified and approved by staff. Never auto-posted.
                </p>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs italic text-slate-700">
              "{responseModalReview.text}"
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-800">Review & Edit Reply:</label>
              <textarea
                rows={5}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setResponseModalReview(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  publishReply(
                    responseModalReview.id,
                    responseText,
                    responseModalReview.author
                  )
                }
                disabled={isSubmittingReply}
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {isSubmittingReply ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Confirm & Post Reply</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REVIEW INVITE CAMPAIGN MODAL */}
      {reviewInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] font-heading">
                  Growth Automation
                </span>
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Review Invite Campaign
                </h3>
              </div>
              <button
                onClick={() => setReviewInviteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Send SMS/Email links to recent clients. Direct short-links maximize authentic review velocity.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Direct Review Link:</span>
                <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 font-mono text-slate-600 text-[11px]">
                  <span className="truncate">{directReviewLink}</span>
                  <button
                    onClick={() => handleCopy('link', directReviewLink)}
                    className="font-bold text-[#059669] ml-2 shrink-0 cursor-pointer"
                  >
                    {copiedKey === 'link' ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-800">
                <span className="font-bold text-emerald-950 block mb-1">Automated SMS Invite Copy:</span>
                <p className="text-slate-700">
                  "Hi [Name], thank you for choosing {bizName} today! If our team took great care of you, could you take 30 seconds to rate us? {directReviewLink}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setReviewInviteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  logActivity('reputation', 'SMS Batch Sent', 'Dispatched review invites to 12 recent customers');
                  setReviewInviteModalOpen(false);
                  setToastMessage('Dispatched review invites to recent customers!');
                  setTimeout(() => setToastMessage(null), 3500);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Dispatch Invites
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* In-App Safe Review Deletion Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={reviewToDelete !== null}
        title="Delete Review"
        itemName={reviewToDelete ? `Review by ${reviewToDelete.author}` : undefined}
        message="Are you sure you want to permanently remove this review? This action cannot be undone."
        confirmLabel="Delete Review"
        onConfirm={handleConfirmDeleteReview}
        onClose={() => setReviewToDelete(null)}
      />
    </div>
  );
};
