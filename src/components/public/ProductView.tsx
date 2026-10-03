import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SEO_FEATURES_DATABASE } from '../../data/seoData';
import {
  Sparkles,
  MapPin,
  Search,
  Star,
  ShieldCheck,
  TrendingUp,
  Users,
  Layers,
  Bot,
  Zap,
  Brain,
  CheckCircle2,
  ArrowRight,
  FileText,
  DollarSign,
  Calendar,
  Award,
  Sliders,
  X,
  ChevronDown,
  RefreshCw,
  Send,
  Globe,
  Target,
  BarChart3,
  Shield,
  Clock,
  Check,
  ArrowUpRight,
  Copy,
  Eye,
  Smartphone,
  MessageSquare,
  Building,
  Activity,
  Briefcase,
  FileSpreadsheet,
} from 'lucide-react';

export const ProductView: React.FC = () => {
  const { setActiveTab, setCheckoutModalPlan } = useApp();
  const [activeProductTab, setActiveProductTab] = useState<string>('ai-manager');

  // Interactive State for Product 01: Ask Locora
  const [aiQuestion, setAiQuestion] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Interactive State for Product 02: Schema Viewer & Tabs
  const [schemaTab, setSchemaTab] = useState<'visual' | 'code'>('visual');
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Interactive State for Product 03: AI Query Simulator
  const [selectedGeoQuery, setSelectedGeoQuery] = useState<number>(0);

  // Interactive State for Product 04: Review Reply Generator (Zero hardcoded sample reviews)
  const [testReviewText, setTestReviewText] = useState<string>('Technician arrived on time, completed the repair cleanly, and clearly explained the warranty. Very pleased with the service.');
  const [testAuthor, setTestAuthor] = useState<string>('Alex Morgan');
  const [testRating, setTestRating] = useState<number>(5);
  const [selectedTone, setSelectedTone] = useState<string>('seo');
  const [generatedReply, setGeneratedReply] = useState<string | null>(null);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);

  // Interactive State for Product 05: Competitor Comparison
  const [selectedCompetitorIndex, setSelectedCompetitorIndex] = useState<number>(0);

  // Interactive State for Product 06: Growth Cadence Checklists & Asset Preview
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({
    '0-0': true,
    '0-1': true,
    '1-0': false,
    '1-1': false,
    '2-0': false,
    '2-1': false,
    '3-0': false,
    '3-1': false,
  });
  const [previewAssetModal, setPreviewAssetModal] = useState<{ title: string; content: string } | null>(null);

  // Interactive State for Product 07: Agency Client Cockpit
  const [selectedClientIndex, setSelectedClientIndex] = useState<number>(0);
  const [showAgencyReportModal, setShowAgencyReportModal] = useState(false);

  // Interactive State for Product 08: Execution Suite
  const [activeExecutionTool, setActiveExecutionTool] = useState<number>(0);

  const featureList = Object.values(SEO_FEATURES_DATABASE);
  const [selectedCoreModule, setSelectedCoreModule] = useState<'proposal' | 'seo' | 'crm' | 'invoice' | 'audit' | 'planner'>('proposal');

  const navigateToFeature = (slug: string) => {
    window.history.pushState({}, '', `/features/${slug}`);
    setActiveTab(`feature_${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const coreSpotlightModules = [
    {
      id: 'proposal' as const,
      name: 'AI Proposals & Contracts',
      slug: 'ai-proposal-generator',
      icon: FileText,
      tagline: 'Scope, Price & Draft High-Winning Business Proposals in 60 Seconds',
      description: 'Generate comprehensive proposals with scope of work, project milestones, deliverable schedules, itemized pricing, and formal client acceptance terms.',
      bullets: [
        'Automated scope of work & deliverable generation',
        'Customizable pricing tables (flat rate, hourly, retainer)',
        'Itemized service breakdown with estimated timelines',
        'One-click white-label PDF export with your logo',
      ],
    },
    {
      id: 'seo' as const,
      name: 'Local SEO & Schema Assistant',
      slug: 'seo-audit',
      icon: MapPin,
      tagline: 'Dominate Google Business Profile & Local Search Map Packs',
      description: 'Generate localized descriptions, review reply templates, Google Q&As, local landing page copy, and valid JSON-LD schema markup tailored to any local service industry.',
      bullets: [
        'Google Business Profile (GBP) category & bio optimizer',
        'Ethical 5-star review reply generator',
        'JSON-LD LocalBusiness Schema code builder',
        'Geotargeted service page copy assistant',
      ],
    },
    {
      id: 'crm' as const,
      name: 'Client CRM & Pipeline Tracker',
      slug: 'crm',
      icon: Users,
      tagline: 'Never Lose Track of a Lead, Deal, or Retainer Client',
      description: 'A clean, intuitive CRM designed for local service businesses and agencies to organize contacts, track deal stages, record client notes, and monitor total pipeline value.',
      bullets: [
        'Visual pipeline stages (Lead, Proposal Sent, Negotiating, Client)',
        'Total pipeline revenue & deal value analytics',
        'Integrated meeting notes & client interaction history',
        'Project assignment & milestone tracking',
      ],
    },
    {
      id: 'invoice' as const,
      name: 'White-Label PDF Invoices',
      slug: 'invoicing',
      icon: FileSpreadsheet,
      tagline: 'Itemized Invoicing with Automated Tax & Payment Terms',
      description: 'Create professional invoices for one-time projects or recurring monthly retainers. Calculate state/local taxes automatically and download high-resolution PDF invoices.',
      bullets: [
        'Automated subtotal & local tax percentage calculation',
        'Custom payment terms (Net 15, Net 30, Due upon receipt)',
        'Invoice status tracking (Draft, Sent, Paid, Overdue)',
        'Branded white-label PDF generation with tax IDs',
      ],
    },
    {
      id: 'audit' as const,
      name: 'AI Business & Website Audit Engine',
      slug: 'ai-business-audit',
      icon: Globe,
      tagline: 'Instant Technical, On-Page & Local Competitive Audits for Any Domain',
      description: 'Audit client websites for title tag optimization, meta description length, mobile viewport readiness, SSL security, and receive prioritized AI recommendations.',
      bullets: [
        'Instant URL health & meta tag analysis',
        'Mobile viewport & SSL security checks',
        'Prioritized high-impact SEO action list',
        'Exportable client-facing SEO review summary',
      ],
    },
    {
      id: 'planner' as const,
      name: '30 & 90-Day Marketing Planner',
      slug: 'marketing-planner',
      icon: TrendingUp,
      tagline: 'Strategic Local Growth Calendars & Promotional Schedules',
      description: 'Build structured 30, 60, and 90-day growth strategies, campaign schedules, promotional offer calendars, and expected ROI benchmarks for local client niches.',
      bullets: [
        'Structured 30/60/90-day milestone roadmaps',
        'Local promotional campaign ideas & offer strategy',
        'Content & social media publication schedule',
        'KPI metrics & expected ROI benchmarks',
      ],
    },
  ];

  const productModules = [
    { id: 'dedicated-products', label: 'All Product Pages', icon: Layers, tag: 'Dedicated Guides' },
    { id: 'ai-manager', label: 'AI Business Manager', icon: Sparkles, tag: 'Central Intelligence' },
    { id: 'local-seo', label: 'Local SEO Copilot', icon: MapPin, tag: 'Maps 3-Pack' },
    { id: 'ai-visibility', label: 'AI Search Visibility', icon: Search, tag: '2026 GEO Engine' },
    { id: 'reputation', label: 'Reputation Intelligence', icon: Star, tag: 'Review Sentiment' },
    { id: 'competitors', label: 'Competitor Radar', icon: ShieldCheck, tag: 'Growth Gaps' },
    { id: 'growth-plan', label: '30-Day Growth Plan', icon: TrendingUp, tag: 'Autonomous Sprints' },
    { id: 'for-agencies', label: 'Agency Client Manager', icon: Users, tag: 'Multi-Location' },
    { id: 'execution-suite', label: 'Core Execution Suite', icon: Sliders, tag: 'CRM & Invoicing' },
  ];

  const scrollToSection = (id: string) => {
    setActiveProductTab(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const sampleQuestions = [
    'Why are competitors beating me on Google Maps?',
    'Which of my services has the highest profit margin?',
    'Create an emergency promotion for this weekend',
    'What do my 3-star reviews have in common?',
  ];

  const handleAskLocora = (queryText?: string) => {
    const questionToAsk = queryText || aiQuestion;
    if (!questionToAsk.trim()) return;
    setAiQuestion(questionToAsk);
    setIsAnswering(true);

    setTimeout(() => {
      setIsAnswering(false);
      if (questionToAsk.toLowerCase().includes('google maps') || questionToAsk.toLowerCase().includes('competitor')) {
        setAiResponse(
          `📊 Competitor Maps Gap Analysis:
1. Austin Pro Plumbing currently holds #1 for "Emergency Plumber Near Me" because they have 14 neighborhood service pages (you have 2).
2. They received 18 Google reviews in the last 30 days vs your 3.
3. Recommended Immediate Action: Deploy your 4 pre-drafted geo-landing pages and activate the automated SMS review invite sprint. Expected 3-Pack velocity: +3 spots within 21 days.`
        );
      } else if (questionToAsk.toLowerCase().includes('profit') || questionToAsk.toLowerCase().includes('margin')) {
        setAiResponse(
          `💰 High-Margin Service Breakdown:
1. Tankless Water Heater Conversions: 62% gross margin ($2,850 avg ticket).
2. Trenchless Sewer Repair: 58% margin ($4,200 avg ticket).
3. Routine Drain Snaking: 24% margin ($180 avg ticket).
Recommendation: Direct all AI local SEO and Google Business post promotions toward Tankless Conversions to maximize bottom-line profit.`
        );
      } else if (questionToAsk.toLowerCase().includes('promotion') || questionToAsk.toLowerCase().includes('weekend')) {
        setAiResponse(
          `⚡ Generated Weekend Emergency Campaign:
Headline: "Austin Weekend Emergency Plumbing Hotline — Zero Overtime Fees This Saturday & Sunday"
Offer: Free camera inspection with any main line clearing or water heater repair ($175 value).
Channels: Auto-published to Google Business Profile post, SMS list broadcast drafted for 240 previous customers.`
        );
      } else {
        setAiResponse(
          `🔍 Review Sentiment Clustering:
Analysis of 18 reviews found 5 common patterns:
1. 82% praised technician politeness and clean boot covers.
2. 3-star reviews specifically cited "unclear arrival windows between 1 PM and 5 PM".
Fix: Activate automated 30-minute arrival SMS notifications to convert future 3-star reviews into 5-star ratings.`
        );
      }
    }, 550);
  };

  const generateSampleReply = () => {
    setIsGeneratingReply(true);
    const authorName = testAuthor.trim() || 'Valued Customer';
    const cleanFirstName = authorName.split(' ')[0];
    setTimeout(() => {
      setIsGeneratingReply(false);
      if (selectedTone === 'seo') {
        setGeneratedReply(
          `"Thank you so much, ${cleanFirstName}! Providing prompt, 5-star professional service is our highest priority. We are thrilled our team could resolve your request quickly and safely. Don't hesitate to reach out whenever you need us!"`
        );
      } else if (selectedTone === 'recovery') {
        setGeneratedReply(
          `"Hello ${cleanFirstName}, thank you for your candid feedback. While we are glad the service was completed, our communication fell short of our standard. We have updated our dispatch notifications to ensure this does not happen again. Please reach out to our management directly so we can ensure you are 100% taken care of."`
        );
      } else {
        setGeneratedReply(
          `"Hi ${cleanFirstName}, thank you for taking the time to share your feedback with our team! We take great pride in delivering courteous, high-quality work to our local community. We look forward to serving you again!"`
        );
      }
    }, 450);
  };

  const sampleJsonLd = `{
  "@context": "https://schema.org",
  "@type": "PlumbingService",
  "name": "Austin Premier Plumbing",
  "image": "https://austinpremierplumbing.com/logo.png",
  "@id": "https://austinpremierplumbing.com/#localbusiness",
  "url": "https://austinpremierplumbing.com",
  "telephone": "YOUR_BUSINESS_PHONE",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "401 Congress Ave, Suite 1500",
    "addressLocality": "Austin",
    "addressRegion": "TX",
    "postalCode": "78701",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 30.2672,
    "longitude": -97.7431
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    }
  ],
  "areaServed": ["Austin", "Round Rock", "Westlake", "Cedar Park", "Lakeway"],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Emergency & Residential Plumbing",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Emergency Water Heater Repair" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Hydro-Jetting Drain Cleaning" } }
    ]
  }
}`;

  const competitors = [
    {
      name: 'Austin Pro Plumbing',
      tier: 'Primary Rival',
      mapsRank: '#1',
      reviewVelocity: '+18/mo',
      servicePages: '14 Pages',
      schemaStatus: 'Valid LocalBusiness',
      estCalls: '185 calls/mo',
      weakness: 'No weekend emergency hours; high pricing complaints in 3-star reviews.',
    },
    {
      name: 'Roto-Rooter Austin',
      tier: 'National Franchise',
      mapsRank: '#2',
      reviewVelocity: '+24/mo',
      servicePages: '32 Pages',
      schemaStatus: 'Franchise Schema',
      estCalls: '240 calls/mo',
      weakness: 'Impersonal call center; 2.2x higher dispatch fee; low local community sentiment.',
    },
    {
      name: 'Your Business (Austin Premier Plumbing)',
      tier: 'Target Profile',
      mapsRank: '#4 (Target: #1)',
      reviewVelocity: '+4/mo (Needs +12)',
      servicePages: '6 Pages (4 Missing)',
      schemaStatus: 'Ready to Deploy',
      estCalls: '72 calls/mo',
      weakness: 'Opportunity to capture #1 rank by deploying geo-pages and boosting review velocity.',
    },
  ];

  const executionTools = [
    {
      id: 'crm',
      title: 'Client CRM & Pipeline Tracker',
      desc: 'Visual Kanban pipeline with custom deal stages (Lead, Discovery, Proposal Sent, Signed Contract). Stores interaction history, call notes, and deal value.',
      replaces: 'HubSpot ($50/mo) or Salesforce ($100/mo)',
      stats: '4 Active Deals · $28,400 Pipeline Value',
      previewComponent: (
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-100 p-3 rounded-xl space-y-2 border border-slate-200">
            <div className="font-bold text-slate-700 flex justify-between">
              <span>New Leads</span>
              <span className="bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">2</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg shadow-2xs space-y-1 border border-slate-200">
              <div className="font-bold text-slate-900 text-xs">Westlake Estates HOA</div>
              <div className="text-[11px] text-emerald-700 font-bold">$12,000 · Retainer</div>
              <div className="text-[10px] text-slate-500">Commercial backflow testing</div>
            </div>
          </div>
          <div className="bg-amber-50/70 p-3 rounded-xl space-y-2 border border-amber-200">
            <div className="font-bold text-amber-900 flex justify-between">
              <span>Proposal Sent</span>
              <span className="bg-amber-200/80 px-1.5 py-0.5 rounded text-[10px]">1</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg shadow-2xs space-y-1 border border-slate-200">
              <div className="font-bold text-slate-900 text-xs">Downtown Boutique Hotel</div>
              <div className="text-[11px] text-emerald-700 font-bold">$8,500 · One-time</div>
              <div className="text-[10px] text-slate-500">Water heater manifold install</div>
            </div>
          </div>
          <div className="bg-emerald-50/70 p-3 rounded-xl space-y-2 border border-emerald-200">
            <div className="font-bold text-emerald-900 flex justify-between">
              <span>Won Client</span>
              <span className="bg-emerald-200/80 px-1.5 py-0.5 rounded text-[10px]">1</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg shadow-2xs space-y-1 border border-slate-200">
              <div className="font-bold text-slate-900 text-xs">Capital Medical Clinic</div>
              <div className="text-[11px] text-emerald-700 font-bold">$7,900 · Signed</div>
              <div className="text-[10px] text-emerald-600 font-semibold">Active Maintenance</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'proposals',
      title: 'AI Proposal & SOW Generator',
      desc: 'Generate comprehensive client proposals in 60 seconds. Auto-generates scope of work, milestone timelines, pricing tables, and legal sign-off blocks.',
      replaces: 'PandaDoc ($49/mo) or Proposify ($49/mo)',
      stats: '60-Sec Drafting · Digital Signature Ready',
      previewComponent: (
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Proposal SOW #2026-44</span>
              <h5 className="font-bold text-slate-900">Commercial Hydro-Jetting &amp; Preventative Maintenance</h5>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">Ready to Send</span>
          </div>
          <div className="space-y-1.5 text-slate-600 text-[11px]">
            <div>• <strong>Phase 1:</strong> Full camera inspection of all main lines (48 hours)</div>
            <div>• <strong>Phase 2:</strong> 4,000 PSI high-pressure hydro-jetting cleanout</div>
            <div>• <strong>Deliverables:</strong> Digital inspection video + 12-month zero-clog guarantee</div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-900">Total Fixed Investment: $3,450.00</span>
            <span className="text-[11px] text-slate-400">Includes 1-Click Client E-Sign</span>
          </div>
        </div>
      ),
    },
    {
      id: 'invoices',
      title: 'White-Label Invoices & Stripe Payments',
      desc: 'Create clean, branded PDF invoices with automated local sales tax calculation, status tracking (Draft, Sent, Paid, Overdue), and integrated online payment links.',
      replaces: 'FreshBooks ($30/mo) or QuickBooks Online ($35/mo)',
      stats: 'Stripe Powered · 0% Locora Transaction Surcharge',
      previewComponent: (
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">P</div>
              <div>
                <h5 className="font-bold text-slate-900">INVOICE #INV-1092</h5>
                <span className="text-[10px] text-slate-500">Issued: Sept 08, 2026 · Due in 14 Days</span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded-full">Sent · Unpaid</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-700">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Emergency Water Heater Replacement (50 Gal)</span>
              <span className="font-bold text-slate-900">$2,450.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>City Permit &amp; Safety Expansion Tank</span>
              <span className="font-bold text-slate-900">$350.00</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-1 text-xs">
              <span>Total Balance Due</span>
              <span className="text-emerald-700">$2,800.00</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'marketing',
      title: 'Marketing Planner & Campaign Cadence',
      desc: 'Plan monthly local marketing initiatives, seasonal service specials, and Google Business post cadences. Keeps your local visibility compounding continuously.',
      replaces: 'CoSchedule or Monday.com marketing boards',
      stats: 'Automated Scheduling · Campaign Templates',
      previewComponent: (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold text-[#059669] uppercase">Sept 12 · GBP Update</span>
            <div className="font-bold text-slate-900">Fall Freeze Pipe Protection Guide</div>
            <p className="text-[11px] text-slate-600">Pre-drafted post with local Austin freeze tips and direct call button.</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Sept 19 · Review Blast</span>
            <div className="font-bold text-slate-900">Automated SMS Review Request Wave</div>
            <p className="text-[11px] text-slate-600">Dispatches review requests to last 30 completed customer jobs.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'documents',
      title: 'Legal Agreement & Document Vault',
      desc: 'Central repository of customizable contractor agreements, independent subcontractor contracts, client liability waivers, and commercial service agreements.',
      replaces: 'LegalZoom contractor templates ($39/mo)',
      stats: 'Attorney-Drafted Templates · Secure Storage',
      previewComponent: (
        <div className="space-y-2 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800">Standard Residential Service Agreement 2026.pdf</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500">142 KB</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800">Commercial Subcontractor NDA &amp; Insurance Waiver.pdf</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500">198 KB</span>
          </div>
        </div>
      ),
    },
    {
      id: 'reports',
      title: 'Executive Client Growth Reports (PDF)',
      desc: 'Generate white-label executive growth reports in 1-click. Showcases rank gains, reviews acquired, search visibility index, and estimated inbound revenue generated.',
      replaces: 'AgencyAnalytics ($79/mo)',
      stats: 'White-Label Branding · Automated Monthly PDF',
      previewComponent: (
        <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Monthly Client Summary</span>
              <h5 className="font-bold text-white">Austin Premier Plumbing · August 2026</h5>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold text-[10px] rounded-full">+34% Growth</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-800 p-2 rounded-lg">
              <div className="text-emerald-400 font-bold text-sm">#1</div>
              <div className="text-[10px] text-slate-400">Maps 3-Pack</div>
            </div>
            <div className="bg-slate-800 p-2 rounded-lg">
              <div className="text-emerald-400 font-bold text-sm">+14</div>
              <div className="text-[10px] text-slate-400">New 5-Stars</div>
            </div>
            <div className="bg-slate-800 p-2 rounded-lg">
              <div className="text-emerald-400 font-bold text-sm">$18.2K</div>
              <div className="text-[10px] text-slate-400">Inbound Est.</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const agencyClients = [
    {
      name: 'Austin Premier Plumbing',
      industry: 'Home Services · Plumbing',
      status: 'healthy',
      rank: '#1 in Austin 3-Pack',
      reviews: '142 Reviews (4.9 ★)',
      health: 'Top 3 Maps ranking maintained; review velocity +12 this month.',
      urgency: 'Healthy & Dominating',
    },
    {
      name: 'Bright Smiles Family Dental',
      industry: 'Healthcare · Dental Clinic',
      status: 'action',
      rank: '#4 in Round Rock',
      reviews: '88 Reviews (4.6 ★)',
      health: '2 new 3-star reviews flagged front-desk scheduling delays.',
      urgency: 'Action Required',
    },
    {
      name: 'Lone Star Injury Lawyers',
      industry: 'Legal · Personal Injury',
      status: 'opportunity',
      rank: '#5 in Downtown Austin',
      reviews: '210 Reviews (4.8 ★)',
      health: 'Local rival dropped from top 3-pack; prime opportunity to publish car-accident geo-pages.',
      urgency: 'Upsell Opportunity',
    },
  ];

  return (
    <div className="space-y-24 pb-24 selection:bg-emerald-600 selection:text-white font-sans bg-slate-50 text-slate-900">
      {/* 01 — PRODUCT SUITE HERO */}
      <section className="relative bg-gradient-to-br from-[#022c22] via-[#044a36] to-[#011a13] text-white py-20 sm:py-28 px-6 sm:px-12 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#047857]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#6ee7b7] text-xs font-semibold font-heading tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-[#6ee7b7]" />
            <span>The Complete Locora Product Suite</span>
          </div>

          <h1 className="text-4xl sm:text-[54px] lg:text-[60px] font-bold font-heading text-white tracking-tight leading-[1.12]">
            Autonomous AI Engines Built for <span className="text-[#6ee7b7]">Local Dominance</span>
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-3xl mx-auto leading-relaxed font-sans">
            Explore the 8 specialized product modules designed to analyze your local market, boost Google Maps 3-Pack rankings, capture 2026 AI answer engines, outmaneuver competitors, and run your business operations.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 font-sans">
            <button
              onClick={() => {
                setActiveTab('signup');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Start Free Explorer Tier</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setActiveTab('pricing_public');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              View Plans &amp; Tiers
            </button>
          </div>
        </div>

        {/* Quick Nav Sub-Pages / Navigation Pills */}
        <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-emerald-800/60">
          <div className="text-center mb-3">
            <span className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold font-heading">
              Quick Jump to Product Modules
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {productModules.map((item) => {
              const Icon = item.icon;
              const isActive = activeProductTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-white text-emerald-950 shadow-md scale-105 font-bold'
                      : 'bg-emerald-950/70 text-emerald-100 hover:bg-emerald-900/90 border border-emerald-800/50 font-medium'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#059669]' : 'text-emerald-300'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 01.5 — DEDICATED PRODUCT CONTENT PAGES & CORE MODULE SPOTLIGHT */}
      <section id="dedicated-products" className="max-w-6xl mx-auto px-6 space-y-16 scroll-mt-24">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-semibold font-heading uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#059669]" />
            <span>Dedicated Product Guides &amp; Content Pages</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            An End-to-End Operating Suite for Local Growth
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
            Every product in Locora includes a dedicated deep-dive guide, interactive sandbox simulator, automated deliverables, and clear commercial ROI benchmarks.
          </p>
        </div>

        {/* Module Selector Navigation Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
          {coreSpotlightModules.map((m) => {
            const Icon = m.icon;
            const isSelected = m.id === selectedCoreModule;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedCoreModule(m.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{m.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Core Module Spotlight Card */}
        {(() => {
          const currentModule = coreSpotlightModules.find((m) => m.id === selectedCoreModule)!;
          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-md items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-[#059669] rounded-full text-xs font-bold border border-emerald-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive Product Spotlight</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
                  {currentModule.name}
                </h3>

                <p className="text-sm font-bold text-[#059669]">
                  {currentModule.tagline}
                </p>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                  {currentModule.description}
                </p>

                <div className="space-y-2.5 pt-2">
                  {currentModule.bullets.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-wrap gap-3 font-sans">
                  <button
                    onClick={() => navigateToFeature(currentModule.slug)}
                    className="px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer font-heading"
                  >
                    <span>Read Complete {currentModule.name} Guide</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('signup');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    Start Free Explorer Tier
                  </button>
                </div>
              </div>

              {/* Live UI Mockup Card */}
              <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold text-slate-900 font-heading">Locora AI Engine</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-[#059669] rounded font-mono font-bold border border-emerald-200">
                    STATUS: READY
                  </span>
                </div>

                <div className="space-y-3 text-xs font-sans">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Input Context</p>
                    <p className="text-slate-800 font-medium">Business: Vance Plumbing &amp; Heating (Austin, TX)</p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-2 shadow-2xs">
                    <p className="text-[10px] text-[#059669] uppercase font-bold">AI Output Preview</p>
                    <p className="text-slate-600 text-[11px] leading-relaxed italic">
                      &quot;Locora Copilot analyzed local Austin competition and generated 3 custom service packages ($1,500 - $3,200), itemizing emergency call-out landing pages and GBP local search schema.&quot;
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-slate-500 font-sans">
                    Powered by Groq Ultra-Fast LPU &amp; Multi-Model Switcher
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Grid of All Dedicated Product Deep-Dive Pages */}
        <div className="space-y-8 pt-4">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
              Dedicated Product Deep-Dives
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              Click any product to explore detailed guides, sample outputs, workflows, and automated deliverables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureList.map((feat) => (
              <div
                key={feat.slug}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-[#059669] hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {feat.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{feat.readingTime}</span>
                  </div>

                  <h4 className="text-lg font-bold font-heading text-slate-900 group-hover:text-[#059669] transition-colors leading-snug">
                    {feat.name}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-sans">
                    {feat.heroSubheadline}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {feat.targetKeywords?.slice(0, 2).map((kw, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigateToFeature(feat.slug)}
                    className="text-xs font-bold text-slate-900 hover:text-[#059669] flex items-center gap-1.5 cursor-pointer font-heading"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToFeature(feat.slug)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-[#059669] text-emerald-800 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Try Sandbox →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Software Stack Comparison Table */}
        <div className="space-y-8 pt-4">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
              Locora AI vs. Traditional Tool Stacks
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-sans">
              Stop paying $500+/month for 5 separate software subscriptions.
            </p>
          </div>

          <div className="overflow-x-auto bg-white border border-slate-200 rounded-3xl shadow-sm">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100 text-slate-800 font-heading">
                  <th className="p-4 font-bold">Feature / Tool</th>
                  <th className="p-4 font-bold text-[#059669]">Locora AI Copilot</th>
                  <th className="p-4 font-bold text-slate-500">Traditional SaaS Stack</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="p-4 font-semibold text-slate-900">AI Proposal Generator</td>
                  <td className="p-4 text-[#059669] font-bold">Included (Unlimited in Pro)</td>
                  <td className="p-4 text-slate-500">PandaDoc / Proposify ($49/mo)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-900">Local SEO &amp; Schema Assistant</td>
                  <td className="p-4 text-[#059669] font-bold">Included (JSON-LD Builder)</td>
                  <td className="p-4 text-slate-500">BrightLocal / Surfer ($99/mo)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-900">Client CRM Pipeline</td>
                  <td className="p-4 text-[#059669] font-bold">Included (Unlimited Contacts)</td>
                  <td className="p-4 text-slate-500">HubSpot / GoHighLevel ($97/mo)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-900">PDF Invoices &amp; Tax Calculations</td>
                  <td className="p-4 text-[#059669] font-bold">Included (White-Label PDF)</td>
                  <td className="p-4 text-slate-500">FreshBooks / QuickBooks ($35/mo)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-900">Website SEO Auditor</td>
                  <td className="p-4 text-[#059669] font-bold">Included (1-Click Audits)</td>
                  <td className="p-4 text-slate-500">SEMrush / Ahrefs ($129/mo)</td>
                </tr>
                <tr className="bg-emerald-50/80 font-bold">
                  <td className="p-4 text-slate-900">Total Monthly Cost</td>
                  <td className="p-4 text-[#059669] text-sm">$0 Free / $29 Pro Growth</td>
                  <td className="p-4 text-rose-600 text-sm">$409.00 / month</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 02 — PRODUCT 01: AI BUSINESS MANAGER */}
      <section id="ai-manager" className="max-w-6xl mx-auto px-6 space-y-8 scroll-mt-24">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold font-heading uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Product 01 · Central Command &amp; Copilot</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                AI Business Manager
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-1">
                Your autonomous daily business copilot. It synthesizes operational data overnight, prioritizes highest-revenue actions, and answers complex queries with full business context.
              </p>
            </div>

            <button
              onClick={() => {
                setActiveTab('signup');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 font-sans"
            >
              <span>Test on Your Business</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Overnight Executive Briefing Mockup */}
          <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-xs text-slate-200">Autonomous Morning Intelligence Briefing</span>
              </div>
              <span className="text-[11px] text-slate-400">Processed at 4:15 AM · Austin, TX</span>
            </div>

            <div className="text-sm font-bold text-white">Good morning Mike 👋 Here is what happened overnight:</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">2 Competitor Updates:</span> Austin Pro Plumbing changed their service pricing on water heaters; opportunity to advertise flat-rate savings.
                </div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">3 New Google Reviews:</span> 5-star sentiment high for emergency leak repairs; keyword-rich replies auto-drafted for approval.
                </div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Google Maps 3-Pack Gain:</span> "Emergency Plumber Near Me" moved from rank #6 to #4 (+2 velocity spots).
                </div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <Search className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">High-Intent Search Gap:</span> 42 searches/month for "Water Heater Replacement Austin" with zero dedicated landing page.
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Business Vitals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 space-y-1">
              <div className="text-slate-400 font-medium">Local Visibility</div>
              <div className="text-emerald-400 font-bold text-lg">↑ 18.4%</div>
              <div className="text-[11px] text-slate-500">Google Maps 3-Pack rank velocity</div>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 space-y-1">
              <div className="text-slate-400 font-medium">Reviews Analyzed</div>
              <div className="text-emerald-400 font-bold text-lg">+12 New</div>
              <div className="text-[11px] text-slate-500">Sentiment score 4.8 / 5.0</div>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 space-y-1">
              <div className="text-slate-400 font-medium">High-Intent Traffic</div>
              <div className="text-emerald-400 font-bold text-lg">↑ 9.2%</div>
              <div className="text-[11px] text-slate-500">From localized service pages</div>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 space-y-1">
              <div className="text-slate-400 font-medium">AI Search Share</div>
              <div className="text-emerald-400 font-bold text-lg">64 / 100</div>
              <div className="text-[11px] text-slate-500">ChatGPT, Perplexity &amp; Gemini citations</div>
            </div>
          </div>

          {/* Interactive "Ask Locora" Box */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 font-heading">
                <Brain className="w-4 h-4" />
                <span>Live Interactive Demo · Ask Locora Anything</span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">Powered by Business Brain Knowledge Graph</span>
            </div>

            {/* Quick Prompt Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskLocora(q)}
                  className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 hover:text-white transition-all text-left cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{q}</span>
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskLocora();
              }}
              className="flex flex-col sm:flex-row gap-2 pt-2"
            >
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Or type custom prompt: e.g. What should I do to rank #1 in Round Rock?"
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
              />
              <button
                type="submit"
                disabled={isAnswering}
                className="px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 font-sans"
              >
                {isAnswering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Ask Locora</span>
              </button>
            </form>

            {aiResponse && (
              <div className="p-4 bg-slate-900/90 border border-emerald-500/30 rounded-xl text-xs text-slate-200 leading-relaxed space-y-2 animate-in fade-in-50 whitespace-pre-line font-sans">
                {aiResponse}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 03 — PRODUCT 02: AI LOCAL SEO COPILOT */}
      <section id="local-seo" className="max-w-6xl mx-auto px-6 space-y-8 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold font-heading uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>Product 02 · Google Maps 3-Pack Domination</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              AI Local SEO &amp; Schema Copilot
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Traditional SEO tools produce endless lists of technical warnings (like "missing H1 tag") and leave you stranded. Locora explains the business impact in plain English, presents the evidence, and generates complete, validated solutions with a single click.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1.5">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs font-heading">
                  <X className="w-4 h-4" />
                  <span>The Old Way (Legacy SEO Tools)</span>
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  Error 404 / Missing meta description / 23 schema warnings ❌
                </p>
              </div>

              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-[#059669] font-bold text-xs font-heading">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>The Locora Way (AI Growth Diagnosis)</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  "Your business is losing an estimated 38 calls/month because 4 high-demand service pages lack neighborhood geotags in Austin. We generated ready-to-publish service copy and injected LocalBusiness JSON-LD markup."
                </p>
                <div className="pt-1 flex gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('signup');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 bg-[#059669] text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-[#047857] transition-all cursor-pointer font-sans flex items-center gap-1.5"
                  >
                    <span>Audit Your Website Free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Geo-Grid Heatmap Simulator */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-heading">Austin Metro 3-Pack Ranking Heatmap</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Updated Daily</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[
                  { area: 'North Austin', rank: '#2', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                  { area: 'Round Rock', rank: '#4', color: 'bg-amber-100 text-amber-900 border-amber-300' },
                  { area: 'Pflugerville', rank: '#5', color: 'bg-amber-100 text-amber-900 border-amber-300' },
                  { area: 'Westlake', rank: '#1', color: 'bg-emerald-500 text-white border-emerald-600 font-black' },
                  { area: 'Downtown Core', rank: '#3', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                  { area: 'East Austin', rank: '#2', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                  { area: 'South Congress', rank: '#2', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                  { area: 'Oak Hill', rank: '#3', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                  { area: 'Buda / Kyle', rank: '#6', color: 'bg-slate-100 text-slate-700 border-slate-300' },
                ].map((pin, i) => (
                  <div key={i} className={`p-2.5 rounded-xl border ${pin.color} space-y-0.5 shadow-2xs`}>
                    <div className="text-base font-black font-heading">{pin.rank}</div>
                    <div className="text-[10px] truncate">{pin.area}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Live 3-Pack Keyword Tracker */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-sm text-slate-900 font-heading flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#059669]" />
                  <span>Live Google Maps 3-Pack Radar</span>
                </h4>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                  Active Tracking
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { term: 'Emergency Plumber Near Me', current: '#4', target: '#1', diff: '+3 spots to #1', trend: 'rising' },
                  { term: 'Water Heater Replacement Austin', current: '#6', target: '#2', diff: '+4 spots needed', trend: 'action' },
                  { term: 'Commercial Drain Cleaning', current: '#2', target: '#1', diff: 'Dominating', trend: 'leader' },
                  { term: 'Tankless Water Heater Installation', current: '#8', target: '#3', diff: '+5 spots needed', trend: 'action' },
                ].map((row, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs border border-slate-100">
                    <div>
                      <div className="font-bold text-slate-900">{row.term}</div>
                      <div className="text-[11px] text-slate-500">Current 3-Pack Rank: <span className="font-bold text-slate-900">{row.current}</span></div>
                    </div>
                    <span className={`px-2.5 py-1 font-bold rounded-lg text-[11px] ${
                      row.trend === 'leader'
                        ? 'bg-emerald-100 text-emerald-800'
                        : row.trend === 'rising'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {row.diff}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Schema Generator Preview */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg space-y-4 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs">Automated LocalBusiness JSON-LD Schema</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSchemaTab('visual')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      schemaTab === 'visual' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Visual
                  </button>
                  <button
                    onClick={() => setSchemaTab('code')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      schemaTab === 'code' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    JSON-LD Code
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(sampleJsonLd);
                      setCopiedSchema(true);
                      setTimeout(() => setCopiedSchema(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Copy JSON-LD"
                  >
                    {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {schemaTab === 'visual' ? (
                <div className="space-y-2 text-xs text-slate-300 font-sans">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center">
                    <span>Schema Entity Type</span>
                    <span className="font-bold text-emerald-400">PlumbingService &amp; LocalBusiness</span>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center">
                    <span>Geo Coordinates</span>
                    <span className="font-mono text-[11px] text-slate-300">30.2672° N, -97.7431° W (Austin)</span>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center">
                    <span>Target Service Radius</span>
                    <span className="text-slate-300">Austin, Round Rock, Westlake, Cedar Park</span>
                  </div>
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Schema.org &amp; Google Rich Results Compliant</span>
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-500/20 px-2 py-0.5 rounded">VALID</span>
                  </div>
                </div>
              ) : (
                <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-56 scrollbar-thin">
                  {sampleJsonLd}
                </pre>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 04 — PRODUCT 03: AI SEARCH VISIBILITY (2026 GEO ENGINE) */}
      <section id="ai-visibility" className="max-w-6xl mx-auto px-6 space-y-8 scroll-mt-24">
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 border border-emerald-900/40">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold font-heading uppercase tracking-wider">
                <Search className="w-3.5 h-3.5" />
                <span>Product 03 · Generative Engine Optimization (GEO)</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
                2026 AI Search Visibility
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                Over 45% of consumers now ask generative AI systems (ChatGPT, Perplexity, Microsoft Copilot, and Google Gemini) for local contractor and service recommendations. Locora measures how well AI models understand your business and ensures your brand is cited first.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-3xl flex items-center gap-6 shrink-0">
              <div>
                <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider">AI Visibility Index</div>
                <div className="text-4xl sm:text-5xl font-black text-white font-heading mt-1">
                  64<span className="text-2xl text-emerald-400">/100</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">4 Optimization Opportunities Detected</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold">ChatGPT Search</span>
                <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded">68% Share</span>
              </div>
              <p className="text-slate-300 leading-relaxed">Missing LocalBusiness opening hours schema citation. Recommended fix prepared.</p>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold">Perplexity AI</span>
                <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded">72% Share</span>
              </div>
              <p className="text-slate-300 leading-relaxed">Cited in 2 of 5 emergency Austin queries. Adding structured FAQ markup will increase citation rate.</p>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold">Microsoft Copilot</span>
                <span className="text-[10px] text-amber-300 bg-amber-950 px-2 py-0.5 rounded">54% Share</span>
              </div>
              <p className="text-slate-300 leading-relaxed">Requires verified service radius documentation across Bing Places and Apple Maps.</p>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold">Google Gemini</span>
                <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded">81% Share</span>
              </div>
              <p className="text-slate-300 leading-relaxed">Review volume meets threshold for local carousel. Keyword velocity high.</p>
            </div>
          </div>

          {/* Interactive AI Recommendation Query Simulator */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-heading flex items-center gap-2">
                <Bot className="w-4 h-4" />
                <span>Simulate AI Engine Recommendation</span>
              </div>
              <span className="text-[11px] text-slate-400">Click a query to see the AI output</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                'Recommend an emergency plumber in Austin TX with 24/7 service',
                'Who does the best commercial hydro-jetting in Travis County?',
              ].map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedGeoQuery(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGeoQuery === idx
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  "{query}"
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-rose-900/50 space-y-2">
                <span className="text-rose-400 font-bold flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5" />
                  <span>Without Locora GEO Optimization</span>
                </span>
                <p className="text-slate-400 leading-relaxed font-sans">
                  "Based on public web data, here are 3 local plumbers in Austin: Austin Pro Plumbing, Roto-Rooter, and ABC Home Services." (Your business is omitted because LLMs lack structured schema and citation signals).
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-emerald-800/80 space-y-2">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>With Locora GEO Knowledge Graph</span>
                </span>
                <p className="text-slate-200 leading-relaxed font-sans">
                  "For immediate 24/7 service, <strong className="text-white">Austin Premier Plumbing</strong> is top-recommended. Verified with 142 Google reviews (4.9 rating), transparent flat-rate pricing, and verified response time under 45 minutes in Austin and Westlake."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05 — PRODUCT 04: AI REPUTATION & REVIEW INTELLIGENCE */}
      <section id="reputation" className="max-w-6xl mx-auto px-6 space-y-8 scroll-mt-24">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold font-heading uppercase tracking-wider">
            <Star className="w-3.5 h-3.5" />
            <span>Product 04 · Review Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            AI Reputation &amp; Customer Insights
          </h2>
          <p className="text-slate-600 text-sm">
            Writing review replies is a commodity. Locora extracts what customers praise, uncovers operational complaints, and turns customer feedback into high-converting marketing campaigns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs font-heading">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>What Customers Praise (Positive Clusters)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">✓ Fast same-day emergency response (mentioned 42x)</li>
              <li className="flex items-center gap-2">✓ Friendly, courteous, clean-shoe technicians (mentioned 31x)</li>
              <li className="flex items-center gap-2">✓ Upfront, honest flat-rate pricing without hidden fees (mentioned 28x)</li>
            </ul>
            <div className="pt-2 text-[11px] text-slate-500 italic">
              Locora automatically includes these exact praised phrases in your local landing page copy.
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs font-heading">
              <Shield className="w-4 h-4 text-rose-600" />
              <span>What Customers Complain About (Operational Gaps)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">• Weekend scheduling and emergency phone answering delays</li>
              <li className="flex items-center gap-2">• Lack of SMS arrival window notifications before visits</li>
            </ul>
            <div className="pt-2 text-[11px] text-slate-500 italic">
              Locora flags these root operational causes so you can fix them before they harm review velocity.
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#059669] font-bold text-xs font-heading">
                <Sparkles className="w-4 h-4" />
                <span>Locora Revenue Opportunity</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-sans">
                "Customers repeatedly praise 'same-day water heater repair,' but your homepage does not mention it in the hero headline. Updating this headline will lift visitor conversion by an estimated 14%."
              </p>
            </div>
            <button
              onClick={() => {
                setActiveTab('signup');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer font-sans"
            >
              Start Free Reputation Checkup →
            </button>
          </div>
        </div>

        {/* Interactive 1-Click Review Reply Generator Demo */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#059669]" />
              <h4 className="font-bold text-sm text-slate-900 font-heading">
                Interactive Test Drive: 1-Click Contextual Review Reply Generator
              </h4>
            </div>
            <span className="text-[10px] text-slate-500">Pick review &amp; tone below</span>
          </div>

          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="space-y-0.5">
                  <label className="text-[11px] font-bold text-slate-700">Reviewer Name:</label>
                  <input
                    type="text"
                    value={testAuthor}
                    onChange={(e) => {
                      setTestAuthor(e.target.value);
                      setGeneratedReply(null);
                    }}
                    placeholder="e.g. Alex Morgan"
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[11px] font-bold text-slate-700 block">Rating:</label>
                  <div className="flex items-center gap-1 pt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setTestRating(s);
                          setGeneratedReply(null);
                        }}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            s <= testRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1.5">{testRating} Stars</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 italic">
                Test with any customer feedback
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Customer Review Text:</label>
              <textarea
                rows={2}
                value={testReviewText}
                onChange={(e) => {
                  setTestReviewText(e.target.value);
                  setGeneratedReply(null);
                }}
                placeholder="Enter or paste customer feedback to test response generation..."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Reply Voice &amp; Tone:</span>
              <div className="flex gap-1.5">
                {[
                  { id: 'seo', label: 'SEO-Optimized & Grateful' },
                  { id: 'recovery', label: 'Urgent Service Recovery' },
                  { id: 'warm', label: 'Warm & Professional' },
                ].map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => {
                      setSelectedTone(tone.id);
                      setGeneratedReply(null);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedTone === tone.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateSampleReply}
              disabled={isGeneratingReply}
              className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans shrink-0"
            >
              {isGeneratingReply ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Generate AI Response</span>
            </button>
          </div>

          {generatedReply && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-2xl space-y-2 animate-in fade-in-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  <span>Ready-to-Publish Reply</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-bold">Optimized for Google Maps Algorithm</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed italic">{generatedReply}</p>
            </div>
          )}
        </div>
      </section>

      {/* 06 — PRODUCT 05: COMPETITOR INTELLIGENCE RADAR */}
      <section id="competitors" className="max-w-6xl mx-auto px-6 space-y-8 scroll-mt-24">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-lg space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#059669] text-xs font-bold font-heading uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Product 05 · Competitive Advantage</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                Competitor Intelligence Radar
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Locora automatically scans your local rivals' services, review velocities, pricing clues, and search rankings.
              </p>
            </div>

            <button
              onClick={() => {
                setActiveTab('signup');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer font-sans shrink-0 flex items-center gap-2"
            >
              <span>Scan Competitors Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Service Page Gap</span>
              <h4 className="font-bold text-sm text-slate-900">Competitor A has 4 pages you lack</h4>
              <p className="text-xs text-slate-600">Targeting Tankless Water Heaters, Slab Leak Detection, Hydro-jetting &amp; Commercial Fixtures.</p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Review Velocity Gap</span>
              <h4 className="font-bold text-sm text-slate-900">Competitor B gained 17 reviews this month</h4>
              <p className="text-xs text-slate-600">You generated 3 reviews. Their velocity puts them in the top 3-pack within 45 days unless counter-acted.</p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Search Keyword Gap</span>
              <h4 className="font-bold text-sm text-slate-900">Competitor C appears for 8 searches you miss</h4>
              <p className="text-xs text-slate-600">Ranking for high-intent emergency phrases in Round Rock and Westlake.</p>
            </div>
          </div>

          {/* Interactive 3-Way Competitor Comparison Matrix */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
                Austin Local Market Comparison Matrix
              </span>
              <span className="text-[11px] text-slate-400">Click a business to view vulnerability report</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {competitors.map((comp, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedCompetitorIndex(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    selectedCompetitorIndex === idx
                      ? 'border-[#059669] bg-emerald-50/60 shadow-sm ring-1 ring-[#059669]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{comp.tier}</span>
                    <span className="font-black text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{comp.mapsRank}</span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 font-heading truncate">{comp.name}</div>
                  <div className="space-y-1 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span>Review Velocity:</span>
                      <span className="font-bold text-slate-800">{comp.reviewVelocity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Pages:</span>
                      <span className="font-bold text-slate-800">{comp.servicePages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Est. Call Volume:</span>
                      <span className="font-bold text-slate-800">{comp.estCalls}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <span className="font-bold text-slate-900 font-heading">
                Locora Counter-Strategy for {competitors[selectedCompetitorIndex].name}:
              </span>
              <p className="text-slate-600 leading-relaxed font-sans">
                {competitors[selectedCompetitorIndex].weakness}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 07 — PRODUCT 06: AUTONOMOUS 30-DAY GROWTH CADENCE */}
      <section id="growth-plan" className="max-w-6xl mx-auto px-6 space-y-8 scroll-mt-24">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold font-heading uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Product 06 · Automated Execution Sprints</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            Autonomous 30-Day Growth Cadence
          </h2>
          <p className="text-slate-600 text-sm">
            No more wondering what to work on next. Locora breaks your business growth into clear, weekly sprints and pre-drafts every asset for your approval.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              week: 'WEEK 1',
              title: 'Review Acceleration',
              tasks: ['Respond to 8 reviews with SEO keywords', 'Optimize emergency service GBP bio'],
              assetTitle: 'Pre-Drafted Google Business Bio',
              assetContent: 'Austin Premier Plumbing is Austin\'s certified 24/7 emergency plumbing team. Specializing in rapid water heater repair, tankless installations, drain snaking, and commercial hydro-jetting. Trusted by over 1,500 Central Texas homeowners with upfront flat-rate pricing.',
            },
            {
              week: 'WEEK 2',
              title: 'Geo Landing Pages',
              tasks: ['Publish localized Google Business update', 'Deploy Water Heater Landing Page'],
              assetTitle: 'Pre-Drafted Water Heater Geo-Landing Page',
              assetContent: 'Title: Tankless Water Heater Repair & Installation in Austin, TX\nMeta: Need emergency water heater repair in Austin? Same-day service, zero overtime fees, certified technicians. Call Austin Premier Plumbing.\nH1: Fast, Reliable Water Heater Repair in Austin & Westlake\nBody: Comprehensive 40-point diagnostic inspection, safety valves, electric and gas tank replacements with 10-year warranty.',
            },
            {
              week: 'WEEK 3',
              title: 'Schema & Citations',
              tasks: ['Launch automated SMS review campaign', 'Sync LocalBusiness JSON-LD schema'],
              assetTitle: 'SMS Review Request Template',
              assetContent: 'Hi [Customer Name], thanks for choosing Austin Premier Plumbing today! Mike was glad to get your hot water running. Could you take 20 seconds to drop us a quick Google review? Here is the direct link: [link]',
            },
            {
              week: 'WEEK 4',
              title: 'Competitor Counter-Action',
              tasks: ['Run competitor gap analysis', 'Measure Google Maps 3-Pack rank gains'],
              assetTitle: 'Monthly 3-Pack Growth Report',
              assetContent: 'Audit Results: Your ranking for "Emergency Plumber Near Me" advanced from #6 to #2. Inbound search calls increased by 31% over baseline. Next sprint recommendation: launch Westlake commercial backflow pages.',
            },
          ].map((plan, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900 font-heading">{plan.week}</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-[#059669] text-[10px] font-bold rounded-full">
                    {idx === 0 ? 'Sprint Active' : 'Queued'}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800">{plan.title}</div>
                <div className="space-y-2">
                  {plan.tasks.map((t, i) => {
                    const taskKey = `${idx}-${i}`;
                    const isDone = !!checkedTasks[taskKey];
                    return (
                      <div
                        key={i}
                        onClick={() =>
                          setCheckedTasks((prev) => ({
                            ...prev,
                            [taskKey]: !prev[taskKey],
                          }))
                        }
                        className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer select-none"
                      >
                        <div
                          className={`w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                            isDone ? 'bg-[#059669] border-[#059669] text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3" />}
                        </div>
                        <span className={isDone ? 'line-through text-slate-400' : ''}>{t}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() =>
                    setPreviewAssetModal({
                      title: plan.assetTitle,
                      content: plan.assetContent,
                    })
                  }
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer font-sans flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>Preview Asset</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Asset Preview Modal */}
      {previewAssetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#059669]" />
                <h4 className="font-bold text-sm text-slate-900 font-heading">{previewAssetModal.title}</h4>
              </div>
              <button
                onClick={() => setPreviewAssetModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto">
              {previewAssetModal.content}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewAssetModal(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 08 — PRODUCT 07: AGENCY AI CLIENT MANAGER */}
      <section id="for-agencies" className="max-w-6xl mx-auto px-6 space-y-8 scroll-mt-24">
        <div className="bg-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 border border-indigo-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-900/80 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold font-heading uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Product 07 · For Agencies &amp; Multi-Location Franchises</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                Agency AI Client Manager
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 max-w-xl mt-1">
                Manage 10, 50, or 100 local client accounts from a single command center with automated client triage, white-label audit PDFs, and bulk review reply workflows.
              </p>
            </div>

            <button
              onClick={() => setCheckoutModalPlan('agency', 'monthly')}
              className="px-5 py-2.5 bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer font-sans shrink-0 flex items-center gap-2"
            >
              <span>Get Agency Tier ($99/mo)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-indigo-900/60 border border-indigo-800 p-6 rounded-2xl space-y-2 text-center">
              <span className="text-3xl font-black text-rose-400 font-heading">3 Clients</span>
              <div className="text-xs font-bold text-rose-300 uppercase tracking-wider">Need Immediate Action</div>
              <p className="text-[11px] text-indigo-200">Negative review spike or ranking drop flagged by overnight crawl.</p>
            </div>

            <div className="bg-indigo-900/60 border border-indigo-800 p-6 rounded-2xl space-y-2 text-center">
              <span className="text-3xl font-black text-amber-400 font-heading">4 Clients</span>
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">High Upsell Opportunity</div>
              <p className="text-[11px] text-indigo-200">Local competitor slipping in 3-Pack; ready for new location landing pages.</p>
            </div>

            <div className="bg-indigo-900/60 border border-indigo-800 p-6 rounded-2xl space-y-2 text-center">
              <span className="text-3xl font-black text-emerald-400 font-heading">3 Clients</span>
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Healthy &amp; Dominating</div>
              <p className="text-[11px] text-indigo-200">Top 3 Maps ranking maintained, automated review velocity exceeding targets.</p>
            </div>
          </div>

          {/* Interactive Multi-Client Triage Cockpit */}
          <div className="bg-indigo-900/40 border border-indigo-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider font-heading">
                Multi-Location Client Cockpit (Interactive Switcher)
              </span>
              <span className="text-[11px] text-indigo-300">Switch client account below</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {agencyClients.map((cl, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedClientIndex(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selectedClientIndex === idx
                      ? 'bg-indigo-800/90 border-indigo-400 shadow-md ring-1 ring-indigo-400'
                      : 'bg-indigo-950/60 border-indigo-900/80 hover:bg-indigo-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-indigo-300 truncate">{cl.industry}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cl.status === 'healthy'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : cl.status === 'action'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {cl.urgency}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-white">{cl.name}</div>
                  <div className="text-xs text-indigo-200">{cl.rank}</div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-indigo-900/80 rounded-xl border border-indigo-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-xs text-white">
                  Client Status: {agencyClients[selectedClientIndex].name}
                </span>
                <p className="text-xs text-indigo-200 leading-relaxed font-sans">
                  {agencyClients[selectedClientIndex].health}
                </p>
              </div>

              <button
                onClick={() => setShowAgencyReportModal(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer font-sans shrink-0 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Preview White-Label Audit PDF</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Agency Report Modal Preview */}
      {showAgencyReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900 font-heading">
                  White-Label Client Growth Report Preview
                </h4>
              </div>
              <button
                onClick={() => setShowAgencyReportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Client Account</div>
                  <div className="font-bold text-slate-900">{agencyClients[selectedClientIndex].name}</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                  Generated in 3.2s
                </span>
              </div>
              <div className="space-y-1.5 text-slate-700 leading-relaxed font-sans">
                <div>• <strong>Current Rank:</strong> {agencyClients[selectedClientIndex].rank}</div>
                <div>• <strong>Review Volume:</strong> {agencyClients[selectedClientIndex].reviews}</div>
                <div>• <strong>Next Recommended Action:</strong> Deploy 4 geo-targeted neighborhood service pages to maintain 3-Pack supremacy.</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAgencyReportModal(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 09 — PRODUCT 08: INTEGRATED EXECUTION SUITE */}
      <section id="execution-suite" className="max-w-6xl mx-auto px-6 space-y-8 scroll-mt-24">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold font-heading uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" />
            <span>Product 08 · Built-In Operational Tools</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
            The Complete Operational Execution Suite
          </h2>
          <p className="text-slate-600 text-sm">
            You don't need 5 different software subscriptions. Locora connects your strategy directly to execution with native CRM, proposal generation, digital invoicing, and client reporting.
          </p>
        </div>

        {/* Interactive 6-Tool Switcher */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100">
            {executionTools.map((tool, idx) => (
              <button
                key={tool.id}
                onClick={() => setActiveExecutionTool(idx)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeExecutionTool === idx
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tool.title.split('&')[0]}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-block px-2.5 py-1 bg-emerald-50 text-[#059669] font-bold text-[11px] rounded-lg">
                Replaces: {executionTools[activeExecutionTool].replaces}
              </div>
              <h3 className="text-2xl font-extrabold font-heading text-slate-900">
                {executionTools[activeExecutionTool].title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                {executionTools[activeExecutionTool].desc}
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                <span>{executionTools[activeExecutionTool].stats}</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setActiveTab('signup');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Included in Free Explorer Tier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-inner">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-wider">
                Live Module Preview
              </div>
              {executionTools[activeExecutionTool].previewComponent}
            </div>
          </div>
        </div>
      </section>

      {/* 10 — TECHNICAL ARCHITECTURE: THE BUSINESS BRAIN */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-md space-y-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold font-heading uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5" />
              <span>Technical Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
              The Locora Business Brain: How It Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Unlike generic LLM wrappers that forget your details on every prompt, Locora builds a persistent semantic knowledge graph of your local business:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <span className="font-bold text-slate-900 font-heading">1. Data Ingestion</span>
              <p className="text-slate-600">Connects to your Google Business Profile, website crawls, reviews, and competitor signals.</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <span className="font-bold text-slate-900 font-heading">2. Semantic Graph</span>
              <p className="text-slate-600">Stores your core services, target service radius, pricing boundaries, and brand voice guidelines securely.</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <span className="font-bold text-slate-900 font-heading">3. Priority Ranking</span>
              <p className="text-slate-600">Calculates estimated revenue impact for every action item before showing it to you.</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <span className="font-bold text-slate-900 font-heading">4. 1-Click Execution</span>
              <p className="text-slate-600">Deploys schemas, drafts geo-landing pages, and publishes review responses automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 11 — FINAL PUBLIC CTA */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="bg-gradient-to-br from-[#022c22] to-[#044a36] text-white rounded-3xl p-10 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
              Ready to test these products on your business?
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/90 font-sans">
              Start with our 100% Free Explorer plan or jump straight into the full Pro Growth tier.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setActiveTab('signup');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <span>Start Free Explorer Tier</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setActiveTab('pricing_public');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition-all cursor-pointer font-sans"
              >
                View Plans &amp; Tiers
              </button>
              <button
                onClick={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-4 bg-white/5 hover:bg-white/15 text-white font-bold text-sm rounded-xl border border-white/10 transition-all cursor-pointer font-sans"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
