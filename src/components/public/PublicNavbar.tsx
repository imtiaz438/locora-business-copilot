import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  Menu,
  X,
  LayoutDashboard,
  LogIn,
  LogOut,
  ChevronDown,
  Sparkles,
  Search,
  MapPin,
  Star,
  Shield,
  Building,
  Users,
  Compass,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { LocoraLogo } from '../LocoraLogo';
import { navigateToApp } from '../../utils/domain';

export const PublicNavbar: React.FC = () => {
  const { activeTab, setActiveTab, user, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'product' | 'solutions' | 'resources' | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateTo = (tab: string, path: string, hash?: string) => {
    window.history.pushState({}, '', path);
    setActiveTab(tab);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav ref={navRef} className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo Lockup */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => navigateTo('home', '/')}
          onKeyDown={(e) => e.key === 'Enter' && navigateTo('home', '/')}
          className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
        >
          <LocoraLogo className="w-12 h-12 flex-shrink-0 group-hover:scale-105 transition-transform duration-200" />
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-full border border-slate-200/80">
          {/* HOME LINK */}
          <button
            onClick={() => navigateTo('home', '/')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Home
          </button>

          {/* PRODUCT DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'product' ? null : 'product')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'products' || openDropdown === 'product'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <span>Products</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'product' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'product' && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 space-y-1 animate-in fade-in-50 zoom-in-95">
                <button
                  onClick={() => navigateTo('products', '/products')}
                  className="w-full text-left p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 transition-colors flex items-start gap-3 cursor-pointer group border border-emerald-200/60"
                >
                  <div className="p-2 bg-[#059669] rounded-lg text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-heading flex items-center gap-1.5">
                      <span>Explore All Products</span>
                      <ArrowRight className="w-3 h-3 text-[#059669]" />
                    </div>
                    <div className="text-[11px] text-slate-600">The complete 8-engine AI operating suite</div>
                  </div>
                </button>

                <button
                  onClick={() => navigateTo('products', '/products', 'ai-manager')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 bg-emerald-100 rounded-lg text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-heading">AI Business Manager</div>
                    <div className="text-[11px] text-slate-500">Autonomous growth recommendations & action items</div>
                  </div>
                </button>

                <button
                  onClick={() => navigateTo('products', '/products', 'local-seo')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 bg-emerald-100 rounded-lg text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-heading">Local SEO Copilot</div>
                    <div className="text-[11px] text-slate-500">Google Maps ranking, service pages & schemas</div>
                  </div>
                </button>

                <button
                  onClick={() => navigateTo('products', '/products', 'ai-visibility')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 bg-emerald-100 rounded-lg text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-heading">AI Search Visibility</div>
                    <div className="text-[11px] text-slate-500">Track mentions in ChatGPT, Perplexity & Copilot</div>
                  </div>
                </button>

                <button
                  onClick={() => navigateTo('products', '/products', 'reputation')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 bg-emerald-100 rounded-lg text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-heading">AI Reputation Manager</div>
                    <div className="text-[11px] text-slate-500">Reviews into customer insights & marketing</div>
                  </div>
                </button>

                <button
                  onClick={() => navigateTo('products', '/products', 'competitors')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 bg-emerald-100 rounded-lg text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-heading">Competitor Intelligence</div>
                    <div className="text-[11px] text-slate-500">Spot gaps in rankings, services and reviews</div>
                  </div>
                </button>

                <button
                  onClick={() => navigateTo('products', '/products', 'for-agencies')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 bg-emerald-100 rounded-lg text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-heading">Agency AI Client Manager</div>
                    <div className="text-[11px] text-slate-500">Multi-location and client retainer management</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* SOLUTIONS DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'solutions' ? null : 'solutions')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                openDropdown === 'solutions'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <span>Solutions</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'solutions' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'solutions' && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 space-y-1 animate-in fade-in-50 zoom-in-95">
                <button
                  onClick={() => navigateTo('home', '/', 'small-business')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 bg-emerald-100 rounded-lg text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-heading">Small Business Owners</div>
                    <div className="text-[11px] text-slate-500">More customers with zero technical headache</div>
                  </div>
                </button>

                <button
                  onClick={() => navigateTo('home', '/', 'for-agencies')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 bg-emerald-100 rounded-lg text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-heading">Local SEO Agencies</div>
                    <div className="text-[11px] text-slate-500">AI Client Manager for 10-100+ accounts</div>
                  </div>
                </button>

                <button
                  onClick={() => navigateTo('industry_pseo', '/for/dentists')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 bg-emerald-100 rounded-lg text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-heading">Industry Blueprints</div>
                    <div className="text-[11px] text-slate-500">Dental, HVAC, Legal, Roofing & Clinics</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* RESOURCES DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'resources' ? null : 'resources')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                openDropdown === 'resources'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <span>Resources</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'resources' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'resources' && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 space-y-1 animate-in fade-in-50 zoom-in-95">
                <button
                  onClick={() => navigateTo('resources', '/resources')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 bg-emerald-100 rounded-lg text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-heading">Guides & Tutorials</div>
                    <div className="text-[11px] text-slate-500">Step-by-step local growth strategies</div>
                  </div>
                </button>

                <button
                  onClick={() => navigateTo('use-cases', '/use-cases')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-start gap-3 cursor-pointer group"
                >
                  <div className="p-2 bg-emerald-100 rounded-lg text-[#059669] group-hover:bg-[#059669] group-hover:text-white transition-colors">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-heading">Case Studies</div>
                    <div className="text-[11px] text-slate-500">Verified revenue & ranking outcomes</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* DIRECTORY LINK */}
          <button
            onClick={() => navigateTo('directory', '/directory')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'directory' || activeTab.startsWith('directory_')
                ? 'bg-[#059669] text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Directory
          </button>

          {/* PRICING LINK */}
          <button
            onClick={() => navigateTo('pricing_public', '/pricing')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'pricing_public' || activeTab === 'pricing'
                ? 'bg-[#059669] text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            Pricing
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          {user.isAuthenticated ? (
            <>
              <button
                onClick={() => navigateToApp('/dashboard', () => navigateTo('dashboard', '/dashboard'))}
                className="px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer font-sans"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Launch App</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  navigateTo('home', '/');
                }}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-sans"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigateToApp('/login', () => navigateTo('login', '/login'))}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer font-sans"
              >
                <LogIn className="w-3.5 h-3.5 text-[#059669]" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => navigateTo('home', '/', 'hero-input')}
                className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer font-sans group"
              >
                <span>Analyze My Business</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-3 font-sans">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigateTo('home', '/')}
              className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-emerald-50 text-[#059669]'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigateTo('products', '/products')}
              className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                activeTab === 'products'
                  ? 'bg-emerald-50 text-[#059669]'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Products (All 8 Engines)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Explore</span>
            </button>
            <button
              onClick={() => navigateTo('products', '/products', 'ai-manager')}
              className="text-left px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 pl-6"
            >
              · AI Business Manager
            </button>
            <button
              onClick={() => navigateTo('products', '/products', 'local-seo')}
              className="text-left px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 pl-6"
            >
              · Local SEO & Maps Copilot
            </button>
            <button
              onClick={() => navigateTo('products', '/products', 'ai-visibility')}
              className="text-left px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 pl-6"
            >
              · AI Search Visibility (GEO)
            </button>
            <button
              onClick={() => navigateTo('products', '/products', 'reputation')}
              className="text-left px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 pl-6"
            >
              · AI Reputation & Reviews
            </button>
            <button
              onClick={() => navigateTo('products', '/products', 'competitors')}
              className="text-left px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 pl-6"
            >
              · Competitor Radar
            </button>
            <button
              onClick={() => navigateTo('directory', '/directory')}
              className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                activeTab === 'directory' || activeTab.startsWith('directory_')
                  ? 'bg-emerald-50 text-[#059669]'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Local Business Directory</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Live</span>
            </button>
            <button
              onClick={() => navigateTo('pricing_public', '/pricing')}
              className="text-left px-4 py-2.5 rounded-xl text-xs font-bold text-[#059669] hover:bg-emerald-50"
            >
              Pricing ($0 Free / $29 Pro / $99 Agency)
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
            {user.isAuthenticated ? (
              <button
                onClick={() => navigateToApp('/dashboard', () => navigateTo('dashboard', '/dashboard'))}
                className="w-full py-3 bg-[#059669] text-white font-bold text-xs rounded-xl shadow-md text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Launch App</span>
              </button>
            ) : (
              <button
                onClick={() => navigateTo('home', '/', 'hero-input')}
                className="w-full py-3 bg-[#059669] text-white font-bold text-xs rounded-xl shadow-md text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Analyze My Business — Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {!user.isAuthenticated ? (
              <button
                onClick={() => navigateToApp('/login', () => navigateTo('login', '/login'))}
                className="w-full py-2.5 bg-slate-100 text-slate-800 font-semibold text-xs rounded-xl text-center"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  navigateTo('home', '/');
                }}
                className="w-full py-2.5 bg-rose-50 text-rose-700 font-semibold text-xs rounded-xl text-center flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
