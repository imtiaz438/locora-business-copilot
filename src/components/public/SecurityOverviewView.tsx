import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, ArrowLeft, Lock, Key, Server, Database, CheckCircle2, Cpu, Globe, Zap, AlertTriangle } from 'lucide-react';

export const SecurityOverviewView: React.FC = () => {
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
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Security Status: Operational
          </span>
        </div>

        {/* Page Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Enterprise Grade Security</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
              Locora AI Security & Compliance Overview
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              Locora AI is engineered from the ground up to protect local business data, client CRM pipelines, and revenue operations with multi-layered encryption, isolated API proxies, and strict access controls.
            </p>
          </div>

          {/* Compliance Certification Badges */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
              <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-slate-900">SOC 2 Type II</p>
              <p className="text-[10px] text-slate-500">Security & Privacy</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
              <Lock className="w-6 h-6 text-indigo-600 mx-auto" />
              <p className="text-xs font-bold text-slate-900">AES-256 / TLS 1.3</p>
              <p className="text-[10px] text-slate-500">Bank-Level Encryption</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
              <Key className="w-6 h-6 text-sky-600 mx-auto" />
              <p className="text-xs font-bold text-slate-900">PCI-DSS Level 1</p>
              <p className="text-[10px] text-slate-500">Stripe Billing Security</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
              <Globe className="w-6 h-6 text-amber-600 mx-auto" />
              <p className="text-xs font-bold text-slate-900">99.9% Uptime SLA</p>
              <p className="text-[10px] text-slate-500">Google Cloud Infra</p>
            </div>
          </div>
        </div>

        {/* Security Architecture Grid */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs space-y-8">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#059669] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h2 className="text-xl font-bold font-heading text-slate-900">
                Server-Side API Key Isolation & AI Safety
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-11">
              <p>
                Locora AI strictly adheres to full-stack architecture principles. Secret API keys (such as Google Gemini API keys) are stored securely in server-side environment configurations and are <strong>never exposed to client browser network tabs</strong>.
              </p>
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero Direct Client SDK Calls</span>
                </div>
                <p className="text-xs leading-relaxed text-emerald-800">
                  All requests pass through validated Express server endpoints (`/api/*`), enforcing authentication checks, rate limiting, and sanitization before communicating with LLM providers.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="text-xl font-bold font-heading text-slate-900">
                Data Encryption (At Rest & In Transit)
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-11">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    <span>Encryption In Transit</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All web traffic to and from Locora AI is enforced via TLS 1.3 with HTTP Strict Transport Security (HSTS), securing passwords and API payloads.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span>Encryption At Rest</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Database storage (Google Cloud Firestore / Cloud SQL) encrypts data on disk using AES-256 bit encryption keys managed by Cloud KMS.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h2 className="text-xl font-bold font-heading text-slate-900">
                Payment Security & PCI-DSS Compliance
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-11">
              <p>
                Locora AI integrates directly with <strong>Stripe</strong> for all credit card transactions, plan upgrades, and recurring billing.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Zero payment card details (PANs, CVVs, expiration dates) ever touch or pass through Locora servers.</li>
                <li>All checkout sessions run on Stripe's PCI-DSS Level 1 certified infrastructure.</li>
                <li>Webhook signatures are verified cryptographically before processing plan updates.</li>
              </ul>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h2 className="text-xl font-bold font-heading text-slate-900">
                Infrastructure Reliability & Automated Backups
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 pl-11">
              <p>
                Locora AI is hosted across multi-region Cloud Run containerized clusters with automated horizontal scaling, health probes, and redundant database replication.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <p className="font-bold text-slate-900 mb-1">DDoS Mitigation</p>
                  <p className="text-[11px] text-slate-500">Automated rate-limiting & Cloud Armor protection.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <p className="font-bold text-slate-900 mb-1">Daily DB Snapshots</p>
                  <p className="text-[11px] text-slate-500">Point-in-time recovery for business proposals & CRM data.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <p className="font-bold text-slate-900 mb-1">Audit Telemetry</p>
                  <p className="text-[11px] text-slate-500">Comprehensive system event logs for security monitoring.</p>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                5
              </div>
              <h2 className="text-xl font-bold font-heading text-slate-900">
                Vulnerability Disclosure & Security Contact
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-11 space-y-3">
              <p>
                If you believe you have discovered a potential security vulnerability in Locora AI, we encourage you to report it to our security response team promptly.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('contact')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Report Security Issue or Contact Team</span>
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
