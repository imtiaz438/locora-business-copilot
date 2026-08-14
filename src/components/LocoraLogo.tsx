import React from 'react';
import { useApp } from '../context/AppContext';
import { CustomLogoConfig } from '../types';

export interface LocoraLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'emerald' | 'white' | 'light' | 'dark';
  style?: React.CSSProperties;
  fillColor?: string;
  accentColor?: string;
  assetType?: 'header' | 'favicon' | 'hero' | 'auth';
  allowEdit?: boolean;
  isUserDoc?: boolean; // When true, uses user's custom business logo for invoices/proposals/reports
}

/**
 * LocoraLogo: Displays platform site logo configured via Admin Portal or default Locora brand lockup.
 * When isUserDoc=true, renders user's custom business logo for white-label invoices, proposals, and reports.
 */
export const LocoraLogo: React.FC<LocoraLogoProps> = ({
  className = '',
  size,
  variant = 'emerald',
  style,
  assetType = 'header',
  isUserDoc = false,
}) => {
  const { businessProfile, user, settings } = useApp();

  // If this is a user document (Invoices, Proposals, SEO Audit Reports), render user's business brand logo
  if (isUserDoc) {
    const isProOrElite = user?.planTier === 'pro' || user?.planTier === 'elite';

    // Free plan users get default Locora AI branding on invoices & reports
    if (!isProOrElite) {
      return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white font-extrabold rounded-xl text-xs font-heading shadow-2xs ${className}`}>
          <div className="w-5 h-5 rounded-md bg-[#059669] text-white font-black flex items-center justify-center text-[10px]">
            L
          </div>
          <span>{businessProfile?.name || user?.companyName || 'Business Workspace'}</span>
          <span className="text-[10px] font-mono text-emerald-400 font-normal border-l border-slate-700 pl-2">
            Locora Verified
          </span>
        </div>
      );
    }

    // Pro and Elite Subscribers get full white-label custom logo support
    const config: CustomLogoConfig = businessProfile?.logoConfig || {
      url: businessProfile?.logoUrl || '',
      format: 'svg',
      height: 44,
      alignment: 'left',
      padding: 'compact',
      bgStyle: 'transparent',
      fit: 'contain',
    };

    const logoUrl = config.url || businessProfile?.logoUrl || '';
    const height = size ? (typeof size === 'number' ? `${size}px` : size) : `${config.height || 44}px`;

    if (logoUrl) {
      return (
        <div className={`inline-flex items-center shrink-0 ${className}`}>
          <img
            src={logoUrl}
            alt={businessProfile?.name || 'Business Logo'}
            className="object-contain select-none max-w-full"
            style={{ height, width: 'auto', ...style }}
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }

    const bizName = businessProfile?.name || user?.companyName || 'Your Business Name';
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-[#059669] text-white font-extrabold rounded-xl text-sm font-heading ${className}`}>
        <span>{bizName}</span>
      </div>
    );
  }

  // DEFAULT: Website Site Logo (Controlled strictly by Platform/Admin settings, NEVER user business profile)
  const siteLogoConfig = settings?.siteLogoConfig;
  const siteLogoUrl = settings?.siteLogoUrl || siteLogoConfig?.url;

  let assetUrl = siteLogoUrl || '';
  let assetHeight = siteLogoConfig?.height || 40;
  let bgStyle = siteLogoConfig?.bgStyle || 'transparent';
  let padding = siteLogoConfig?.padding || 'compact';
  let fit = siteLogoConfig?.fit || 'contain';

  if (assetType === 'favicon') {
    assetUrl = siteLogoConfig?.faviconUrl || assetUrl;
    assetHeight = 24;
    padding = 'none';
  } else if (assetType === 'hero' && siteLogoConfig?.heroIconConfig) {
    const heroCfg = siteLogoConfig.heroIconConfig;
    if (heroCfg.url) assetUrl = heroCfg.url;
    if (heroCfg.height) assetHeight = heroCfg.height;
    if (heroCfg.bgStyle) bgStyle = heroCfg.bgStyle;
    if (heroCfg.padding) padding = heroCfg.padding;
    if (heroCfg.fit) fit = heroCfg.fit;
  } else if (assetType === 'auth' && siteLogoConfig?.authLogoConfig) {
    const authCfg = siteLogoConfig.authLogoConfig;
    if (authCfg.url) assetUrl = authCfg.url;
    if (authCfg.height) assetHeight = authCfg.height;
    if (authCfg.bgStyle) bgStyle = authCfg.bgStyle;
    if (authCfg.padding) padding = authCfg.padding;
    if (authCfg.fit) fit = authCfg.fit;
  }

  const effectiveHeight = size
    ? typeof size === 'number'
      ? `${size}px`
      : size
    : `${assetHeight}px`;

  const bgStyleClass =
    bgStyle === 'light'
      ? 'bg-white border border-slate-200/90 shadow-2xs rounded-xl'
      : bgStyle === 'dark'
      ? 'bg-slate-900 border border-slate-800 shadow-sm text-white rounded-xl'
      : bgStyle === 'glass'
      ? 'bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-2xs'
      : variant === 'dark'
      ? 'bg-slate-900/60 border border-slate-800/80 rounded-xl'
      : '';

  const paddingClass =
    padding === 'compact'
      ? 'p-1'
      : padding === 'normal'
      ? 'p-2'
      : padding === 'spacious'
      ? 'p-3.5'
      : 'p-0';

  if (assetUrl) {
    return (
      <div className={`inline-flex items-center shrink-0 ${bgStyleClass} ${paddingClass}`}>
        <img
          src={assetUrl}
          alt="Locora AI"
          className={`object-contain select-none shrink-0 ${className}`}
          style={{
            height: effectiveHeight,
            width: 'auto',
            objectFit: fit,
            ...style,
          }}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Standard Locora Site Brand lockup fallback
  const textColor =
    variant === 'dark' || variant === 'white'
      ? 'text-white'
      : 'text-slate-900';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`} style={style}>
      <div
        className="flex items-center justify-center rounded-xl bg-gradient-to-br from-[#059669] to-[#047857] text-white font-black font-heading shadow-xs shrink-0"
        style={{
          width: typeof size === 'number' ? `${size}px` : size || `${assetHeight}px`,
          height: typeof size === 'number' ? `${size}px` : size || `${assetHeight}px`,
          fontSize: typeof size === 'number' ? Number(size) * 0.45 : '18px',
        }}
      >
        <span>L</span>
      </div>
      <div className="flex items-center gap-1 font-heading font-extrabold text-base tracking-tight">
        <span className={textColor}>Locora</span>
        <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-[#059669] text-[11px] font-mono font-bold uppercase tracking-wider">
          AI
        </span>
      </div>
    </div>
  );
};

export default LocoraLogo;
