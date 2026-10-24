import { SeoIndustryItem } from './types';

export const SEO_INDUSTRIES_DATABASE: Record<string, SeoIndustryItem> = {
  'dentists': {
    slug: 'dentists',
    name: 'Dentists & Cosmetic Dental Practices',
    shortName: 'Dentists',
    icon: 'Sparkles',
    badge: 'For Dental Practices',
    heroHeadline: 'Does ChatGPT recommend your dental practice?',
    heroSubheadline: 'New patients don\'t just Google "dentist near me" anymore — they ask ChatGPT, Gemini and Perplexity who to book. LocoraAI\'s free checkup shows you exactly what those AI assistants see when they look at your practice: your Google profile, your Maps ranking, your reviews — and whether AI search recommends you or the practice down the street.',
    targetTab: 'local_seo',
    overview: 'Most dental marketing still optimizes for 2019 Google. Rankings matter, but the patient journey has split in two: Google Search and Maps on one side, and AI assistants on the other. When a patient asks an AI assistant for a dentist, it answers from your Google Business Profile, your reviews, your website\'s structured data and what the web says about you — and it usually names one or two practices, not ten blue links.\n\nLocoraAI\'s free 40-point checkup reads your practice the way those systems do. It live-crawls your website, checks your local signals and structured data, looks at your Maps presence and review footprint, and tests whether AI assistants can find and cite your practice. You get a graded report with the highest-impact fixes first — no signup needed to run it, no credit card to unlock the full report.',
    howToUse: [
      {
        stepNumber: 1,
        title: 'AI recommendation readiness',
        description: 'Can ChatGPT-class assistants find, understand and cite your practice for "dentist in [your city]" style questions?'
      },
      {
        stepNumber: 2,
        title: 'Google Business Profile completeness',
        description: 'Primary category (Dentist vs. Cosmetic dentist vs. Dental implants provider), services list (implants, Invisalign, veneers, emergency), hours, photos, attributes.'
      },
      {
        stepNumber: 3,
        title: 'Maps 3-Pack presence',
        description: 'Where you surface for high-intent searches from your actual location.'
      },
      {
        stepNumber: 4,
        title: 'Review footprint',
        description: 'Count, rating, recency and response rate; whether replies stay HIPAA-safe (never confirm someone is a patient).'
      },
      {
        stepNumber: 5,
        title: 'Website trust signals',
        description: 'LocalBusiness/Dentist schema, NAP consistency, service pages for high-value treatments, mobile performance.'
      },
      {
        stepNumber: 6,
        title: 'Competitor snapshot',
        description: 'The practices AI and Google surface instead of you, from the scan\'s real competitor set.'
      }
    ],
    prosAndCons: {
      pros: [
        'Attracts cash-pay and high-margin elective cosmetic cases ($3,000–$25,000)',
        'Reduces practice dependency on low-reimbursement PPO insurance networks',
        'Builds a defensible local 5-star reputation with 150+ genuine patient reviews',
        'Accelerates patient case acceptance through clear, tiered proposal options'
      ],
      cons: [
        'Front desk staff must be trained to ask patients for feedback and handle phone inquiries promptly',
        'Requires HIPAA compliance when mentioning treatment details in public review responses',
        'Takes 4 to 8 weeks for local schema updates to fully reflect in Google search rankings'
      ]
    },
    localSeoChecklist: [
      'Primary GBP category set to the highest-value service you actually offer; secondary categories for implants / cosmetic / emergency',
      'Every treatment you want cases for listed as a GBP service with descriptions',
      'Dentist schema (LocalBusiness subtype) on the website with matching NAP',
      'Review requests sent after completed appointments; every review answered without confirming patient status',
      'Service pages for implants, Invisalign/clear aligners, veneers and emergency dentistry — one page per treatment, per location',
      'Photos: real team, office and technology photos added monthly (no stock)',
      'AI check: ask ChatGPT/Perplexity monthly who they recommend in your area — and note who they name'
    ],
    sampleDeliverables: {
      gbpBio: 'Sample Dental Studio is a family and cosmetic dental practice in Austin, TX. We offer dental implants, Invisalign clear aligners, porcelain veneers, same-day crowns and emergency dentistry in a calm, modern office. Our team focuses on clear pricing, gentle techniques and honest treatment plans — no pressure, no surprises. We welcome new patients of all ages, offer early-morning and Saturday appointments, and work with most major insurance plans. Call today to schedule your first visit and see why Austin families trust Sample Dental Studio with their smiles.',
      reviewReply: 'Thank you so much for the kind words! Our team works hard to make every visit comfortable, and feedback like yours means a lot to us. We appreciate you choosing our practice!',
      schemaType: 'Dentist',
      jsonLdSnippet: '{\n  "@context": "https://schema.org",\n  "@type": "Dentist",\n  "name": "Sample Dental Studio",\n  "address": {\n    "@type": "PostalAddress",\n    "streetAddress": "1200 Sample Street",\n    "addressLocality": "Austin",\n    "addressRegion": "TX",\n    "postalCode": "78701",\n    "addressCountry": "US"\n  },\n  "geo": { "@type": "GeoCoordinates", "latitude": 30.2672, "longitude": -97.7431 },\n  "telephone": "+1-512-555-0100",\n  "openingHours": "Mo-Fr 08:00-17:00",\n  "sameAs": ["https://www.google.com/maps/search/Sample+Dental+Studio+Austin+TX"]\n}'
    },
    roiBenchmark: {
      avgTicket: 3800,
      closeRate: '42%',
      timeSavedHoursPerMonth: 18,
      projectedNewMonthlyRevenue: '+$38,000/mo'
    },
    caseStudy: {
      businessName: 'Highland Park Dental Arts',
      industry: 'Cosmetic & Restorative Dentistry',
      location: 'Dallas, TX',
      challenge: 'Stuck with 32 reviews and low patient case acceptance for full-mouth restorations.',
      solution: 'Deployed Dentist JSON-LD schema, automated SMS review sequence, and introduced 3-tier treatment estimate sheets.',
      timeSpentBefore: '12 hours/month managing disjointed patient follow-ups',
      timeSpentAfter: 'Automated 1-click workflows in Locora AI',
      results: [
        { label: 'Patient Reviews', value: '184 (4.9 Stars)' },
        { label: 'High-Ticket Cases', value: '+52% Increase' },
        { label: 'Monthly Revenue', value: '+$44,000 MRR' }
      ]
    },
    faqs: [
      {
        q: 'How do patients use ChatGPT to find a dentist?',
        a: 'They ask conversational questions — "best dentist for implants near me," "which dental practice in Austin has the best reviews for Invisalign." The assistant answers with one or two named practices, drawn from Google profiles, reviews, websites and directories. If your practice\'s data is thin or inconsistent, you simply aren\'t named.'
      },
      {
        q: 'What does the free checkup actually scan?',
        a: 'Your website\'s technical health, on-page SEO, local signals (name, phone and address consistency), structured data and performance — scored from a live crawl — plus your Google Maps presence and whether AI assistants can find and cite your practice.'
      },
      {
        q: 'Is the checkup really free? What do I get?',
        a: 'Yes. You see your score and top issues immediately. Unlocking imports the full 40-point report into a free LocoraAI workspace — no credit card required — where you can connect your Google Business Profile and track fixes over time.'
      },
      {
        q: 'Will this help with implants and cosmetic cases specifically?',
        a: 'Those are the searches where AI recommendations matter most: high-value, research-heavy, and usually asked conversationally. The checkup shows whether your services, reviews and service pages make you the practice AI names for those treatments.'
      },
      {
        q: 'Do review replies create HIPAA risk?',
        a: 'They can if a reply confirms someone is a patient or references treatment. LocoraAI\'s review tools are designed to respond without confirming patient status — thank the reviewer, speak generally, and move specifics offline.'
      },
      {
        q: 'I already have a marketing agency. Is this still useful?',
        a: 'Yes — as an independent measure. The checkup is a neutral, live read of how Google and AI search see your practice today; many practices run it to verify what their agency reports.'
      }
    ]
  },

  'plumbers': {
    slug: 'plumbers',
    name: 'Plumbers & Emergency Rooter Services',
    shortName: 'Plumbers',
    icon: 'Zap',
    badge: 'Plumbing Growth Playbook',
    heroHeadline: 'How Plumbing Companies Win High-Margin Emergency & Repipe Jobs',
    heroSubheadline: 'Master local 3-Pack rankings for emergency plumbing queries. Learn how schema, automated review velocity, and 3-tier service estimates increase average job sizes by 35%.',
    targetTab: 'local_seo',
    overview: 'When a homeowner experiences a burst pipe or backed-up sewer line at 11 PM, they grab their smartphone and call the first reputable company they see in the Google Maps 3-Pack. They do not compare 10 websites; they tap the first listing with 100+ 5-star reviews and 24/7 emergency service. Plumbers who master local search capture 80% of high-margin emergency service calls.',
    howToUse: [
      {
        stepNumber: 1,
        title: 'Dominate 24/7 Emergency Keywords on Google Maps',
        description: 'Set "Plumber" as primary GBP category and add "Emergency Plumbing Service" and "Drainage Service" as secondary.',
        proTip: 'Ensure your phone number is configured with a 24/7 live answering dispatch system.'
      },
      {
        stepNumber: 2,
        title: 'Deploy PlumbingService JSON-LD Schema with GeoRadius',
        description: 'Embed structured schema defining your exact emergency service radius and licensing credentials.',
        proTip: 'Add specific service types: Water Heater Replacement, Trenchless Sewer Repair, Hydro-Jetting.'
      },
      {
        stepNumber: 3,
        title: 'Automate Dispatch Tech Review Collection',
        description: 'Equip technicians with automated SMS review links to send to homeowners immediately after restoring water service.',
        proTip: 'Homeowners are happiest right when their emergency is resolved; reviews sent within 15 minutes convert at 45%.'
      },
      {
        stepNumber: 4,
        title: 'Present 3-Tier Good/Better/Best Estimates on Every Job',
        description: 'Offer Option 1 (Basic Patch), Option 2 (Full Line Replacement with 5-Yr Warranty), Option 3 (Premium Trenchless with Lifetime Warranty).',
        proTip: 'Over 35% of homeowners will choose the premium option for peace of mind.'
      }
    ],
    prosAndCons: {
      pros: [
        'Generates immediate, urgent emergency phone calls with virtually zero price shopping',
        'Increases average ticket size from $350 minor repairs to $4,500+ whole-home repipes',
        'Dominates local map pack over generic franchise lead brokers',
        'Creates an automated review engine that ranks you higher each month'
      ],
      cons: [
        'Requires 24/7 dispatch readiness to handle urgent late-night calls',
        'Field technicians must be incentivized to send review links consistently',
        'High local ad competition requires maintaining organic map pack strength'
      ]
    },
    localSeoChecklist: [
      'Primary GBP category set to "Plumber"',
      'Secondary categories: "Drainage Service", "Water Heater Installation", "Heating Contractor"',
      '24/7 Emergency Service attribute enabled in profile',
      'PlumbingService JSON-LD schema with geo-coordinates deployed',
      'Sticky click-to-call mobile header with 1-tap dialing'
    ],
    sampleDeliverables: {
      gbpBio: 'Vance Plumbing & Rooter is Austin’s trusted 24/7 emergency plumbing team. Specializing in burst pipe repairs, tankless water heater installations, hydro-jetting, and trenchless sewer replacements with upfront pricing.',
      reviewReply: 'Thank you for the 5-star review, Jason! We are glad Mike was able to arrive within 30 minutes and fix your emergency water heater leak in North Austin. We appreciate your recommendation!',
      schemaType: 'PlumbingService',
      jsonLdSnippet: '{\n  "@context": "https://schema.org",\n  "@type": "PlumbingService",\n  "name": "Vance Plumbing & Rooter",\n  "telephone": "YOUR_BUSINESS_PHONE",\n  "openingHours": "Mo-Su 00:00-23:59"\n}'
    },
    roiBenchmark: {
      avgTicket: 1450,
      closeRate: '58%',
      timeSavedHoursPerMonth: 22,
      projectedNewMonthlyRevenue: '+$42,000/mo'
    },
    caseStudy: {
      businessName: 'Tri-County Emergency Plumbing',
      industry: 'Emergency Plumbing Services',
      location: 'Phoenix, AZ',
      challenge: 'Relying on expensive lead brokers ($140/lead) with razor-thin margins.',
      solution: 'Implemented Locora Local SEO schema, automated review requests, and 3-tier estimates on every service call.',
      timeSpentBefore: '15 hours/week managing ad bids and disputing bad lead broker charges',
      timeSpentAfter: 'Automated organic local search dominance in Locora AI',
      results: [
        { label: 'Organic Inbound Calls', value: '168 Calls/Month' },
        { label: 'Lead Broker Spend', value: '$0 (Cancelled)' },
        { label: 'Average Ticket Size', value: '$1,820 (up 42%)' }
      ]
    },
    faqs: [
      {
        q: 'Why are Google Maps rankings more important than Google Ads for plumbers?',
        a: 'Because Google Ads costs for emergency plumbing keywords are among the highest in the world ($60–$150 per click). Winning the organic Google Maps 3-Pack gives you free inbound emergency phone calls 24/7 without paying per click.'
      },
      {
        q: 'How does 3-tier pricing increase revenue on routine plumbing calls?',
        a: 'Instead of quoting a single $250 repair fee, presenting: Tier 1 (Repair - $250), Tier 2 (Repair + Safety Valve Overhaul - $650), and Tier 3 (Full System Replacement + 10-Yr Warranty - $2,800) regularly converts routine calls into multi-thousand-dollar projects.'
      }
    ]
  },

  'lawyers': {
    slug: 'lawyers',
    name: 'Lawyers & Legal Practices',
    shortName: 'Law Firms',
    icon: 'FileText',
    badge: 'Legal Practice Playbook',
    heroHeadline: 'How Law Firms Win High-Value Retainers & Personal Injury Cases',
    heroSubheadline: 'A comprehensive local search and client intake guide. Discover how Attorney schema, consultation pipeline tracking, and rapid fee agreements convert qualified legal inquiries.',
    targetTab: 'crm',
    overview: 'Legal clients are making high-stakes personal or commercial decisions. Whether searching for a personal injury attorney after an accident or hiring corporate counsel for a business acquisition, prospective clients evaluate credibility, bar licensing, past client testimonials, and response speed. Law firms that streamline intake and local search capture the highest-value cases.',
    howToUse: [
      {
        stepNumber: 1,
        title: 'Establish Legal Specialty Category Hierarchy',
        description: 'Select specific primary categories (e.g. "Personal Injury Attorney", "Estate Planning Attorney", "Criminal Defense Attorney").',
        proTip: 'Avoid generic "Lawyer" category if a specific practice specialty is available.'
      },
      {
        stepNumber: 2,
        title: 'Deploy Attorney JSON-LD Schema with Bar Credentials',
        description: 'Embed structured entity data containing attorney names, bar association credentials, and office coordinates.',
        proTip: 'Include `knowsAbout` schema defining specific practice areas like wrongful death or probate litigation.'
      },
      {
        stepNumber: 3,
        title: 'Implement a 5-Minute Lead Intake Response Protocol',
        description: 'Route form inquiries and after-hours calls to an automated intake CRM with instant SMS confirmations.',
        proTip: 'The first law firm to speak with a personal injury prospect signs the retainer 72% of the time.'
      },
      {
        stepNumber: 4,
        title: 'Standardize Fee Agreements and Engagement Letters',
        description: 'Generate clear, professional contingency or hourly fee agreements in Locora AI for rapid digital signing.',
        proTip: 'Send engagement letters within 30 minutes of a consultation to lock in representation.'
      }
    ],
    prosAndCons: {
      pros: [
        'Attracts high-value personal injury settlements and corporate legal retainers',
        'Bypasses $250+ pay-per-click Google Ad auction costs with organic map pack rank',
        'Streamlines client intake so no prospective cases are lost to competitor firms',
        'Standardizes legal engagement letters and retainer invoicing in one hub'
      ],
      cons: [
        'Must strictly adhere to State Bar advertising and ethics rules regarding case outcome claims',
        'Requires dedicated intake staff or automated triage for high-volume inquiry calls',
        'Case settlement timelines require disciplined pipeline management'
      ]
    },
    localSeoChecklist: [
      'Specific primary category (e.g. Personal Injury Attorney, Estate Planning Attorney)',
      'Attorney JSON-LD schema with bar admissions and office coordinates',
      '5-minute lead response protocol activated across web forms and phone lines',
      'Client testimonials adhering to state bar disclaimer requirements',
      'Dedicated practice area landing pages with localized legal FAQ schema'
    ],
    sampleDeliverables: {
      gbpBio: 'Beacon Legal Group is a premier Denver personal injury and commercial litigation law firm. With over 25 years of courtroom experience, our attorneys fight tirelessly for accident victims and corporate clients across Colorado.',
      reviewReply: 'Thank you for your review, Robert. Our legal team is grateful we could guide you through the settlement process and secure full recovery for your damages. We wish you and your family all the best!',
      schemaType: 'Attorney',
      jsonLdSnippet: '{\n  "@context": "https://schema.org",\n  "@type": "Attorney",\n  "name": "Beacon Legal Group",\n  "telephone": "YOUR_BUSINESS_PHONE",\n  "priceRange": "$$$$"\n}'
    },
    roiBenchmark: {
      avgTicket: 8500,
      closeRate: '34%',
      timeSavedHoursPerMonth: 20,
      projectedNewMonthlyRevenue: '+$68,000/mo'
    },
    caseStudy: {
      businessName: 'Summit Ridge Legal Group',
      industry: 'Personal Injury & Trial Law',
      location: 'Denver, CO',
      challenge: 'Paying $220 per click on Google Ads; losing consultation leads due to slow 24-hour intake response times.',
      solution: 'Deployed Attorney schema, optimized GBP categories, and implemented instant CRM pipeline intake in Locora AI.',
      timeSpentBefore: '10 hours/week reviewing fragmented intake emails and spreadsheets',
      timeSpentAfter: 'Instant automated lead routing and fee agreement generation',
      results: [
        { label: 'Consultation Conversion', value: '46% (from 19%)' },
        { label: 'Map Pack Position', value: '#2 for "Denver Injury Lawyer"' },
        { label: 'Annual Retainers', value: '+$310,000 Increase' }
      ]
    },
    faqs: [
      {
        q: 'How can law firms comply with State Bar advertising rules while doing local SEO?',
        a: 'State Bar rules typically prohibit guaranteeing specific dollar outcomes or using comparative superlatives (like "Best Lawyer"). Locora AI generates ethical, compliant review responses and website copy focusing on experience, communication, and verified credentials.'
      },
      {
        q: 'Why is speed to lead critical for law firms?',
        a: 'Prospective clients in legal crises typically reach out to 2 or 3 firms simultaneously. Studies show that reaching out within 5 minutes increases conversion rates by over 400% compared to responding hours later.'
      }
    ]
  },

  'roofers': {
    slug: 'roofers',
    name: 'Roofing Contractors & Storm Restoration',
    shortName: 'Roofers',
    icon: 'Target',
    badge: 'Roofing Growth Playbook',
    heroHeadline: 'How Roofing Contractors Win High-Ticket Commercial & Storm Restoration Jobs',
    heroSubheadline: 'A complete local SEO and proposal blueprint for roofers. Learn how to rank for hail damage repair, automate post-inspection reviews, and close $12,000+ roof replacements.',
    targetTab: 'proposals',
    overview: 'Roofing is a high-ticket, seasonal industry where a single hail storm can generate millions of dollars in insurance restoration work within 48 hours. Roofing contractors who have established Google Maps authority, automated 5-star reviews, and professional 3-tier inspection proposals capture the lion’s share of homeowners before fly-by-night storm chasers arrive.',
    howToUse: [
      {
        stepNumber: 1,
        title: 'Optimize GBP for Storm Restoration and Insurance Work',
        description: 'Set "Roofing Contractor" as primary category and add "Gutter Cleaning Service", "Siding Contractor", and "Waterproofing Service".',
        proTip: 'Upload drone inspection footage and geo-tagged before/after roof photos weekly.'
      },
      {
        stepNumber: 2,
        title: 'Deploy RoofingContractor JSON-LD Schema with Warranty Attributes',
        description: 'Embed structured schema stating licensed status, manufacturer certifications (GAF, Owens Corning), and service area.',
        proTip: 'Highlight lifetime workmanship warranties directly in schema code.'
      },
      {
        stepNumber: 3,
        title: 'Deliver 3-Tier Good/Better/Best Roof Replacement Proposals',
        description: 'Present Option 1 (Standard 3-Tab Shingle), Option 2 (Architectural 30-Yr Shingle with Ridge Vent), Option 3 (Impact-Resistant Class 4 Shingle with Lifetime Warranty).',
        proTip: 'Over 45% of homeowners in hail zones upgrade to Class 4 shingles for insurance premium discounts.'
      },
      {
        stepNumber: 4,
        title: 'Automate Final Walkthrough Review Requests',
        description: 'Send review requests via SMS while standing on the driveway during final roof sign-off.',
        proTip: 'Ask the homeowner to mention their neighborhood name in the review.'
      }
    ],
    prosAndCons: {
      pros: [
        'Captures high-ticket $8,000–$25,000+ insurance restoration and commercial roof jobs',
        'Establishes permanent local credibility over out-of-state storm chaser companies',
        'Tiered proposals increase average job value by $2,400+ per replacement',
        'Builds an automated referral engine across entire suburban neighborhoods'
      ],
      cons: [
        'Revenue fluctuates with seasonal storms requiring disciplined cash reserve planning',
        'Must coordinate with insurance adjusters on claim approvals',
        'Requires strong field sales rep adherence to proposal and review workflows'
      ]
    },
    localSeoChecklist: [
      'Primary GBP category set to "Roofing Contractor"',
      'Manufacturer certifications (GAF, CertainTeed, Owens Corning) highlighted',
      'RoofingContractor JSON-LD schema with complete service suburbs deployed',
      'Weekly geo-tagged photos of completed roof projects and drone inspections',
      'Automated SMS review requests sent upon project completion'
    ],
    sampleDeliverables: {
      gbpBio: 'Pro-Craft Roofing & Solar is Dallas-Fort Worth’s certified master roofing contractor. Specializing in hail damage restoration, Class 4 impact-resistant shingles, metal roofing, and emergency leak repairs with 100% financing.',
      reviewReply: 'Thank you for the review, David! We are thrilled our roofing crew could complete your full roof replacement in Plano in just one day with zero cleanup mess. Enjoy the new Class 4 architectural shingles!',
      schemaType: 'RoofingContractor',
      jsonLdSnippet: '{\n  "@context": "https://schema.org",\n  "@type": "RoofingContractor",\n  "name": "Pro-Craft Roofing & Solar",\n  "telephone": "YOUR_BUSINESS_PHONE",\n  "priceRange": "$$$"\n}'
    },
    roiBenchmark: {
      avgTicket: 11800,
      closeRate: '48%',
      timeSavedHoursPerMonth: 25,
      projectedNewMonthlyRevenue: '+$59,000/mo'
    },
    caseStudy: {
      businessName: 'Pro-Craft Roofing & Solar',
      industry: 'Residential & Commercial Roofing',
      location: 'Dallas, TX',
      challenge: 'Losing jobs to competitors because proposals took 3 days to deliver in paper binders.',
      solution: 'Adopted Locora AI Proposal Generator to send 3-tier digital proposals within 30 minutes of roof inspections.',
      timeSpentBefore: '4 hours per estimate drawing roof diagrams and calculating shingle costs',
      timeSpentAfter: '90 seconds to customize and send 3-tier proposals in Locora AI',
      results: [
        { label: 'Close Rate', value: '54% (up from 24%)' },
        { label: 'Avg Job Size', value: '$13,400 (up $2,200)' },
        { label: 'Monthly Revenue', value: '+$88,000 MRR' }
      ]
    },
    faqs: [
      {
        q: 'How do 3-tier proposals help roofing contractors close more jobs?',
        a: 'Homeowners rarely understand roofing technical details. Presenting 3 clear tiers (Standard, Architectural 30-Yr, and Class 4 Impact-Resistant) allows them to choose their desired level of protection and warranty, naturally guiding them toward higher-ticket options.'
      },
      {
        q: 'How fast can a roofing company rank in Google Maps after a storm?',
        a: 'Companies that already have established LocalBusiness schema and an active 5-star review engine will immediately capture storm search surges while unprepared competitors struggle.'
      }
    ]
  }
};
