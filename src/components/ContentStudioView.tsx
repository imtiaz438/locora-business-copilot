import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  Save,
  Brain,
  Share2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Search,
  Zap,
  ArrowRight,
  MapPin,
  Briefcase,
  Send,
  MessageSquare,
  Mail,
  Instagram,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

type ContentType =
  | 'google_post'
  | 'service_page'
  | 'location_page'
  | 'faq'
  | 'blog_guide'
  | 'review_response'
  | 'email'
  | 'social_post';

interface GeneratedContentOutput {
  titleTag: string;
  h1: string;
  mainValueProp: string;
  keySections: { title: string; content: string }[];
  faq: { question: string; answer: string }[];
  cta: { buttonText: string; subtext: string };
  internalLinking: { targetUrl: string; anchorText: string; reason: string }[];
  // Metrics specified in Section 17
  metrics: {
    seoScore: number;
    searchIntent: string;
    localRelevance: number;
    conversionRating: string;
  };
}

export const ContentStudioView: React.FC = () => {
  const {
    activeBusiness,
    businessProfile,
    setActiveTab,
    logActivity,
    addDocument,
  } = useApp();

  const servicesList = useMemo(() => {
    if (activeBusiness.services && activeBusiness.services.length > 0) {
      return activeBusiness.services;
    }
    const cat = activeBusiness.category || 'Professional Services';
    return [
      `${cat} Solutions`,
      `Emergency / Priority Support`,
      `Consultation & Assessment`,
      `Premium Custom Services`,
      `Preventative Maintenance`,
      `General ${cat}`,
    ];
  }, [activeBusiness]);

  const locationsList = useMemo(() => {
    const locs: string[] = [];
    if (activeBusiness.locations && activeBusiness.locations.length > 0) {
      activeBusiness.locations.forEach((l) => {
        if (l.city && !locs.includes(l.city)) locs.push(l.city);
        if (l.name && !locs.includes(l.name)) locs.push(l.name);
      });
    }
    if (activeBusiness.city && !locs.includes(activeBusiness.city)) {
      locs.push(activeBusiness.city);
    }
    if (locs.length === 0) locs.push('Metro Area', 'Downtown', 'North District');
    return locs;
  }, [activeBusiness]);

  const [selectedType, setSelectedType] = useState<ContentType>('service_page');
  const [selectedService, setSelectedService] = useState<string>(servicesList[0] || 'Core Services');
  const [selectedLocation, setSelectedLocation] = useState<string>(locationsList[0] || 'Metro Area');
  const [targetAngle, setTargetAngle] = useState<string>('Same-Day Response & Guaranteed Quality');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Default initial output dynamic to activeBusiness
  const [output, setOutput] = useState<GeneratedContentOutput>(() => {
    const sName = activeBusiness.name || 'Our Company';
    const sCity = activeBusiness.city || 'Metro Area';
    const sState = activeBusiness.state || 'TX';
    const sService = activeBusiness.services?.[0] || 'Professional Services';
    const sPhone = activeBusiness.phone || '(512) 555-0199';

    return {
      titleTag: `${sService} in ${sCity}, ${sState} | Top Rated & Same-Day | ${sName}`,
      h1: `Premier ${sService} in ${sCity}, ${sState}`,
      mainValueProp: `High-quality, reliable ${sService.toLowerCase()} tailored for lasting value, prompt turnaround, and 100% upfront pricing from ${sName}.`,
      keySections: [
        {
          title: `1. Instant Response & Dedicated Expertise`,
          content: `We understand the importance of timely service. ${sName} maintains reserved capacity specifically for urgent client needs, providing prompt dispatch and certified attention.`,
        },
        {
          title: `2. What Sets Our ${sService} Apart in ${sCity}?`,
          content: `We bring licensed professionals, modern diagnostic equipment, and honest estimates to every single project, ensuring peace of mind from start to finish.`,
        },
        {
          title: '3. Guaranteed Quality & Workmanship',
          content: `All services are executed using high-grade standards and tested protocols, delivering durable results without temporary band-aids.`,
        },
        {
          title: '4. Transparent Estimates & Simple Invoicing',
          content: `We believe in honest, clear pricing before any work starts. Flexible payment options and transparent quotes mean zero hidden fees.`,
        },
      ],
      faq: [
        {
          question: `Can I request same-day service in ${sCity}?`,
          answer: `Yes. Calling directly at ${sPhone} connects you immediately with our dispatch and consultation team for priority appointments.`,
        },
        {
          question: `How do you calculate pricing for ${sService.toLowerCase()}?`,
          answer: `We provide clear, upfront cost estimates based on your specific requirements before work commences.`,
        },
        {
          question: `Do you guarantee customer satisfaction?`,
          answer: `${sName} stands behind all work with our comprehensive client satisfaction guarantee.`,
        },
      ],
      cta: {
        buttonText: `Call ${sPhone} for Priority Booking`,
        subtext: 'Fast Response • Certified Specialists • Satisfaction Guaranteed',
      },
      internalLinking: [
        {
          targetUrl: '/services',
          anchorText: `${sService.toLowerCase()} in ${sCity}`,
          reason: 'Boosts topical authority for primary service offerings',
        },
        {
          targetUrl: '/contact',
          anchorText: `contact ${sName}`,
          reason: 'Passes link juice to high-intent conversion pathways',
        },
        {
          targetUrl: '/locations',
          anchorText: `${sCity} service center`,
          reason: 'Reinforces geo-relevance for Google Local Search',
        },
      ],
      metrics: {
        seoScore: 88,
        searchIntent: 'High (Commercial / Urgent)',
        localRelevance: 94,
        conversionRating: 'High',
      },
    };
  });

  const contentTypes: { id: ContentType; label: string; icon: React.ElementType }[] = [
    { id: 'google_post', label: 'Google Post', icon: Sparkles },
    { id: 'service_page', label: 'Service Page', icon: Briefcase },
    { id: 'location_page', label: 'Location Page', icon: MapPin },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'blog_guide', label: 'Blog/Guide', icon: BookOpen },
    { id: 'review_response', label: 'Review Response', icon: MessageSquare },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'social_post', label: 'Social Post', icon: Instagram },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setSavedSuccess(false);

    setTimeout(() => {
      setIsGenerating(false);

      const sName = activeBusiness.name || 'Our Company';
      const sPhone = activeBusiness.phone || '(512) 555-0199';
      const sWebsite = activeBusiness.website || 'our website';
      const sAddress = activeBusiness.address || 'Central Office';
      const sCat = activeBusiness.category || 'Professional Services';

      if (selectedType === 'google_post') {
        setOutput({
          titleTag: `${selectedLocation} Google Post: ${selectedService} Offer`,
          h1: `🚨 Looking for dependable ${selectedService.toLowerCase()} in ${selectedLocation}? Priority slots open today!`,
          mainValueProp: `${sName} is offering priority consultations and evaluations. Don't delay your critical ${sCat.toLowerCase()} needs.`,
          keySections: [
            {
              title: 'Offer Details',
              content: 'Upfront consultations with comprehensive assessments and honest estimates provided immediately on-site.',
            },
            {
              title: 'Location & Timing',
              content: `Serving ${selectedLocation} and surrounding areas. Located at ${sAddress}. Direct service with rapid turnaround.`,
            },
          ],
          faq: [
            {
              question: 'Do you provide upfront pricing for this offer?',
              answer: 'Yes, we provide 100% transparent pricing before any work commences.',
            },
          ],
          cta: {
            buttonText: 'Book Priority Slot Now',
            subtext: `Call ${sPhone} or book online at ${sWebsite}`,
          },
          internalLinking: [
            {
              targetUrl: '/services',
              anchorText: `${selectedService.toLowerCase()} ${selectedLocation}`,
              reason: 'Directs Google Business Post viewers to fast booking',
            },
          ],
          metrics: {
            seoScore: 92,
            searchIntent: 'Immediate Action',
            localRelevance: 98,
            conversionRating: 'High',
          },
        });
      } else if (selectedType === 'location_page') {
        setOutput({
          titleTag: `Top Rated ${selectedService} in ${selectedLocation}, ${activeBusiness.state || 'TX'} | ${sName}`,
          h1: `Comprehensive & Priority ${selectedService} in ${selectedLocation}`,
          mainValueProp: `Serving clients and businesses across ${selectedLocation} with responsive, high-quality ${sCat.toLowerCase()}, modern equipment, and convenient appointment scheduling.`,
          keySections: [
            {
              title: `Why ${selectedLocation} Clients Choose ${sName}`,
              content: `Over ${activeBusiness.reviewCount || 100}+ five-star reviews praise our punctuality, transparent fee schedules, and courteous team.`,
            },
            {
              title: 'Full Range of Service Solutions',
              content: `From routine maintenance and preventative checkups to urgent same-day interventions and turnkey installations.`,
            },
          ],
          faq: [
            {
              question: `How quickly can you dispatch a specialist to ${selectedLocation}?`,
              answer: 'We maintain dedicated teams in the area with same-day emergency response times often under 60 minutes.',
            },
          ],
          cta: {
            buttonText: `Schedule Your ${selectedLocation} Consultation`,
            subtext: 'Free Estimates Available • Fast Turnaround • Top Rated',
          },
          internalLinking: [
            {
              targetUrl: '/services',
              anchorText: `comprehensive ${sCat.toLowerCase()} in ${selectedLocation}`,
              reason: 'Builds location-to-service hub architecture',
            },
          ],
          metrics: {
            seoScore: 90,
            searchIntent: 'Local High-Intent',
            localRelevance: 96,
            conversionRating: 'High',
          },
        });
      } else {
        // Service Page regeneration
        setOutput({
          titleTag: `${selectedService} in ${selectedLocation}, ${activeBusiness.state || 'TX'} | ${sName}`,
          h1: `Advanced ${selectedService} in ${selectedLocation}`,
          mainValueProp: `Experience top-tier ${selectedService.toLowerCase()} tailored for lasting quality, dependable reliability, and transparent pricing by ${sName}.`,
          keySections: [
            {
              title: `1. Certified Expertise in ${selectedService}`,
              content: `Our certified team utilizes state-of-the-art tools and proven protocols to deliver predictable, exceptional results every time.`,
            },
            {
              title: '2. Client-First Communication & Guarantees',
              content: 'Clear communication, prompt arrivals, and satisfaction guarantees throughout your entire project lifecycle.',
            },
            {
              title: '3. Transparent Estimates & Honest Billing',
              content: 'No hidden invoices. We outline your full scope and fees upfront so you have total clarity from the start.',
            },
          ],
          faq: [
            {
              question: `How long does a typical ${selectedService.toLowerCase()} consultation take?`,
              answer: 'Initial assessments take roughly 30-45 minutes, including on-site evaluation and your customized estimate.',
            },
            {
              question: 'Do you offer flexible payment options for this service?',
              answer: 'Yes, we provide flexible financing options and structured payment plans for major projects.',
            },
          ],
          cta: {
            buttonText: `Book ${selectedService} Consultation`,
            subtext: 'Online Scheduling • Instant Confirmation • Friendly Professional Team',
          },
          internalLinking: [
            {
              targetUrl: '/contact',
              anchorText: `schedule ${selectedService.toLowerCase()} in ${selectedLocation}`,
              reason: 'Direct conversion path from high-intent service page',
            },
            {
              targetUrl: '/pricing',
              anchorText: `transparent ${sCat.toLowerCase()} pricing`,
              reason: 'Reassures pricing-sensitive visitors',
            },
          ],
          metrics: {
            seoScore: 88,
            searchIntent: 'High (Transactional)',
            localRelevance: 94,
            conversionRating: 'High',
          },
        });
      }

      logActivity('content', 'Content Studio Generated', `${selectedType.toUpperCase()}: ${selectedService} for ${selectedLocation}`);
    }, 700);
  };

  const handleCopyContent = () => {
    const fullText = `
# ${output.h1}
Meta Title: ${output.titleTag}

${output.mainValueProp}

## Sections
${output.keySections.map((s) => `### ${s.title}\n${s.content}\n`).join('\n')}

## FAQs
${output.faq.map((f) => `**Q: ${f.question}**\nA: ${f.answer}\n`).join('\n')}

## CTA
${output.cta.buttonText} (${output.cta.subtext})

## Internal Linking
${output.internalLinking.map((l) => `- [${l.anchorText}](${l.targetUrl}) (${l.reason})`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToWorkspace = () => {
    const docType =
      selectedType === 'service_page'
        ? ('service_description' as const)
        : selectedType === 'location_page'
        ? ('landing_page_copy' as const)
        : selectedType === 'google_post'
        ? ('google_business_post' as const)
        : selectedType === 'review_response'
        ? ('review_reply' as const)
        : selectedType === 'faq'
        ? ('faq_page' as const)
        : selectedType === 'email'
        ? ('email' as const)
        : ('blog_post' as const);

    addDocument({
      title: `${output.h1} (${selectedLocation})`,
      type: docType,
      content: `${output.titleTag}\n\n${output.mainValueProp}\n\n${output.keySections.map((s) => `${s.title}\n${s.content}`).join('\n\n')}`,
      prompt: `${selectedService} in ${selectedLocation}`,
    });

    setSavedSuccess(true);
    logActivity('content', 'Document Saved', `Saved "${output.h1}" to workspace documents library`);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExport = () => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>${output.titleTag}</title>
  <meta name="description" content="${output.mainValueProp}">
</head>
<body style="font-family: sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; color: #1e293b;">
  <h1>${output.h1}</h1>
  <p style="font-size: 18px; color: #475569;"><strong>${output.mainValueProp}</strong></p>
  <hr style="margin: 30px 0; border: 0; border-top: 1px solid #e2e8f0;" />
  ${output.keySections.map((s) => `<h2>${s.title}</h2><p>${s.content}</p>`).join('')}
  <h2>Frequently Asked Questions</h2>
  ${output.faq.map((f) => `<div style="margin-bottom: 20px;"><h3>${f.question}</h3><p>${f.answer}</p></div>`).join('')}
  <div style="margin-top: 40px; padding: 25px; background: #f8fafc; border-radius: 12px; border: 1px solid #cbd5e1;">
    <a href="${activeBusiness.website || '#'}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
      ${output.cta.buttonText}
    </a>
    <p style="font-size: 12px; color: #64748b; margin-top: 8px;">${output.cta.subtext}</p>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${output.h1.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    logActivity('content', 'Content Exported', `Exported "${output.h1}" as standalone HTML asset`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto font-sans text-slate-900 space-y-8 pb-20">
      {/* 1. HEADER (Section 16 Mandate: Don't call it 'AI Content Generator'. Call it: Content Studio) */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#059669] font-heading">
                Search-To-Customer Studio
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
              <FileText className="w-7 h-7 text-[#059669]" />
              Content Studio
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Zero repetitive form filling. Locora already knows your business, services, locations, audience, and brand voice.
            </p>
          </div>

          {/* Business Brain Memory Indicator */}
          <div
            onClick={() => setActiveTab('business_brain')}
            className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center gap-3 cursor-pointer hover:bg-emerald-100/80 transition-all self-start sm:self-auto shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#059669] text-white flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-heading block">
                Connected Business Brain
              </span>
              <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                {businessProfile.name || activeBusiness.name}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* 2. CREATION CATEGORY BUTTONS (The 8 requested options in Section 16) */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-heading block">
            What would you like to create?
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {contentTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;

              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id);
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="truncate w-full">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. STREAMLINED PICKERS (Section 17: User picks Service, Location - AI knows the rest) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
              Quick Focus (Locora already knows voice, competitors & audience)
            </span>
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ✓ Business Brain Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Pick Service */}
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-[#059669]" />
                Target Service
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#059669]"
              >
                {servicesList.map((svc) => (
                  <option key={svc} value={svc}>
                    {svc}
                  </option>
                ))}
              </select>
            </div>

            {/* Pick Location */}
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                Geographic Focus
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:border-[#059669]"
              >
                {locationsList.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Trigger */}
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full p-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Zap className={`w-3.5 h-3.5 ${isGenerating ? 'animate-bounce text-amber-300' : 'text-amber-300'}`} />
                <span>{isGenerating ? 'Drafting from Brain...' : 'Generate with Locora'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WORKFLOW OUTPUT & METRICS (Section 17 Specifications) */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Top Section 17 Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-100 pb-5">
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-heading block">
              SEO Score
            </span>
            <span className="text-2xl font-black font-heading text-emerald-950">
              {output.metrics.seoScore}/100
            </span>
            <span className="text-[10px] text-[#059669] font-bold block mt-0.5">
              Rank-Ready Meta & Headings
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-heading block">
              Search Intent
            </span>
            <span className="text-sm font-extrabold font-heading text-slate-900 block mt-1">
              {output.metrics.searchIntent}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Targeted to urgent patient conversion
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-heading block">
              Local Relevance
            </span>
            <span className="text-2xl font-black font-heading text-emerald-950">
              {output.metrics.localRelevance}%
            </span>
            <span className="text-[10px] text-[#059669] font-bold block mt-0.5">
              Grounded in {selectedLocation} geo-entity
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-heading block">
              Conversion
            </span>
            <span className="text-sm font-extrabold font-heading text-emerald-700 block mt-1">
              {output.metrics.conversionRating}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Strong CTAs & frictionless intake
            </span>
          </div>
        </div>

        {/* Section 17 Actions: [ Edit ] [ Save ] [ Export ] */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Actions:</span>
            {savedSuccess && (
              <span className="text-[11px] font-bold text-[#059669] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved to Workspace
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isEditing
                  ? 'bg-[#059669] text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Done Editing' : 'Edit'}</span>
            </button>

            <button
              onClick={handleSaveToWorkspace}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-[#059669]" />
              <span>Save</span>
            </button>

            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export</span>
            </button>

            <button
              onClick={handleCopyContent}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium cursor-pointer"
              title="Copy markdown to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Generated Structured Fields (Section 17 Workflow) */}
        <div className="space-y-6 text-xs text-slate-800">
          {/* Title Tag & H1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                Title Tag (Meta Title)
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={output.titleTag}
                  onChange={(e) => setOutput({ ...output, titleTag: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                />
              ) : (
                <p className="font-mono text-slate-900 font-bold text-xs">{output.titleTag}</p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                H1 Heading
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={output.h1}
                  onChange={(e) => setOutput({ ...output, h1: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs font-bold"
                />
              ) : (
                <h3 className="font-extrabold text-slate-900 text-sm font-heading">{output.h1}</h3>
              )}
            </div>
          </div>

          {/* Main Value Prop */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] font-heading">
              Main Value Proposition
            </span>
            {isEditing ? (
              <textarea
                rows={3}
                value={output.mainValueProp}
                onChange={(e) => setOutput({ ...output, mainValueProp: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-emerald-300 bg-white text-xs leading-relaxed"
              />
            ) : (
              <p className="text-slate-800 leading-relaxed font-medium text-[13px]">
                {output.mainValueProp}
              </p>
            )}
          </div>

          {/* Key Sections */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block">
              Key Sections
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {output.keySections.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5"
                >
                  <h4 className="font-extrabold text-slate-900 font-heading text-xs">
                    {sec.title}
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block">
              Frequently Asked Questions (FAQ Schema-Ready)
            </span>

            <div className="space-y-2.5">
              {output.faq.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1">
                  <p className="font-bold text-slate-900 text-xs">
                    Q: {item.question}
                  </p>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    A: {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-heading block">
                Primary Call To Action (CTA)
              </span>
              <p className="font-extrabold text-sm text-white">
                {output.cta.buttonText}
              </p>
              <p className="text-xs text-slate-300">
                {output.cta.subtext}
              </p>
            </div>

            <button
              onClick={() => alert(`Activated CTA destination: ${activeBusiness.phone || '(512) 555-0199'}`)}
              className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md transition-colors cursor-pointer shrink-0"
            >
              Test CTA Action →
            </button>
          </div>

          {/* Internal Linking Suggestions */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading block">
              Internal Linking Suggestions
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {output.internalLinking.map((link, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1 text-xs"
                >
                  <span className="font-mono text-[11px] text-[#059669] font-bold block">
                    {link.targetUrl}
                  </span>
                  <p className="font-bold text-slate-800">
                    Anchor: "{link.anchorText}"
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {link.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
