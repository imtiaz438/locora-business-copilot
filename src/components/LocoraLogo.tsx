import React, { useState, useEffect } from 'react';
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
 * LocoraLogo: Displays platform site logo configured via Admin Portal / Settings,
 * or default Locora brand lockup.
 * Always renders the uploaded logo across the entire site, dashboard, and invoices/reports.
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
  const [imageError, setImageError] = useState(false);

  // Read local cache immediately to prevent flash of default logo on cold page refresh
  const getCachedLogo = () => {
    if (typeof window === 'undefined') return null;
    try {
      const cachedSite = localStorage.getItem('locora_site_logo');
      const cachedProfile = localStorage.getItem('locora_business_profile_logo');
      return isUserDoc ? (cachedProfile || cachedSite) : (cachedSite || cachedProfile);
    } catch {
      return null;
    }
  };

  const cachedLogoUrl = getCachedLogo();

  // Reset image error if logo URL changes
  useEffect(() => {
    setImageError(false);
  }, [
    settings?.siteLogoUrl,
    settings?.siteLogoConfig?.url,
    businessProfile?.logoUrl,
    businessProfile?.logoConfig?.url,
  ]);

  // If this is a user document (Invoices, Proposals, SEO Audit Reports)
  if (isUserDoc) {
    const config: CustomLogoConfig = businessProfile?.logoConfig || {
      url: businessProfile?.logoUrl || settings?.siteLogoConfig?.url || settings?.siteLogoUrl || cachedLogoUrl || '',
      format: 'svg',
      height: 44,
      alignment: 'left',
      padding: 'compact',
      bgStyle: 'transparent',
      fit: 'contain',
    };

    const logoUrl =
      config.url ||
      businessProfile?.logoUrl ||
      settings?.siteLogoConfig?.url ||
      settings?.siteLogoUrl ||
      cachedLogoUrl ||
      '';

    const height = size
      ? typeof size === 'number'
        ? `${size}px`
        : size
      : `${config.height || 44}px`;

    if (logoUrl && !imageError) {
      return (
        <div className={`inline-flex items-center shrink-0 ${className}`}>
          <img
            src={logoUrl}
            alt={businessProfile?.name || user?.companyName || 'Business Logo'}
            className="object-contain select-none max-w-full"
            style={{ height, width: 'auto', maxHeight: '100%', ...style }}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
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

  // DEFAULT: Platform & Website Site Logo
  const siteLogoConfig = settings?.siteLogoConfig;
  const siteLogoUrl =
    settings?.siteLogoUrl ||
    siteLogoConfig?.url ||
    businessProfile?.logoUrl ||
    businessProfile?.logoConfig?.url ||
    cachedLogoUrl;

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

  if (assetUrl && !imageError) {
    return (
      <div className={`inline-flex items-center shrink-0 ${bgStyleClass} ${paddingClass}`}>
        <img
          src={assetUrl}
          alt="Locora Logo"
          className={`object-contain select-none shrink-0 ${className}`}
          style={{
            height: effectiveHeight,
            width: 'auto',
            maxHeight: '100%',
            objectFit: fit,
            ...style,
          }}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
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
