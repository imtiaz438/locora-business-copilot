import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Zap, Sparkles, Check, ArrowRight, ShieldCheck, Flame, CreditCard, X, AlertCircle } from 'lucide-react';
import { openWhopOneTimeCheckout } from '../lib/whopService';

export interface FuelPackOption {
  id: 'fuel_50' | 'fuel_150' | 'fuel_500';
  name: string;
  credits: number;
  price: number;
  pricePerCredit: string;
  badge?: string;
  description: string;
  popular?: boolean;
}

export const FUEL_PACKS: FuelPackOption[] = [
  {
    id: 'fuel_50',
    name: 'Starter Boost',
    credits: 50,
    price: 5,
    pricePerCredit: '$0.10 / credit',
    description: 'Instant top-up for 10-15 proposals, SEO audits, and custom client documents.',
  },
  {
    id: 'fuel_150',
    name: 'Pro Pitch Pack',
    credits: 150,
    price: 12,
    pricePerCredit: '$0.08 / credit',
    badge: 'MOST POPULAR',
    popular: true,
    description: 'Complete high-stakes marketing campaigns and agency client audits without subscription.',
  },
  {
    id: 'fuel_500',
    name: 'Agency Power Bundle',
    credits: 500,
    price: 35,
    pricePerCredit: '$0.07 / credit',
    badge: 'BEST VALUE (SAVE 30%)',
    description: 'Bulk capacity for continuous client pitches, full website audits, and deep AI generation.',
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialReason?: string;
}

export const FuelPackModal: React.FC<Props> = ({ isOpen, onClose, initialReason }) => {
  const { user, updateUser, logActivity, setAuthModalOpen } = useApp();
  const [selectedPack, setSelectedPack] = useState<FuelPackOption>(FUEL_PACKS[1]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchaseFuelPack = async () => {
    if (!user.isAuthenticated) {
      onClose();
      setAuthModalOpen(true);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const userEmail = user.email || 'customer@example.com';
    const userName = user.name || userEmail.split('@')[0];

    try {
      // Initiate Whop checkout for this one-time purchase
      const checkoutResult = await openWhopOneTimeCheckout({
        productType: 'fuel_pack',
        packId: selectedPack.id,
        credits: selectedPack.credits,
        price: selectedPack.price,
        email: userEmail,
        name: userName,
        userId: user.id,
        onError: (err) => setErrorMessage(err),
      });

      if (checkoutResult.checkoutUrl) {
        logActivity(
          'payment',
          `Fuel Pack Checkout Launched (${selectedPack.name})`,
          `Opened Whop checkout for ${selectedPack.credits} AI Copilot credits ($${selectedPack.price}).`
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initiate checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="fuel_pack_modal_overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fadeIn font-sans"
    >
      <div
        id="fuel_pack_modal_container"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white backdrop-blur-xs shadow-inner">
                <Flame className="w-6 h-6 text-amber-200 fill-amber-300" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/20 text-amber-200 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>No Monthly Commitment • Instant Fuel</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white">
                  Top-Up AI Copilot Fuel Packs
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-amber-100/90 mt-3 font-sans max-w-xl">
            {initialReason || 'Hit your monthly limit or need immediate credits to complete client proposals? Top up on-demand with no recurring fees.'}
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Current Credit Balance Info */}
          <div className="flex items-center justify-between p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-amber-900 font-bold">
                  {user.isAuthenticated ? 'Your Current Balance' : 'Instant Activation Upon Purchase'}
                </p>
                <p className="text-[11px] text-amber-700">
                  {user.isAuthenticated
                    ? `${user.monthlyAiCredits - (user.aiCreditsUsed || 0)} available credits (${user.planTier.toUpperCase()} Plan)`
                    : 'Sign in to link credits to your workspace profile'}
                </p>
              </div>
            </div>
            <div className="text-right">
              {user.isAuthenticated ? (
                <span className="text-xs font-extrabold text-amber-900 bg-amber-200/70 px-3 py-1 rounded-full">
                  Credits Never Expire
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setAuthModalOpen(true);
                  }}
                  className="text-xs font-bold text-amber-900 underline hover:text-amber-950 cursor-pointer"
                >
                  Sign In First →
                </button>
              )}
            </div>
          </div>

          {/* Fuel Pack Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FUEL_PACKS.map((pack) => {
              const isSelected = selectedPack.id === pack.id;
              return (
                <div
                  key={pack.id}
                  onClick={() => setSelectedPack(pack)}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/40 ring-4 ring-amber-500/15 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 shadow-xs'
                  }`}
                >
                  {pack.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                      {pack.badge}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black font-heading text-slate-900">{pack.name}</h3>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1 pt-1">
                      <span className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                        +{pack.credits}
                      </span>
                      <span className="text-xs font-bold text-amber-700">Credits</span>
                    </div>

                    <p className="text-xs text-slate-500 font-sans leading-relaxed">
                      {pack.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-black text-slate-900">${pack.price}</span>
                      <span className="text-[10px] text-slate-400 font-medium"> one-time</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{pack.pricePerCredit}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Security & Action Bar */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-sans">
              <ShieldCheck className="w-4 h-4 text-[#059669]" />
              <span>Secure checkout via Whop • Instant activation</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer w-full sm:w-auto text-center"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePurchaseFuelPack}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {isProcessing ? 'Connecting...' : `Purchase +${selectedPack.credits} Credits ($${selectedPack.price})`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
