import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
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
    targetKeywords: ['Dental Local SEO', 'Dentist CRM Software', 'Google Maps Ranking for Dentists', 'Dental Practice AI Copilot'],
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
  },
  'hvac-contractors': {
    slug: 'hvac-contractors',
    name: 'HVAC Contractors',
    category: 'Home Services & Contracting',
    iconName: 'Wrench',
    heroHeadline: 'AI Business Operating System & Local SEO for HVAC & Cooling Contractors',
    heroSubheadline:
      'Capture emergency repair calls, rank #1 in your local service radius, generate instant job estimates, and manage maintenance contract renewals.',
    targetKeywords: ['HVAC Local SEO', 'HVAC CRM Software', 'AC Repair Google Maps SEO', 'Contractor Estimate Generator'],
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
  },
  'real-estate': {
    slug: 'real-estate',
    name: 'Real Estate Agents',
    category: 'Real Estate & Property',
    iconName: 'Home',
    heroHeadline: 'AI Business OS & Hyper-Local Ranking Copilot for Real Estate Agents & Teams',
    heroSubheadline:
      'Establish hyper-local neighborhood authority, generate client pitch decks & CMA proposals, and capture home seller leads before competitors.',
    targetKeywords: ['Real Estate Local SEO', 'Realtor CRM', 'Neighborhood Market Reports AI', 'Listing Pitch Deck Generator'],
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
        title: 'Custom Treatment Package Proposals',
        desc: 'Send gorgeous aesthetic treatment plans with before/after expectations and payment schedule breakdowns.',
      },
      {
        title: 'Client Retention & VIP Membership CRM',
        desc: 'Track client treatment cycles and send automated reminders for 3-month touchups.',
      },
    ],
    schemaType: 'MedicalClinic',
  },
  restaurants: {
    slug: 'restaurants',
    name: 'Restaurants & Hospitality',
    category: 'Food & Dining',
    iconName: 'Utensils',
    heroHeadline: 'AI Local SEO & Guest Engagement Operating System for Restaurants',
    heroSubheadline:
      'Drive foot traffic, rank top for local dining searches, automate review responses, and manage catering event proposals.',
    targetKeywords: ['Restaurant Local SEO', 'Catering Proposal Software', 'Google Maps Restaurant Ranking', 'Dining CRM'],
    stats: [
      { label: 'Diner Map Searches', value: '+450%', detail: 'Increase in "restaurants near me"' },
      { label: 'Catering Sales', value: '+65%', detail: 'Higher event catering inquiry conversion' },
      { label: 'Monthly Reviews', value: '120+', detail: 'Verified diner reviews captured' },
    ],
    useCases: [
      {
        title: 'Google Maps & Local Dining Search SEO',
        desc: 'Optimize menu items, dietary keywords (vegan, gluten-free, brunch), and location schema for peak weekend search volumes.',
      },
      {
        title: 'Event & Corporate Catering Proposals',
        desc: 'Generate professional catering estimates with itemized menu options and online deposit collection.',
      },
      {
        title: 'Reputation & Review Response AI',
        desc: 'Respond graciously to all Google and Yelp reviews within seconds using brand-tailored AI tones.',
      },
    ],
    schemaType: 'Restaurant',
  },
  'auto-repair': {
    slug: 'auto-repair',
    name: 'Auto Repair Shops',
    category: 'Automotive',
    iconName: 'Car',
    heroHeadline: 'AI Business OS & Local SEO Copilot for Auto Repair Shops & Mechanics',
    heroSubheadline:
      'Fill service bays, rank #1 for brake & engine repairs in your city, send mobile digital inspection estimates, and build lifetime customer loyalty.',
    targetKeywords: ['Auto Repair Local SEO', 'Mechanic CRM', 'Car Repair Quote Generator', 'Auto Shop Google Maps SEO'],
    stats: [
      { label: 'Service Bay Volume', value: '+320%', detail: 'Higher local search appointments' },
      { label: 'Estimate Approval', value: '79%', detail: 'Mobile digital repair estimates' },
      { label: 'Repeat Customer Rate', value: '+35%', detail: 'Automated oil change reminders' },
    ],
    useCases: [
      {
        title: 'Local Mechanics & Diagnostics Ranking',
        desc: 'Rank for specific vehicle makes and services ("BMW specialist near me", "transmission repair").',
      },
      {
        title: 'Digital Repair Quotes & Invoicing',
        desc: 'Send clear, line-item repair estimates with parts and labor breakdowns directly to customer smartphones.',
      },
      {
        title: 'Automated Maintenance Interval Alerts',
        desc: 'Keep customers coming back with timely AI reminders for state inspections, tire rotations, and brake checks.',
      },
    ],
    schemaType: 'AutoRepair',
  },
};

interface IndustryPseoViewProps {
  slug?: string;
  onNavigateSlug?: (slug: string) => void;
}

export const IndustryPseoView: React.FC<IndustryPseoViewProps> = ({ slug: initialSlug, onNavigateSlug }) => {
  const { setActiveTab, setCheckoutModalPlan } = useApp();

  const [activeSlug, setActiveSlug] = useState<string>(() => {
    if (initialSlug && INDUSTRY_DATABASE[initialSlug]) return initialSlug;
    const path = window.location.pathname.replace(/^\/for\//, '').replace(/\/$/, '');
    if (INDUSTRY_DATABASE[path]) return path;
    return 'dentists';
  });

  const currentIndustry = INDUSTRY_DATABASE[activeSlug] || INDUSTRY_DATABASE['dentists'];

  useEffect(() => {
    if (initialSlug && INDUSTRY_DATABASE[initialSlug]) {
      setActiveSlug(initialSlug);
    } else if (!window.location.pathname.startsWith('/for/')) {
      window.history.pushState({}, '', `/for/${activeSlug}`);
    }
  }, [initialSlug, activeSlug]);

  const handleSelectIndustry = (newSlug: string) => {
    setActiveSlug(newSlug);
    if (onNavigateSlug) {
      onNavigateSlug(newSlug);
    } else {
      window.history.pushState({}, '', `/for/${newSlug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans bg-slate-50 text-slate-900">
      {/* Industry Selector Tabs Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto text-xs">
        <span className="text-slate-400 font-bold px-2 flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          Select Local Industry:
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
          <span className="text-xs text-slate-400 font-medium">Targeted High-Intent SEO Keywords:</span>
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
            onClick={() => setActiveTab('signup')}
            className="w-full sm:w-auto px-8 py-4 bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            <span>Start Free for {currentIndustry.name}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCheckoutModalPlan('pro', 'monthly')}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            <span>Upgrade to Pro ($19/mo)</span>
            <Zap className="w-4 h-4 text-[#059669]" />
          </button>
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

      {/* Industry Core Use Cases */}
      <div className="max-w-5xl mx-auto space-y-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold font-heading text-slate-900">
            Tailored Copilot Capabilities for {currentIndustry.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Purpose-built workflows engineered to replace fragmented tools with one seamless OS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {currentIndustry.useCases.map((uc, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-[#059669] flex items-center justify-center font-bold text-sm font-heading">
                0{i + 1}
              </div>
              <h3 className="font-bold text-sm text-slate-900 font-heading">{uc.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{uc.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* JSON-LD Schema Code Preview Block for SEO Engineers */}
      <div className="max-w-4xl mx-auto bg-slate-900 text-slate-100 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300 font-heading">
              Structured JSON-LD Schema (Auto-Injected for {currentIndustry.name})
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-mono border border-emerald-800">
            Schema.org / {currentIndustry.schemaType}
          </span>
        </div>

        <pre className="text-[11px] font-mono bg-slate-950 p-4 rounded-xl text-emerald-300 overflow-x-auto leading-relaxed border border-slate-800">
{`{
  "@context": "https://schema.org",
  "@type": "${currentIndustry.schemaType}",
  "name": "${currentIndustry.name} Local Business",
  "url": "https://locoraai.com/for/${currentIndustry.slug}",
  "description": "${currentIndustry.heroSubheadline.replace(/"/g, '\\"')}",
  "areaServed": "Global & Local Service Radius",
  "knowsAbout": ${JSON.stringify(currentIndustry.targetKeywords)}
}`}
        </pre>
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
