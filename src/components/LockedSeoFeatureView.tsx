import React from 'react';
import {
  Lock,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  TrendingUp,
  Bot,
  Layers,
  Award,
} from 'lucide-react';

interface LockedSeoFeatureViewProps {
  title: string;
  description: string;
  badgeLabel?: string;
  onUpgradePro: () => void;
  onUpgradeAgency: () => void;
  onGoToTechnicalAudit?: () => void;
  unlockedDomain?: string;
  onSwitchToUnlockedDomain?: () => void;
}

export const LockedSeoFeatureView: React.FC<LockedSeoFeatureViewProps> = ({
  title,
  description,
  badgeLabel = 'PRO & AGENCY ONLY',
  onUpgradePro,
  onUpgradeAgency,
  onGoToTechnicalAudit,
  unlockedDomain,
  onSwitchToUnlockedDomain,
}) => {
  return (
    <div className="space-y-6">
      {/* Main Hero Paywall Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                  {badgeLabel}
                </span>
                <span className="text-xs text-slate-400 font-medium">· Locked in Free Mode</span>
              </div>
              <h3 className="text-xl font-bold font-heading text-slate-900 tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={onUpgradePro}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Unlock with Pro ($29/mo)</span>
            </button>
            <button
              onClick={onUpgradeAgency}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Agency Elite ($99/mo)</span>
            </button>
          </div>
        </div>

        {/* Feature Comparison Grid: Free vs Paid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Free Mode Details */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-heading">Free Mode Capabilities</h4>
                <p className="text-[11px] text-slate-500">Always free, zero credit consumption</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ACTIVE
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">Technical SEO Audit Overview:</span>
                  <span className="text-slate-600 ml-1">Live HTML crawl, TTFB latency, meta tags, and headers.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">Google Lighthouse Recs:</span>
                  <span className="text-slate-600 ml-1">7 actionable technical SEO fixes for Core Web Vitals.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">Schema & JSON-LD Validation:</span>
                  <span className="text-slate-600 ml-1">Structured data inspection and rich snippet readiness.</span>
                </div>
              </li>
              <li className="flex items-start gap-2 opacity-60">
                <XCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="line-through text-slate-500">Live DataForSEO Keyword Matrices:</span>
                  <span className="text-slate-400 ml-1">Locked in Free mode (0 lookups).</span>
                </div>
              </li>
              <li className="flex items-start gap-2 opacity-60">
                <XCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="line-through text-slate-500">Live Backlinks & Referring Domains:</span>
                  <span className="text-slate-400 ml-1">Locked in Free mode.</span>
                </div>
              </li>
              <li className="flex items-start gap-2 opacity-60">
                <XCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="line-through text-slate-500">Multi-Model AI Visibility Citations:</span>
                  <span className="text-slate-400 ml-1">Locked in Free mode.</span>
                </div>
              </li>
            </ul>

            {onSwitchToUnlockedDomain && unlockedDomain && (
              <button
                onClick={onSwitchToUnlockedDomain}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>Switch to your Unlocked Free Domain ({unlockedDomain})</span>
              </button>
            )}

            {onGoToTechnicalAudit && (
              <button
                onClick={onGoToTechnicalAudit}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>View Free Technical SEO Overview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Pro & Agency Elite Benefits */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-emerald-950 font-heading">Pro & Agency Elite Analytics</h4>
                <p className="text-[11px] text-emerald-800">Direct live integration via DataForSEO & SerpApi</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                LIVE API
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-emerald-950">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">700-Keyword Batch Volume & CPCs:</span>
                  <span className="text-emerald-900/80 ml-1">Target keyword volume, commercial intent, and ranking distribution.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Live Backlink Authority Profiles:</span>
                  <span className="text-emerald-900/80 ml-1">Referring domains, dofollow/nofollow ratio, spam scores, and anchor texts.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Google AI Overview Presence:</span>
                  <span className="text-emerald-900/80 ml-1">Verify whether your domain is cited inside Google generative snapshots.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Multi-Model AI Visibility Tracking:</span>
                  <span className="text-emerald-900/80 ml-1">Automated brand mention checks across ChatGPT, Claude, Gemini, and Perplexity.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Weighted Cost Metering:</span>
                  <span className="text-emerald-900/80 ml-1">100 to 1,000 monthly weighted lookup units with zero surprise overages.</span>
                </div>
              </li>
            </ul>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={onUpgradePro}
                className="w-full py-2.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Upgrade to Pro Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
