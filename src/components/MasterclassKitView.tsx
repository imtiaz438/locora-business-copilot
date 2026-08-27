import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { openWhopOneTimeCheckout } from '../lib/whopService';
import {
  GraduationCap,
  FileText,
  Copy,
  Check,
  Download,
  Play,
  Calculator,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BookOpen,
  Mail,
  Award,
  Layers,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  FileCheck2,
  FolderDown,
  HelpCircle,
  PhoneCall,
  BarChart3,
  Briefcase,
} from 'lucide-react';

export const MasterclassKitView: React.FC = () => {
  const { user, logActivity } = useApp();
  const [activeTab, setActiveTabLocal] = useState<'contracts' | 'scripts' | 'calculator' | 'curriculum' | 'resources'>('contracts');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isKitUnlocked, setIsKitUnlocked] = useState(user.planTier === 'agency' || user.planTier === 'pro');
  const [purchasing, setPurchasing] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>('mod_1');

  // SOW Contract State
  const [agencyName, setAgencyName] = useState('Apex Digital Growth');
  const [clientName, setClientName] = useState('Bright Smile Dental Care');
  const [monthlyRetainer, setMonthlyRetainer] = useState(2500);
  const [serviceTier, setServiceTier] = useState<'tier1' | 'tier2' | 'tier3'>('tier2');

  // Profit Margin Calculator State
  const [targetRetainers, setTargetRetainers] = useState(6);
  const [avgRetainerPrice, setAvgRetainerPrice] = useState(2500);
  const [fulfillmentCostPerClient, setFulfillmentCostPerClient] = useState(400);

  const monthlyGrossRevenue = targetRetainers * avgRetainerPrice;
  const totalFulfillmentCost = targetRetainers * fulfillmentCostPerClient;
  const softwareCost = 49; // Locora Agency plan
  const netMonthlyProfit = monthlyGrossRevenue - totalFulfillmentCost - softwareCost;
  const netAnnualProfit = netMonthlyProfit * 12;
  const profitMargin = Math.round((netMonthlyProfit / (monthlyGrossRevenue || 1)) * 100);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadText = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePurchaseKit = async () => {
    setPurchasing(true);
    try {
      await openWhopOneTimeCheckout({
        productType: 'masterclass_kit',
        price: 97,
        email: user.email || 'customer@example.com',
        name: user.name,
        userId: user.id,
        onSuccess: () => {
          setIsKitUnlocked(true);
        },
      });
      setIsKitUnlocked(true);
    } catch (e) {
      console.error('Masterclass checkout notice:', e);
    } finally {
      setPurchasing(false);
    }
  };

  const coldScripts = [
    {
      id: 'script_website_flaw',
      title: 'Flaw-Based Website Audit Hook (Highest Conversion)',
      target: 'Local Business Owners (Dentists, Plumbers, HVAC, Law Firms)',
      body: `Subject: Quick question about [Client Company] website's mobile conversion

Hi [First Name],

I was reviewing local service providers in [City] and noticed a couple of technical errors on [Client Company]'s website that are currently hurting your Google ranking and mobile bookings (specifically missing SSL/security headers and slow Core Web Vitals).

Based on search volume in [City], you're likely losing 15-25 qualified patient/client inquiries every month to competitors like [Competitor Name].

I put together a quick 3-minute video breakdown showing the exact 3 fixes to reclaim that traffic. 

Would you be opposed to me sending that video over to you?

Best,
[Your Name]
[Your Agency Name]`,
    },
    {
      id: 'script_gmb_review_gap',
      title: 'Google Business Review Gap Outreach',
      target: 'Contractors, Med Spas, Roofers, Auto Shops',
      body: `Subject: Google Maps rating gap for [Client Company] in [City]

Hey [First Name],

I noticed [Client Company] has stellar reviews on Google (4.6 stars), but your top 2 competitors in [City] have 3x more recent reviews, which is why Google is ranking them in the 3-Pack map view above you for "[Industry] near me".

We built an automated SMS & QR review acceleration engine that helps local businesses add 15-20 verified 5-star reviews every month without bothering staff.

Can I share a 1-page roadmap of how we did this for another local [Industry] team?

Cheers,
[Your Name]
[Your Agency Name]`,
    },
    {
      id: 'script_linkedin_dm',
      title: 'LinkedIn Direct Message to Founder / Managing Partner',
      target: 'Attorneys, Med Spa Founders, Commercial Real Estate',
      body: `Hey [First Name] - love what you've built at [Client Company]! 

We recently completed a 40-point local digital audit across [City] and noticed your local search schema is missing several JSON-LD structured tags that Google uses to award rich snippets.

Would you be open to checking out a 1-page PDF audit report with our recommendations? No pitch or sales call required.

Best,
[Your Name]`,
    },
    {
      id: 'script_speed_gap',
      title: 'Core Web Vitals & Mobile Speed Penalty Hook',
      target: 'E-commerce, High-Ticket Home Improvement, Cosmetic Clinics',
      body: `Subject: [Client Company] mobile load time test results in [City]

Hi [First Name],

Ran [Client Company]'s homepage through Google PageSpeed Insights this morning. While your desktop layout looks great, the mobile version scored 38/100 due to uncompressed script bloat (taking over 4.8 seconds on 4G).

Google now calculates local search rank based on mobile-first index, meaning you are currently being outranked by [Competitor Name] whose mobile page loads in under 1.2 seconds.

I mapped out the 3 specific scripts causing the delay. Mind if I email over the audit screenshot?

Regards,
[Your Name]
[Your Agency Name]`,
    },
  ];

  const curriculumModules = [
    {
      id: 'mod_1',
      step: '01',
      title: 'Niche Selection & Digital Gap Prospecting',
      desc: 'How to filter high-ticket local niches (Dentists, Med Spas, Emergency Contractors) with $500k+ revenue and $1,500+ customer lifetime values.',
      duration: '18 min video + Action SOP',
      topics: [
        'Top 10 highest-converting local niches with zero price resistance',
        'How to identify businesses with $3,000+/yr revenue leakages in 30 seconds',
        'Filtering out bad prospects before sending a single message',
        'Using Locora B2B Lead Generator to export enriched decision-maker direct emails',
      ],
      actionChecklist: [
        'Pick 2 primary verticals from the recommended High-LTV list',
        'Run query in Lead Prospector for top 3 neighboring metropolitan areas',
        'Export first batch of 50 leads with identified technical flaw tags',
      ],
    },
    {
      id: 'mod_2',
      step: '02',
      title: 'The 40-Point Technical SEO Closing Audit',
      desc: 'How to use Locora’s White-Label Audit exporter to generate executive-ready PDF pitch proposals in under 60 seconds.',
      duration: '22 min video + PDF Template',
      topics: [
        'The 5 critical audit metrics that business owners care about (Revenue loss, Mobile speed, Security, Schema, Google Map pack)',
        'Transforming technical jargon into direct business revenue metrics',
        'Adding your agency branding, logo, and custom color scheme to Locora audits',
      ],
      actionChecklist: [
        'Configure your White-Label agency branding in Locora Settings',
        'Run 5 sample domain audits to verify automated PDF export',
        'Save audit links into CRM lead notes ready for outbound pitch hooks',
      ],
    },
    {
      id: 'mod_3',
      step: '03',
      title: 'Cold Outbound Funnel: 15-25% Reply Strategy',
      desc: 'Email and LinkedIn messaging architecture that focuses on revenue loss gaps instead of generic marketing pitches.',
      duration: '25 min video + 12 Copy Scripts',
      topics: [
        'Why generic "We do SEO/Marketing" emails have a 0.2% response rate',
        'The Flaw-First subject line formulas that achieve 65%+ open rates',
        'How to record 90-second personalized Loom audit walkthroughs',
        'Handling common objections: "We already have an agency" and "How much does it cost?"',
      ],
      actionChecklist: [
        'Copy the Flaw-Based Outreach script into your email client',
        'Customize placeholder brackets with verified company & city details',
        'Send 15 personalized audits per day to achieve 3-5 positive weekly sales conversations',
      ],
    },
    {
      id: 'mod_4',
      step: '04',
      title: 'Retainer SOW Contracting & Value-Based Pricing',
      desc: 'Protecting your margins, enforcing 30-day notice terms, and avoiding client scope creep with 3-tier agreements.',
      duration: '15 min video + Legal Docs',
      topics: [
        'The 3 Retainer Pricing Tiers: $1,500/mo (Local SEO), $3,000/mo (SEO + Review Engine), $5,000/mo (Full Growth Engine)',
        'Structuring initial 90-day minimum agreements before transitioning to month-to-month',
        'Setting up automated recurring billing with zero chase invoices',
      ],
      actionChecklist: [
        'Generate customized SOW agreement using the tab generator',
        'Review payment terms and deliverable boundaries',
        'Export as signed contract template ready for prospective clients',
      ],
    },
    {
      id: 'mod_5',
      step: '05',
      title: 'Locora AI Automation & Hands-Off Fulfillment',
      desc: 'Automating monthly reporting, review collection funnels, and schema validation with zero extra staff.',
      duration: '30 min video + Full Checklist',
      topics: [
        'How 1 person can fulfill 15+ clients using Locora AI Copilot & automated reporting',
        'Automating monthly executive reports with 1-click PDF exports',
        'Retaining clients for 18+ months through visible month-over-month Google Maps ranking progress',
      ],
      actionChecklist: [
        'Set up first test client inside Locora CRM & Document Generator',
        'Schedule automated monthly health audits',
        'Deploy the Locora Review Acceleration funnel for your client',
      ],
    },
  ];

  const resourceAssets = [
    {
      id: 'res_onboarding',
      title: 'Client Onboarding Discovery Questionnaire',
      desc: '15 questions to extract target keywords, top competitors, service margins, and CRM access credentials on day 1.',
      tag: 'Onboarding & Ops',
      content: `# LOCORA AGENCY CLIENT ONBOARDING QUESTIONNAIRE

1. Business Legal Name & DBA:
2. Primary Physical Address (as verified on Google Maps):
3. Primary Contact Name, Direct Cell & Billing Email:
4. Website URL & Hosting Provider Login (WordPress / Webflow / Shopify / Custom):
5. Google Business Profile Primary Owner Email:
6. Top 3 Most Profitable Services / Procedures:
7. Average Customer Lifetime Value ($USD):
8. Target Geographic Radius / Cities Served:
9. Top 3 Direct Competitors Outranking You Locally:
10. Existing Tracking Tools Installed (Google Analytics 4 / Google Search Console):
11. Current Monthly New Patient / Client Goal:
12. Do you have existing customer phone/email lists for review acceleration campaigns?
13. Any past Google manual actions or domain penalties?
14. Preferred Communication Channel (Slack / Email / Bi-weekly Zoom):
15. Key Performance Target for the first 90 days:`,
    },
    {
      id: 'res_objection_battlecard',
      title: 'Sales Objection Handling Battlecard',
      desc: 'Word-for-word responses to "We already have an SEO guy", "Send me pricing first", and "We tried marketing before".',
      tag: 'Sales & Closing',
      content: `# AGENCY SALES OBJECTION HANDLING BATTLECARD

## Objection 1: "We already have someone handling our SEO / Website."
Response:
"That’s totally fair [Name], and we work alongside internal teams all the time. The reason I reached out specifically is because your site is currently failing Google's Mobile Core Web Vitals test, which was updated recently. Your current team might not have run the latest audit yet. Would you like me to send over the 1-page report so you can forward it to them to fix?"
(Result: 40% will review it, see their agency dropped the ball, and ask you to fix it).

## Objection 2: "How much does your service cost?"
Response:
"Our local growth partnerships range from $1,500 to $5,000/mo depending on whether we're fixing local map pack visibility or running full review acceleration and technical schema management. But before discussing numbers, I want to make sure your market actually has enough search volume to yield a 4x+ ROI on that spend. Can we look at the live audit data together for 5 minutes?"

## Objection 3: "We were burned by an agency in the past."
Response:
"I hear that every week, and frankly, 80% of agencies sell vanity metrics like impressions instead of qualified phone calls and patient bookings. That's why we structure our work with transparent 40-point technical audits, live rank trackers, and straightforward 90-day review cycles with no locked multi-year contracts."`,
    },
    {
      id: 'res_rate_card',
      title: 'White-Label Retainer Pricing Rate Cards',
      desc: 'Standardized 3-tier pricing structure proven across 500+ local agency implementations.',
      tag: 'Pricing Strategy',
      content: `# LOCORA AGENCY 3-TIER RETAINER PRICING MATRIX

### TIER 1: Local Foundation ($1,500 / month)
- 40-Point Technical SEO Maintenance
- Monthly Google Business Profile Optimization
- Local Schema JSON-LD Synchronization
- Monthly Performance & Ranking Report
- Target: Solo practitioners & single-location service businesses.

### TIER 2: Growth Accelerator ($3,000 / month) [MOST POPULAR]
- Everything in Tier 1 PLUS:
- Automated Review Acceleration System (SMS + QR)
- Competitor Citation Gap Closure (25 new local directories/mo)
- Mobile Core Web Vitals & Speed Optimization
- Bi-Weekly Strategy Check-in & Priority Support
- Target: Established practices, HVAC, Roofing, Med Spas seeking top 3 Map rankings.

### TIER 3: Local Market Dominator ($5,000 / month)
- Everything in Tier 2 PLUS:
- Multi-Location / Multi-City Schema Coverage
- Custom High-Converting Landing Page Optimization
- Monthly Video Audit Presentations for Executive Board
- Dedicated Account Lead & Emergency Response SLA (<2 hours)
- Target: Multi-location clinics, law firms, and high-ticket service operations.`,
    },
  ];

  const sowAgreement = `===================================================================
MASTER SERVICES AGREEMENT & STATEMENT OF WORK (SOW)
===================================================================
Effective Date: ${new Date().toLocaleDateString()}
Agency: ${agencyName} ("Provider")
Client: ${clientName} ("Client")

1. SCOPE OF RETAINER SERVICES
Provider agrees to deliver the following ongoing digital growth, SEO, and technical optimization services on a monthly recurring retainer:
- 40-Point Technical SEO & Core Web Vitals Maintenance
- Local Google Business Profile Optimization & Monthly Citation Audits
- Ongoing Local Schema Markup (JSON-LD) updates & metadata synchronization
- Monthly Performance Reporting & Keyword Position Tracking
- Priority Client Support & Emergency Response (Under 4 hours)

2. INVESTMENT & BILLING TERMS
- Monthly Retainer Fee: $${monthlyRetainer.toLocaleString()} USD / month
- Payment Due: 1st of each calendar month via Automated Card / Bank Transfer
- Initial Term: 3-Month Commitment, transitioning to Month-to-Month with 30-Day written notice.

3. INTELLECTUAL PROPERTY & DELIVERABLES
All custom graphics, copy, schemas, and reports produced specifically for Client become the property of Client upon receipt of payment.

4. SIGNATURES & ACCEPTANCE
Provider: _______________________      Date: _______________
Client:   _______________________      Date: _______________
===================================================================`;

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto font-sans text-slate-900">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-bold uppercase tracking-wider mb-2 font-heading">
            <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
            <span>Phase 4 · Agency Growth Kit & Masterclass</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
            $5k/mo Local Retainer Blueprint & Agency Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-sans mt-1">
            Everything you need to close, contract, and fulfill $1,500 – $5,000/mo local business retainer clients using Locora AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-heading">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Full Growth Vault Active</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'contracts', label: 'Retainer Contracts & SOW', icon: FileText },
          { id: 'scripts', label: 'Cold Outbound Scripts (15-25% Reply)', icon: Mail },
          { id: 'calculator', label: 'Retainer Profit Margin Calculator', icon: Calculator },
          { id: 'curriculum', label: 'Masterclass SOP Curriculum', icon: BookOpen },
          { id: 'resources', label: 'Agency Resource Library & SOPs', icon: Briefcase },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabLocal(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap font-heading ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Retainer Contracts & SOW Generator */}
      {activeTab === 'contracts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-extrabold font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Customize Agreement</span>
            </h3>

            <div className="space-y-3 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Your Agency / Business Name</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Client / Prospect Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Monthly Retainer Amount ($USD)</label>
                <input
                  type="number"
                  step="250"
                  value={monthlyRetainer}
                  onChange={(e) => setMonthlyRetainer(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => handleDownloadText(`SOW_Agreement_${clientName.replace(/\s+/g, '_')}.txt`, sowAgreement)}
                className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-xl border border-purple-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-purple-700" />
                <span>Download SOW Contract (.txt)</span>
              </button>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Standard legal agreement with IP ownership clauses, net-30 terms, and structured recurring deliverables.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 font-heading">
                Live Retainer Agreement Preview
              </span>
              <button
                onClick={() => handleCopy('sow', sowAgreement)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedId === 'sow' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'sow' ? 'Copied Contract!' : 'Copy to Clipboard'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 text-slate-200 p-5 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap select-all">
              {sowAgreement}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Cold Outbound Scripts */}
      {activeTab === 'scripts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coldScripts.map((script) => (
            <div
              key={script.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:border-purple-300 transition-all"
            >
              <div className="space-y-2">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold uppercase font-heading">
                  {script.target}
                </div>
                <h3 className="text-sm font-extrabold font-heading text-slate-900">{script.title}</h3>
                <pre className="bg-slate-50 border border-slate-200 text-slate-800 p-3.5 rounded-xl font-sans text-xs leading-relaxed whitespace-pre-wrap">
                  {script.body}
                </pre>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(script.id, script.body)}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {copiedId === script.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === script.id ? 'Copied Script!' : 'Copy Script'}</span>
                </button>
                <button
                  onClick={() => handleDownloadText(`${script.id}.txt`, script.body)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors"
                  title="Download Script as Text"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Profit Margin Calculator */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <h3 className="text-sm font-extrabold font-heading text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-purple-600" />
              <span>Agency Retainer Variables</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Target Retainer Clients</span>
                  <span className="text-purple-700 font-black">{targetRetainers} Clients</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={targetRetainers}
                  onChange={(e) => setTargetRetainers(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Average Monthly Retainer Fee</span>
                  <span className="text-purple-700 font-black">${avgRetainerPrice}/mo</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="250"
                  value={avgRetainerPrice}
                  onChange={(e) => setAvgRetainerPrice(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Estimated Fulfillment Cost / Client</span>
                  <span className="text-purple-700 font-black">${fulfillmentCostPerClient}/mo</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1500"
                  step="50"
                  value={fulfillmentCostPerClient}
                  onChange={(e) => setFulfillmentCostPerClient(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-heading">
                Locora AI Scaled Financial Model
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
                ${netMonthlyProfit.toLocaleString()} <span className="text-sm font-normal text-slate-300">/ net monthly profit</span>
              </h3>
              <p className="text-xs text-slate-300 font-sans">
                Annualized net take-home run rate of <strong>${netAnnualProfit.toLocaleString()} / year</strong> with a <strong>{profitMargin}% net margin</strong>.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-center">
              <div className="p-3 bg-white/5 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Monthly Gross</div>
                <div className="text-lg font-black text-white font-heading">${monthlyGrossRevenue.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Fulfillment & Ops</div>
                <div className="text-lg font-black text-rose-300 font-heading">-${totalFulfillmentCost.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Net Margin</div>
                <div className="text-lg font-black text-emerald-400 font-heading">{profitMargin}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Masterclass Curriculum (Expandable Action SOPs) */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-purple-700" />
              <div>
                <h4 className="text-xs font-extrabold font-heading text-purple-900">5-Module Agency Launchpad</h4>
                <p className="text-[11px] text-purple-700">Click any module below to expand the full step-by-step SOP, key takeaways, and action checklist.</p>
              </div>
            </div>
          </div>

          {curriculumModules.map((mod) => {
            const isExpanded = expandedModule === mod.id;
            return (
              <div
                key={mod.step}
                className={`bg-white border rounded-2xl p-5 shadow-2xs transition-all ${
                  isExpanded ? 'border-purple-400 ring-2 ring-purple-100' : 'border-slate-200 hover:border-purple-300'
                }`}
              >
                <div
                  onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                  className="flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 font-black font-heading flex items-center justify-center text-sm shrink-0">
                      {mod.step}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold font-heading text-slate-900">{mod.title}</h4>
                      <p className="text-xs text-slate-500 font-sans mt-0.5">{mod.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg hidden sm:inline-block">
                      {mod.duration}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-purple-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Action SOP Details */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                        <h5 className="font-bold text-slate-900 uppercase font-heading tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Core Execution Topics</span>
                        </h5>
                        <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                          {mod.topics.map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-200 space-y-2">
                        <h5 className="font-bold text-purple-900 uppercase font-heading tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>Actionable Checklist</span>
                        </h5>
                        <ul className="space-y-1.5 text-purple-800">
                          {mod.actionChecklist.map((c, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() =>
                          handleCopy(
                            `mod_copy_${mod.id}`,
                            `MODULE ${mod.step}: ${mod.title}\n\nTopics:\n${mod.topics.map((t) => '- ' + t).join('\n')}\n\nChecklist:\n${mod.actionChecklist.map((c) => '[ ] ' + c).join('\n')}`
                          )
                        }
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        {copiedId === `mod_copy_${mod.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === `mod_copy_${mod.id}` ? 'Copied SOP!' : 'Copy Module SOP'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 5: Resource Library & Deliverables */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resourceAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:border-purple-300 transition-all"
              >
                <div className="space-y-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold uppercase font-heading">
                    {asset.tag}
                  </span>
                  <h3 className="text-sm font-extrabold font-heading text-slate-900">{asset.title}</h3>
                  <p className="text-xs text-slate-500 font-sans">{asset.desc}</p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleCopy(asset.id, asset.content)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === asset.id ? 'Copied Resource!' : 'Copy to Clipboard'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadText(`${asset.id}.md`, asset.content)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Markdown (.md)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
