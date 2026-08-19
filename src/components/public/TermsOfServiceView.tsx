import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, ArrowLeft, CheckCircle2, ShieldCheck, CreditCard, Scale, AlertCircle, Sparkles } from 'lucide-react';

export const TermsOfServiceView: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab('home')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#059669] transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Last Modified: July 2026
          </span>
        </div>

        {/* Page Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span>Legal Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Locora AI Terms of Service
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              These Terms of Service ("Terms") govern your access to and use of the Locora AI platform, application operating system, AI copilot tools, and related services owned and operated by Imtiaz Hussain, an individual developer based in Pakistan.
            </p>
          </div>

          {/* Quick Summary Highlights */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">100% Content Ownership</p>
                <p className="text-[11px] text-slate-500">You retain full ownership of all documents & contracts built on Locora.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <CreditCard className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Transparent Billing</p>
                <p className="text-[11px] text-slate-500">Cancel or upgrade your subscription plan anytime with zero penalties.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <ShieldCheck className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">99.9% Service SLA</p>
                <p className="text-[11px] text-slate-500">Reliable Cloud infrastructure engineered for business continuity.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Content Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs space-y-8">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">1</span>
              Acceptance & Eligibility
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-8">
              <p>
                By creating an account, accessing, or using Locora AI, you agree to be bound by these Terms. If you are entering into this agreement on behalf of a company or legal entity, you represent that you have the authority to bind such entity. You must be at least 18 years of age to use this platform.
              </p>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">2</span>
              Description of Services
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-8">
              <p>
                Locora AI provides an integrated software-as-a-service (SaaS) business operating system featuring:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>AI Business Copilot for local proposal drafting, SEO audit analysis, and client communications.</li>
                <li>Client CRM pipeline management and customer record organization.</li>
                <li>Local SEO schema generator and Google Business Profile optimization engines.</li>
                <li>One-click PDF invoice generation, payment tracking, and line-item creation.</li>
                <li>Growth Roadmaps and marketing planner tools.</li>
              </ul>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">3</span>
              Subscription Plans, Billing & Cancellation
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-8">
              <p>
                Locora AI offers recurring subscription tiers (Free, Pro at $19/mo or $15/mo billed annually, and Agency at $49/mo or $39/mo billed annually).
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>Payment Processing:</strong> Our order process is conducted by our Merchant of Record, Paddle. Paddle acts as the merchant of record for all our orders, handles global sales tax calculations, compliance operations, and securely executes subscription billing lifecycle workflows.</li>
                <li><strong>Cancellation Policy:</strong> You may cancel your recurring subscription at any time directly through your Account Settings interface. Cancellation will take effect at the conclusion of your active, paid billing period. You will retain unhindered access to all tier features until your current expiration date.</li>
                <li><strong>Refund Policy:</strong> Due to the immediate computing costs associated with server-side AI model executions, all sales are final and non-refundable once AI credits have been actively spent within an account cycle. If you experience technical errors or have a dispute regarding duplicate billing charges, please contact our support desk at <a href="mailto:support@locoraai.com" className="text-[#059669] font-semibold hover:underline">support@locoraai.com</a> within 14 days to request an adjustment review.</li>
                <li><strong>Credits & Allocation:</strong> AI Copilot credits reset monthly based on your plan tier (Free: 25 credits/mo, Pro: 250 credits/mo, Agency: Unlimited). Unused credits do not roll over to subsequent months.</li>
              </ul>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">4</span>
              Intellectual Property & Content Ownership
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-8">
              <p>
                You retain complete intellectual property rights and full content ownership over all client data, custom proposals, CRM profiles, and documents generated on the platform. Locora AI does not claim ownership or storage execution rights over any content you create.
              </p>
            </div>
          </section>

          <hr className="border-slate-100" />

            {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">5</span>
              Acceptable Use Policy
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-8">
              <p>You agree not to use Locora AI to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Violate any applicable local, state, national, or international laws or regulations.</li>
                <li>Distribute unsolicited commercial emails (spam), fraudulent proposals, or deceptive advertising.</li>
                <li>Attempt to reverse-engineer, decompile, or bypass security features of the platform or API routes.</li>
                <li>Abuse API rate limits or interfere with server performance for other users.</li>
              </ul>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">6</span>
              Limitation of Liability & Warranty Disclaimer
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-8">
              <p className="uppercase">
                Locora AI is provided "as is" and "as available" without warranties of any kind, either express or implied. In no event shall the individual platform operator, Imtiaz Hussain, be liable for indirect, incidental, special, or consequential damages arising out of your use of the platform.
              </p>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">7</span>
              Questions & Legal Contact
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8 space-y-3">
              <p>For questions or notices regarding these Terms of Service, please reach out to the platform operator:</p>
              <p className="font-bold text-slate-900 text-sm pl-1">Imtiaz Hussain</p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="mailto:support@locoraai.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email: support@locoraai.com</span>
                </a>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-slate-200"
                >
                  <span>Open Contact Form</span>
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
