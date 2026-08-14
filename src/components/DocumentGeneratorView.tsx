import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DocumentType, DocumentItem } from '../types';
import { PolishControls } from './PolishControls';
import {
  FileEdit,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Mail,
  Linkedin,
  Facebook,
  Instagram,
  MapPin,
  MessageSquare,
  BookOpen,
  FileText,
  TrendingUp,
  UserPlus,
  Briefcase,
  Globe,
  HelpCircle,
  Languages,
} from 'lucide-react';

interface DocTypeConfig {
  type: DocumentType;
  label: string;
  icon: React.ElementType;
  description: string;
  placeholder: string;
}

const DOC_TYPES: DocTypeConfig[] = [
  { type: 'email', label: 'Email Draft', icon: Mail, description: 'Client & customer emails', placeholder: 'e.g. Follow-up email after initial consultation' },
  { type: 'linkedin_post', label: 'LinkedIn Post', icon: Linkedin, description: 'Thought leadership & updates', placeholder: 'e.g. Share key industry tip on local SEO' },
  { type: 'facebook_post', label: 'Facebook Post', icon: Facebook, description: 'Community engagement', placeholder: 'e.g. Announce summer discount offer' },
  { type: 'instagram_caption', label: 'Instagram Caption', icon: Instagram, description: 'Visual post captions + hashtags', placeholder: 'e.g. Behind the scenes at our office' },
  { type: 'google_business_post', label: 'Google Business Post', icon: MapPin, description: 'Local SEO updates', placeholder: 'e.g. Highlight new dental cleaning technology' },
  { type: 'review_reply', label: 'Review Reply', icon: MessageSquare, description: 'Polite Google/Yelp replies', placeholder: 'e.g. Respond to 5-star review praising fast service' },
  { type: 'blog_post', label: 'Blog Article', icon: BookOpen, description: 'SEO-rich blog posts', placeholder: 'e.g. 5 Common Plumbing Myths Busted' },
  { type: 'business_plan', label: 'Business Plan', icon: FileText, description: 'Executive summaries', placeholder: 'e.g. Expansion plan into neighboring county' },
  { type: 'meeting_summary', label: 'Meeting Summary', icon: Briefcase, description: 'Convert raw notes to action items', placeholder: 'e.g. Notes from Q3 strategy call' },
  { type: 'marketing_plan', label: 'Marketing Plan', icon: TrendingUp, description: 'Campaign blueprints', placeholder: 'e.g. Q4 customer acquisition strategy' },
  { type: 'cold_email', label: 'Cold Email', icon: UserPlus, description: 'Outreach to potential clients', placeholder: 'e.g. Offer website audit to local medical clinics' },
  { type: 'service_description', label: 'Service Description', icon: Briefcase, description: 'Persuasive service pages', placeholder: 'e.g. Emergency 24/7 HVAC repair service' },
  { type: 'landing_page_copy', label: 'Landing Page Copy', icon: Globe, description: 'Headlines, features, CTAs', placeholder: 'e.g. High-converting dental implant landing page' },
  { type: 'faq_page', label: 'FAQ Page', icon: HelpCircle, description: 'Q&As addressing customer objections', placeholder: 'e.g. FAQs for commercial roofing services' },
];

export const DocumentGeneratorView: React.FC = () => {
  const { documents, addDocument, deleteDocument, businessProfile, settings, user, hasEnoughCredits, consumeAiCredit, updateUser } = useApp();

  const [selectedType, setSelectedType] = useState<DocumentType>('email');
  const [prompt, setPrompt] = useState('');
  const [targetAudience, setTargetAudience] = useState(businessProfile.targetAudience || '');
  const [tone, setTone] = useState(businessProfile.toneOfVoice || 'Professional & Persuasive');
  const [language, setLanguage] = useState('English');

  const [loading, setLoading] = useState(false);
  const [outputContent, setOutputContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeDocConfig = DOC_TYPES.find((d) => d.type === selectedType) || DOC_TYPES[0];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    if (!hasEnoughCredits(2)) return;

    setLoading(true);

    try {
      const fullPrompt = `${prompt}\n\nLanguage Instruction: Generate the output strictly in ${language}.`;
      const response = await fetch('/api/ai/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          prompt: fullPrompt,
          targetAudience,
          tone,
          businessProfile,
          providerKey: settings.providerKeys[settings.activeProvider],
          userEmail: user.email,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate document');

      if (typeof data.creditsUsed === 'number') {
        updateUser({ aiCreditsUsed: data.creditsUsed });
      } else {
        consumeAiCredit(2);
      }

      setOutputContent(data.content);

      // Save document
      addDocument({
        title: `${activeDocConfig.label}: ${prompt.slice(0, 30)}...`,
        type: selectedType,
        content: data.content,
        prompt,
        targetAudience,
        tone,
      });
    } catch (err: any) {
      alert(`Error: ${err.message || 'Generation failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!outputContent) return;
    navigator.clipboard.writeText(outputContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-900 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
          <FileEdit className="w-6 h-6 text-[#059669]" />
          <span>AI Business Document Generator</span>
        </h2>
        <p className="text-xs text-slate-500 font-sans">
          Instantly generate emails, social media posts, blog articles, meeting summaries, marketing plans, and web copy.
        </p>
      </div>

      {/* 15 Document Types Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DOC_TYPES.map((dt) => {
          const Icon = dt.icon;
          const isSelected = selectedType === dt.type;
          return (
            <button
              key={dt.type}
              onClick={() => setSelectedType(dt.type)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#059669] text-white shadow-2xs font-heading'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-sans'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{dt.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
          <div className="space-y-1">
            <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
              <activeDocConfig.icon className="w-4 h-4 text-[#059669]" />
              <span>{activeDocConfig.label}</span>
            </h3>
            <p className="text-xs text-slate-500 font-sans">{activeDocConfig.description}</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-3 text-xs font-sans">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">What should the AI write? *</label>
              <textarea
                rows={4}
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeDocConfig.placeholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Local home owners"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tone of Voice</label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="e.g. Friendly & Urgent"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-[#059669]" />
                <span>Output Language</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              >
                <option value="English">English</option>
                <option value="Spanish (Español)">Spanish (Español)</option>
                <option value="French (Français)">French (Français)</option>
                <option value="German (Deutsch)">German (Deutsch)</option>
                <option value="Portuguese (Português)">Portuguese (Português)</option>
                <option value="Italian (Italiano)">Italian (Italiano)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer font-sans"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'AI Writing...' : `Generate ${activeDocConfig.label}`}</span>
            </button>
          </form>

          {/* History */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">Document History</h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {documents.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setOutputContent(d.content)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer flex items-center justify-between text-xs"
                >
                  <span className="truncate text-slate-800 font-medium font-sans">{d.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDocument(d.id);
                    }}
                    className="p-1 hover:text-rose-600 text-slate-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Output Viewer */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#059669]" />
              <span>Generated Content</span>
            </span>

            {outputContent && (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleGenerate(e as any)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer font-sans border border-emerald-200"
                  title="Re-roll and polish document"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Polish & Re-roll</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-sans"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-6 text-xs text-slate-800 leading-relaxed overflow-y-auto min-h-[400px] whitespace-pre-wrap font-mono">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400 space-y-3 font-sans">
                <Sparkles className="w-8 h-8 text-[#059669] animate-spin" />
                <p>AI Copilot is generating {activeDocConfig.label}...</p>
              </div>
            ) : outputContent ? (
              outputContent
            ) : (
              <div className="text-center text-slate-400 py-20 font-sans">
                Select a document type above, enter your instructions, and click generate.
              </div>
            )}
          </div>

          {outputContent && (
            <div className="pt-2 border-t border-slate-100">
              <PolishControls text={outputContent} onPolish={(newText) => setOutputContent(newText)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
