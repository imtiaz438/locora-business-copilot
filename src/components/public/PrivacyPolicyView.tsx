import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2, Mail, Globe, Eye, Server, UserCheck } from 'lucide-react';

export const PrivacyPolicyView: React.FC = () => {
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
            Effective Date: July 2026
          </span>
        </div>

        {/* Page Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data Protection & Transparency</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Locora AI Privacy Policy
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              Your privacy and the security of your local business data are our highest priorities. This policy outlines how Locora AI, owned and operated by Imtiaz Hussain, an individual developer based in Pakistan, collects, protects, uses, and respects your personal and business information.
            </p>
          </div>

          {/* Key Privacy Highlights Box */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Lock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Zero Model Training</p>
                <p className="text-[11px] text-slate-500">Your inputs are never used to train public AI models.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Server className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Encrypted Storage</p>
                <p className="text-[11px] text-slate-500">AES-256 encryption at rest and TLS 1.3 in transit.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <UserCheck className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">You Own Your Data</p>
                <p className="text-[11px] text-slate-500">Export or delete your CRM records and documents anytime.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs space-y-8">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">1</span>
              Information We Collect
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-8">
              <p>
                We collect information necessary to provide you with our local service copilot capabilities, manage subscription accounts, and deliver personalized AI business tools:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>Account & Identity Information:</strong> Name, work email address, company name, business address, phone number, and authentication tokens.</li>
                <li><strong>Business Operational Data:</strong> Customer CRM contacts, proposals, line-item pricing, invoice details, and local SEO keywords you input into Locora AI.</li>
                <li><strong>AI Prompt & Context History:</strong> Text prompts submitted to Locora AI Copilot to generate marketing plans, schemas, or customer communications.</li>
                <li><strong>Technical & Usage Data:</strong> IP address, browser type, operating system, and feature engagement telemetry used to maintain application performance.</li>
              </ul>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">2</span>
              How We Use Your Information
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-8">
              <p>Locora AI uses your data strictly for legitimate operational purposes:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>To generate custom proposals, local SEO schemas, invoice PDFs, and automated CRM records.</li>
                <li>To process subscription billing, manage tax calculations, and issue transaction receipts via our Merchant of Record (Paddle).</li>
                <li>To send transactional emails, account notifications, and weekly AI prompt dispatches if you have subscribed to Locora Growth Dispatch.</li>
                <li>To detect, prevent, and mitigate fraud, technical issues, or security breaches.</li>
              </ul>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">3</span>
              AI Model Processing & Confidentiality
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-8">
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Strict Server-Side AI Execution Guarantee</span>
                </div>
                <p className="text-xs leading-relaxed text-emerald-800">
                  All AI Copilot queries are executed through secure, enterprise-grade server-side APIs (Google Gemini API). Your inputs, prompts, customer details, and business financials are processed ephemerally and are <strong>NEVER used to train foundational AI models</strong>.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">4</span>
              Third-Party Service Providers
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-8">
              <p>We do not sell, rent, or trade your personal data. We share data only with trusted infrastructure subprocessors required to operate our service:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>Paddle:</strong> Functions as our global Merchant of Record to handle PCI-DSS compliant credit card processing, subscription billing cycles, and regional sales tax remittance.</li>
                <li><strong>Google Cloud Platform & Firebase:</strong> Provides secure database storage, serverless hosting, and encrypted backups.</li>
              </ul>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">5</span>
              Your Data Rights & Control
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-8">
              <p>Under applicable data protection laws (including GDPR and CCPA), you maintain full control over your business records:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>Access & Export:</strong> Download complete CSV/JSON backups of your CRM contacts, invoices, and proposals from your settings page.</li>
                <li><strong>Correction:</strong> Update your profile and business information at any time.</li>
                <li><strong>Deletion & Account Closure:</strong> Request complete erasure of your account and associated business records by contacting our privacy team.</li>
                <li><strong>Newsletter Unsubscribe:</strong> Every weekly dispatch email includes a 1-click unsubscribe link.</li>
                <li>
                  <strong>Cookie Consent & Preferences:</strong> You can adjust or revoke your cookie settings at any time by clicking{' '}
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open_cookie_settings'))}
                    className="text-[#059669] font-bold underline hover:text-[#047857] cursor-pointer"
                  >
                    Open Cookie Settings
                  </button>.
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">6</span>
              Contact Privacy Team
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8 space-y-3">
              <p>If you have any questions, concerns, or data requests regarding this Privacy Policy, please contact us:</p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a
                  href="mailto:support@locoraai.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#059669]" />
                  <span>Email: support@locoraai.com</span>
                </a>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>Contact Sales & Support</span>
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
