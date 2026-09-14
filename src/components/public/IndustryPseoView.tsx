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
  HelpCircle,
  Search,
  ChevronDown,
} from 'lucide-react';

export interface IndustryFaq {
  question: string;
  answer: string;
}

export interface IndustryData {
  slug: string;
  name: string;
  category: string;
  iconName: string;
  heroHeadline: string;
  heroSubheadline: string;
  primaryKeywords: string[];
  secondaryKeywords: string[];
  longTailKeywords: string[];
  faqItems: IndustryFaq[];
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
    heroHeadline: 'Dental Practice Marketing Software & Local SEO Copilot',
    heroSubheadline:
      'Grow dental practice visibility on Google Maps, automate patient review responses, manage treatment plan estimates, and attract qualified new patients with Locora AI.',
    primaryKeywords: [
      'dental practice marketing software',
      'AI CRM for dentists',
      'dental local SEO software',
    ],
    secondaryKeywords: [
      'dental patient review management',
      'dentist Google Business Profile optimization',
      'cosmetic dentistry treatment proposals',
      'dental clinic reputation management',
      'local SEO for dental practices',
    ],
    longTailKeywords: [
      'how do dentists get more cosmetic and implant patients from Google',
      'how to respond to dental patient reviews compliantly',
      'best software for dental practice local SEO and marketing',
      'digital treatment plan estimates with financing for dentists',
      'how to rank top 3 on Google Maps as a local dentist',
    ],
    faqItems: [
      {
        question: 'How do dental practices get more private-pay patients from Google Maps?',
        answer:
          'Dentists attract high-value cosmetic, restorative, and implant cases by optimizing primary Google Business Profile categories (e.g. "Dentist", "Cosmetic Dentist"), showcasing verified patient testimonials, deploying structured Dentist JSON-LD schema markup, and answering patient inquiries promptly.',
      },
      {
        question: 'How should dental practices handle patient review responses?',
        answer:
          'Review responses must remain strictly HIPAA-compliant: never confirm or deny that a reviewer is a patient or discuss specific clinical treatments. Locora AI crafts respectful, compliant responses that protect patient privacy while reinforcing local relevance.',
      },
      {
        question: 'How do digital treatment proposals help dental practices close cases?',
        answer:
          'By breaking complex restorative or cosmetic procedures into clear, multi-visit phases with visual fee estimates and flexible financing terms, patients feel informed and are significantly more likely to proceed with treatment.',
      },
      {
        question: 'What is the best software for dental practice local marketing and CRM?',
        answer:
          'The ideal software combines Google Business Profile visibility tracking, HIPAA-mindful review automation, digital treatment estimates, and patient follow-up workflows in a single workspace without requiring expensive agency retainers.',
      },
    ],
    targetKeywords: [
      'dental practice marketing software',
      'AI CRM for dentists',
      'dental patient review management',
      'dental local SEO software',
      'dentist Google Business Profile optimization',
    ],
    stats: [
      { label: 'Map Pack Impressions', value: '+340%', detail: 'In first 60 days on Locora AI' },
      { label: 'Patient Reviews', value: '4.9★', detail: 'Compliant 5-star review collection' },
      { label: 'Hours Saved/Wk', value: '14 hrs', detail: 'On treatment proposals & follow-ups' },
    ],
    useCases: [
      {
        title: 'Local Google Maps 3-Pack Visibility',
        desc: 'Automatically generate localized dental content and geotagged schema markup to rank for "dentist near me" and "cosmetic dentistry".',
      },
      {
        title: 'Treatment Proposal & Estimate Engine',
        desc: 'Send clear, multi-tier treatment estimate proposals directly to patient phones with transparent milestone payment options.',
      },
      {
        title: 'Compliant Google Review Responder',
        desc: 'HIPAA-mindful AI review responses that turn happy patients into 5-star Google Business Profile advocates.',
      },
    ],
    schemaType: 'Dentist',
    sampleProposalSnippet:
      'Comprehensive Cosmetic Treatment Proposal • Porcelain Veneers (6 Units) + In-Office Whitening • Estimated Timeline: 3 Visits • Digital Signature & Flexible Financing Terms Included.',
    sampleReviewReply:
      '"Thank you for sharing your experience, Sarah! Our dental team in [City] is delighted that your visit was comfortable and thorough. We look forward to seeing you at your next routine checkup!"',
    defaultAvgTicket: 1200,
  },
  'hvac-contractors': {
    slug: 'hvac-contractors',
    name: 'HVAC Contractors',
    category: 'Home Services & Contracting',
    iconName: 'Wrench',
    heroHeadline: 'HVAC Business Software & AI CRM for Heating & Cooling Contractors',
    heroSubheadline:
      'Capture emergency HVAC repair calls, expand visibility across your service radius, send mobile equipment replacement estimates on-site, and automate seasonal maintenance renewals.',
    primaryKeywords: [
      'HVAC business software',
      'AI CRM for HVAC',
      'HVAC contractor management software',
    ],
    secondaryKeywords: [
      'emergency HVAC repair marketing',
      'HVAC lead follow-up software',
      'AC replacement estimate generator',
      'HVAC Google Business Profile optimization',
      'heating and cooling local SEO',
    ],
    longTailKeywords: [
      'how to get emergency HVAC leads from Google Maps',
      'best CRM for heating and air conditioning contractors',
      'how to follow up on HVAC installation quotes',
      'seasonal HVAC maintenance contract automation',
      'heat pump installation proposal software',
    ],
    faqItems: [
      {
        question: 'How do HVAC contractors get more local heating and AC leads?',
        answer:
          'HVAC contractors generate steady local leads by maintaining strong visibility across multi-zip code service radiuses on Google Maps, optimizing for seasonal phrases like "emergency AC repair" or "furnace replacement", and following up with leads within minutes using automated CRM workflows.',
      },
      {
        question: 'What is the best CRM for an HVAC company?',
        answer:
          'The best CRM for an HVAC business tracks service calls, manages seasonal maintenance agreements, sends instant mobile replacement quotes, and handles itemized PDF invoicing with Stripe payment links from a single mobile-friendly workspace.',
      },
      {
        question: 'How do I market emergency HVAC repair services locally?',
        answer:
          'Emergency HVAC marketing relies on prominent 24/7 service hour listings on Google Business Profile, rapid response to incoming calls, targeted schema markup highlighting emergency services, and automated SMS quote confirmations sent directly to homeowners.',
      },
      {
        question: 'How do automated proposals increase HVAC equipment sales?',
        answer:
          'By offering Good/Better/Best equipment options (such as Standard vs High-Efficiency Heat Pumps) with clear warranty and energy rebate information, homeowners can easily pick their preferred package and sign digitally on mobile.',
      },
    ],
    targetKeywords: [
      'HVAC business software',
      'AI CRM for HVAC',
      'emergency HVAC repair marketing',
      'HVAC lead follow-up software',
      'heating and cooling local SEO',
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
    sampleProposalSnippet:
      'Trane 16 SEER Heat Pump System Installation Proposal • Includes Ductwork Inspection, 10-Yr Warranty & Permit Filing • Fixed Price: $7,850 • Acceptance block ready.',
    sampleReviewReply:
      '"Thanks for the review, Mike! Our HVAC technicians were glad to get your AC cooling quickly during the heatwave. Enjoy the new high-efficiency system!"',
    defaultAvgTicket: 3500,
  },
  'real-estate': {
    slug: 'real-estate',
    name: 'Real Estate Agents',
    category: 'Real Estate & Property',
    iconName: 'Home',
    heroHeadline: 'AI Tools & Client CRM for Real Estate Agents & Teams',
    heroSubheadline:
      'Establish hyper-local neighborhood authority, streamline buyer and seller follow-up, create listing proposals, and nurture real estate leads with Locora AI.',
    primaryKeywords: [
      'AI tools for real estate agents',
      'real estate CRM',
      'real estate lead nurture AI',
    ],
    secondaryKeywords: [
      'listing description generator',
      'hyper-local real estate marketing',
      'CMA listing proposal software',
      'realtor Google Business Profile optimization',
      'neighborhood SEO for real estate',
    ],
    longTailKeywords: [
      'how to get more seller listings with local SEO',
      'best CRM for solo real estate agents',
      'automated client follow-up after home closing',
      'how to rank for real estate agent in my neighborhood',
      'AI tools to write property listing descriptions',
    ],
    faqItems: [
      {
        question: 'How do real estate agents get more seller listings with local SEO?',
        answer:
          'Agents win seller listings by establishing hyper-local neighborhood authority: publishing community guides, creating suburb-specific market updates, maintaining active Google Business Profiles with recent sales, and collecting 5-star client testimonials.',
      },
      {
        question: 'What is the best AI tool for real estate agents?',
        answer:
          'Locora AI serves as a complete real estate copilot, helping agents draft listing presentations, generate localized SEO content, manage lead nurture pipelines, and automate post-closing client check-ins.',
      },
      {
        question: 'How does AI help with real estate lead nurture?',
        answer:
          'AI CRM tracks client preferences (price range, school districts, timeline), suggests timely follow-ups, and drafts personalized check-ins to keep buyers and sellers engaged over multi-month transaction cycles.',
      },
      {
        question: 'Can real estate agents rank on Google Maps?',
        answer:
          'Yes. Real estate professionals operating from verified brokerage or team offices can optimize their Google Business Profile with client reviews, localized service categories, and structured RealEstateAgent JSON-LD schema.',
      },
    ],
    targetKeywords: [
      'AI tools for real estate agents',
      'real estate CRM',
      'listing description generator',
      'real estate lead nurture AI',
      'neighborhood SEO for real estate',
    ],
    stats: [
      { label: 'Local Seller Leads', value: '4.2x', detail: 'Higher seller inquiry conversion' },
      { label: 'Proposal Time', value: '< 3 mins', detail: 'To generate personalized CMA decks' },
      { label: 'Client Retention', value: '91%', detail: 'Post-closing follow-up automation' },
    ],
    useCases: [
      {
        title: 'Neighborhood Authority & SEO Pages',
        desc: 'Create AI-powered hyper-local community guides and market trend summaries that rank for neighborhood searches.',
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
    sampleProposalSnippet:
      'Exclusive Listing Agreement & Marketing Blueprint • Professional Photography, Drone Video, 3D Tour & Social Campaign • Commission Structure: 5% Total.',
    sampleReviewReply:
      '"Thank you, David & Lisa! It was an absolute pleasure helping you sell your home for top market value in [Neighborhood]. Best wishes in your new chapter!"',
    defaultAvgTicket: 8500,
  },
  'law-firms': {
    slug: 'law-firms',
    name: 'Law Firms & Attorneys',
    category: 'Legal Services',
    iconName: 'Scale',
    heroHeadline: 'Law Firm Client Management & Intake CRM',
    heroSubheadline:
      'Attract qualified legal inquiries, streamline client intake proposals and retainer agreements, and safeguard your firm\'s 5-star reputation with Locora AI.',
    primaryKeywords: [
      'law firm client management',
      'legal intake CRM',
      'law firm local SEO software',
    ],
    secondaryKeywords: [
      'law firm review management',
      'client intake automation for attorneys',
      'practice area local SEO',
      'attorney Google Business Profile optimization',
      'legal retainer proposal software',
    ],
    longTailKeywords: [
      'how to attract qualified personal injury and estate inquiries',
      'compliant review management for legal practices',
      'how to speed up attorney client intake and fee agreements',
      'local SEO strategies for boutique law firms',
      'software to manage law firm client pipeline and billing',
    ],
    faqItems: [
      {
        question: 'How do law firms improve local search visibility without risking bar compliance?',
        answer:
          'Law firms grow local search visibility by building authoritative practice area landing pages, claiming verified Google Business Profiles, deploying structured Attorney schema markup, and adhering to strict legal advertising guidelines that avoid unverified superlatives or outcome guarantees.',
      },
      {
        question: 'What is legal intake CRM automation?',
        answer:
          'Legal intake CRM automation organizes inbound client inquiries by practice area, captures preliminary case details, and prepares standardized engagement letters and retainer agreements for attorney review and client digital signature.',
      },
      {
        question: 'How should attorneys handle Google review management?',
        answer:
          'Attorneys should politely thank reviewers without acknowledging specific case details, attorney-client privileged information, or matter specifics, while consistently encouraging satisfied clients to share general feedback.',
      },
      {
        question: 'Does Locora AI draft binding legal advice?',
        answer:
          'No. Locora AI is an administrative operating system designed for CRM pipeline organization, intake workflow tracking, fee agreement templates, and local SEO visibility. All legal documents and advice remain strictly under attorney supervision.',
      },
    ],
    targetKeywords: [
      'law firm client management',
      'legal intake CRM',
      'law firm review management',
      'practice area local SEO',
      'attorney Google Business Profile optimization',
    ],
    stats: [
      { label: 'Qualified Inquiries', value: '+280%', detail: 'Increase in relevant case leads' },
      { label: 'Local Visibility', value: '+185%', detail: 'Growth in practice area search impressions' },
      { label: 'Intake Velocity', value: '4x', detail: 'Faster fee agreement signing' },
    ],
    useCases: [
      {
        title: 'Practice Area Local Search Optimization',
        desc: 'Rank for specialized legal queries ("car accident lawyer near me", "estate attorney") with authoritative JSON-LD schema.',
      },
      {
        title: 'Custom Fee Agreements & Engagement Letters',
        desc: 'Generate attorney-supervised legal retainer proposals with transparent fee terms and one-click payment links.',
      },
      {
        title: 'Client Review & Reputation Guardrail',
        desc: 'Build a distinguished 5-star Google Business reputation with automated, dignified client review follow-ups.',
      },
    ],
    schemaType: 'Attorney',
    sampleProposalSnippet:
      'Legal Representation Agreement • Estate Planning & Living Trust Package • Flat Fee: $2,750 • Includes Pour-Over Will, Healthcare Directive, and Asset Transfer Deed.',
    sampleReviewReply:
      '"Thank you for your trust and kind words. Our legal team is dedicated to providing thorough representation and responsive communication. We appreciate your recommendation."',
    defaultAvgTicket: 4200,
  },
  plumbers: {
    slug: 'plumbers',
    name: 'Plumbing Companies',
    category: 'Home Services & Contracting',
    iconName: 'Wrench',
    heroHeadline: 'AI Tools & Business Software for Plumbing Companies',
    heroSubheadline:
      'Get found for emergency drain cleaning, pipe repairs, and water heater installs. Send instant digital quotes, manage customer follow-ups, and win more local jobs with Locora AI.',
    primaryKeywords: [
      'AI tools for plumbers',
      'plumbing business software',
      'CRM for plumbing companies',
    ],
    secondaryKeywords: [
      'emergency plumbing marketing',
      'plumber Google Business Profile optimization',
      'digital quotes for plumbers',
      'plumbing invoice software',
      'local SEO for plumbers',
    ],
    longTailKeywords: [
      'how to get more plumbing customers from Google',
      'best CRM for small plumbing business',
      'how to respond to plumbing reviews',
      'AI proposal generator for contractors',
      'software to send plumbing quotes fast',
    ],
    faqItems: [
      {
        question: 'How do plumbers get more local customers?',
        answer:
          'Plumbing contractors get more local customers by optimizing their Google Business Profile for emergency and high-ticket service keywords, maintaining steady 5-star review velocity with prompt responses, deploying geo-targeted LocalBusiness schema markup, and following up instantly on inbound phone inquiries with automated digital quotes.',
      },
      {
        question: 'What is the best software for a small plumbing business?',
        answer:
          'The best software for a small plumbing business combines on-the-spot mobile quotes, visual client CRM, automated review follow-up, itemized PDF invoicing, and local SEO rank tracking in one platform without requiring expensive multi-app subscriptions.',
      },
      {
        question: 'How can I rank higher on Google Maps as a plumber?',
        answer:
          'To rank higher on Google Maps, set your primary GBP category to "Plumber", add secondary categories for "Drainage Service" and "Water Heater Installation", keep name, address, and phone (NAP) citations consistent, add weekly geo-tagged photos of completed jobs, and embed structured JSON-LD plumber schema on your website.',
      },
      {
        question: 'How do digital proposals help plumbing contractors win jobs?',
        answer:
          'Digital proposals allow plumbing technicians to generate professional 3-tier estimates on-site before leaving the customer\'s driveway. Homeowners can approve scopes and sign digitally from their phones, significantly increasing same-day close rates.',
      },
    ],
    targetKeywords: [
      'AI tools for plumbers',
      'plumbing business software',
      'CRM for plumbing companies',
      'emergency plumbing marketing',
      'local SEO for plumbers',
    ],
    stats: [
      { label: 'Emergency Call Volume', value: '+310%', detail: 'Higher local Google Map pack calls' },
      { label: 'Job Win Rate', value: '88%', detail: 'Using instant digital estimates' },
      { label: 'Review Growth', value: '50+ /mo', detail: 'Verified 5-star homeowner reviews' },
    ],
    useCases: [
      {
        title: 'Geo-Targeted Emergency Search Pages',
        desc: 'Automatically generate neighborhood-specific plumbing landing pages optimized for emergency terms and mobile voice search.',
      },
      {
        title: 'Field Estimate & Instant Invoicing',
        desc: 'Create detailed line-item plumbing quotes for camera inspections, repiping, and tankless water heater conversions.',
      },
      {
        title: 'Customer Retainer & Service Plans',
        desc: 'Manage annual plumbing maintenance members in the CRM with automated billing & seasonal inspection alerts.',
      },
    ],
    schemaType: 'Plumber',
    sampleProposalSnippet:
      'Tankless Water Heater Conversion & Whole-Home Repipe • Navien NPE-240A2 + Lifetime Warranty • Fixed Scope: $4,650 • Turnaround: 1 Business Day.',
    sampleReviewReply:
      '"Thank you for calling us for your emergency pipe repair, Jason! We are always ready to keep your home protected from water damage."',
    defaultAvgTicket: 1850,
  },
  'med-spas': {
    slug: 'med-spas',
    name: 'MedSpas & Aesthetic Clinics',
    category: 'Health & Beauty',
    iconName: 'Sparkles',
    heroHeadline: 'Med Spa Marketing Software & AI CRM',
    heroSubheadline:
      'Attract aesthetic clients, streamline consultation treatment plans, manage recurring memberships, and build a 5-star reputation with Locora AI.',
    primaryKeywords: [
      'med spa marketing software',
      'AI CRM for med spas',
      'aesthetic practice local SEO',
    ],
    secondaryKeywords: [
      'med spa review management',
      'Botox and filler local SEO',
      'aesthetic consultation treatment plans',
      'med spa membership management',
      'aesthetic clinic Google Business Profile',
    ],
    longTailKeywords: [
      'how to get more Botox and facial clients from Google Maps',
      'best CRM for medical aesthetics clinics',
      'how to respond to med spa reviews professionally',
      'treatment plan proposal software for aesthetic injectors',
      'reputation management software for cosmetic clinics',
    ],
    faqItems: [
      {
        question: 'How can med spas get more local clients from Google Maps?',
        answer:
          'Med spas get more local clients by optimizing their GBP categories for "Medical Spa" and "Skin Care Clinic", highlighting treatment modalities (Botox, dermal fillers, laser resurfacing), maintaining photo galleries of clinic aesthetics, and gathering verified patient reviews.',
      },
      {
        question: 'What features should a med spa CRM have?',
        answer:
          'A med spa CRM should handle multi-visit treatment package proposals, automated post-procedure review requests, recurring membership billing, and HIPAA-mindful client communication.',
      },
      {
        question: 'How do digital treatment plans increase med spa revenue?',
        answer:
          'Presenting tiered treatment blueprints (e.g. Essential Glow vs Full Facial Harmonization) with clear pricing and financing options helps clients understand cumulative results, raising average ticket value.',
      },
      {
        question: 'How does review automation help aesthetic practices?',
        answer:
          'Satisfied clients are gently prompted via SMS after treatment sessions to leave feedback on Google, building social proof that converts high-ticket aesthetic inquiries.',
      },
    ],
    targetKeywords: [
      'med spa marketing software',
      'AI CRM for med spas',
      'aesthetic practice local SEO',
      'med spa review management',
      'Botox and filler local SEO',
    ],
    stats: [
      { label: 'Consultation Bookings', value: '+260%', detail: 'Inbound cosmetic patient growth' },
      { label: 'Average Ticket Size', value: '$1,450', detail: 'With multi-procedure treatment plans' },
      { label: 'Google Review Score', value: '4.9★', detail: 'Automated post-treatment review loops' },
    ],
    useCases: [
      {
        title: 'Cosmetic Procedure Search Visibility',
        desc: 'Rank for treatment queries like laser resurfacing, body contouring, and facial aesthetics across your target communities.',
      },
      {
        title: 'Multi-Tier Treatment Plans',
        desc: 'Deliver elegant treatment proposal packages that bundle injectables with skin rejuvenation for higher patient satisfaction.',
      },
      {
        title: 'Automated Aesthetic Membership Billing',
        desc: 'Run recurring monthly beauty memberships with automated invoice receipts and milestone reminders.',
      },
    ],
    schemaType: 'HealthAndBeautyBusiness',
    sampleProposalSnippet:
      'Customized Rejuvenation Plan • 3x Morpheus8 RF Microneedling + Post-Care Peptide Regimen • Investment: $2,400 • Monthly Payment Plan Option Available.',
    sampleReviewReply:
      '"Thank you so much, Emily! Our aesthetic team loves helping you achieve that radiant glow. See you at your next facial maintenance session!"',
    defaultAvgTicket: 1600,
  },
  'auto-repair': {
    slug: 'auto-repair',
    name: 'Auto Repair & Detailing',
    category: 'Automotive Services',
    iconName: 'Car',
    heroHeadline: 'Auto Repair Shop Software & AI CRM',
    heroSubheadline:
      'Fill your service bays, get found for high-margin repair terms, deliver transparent itemized digital estimates, and automate maintenance reminders with Locora AI.',
    primaryKeywords: [
      'auto repair shop software',
      'AI CRM for mechanics',
      'auto shop local SEO',
    ],
    secondaryKeywords: [
      'auto shop review responses',
      'repair shop invoicing software',
      'brake and transmission repair marketing',
      'mechanic Google Business Profile optimization',
      'digital vehicle repair estimates',
    ],
    longTailKeywords: [
      'how to get more auto repair customers from Google search',
      'best invoicing and estimate software for independent mechanics',
      'how to respond to negative auto repair reviews',
      'automated customer maintenance reminders for auto shops',
      'local SEO for transmission and engine repair shops',
    ],
    faqItems: [
      {
        question: 'How do auto repair shops get more local customers?',
        answer:
          'Auto shops attract high-ticket repairs by ranking for specific diagnostics like "check engine light diagnosis", "brake repair near me", and "transmission repair", maintaining transparent customer reviews, and answering estimate requests promptly.',
      },
      {
        question: 'What is the best software for an independent mechanic shop?',
        answer:
          'The best software for independent shops combines transparent digital estimates with photo attachments, customer service history tracking, automated SMS updates, and fast PDF invoicing with online payment.',
      },
      {
        question: 'How do automated maintenance reminders increase repair shop revenue?',
        answer:
          'By logging service dates and mileage intervals, the CRM automatically notifies vehicle owners when factory maintenance, brake pad checks, or oil changes are due, creating reliable repeat bay traffic.',
      },
      {
        question: 'How do digital estimates improve mechanic customer trust?',
        answer:
          'Customers receive itemized breakdown quotes on their smartphones detailing parts and labor with photos of worn components, eliminating surprise billing and boosting quote approval rates.',
      },
    ],
    targetKeywords: [
      'auto repair shop software',
      'AI CRM for mechanics',
      'auto shop local SEO',
      'auto shop review responses',
      'repair shop invoicing software',
    ],
    stats: [
      { label: 'Bay Utilization', value: '94%', detail: 'Steady weekly vehicle intake' },
      { label: 'Estimate Approval', value: '+48%', detail: 'Transparent line-item quotes' },
      { label: 'Customer Retention', value: '72%', detail: 'Automated maintenance reminders' },
    ],
    useCases: [
      {
        title: 'High-Intent Repair Keyword SEO',
        desc: 'Rank for high-margin repair terms like "transmission repair near me" and "European auto repair" across your county.',
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
    sampleProposalSnippet:
      'Complete Brake System Overhaul & Rotor Replacement • Ceramic Pads, Fluid Flush & 24-Mo Warranty • Estimate: $890 • Digital Approval Ready.',
    sampleReviewReply:
      '"Thank you for trusting our mechanic team with your vehicle, Chris! Safe travels on your road trip and let us know if you need anything else."',
    defaultAvgTicket: 850,
  },
  contractors: {
    slug: 'contractors',
    name: 'General & Trade Contractors',
    category: 'Home Services & Contracting',
    iconName: 'Wrench',
    heroHeadline: 'Contractor CRM & AI Proposal Generator',
    heroSubheadline:
      'Win construction and remodeling bids with on-site 3-tier proposals, expand service radius Google Maps SEO, and automate client CRM with Locora AI.',
    primaryKeywords: [
      'contractor CRM',
      'AI proposal generator for contractors',
      'general contractor software',
    ],
    secondaryKeywords: [
      'construction bid proposal software',
      'contractor client management',
      'contractor Google Business Profile optimization',
      'remodeling contractor local SEO',
      'subcontractor invoice software',
    ],
    longTailKeywords: [
      'how to write construction proposals faster',
      'best CRM for residential remodeling contractors',
      'how to win more commercial and residential construction bids',
      'contractor job quote generator with digital signatures',
      'local SEO for general contractors across multiple counties',
    ],
    faqItems: [
      {
        question: 'How do contractors win more bids against competitors?',
        answer:
          'Contractors win more bids by delivering fast, comprehensive digital proposals within 24 hours of site visits, presenting clear tiered scopes with milestone payment schedules, and showcasing verified local client reviews.',
      },
      {
        question: 'What is the best CRM for general contractors?',
        answer:
          'The best contractor CRM tracks leads from initial phone inquiry to job completion, generates itemized scopes of work, and issues progressive draw invoices with integrated payment processing.',
      },
      {
        question: 'How can contractors rank on Google Maps across a large service area?',
        answer:
          'Contractors should define clear service areas in Google Business Profile, create localized project portfolio pages with geotagged job site descriptions, and embed GeneralContractor JSON-LD schema.',
      },
      {
        question: 'How do tiered proposals increase contractor project profit?',
        answer:
          'Presenting Good, Better, Best options (e.g. Standard, Premium, and Architectural finishes) allows homeowners to self-select higher-margin upgrades rather than negotiating down the base price.',
      },
    ],
    targetKeywords: [
      'contractor CRM',
      'AI proposal generator for contractors',
      'general contractor software',
      'construction bid proposal software',
      'remodeling contractor local SEO',
    ],
    stats: [
      { label: 'Remodeling Inquiries', value: '+290%', detail: 'Inbound local search project leads' },
      { label: 'Bid Win Rate', value: '52%', detail: 'Using 3-tier Good/Better/Best proposals' },
      { label: 'Average Project Lift', value: '+$3,200', detail: 'Higher average ticket size' },
    ],
    useCases: [
      {
        title: 'Service Radius Google Maps SEO',
        desc: 'Deploy GeneralContractor schema and geotargeted suburb pages to increase search visibility across your entire metro area.',
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
    sampleProposalSnippet:
      'Master Bathroom Remodel & Custom Tile Installation • Includes Waterproofing Membrane, Fixtures & 10-Yr Workmanship Warranty • Fixed Price: $14,500.',
    sampleReviewReply:
      '"Thank you for the 5-star review, Tom! Our construction crew was glad to complete your kitchen remodel on schedule. Enjoy the new custom countertops!"',
    defaultAvgTicket: 6500,
  },
  restaurants: {
    slug: 'restaurants',
    name: 'Restaurants & Hospitality',
    category: 'Food & Dining',
    iconName: 'Utensils',
    heroHeadline: 'Restaurant Marketing AI & Reputation Management',
    heroSubheadline:
      'Fill your dining room, grow local Google Maps search visibility, automate diner review responses, and streamline catering proposals with Locora AI.',
    primaryKeywords: [
      'restaurant marketing AI',
      'restaurant reputation management',
      'restaurant local SEO software',
    ],
    secondaryKeywords: [
      'restaurant Google review responses',
      'local food search optimization',
      'restaurant catering proposal software',
      'restaurant Google Business Profile optimization',
      'event booking CRM for restaurants',
    ],
    longTailKeywords: [
      'how to rank higher on Google Maps for best dinner near me',
      'how to respond to negative restaurant reviews on Google',
      'software to manage private event and catering quotes',
      'AI tools to increase restaurant weekday bookings',
      'local SEO checklist for new restaurant locations',
    ],
    faqItems: [
      {
        question: 'How do restaurants rank higher on Google Maps for food searches?',
        answer:
          'Restaurants improve ranking by keeping their primary category accurate (e.g. "Italian Restaurant"), listing complete menu items, updating holiday and weekend operating hours, and responding consistently to diner reviews.',
      },
      {
        question: 'How does AI help with restaurant review management?',
        answer:
          'Locora AI crafts personalized, appreciative responses to 5-star diners and writes composed, de-escalating replies to critical reviews, protecting the restaurant\'s public reputation and boosting SEO keywords.',
      },
      {
        question: 'How can restaurants win more private dining and catering revenue?',
        answer:
          'By using built-in proposal and invoicing tools, managers can quickly send custom catering menus, guest count estimates, and deposit invoices with online payment links to event planners.',
      },
      {
        question: 'Why is Google Business Profile menu optimization crucial for restaurants?',
        answer:
          'Google extracts dish names and dietary attributes directly from menu data to answer user searches like "gluten-free pasta near me" or "best steak downtown", driving high-intent walk-ins.',
      },
    ],
    targetKeywords: [
      'restaurant marketing AI',
      'restaurant reputation management',
      'restaurant local SEO software',
      'restaurant Google review responses',
      'restaurant catering proposal software',
    ],
    stats: [
      { label: 'Table Reservations', value: '+190%', detail: 'From Google Maps discovery' },
      { label: 'Catering Close Rate', value: '+55%', detail: 'With instant menu estimates' },
      { label: 'Review Velocity', value: '80+ /mo', detail: 'Fresh verified diner reviews' },
    ],
    useCases: [
      {
        title: 'Google Maps Food Discovery',
        desc: 'Optimize your Google Business Profile menu, dietary tags, and cuisine categories to capture nearby hungry diners.',
      },
      {
        title: 'Catering & Event Proposal Generator',
        desc: 'Create catering proposals with per-head pricing, drink packages, and deposit payment links in seconds.',
      },
      {
        title: 'Diner Sentiment & Review Responder',
        desc: 'Turn positive feedback into brand loyalty and address guest concerns immediately with thoughtful AI replies.',
      },
    ],
    schemaType: 'Restaurant',
    sampleProposalSnippet:
      'Private Dining & Corporate Banquet Proposal • 45 Guests • 3-Course Artisanal Menu + Wine Pairing • Total Quote: $3,850 + Tax & Gratuity.',
    sampleReviewReply:
      '"Thank you for celebrating your anniversary with us, Brandon! Chef Marco was thrilled to hear you loved the dry-aged ribeye. We look forward to welcoming you back soon!"',
    defaultAvgTicket: 950,
  },
  agencies: {
    slug: 'agencies',
    name: 'Marketing & SEO Agencies',
    category: 'Agency & Professional Services',
    iconName: 'Briefcase',
    heroHeadline: 'White Label Local SEO Platform & Agency CRM',
    heroSubheadline:
      'Run your local SEO agency on one platform: multi-client CRM, white-label audit reports, AI proposal generation, and automated local ranking execution for every client you manage.',
    primaryKeywords: [
      'white label local SEO platform',
      'agency client management software',
      'local SEO agency operating system',
    ],
    secondaryKeywords: [
      'multi-client SEO dashboard',
      'agency reporting automation',
      'SEO proposal generator for agencies',
      'white label website audit tool',
      'client retainer invoicing for agencies',
    ],
    longTailKeywords: [
      'best white label local SEO software for marketing agencies',
      'how to scale a local SEO agency without hiring more account managers',
      'how to pitch local SEO audits to small business owners',
      'agency tool that combines CRM proposals and SEO reports',
      'multi-client Google Business Profile management platform',
    ],
    faqItems: [
      {
        question: 'What is the best white-label local SEO platform for agencies?',
        answer:
          'Locora AI provides digital agencies with a complete client operating system: run technical website audits, generate branded SEO strategy proposals, track multi-client deal pipelines, and send retainer invoices from a single dashboard.',
      },
      {
        question: 'How can marketing agencies automate client reporting?',
        answer:
          'Agencies use Locora AI to automatically analyze rankings, audit Core Web Vitals, identify schema gaps, and export white-labeled executive summary reports for monthly client reviews.',
      },
      {
        question: 'Can agencies manage multiple sub-accounts under one login?',
        answer:
          'Yes. Locora AI\'s agency plan includes multi-client workspace switching, dedicated business profiles, and team collaboration permissions.',
      },
      {
        question: 'How do instant audits help agencies close local business retainers?',
        answer:
          'Running a comprehensive 7-point audit during a discovery call provides tangible proof of ranking deficiencies (NAP citation mismatches, missing schema), positioning the agency as the immediate solution.',
      },
    ],
    targetKeywords: [
      'white label local SEO platform',
      'agency client management software',
      'multi-client SEO dashboard',
      'agency reporting automation',
      'SEO proposal generator for agencies',
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
    sampleProposalSnippet:
      'Agency Growth Retainer Agreement • Full Local SEO & Google Maps Management, Citations & Schema Deployment • Retainer: $2,500/mo • Terms: Net 15.',
    sampleReviewReply:
      '"Thank you, Marcus! Our agency loves scaling local visibility for your dental practice. We are excited for another quarter of record inbound patient calls!"',
    defaultAvgTicket: 2500,
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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
      '@graph': [
        {
          '@type': currentIndustry.schemaType,
          'name': `${currentIndustry.name} Local Business Solution`,
          'url': `https://locoraai.com/for/${currentIndustry.slug}`,
          'description': currentIndustry.heroSubheadline,
          'areaServed': 'Local Service Radius',
          'knowsAbout': [
            ...currentIndustry.primaryKeywords,
            ...currentIndustry.secondaryKeywords,
            ...currentIndustry.longTailKeywords,
          ],
        },
        {
          '@type': 'FAQPage',
          'mainEntity': currentIndustry.faqItems.map((item) => ({
            '@type': 'Question',
            'name': item.question,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': item.answer,
            },
          })),
        },
      ],
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

      {/* Target Keyword Strategy & Search Intent Clusters */}
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold font-heading uppercase">
            <Search className="w-3.5 h-3.5 text-[#059669]" />
            <span>Keyword Strategy & Intent Clusters</span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-900">
            Search Demand & Intent Architecture for {currentIndustry.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            Categorized by intent tier: Primary core terms for page positioning, secondary service phrases for topical depth, and long-tail conversational angles for Answer Engine discovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary Cluster */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-emerald-300 transition-colors">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold font-heading">
                <span>Primary Cluster (Title & H1)</span>
              </div>
              <p className="text-xs text-slate-500">
                Core commercial intent keywords driving authoritative page positioning and primary rank tracking.
              </p>
              <ul className="space-y-2 pt-1">
                {currentIndustry.primaryKeywords.map((kw, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{kw}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
              Role: Page title, H1 & primary schema
            </div>
          </div>

          {/* Secondary Cluster */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-emerald-300 transition-colors">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-900 rounded-lg text-xs font-bold font-heading">
                <span>Secondary Intent (Subheadings & Body)</span>
              </div>
              <p className="text-xs text-slate-500">
                High-intent specific services, feature scopes, and local modifier combinations for topical authority.
              </p>
              <ul className="space-y-2 pt-1">
                {currentIndustry.secondaryKeywords.map((kw, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{kw}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
              Role: H2 sections, service cards & copy
            </div>
          </div>

          {/* Long-Tail Cluster */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-emerald-300 transition-colors">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 rounded-lg text-xs font-bold font-heading">
                <span>Long-Tail (FAQ & Voice Search)</span>
              </div>
              <p className="text-xs text-slate-500">
                Conversational, question-format queries optimized for Google AI Overviews, Perplexity, and voice queries.
              </p>
              <ul className="space-y-2 pt-1">
                {currentIndustry.longTailKeywords.map((kw, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{kw}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
              Role: FAQ accordion, Q&A JSON-LD schema
            </div>
          </div>
        </div>
      </div>

      {/* Answer Engine & Local Search FAQs */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold font-heading uppercase">
            <HelpCircle className="w-3.5 h-3.5 text-[#059669]" />
            <span>Answer Engine Optimization (AEO)</span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-900">
            Frequently Asked Questions for {currentIndustry.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            Direct answers to the most common search queries, optimized for Google featured snippets and conversational Answer Engines.
          </p>
        </div>

        <div className="space-y-3">
          {currentIndustry.faqItems.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/75 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-slate-900 font-heading">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 font-sans">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Industry & Hub Interlinking Directory */}
      <div className="max-w-5xl mx-auto pt-8 border-t border-slate-200 space-y-6 text-center">
        <div className="space-y-2">
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

        {/* Cross-Site Hub Navigation */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-center items-center gap-4 text-xs text-slate-500">
          <span className="font-semibold text-slate-400">Locora Platforms & Guides:</span>
          <a
            href="/resources"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('resources');
              window.history.pushState({}, '', '/resources');
            }}
            className="hover:text-emerald-700 hover:underline font-medium"
          >
            Resources & Guides Hub
          </a>
          <span className="text-slate-300">•</span>
          <a
            href="/use-cases"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('use-cases');
              window.history.pushState({}, '', '/use-cases');
            }}
            className="hover:text-emerald-700 hover:underline font-medium"
          >
            Use Cases Directory
          </a>
          <span className="text-slate-300">•</span>
          <a
            href="/products"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('products');
              window.history.pushState({}, '', '/products');
            }}
            className="hover:text-emerald-700 hover:underline font-medium"
          >
            Products & Core Modules
          </a>
          <span className="text-slate-300">•</span>
          <a
            href="/pricing"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('pricing');
              window.history.pushState({}, '', '/pricing');
            }}
            className="hover:text-emerald-700 hover:underline font-medium"
          >
            Pricing & Plans
          </a>
        </div>
      </div>
    </div>
  );
};
