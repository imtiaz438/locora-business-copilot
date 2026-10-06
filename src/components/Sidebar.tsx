import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { creditsForPlan, remainingCredits, creditsUsedPercent } from '../lib/credits';
import { LocoraLogo } from './LocoraLogo';
import { navigateToMain, navigateToDirectory, getDirectorySiteUrl } from '../utils/domain';
import {
  Home,
  LayoutDashboard,
  Bot,
  Brain,
  TrendingUp,
  MapPin,
  Star,
  Crosshair,
  FileText,
  Users,
  Briefcase,
  BarChart3,
  Building2,
  Settings,
  CreditCard,
  ShieldCheck,
  Zap,
  Lock,
  Database,
  X,
  Sparkles,
  Globe,
  ExternalLink,
  Compass,
  Linkedin,
  Facebook,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  requiredPlan?: 'pro' | 'agency';
}

const SIDEBAR_COLLAPSED_KEY = 'locora.sidebarCollapsed';

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  const { activeTab, setActiveTab, activeBusiness, businessProfile, user } = useApp();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [hovered, setHovered] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      } catch {}
      return next;
    });
    setHovered(false);
  };

  // 11 Simplified Dashboard Modules requested:
  // HOME, AI MANAGER, GROWTH, LOCAL VISIBILITY, REPUTATION, CONTENT, CUSTOMERS, WORK, REPORTS, CLIENTS, SETTINGS
  const primaryNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'ai_manager', label: 'AI Manager', icon: Bot, badge: 'Copilot' },
    { id: 'growth', label: 'Growth', icon: TrendingUp },
    { id: 'visibility', label: 'Local Visibility', icon: MapPin },
    { id: 'seo', label: 'SEO Audit', icon: Globe },
    {
      id: 'reputation',
      label: 'Reputation',
      icon: Star,
      badge: (activeBusiness?.unansweredReviews && activeBusiness.unansweredReviews > 0)
        ? `${activeBusiness.unansweredReviews} Pending`
        : undefined,
    },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'work', label: 'Work', icon: Briefcase },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'clients', label: 'Agency Clients', icon: Building2, badge: 'Agency', requiredPlan: 'agency' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (onMobileClose) onMobileClose();
  };

  const isNavActive = (id: string) => {
    if (id === 'dashboard') return activeTab === 'dashboard';
    if (activeTab === id) return true;
    if (id === 'business' && (activeTab === 'business' || activeTab === 'business_profile' || activeTab === 'business_locations' || activeTab === 'business_directory' || activeTab === 'business_brain')) return true;
    if (id === 'ai_manager' && activeTab === 'chat') return true;
    if (id === 'growth' && (activeTab === 'marketing' || activeTab === 'marketing_planner')) return true;
    if (id === 'visibility' && (activeTab === 'local_seo' || activeTab === 'seo_schema' || activeTab === 'competitors')) return true;
    if (id === 'seo' && (activeTab === 'seo' || activeTab === 'audit' || activeTab === 'website_review' || activeTab === 'seo_audit')) return true;
    if (id === 'content' && (activeTab === 'content' || activeTab === 'documents' || activeTab === 'content_drafts')) return true;
    if (id === 'customers' && (activeTab === 'crm' || activeTab === 'lead_prospector' || activeTab === 'lead_vault')) return true;
    if (id === 'work' && (activeTab === 'invoices' || activeTab === 'proposals' || activeTab === 'projects')) return true;
    if (id === 'reports' && (activeTab === 'reports' || activeTab === 'growth_report' || activeTab === 'monthly_report')) return true;
    return false;
  };

  const isAdminUser =
    user.isAuthenticated &&
    (user.role === 'admin' ||
      user.role === 'owner' ||
      user.email === 'imtiazbaloch3322@gmail.com' ||
      user.email === 'support@locoraai.com');

  const renderNav = (expanded: boolean) => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none font-sans text-slate-800 overflow-hidden">
      {/* Brand Header + Collapse Toggle */}
      <div className={`p-4 border-b border-slate-200 flex items-center ${expanded ? 'justify-between' : 'flex-col gap-2 justify-center'}`}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleNavClick('dashboard')}
          onKeyDown={(e) => e.key === 'Enter' && handleNavClick('dashboard')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
          title="Dashboard"
        >
          <LocoraLogo
            className="w-10 h-10 flex-shrink-0 group-hover:scale-105 transition-transform"
          />
          {expanded && (
            <span className="text-sm font-semibold text-slate-900 tracking-tight whitespace-nowrap">Locora</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleCollapsed}
            className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Business Workspace Badge with Subdomain Indicator */}
      {expanded && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold text-slate-900 truncate">
                {businessProfile.name || 'My Workspace'}
              </p>
            </div>
            <p className="text-[10px] text-slate-500 font-mono truncate">
              Workspace • {user.planTier.toUpperCase()}
            </p>
          </div>
          <button
            onClick={() => handleNavClick('subscription')}
            className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors uppercase cursor-pointer"
          >
            {user.planTier}
          </button>
        </div>
      )}

      {/* Main Nav Items */}
      <nav className={`flex-1 overflow-y-auto py-3 space-y-4 ${expanded ? 'px-3' : 'px-2'}`}>
        <div className="space-y-1">
          {expanded && (
            <div className="px-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              AI Business OS
            </div>
          )}
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isNavActive(item.id);

            const isLocked =
              !(user.role === 'admin' || user.role === 'owner' || user.email === 'imtiazbaloch3322@gmail.com' || user.email === 'support@locoraai.com') &&
              ((item.requiredPlan === 'pro' && user.planTier === 'free') ||
              (item.requiredPlan === 'agency' && (user.planTier === 'free' || user.planTier === 'pro')));

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={expanded ? undefined : item.label}
                className={`w-full flex items-center rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  expanded ? 'justify-between px-3 py-2.5' : 'justify-center px-0 py-2.5'
                } ${
                  isActive
                    ? 'bg-[#059669] text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className={`flex items-center ${expanded ? 'gap-2.5' : ''}`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {expanded && <span className="whitespace-nowrap">{item.label}</span>}
                </div>

                {expanded && (
                  <div className="flex items-center gap-1">
                    {isLocked && (
                      <span className="p-0.5 rounded text-amber-600 bg-amber-50 border border-amber-200" title="Pro Plan Feature">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                    {item.badge && !isLocked && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-emerald-800 text-emerald-100'
                            : item.badge.includes('Needs')
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Visual Divider & Profile / Billing */}
        <div className="pt-3 border-t border-slate-200 space-y-1">
          {expanded && (
            <div className="px-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Public Presence
            </div>
          )}

          <div
            title={expanded ? undefined : 'Locora Directory'}
            className={`w-full flex items-center rounded-xl text-xs font-medium transition-all duration-150 ${
              expanded ? 'justify-between px-3 py-2.5' : 'justify-center px-0 py-2.5'
            } ${
              activeTab === 'directory' || activeTab.startsWith('directory_')
                ? 'bg-[#059669] text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <button
              onClick={() => {
                navigateToDirectory('/', () => {
                  window.history.pushState({}, '', '/directory');
                  handleNavClick('directory');
                });
              }}
              className={`flex items-center ${expanded ? 'gap-2.5 flex-1 text-left' : ''} cursor-pointer`}
              title="Navigate to Locora Public Directory"
            >
              <Compass className={`w-4 h-4 ${activeTab === 'directory' || activeTab.startsWith('directory_') ? 'text-white' : 'text-emerald-600'}`} />
              {expanded && <span className="whitespace-nowrap">Locora Directory</span>}
            </button>
            {expanded && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live
                </span>
                <a
                  href={getDirectorySiteUrl('/')}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open live directory site in new tab"
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Account & Billing */}
        <div className="pt-3 border-t border-slate-200 space-y-1">
          {expanded && (
            <div className="px-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Account & Billing
            </div>
          )}

          <button
            onClick={() => handleNavClick('subscription')}
            title={expanded ? undefined : 'Subscription & Billing'}
            className={`w-full flex items-center rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
              expanded ? 'justify-between px-3 py-2.5' : 'justify-center px-0 py-2.5'
            } ${
              activeTab === 'subscription' || activeTab === 'pricing'
                ? 'bg-[#059669] text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className={`flex items-center ${expanded ? 'gap-2.5' : ''}`}>
              <CreditCard className={`w-4 h-4 ${activeTab === 'subscription' ? 'text-white' : 'text-slate-500'}`} />
              {expanded && <span className="whitespace-nowrap">Subscription & Billing</span>}
            </div>
            {expanded && user.planTier === 'free' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5" />
                <span>Upgrade</span>
              </span>
            )}
          </button>

          {/* Admin Portal (Admin / Owner ONLY) */}
          {isAdminUser && (
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              title={expanded ? undefined : 'Admin Control Panel'}
              className={`w-full flex items-center rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                expanded ? 'justify-between px-3 py-2.5' : 'justify-center px-0 py-2.5'
              } ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-emerald-400 font-semibold shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className={`flex items-center ${expanded ? 'gap-2.5' : ''}`}>
                <ShieldCheck className={`w-4 h-4 ${activeTab === 'admin' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                {expanded && <span className="whitespace-nowrap">Admin Control Panel</span>}
              </div>
              {expanded && (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-emerald-100 text-emerald-800">
                  Admin
                </span>
              )}
            </button>
          )}

          {/* Switch to Public Site Link */}
          <button
            onClick={() => navigateToMain('/', () => handleNavClick('home'))}
            title={expanded ? 'Go to Locora Public Website (locoraai.com)' : 'Public Site'}
            className={`w-full flex items-center rounded-xl text-xs font-medium text-slate-600 hover:text-[#059669] hover:bg-emerald-50/60 transition-all cursor-pointer group ${
              expanded ? 'justify-between px-3 py-2' : 'justify-center px-0 py-2'
            }`}
          >
            <div className={`flex items-center ${expanded ? 'gap-2' : ''}`}>
              <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#059669] transition-colors" />
              {expanded && <span className="whitespace-nowrap">Public Site</span>}
            </div>
            {expanded && <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#059669] transition-colors" />}
          </button>

          {/* Plan & Credits Summary Widget */}
          <div className="pt-2">
            {expanded ? (
              <div
                onClick={() => handleNavClick('subscription')}
                className="p-3 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800 uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#059669]" />
                    <span>{user.planTier} Plan</span>
                  </span>
                  <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                    {user.planTier === 'agency' ? 'Unlimited' : `${remainingCredits(user.monthlyAiCredits || creditsForPlan(user.planTier, !user.email), user.aiCreditsUsed || 0)} cr`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#059669] rounded-full transition-all duration-300"
                    style={{
                      width: `${user.planTier === 'agency' ? 100 : creditsUsedPercent(user.monthlyAiCredits || creditsForPlan(user.planTier, !user.email), user.aiCreditsUsed || 0)}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('subscription')}
                title={`${user.planTier} plan — ${user.planTier === 'agency' ? 'Unlimited' : `${remainingCredits(user.monthlyAiCredits || creditsForPlan(user.planTier, !user.email), user.aiCreditsUsed || 0)} credits left`}`}
                className="w-full flex items-center justify-center p-2.5 rounded-xl text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
              >
                <Zap className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* User Footer Account Link */}
      <div className={`p-3 border-t border-slate-200 bg-slate-50 ${expanded ? 'space-y-2' : ''}`}>
        <button
          onClick={() => handleNavClick('settings')}
          title={expanded ? undefined : `${user.name || 'Workspace Account'} — ${user.email || ''}`}
          className={`w-full flex items-center rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors cursor-pointer ${
            expanded ? 'justify-between p-2' : 'justify-center p-2'
          }`}
        >
          <div className={`flex items-center ${expanded ? 'gap-2 overflow-hidden' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            {expanded && (
              <div className="overflow-hidden text-left">
                <p className="font-semibold text-slate-900 truncate text-[11px]">{user.name || 'Workspace Account'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email || 'Free Workspace'}</p>
              </div>
            )}
          </div>
        </button>

        {/* Locora Official Social Links */}
        {expanded && (
          <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-500 font-medium">
            <a
              href="https://www.linkedin.com/company/locoracopilot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#0077B5] transition-colors"
              title="Locora on LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5 text-[#0077B5]" />
              <span>LinkedIn</span>
            </a>
            <span className="text-slate-300">•</span>
            <a
              href="https://www.facebook.com/people/Locora-AI/61593321283379/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#1877F2] transition-colors"
              title="Locora on Facebook"
            >
              <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
              <span>Facebook</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );

  const desktopExpanded = !collapsed || hovered;
  const hoverOverlay = collapsed && hovered;

  return (
    <>
      {/* Desktop Sidebar — collapsible icon rail, expands on hover as an overlay */}
      <aside
        className={`hidden md:block h-screen sticky top-0 z-40 flex-shrink-0 transition-[width] duration-200 ease-in-out ${
          collapsed ? 'w-[68px]' : 'w-64'
        }`}
        onMouseEnter={() => {
          if (collapsed) setHovered(true);
        }}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className={
            hoverOverlay
              ? 'absolute inset-y-0 left-0 w-64 z-50 shadow-2xl'
              : 'h-full w-full'
          }
        >
          {renderNav(desktopExpanded)}
        </div>
      </aside>

      {/* Mobile Slide-over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative flex-1 max-w-xs w-full bg-white h-full z-10 shadow-2xl">
            {renderNav(true)}
          </div>
        </div>
      )}
    </>
  );
};
