import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PriorityAction, FixItDraft } from '../types';
import {
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Code2,
  Eye,
  Edit3,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Send,
  Globe,
  Tag,
  Check,
} from 'lucide-react';

interface FixItModalProps {
  action: PriorityAction | null;
  onClose: () => void;
}

export const FixItModal: React.FC<FixItModalProps> = ({ action, onClose }) => {
  const { businessProfile, fixItAction, publishDraft, consumeAiCredit } = useApp();

  const [step, setStep] = useState<'recommendation' | 'generating' | 'draft_review' | 'published'>('recommendation');
  const [activeViewTab, setActiveViewTab] = useState<'preview' | 'edit' | 'schema'>('preview');

  // Working draft state
  const [draftTitle, setDraftTitle] = useState('');
  const [draftSlug, setDraftSlug] = useState('');
  const [draftSeoTitle, setDraftSeoTitle] = useState('');
  const [draftMetaDesc, setDraftMetaDesc] = useState('');
  const [draftHeadings, setDraftHeadings] = useState<string[]>([]);
  const [draftBodyCopy, setDraftBodyCopy] = useState('');
  const [draftSchemaJson, setDraftSchemaJson] = useState('');
  const [draftFaqs, setDraftFaqs] = useState<Array<{ question: string; answer: string }>>([]);

  // Initialize draft fields when action opens
  useEffect(() => {
    if (!action) return;

    if (action.draft) {
      setDraftTitle(action.draft.title);
      setDraftSlug(action.draft.slug);
      setDraftSeoTitle(action.draft.seoTitle);
      setDraftMetaDesc(action.draft.metaDescription);
      setDraftHeadings(action.draft.headings || action.itemsToCreate || []);
      setDraftBodyCopy(action.draft.bodyCopy);
      setDraftSchemaJson(action.draft.schemaJson);
      setDraftFaqs(action.draft.faqs || []);
      setStep(action.isFixed ? 'published' : 'draft_review');
    } else {
      setDraftTitle(action.recommendationTitle);
      setDraftSlug(`/services/${action.id.replace('act_', '').replace('_', '-')}`);
      setDraftSeoTitle(`${action.recommendationTitle} | ${businessProfile.name}`);
      setDraftMetaDesc(action.whyItMatters);
      setDraftHeadings(action.itemsToCreate || ['Service Overview', 'Why Choose Us', 'Same-Day Treatment', 'Patient FAQs']);
      setDraftBodyCopy(`Locora AI has generated the comprehensive content blueprint for ${action.recommendationTitle} at ${businessProfile.name} in ${businessProfile.city}, ${businessProfile.state}.\n\nPatients experiencing severe pain, tooth fractures, or urgent dental distress can call our direct emergency line at ${businessProfile.phone} for immediate same-day priority triage.\n\nOur clinic at ${businessProfile.address} is equipped with digital 3D cone beam imaging, nitrous oxide sedation, and gentle compassionate care to relieve dental discomfort immediately.`);
      setDraftSchemaJson(
        JSON.stringify(
          {
            '@context': 'https://schema.org',
            '@type': 'Dentist',
            'name': `${businessProfile.name} - ${action.recommendationTitle}`,
            'telephone': businessProfile.phone,
            'address': {
              '@type': 'PostalAddress',
              'streetAddress': businessProfile.address,
              'addressLocality': businessProfile.city,
              'addressRegion': businessProfile.state,
              'postalCode': businessProfile.zip,
              'addressCountry': 'US',
            },
            'openingHours': 'Mo-Su 00:00-24:00',
            'emergencyService': true,
            'priceRange': '$$',
          },
          null,
          2
        )
      );
      setDraftFaqs([
        {
          question: 'Do you accept same-day emergency dental appointments in Austin?',
          answer: `Yes, ${businessProfile.name} reserves priority emergency appointment blocks every single morning and afternoon for urgent toothaches, fractures, and trauma.`,
        },
        {
          question: 'What should I do if a tooth is knocked out or broken?',
          answer: 'Gently rinse the tooth with water without scrubbing the root, place it in milk or saliva, and call our office immediately at (512) 555-0199.',
        },
      ]);
      setStep('recommendation');
    }
  }, [action, businessProfile]);

  if (!action) return null;

  const handleGenerateDraft = () => {
    consumeAiCredit(1);
    setStep('generating');
    setTimeout(() => {
      const generatedDraft: Partial<FixItDraft> = {
        title: draftTitle,
        slug: draftSlug,
        seoTitle: draftSeoTitle,
        metaDescription: draftMetaDesc,
        headings: draftHeadings,
        bodyCopy: draftBodyCopy,
        schemaType: 'LocalBusiness',
        schemaJson: draftSchemaJson,
        faqs: draftFaqs,
        status: 'draft',
      };
      fixItAction(action.id, generatedDraft);
      setStep('draft_review');
    }, 1200);
  };

  const handlePublish = () => {
    publishDraft(action.id);
    setStep('published');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-scaleUp overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#059669] flex items-center justify-center font-bold shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {action.category || action.urgencyLabel || 'Growth'} Workflow
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    action.urgency === 'high'
                      ? 'bg-rose-100 text-rose-800'
                      : action.urgency === 'opportunity'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {action.urgency === 'high' ? 'High Impact' : action.urgency === 'opportunity' ? 'Opportunity' : 'Healthy Area'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading leading-tight mt-0.5">
                {action.recommendationTitle}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workflow Progress Breadcrumb */}
        <div className="px-5 py-2.5 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500 overflow-x-auto">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <span
              className={`flex items-center gap-1 ${
                step === 'recommendation' ? 'text-[#059669] font-bold' : 'text-slate-700'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[10px] font-mono">
                1
              </span>
              <span>Recommendation</span>
            </span>

            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />

            <span
              className={`flex items-center gap-1 ${
                step === 'generating' || step === 'draft_review'
                  ? 'text-[#059669] font-bold'
                  : 'text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[10px] font-mono">
                2
              </span>
              <span>Create Draft</span>
            </span>

            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />

            <span
              className={`flex items-center gap-1 ${
                step === 'published' ? 'text-[#059669] font-bold' : 'text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[10px] font-mono">
                3
              </span>
              <span>Review & Publish</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:block">
            Step {step === 'recommendation' ? '1 of 3' : step === 'draft_review' ? '2 of 3' : '3 of 3'}
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-800 text-xs">
          {/* STEP 1: RECOMMENDATION & "WHAT I'LL CREATE" */}
          {step === 'recommendation' && (
            <div className="space-y-5">
              {/* Problem & Why It Matters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80">
                  <div className="flex items-center gap-1.5 text-rose-800 font-bold font-heading mb-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>The Problem</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{action.problem}</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold font-heading mb-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>Why It Matters & Impact</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{action.whyItMatters}</p>
                </div>
              </div>

              {/* Evidence & Expected Impact */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-heading">
                    Diagnostic Evidence
                  </span>
                  <p className="text-slate-800 font-medium mt-0.5">{action.evidence}</p>
                </div>
                <div className="px-3 py-2 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-900 font-bold text-xs shrink-0 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{action.expectedImpact}</span>
                </div>
              </div>

              {/* What I Will Create Section */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 font-heading text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#059669]" />
                    <span>What Locora AI will create:</span>
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Safe Draft Mode
                  </span>
                </div>

                <p className="text-slate-600 text-xs">
                  Locora creates non-destructive working drafts first. Nothing is published or changed on
                  your live website until you review, edit, and click approve.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {(action.itemsToCreate || [
                    'Dedicated local service landing page',
                    'JSON-LD LocalBusiness & Service schema markup',
                    'SEO meta title & description for Austin pack',
                    'High-intent patient FAQs & internal links',
                  ]).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs font-medium text-slate-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* GENERATING ANIMATION */}
          {step === 'generating' && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-[#059669] flex items-center justify-center animate-bounce shadow-md">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Synthesizing Draft Assets...
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Drafting content, building LocalBusiness schema, configuring Austin geographic keywords, and assembling patient FAQs.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: DRAFT REVIEW & PREVIEW */}
          {step === 'draft_review' && (
            <div className="space-y-4">
              {/* Draft Review Navigation Tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveViewTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      activeViewTab === 'preview'
                        ? 'bg-[#059669] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visual Preview</span>
                  </button>

                  <button
                    onClick={() => setActiveViewTab('edit')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      activeViewTab === 'edit'
                        ? 'bg-[#059669] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Content</span>
                  </button>

                  <button
                    onClick={() => setActiveViewTab('schema')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      activeViewTab === 'schema'
                        ? 'bg-[#059669] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Schema JSON-LD</span>
                  </button>
                </div>

                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Draft Mode (Unpublished)
                </span>
              </div>

              {/* Tab: Visual Preview */}
              {activeViewTab === 'preview' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  {/* Mock Browser URL Bar */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 font-mono">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>https://{businessProfile.website || 'austindentalcare.com'}{draftSlug}</span>
                  </div>

                  {/* Google SERP Preview Card */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Google Search & AI Overview Appearance
                    </span>
                    <p className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer truncate">
                      {draftSeoTitle}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {draftMetaDesc}
                    </p>
                  </div>

                  {/* Body Content Preview */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 font-heading">
                      {draftTitle}
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {draftBodyCopy}
                    </p>

                    {/* FAQs */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <h4 className="font-bold text-slate-800 text-xs font-heading">
                        Frequently Asked Questions:
                      </h4>
                      {draftFaqs.map((faq, fIdx) => (
                        <div key={fIdx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                          <p className="font-bold text-slate-900">{faq.question}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Edit Content */}
              {activeViewTab === 'edit' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Page Title / Heading
                      </label>
                      <input
                        type="text"
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={draftSlug}
                        onChange={(e) => setDraftSlug(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      SEO Title (Meta Title)
                    </label>
                    <input
                      type="text"
                      value={draftSeoTitle}
                      onChange={(e) => setDraftSeoTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      rows={2}
                      value={draftMetaDesc}
                      onChange={(e) => setDraftMetaDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Body Copy & Content Section
                    </label>
                    <textarea
                      rows={5}
                      value={draftBodyCopy}
                      onChange={(e) => setDraftBodyCopy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab: Schema Markup */}
              {activeViewTab === 'schema' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">JSON-LD Structured Data</span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">
                      Valid Schema.org
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={draftSchemaJson}
                    onChange={(e) => setDraftSchemaJson(e.target.value)}
                    className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-900 text-emerald-300 rounded-2xl border border-slate-700 focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PUBLISHED SUCCESS */}
          {step === 'published' && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shadow-lg">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">
                  Action Successfully Deployed & Published!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mt-1">
                  The {action.recommendationTitle} has been saved to your active content repository and synchronized with your business growth profile.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium max-w-sm">
                Expected growth impact: <span className="font-bold">{action.expectedImpact}</span> over the next 30 days.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/80 transition-colors cursor-pointer"
          >
            {step === 'published' ? 'Close' : 'Cancel'}
          </button>

          <div className="flex items-center gap-2">
            {step === 'recommendation' && (
              <button
                type="button"
                onClick={handleGenerateDraft}
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Draft</span>
              </button>
            )}

            {step === 'draft_review' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    fixItAction(action.id, {
                      title: draftTitle,
                      slug: draftSlug,
                      seoTitle: draftSeoTitle,
                      metaDescription: draftMetaDesc,
                      bodyCopy: draftBodyCopy,
                      status: 'draft',
                    });
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 cursor-pointer"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Publish</span>
                </button>
              </>
            )}

            {step === 'published' && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
