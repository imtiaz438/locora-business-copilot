import React from 'react';
import {
  Star,
  Crosshair,
  Users,
  Search,
  FileText,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export type EmptyStateType = 'reviews' | 'competitors' | 'customers' | 'opportunities' | 'pages';

interface EmptyStateProps {
  type: EmptyStateType;
  onAction?: () => void;
  customTitle?: string;
  customDescription?: string;
  customButtonLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onAction,
  customTitle,
  customDescription,
  customButtonLabel,
}) => {
  // Configurations strictly fulfilling Section 34 specifications:
  const config = {
    reviews: {
      icon: Star,
      iconColor: 'text-amber-500 bg-amber-50 border-amber-200',
      title: 'No review data yet',
      description: 'Connect your Google Business Profile to start monitoring reviews.',
      buttonText: 'Connect Google',
    },
    competitors: {
      icon: Crosshair,
      iconColor: 'text-rose-500 bg-rose-50 border-rose-200',
      title: 'No competitors configured',
      description: 'Locora can discover relevant local competitors.',
      buttonText: 'Find Competitors',
    },
    customers: {
      icon: Users,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      title: 'No customers yet.',
      description: 'Add your first lead or connect an existing source.',
      buttonText: 'Add Lead',
    },
    opportunities: {
      icon: Sparkles,
      iconColor: 'text-purple-600 bg-purple-50 border-purple-200',
      title: 'No opportunities yet.',
      description: 'Run an autonomous scan of your local digital footprint to find untapped growth vectors.',
      buttonText: 'Run Market Scan',
    },
    pages: {
      icon: FileText,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
      title: 'No service pages created',
      description: 'Generate high-converting local service landing pages targeting your city keywords.',
      buttonText: 'Create Service Page',
    },
  }[type];

  const Icon = config.icon;
  const title = customTitle || config.title;
  const description = customDescription || config.description;
  const buttonText = customButtonLabel || config.buttonText;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-2xs font-sans">
      <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border ${config.iconColor} shadow-2xs`}>
        <Icon className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-heading tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {onAction && (
        <div className="pt-2">
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm transition-all cursor-pointer font-heading"
          >
            <span>{buttonText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <p className="text-[10px] text-slate-400 font-mono">
        Zero fake data • Live data connection required
      </p>
    </div>
  );
};
