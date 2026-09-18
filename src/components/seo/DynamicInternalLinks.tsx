import React from 'react';
import { MapPin, Tag, Building2, ChevronRight, Compass } from 'lucide-react';
import type { InternalLinkItem, BreadcrumbItem, CompletePageSeoResult } from '../../lib/seo/types';

export interface DynamicInternalLinksProps {
  breadcrumbs?: BreadcrumbItem[];
  links?: InternalLinkItem[];
  seoResult?: CompletePageSeoResult;
  mode?: 'bottom_nav' | 'detailed_grid';
  currentCity?: string;
  currentCategory?: string;
  onNavigate?: (path: string) => void;
}

export const DynamicInternalLinks: React.FC<DynamicInternalLinksProps> = ({
  breadcrumbs: propsBreadcrumbs,
  links: propsLinks,
  seoResult,
  mode = 'detailed_grid',
  currentCity: propsCity,
  currentCategory: propsCategory,
  onNavigate,
}) => {
  const breadcrumbs = propsBreadcrumbs || seoResult?.breadcrumbs || [];
  const links = propsLinks || seoResult?.internalLinks || [];
  const currentCity = propsCity || seoResult?.context.city;
  const currentCategory = propsCategory || seoResult?.context.category;
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
  };

  const cityCategoryLinks = links.filter((l) => l.type === 'city_category');
  const cityLinks = links.filter((l) => l.type === 'city');
  const categoryLinks = links.filter((l) => l.type === 'category');
  const businessLinks = links.filter((l) => l.type === 'business');

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 my-8 space-y-6">
      {/* Breadcrumb Trail */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs text-slate-400">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.path}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
              {idx === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-slate-200" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <a
                  href={crumb.path}
                  onClick={(e) => handleLinkClick(e, crumb.path)}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {crumb.label}
                </a>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Related Real Directory Entities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 border-t border-slate-800/60">
        {/* City + Category Specific Combos */}
        {cityCategoryLinks.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              {currentCity ? `Services in ${currentCity}` : 'Related Services'}
            </h4>
            <div className="flex flex-col gap-2">
              {cityCategoryLinks.slice(0, 6).map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-xs text-slate-300 hover:text-emerald-400 flex items-center justify-between group transition-colors"
                >
                  <span className="group-hover:underline truncate">{link.title}</span>
                  {link.count !== undefined && (
                    <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded ml-2">
                      {link.count}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Cities */}
        {cityLinks.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              {currentCategory ? `${currentCategory} by City` : 'Explore Cities'}
            </h4>
            <div className="flex flex-col gap-2">
              {cityLinks.slice(0, 6).map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-xs text-slate-300 hover:text-blue-400 flex items-center justify-between group transition-colors"
                >
                  <span className="group-hover:underline truncate">{link.title}</span>
                  {link.count !== undefined && (
                    <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded ml-2">
                      {link.count}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Categories or Related Businesses */}
        {(categoryLinks.length > 0 || businessLinks.length > 0) && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              {businessLinks.length > 0 ? (
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Tag className="w-3.5 h-3.5 text-purple-400" />
              )}
              {businessLinks.length > 0 ? 'Nearby Verified Businesses' : 'Service Categories'}
            </h4>
            <div className="flex flex-col gap-2">
              {(businessLinks.length > 0 ? businessLinks : categoryLinks).slice(0, 6).map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-xs text-slate-300 hover:text-amber-400 flex items-center justify-between group transition-colors"
                >
                  <span className="group-hover:underline truncate">{link.title}</span>
                  {link.count !== undefined && (
                    <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded ml-2">
                      {link.count}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
