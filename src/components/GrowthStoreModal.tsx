import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  Zap,
  FileSearch,
  Building,
  Users,
  Award,
  Check,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';

interface GrowthStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrowthStoreModal: React.FC<GrowthStoreModalProps> = ({ isOpen, onClose }) => {
  const { logActivity, user, updateUser } = useApp();
  const [purchasedItem, setPurchasedItem] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBuy = (title: string, price: string, creditsToAdd: number = 50) => {
    setPurchasedItem(title);
    if (updateUser && user) {
      updateUser({
        monthlyAiCredits: (user.monthlyAiCredits || 250) + creditsToAdd,
      });
    }
    logActivity('store_purchase', `Activated ${title}`, `Successfully added ${creditsToAdd} actions to workspace.`);
    setTimeout(() => {
      setPurchasedItem(null);
      onClose();
    }, 1600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-scaleUp my-auto max-h-[90vh] flex flex-col">
        {/* Header strictly mirroring Section 40 */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#059669] flex items-center justify-center font-bold shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider font-heading px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                In-App Growth Store
              </span>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                Need something extra?
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-xl cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store Catalog (Section 40 spec) */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* 1. AI Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
                AI Actions (Pay-As-You-Go Packs)
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { count: '50 actions', price: '$5', desc: 'Quick boost' },
                { count: '150 actions', price: '$12', desc: 'Most Popular', highlight: true },
                { count: '500 actions', price: '$29', desc: 'Agency heavy duty' },
              ].map((tier, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    tier.highlight
                      ? 'border-[#059669] bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 font-heading">{tier.count}</span>
                    <span className="text-sm font-black text-[#059669] font-heading">{tier.price}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{tier.desc}</p>
                  <button
                    onClick={() => handleBuy(tier.count, tier.price)}
                    className="w-full mt-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Add to Account
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* 2. Business Audit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-2xs shrink-0">
                <FileSearch className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 font-heading">Business Audit</h4>
                <p className="text-xs text-slate-500">
                  One-time comprehensive local market, GBP & technical SEO deep audit report.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-base font-black text-slate-900 font-heading">$19</span>
              <button
                onClick={() => handleBuy('Business Audit', '$19')}
                className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold cursor-pointer"
              >
                Buy Audit
              </button>
            </div>
          </div>

          {/* 3. Agency White-Label Audit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-purple-600 shadow-2xs shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 font-heading">Agency White-Label Report</h4>
                <p className="text-xs text-slate-500">
                  Custom client-ready PDF report branded with your agency logo and custom domain.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-base font-black text-slate-900 font-heading">$29<span className="text-[10px] font-normal text-slate-400">/report</span></span>
              <button
                onClick={() => handleBuy('White-label audit', '$29')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
              >
                Order Report
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* 4. Lead Data */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
                Verified Local B2B Lead Data
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { count: '250 leads', price: '$29' },
                { count: '500 leads', price: '$49' },
                { count: '1,000 leads', price: '$89' },
              ].map((lead, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 font-heading">{lead.count}</span>
                    <span className="text-sm font-black text-[#059669] font-heading">{lead.price}</span>
                  </div>
                  <button
                    onClick={() => handleBuy(lead.count, lead.price)}
                    className="w-full mt-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Unlock Leads
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Agency Launch Kit */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-heading">
                  Lifetime Value Asset
                </span>
                <h4 className="text-sm font-bold font-heading text-white">Agency Launch Kit</h4>
                <p className="text-xs text-slate-300">
                  Full agency contracts, SOPs, pitch decks, client intake scripts & onboarding blueprints.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-lg font-black font-heading text-white">$97</span>
                <span className="block text-[10px] text-emerald-300">Lifetime</span>
              </div>
              <button
                onClick={() => handleBuy('Agency Launch Kit', '$97')}
                className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-extrabold cursor-pointer shadow-sm"
              >
                Get Launch Kit
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>The recurring subscription remains your core software tier</span>
          {purchasedItem && (
            <span className="text-xs font-bold text-[#059669] animate-pulse">
              ✓ Successfully added {purchasedItem}!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
