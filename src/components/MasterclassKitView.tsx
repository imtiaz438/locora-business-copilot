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
  CheckCircle2,
  DollarSign,
  TrendingUp,
  FileCheck2,
} from 'lucide-react';

export const MasterclassKitView: React.FC = () => {
  const { user, logActivity } = useApp();
  const [activeTab, setActiveTabLocal] = useState<'contracts' | 'scripts' | 'calculator' | 'curriculum'>('contracts');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isKitUnlocked, setIsKitUnlocked] = useState(user.planTier === 'agency'); // Agency tier gets it or purchased
  const [purchasing, setPurchasing] = useState(false);

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
      // Unlock on success
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

I noticed [Client Company] has stellar reviews on Google (${4.6} stars), but your top 2 competitors in [City] have 3x more recent reviews, which is why Google is ranking them in the 3-Pack map view above you for "[Industry] near me".

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
            Everything you need to close and fulfill $1,500 – $5,000/mo local business clients using Locora AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isKitUnlocked ? (
            <button
              onClick={handlePurchaseKit}
              disabled={purchasing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{purchasing ? 'Opening Whop...' : 'Unlock Lifetime Access ($97)'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-heading">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Full Vault Unlocked & Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'contracts', label: 'Retainer Contracts & SOW', icon: FileText },
          { id: 'scripts', label: 'Cold Outbound Scripts (15-25% Reply)', icon: Mail },
          { id: 'calculator', label: 'Retainer Profit Margin Calculator', icon: Calculator },
          { id: 'curriculum', label: 'Masterclass SOP Curriculum', icon: BookOpen },
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

            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Legally formatted with standard intellectual property protections, confidentiality clauses, and clear cancellation notices.
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              <button
                onClick={() => handleCopy(script.id, script.body)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {copiedId === script.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === script.id ? 'Copied Script!' : 'Copy Outbound Script'}</span>
              </button>
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

      {/* Tab 4: Masterclass Curriculum */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          {[
            {
              step: '01',
              title: 'Niche Selection & Digital Gap Targeting',
              desc: 'How to select dentists, med spas, and emergency contractors with minimum $500k annual revenue and high customer lifetime values.',
              duration: '18 min video + SOP Guide',
            },
            {
              step: '02',
              title: 'The 40-Point Technical SEO Closing Audit',
              desc: 'How to use Locora’s White-Label Audit exporter to generate executive-ready PDF pitch proposals in under 60 seconds.',
              duration: '22 min video + PDF Template',
            },
            {
              step: '03',
              title: 'Cold Outbound Funnel: 15-25% Reply Strategy',
              desc: 'Email and LinkedIn messaging architecture that focuses on revenue loss gaps instead of generic marketing pitches.',
              duration: '25 min video + 12 Copy Scripts',
            },
            {
              step: '04',
              title: 'Retainer SOW Contracting & Value-Based Pricing',
              desc: 'Protecting your margins, enforcing 30-day notice terms, and avoiding client scope creep with 3-tier agreements.',
              duration: '15 min video + Legal Docs',
            },
            {
              step: '05',
              title: 'Locora AI Automation & Hands-Off Fulfillment',
              desc: 'Automating monthly reporting, review collection funnels, and schema validation with zero extra staff.',
              duration: '30 min video + Full Checklist',
            },
          ].map((mod) => (
            <div
              key={mod.step}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex items-center justify-between gap-4 hover:border-purple-300 transition-all"
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
              <span className="text-[11px] font-bold text-slate-500 shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg">
                {mod.duration}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
