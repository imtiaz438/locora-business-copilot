import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { openWhopOneTimeCheckout } from '../lib/whopService';
import {
  Flame,
  Award,
  Database,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Download,
  FileCheck2,
  Zap,
  Users,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { WhiteLabelAuditExportModal } from './WhiteLabelAuditExportModal';

interface OneTimeOffersSectionProps {
  compact?: boolean;
  className?: string;
}

export const OneTimeOffersSection: React.FC<OneTimeOffersSectionProps> = ({
  compact = false,
  className = '',
}) => {
  const { user, setActiveTab, setFuelPackModalOpen, setAuthModalOpen } = useApp();
  const [showWhiteLabelModal, setShowWhiteLabelModal] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handleBuyMasterclass = async () => {
    setPurchasingId('masterclass');
    try {
      await openWhopOneTimeCheckout({
        productType: 'masterclass_kit',
        price: 97,
        email: user.email || 'customer@example.com',
        name: user.name,
        userId: user.id,
        onError: (err) => {
          console.warn('Agency Launch Kit checkout notice:', err);
        },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPurchasingId(null);
    }
  };

  const storeItems = [
    {
      id: 'ai_actions',
      badge: 'Action Fuel',
      title: 'One-Time AI Action Packs',
      tagline: 'Fuel your Business Brain with on-demand execution actions. Never expire.',
      price: '$5',
      priceSuffix: 'starts at · One-time',
      icon: Flame,
      iconBg: 'bg-emerald-600 text-white',
      accentBorder: 'border-emerald-200 hover:border-emerald-400',
      highlights: [
        'Starter: 50 AI Actions ($5.00)',
        'Growth: 150 AI Actions ($12.00)',
        'Power: 500 AI Actions ($29.00)',
        'Zero monthly commitment — use anytime',
      ],
      ctaText: 'Get Action Pack',
      onAction: () => {
        if (user.isAuthenticated) {
          setFuelPackModalOpen(true);
        } else {
          setAuthModalOpen(true);
        }
      },
      popular: false,
    },
    {
      id: 'business_audit',
      badge: 'Executive Diagnostic',
      title: 'One-Time Business Audit',
      tagline: 'Deep technical, local SEO, reputation & AI visibility diagnostic report.',
      price: user.planTier === 'agency' ? 'FREE' : '$19',
      priceSuffix: user.planTier === 'agency' ? 'Included in Agency' : '($29 White-Label) · One-time',
      icon: Award,
      iconBg: 'bg-slate-900 text-white',
      accentBorder: 'border-slate-200 hover:border-slate-400',
      highlights: [
        'Local SEO & Google Maps opportunity score',
        'Competitor review velocity & service gap analysis',
        'AI Search Visibility diagnosis (ChatGPT / Perplexity)',
        'Prioritized action roadmap & downloadable PDF',
      ],
      ctaText: user.planTier === 'agency' ? 'Generate Client PDF' : 'Get Deep Audit ($19)',
      onAction: () => setShowWhiteLabelModal(true),
      popular: true,
    },
    {
      id: 'lead_vault',
      badge: 'B2B Opportunities',
      title: 'AI-Qualified Local Lead Packs',
      tagline: 'Verified local businesses with measured digital gaps ready for outreach.',
      price: '$29',
      priceSuffix: 'starts at · One-time',
      icon: Database,
      iconBg: 'bg-indigo-600 text-white',
      accentBorder: 'border-indigo-200 hover:border-indigo-400',
      highlights: [
        '250 Leads ($29) · 500 ($49) · 1,000 ($89)',
        'Includes phone, category, and verified website',
        'Pre-scanned SEO weakness & estimated revenue gap',
        '1-Click outreach campaign generation in CRM',
      ],
      ctaText: 'Access Lead Packs',
      onAction: () => {
        setActiveTab('lead_prospector');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      popular: false,
    },
    {
      id: 'agency_kit',
      badge: 'Agency Launch OS',
      title: 'Locora Agency Launch Kit',
      tagline: 'Complete operating system, SOWs, sales scripts & retainer templates.',
      price: '$97',
      priceSuffix: 'Lifetime Access · One-time',
      icon: GraduationCap,
      iconBg: 'bg-amber-600 text-white',
      accentBorder: 'border-amber-200 hover:border-amber-400',
      highlights: [
        'High-closing proposal & retainer SOW templates',
        'Cold email & audit outreach scripts with 40%+ reply rate',
        'Agency pricing calculator & onboarding checklists',
        'Client monthly executive reporting SOPs',
      ],
      ctaText: purchasingId === 'masterclass' ? 'Connecting...' : 'Get Agency Kit ($97)',
      onAction: handleBuyMasterclass,
      popular: false,
    },
  ];

  return (
    <div className={`space-y-8 font-sans ${className}`}>
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-semibold font-heading uppercase tracking-wider">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Locora Growth Store</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
          One-Time Upgrades & Growth Add-Ons
        </h3>
        <p className="text-xs sm:text-sm text-slate-600">
          Need extra AI execution fuel, an executive client audit, or curated local leads? Add what you need without changing your plan.
        </p>
      </div>

      {/* Cards Grid */}
      <div className={`grid grid-cols-1 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6`}>
        {storeItems.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between relative shadow-2xs hover:shadow-md ${item.accentBorder} ${
                item.popular ? 'ring-2 ring-[#059669]/20' : ''
              }`}
            >
              {item.popular && (
                <div className="absolute -top-3 left-6 px-2.5 py-0.5 bg-[#059669] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-xs">
                  Most Requested
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.iconBg}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading">
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold font-heading text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {item.tagline}
                  </p>
                </div>

                <div className="pt-1">
                  <span className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                    {item.price}
                  </span>
                  <span className="text-[11px] text-slate-500 ml-1 font-medium">
                    {item.priceSuffix}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {item.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                      <span className="leading-tight">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={item.onAction}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer font-sans ${
                    item.popular
                      ? 'bg-[#059669] hover:bg-[#047857] text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <span>{item.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showWhiteLabelModal && (
        <WhiteLabelAuditExportModal
          isOpen={showWhiteLabelModal}
          onClose={() => setShowWhiteLabelModal(false)}
        />
      )}
    </div>
  );
};
