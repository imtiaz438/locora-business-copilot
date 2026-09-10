import React, { useState } from 'react';
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
} from 'lucide-react';

interface PatientReview {
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
}

export const ReputationView: React.FC = () => {
  const {
    activeBusiness,
    logActivity,
    setActiveTab,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unanswered' | 'positive' | 'negative' | 'flagged'>('unanswered');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [responseModalReview, setResponseModalReview] = useState<PatientReview | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isNegativeConfirmation, setIsNegativeConfirmation] = useState(false);
  const [taskCreated, setTaskCreated] = useState(false);
  const [reviewInviteModalOpen, setReviewInviteModalOpen] = useState(false);

  const bizName = activeBusiness.name || 'Our Company';
  const bizCity = activeBusiness.city || 'Metro Area';
  const bizCat = activeBusiness.category || 'Professional Services';
  const bizPhone = activeBusiness.phone || '(512) 555-0199';
  const reviewSlug = (activeBusiness.name || 'local-business').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const directReviewLink = `https://g.page/r/${reviewSlug}/review`;

  // Review List dynamically tailored to activeBusiness
  const [reviews, setReviews] = useState<PatientReview[]>([
    {
      id: 'rev_1',
      author: 'Marcus Vance',
      rating: 5,
      date: '2 days ago',
      text: `Had an urgent request on Sunday morning. ${bizName} got back to me within 45 minutes and resolved the issue immediately. Friendly staff and spotless facility!`,
      sentiment: 'Positive',
      concern: 'None (Compliment)',
      suggestedReply: `Thank you so much, Marcus! Delivering fast, reliable ${bizCat} is our top priority, and we are glad our team could take great care of you on a Sunday.`,
      status: 'needs_response',
    },
    {
      id: 'rev_2',
      author: 'Elena Rodriguez',
      rating: 4,
      date: '4 days ago',
      text: `Great service from ${bizName} but waited 35 minutes past my scheduled appointment time before being helped.`,
      sentiment: 'Positive',
      concern: 'Waiting time',
      suggestedReply: `Hello Elena, thank you for your kind words about our team. We sincerely apologize for the 35-minute delay—we always strive for punctual appointments and are fine-tuning our schedule pacing.`,
      status: 'needs_response',
    },
    {
      id: 'rev_3',
      author: 'David Chen',
      rating: 5,
      date: '1 week ago',
      text: `Best experience in ${bizCity}. Clear communication, transparent project plan, and fast results. Highly recommend ${bizName}!`,
      sentiment: 'Positive',
      concern: 'None',
      suggestedReply: `Thank you so much, David! We appreciate your trust in ${bizName} and look forward to working with you again.`,
      status: 'responded',
      response: `Thank you so much, David! We appreciate your trust in ${bizName}.`,
    },
    {
      id: 'rev_4',
      author: 'Rachel Moore',
      rating: 2,
      date: '1 week ago',
      text: `Quality of service is okay, but pricing clarity was very disappointing. I was hit with an unexpected $180 fee that was never mentioned beforehand.`,
      sentiment: 'Negative',
      concern: 'Pricing clarity & Billing',
      suggestedReply: `Hello Rachel, we deeply regret any unexpected financial surprise. Transparent pricing is a core standard for us at ${bizName}. Our manager would appreciate the opportunity to personally review your account. Please call us directly at ${bizPhone}.`,
      status: 'needs_response',
    },
    {
      id: 'rev_5',
      author: `${bizCity} Local Resident (Anonymous)`,
      rating: 1,
      date: '2 weeks ago',
      text: `Never used this company, but their service vehicle blocked traffic on ${activeBusiness.address ? activeBusiness.address.split(',')[0] : 'Main Street'}. 1 star for parking nuisance.`,
      sentiment: 'Negative',
      concern: 'Off-topic / False customer',
      suggestedReply: `Hello, our company does not operate commercial delivery vehicles in that area. As we cannot locate you in our customer database, please contact our office directly so we may investigate this report.`,
      status: 'needs_response',
      isFlagged: true,
    },
    {
      id: 'rev_6',
      author: 'Brian Campbell',
      rating: 5,
      date: '2 weeks ago',
      text: `Clean facility, respectful technicians, and seamless service delivery from ${bizName}. Will definitely return.`,
      sentiment: 'Positive',
      concern: 'None',
      suggestedReply: `We appreciate the kind review, Brian! See you at your next visit.`,
      status: 'responded',
      response: `We appreciate the kind review, Brian! See you at your next visit.`,
    },
  ]);

  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === 'unanswered') return r.status === 'needs_response';
    if (activeFilter === 'positive') return r.sentiment === 'Positive' || r.rating >= 4;
    if (activeFilter === 'negative') return r.sentiment === 'Negative' || r.rating <= 2;
    if (activeFilter === 'flagged') return r.isFlagged;
    return true;
  });

  const handleOpenResponse = (rev: PatientReview) => {
    setResponseModalReview(rev);
    setResponseText(rev.suggestedReply);
    setIsNegativeConfirmation(rev.sentiment === 'Negative' || rev.rating <= 2);
  };

  const handleDirectApprove = (rev: PatientReview) => {
    // CRITICAL MANDATE: Never auto-post negative-review responses without user approval.
    if (rev.sentiment === 'Negative' || rev.rating <= 2) {
      setResponseModalReview(rev);
      setResponseText(rev.suggestedReply);
      setIsNegativeConfirmation(true);
      return;
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === rev.id ? { ...r, status: 'responded', response: rev.suggestedReply } : r
      )
    );
    logActivity('reputation', 'Review Reply Approved', `Approved response for ${rev.author}`);
    alert(`Published reply to ${rev.author}'s Google review!`);
  };

  const handlePublishResponse = () => {
    if (!responseModalReview) return;

    setReviews((prev) =>
      prev.map((r) =>
        r.id === responseModalReview.id
          ? { ...r, status: 'responded', response: responseText }
          : r
      )
    );

    logActivity('reputation', 'Review Replied', `Verified and posted reply to ${responseModalReview.author}`);
    setResponseModalReview(null);
    setIsNegativeConfirmation(false);
  };

  const handleToggleFlag = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFlagged: !r.isFlagged } : r))
    );
    logActivity('reputation', 'Review Flagged', 'Submitted review for Google removal policy audit');
    alert('Review flagged! Locora has generated an official Google Maps Content Policy Dispute citation ticket.');
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto font-sans text-slate-900 space-y-8 pb-20">
      {/* 1. TOP HEADER & REPUTATION OVERVIEW */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                Reputation Command Center
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              Reputation
            </h1>
          </div>

          <button
            onClick={() => setReviewInviteModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer font-sans self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Generate Review Invite Campaign</span>
          </button>
        </div>

        {/* 4 Key Reputation Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-500" />
              <span className="text-xs font-bold text-amber-900">Average Rating</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-heading text-slate-900">4.8</span>
              <span className="text-xs font-bold text-slate-400">/ 5.0</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
            <span className="text-xs font-bold text-slate-500 block">Total Reviews</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-heading text-slate-900">327</span>
              <span className="text-xs font-bold text-slate-400">Google Verified</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
            <span className="text-xs font-bold text-emerald-800 block">Velocity</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-heading text-emerald-950">+18</span>
              <span className="text-xs font-bold text-[#059669]">this month</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
            <span className="text-xs font-bold text-slate-500 block">Response Rate</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-heading text-slate-900">82%</span>
              <span className="text-xs font-bold text-rose-600 font-mono">17 pending</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REVIEW INTELLIGENCE SECTION */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#059669]" />
            <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 uppercase tracking-wide">
              REVIEW INTELLIGENCE
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Synthesized from 327 verified reviews</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customers Love */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 font-heading block">
              Customers love:
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-emerald-100 font-bold text-slate-800 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                <span>✓ Friendly staff (Mentioned in 84 reviews)</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-emerald-100 font-bold text-slate-800 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                <span>✓ Fast appointments (Mentioned in 52 reviews)</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-emerald-100 font-bold text-slate-800 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                <span>✓ Clean facility (Mentioned in 46 reviews)</span>
              </div>
            </div>
          </div>

          {/* Customers Complain About */}
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-950 font-heading block">
              Common complaints:
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-amber-100 font-bold text-slate-800 shadow-2xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>⚠ Waiting time (Mentioned in 14 reviews)</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-amber-100 font-bold text-slate-800 shadow-2xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>⚠ Pricing clarity & copay (Mentioned in 9 reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Language & Phrase Cloud */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-heading block">
              Customer Language & Search Keywords in Reviews:
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Synthesized by AI Topic Engine</span>
          </div>
          <p className="text-xs text-slate-600">
            Exact phrases used by patients in Google Reviews. Use these verbatim in landing pages and Google Posts for maximum conversion and search relevance:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { phrase: '"prompt response"', count: 18, sentiment: 'urgent' },
              { phrase: '"urgent availability"', count: 12, sentiment: 'positive' },
              { phrase: '"friendly team"', count: 29, sentiment: 'positive' },
              { phrase: '"seamless process"', count: 15, sentiment: 'positive' },
              { phrase: '"transparent pricing"', count: 21, sentiment: 'positive' },
              { phrase: '"waited 35 minutes"', count: 7, sentiment: 'complaint' },
              { phrase: '"billing clarity"', count: 6, sentiment: 'complaint' },
              { phrase: '"spotless facility"', count: 34, sentiment: 'positive' },
            ].map((item, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                  item.sentiment === 'complaint'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : item.sentiment === 'urgent'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <span>{item.phrase}</span>
                <span className="text-[10px] font-mono opacity-70">({item.count}×)</span>
              </span>
            ))}
          </div>
        </div>

        {/* 3. AI RECOMMENDATION */}
        <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-heading flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              AI RECOMMENDATION
            </span>
            <span className="text-xs font-mono text-slate-400">High Sentiment Impact</span>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-100">
              Customers mention waiting time 14 times.
            </p>
            <p className="text-xs text-slate-300">
              Suggested action: <strong>Create clearer appointment expectations.</strong> Pre-texting patients with live chair updates prevents negative 3-star reviews.
            </p>
          </div>

          {/* Action Buttons: Create Response, Create Improvement Task */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                const pending = reviews.find((r) => r.status === 'needs_response') || reviews[0];
                handleOpenResponse(pending);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Create Response</span>
            </button>

            <button
              onClick={() => {
                setTaskCreated(true);
                logActivity('growth', 'Improvement Task Created', 'Deploy Patient Intake SMS Wait Time Notification');
                alert('Improvement task successfully added to Growth Plan: "Deploy Patient Intake SMS Wait Time Notification"!');
              }}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{taskCreated ? 'Task Added to Growth Plan ✓' : 'Create Improvement Task'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. REVIEW INBOX (Section 14) */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
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
              Live Google Business reviews. AI drafts HIPAA-compliant replies tailored to patient sentiment.
            </p>
          </div>

          {/* Section 14 Filters: All | Unanswered | Positive | Negative | Flagged */}
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
              Unanswered ({reviews.filter(r => r.status === 'needs_response').length})
            </button>
            <button
              onClick={() => setActiveFilter('positive')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'positive'
                  ? 'bg-emerald-50 text-[#059669] border border-emerald-200 shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Positive ({reviews.filter(r => r.sentiment === 'Positive').length})
            </button>
            <button
              onClick={() => setActiveFilter('negative')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'negative'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Negative ({reviews.filter(r => r.sentiment === 'Negative').length})
            </button>
            <button
              onClick={() => setActiveFilter('flagged')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'flagged'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Flagged ({reviews.filter(r => r.isFlagged).length})
            </button>
          </div>
        </div>

        {/* Safety Banner Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex items-start gap-2.5 text-xs text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Brand Safety Policy:</strong> Never auto-post negative-review responses without user approval. All negative/critical feedback requires human verification and approval before posting to Google.
          </p>
        </div>

        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No reviews found matching the "{activeFilter}" filter.
            </div>
          ) : (
            filteredReviews.map((rev) => {
              const isNegative = rev.sentiment === 'Negative' || rev.rating <= 2;

              return (
                <div
                  key={rev.id}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all text-xs space-y-4 shadow-2xs ${
                    isNegative
                      ? 'bg-rose-50/40 border-rose-200/90'
                      : 'bg-slate-50/80 border-slate-200/90 hover:bg-white'
                  }`}
                >
                  {/* Top Bar: Author, Rating, Status, Flag */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shadow-2xs">
                        {rev.author[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{rev.author}</span>
                          <span className="text-[11px] text-slate-400">• {rev.date}</span>
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
                          <AlertTriangle className="w-3 h-3" /> Flagged for Google Removal
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
                        title="Flag inappropriate review for removal"
                      >
                        {rev.isFlagged ? 'Unflag' : 'Flag'}
                      </button>
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
                        Suggested reply:
                      </span>
                      {isNegative && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          Approval Required
                        </span>
                      )}
                    </div>

                    <p className="text-slate-700 leading-relaxed text-xs">
                      {rev.status === 'responded' && rev.response ? rev.response : rev.suggestedReply}
                    </p>
                  </div>

                  {/* Actions: View Reply, Approve */}
                  {rev.status === 'needs_response' && (
                    <div className="flex items-center justify-end gap-2.5 pt-1">
                      <button
                        onClick={() => handleOpenResponse(rev)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                      >
                        View Reply
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
                        <span>{isNegative ? 'Review & Approve' : 'Approve'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* RESPONSE DRAFT / APPROVAL MODAL */}
      {responseModalReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isNegativeConfirmation ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-[#059669]'
                  }`}>
                    {isNegativeConfirmation ? '⚠️ Negative Review Safeguard' : 'HIPAA-Compliant Response'}
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
                  <strong>Human Approval Mandatory:</strong> To protect brand reputation and customer satisfaction, responses to negative or critical reviews must be verified by team staff. Never auto-posted.
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
                onClick={handlePublishResponse}
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Post to Google</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW INVITE CAMPAIGN MODAL */}
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
              Send SMS/Email links to recent clients. Google verified short-links convert at <strong>14.2%</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Direct Review Link:</span>
                <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 font-mono text-slate-600 text-[11px]">
                  <span>{directReviewLink}</span>
                  <button
                    onClick={() => handleCopy('link', directReviewLink)}
                    className="font-bold text-[#059669] ml-2"
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
                  alert('Dispatched review invites to 12 recent patients via Twilio SMS!');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Dispatch 12 Invites
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
