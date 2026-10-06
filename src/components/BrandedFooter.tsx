import React from 'react';
import { useApp } from '../context/AppContext';
import { LocoraLogo } from './LocoraLogo';

interface BrandedFooterProps {
  className?: string;
}

export const BrandedFooter: React.FC<BrandedFooterProps> = ({ className = '' }) => {
  const { user } = useApp();

  // White-label feature flag: hide Locora footer on Pro Growth and Agency Elite paid subscriber plans
  if (user.planTier === 'pro' || user.planTier === 'agency' || user.planTier === 'elite') {
    return null;
  }

  return (
    <div className={`pt-6 pb-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-sans ${className}`}>
      <div className="flex items-center gap-2 font-medium">
        <LocoraLogo className="w-4 h-4" fillColor="#059669" accentColor="#ffffff" />
        <span>Powered by <strong className="text-slate-800 font-bold font-heading">Locora AI</strong> Business Copilot</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <a
          href="https://www.linkedin.com/company/locoracopilot"
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-2 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          title="LinkedIn"
        >
          LinkedIn
        </a>
        <span className="text-slate-300">•</span>
        <a
          href="https://www.facebook.com/profile.php?id=61593321283379"
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-2 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          title="Facebook"
        >
          Facebook
        </a>
      </div>
    </div>
  );
};

