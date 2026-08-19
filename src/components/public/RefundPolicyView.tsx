import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, ArrowLeft, ShieldCheck, RefreshCw, XCircle, AlertCircle, Mail, MessageSquare } from 'lucide-react';

export const RefundPolicyView: React.FC = () => {
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
            Last Updated: July 2026
          </span>
        </div>

        {/* Page Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
              <span>Customer Protection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Cancellation & Refund Policy
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              This policy outlines the cancellation structures, subscription adjustments, and refund frameworks for the Locora AI platform operated by Imtiaz Hussain, in alignment with our global Merchant of Record, Paddle.
            </p>
          </div>

          {/* Quick Summary Highlights Box */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <RefreshCw className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Cancel Anytime</p>
                <p className="text-[11px] text-slate-500">Stop your subscription directly via your dashboard settings wrapper.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <XCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Final Sale Rules</p>
                <p className="text-[11px] text-slate-500">Sales are final once cloud-allocated AI generation credits are spent.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <ShieldCheck className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">14-Day Discrepancies</p>
                <p className="text-[11px] text-slate-500">Dedicated manual review for duplicate billing or gateway errors.</p>
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
              Merchant of Record Declarations
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-8">
              <p>
                Locora AI utilizes <strong>Paddle</strong> as our official global Merchant of Record. Paddle executes all secure checkout transactions, handles foreign currency conversion workflows, manages regional compliance configurations, and processes international sales tax calculations. 
              </p>
              <p>
                Because Paddle functions as the legal distributor of our software services, your credit card statement or payment history will safely display the indicator <strong>"PADDLE * LOCORA AI"</strong> for all subscription billing activations.
              </p>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">2</span>
              Subscription Cancellations
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-8">
              <p>
                All paid software tiers (Pro and Agency options) are established on recurring, automated renewal cycles based on your selected framework (monthly or annual increments). You maintain complete, absolute control over your plan allocation:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>How to Cancel:</strong> You may cancel your subscription service at any point by navigating to your <em>Account Settings &gt; Billing Profile</em> workspace inside the dashboard and selecting the "Cancel Subscription" option. No complex approvals or phone calls are required.</li>
                <li><strong>Termination Timeline:</strong> Once a cancellation event is requested, your plan will not renew during the subsequent billing period. You will retain full operational access to your AI engines, custom CRM records, and local SEO copilot dashboards until your current paid billing period officially expires.</li>
              </ul>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">3</span>
              Refund Evaluation Standards
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-8">
              <p>
                Because Locora AI allocates dedicated server processing nodes and incurs immediate, non-refundable third-party infrastructure computing expenses (including API tokens for Google Gemini processing models) upon asset generations, our refund protocol is structured as follows:
              </p>
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl text-amber-900 space-y-2 my-3">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Standard Refund Thresholds</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-800">
                  All transactional purchases are final and non-refundable once accounts have actively spent allocated AI Copilot token balances. If you establish a subscription plan but do not interact with the platform or generate any data records, you are legally entitled to request an evaluation review within <strong>14 days</strong> of the invoice event date.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">4</span>
              Exceptions & Technical Billing Discrepancies
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-8">
              <p>
                We are committed to absolute billing fairness. Complete manual adjustments or direct refund events will be instantly approved and processed regardless of usage thresholds for the following situations:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>Duplicate Transactions:</strong> Gateway processing anomalies causing multiple charges for a single user billing cycle.</li>
                <li><strong>Verified Server Failures:</strong> Major cloud performance drops where backend outages completely block tool delivery for extended timelines.</li>
                <li><strong>Fraudulent Account Exploitation:</strong> Unauthorized credential usage prior to administrative suspension reviews.</li>
              </ul>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">5</span>
              How to Request Support & Billing Adjustments
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-4 pl-8">
              <p>
                If you encounter a payment problem, duplicate billing notification, or want to verify an active adjustment evaluation, do not hesitate to contact our desk directly:
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-700">
                <p><strong>Primary Administrator:</strong> Imtiaz Hussain</p>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <strong>Support Email:</strong> <a href="mailto:support@locoraai.com" className="text-emerald-700 hover:underline">support@locoraai.com</a>
                </p>
                <p><strong>Response Time:</strong> Within 24–48 business hours</p>
              </div>
              <div>
                <button
                  onClick={() => {
                    setActiveTab('contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open Billing Ticket</span>
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
