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
  const { user, setActiveTab, setFuelPackModalOpen } = useApp();
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
          console.warn('Masterclass checkout notice:', err);
        },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPurchasingId(null);
    }
  };

  const offers = [
    {
      id: 'fuel_packs',
      phaseBadge: 'Phase 1 · Instant Velocity',
      title: 'AI Copilot Fuel Packs',
      tagline: 'On-demand AI credits for proposals, audits & copy with zero monthly commitment.',
      price: '$5',
      priceSuffix: 'starts at · One-time',
      icon: Flame,
      iconBg: 'bg-orange-500 text-white',
      accentBorder: 'border-orange-200 hover:border-orange-400',
      highlights: [
        'Starter: +50 AI Credits ($5.00)',
        'Growth: +120 AI Credits ($10.00)',
        'Agency Power: +300 AI Credits ($22.00)',
        'Credits NEVER expire — top up as needed',
      ],
      ctaText: 'Top-Up Credits',
      onAction: () => setFuelPackModalOpen(true),
      popular: false,
    },
    {
      id: 'white_label_audit',
      phaseBadge: 'Phase 2 · Agency Deliverable',
      title: 'White-Label Client PDF Audit',
      tagline: '40-point technical, SEO & performance audit with your agency logo and client notes.',
      price: user.planTier === 'agency' ? 'FREE' : '$9.99',
      priceSuffix: user.planTier === 'agency' ? 'Included in Agency' : 'per report · One-time',
      icon: Award,
      iconBg: 'bg-indigo-600 text-white',
      accentBorder: 'border-indigo-200 hover:border-indigo-400',
      highlights: [
        '40-Point Deep Technical & SEO evaluation',
        'Custom Agency Logo & Brand Colors',
        'Estimated Client Revenue Loss calculation',
        'Print-ready, pixel-perfect executive PDF',
      ],
      ctaText: user.planTier === 'agency' ? 'Generate Free PDF' : 'Create Branded Audit',
      onAction: () => setShowWhiteLabelModal(true),
      popular: false,
    },
    {
      id: 'lead_vault',
      phaseBadge: 'Phase 3 · Pipeline Booster',
      title: 'Verified B2B Lead Lists',
      tagline: 'Targeted local business leads filtered by niche, city, and high-ticket digital flaws.',
      price: '$29',
      priceSuffix: 'starts at · One-time',
      icon: Database,
      iconBg: 'bg-emerald-600 text-white',
      accentBorder: 'border-emerald-200 hover:border-emerald-400',
      highlights: [
        '250 Verified Local Leads ($29.00)',
        '500 Verified Local Leads ($49.00 - Best Value)',
        '1,000 Agency Pipeline Leads ($89.00)',
        'Verified phone, site, SEO score & revenue gap',
      ],
      ctaText: 'Explore Lead Vault',
      onAction: () => {
        if (user.isAuthenticated) {
          setActiveTab('lead_prospector');
        } else {
          setActiveTab('signup');
        }
      },
      popular: true,
    },
    {
      id: 'masterclass_kit',
      phaseBadge: 'Phase 4 · Growth Accelerator',
      title: '$5k/mo Agency Growth Kit',
      tagline: 'Proven retainer contracts, cold outbound DM scripts, pitch decks, and video masterclass.',
      price: '$97',
      priceSuffix: 'one-time · Lifetime Access',
      icon: GraduationCap,
      iconBg: 'bg-purple-600 text-white',
      accentBorder: 'border-purple-200 hover:border-purple-400',
      highlights: [
        '5-Module Video & SOP Masterclass',
        '3-Tier Client Retainer SOW Contract templates',
        'Tested Cold Email & LinkedIn Outbound sequences',
        '40-Point Pitch Deck & Profit Margin Calculator',
      ],
      ctaText: purchasingId === 'masterclass' ? 'Opening Whop...' : 'Get Agency Kit ($97)',
      onAction: () => {
        if (user.isAuthenticated) {
          setActiveTab('masterclass_kit');
        } else {
          handleBuyMasterclass();
        }
      },
      popular: false,
    },
  ];

  return (
    <div className={`space-y-8 font-sans ${className}`}>
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-emerald-400 text-xs font-bold font-heading uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>À La Carte & Growth Products</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
          One-Time Upgrades & Growth Assets
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
          Need extra AI fuel, client-ready deliverables, verified B2B prospect lists, or agency retainer systems? Grab them once with no recurring subscriptions required.
        </p>
      </div>

      {/* Grid of 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {offers.map((offer) => {
          const Icon = offer.icon;
          return (
            <div
              key={offer.id}
              className={`bg-white border ${offer.accentBorder} rounded-3xl p-6 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all relative space-y-6`}
            >
              {offer.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-black uppercase px-3 py-0.5 rounded-full shadow-2xs tracking-wider">
                  HIGH CONVERTING
                </span>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl ${offer.iconBg} flex items-center justify-center shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-heading">
                    {offer.phaseBadge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold font-heading text-slate-900">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">
                    {offer.tagline}
                  </p>
                </div>

                <div className="pt-1 font-heading border-t border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">{offer.price}</span>
                    <span className="text-[11px] text-slate-500 font-sans font-medium">
                      {offer.priceSuffix}
                    </span>
                  </div>
                </div>

                {/* Highlights List */}
                <div className="space-y-2 pt-2 text-xs font-sans text-slate-600">
                  {offer.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={offer.onAction}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <span>{offer.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-700 text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <p className="font-sans">
            <strong>Secure Whop Merchant-of-Record Checkout:</strong> Instant delivery of credits, PDF reports, lead downloads, and masterclass playbooks. 100% satisfaction guarantee.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('contact')}
          className="text-xs font-bold text-slate-900 hover:text-emerald-700 underline shrink-0 cursor-pointer"
        >
          Have custom enterprise questions? Talk to us
        </button>
      </div>

      {/* White-Label Audit Modal */}
      {showWhiteLabelModal && (
        <WhiteLabelAuditExportModal
          isOpen={showWhiteLabelModal}
          onClose={() => setShowWhiteLabelModal(false)}
        />
      )}
    </div>
  );
};
