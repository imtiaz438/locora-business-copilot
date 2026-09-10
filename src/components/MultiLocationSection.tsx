import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  TrendingUp,
  Phone,
  FileText,
  Calendar,
  Star,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChevronRight,
  Building2,
  CheckCircle,
} from 'lucide-react';

export interface LocationMetricData {
  id: string;
  name: string;
  city: string;
  score: number;
  status: 'healthy' | 'improving' | 'need_attention';
  statusIcon: string;
  visibility: number; // /100
  calls: number;
  callsGrowth: string;
  forms: number;
  formsGrowth: string;
  bookings: number;
  bookingsGrowth: string;
  reviews: number;
  rating: number;
  unansweredReviews: number;
  conversionsRate: string;
  conversionRevenue: number;
}

export const MultiLocationSection: React.FC = () => {
  const { setActiveTab, activeBusiness, logActivity } = useApp();

  // Section 26 Spec:
  // Austin 84 🟢
  // Dallas 76 🟡
  // Houston 62 🔴
  // San Antonio 81 🟢
  // Every major metric filterable by location:
  // - visibility
  // - calls
  // - forms
  // - bookings
  // - reviews
  // - conversions
  const locationsData: LocationMetricData[] = [
    {
      id: 'austin',
      name: 'Austin — Central Flagship',
      city: 'Austin, TX',
      score: 84,
      status: 'healthy',
      statusIcon: '🟢',
      visibility: 84,
      calls: 142,
      callsGrowth: '+9%',
      forms: 58,
      formsGrowth: '+14%',
      bookings: 44,
      bookingsGrowth: '+12%',
      reviews: 248,
      rating: 4.9,
      unansweredReviews: 17,
      conversionsRate: '14.2%',
      conversionRevenue: 37400,
    },
    {
      id: 'dallas',
      name: 'Dallas — Uptown Branch',
      city: 'Dallas, TX',
      score: 76,
      status: 'improving',
      statusIcon: '🟡',
      visibility: 76,
      calls: 98,
      callsGrowth: '+4%',
      forms: 34,
      formsGrowth: '+6%',
      bookings: 26,
      bookingsGrowth: '+8%',
      reviews: 164,
      rating: 4.6,
      unansweredReviews: 4,
      conversionsRate: '11.4%',
      conversionRevenue: 22100,
    },
    {
      id: 'houston',
      name: 'Houston — Galleria Branch',
      city: 'Houston, TX',
      score: 62,
      status: 'need_attention',
      statusIcon: '🔴',
      visibility: 62,
      calls: 54,
      callsGrowth: '-11%',
      forms: 18,
      formsGrowth: '-8%',
      bookings: 12,
      bookingsGrowth: '-15%',
      reviews: 88,
      rating: 4.1,
      unansweredReviews: 8,
      conversionsRate: '7.2%',
      conversionRevenue: 10800,
    },
    {
      id: 'san-antonio',
      name: 'San Antonio — Medical Center',
      city: 'San Antonio, TX',
      score: 81,
      status: 'healthy',
      statusIcon: '🟢',
      visibility: 81,
      calls: 118,
      callsGrowth: '+7%',
      forms: 42,
      formsGrowth: '+9%',
      bookings: 35,
      bookingsGrowth: '+11%',
      reviews: 210,
      rating: 4.8,
      unansweredReviews: 2,
      conversionsRate: '13.1%',
      conversionRevenue: 28900,
    },
  ];

  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');

  // Calculate combined metrics when 'all' is selected
  const isAll = selectedLocationId === 'all';
  const activeLoc = locationsData.find((l) => l.id === selectedLocationId) || locationsData[0];

  const displayMetrics = isAll
    ? {
        name: 'All Locations (Combined Metro Network)',
        city: 'Texas Multi-Location Network',
        score: Math.round(locationsData.reduce((s, l) => s + l.score, 0) / locationsData.length),
        statusIcon: '🟢',
        visibility: Math.round(locationsData.reduce((s, l) => s + l.visibility, 0) / locationsData.length),
        calls: locationsData.reduce((s, l) => s + l.calls, 0),
        callsGrowth: '+8%',
        forms: locationsData.reduce((s, l) => s + l.forms, 0),
        formsGrowth: '+11%',
        bookings: locationsData.reduce((s, l) => s + l.bookings, 0),
        bookingsGrowth: '+10%',
        reviews: locationsData.reduce((s, l) => s + l.reviews, 0),
        rating: 4.7,
        unansweredReviews: locationsData.reduce((s, l) => s + l.unansweredReviews, 0),
        conversionsRate: '12.4%',
        conversionRevenue: locationsData.reduce((s, l) => s + l.conversionRevenue, 0),
      }
    : activeLoc;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6 font-sans">
      {/* Header & Location Pills (Section 26) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#059669] font-bold text-[10px] uppercase font-heading">
              Multi-Location Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">4 Active Branches</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-heading tracking-tight mt-1">
            Branch Performance & Location Intelligence
          </h3>
          <p className="text-xs text-slate-500">
            Filter every major operational metric by location to pinpoint regional growth drivers and gaps.
          </p>
        </div>

        {/* Section 26 Location Selectors:
            Austin 84 🟢
            Dallas 76 🟡
            Houston 62 🔴
            San Antonio 81 🟢
        */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
          <button
            onClick={() => setSelectedLocationId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedLocationId === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Locations
          </button>

          {locationsData.map((loc) => {
            const isSelected = selectedLocationId === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => setSelectedLocationId(loc.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-2xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span>{loc.city.split(',')[0]}</span>
                <span className="font-mono text-[11px] font-bold text-slate-700">{loc.score}</span>
                <span>{loc.statusIcon}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Location Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#059669] shadow-2xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 font-heading">{displayMetrics.name}</h4>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                Score: {displayMetrics.score}/100 {displayMetrics.statusIcon}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {displayMetrics.city} • Integrated Google Maps & Organic Tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('visibility')}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Local Visibility →
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className="px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            Create Location Page
          </button>
        </div>
      </div>

      {/* Section 26: Every major metric filterable by location:
          - visibility
          - calls
          - forms
          - bookings
          - reviews
          - conversions
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Visibility */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
            Visibility
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900 font-heading">
              {displayMetrics.visibility}/100
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
              Top 3-Pack
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Search Prominence</p>
        </div>

        {/* 2. Calls */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
            Calls
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900 font-heading">
              {displayMetrics.calls}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                displayMetrics.callsGrowth.startsWith('+')
                  ? 'text-emerald-800 bg-emerald-50'
                  : 'text-rose-700 bg-rose-50'
              }`}
            >
              {displayMetrics.callsGrowth}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Maps Click-to-Call</p>
        </div>

        {/* 3. Forms */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
            Forms
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900 font-heading">
              {displayMetrics.forms}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                displayMetrics.formsGrowth.startsWith('+')
                  ? 'text-emerald-800 bg-emerald-50'
                  : 'text-rose-700 bg-rose-50'
              }`}
            >
              {displayMetrics.formsGrowth}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Website Inquiries</p>
        </div>

        {/* 4. Bookings */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
            Bookings
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900 font-heading">
              {displayMetrics.bookings}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                displayMetrics.bookingsGrowth.startsWith('+')
                  ? 'text-emerald-800 bg-emerald-50'
                  : 'text-rose-700 bg-rose-50'
              }`}
            >
              {displayMetrics.bookingsGrowth}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Confirmed Patients</p>
        </div>

        {/* 5. Reviews */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
            Reviews
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900 font-heading">
              {displayMetrics.reviews}
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              ★ {displayMetrics.rating}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            {displayMetrics.unansweredReviews > 0 ? `${displayMetrics.unansweredReviews} unread` : '100% replied'}
          </p>
        </div>

        {/* 6. Conversions */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
            Conversions
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-emerald-950 font-heading">
              {displayMetrics.conversionsRate}
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded">
              ${(displayMetrics.conversionRevenue / 1000).toFixed(1)}k
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Lead-to-Patient Rate</p>
        </div>
      </div>
    </div>
  );
};
