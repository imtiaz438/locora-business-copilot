import React from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, ArrowRight } from 'lucide-react';
import { LocoraLogo } from '../LocoraLogo';

export const AboutView: React.FC = () => {
  const { setActiveTab } = useApp();

  const team = [
    {
      name: 'Bilal Ahsan',
      role: 'Partner & Security Head',
      bio: 'Expert in Enterprise Security Cloud Operations with building Locora AI.',
      avatar: 'BA',
    },
    {
      name: 'Imtiaz Baloch',
      role: 'Head of Product & CEO',
      bio: ' Data production Engineer specializing in local schema graphs and LLM prompt optimization.',
      avatar: 'IB',
    },
    {
      name: 'Marcus Sterling',
      role: 'VP of Customer Success',
      bio: '10+ years advising local service franchises and digital marketing agencies across North America.',
      avatar: 'MS',
    },
    {
      name: 'Priya Sharma',
      role: 'Lead Full-Stack Architect',
      bio: 'Specialist in cloud containerized React engines and multi-provider AI SDK integrations.',
      avatar: 'PS',
    },
  ];

  return (
    <div className="space-y-16 py-12 px-6 max-w-7xl mx-auto font-sans bg-slate-50 text-slate-900">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-semibold font-heading uppercase tracking-wider">
          <Building2 className="w-4 h-4 text-[#059669]" />
          <span>Our Story & Mission</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-slate-900 tracking-tight">
          Democratizing Enterprise AI for Local Businesses
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
          Locora AI was built with a clear purpose: eliminate administrative friction for local business owners and growth agencies so they can focus on closing deals and serving customers.
        </p>
      </div>

      {/* Story & Vision Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="space-y-4">
          <LocoraLogo className="w-14 h-14 flex-shrink-0 drop-shadow-xs" />
          <h2 className="text-2xl font-bold font-heading text-slate-900">Why We Built Locora AI</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            In 2024, our founders ran a digital growth agency in Austin, Texas. Every week, our account managers spent 20+ hours manually drafting proposals, creating Google Business schema markup, copying client invoices, and assembling PDF strategy roadmaps.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            Existing software was either too complex, fragmented across 6 expensive subscriptions, or produced generic AI gibberish. We built Locora AI to combine multi-model AI accuracy with crisp, white-label client operations.
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold font-heading text-slate-900 uppercase tracking-wider">
            Our Core Operating Pillars
          </h3>

          <div className="space-y-3 font-sans">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#059669] border border-emerald-200 flex items-center justify-center flex-shrink-0 font-bold text-xs font-heading">
                1
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Speed & Simplicity First</p>
                <p className="text-[11px] text-slate-500">Generates structured client assets in under 3 seconds.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#059669] border border-emerald-200 flex items-center justify-center flex-shrink-0 font-bold text-xs font-heading">
                2
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Strict Privacy & Security</p>
                <p className="text-[11px] text-slate-500">Client CRM records are never used to train public LLM models.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#059669] border border-emerald-200 flex items-center justify-center flex-shrink-0 font-bold text-xs font-heading">
                3
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Measurable Revenue Impact</p>
                <p className="text-[11px] text-slate-500">Every feature is designed to increase proposal win rates and client retention.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Team */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900">Meet Our Leadership Team</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans">
            Backed by agency veterans and AI engineers passionate about local commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-3 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto font-black text-base shadow-xs font-heading">
                {member.avatar}
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading text-slate-900">{member.name}</h3>
                <p className="text-[11px] text-[#059669] font-bold font-sans">{member.role}</p>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Headquarters Location */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-6 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-2 font-sans">
          <h2 className="text-2xl font-bold font-heading text-slate-900">Locora AI Headquarters</h2>
          <p className="text-xs text-slate-600">
            Operating from our central headquarters to power local service businesses and agencies globally.
          </p>
        </div>

        <div className="max-w-md mx-auto p-5 bg-slate-50 rounded-2xl border border-slate-200 font-sans text-center">
          <p className="text-sm font-bold text-slate-900">Locora AI Headquarters</p>
          <p className="text-xs text-slate-600 mt-1">100 Innovation Way, Suite 400</p>
          <p className="text-xs text-slate-600">San Francisco, CA 94105</p>
        </div>

        <button
          onClick={() => setActiveTab('contact')}
          className="px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer font-sans"
        >
          <span>Get in Touch with Our Team</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
