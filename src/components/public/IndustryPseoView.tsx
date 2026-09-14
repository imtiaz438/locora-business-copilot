import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { INDUSTRY_METADATA, applyPageMetadata } from '../../utils/seoMetadata';
import {
  Zap,
  ArrowRight,
  Globe,
  FileText,
  Stethoscope,
  Wrench,
  Home,
  Scale,
  Utensils,
  Car,
  Briefcase,
  Sparkles,
  Calculator,
  CheckCircle2,
  Copy,
  Check,
  Star,
  DollarSign,
  Clock,
  Layers,
} from 'lucide-react';

export interface IndustryData {
  slug: string;
  name: string;
  category: string;
  iconName: string;
  heroHeadline: string;
  heroSubheadline: string;
  targetKeywords: string[];
  stats: Array<{ label: string; value: string; detail: string }>;
  useCases: Array<{ title: string; desc: string }>;
  schemaType: string;
  sampleProposalSnippet: string;
  sampleReviewReply: string;
  defaultAvgTicket: number;
}

export const INDUSTRY_DATABASE: Record<string, IndustryData> = {
  dentists: {
    slug: 'dentists',
    name: 'Dental Practices',
    category: 'Healthcare & Dentistry',
    iconName: 'Stethoscope',
    heroHeadline: '#1 AI Operating System & Local SEO Copilot for Dental Practices',
    heroSubheadline:
      'Dominate Google Maps local search, automate patient review responses, manage treatment plan estimates, and scale private pay leads for your dental clinic.',
    targetKeywords: [
      'AI local SEO for dental practices',
      'Google Maps ranking tool for dentists',
      'automated patient CRM and invoicing for dental clinics',
      'proposal software for dental marketing agencies',
      'how do dentists improve their Google Business ranking'
    ],
    stats: [
      { label: 'Map Pack Impressions', value: '+340%', detail: 'In first 60 days on Locora AI' },
      { label: 'Patient Reviews', value: '4.8★', detail: 'Automated 5-star review collection' },
      { label: 'Hours Saved/Wk', value: '14 hrs', detail: 'On treatment proposals & invoicing' },
    ],
    useCases: [
      {
        title: 'Local Google Maps 3-Pack Dominance',
        desc: 'Automatically generate localized dental content and geotagged schema markup to rank top for "dentist near me" and "cosmetic dentistry".',
      },
      {
        title: 'Treatment Proposal & Invoicing Engine',
        desc: 'Send clear, multi-tier treatment estimate proposals directly to patient phones with instant digital payment links.',
      },
      {
        title: 'Automated Google Review Responder',
        desc: 'HIPAA-compliant AI review responses that turn happy patients into 5-star Google Business profile boosters.',
      },
    ],
    schemaType: 'Dentist',
    sampleProposalSnippet: 'Comprehensive Cosmetic Treatment Proposal • Porcelain Veneers (6 Units) + Zoom Whitening • Estimated Timeline: 3 Visits • Digital Signature & Flexible Financing Terms Included.',
    sampleReviewReply: '"Thank you so much for the 5-star review, Sarah! Our dental team in [City] is delighted that your smile makeover exceeded expectations. We look forward to seeing you at your next routine cleaning!"',
    defaultAvgTicket: 1200,
  },
  'hvac-contractors': {
    slug: 'hvac-contractors',
    name: 'HVAC Contractors',
    category: 'Home Services & Contracting',
    iconName: 'Wrench',
    heroHeadline: 'AI Business Operating System & Local SEO for HVAC & Cooling Contractors',
    heroSubheadline:
      'Capture emergency repair calls, rank #1 in your local service radius, generate instant job estimates, and manage maintenance contract renewals.',
    targetKeywords: [
      'local SEO copilot for HVAC companies',
      'AI lead management for HVAC contractors',
      'automated invoicing tool for home service contractors',
      'Google Business optimization for HVAC businesses',
      'how can HVAC companies get more local leads with AI'
    ],
    stats: [
      { label: 'Service Call Leads', value: '3.8x', detail: 'More inbound high-intent local calls' },
      { label: 'Estimate Close Rate', value: '+42%', detail: 'Faster digital mobile proposals' },
      { label: 'Annual Revenue Growth', value: '+$85k', detail: 'Average contractor boost year 1' },
    ],
    useCases: [
      {
        title: 'Multi-Zip Code Radius Local SEO',
        desc: 'Generate localized service area pages and geotagged project case studies that rank across every suburb in your territory.',
      },
      {
        title: 'Instant Mobile Estimates & Invoicing',
        desc: 'Techs in the field can send professional AC/Heating unit replacement proposals on-the-spot from any phone or tablet.',
      },
      {
        title: 'Automated Service Renewal Reminders',
        desc: 'AI client CRM tracks installation dates and automatically pings homeowners for seasonal tune-ups.',
      },
    ],
    schemaType: 'HVACBusiness',
    sampleProposalSnippet: 'Trane 16 SEER Heat Pump System Installation Proposal • Includes Ductwork Inspection, 10-Yr Warranty & Permit Filing • Fixed Price: $7,850 • Acceptance block ready.',
    sampleReviewReply: '"Thanks for the review, Mike! Our HVAC technicians were glad to get your AC cooling quickly during the heatwave. Enjoy the new high-efficiency system!"',
    defaultAvgTicket: 3500,
  },
  'real-estate': {
    slug: 'real-estate',
    name: 'Real Estate Agents',
    category: 'Real Estate & Property',
    iconName: 'Home',
    heroHeadline: 'AI Business OS & Hyper-Local Ranking Copilot for Real Estate Agents & Teams',
    heroSubheadline:
      'Establish hyper-local neighborhood authority, generate client pitch decks & CMA proposals, and capture home seller leads before competitors.',
    targetKeywords: [
      'AI CRM for real estate agents and teams',
      'automated proposal generator for real estate professionals',
      'local SEO tool for real estate agencies',
      'client follow-up automation for realtors',
      'how do real estate agents automate client follow-up and SEO'
    ],
    stats: [
      { label: 'Local Seller Leads', value: '4.2x', detail: 'Higher seller inquiry conversion' },
      { label: 'Proposal Time', value: '< 3 mins', detail: 'To generate personalized CMA decks' },
      { label: 'Google Search Rank', value: '#1', detail: 'Target neighborhood agent keywords' },
    ],
    useCases: [
      {
        title: 'Neighborhood Dominance & SEO Pages',
        desc: 'Create AI-powered hyper-local community guides and market trend summaries that dominate Google search results.',
      },
      {
        title: 'Instant Listing Proposals & Seller Decks',
        desc: 'Generate high-converting listing presentation proposals with custom commission breakdowns and marketing plans.',
      },
      {
        title: 'Client Referral & Review Automation',
        desc: 'Keep buyers and sellers engaged long after closing with automated anniversary check-ins and review requests.',
      },
    ],
    schemaType: 'RealEstateAgent',
    sampleProposalSnippet: 'Exclusive Listing Agreement & Marketing Blueprint • Professional Photography, Drone Video, 3D Tour & Social Campaign • Commission Structure: 5% Total.',
    sampleReviewReply: '"Thank you, David & Lisa! It was an absolute pleasure helping you sell your home for $45,000 over asking price in [Neighborhood]. Best wishes in your new chapter!"',
    defaultAvgTicket: 8500,
  },
  'law-firms': {
    slug: 'law-firms',
    name: 'Law Firms & Attorneys',
    category: 'Legal Services',
    iconName: 'Scale',
    heroHeadline: 'AI Business Operating System & Local Search Dominance for Law Firms',
    heroSubheadline:
      'Attract high-value cases, dominate local legal keywords, manage client intake proposals, and maintain absolute brand authority.',
    targetKeywords: ['Law Firm Local SEO', 'Attorney CRM', 'Personal Injury Google Maps SEO', 'Legal Intake Proposals'],
    stats: [
      { label: 'High-Value Inquiries', value: '+280%', detail: 'Increase in qualified case leads' },
      { label: 'Local Pack Visibility', value: '#1-3', detail: 'In primary practice metro areas' },
      { label: 'Intake Velocity', value: '10x', detail: 'Faster fee agreement signing' },
    ],
    useCases: [
      {
        title: 'Practice Area Local Search Optimization',
        desc: 'Rank for specialized legal queries ("car accident lawyer near me", "estate attorney") with authority JSON-LD schema.',
      },
      {
        title: 'Custom Fee Agreements & Engagement Letters',
        desc: 'Generate branded legal retainer proposals with transparent fee terms and one-click payment links.',
      },
      {
        title: 'Client Review & Reputation Guardrail',
        desc: 'Build an impenetrable 5-star Google Business reputation with automated, dignified client review follow-ups.',
      },
    ],
    schemaType: 'Attorney',
    sampleProposalSnippet: 'Legal Representation Agreement • Estate Planning & Living Trust Package • Flat Fee: $2,750 • Includes Pour-Over Will, Healthcare Directive, and Asset Transfer Deed.',
    sampleReviewReply: '"Thank you for your trust and kind words. Our legal team is dedicated to protecting our clients’ rights and achieving fair outcomes. We appreciate your recommendation."',
    defaultAvgTicket: 4200,
  },
  plumbers: {
    slug: 'plumbers',
    name: 'Plumbing Services',
    category: 'Home Services & Contracting',
    iconName: 'Wrench',
    heroHeadline: 'AI Business OS & Emergency Call Local SEO for Plumbing Companies',
    heroSubheadline:
      'Rank #1 when homeowners search for emergency drain cleaning, pipe repairs, and water heater installs in your service territory.',
    targetKeywords: ['Plumber Local SEO', 'Plumbing CRM', 'Emergency Plumbing Leads', 'Job Quote Generator'],
    stats: [
      { label: 'Emergency Call Volume', value: '+310%', detail: 'Higher local Google Map pack calls' },
      { label: 'Job Win Rate', value: '88%', detail: 'Using instant digital estimates' },
      { label: 'Review Growth', value: '50+ /mo', detail: 'Verified 5-star homeowner reviews' },
    ],
    useCases: [
      {
        title: 'Geo-Targeted Emergency Search Pages',
        desc: 'Automatically generate neighborhood-specific plumbing landing pages optimized for mobile voice search.',
      },
      {
        title: 'Field Estimate & Instant Invoicing',
        desc: 'Create detailed line-item plumbing quotes for camera inspections, repiping, and tankless conversions.',
      },
      {
        title: 'Customer Retainer & Service Plans',
        desc: 'Manage annual plumbing maintenance members in the CRM with automated billing & inspection alerts.',
      },
    ],
    schemaType: 'Plumber',
    sampleProposalSnippet: 'Tankless Water Heater Conversion & Whole-Home Repipe • Navien NPE-240A2 + Lifetime Warranty • Fixed Scope: $4,650 • Turnaround: 1 Business Day.',
    sampleReviewReply: '"Thank you for calling us for your emergency pipe repair, Jason! We are always ready 24/7 to keep your home protected from water damage."',
    defaultAvgTicket: 1850,
  },
  'med-spas': {
    slug: 'med-spas',
    name: 'MedSpas & Aesthetic Clinics',
    category: 'Health & Beauty',
    iconName: 'Sparkles',
    heroHeadline: 'AI Business Operating System & Local Growth Engine for MedSpas',
    heroSubheadline:
      'Attract high-ticket Botox, filler, and laser clients, automate consultation proposals, and build an enviable local reputation.',
    targetKeywords: ['MedSpa Local SEO', 'Aesthetic Clinic CRM', 'Botox Google Maps SEO', 'MedSpa Treatment Proposals'],
    stats: [
      { label: 'Consultation Bookings', value: '+260%', detail: 'Inbound cosmetic patient growth' },
      { label: 'Average Ticket Size', value: '$1,450', detail: 'With multi-procedure treatment plans' },
      { label: 'Google Review Score', value: '4.9★', detail: 'Automated post-treatment review loops' },
    ],
    useCases: [
      {
        title: 'High-Ticket Cosmetic Search SEO',
        desc: 'Dominate local rankings for laser resurfacing, body contouring, and facial aesthetics in your affluent suburban markets.',
      },
      {
        title: 'Multi-Tier Treatment Plans',
        desc: 'Deliver gorgeous treatment proposal packages that bundle injectables with skin rejuvenation for 3x higher cart sizes.',
      },
      {
        title: 'Automated Aesthetic Membership Billing',
        desc: 'Run recurring monthly beauty memberships with automated invoice receipts and milestone reminders.',
      },
    ],
    schemaType: 'HealthAndBeautyBusiness',
    sampleProposalSnippet: 'Customized Rejuvenation Plan • 3x Morpheus8 RF Microneedling + Post-Care Peptide Regimen • Investment: $2,400 • Monthly Payment Plan Option Available.',
    sampleReviewReply: '"Thank you so much, Emily! Our aesthetic team loves helping you achieve that radiant glow. See you at your next facial maintenance session!"',
    defaultAvgTicket: 1600,
  },
  restaurants: {
    slug: 'restaurants',
    name: 'Restaurants & Hospitality',
    category: 'Food & Dining',
    iconName: 'Utensils',
    heroHeadline: 'AI Business OS & Local SEO Dining Discovery for Restaurants & Caterers',
    heroSubheadline:
      'Fill your dining room, dominate "best dinner near me" searches, streamline catering event quotes, and turn reviews into repeat guests.',
    targetKeywords: ['Restaurant Local SEO', 'Catering Proposal Software', 'Google Maps Food Search', 'Restaurant Review AI'],
    stats: [
      { label: 'Table Reservations', value: '+190%', detail: 'From Google Maps discovery' },
      { label: 'Catering Close Rate', value: '+55%', detail: 'With instant menu estimates' },
      { label: 'Review Velocity', value: '80+ /mo', detail: 'Fresh verified diner reviews' },
    ],
    useCases: [
      {
        title: 'Google Maps Food Discovery Dominance',
        desc: 'Optimize your Google Business Profile menu, dietary tags, and cuisine categories to capture nearby hungry diners.',
      },
      {
        title: 'Catering & Event Proposal Generator',
        desc: 'Create mouthwatering catering proposals with per-head pricing, drink packages, and deposit payment links in seconds.',
      },
      {
        title: 'Diner Sentiment & Review Responder',
        desc: 'Turn positive feedback into brand loyalty and address guest concerns immediately with thoughtful AI replies.',
      },
    ],
    schemaType: 'Restaurant',
    sampleProposalSnippet: 'Private Dining & Corporate Banquet Proposal • 45 Guests • 3-Course Artisanal Menu + Wine Pairing • Total Quote: $3,850 + Tax & Gratuity.',
    sampleReviewReply: '"Thank you for celebrating your anniversary with us, Brandon! Chef Marco was thrilled to hear you loved the dry-aged ribeye. We look forward to welcoming you back soon!"',
    defaultAvgTicket: 950,
  },
  'auto-repair': {
    slug: 'auto-repair',
    name: 'Auto Repair & Detailing',
    category: 'Automotive Services',
    iconName: 'Car',
    heroHeadline: 'AI Business OS & High-Ticket Repair SEO for Auto Service Centers',
    heroSubheadline:
      'Keep your service bays full, rank #1 for transmission, brake, and engine diagnostics, and send transparent digital estimates.',
    targetKeywords: ['Auto Repair Local SEO', 'Mechanic CRM', 'Brake Repair Google Maps SEO', 'Auto Service Estimate Software'],
    stats: [
      { label: 'Bay Utilization', value: '94%', detail: 'Steady weekly vehicle intake' },
      { label: 'Estimate Approval', value: '+48%', detail: 'Transparent photo/line-item quotes' },
      { label: 'Customer Retention', value: '72%', detail: 'Automated maintenance reminders' },
    ],
    useCases: [
      {
        title: 'High-Intent Repair Keyword SEO',
        desc: 'Rank for high-margin repair terms like "transmission rebuild near me" and "European auto repair" across your county.',
      },
      {
        title: 'Itemized Digital Repair Estimates',
        desc: 'Send clear, photo-verified repair estimates to customer smartphones with one-click approval buttons.',
      },
      {
        title: 'Preventative Service CRM Reminders',
        desc: 'Automatically notify motorists when mileage thresholds suggest oil changes, brake pads, or timing belts.',
      },
    ],
    schemaType: 'AutoRepair',
    sampleProposalSnippet: 'Complete Brake System Overhaul & Rotor Replacement • Ceramic Pads, Fluid Flush & 24-Mo Warranty • Estimate: $890 • Digital Approval Ready.',
    sampleReviewReply: '"Thank you for trusting our mechanic team with your vehicle, Chris! Safe travels on your road trip and let us know if you need anything else."',
    defaultAvgTicket: 850,
  },
  'agencies': {
    slug: 'agencies',
    name: 'Marketing & SEO Agencies',
    category: 'Agency & Professional Services',
    iconName: 'Briefcase',
    heroHeadline: 'Agency Operating System with AI Automation & Unified Client CRM',
    heroSubheadline:
      'The all-in-one local SEO and CRM platform built for modern agencies. Automate Google Maps ranking audits, generate tiered proposals in 60s, and manage client retainers with white-label invoicing.',
    targetKeywords: [
      'white label local SEO and CRM platform for agencies',
      'AI operating system for digital marketing agencies',
      'client reporting and proposal automation for SEO agencies',
      'scalable CRM and SEO tool for small marketing agencies',
      'agency operating system with AI automation',
      'AI powered client management for agencies',
      'automated Google Maps ranking tool for agencies',
      'all-in-one local SEO and CRM platform',
      'proposal generator with built-in CRM',
      'local SEO software with proposal automation'
    ],
    stats: [
      { label: 'Software Overhead Saved', value: '80%', detail: 'Replaces 5+ disconnected SaaS tools' },
      { label: 'Retainer Close Rate', value: '+45%', detail: 'Using instant 3-tier proposals' },
      { label: 'Client Retention', value: '14+ Mo', detail: 'Automated local SEO reporting & CRM' },
    ],
    useCases: [
      {
        title: 'Automated Google Maps & Schema Audits',
        desc: 'Generate white-label 7-point audit teardowns with JSON-LD schema in 10 seconds to convert cold outreach into retainers.',
      },
      {
        title: 'Tiered Proposal & Scope Generator',
        desc: 'Draft Good/Better/Best commercial proposals directly from discovery notes with built-in digital signature terms.',
      },
      {
        title: 'Visual Pipeline CRM & PDF Invoicing',
        desc: 'Track deal stages, log client notes, and issue branded white-label PDF invoices with automated tax calculations.',
      },
    ],
    schemaType: 'ProfessionalService',
    sampleProposalSnippet: 'Agency Growth Retainer Agreement • Full Local SEO & Google Maps 3-Pack Management, 8 Citations/Mo & Schema Deployment • Retainer: $2,500/mo • Terms: Net 15.',
    sampleReviewReply: '"Thank you, Marcus! Our team loves scaling local visibility for your dental practice. We are excited for another quarter of record inbound patient calls!"',
    defaultAvgTicket: 2500,
  },
  'contractors': {
    slug: 'contractors',
    name: 'General Contractors & Builders',
    category: 'Home Services & Contracting',
    iconName: 'Wrench',
    heroHeadline: 'Google Maps SEO Copilot & Proposal Generator for Contractors',
    heroSubheadline:
      'Capture high-margin remodeling and construction projects, automate Google Maps ranking across your service radius, and deliver 3-tier digital estimates on site.',
    targetKeywords: [
      'Google Maps SEO copilot for contractors',
      'local ranking software for multi-location businesses',
      'client CRM and invoicing in one platform',
      'AI business operating system for service businesses',
      'commercial quote generator'
    ],
    stats: [
      { label: 'Remodeling Inquiries', value: '+290%', detail: 'Inbound local search project leads' },
      { label: 'Bid Win Rate', value: '52%', detail: 'Using 3-tier Good/Better/Best proposals' },
      { label: 'Average Project Lift', value: '+$3,200', detail: 'Higher average ticket size' },
    ],
    useCases: [
      {
        title: 'Service Radius Google Maps Dominance',
        desc: 'Deploy GeneralContractor schema and geotargeted suburb pages to outrank competitors across your entire metro area.',
      },
      {
        title: 'On-Site 3-Tier Proposal Builder',
        desc: 'Present homeowners with itemized remodeling packages (Standard, Premium, Lifetime Warranty) directly on your tablet.',
      },
      {
        title: 'Automated Job Sign-Off & Reviews',
        desc: 'Send SMS review requests on the driveway during final project walkthroughs to build a 5-star local reputation.',
      },
    ],
    schemaType: 'GeneralContractor',
    sampleProposalSnippet: 'Master Bathroom Remodel & Custom Tile Installation • Includes Waterproofing Membrane, Fixtures & 10-Yr Workmanship Warranty • Fixed Price: $14,500.',
    sampleReviewReply: '"Thank you for the 5-star review, Tom! Our construction crew was glad to complete your kitchen remodel ahead of schedule. Enjoy the new custom countertops!"',
    defaultAvgTicket: 6500,
  },
};

interface IndustryPseoViewProps {
  industrySlug?: string;
  onNavigateSlug?: (slug: string) => void;
}

export const IndustryPseoView: React.FC<IndustryPseoViewProps> = ({
  industrySlug,
  onNavigateSlug,
}) => {
  const { setActiveTab, setCheckoutModalPlan, updateBusinessProfile } = useApp();

  const getSlugFromUrl = (): string => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/for\/([a-z0-9-]+)/);
      if (match && match[1] && INDUSTRY_DATABASE[match[1]]) {
        return match[1];
      }
    }
    return 'dentists';
  };

  const [activeSlug, setActiveSlug] = useState<string>(industrySlug || getSlugFromUrl());
  const [copiedCode, setCopiedCode] = useState(false);
  const [activePlaygroundTab, setActivePlaygroundTab] = useState<'schema' | 'proposal' | 'review'>('schema');

  // Interactive ROI Calculator State
  const [monthlyLeads, setMonthlyLeads] = useState<number>(25);
  const [avgTicket, setAvgTicket] = useState<number>(1200);

  const currentIndustry = INDUSTRY_DATABASE[activeSlug] || INDUSTRY_DATABASE['dentists'];

  useEffect(() => {
    setAvgTicket(currentIndustry.defaultAvgTicket);
  }, [currentIndustry]);

  useEffect(() => {
    if (industrySlug && INDUSTRY_DATABASE[industrySlug]) {
      setActiveSlug(industrySlug);
    }
  }, [industrySlug]);

  useEffect(() => {
    const meta = INDUSTRY_METADATA[currentIndustry.slug];
    if (meta) {
      applyPageMetadata('industry_pseo', {
        title: meta.title,
        description: meta.description,
        canonicalPath: meta.canonicalPath,
      });
    } else {
      applyPageMetadata('industry_pseo', {
        title: `${currentIndustry.name} Local SEO & AI Operating System | Locora AI`,
        description: currentIndustry.heroSubheadline,
        canonicalPath: `/for/${currentIndustry.slug}`,
      });
    }
  }, [currentIndustry]);

  const handleSelectIndustry = (newSlug: string) => {
    setActiveSlug(newSlug);
    if (onNavigateSlug) {
      onNavigateSlug(newSlug);
    } else {
      window.history.pushState({}, '', `/for/${newSlug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchWithIndustryContext = (targetTab: string = 'dashboard') => {
    updateBusinessProfile({
      industry: currentIndustry.category,
      tagline: `Premier ${currentIndustry.name} Provider`,
    });
    setActiveTab(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Calculator calculations
  const projectedExtraLeads = Math.round(monthlyLeads * 0.35);
  const projectedExtraRevenue = projectedExtraLeads * avgTicket;
  const hoursSavedPerMonth = 45;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope':
        return <Stethoscope className="w-6 h-6 text-[#059669]" />;
      case 'Wrench':
        return <Wrench className="w-6 h-6 text-[#059669]" />;
      case 'Home':
        return <Home className="w-6 h-6 text-[#059669]" />;
      case 'Scale':
        return <Scale className="w-6 h-6 text-[#059669]" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-[#059669]" />;
      case 'Utensils':
        return <Utensils className="w-6 h-6 text-[#059669]" />;
      case 'Car':
        return <Car className="w-6 h-6 text-[#059669]" />;
      default:
        return <Briefcase className="w-6 h-6 text-[#059669]" />;
    }
  };

  const schemaJsonString = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': currentIndustry.schemaType,
      'name': `${currentIndustry.name} Business`,
      'url': `https://locoraai.com/for/${currentIndustry.slug}`,
      'description': currentIndustry.heroSubheadline,
      'areaServed': 'Local Service Radius',
      'knowsAbout': currentIndustry.targetKeywords,
    },
    null,
    2
  );

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans bg-slate-50 text-slate-900">
      {/* Industry Selector Tabs Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto text-xs">
        <span className="text-slate-400 font-bold px-2 flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          Select Industry:
        </span>
        {Object.values(INDUSTRY_DATABASE).map((ind) => {
          const isSelected = ind.slug === activeSlug;
          return (
            <button
              key={ind.slug}
              onClick={() => handleSelectIndustry(ind.slug)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{ind.name}</span>
            </button>
          );
        })}
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-4xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold uppercase tracking-wider font-heading">
          {renderIcon(currentIndustry.iconName)}
          <span>Locora AI for {currentIndustry.category}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-slate-900 tracking-tight leading-tight">
          {currentIndustry.heroHeadline}
        </h1>

        <p className="text-sm sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto font-sans">
          {currentIndustry.heroSubheadline}
        </p>

        {/* Target Keywords Badges */}
        <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
          <span className="text-xs text-slate-400 font-medium">Pre-Tuned Ranking Keywords:</span>
          {currentIndustry.targetKeywords.map((kw, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold"
            >
              ✓ {kw}
            </span>
          ))}
        </div>

        {/* Call To Action Buttons */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => handleLaunchWithIndustryContext('dashboard')}
            className="w-full sm:w-auto px-8 py-4 bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            <span>Launch {currentIndustry.name} Copilot Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCheckoutModalPlan('pro', 'monthly')}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            <span>Upgrade to Pro ($29/mo)</span>
            <Zap className="w-4 h-4 text-[#059669]" />
          </button>
        </div>
      </div>

      {/* ROI & Time Savings Interactive Calculator */}
      <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold font-heading uppercase mb-1">
              <Calculator className="w-3.5 h-3.5 text-[#059669]" />
              <span>Interactive ROI & Time Savings Calculator</span>
            </div>
            <h2 className="text-xl font-bold font-heading text-slate-900">
              Calculate Projected Revenue Lift for {currentIndustry.name}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Based on average client results</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Current Monthly Leads / Inquiries:</span>
                <span className="font-mono text-emerald-700">{monthlyLeads} leads/mo</span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={monthlyLeads}
                onChange={(e) => setMonthlyLeads(Number(e.target.value))}
                className="w-full accent-[#059669] cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Average Value Per Client / Job ($):</span>
                <span className="font-mono text-emerald-700">${avgTicket.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="200"
                max="10000"
                step="100"
                value={avgTicket}
                onChange={(e) => setAvgTicket(Number(e.target.value))}
                className="w-full accent-[#059669] cursor-pointer"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-6 p-6 bg-slate-900 text-white rounded-2xl space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Projected New Revenue</span>
                <div className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-400">
                  +${projectedExtraRevenue.toLocaleString()}
                  <span className="text-xs text-slate-300 font-normal"> /mo</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Admin Hours Saved</span>
                <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                  ~{hoursSavedPerMonth} hrs
                  <span className="text-xs text-slate-300 font-normal"> /mo</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-300 border-t border-slate-800 pt-3">
              Automated Local SEO map pack rankings (+35% conversion) combined with rapid proposals and instant PDF invoicing.
            </p>
          </div>
        </div>
      </div>

      {/* ROI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {currentIndustry.stats.map((stat, index) => (
          <div
            key={index}
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-2 hover:border-emerald-300 transition-colors"
          >
            <div className="text-3xl sm:text-4xl font-black text-[#059669] font-heading">{stat.value}</div>
            <div className="text-sm font-bold text-slate-800">{stat.label}</div>
            <p className="text-xs text-slate-500">{stat.detail}</p>
          </div>
        ))}
      </div>

      {/* Interactive Live Deliverables Playground */}
      <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-900">
              Interactive Deliverables Playground for {currentIndustry.name}
            </h2>
            <p className="text-xs text-slate-500">
              Preview the real deliverables Locora AI creates for this trade in seconds.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActivePlaygroundTab('schema')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePlaygroundTab === 'schema' ? 'bg-[#059669] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              JSON-LD Schema
            </button>
            <button
              onClick={() => setActivePlaygroundTab('proposal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePlaygroundTab === 'proposal' ? 'bg-[#059669] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Proposal Scope
            </button>
            <button
              onClick={() => setActivePlaygroundTab('review')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePlaygroundTab === 'review' ? 'bg-[#059669] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Review Reply
            </button>
          </div>
        </div>

        {/* Playground Content Display */}
        {activePlaygroundTab === 'schema' && (
          <div className="bg-slate-950 text-slate-100 rounded-2xl p-4 space-y-3 font-mono text-xs border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
              <span>Schema.org / {currentIndustry.schemaType} Code</span>
              <button
                onClick={() => handleCopy(schemaJsonString)}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="text-emerald-300 overflow-x-auto leading-relaxed max-h-60">
              {schemaJsonString}
            </pre>
          </div>
        )}

        {activePlaygroundTab === 'proposal' && (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-900 font-heading">Auto-Generated Proposal Deliverable</span>
              <button
                onClick={() => handleLaunchWithIndustryContext('proposals')}
                className="text-[#059669] font-bold hover:underline cursor-pointer"
              >
                Open in Proposal Builder →
              </button>
            </div>
            <p className="text-slate-800 leading-relaxed font-medium bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              {currentIndustry.sampleProposalSnippet}
            </p>
          </div>
        )}

        {activePlaygroundTab === 'review' && (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-900 font-heading">AI 5-Star Reputation Reply</span>
              <button
                onClick={() => handleLaunchWithIndustryContext('local_seo')}
                className="text-[#059669] font-bold hover:underline cursor-pointer"
              >
                Open in Local SEO Copilot →
              </button>
            </div>
            <p className="text-slate-800 leading-relaxed font-medium bg-white p-4 rounded-xl border border-slate-200 shadow-2xs italic">
              {currentIndustry.sampleReviewReply}
            </p>
          </div>
        )}
      </div>

      {/* Footer Industry Interlinking Directory */}
      <div className="max-w-5xl mx-auto pt-8 border-t border-slate-200 text-center space-y-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-heading">
          Explore Locora AI by Industry Sector:
        </h4>
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs">
          {Object.values(INDUSTRY_DATABASE).map((ind) => (
            <button
              key={ind.slug}
              onClick={() => handleSelectIndustry(ind.slug)}
              className="text-slate-600 hover:text-[#059669] hover:underline cursor-pointer font-medium"
            >
              Locora AI for {ind.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
