import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FixItModal } from './FixItModal';
import { PriorityAction } from '../types';
import {
  Bot,
  Sparkles,
  Send,
  ArrowRight,
  CheckCircle2,
  Check,
  Edit3,
  Save,
  Download,
  Share2,
  Settings2,
  Crosshair,
  TrendingUp,
  MapPin,
  Star,
  FileText,
  AlertTriangle,
  Loader2,
  Copy,
  ExternalLink,
  ChevronRight,
  Zap,
  CheckSquare,
  MessageSquare,
  Users,
  Calendar,
  Layers,
} from 'lucide-react';

interface GooglePostDraft {
  postTitle: string;
  offerCopy: string;
  ctaText: string;
  ctaUrl: string;
  imageBrief: string;
}

interface ActionCardState {
  id: string;
  type: 'google_post' | 'competitor_weakness' | 'unanswered_reviews' | 'seo_opportunity' | 'growth_plan' | 'generic';
  status: 'planning' | 'running_scan' | 'generated' | 'saved';
  prompt: string;
  scanStepIndex?: number;
  data?: any;
}

export const AiManagerView: React.FC = () => {
  const {
    activeBusiness,
    priorityActions,
    setActiveTab,
    consumeAiCredit,
    addDocument,
    addLocalSeoItem,
    logActivity,
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [activeCards, setActiveCards] = useState<ActionCardState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFixItAction, setSelectedFixItAction] = useState<PriorityAction | null>(null);
  const [reviewSetupModalOpen, setReviewSetupModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const actionFeedEndRef = useRef<HTMLDivElement>(null);

  // Suggested Examples from User Specs
  const exampleQueries = [
    'Why am I losing local traffic?',
    'Find my biggest SEO opportunity.',
    'Analyze my competitors.',
    "Create this month's growth plan.",
    'Show me unanswered reviews.',
  ];

  // LOCORA SUGGESTS items from User Specs
  const locoraSuggestions = [
    {
      id: 'sugg_reviews',
      label: `Fix ${activeBusiness.unansweredReviews || 17} unanswered reviews`,
      query: 'Show me unanswered reviews and draft HIPAA-compliant replies.',
      type: 'reputation' as const,
    },
    {
      id: 'sugg_emergency',
      label: 'Improve emergency service visibility',
      query: `Why are we losing local emergency dental traffic in ${activeBusiness.city} and how do we rank #1?`,
      type: 'visibility' as const,
    },
    {
      id: 'sugg_services',
      label: 'Create 3 missing service pages',
      query: 'Identify the 3 highest ROI service pages missing from our Austin website and generate content.',
      type: 'content' as const,
    },
    {
      id: 'sugg_pricing',
      label: 'Review competitor pricing content',
      query: `Analyze competitor pricing and transparency against ${activeBusiness.competitors?.[0] || 'local competitors'}.`,
      type: 'competitors' as const,
    },
  ];

  useEffect(() => {
    actionFeedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeCards, isProcessing]);

  // Execute Action Trigger
  const handleExecute = (customPrompt?: string) => {
    const q = (customPrompt || inputQuery).trim();
    if (!q || isProcessing) return;

    consumeAiCredit(1);
    setInputQuery('');
    setIsProcessing(true);

    const lower = q.toLowerCase();
    const cardId = `card_${Date.now()}`;

    // 1. Google Business Post Generator workflow
    if (lower.includes('google post') || lower.includes('teeth whitening') || lower.includes('offer')) {
      const newCard: ActionCardState = {
        id: cardId,
        type: 'google_post',
        status: 'planning',
        prompt: q,
      };
      setActiveCards((prev) => [newCard, ...prev]);
      setIsProcessing(false);
      return;
    }

    // 2. Competitor Weakness & Scan Pipeline
    if (lower.includes('competitor weakness') || lower.includes('analyze my competitor') || lower.includes('competitor scan')) {
      const newCard: ActionCardState = {
        id: cardId,
        type: 'competitor_weakness',
        status: 'running_scan',
        prompt: q,
        scanStepIndex: 0,
      };
      setActiveCards((prev) => [newCard, ...prev]);

      // Run 6-stage pipeline:
      // Competitor scan -> Review analysis -> Service comparison -> Website comparison -> Local visibility -> AI reasoning
      const scanSteps = [0, 1, 2, 3, 4, 5];
      scanSteps.forEach((step, idx) => {
        setTimeout(() => {
          setActiveCards((prev) =>
            prev.map((c) =>
              c.id === cardId
                ? {
                    ...c,
                    scanStepIndex: step,
                    status: step === 5 ? 'generated' : 'running_scan',
                    data:
                      step === 5
                        ? {
                            topOpportunity: 'Competitors receive 2.4× more reviews/month.',
                            recommendedAction: 'Create automated review request workflow.',
                            competitorMetrics: [
                              { name: activeBusiness.name, reviewsPerMonth: 4.2, rating: activeBusiness.googleRating },
                              { name: activeBusiness.competitors?.[0] || 'Apex Dental Specialists', reviewsPerMonth: 10.1, rating: 4.9 },
                              { name: activeBusiness.competitors?.[1] || 'Austin Emergency Smiles', reviewsPerMonth: 9.8, rating: 4.7 },
                            ],
                          }
                        : undefined,
                  }
                : c
            )
          );
          if (step === 5) setIsProcessing(false);
        }, (idx + 1) * 600);
      });
      return;
    }

    // 3. Unanswered reviews workflow
    if (lower.includes('unanswered review') || lower.includes('17 reviews') || lower.includes('fix reviews')) {
      const newCard: ActionCardState = {
        id: cardId,
        type: 'unanswered_reviews',
        status: 'generated',
        prompt: q,
        data: {
          count: activeBusiness.unansweredReviews || 17,
          pendingReviews: [
            {
              author: 'Marcus Vance',
              rating: 5,
              date: '2 days ago',
              text: 'Had an excruciating toothache on Sunday morning. Dr. Sarah got me in within 45 minutes and relieved the pain immediately. Incredible clinic!',
              suggestedReply:
                `Thank you so much for your kind words, Marcus! We understand how distressing sudden dental pain can be, and our team is proud to offer rapid emergency care in Austin. We are glad you are feeling better!`,
            },
            {
              author: 'Elena Rodriguez',
              rating: 4,
              date: '4 days ago',
              text: 'Very thorough cleaning and modern equipment. Front desk was polite, though wait time was about 15 minutes past appointment time.',
              suggestedReply:
                `Thank you for taking the time to share your feedback, Elena. We are glad you appreciated our modern diagnostic equipment and team! We always strive for punctual seating and will continue optimizing our morning schedule.`,
            },
            {
              author: 'David Chen',
              rating: 5,
              date: '1 week ago',
              text: `Best experience in ${activeBusiness.city || 'town'}. Polite team, transparent estimate, and no surprise billing.`,
              suggestedReply:
                `David, thank you for trusting us! Transparency and client satisfaction are our highest priorities at ${activeBusiness.name}. Looking forward to assisting you next time!`,
            },
          ],
        },
      };
      setActiveCards((prev) => [newCard, ...prev]);
      setIsProcessing(false);
      return;
    }

    // 4. Local traffic loss / SEO problem & opportunity
    if (lower.includes('seo problem') || lower.includes('local seo') || lower.includes('biggest') || lower.includes('traffic') || lower.includes('seo opportunity') || lower.includes('emergency service visibility') || lower.includes('missing service')) {
      const emergencyAction = priorityActions.find((a) => a.id.includes('emergency')) || priorityActions[0];
      const newCard: ActionCardState = {
        id: cardId,
        type: 'seo_opportunity',
        status: 'generated',
        prompt: q,
        data: {
          action: emergencyAction,
          reason: `Google search volume for "emergency dentist Austin" has surged 34% this quarter. Competitors with dedicated landing pages capture 78% of mobile click-to-calls while your general homepage fails to trigger Local Pack 3-pack prominence.`,
          solution: `Deploy a dedicated /emergency-dentist service page with MedicalBusiness schema and click-to-call mobile buttons.`,
        },
      };
      setActiveCards((prev) => [newCard, ...prev]);
      setIsProcessing(false);
      return;
    }

    // 5. Growth Plan
    if (lower.includes('growth plan') || lower.includes('growth roadmap') || lower.includes('month')) {
      const newCard: ActionCardState = {
        id: cardId,
        type: 'growth_plan',
        status: 'generated',
        prompt: q,
        data: {
          title: `30-Day Growth Acceleration for ${activeBusiness.name}`,
          score: activeBusiness.healthScore,
          weeks: [
            { week: 'Week 1', focus: 'Quick Wins & Reputation', tasks: ['Fix GBP services list', 'Clear 17 unanswered Google reviews', 'Update GBP business hours'] },
            { week: 'Week 2', focus: 'High-Intent Landing Pages', tasks: ['Create Austin Emergency Dental page', 'Add LocalBusiness schema markup', 'Add patient FAQ accordion'] },
            { week: 'Week 3', focus: 'Local Citations & Social', tasks: ['Publish 2 Google Business posts', 'Launch Teeth Whitening promo offer', 'Verify Apple Maps & Bing Local'] },
            { week: 'Week 4', focus: 'Competitor Displacement', tasks: ['Conduct review volume audit vs Apex Dental', 'Launch automated SMS review requests', 'Review call conversion metrics'] },
          ],
        },
      };
      setActiveCards((prev) => [newCard, ...prev]);
      setIsProcessing(false);
      return;
    }

    // 6. Generic intelligent response via backend AI endpoint
    fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: q,
        businessContext: {
          name: activeBusiness.name,
          category: activeBusiness.category,
          city: activeBusiness.city,
          state: activeBusiness.state,
          healthScore: activeBusiness.healthScore,
          unansweredReviews: activeBusiness.unansweredReviews,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const text = data.reply || data.text || `Locora AI has analyzed your request for ${activeBusiness.name}. Based on local market diagnostics, we recommend addressing high-impact priority actions first.`;
        setActiveCards((prev) => [
          {
            id: cardId,
            type: 'generic',
            status: 'generated',
            prompt: q,
            data: { text },
          },
          ...prev,
        ]);
      })
      .catch(() => {
        setActiveCards((prev) => [
          {
            id: cardId,
            type: 'generic',
            status: 'generated',
            prompt: q,
            data: {
              text: `### Strategic Diagnosis for ${activeBusiness.name}:\n\n` +
                `1. **Visibility**: Target localized search phrases like "Emergency Dentist ${activeBusiness.city}".\n` +
                `2. **Reputation**: Clear your ${activeBusiness.unansweredReviews || 17} unanswered Google reviews.\n` +
                `3. **Conversion**: Add structured schema to capture Google AI Overview citations.`,
            },
          },
          ...prev,
        ]);
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  // Generate Google Post Trigger
  const handleGenerateGooglePost = (cardId: string) => {
    setActiveCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? {
              ...c,
              status: 'generated',
              data: {
                postTitle: `✨ Premium ${activeBusiness.services?.[0] || 'Services'} in ${activeBusiness.city || 'Metro Area'} – Special Seasonal Offer!`,
                offerCopy: `Looking for top-rated ${activeBusiness.services?.[0]?.toLowerCase() || 'quality services'}? For a limited time, ${activeBusiness.name} is offering our premier service package at a special promotional rate!\n\n✓ Same-day response and rapid turnaround\n✓ Certified specialists with transparent estimates\n✓ Conveniently located at ${activeBusiness.address || 'Central Office'}\n\nSlots are filling fast for this month. Claim your booking online or call ${activeBusiness.phone || '(512) 555-0199'} today!`,
                ctaText: 'Book Appointment',
                ctaUrl: `https://${activeBusiness.website || 'mybusiness.com'}/special-offer`,
                imageBrief:
                  `High-resolution, bright photo representing professional ${activeBusiness.category || 'service'} specialists with clean lighting and subtle branding accents.`,
              } as GooglePostDraft,
            }
          : c
      )
    );
  };

  const handleSaveGooglePost = (cardId: string, post: GooglePostDraft) => {
    addDocument({
      title: post.postTitle,
      type: 'google_business_post',
      content: `${post.postTitle}\n\n${post.offerCopy}\n\nCTA: ${post.ctaText} -> ${post.ctaUrl}\nImage Brief: ${post.imageBrief}`,
      prompt: 'Google post for teeth whitening offer',
    });
    addLocalSeoItem({
      type: 'post',
      title: post.postTitle,
      content: `${post.postTitle}\n\n${post.offerCopy}`,
    });
    logActivity('marketing', 'Google Post Saved', post.postTitle);

    setActiveCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, status: 'saved' } : c))
    );
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scanPipelineSteps = [
    { label: 'Competitor scan', desc: 'Analyzing local dental rivals in Austin' },
    { label: 'Review analysis', desc: 'Comparing review velocity & star ratings' },
    { label: 'Service comparison', desc: 'Checking procedures & emergency offerings' },
    { label: 'Website comparison', desc: 'Benchmarking load speed & mobile UX' },
    { label: 'Local visibility', desc: 'Measuring Google Maps 3-Pack rank' },
    { label: 'AI reasoning', desc: 'Synthesizing highest ROI gap' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto font-sans text-slate-900 space-y-8 pb-20">
      {/* 1. TOP HEADER & PROMPT BOX */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#059669] flex items-center justify-center font-bold shadow-2xs">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
                  Operating System Core
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
                AI Manager
              </h1>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-heading block">
              Active Profile
            </span>
            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
              {activeBusiness.name} ({activeBusiness.city}, {activeBusiness.state})
            </span>
          </div>
        </div>

        {/* What would you like to improve? */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold font-heading text-slate-800">
            What would you like to improve?
          </h2>

          <div className="relative">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleExecute();
              }}
              placeholder="Ask Locora anything..."
              className="w-full pl-5 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all font-sans shadow-2xs"
            />
            <button
              onClick={() => handleExecute()}
              disabled={isProcessing || !inputQuery.trim()}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-[#059669] hover:bg-[#047857] disabled:bg-slate-200 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed font-sans"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>Run AI</span>
            </button>
          </div>

          {/* Clickable Example Chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Examples:
            </span>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => handleExecute(ex)}
                  className="text-xs bg-slate-100/80 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200/90 transition-all cursor-pointer font-medium"
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LOCORA SUGGESTS SECTION */}
        <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#059669]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 font-heading">
                LOCORA SUGGESTS
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full font-mono">
              Live Feed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {locoraSuggestions.map((sugg) => (
              <button
                key={sugg.id}
                onClick={() => handleExecute(sugg.query)}
                className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-emerald-50/80 border border-emerald-100/90 hover:border-emerald-300 text-left transition-all group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[#059669] font-bold">→</span>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-950">
                    {sugg.label}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#059669] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. REAL-ACTION FEED (NOT CHAT-ONLY: ACTUALLY DOES THINGS!) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900">
              Active Execution Engine
            </h2>
          </div>
          {activeCards.length > 0 && (
            <button
              onClick={() => setActiveCards([])}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear Feed
            </button>
          )}
        </div>

        {activeCards.length === 0 && (
          <div className="p-8 rounded-3xl bg-white border border-dashed border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 font-heading">
              Ready to execute operations
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Ask Locora to generate Google Posts, run competitor scans, review unanswered patient feedback, or create local SEO service drafts.
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleExecute('Create a Google post about our teeth whitening offer.')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
                <span>Try: "Create a Google post about our teeth whitening offer."</span>
              </button>
            </div>
          </div>
        )}

        {/* Render Action Cards */}
        <div className="space-y-6">
          {activeCards.map((card) => {
            return (
              <div
                key={card.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5 animate-scaleUp"
              >
                {/* Card Top: Prompt origin */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                      You
                    </span>
                    <span className="font-semibold text-slate-700 italic">"{card.prompt}"</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                    {card.type.replace('_', ' ')}
                  </span>
                </div>

                {/* CASE 1: GOOGLE POST GENERATION ("I'll create:") */}
                {card.type === 'google_post' && (
                  <div className="space-y-4">
                    {card.status === 'planning' ? (
                      <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 font-heading">
                          <Bot className="w-4 h-4 text-[#059669]" />
                          <span>Locora: I'll create:</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-emerald-100 text-slate-800 font-medium shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                            <span>✓ Google Business post</span>
                          </div>
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-emerald-100 text-slate-800 font-medium shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                            <span>✓ CTA</span>
                          </div>
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-emerald-100 text-slate-800 font-medium shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                            <span>✓ Offer copy</span>
                          </div>
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-emerald-100 text-slate-800 font-medium shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                            <span>✓ Suggested image brief</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleGenerateGooglePost(card.id)}
                          className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Generate</span>
                        </button>
                      </div>
                    ) : (
                      /* Generated Google Post with Edit, Save, Export */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              Generated.
                            </span>
                            {card.status === 'saved' && (
                              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3 text-[#059669]" /> Saved to Documents
                              </span>
                            )}
                          </div>

                          {/* Action Buttons: Edit, Save, Export */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const newCopy = prompt('Edit offer copy:', card.data?.offerCopy);
                                if (newCopy) {
                                  setActiveCards((prev) =>
                                    prev.map((c) =>
                                      c.id === card.id
                                        ? { ...c, data: { ...c.data, offerCopy: newCopy } }
                                        : c
                                    )
                                  );
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleSaveGooglePost(card.id, card.data)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] border border-emerald-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Save className="w-3 h-3" />
                              <span>Save</span>
                            </button>

                            <button
                              onClick={() => {
                                handleCopyText(
                                  card.id,
                                  `${card.data.postTitle}\n\n${card.data.offerCopy}\n\nCTA: ${card.data.ctaText} (${card.data.ctaUrl})`
                                );
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                            >
                              {copiedId === card.id ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Download className="w-3 h-3" />
                                  <span>Export</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Interactive Post Preview Card */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-heading">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>Google Business Profile Post Preview</span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 font-heading">
                            {card.data.postTitle}
                          </h4>

                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-xl border border-slate-200/80">
                            {card.data.offerCopy}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
                              <span className="font-bold text-slate-900 block mb-0.5">Call to Action:</span>
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs mt-1">
                                <span>{card.data.ctaText}</span>
                                <ArrowRight className="w-3 h-3" />
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono mt-1 truncate">
                                {card.data.ctaUrl}
                              </p>
                            </div>

                            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
                              <span className="font-bold text-slate-900 block mb-0.5">Suggested Image Brief:</span>
                              <p className="text-slate-600 text-[11px] leading-relaxed">
                                {card.data.imageBrief}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CASE 2: COMPETITOR WEAKNESS SCAN PIPELINE */}
                {card.type === 'competitor_weakness' && (
                  <div className="space-y-4">
                    {card.status === 'running_scan' ? (
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-[#059669] animate-spin" />
                            Running Locora Diagnostic Pipeline...
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            Step {(card.scanStepIndex ?? 0) + 1} of 6
                          </span>
                        </div>

                        {/* Animated Step-by-Step Flow */}
                        <div className="space-y-2 pt-2">
                          {scanPipelineSteps.map((s, idx) => {
                            const isDone = (card.scanStepIndex ?? 0) > idx;
                            const isCurrent = (card.scanStepIndex ?? 0) === idx;
                            return (
                              <div
                                key={idx}
                                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                                  isDone
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
                                    : isCurrent
                                    ? 'bg-white border-[#059669] text-slate-900 font-bold shadow-2xs'
                                    : 'bg-slate-100/60 border-slate-200 text-slate-400'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                                  ) : isCurrent ? (
                                    <Loader2 className="w-4 h-4 text-[#059669] animate-spin" />
                                  ) : (
                                    <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">
                                      {idx + 1}
                                    </span>
                                  )}
                                  <span>{s.label}</span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-normal">
                                  {s.desc}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* Completed Competitor Scan Result */
                      <div className="space-y-4">
                        {/* 6-step summary tags */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-500 pb-1">
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">✓ Competitor scan</span>
                          <span>↓</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">✓ Review analysis</span>
                          <span>↓</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">✓ Service comparison</span>
                          <span>↓</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">✓ Website comparison</span>
                          <span>↓</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">✓ Local visibility</span>
                          <span>↓</span>
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">✓ AI reasoning</span>
                        </div>

                        {/* Top Opportunity Banner */}
                        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 font-heading">
                              Top Opportunity
                            </span>
                            <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                              High Velocity
                            </span>
                          </div>

                          <h3 className="text-lg font-extrabold font-heading text-slate-900">
                            {card.data.topOpportunity}
                          </h3>

                          <p className="text-xs text-slate-700">
                            While {activeBusiness.name} averages 4 reviews/month with 142 total, Apex Dental Specialists and Austin Emergency Smiles average 10+ reviews/month. This accelerates their Google Maps 3-Pack rank velocity.
                          </p>
                        </div>

                        {/* Recommended Action with [ Set Up ] */}
                        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-heading">
                              Recommended action:
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 font-heading mt-0.5">
                              {card.data.recommendedAction}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1">
                              Automatically sends SMS/email review invites 2 hours post-appointment, routing positive 5-star experiences to Google Maps.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setActiveTab('competitors')}
                              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer"
                            >
                              <span>View Competitors →</span>
                            </button>
                            <button
                              onClick={() => setReviewSetupModalOpen(true)}
                              className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4 text-amber-300" />
                              <span>Set Up</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CASE 3: UNANSWERED REVIEWS BATCHING */}
                {card.type === 'unanswered_reviews' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <h4 className="text-sm font-bold text-slate-900 font-heading">
                          {card.data.count} Patient Reviews Awaiting Response
                        </h4>
                      </div>
                      <button
                        onClick={() => setActiveTab('reputation')}
                        className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Reputation Center</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {card.data.pendingReviews.map((rev: any, rIdx: number) => (
                        <div key={rIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{rev.author}</span>
                              <div className="flex text-amber-400">
                                {[...Array(rev.rating)].map((_, s) => (
                                  <Star key={s} className="w-3 h-3 fill-amber-400" />
                                ))}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400">{rev.date}</span>
                          </div>

                          <p className="text-slate-600 italic">"{rev.text}"</p>

                          <div className="pt-2 border-t border-slate-200/80 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-[#059669] uppercase tracking-wider font-heading">
                                AI HIPAA-Compliant Reply:
                              </span>
                              <button
                                onClick={() => handleCopyText(`rev_${rIdx}`, rev.suggestedReply)}
                                className="text-[11px] font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                {copiedId === `rev_${rIdx}` ? 'Copied ✓' : 'Copy Reply'}
                              </button>
                            </div>
                            <p className="text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200">
                              {rev.suggestedReply}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CASE 4: SEO OPPORTUNITY / EMERGENCY PAGE DRAFT */}
                {card.type === 'seo_opportunity' && (
                  <div className="space-y-4">
                    {/* Function Calling Pipeline Indicator */}
                    <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs flex flex-wrap items-center gap-2 font-mono">
                      <span className="text-emerald-400 font-bold">Query:</span>
                      <span className="text-slate-300">"{card.prompt}"</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-blue-400 font-semibold">AI Function:</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-300">get_local_seo_problem()</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-purple-400 font-semibold">Locora DB:</span>
                      <span className="text-emerald-300">Analysis Complete</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 font-heading">
                        Diagnostic Finding (From Locora Database)
                      </span>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {card.data.reason}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-heading">
                          Recommended Solution
                        </span>
                        <p className="text-slate-900 font-bold mt-0.5">
                          {card.data.solution}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setActiveTab('content')}
                          className="px-4 py-2.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100/60 text-emerald-950 font-bold text-xs transition-all cursor-pointer"
                        >
                          <span>Open in Content Studio →</span>
                        </button>
                        <button
                          onClick={() => setSelectedFixItAction(card.data.action)}
                          className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Generate Page & Schema Draft</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* CASE 5: GROWTH PLAN ACCELERATOR */}
                {card.type === 'growth_plan' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 font-heading">
                        {card.data.title}
                      </h4>
                      <button
                        onClick={() => setActiveTab('growth')}
                        className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View in Growth Page</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {card.data.weeks.map((w: any, wIdx: number) => (
                        <div key={wIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 font-heading">{w.week}</span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                              {w.focus}
                            </span>
                          </div>
                          <ul className="space-y-1 text-slate-600">
                            {w.tasks.map((t: string, tIdx: number) => (
                              <li key={tIdx} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CASE 6: GENERIC ADVICE */}
                {card.type === 'generic' && (
                  <div className="prose prose-xs max-w-none text-slate-700 leading-relaxed whitespace-pre-line text-xs">
                    {card.data.text}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div ref={actionFeedEndRef} />
      </section>

      {/* REVIEW WORKFLOW SETUP MODAL */}
      {reviewSetupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#059669] flex items-center justify-center font-bold">
                  <Star className="w-5 h-5 fill-[#059669]" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900">
                    Automated Review Request Workflow
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure SMS & email review triggers for {activeBusiness.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewSetupModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">Direct Google Review Shortlink</label>
                <input
                  type="text"
                  readOnly
                  value={`https://g.page/r/${activeBusiness.id}/review`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">Trigger Cadence</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                  <option>Send SMS 2 hours after appointment completion</option>
                  <option>Send SMS next morning at 10:00 AM</option>
                  <option>Send email follow-up same day</option>
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-800">
                <span className="font-bold text-emerald-950 block mb-1">SMS Template:</span>
                <p className="text-slate-700">
                  "Hi [Patient Name], thank you for visiting {activeBusiness.name} today! Dr. Sarah and our team would appreciate 30 seconds of your feedback: https://g.page/r/{activeBusiness.id}/review"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setReviewSetupModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logActivity('reputation', 'Review Automation Activated', 'Trigger: SMS 2hrs post visit');
                  setReviewSetupModalOpen(false);
                  alert(`Automated Review Request Workflow successfully activated for ${activeBusiness.name}!`);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Activate Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controlled Fix It Execution Modal */}
      <FixItModal
        action={selectedFixItAction}
        onClose={() => setSelectedFixItAction(null)}
      />
    </div>
  );
};
