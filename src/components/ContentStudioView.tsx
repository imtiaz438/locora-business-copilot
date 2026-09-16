import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ContentRecord, ContentType, ContentStatus, ContentPlatform } from '../types';
import { DeleteConfirmModal } from './common/DeleteConfirmModal';
import { DataProvenanceBadge } from './common/DataProvenanceBadge';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  Copy,
  Edit3,
  Save,
  ExternalLink,
  MapPin,
  Briefcase,
  Send,
  MessageSquare,
  Mail,
  Instagram,
  HelpCircle,
  BookOpen,
  Trash2,
  Clock,
  AlertCircle,
  Filter,
  Plus,
  Search,
  Tag,
  Globe,
  Building2,
  Eye,
  Check,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  X,
  Share2,
} from 'lucide-react';

const CONTENT_TYPE_LABELS: Record<ContentType, { label: string; icon: React.ElementType; color: string }> = {
  google_post: { label: 'Google Post', icon: Sparkles, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  service_page: { label: 'Service Page', icon: Briefcase, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  location_page: { label: 'Location Page', icon: MapPin, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  website_content: { label: 'Website Content', icon: Globe, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  faq: { label: 'Local FAQ', icon: HelpCircle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  blog_guide: { label: 'Blog / Guide', icon: BookOpen, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  review_reply: { label: 'Review Reply', icon: MessageSquare, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  social_post: { label: 'Social Post', icon: Instagram, color: 'text-pink-600 bg-pink-50 border-pink-200' },
  offer: { label: 'Special Offer', icon: Tag, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  email: { label: 'Email Campaign', icon: Mail, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  draft: { label: 'Content Draft', icon: FileText, color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

const STATUS_BADGES: Record<ContentStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  review: { label: 'In Review', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  scheduled: { label: 'Scheduled', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  published: { label: 'Published', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  failed: { label: 'Publish Failed', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export const ContentStudioView: React.FC = () => {
  const {
    activeBusiness,
    businessProfile,
    contentRecords,
    addContentRecord,
    updateContentRecord,
    deleteContentRecord,
    logActivity,
    user,
    setActiveTab,
  } = useApp();

  const brandVoice = businessProfile?.brandVoice || businessProfile?.toneOfVoice || (activeBusiness as any)?.brandVoice || 'Professional & Consultative';
  const businessDescription = businessProfile?.description || (activeBusiness as any)?.description || '';
  const targetCustomers = businessProfile?.targetCustomers || businessProfile?.targetAudience || (activeBusiness as any)?.targetCustomers || '';
  const activeOffers = (businessProfile?.currentOffers && businessProfile.currentOffers.join(', ')) || (activeBusiness as any)?.offers || '';

  // Filters & Search
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Active Record
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [activeEditingRecord, setActiveEditingRecord] = useState<ContentRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<ContentRecord | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [publishActionLoading, setPublishActionLoading] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Generator State
  const [genType, setGenType] = useState<ContentType>('google_post');
  const [genService, setGenService] = useState<string>('');
  const [genCustomService, setGenCustomService] = useState<string>('');
  const [genLocation, setGenLocation] = useState<string>('');
  const [genCustomLocation, setGenCustomLocation] = useState<string>('');
  const [genGoal, setGenGoal] = useState<string>('Drive inbound phone calls and service requests');
  const [genKeyword, setGenKeyword] = useState<string>('');
  const [genNotes, setGenNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Extract real services and locations from activeBusiness
  const availableServices = useMemo(() => {
    return Array.isArray(activeBusiness.services) && activeBusiness.services.length > 0
      ? activeBusiness.services
      : [];
  }, [activeBusiness.services]);

  const availableLocations = useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(activeBusiness.locations)) {
      activeBusiness.locations.forEach((loc) => {
        if (loc.city && !list.includes(loc.city)) list.push(loc.city);
        else if (loc.name && !list.includes(loc.name)) list.push(loc.name);
      });
    }
    if (activeBusiness.city && !list.includes(activeBusiness.city)) {
      list.push(activeBusiness.city);
    }
    return list;
  }, [activeBusiness.locations, activeBusiness.city]);

  // Set initial generator selections when available
  React.useEffect(() => {
    if (!genService && availableServices.length > 0) {
      setGenService(availableServices[0]);
    }
    if (!genLocation && availableLocations.length > 0) {
      setGenLocation(availableLocations[0]);
    }
  }, [availableServices, availableLocations, genService, genLocation]);

  // Multi-tenant business content scoping: Never allow Business A content in Business B!
  const businessScopedRecords = useMemo(() => {
    if (!activeBusiness?.id) return [];
    return contentRecords.filter((rec) => {
      return rec.business_id === activeBusiness.id || (rec as any).businessId === activeBusiness.id;
    });
  }, [contentRecords, activeBusiness?.id]);

  // Filtered Content Records
  const filteredRecords = useMemo(() => {
    return businessScopedRecords.filter((rec) => {
      if (selectedStatusFilter !== 'all' && rec.status !== selectedStatusFilter) return false;
      if (selectedTypeFilter !== 'all' && rec.content_type !== selectedTypeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = rec.title.toLowerCase().includes(q);
        const matchesService = (rec.target_service || '').toLowerCase().includes(q);
        const matchesLoc = (rec.target_location || '').toLowerCase().includes(q);
        const matchesBody = rec.body.toLowerCase().includes(q);
        if (!matchesTitle && !matchesService && !matchesLoc && !matchesBody) return false;
      }
      return true;
    });
  }, [businessScopedRecords, selectedStatusFilter, selectedTypeFilter, searchQuery]);

  // Handle AI Content Generation
  const handleGenerateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenError(null);

    const targetSvc = genService === '__custom__' || !genService ? genCustomService : genService;
    const targetLoc = genLocation === '__custom__' || !genLocation ? genCustomLocation : genLocation;

    if (!targetSvc && availableServices.length === 0 && !genCustomService) {
      setGenError('Please specify a target service for content generation.');
      setIsGenerating(false);
      return;
    }

    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: activeBusiness.id,
          contentType: genType,
          targetService: targetSvc || 'General Services',
          targetLocation: targetLoc || activeBusiness.city || 'Local Service Area',
          targetGoal: genGoal,
          targetKeyword: genKeyword,
          customNotes: genNotes,
          userEmail: user.email,
          businessTruth: {
            name: activeBusiness.name,
            category: activeBusiness.category,
            description: businessDescription,
            services: activeBusiness.services,
            locations: activeBusiness.locations,
            brandVoice: brandVoice,
            targetCustomers: targetCustomers,
            phone: activeBusiness.phone,
            website: activeBusiness.website,
            offers: activeOffers,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.record) {
        throw new Error(data.error || 'Failed to generate content');
      }

      await addContentRecord(data.record);
      setIsGeneratorOpen(false);
      setActiveEditingRecord(data.record);
      logActivity('content', `Draft Generated: ${data.record.title}`, `Grounded in Business Brain for ${data.record.target_service}`);
    } catch (err: any) {
      setGenError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Copy to Clipboard
  const handleCopyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2200);
  };

  // Handle GBP Publication
  const handlePublishToGbp = async (record: ContentRecord) => {
    setPublishActionLoading(true);
    setPublishError(null);

    try {
      const res = await fetch('/api/content/publish-gbp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: record.id,
          content: record.body,
          googleLocationId: record.google_location_id,
          userEmail: user.email,
          businessId: activeBusiness.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.error || 'Google Business Profile rejected post publication.';
        setPublishError(errorMsg);
        await updateContentRecord(record.id, {
          status: 'failed',
          errorMessage: errorMsg,
        });
        if (activeEditingRecord?.id === record.id) {
          setActiveEditingRecord((prev) => prev ? { ...prev, status: 'failed', errorMessage: errorMsg } : null);
        }
        return;
      }

      const updated = await updateContentRecord(record.id, {
        status: 'published',
        published_at: data.published_at || new Date().toISOString(),
        platform: 'gbp',
        external_id: data.external_id,
        google_location_id: data.google_location_id,
        errorMessage: null,
      });

      if (activeEditingRecord?.id === record.id) {
        setActiveEditingRecord(updated);
      }
      logActivity('content', `Published GBP Post`, `Live on Google Business Profile location`);
    } catch (err: any) {
      const msg = err.message || 'Network error while attempting GBP publication.';
      setPublishError(msg);
      await updateContentRecord(record.id, { status: 'failed', errorMessage: msg });
    } finally {
      setPublishActionLoading(false);
    }
  };

  return (
    <div id="content-cms-root" className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Content Studio & CMS</h1>
          </div>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Ground and publish Google Business posts, service pages, FAQs, and local guides directly from{' '}
            <span className="font-semibold text-slate-800">{activeBusiness.name || 'your Business Brain'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-create-manual-content"
            onClick={() => {
              const newRec: Omit<ContentRecord, 'id' | 'created_at' | 'updated_at'> = {
                business_id: activeBusiness.id || 'primary',
                content_type: 'draft',
                title: 'New Content Entry',
                body: '',
                status: 'draft',
                target_service: availableServices[0] || 'General',
                target_location: availableLocations[0] || activeBusiness.city || 'Metro',
                target_keyword: '',
                created_by: user.email || 'user',
                source: 'manual',
                AI_generated: false,
                published_at: null,
                scheduled_at: null,
                platform: 'website',
                external_id: null,
                google_location_id: null,
                errorMessage: null,
                performance: {
                  available: false,
                  message: 'Performance data is not available yet.',
                },
              };
              addContentRecord(newRec).then((rec) => setActiveEditingRecord(rec));
            }}
            className="px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Manual Entry
          </button>

          <button
            id="btn-open-content-generator"
            onClick={() => {
              setGenError(null);
              setIsGeneratorOpen(true);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate with Business Brain
          </button>
        </div>
      </div>

      {/* Business Brain Guardrail Notice */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs md:text-sm text-indigo-950">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <div>
            <span className="font-semibold text-indigo-900">Zero-Hallucination Policy: </span>
            Content is generated strictly from verified business facts. Services, locations, hours, and claims are never invented.
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-indigo-700 font-medium">
          <span>Brand Voice: <strong className="text-indigo-900">{brandVoice}</strong></span>
          <span>•</span>
          <span>Services: <strong className="text-indigo-900">{availableServices.length} verified</strong></span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="content-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, service, or keyword..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['all', 'draft', 'review', 'approved', 'scheduled', 'published', 'failed'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                selectedStatusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Statuses' : st}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="w-full md:w-48">
          <select
            id="content-type-filter-select"
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            aria-label="Filter content by type"
            className="w-full text-xs py-2 px-3 bg-white border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Content Types</option>
            {Object.entries(CONTENT_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Records Grid or Empty State */}
      {filteredRecords.length === 0 ? (
        <div id="content-empty-state" className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-200 flex items-center justify-center mx-auto mb-2">
            <FileText className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-xl font-bold text-slate-900">
              {businessScopedRecords.length === 0
                ? 'No content created yet.'
                : 'No content matching filters.'}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {businessScopedRecords.length === 0
                ? 'Create your first AI-assisted content piece.'
                : 'Try adjusting your search query or status filter.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setGenType('google_post');
                setIsGeneratorOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Google Post
            </button>
            <button
              onClick={() => {
                setGenType('service_page');
                setIsGeneratorOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              Generate Service Page
            </button>
            <button
              onClick={() => {
                setGenType('faq');
                setIsGeneratorOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Generate Local FAQs
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecords.map((record) => {
            const typeConfig = CONTENT_TYPE_LABELS[record.content_type] || CONTENT_TYPE_LABELS.draft;
            const statusConfig = STATUS_BADGES[record.status] || STATUS_BADGES.draft;
            const TypeIcon = typeConfig.icon;

            return (
              <div
                key={record.id}
                id={`content-card-${record.id}`}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  {/* Card Header Tags & Provenance */}
                  <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${typeConfig.color}`}>
                        <TypeIcon className="w-3.5 h-3.5" />
                        {typeConfig.label}
                      </span>
                      <DataProvenanceBadge
                        type="AI_RECOMMENDATION"
                        customText="✦ AI Recommendation"
                        size="xs"
                      />
                    </div>

                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Title & Preview */}
                  <h3 className="text-base font-semibold text-slate-900 line-clamp-1 mb-2">
                    {record.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 whitespace-pre-line">
                    {record.body || 'No content drafted yet. Click to write or generate.'}
                  </p>

                  {/* Meta Tags */}
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-500 mb-3">
                    {record.target_service && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        {record.target_service}
                      </span>
                    )}
                    {record.target_location && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {record.target_location}
                      </span>
                    )}
                    {record.platform && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-bold text-slate-600">
                        {record.platform}
                      </span>
                    )}
                  </div>

                  {/* Grounding Source */}
                  {record.AI_generated && (
                    <div className="text-[11px] text-indigo-700 bg-indigo-50/70 border border-indigo-100 rounded px-2 py-1 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>Generated from your Business Brain</span>
                    </div>
                  )}

                  {/* Error Notification if publish failed */}
                  {record.status === 'failed' && record.errorMessage && (
                    <div className="mt-2 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded p-2 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{record.errorMessage}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {record.published_at ? `Published ${new Date(record.published_at).toLocaleDateString()}` : `Updated ${new Date(record.updated_at).toLocaleDateString()}`}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyContent(record.body)}
                      title="Copy text"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveEditingRecord(record);
                        setPublishError(null);
                      }}
                      className="px-3 py-1 bg-white border border-slate-300 font-medium text-slate-700 rounded-md hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit / Review
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= GENERATION MODAL ================= */}
      {isGeneratorOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsGeneratorOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 relative my-auto max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsGeneratorOpen(false)}
              className="absolute right-5 top-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">Generate Content Draft</h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Powered exclusively by your Business Brain. Locora retrieves verified facts and writes ready-to-use content.
            </p>

            {genError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{genError}</span>
              </div>
            )}

            <form onSubmit={handleGenerateContent} className="space-y-4 text-xs">
              {/* Content Type */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Content Type</label>
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value as ContentType)}
                  aria-label="Select content type to generate"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="google_post">Google Business Profile Post (Update/Promo)</option>
                  <option value="service_page">Targeted Service Page (SEO Landing)</option>
                  <option value="location_page">Geo-Targeted Location Landing Page</option>
                  <option value="faq">Local Client FAQs Architecture</option>
                  <option value="blog_guide">Informational Blog / Local Authority Guide</option>
                  <option value="offer">Special Offer / Promotion Post</option>
                  <option value="email">Email Outreach / Client Follow-up</option>
                  <option value="social_post">Social Media Engagement Post</option>
                </select>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Service (from Business Brain)</label>
                {availableServices.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      value={genService}
                      onChange={(e) => setGenService(e.target.value)}
                      aria-label="Select target service from business brain"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {availableServices.map((svc) => (
                        <option key={svc} value={svc}>{svc}</option>
                      ))}
                      <option value="__custom__">+ Enter other specific service</option>
                    </select>

                    {genService === '__custom__' && (
                      <input
                        type="text"
                        placeholder="Enter verified service name..."
                        value={genCustomService}
                        onChange={(e) => setGenCustomService(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800"
                        required
                      />
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="e.g. Commercial HVAC Inspection, Deep Cleaning..."
                      value={genCustomService}
                      onChange={(e) => setGenCustomService(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800"
                      required
                    />
                    <span className="text-[11px] text-amber-600">
                      No services saved in Business Brain yet. You can type one here or configure services in Profile.
                    </span>
                  </div>
                )}
              </div>

              {/* Location Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Location</label>
                {availableLocations.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      value={genLocation}
                      onChange={(e) => setGenLocation(e.target.value)}
                      aria-label="Select target location"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {availableLocations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                      <option value="__custom__">+ Enter other verified location</option>
                    </select>

                    {genLocation === '__custom__' && (
                      <input
                        type="text"
                        placeholder="Enter specific neighborhood or city..."
                        value={genCustomLocation}
                        onChange={(e) => setGenCustomLocation(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800"
                        required
                      />
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder={activeBusiness.city || "e.g. Downtown, North Austin..."}
                    value={genCustomLocation}
                    onChange={(e) => setGenCustomLocation(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800"
                  />
                )}
              </div>

              {/* Goal */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Strategic Goal</label>
                <select
                  value={genGoal}
                  onChange={(e) => setGenGoal(e.target.value)}
                  aria-label="Select strategic goal"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Drive inbound phone calls and inquiries">Drive inbound phone calls & inquiries</option>
                  <option value="Boost local search ranking and keyword relevance">Boost local search ranking & SEO</option>
                  <option value="Highlight priority same-day emergency availability">Highlight same-day priority availability</option>
                  <option value="Educate potential clients on quality standards">Educate prospective clients on quality</option>
                  <option value="Promote seasonal special or honest consultation">Promote consultation or seasonal rate</option>
                </select>
              </div>

              {/* Optional Keyword & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Target Keyword (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. emergency roofing repair"
                    value={genKeyword}
                    onChange={(e) => setGenKeyword(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Special Notes / Angle (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. emphasize rapid response"
                    value={genNotes}
                    onChange={(e) => setGenNotes(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Grounding Summary Box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  Verified Context Grounding:
                </div>
                <div>Business: <strong className="text-slate-800">{activeBusiness.name || 'Your Business'}</strong> ({activeBusiness.category || 'Local Business'})</div>
                <div>Voice: <strong className="text-slate-800">{brandVoice}</strong></div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-generate"
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Drafting from Business Brain...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Draft
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= FULL RECORD EDITOR MODAL ================= */}
      {activeEditingRecord && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setActiveEditingRecord(null);
              setPublishError(null);
            }
          }}
        >
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 relative my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                  <Edit3 className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Edit & Publish Content</h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>ID: {activeEditingRecord.id}</span>
                    <span>•</span>
                    <span className="capitalize font-semibold text-slate-700">{activeEditingRecord.content_type.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveEditingRecord(null);
                  setPublishError(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto py-5 space-y-4 text-xs">
              {/* Publish Error Notification */}
              {publishError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block">Publication Issue:</strong>
                    <span>{publishError}</span>
                  </div>
                </div>
              )}

              {/* Badges & Status Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <label className="font-semibold text-slate-700">Status:</label>
                  <select
                    value={activeEditingRecord.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as ContentStatus;
                      updateContentRecord(activeEditingRecord.id, { status: newStatus });
                      setActiveEditingRecord({ ...activeEditingRecord, status: newStatus });
                    }}
                    aria-label="Content record status"
                    className="py-1 px-2.5 bg-white border border-slate-300 rounded-md font-semibold text-slate-800"
                  >
                    <option value="draft">Draft</option>
                    <option value="review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                    <option value="failed">Failed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {activeEditingRecord.AI_generated && (
                    <span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Generated from your Business Brain
                    </span>
                  )}
                  {activeEditingRecord.published_at && (
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Published Live
                    </span>
                  )}
                </div>
              </div>

              {/* Title Field */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Content Title / Headline</label>
                <input
                  type="text"
                  value={activeEditingRecord.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setActiveEditingRecord({ ...activeEditingRecord, title: newTitle });
                  }}
                  className="w-full p-2.5 text-sm font-semibold border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Target Service</label>
                  <input
                    type="text"
                    value={activeEditingRecord.target_service || ''}
                    onChange={(e) => setActiveEditingRecord({ ...activeEditingRecord, target_service: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Target Location</label>
                  <input
                    type="text"
                    value={activeEditingRecord.target_location || ''}
                    onChange={(e) => setActiveEditingRecord({ ...activeEditingRecord, target_location: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Target SEO Keyword</label>
                  <input
                    type="text"
                    value={activeEditingRecord.target_keyword || ''}
                    onChange={(e) => setActiveEditingRecord({ ...activeEditingRecord, target_keyword: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Body Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Content Body (Markdown supported)</label>
                  <button
                    onClick={() => handleCopyContent(activeEditingRecord.body)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedToast ? 'Copied to clipboard!' : 'Copy Text'}
                  </button>
                </div>
                <textarea
                  rows={12}
                  value={activeEditingRecord.body}
                  onChange={(e) => {
                    const newBody = e.target.value;
                    setActiveEditingRecord({ ...activeEditingRecord, body: newBody });
                  }}
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Performance Section (Honest Metrics Rule) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-semibold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-slate-500" />
                    Live Content Performance
                  </span>
                  {activeEditingRecord.performance?.available ? (
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Connected Live
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-medium">
                      No Live Stream
                    </span>
                  )}
                </div>

                {activeEditingRecord.performance?.available ? (
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="bg-white p-2.5 rounded border border-slate-200 text-center">
                      <div className="text-lg font-bold text-slate-900">{activeEditingRecord.performance.impressions || 0}</div>
                      <div className="text-[10px] text-slate-500">Impressions</div>
                    </div>
                    <div className="bg-white p-2.5 rounded border border-slate-200 text-center">
                      <div className="text-lg font-bold text-slate-900">{activeEditingRecord.performance.clicks || 0}</div>
                      <div className="text-[10px] text-slate-500">Clicks</div>
                    </div>
                    <div className="bg-white p-2.5 rounded border border-slate-200 text-center">
                      <div className="text-lg font-bold text-slate-900">{(activeEditingRecord.performance.ctr || 0).toFixed(1)}%</div>
                      <div className="text-[10px] text-slate-500">CTR</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Performance data is not available yet. Connect Google Search Console or Google Business Profile in Settings to stream live organic impressions and clicks.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <button
                onClick={() => setRecordToDelete(activeEditingRecord)}
                className="px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {/* Save Local Edits */}
                <button
                  onClick={async () => {
                    await updateContentRecord(activeEditingRecord.id, {
                      title: activeEditingRecord.title,
                      body: activeEditingRecord.body,
                      target_service: activeEditingRecord.target_service,
                      target_location: activeEditingRecord.target_location,
                      target_keyword: activeEditingRecord.target_keyword,
                    });
                    setActiveEditingRecord(null);
                  }}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>

                {/* Approve Draft */}
                {activeEditingRecord.status !== 'approved' && activeEditingRecord.status !== 'published' && (
                  <button
                    onClick={async () => {
                      const updated = await updateContentRecord(activeEditingRecord.id, {
                        title: activeEditingRecord.title,
                        body: activeEditingRecord.body,
                        status: 'approved',
                      });
                      setActiveEditingRecord(updated);
                    }}
                    className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 font-semibold rounded-lg hover:bg-blue-100 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Approve Draft
                  </button>
                )}

                {/* Publish to GBP Button (For GBP posts / offers) */}
                {(activeEditingRecord.content_type === 'google_post' || activeEditingRecord.content_type === 'offer' || activeEditingRecord.platform === 'gbp') && (
                  <button
                    id="btn-publish-to-gbp"
                    disabled={publishActionLoading}
                    onClick={() => handlePublishToGbp(activeEditingRecord)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {publishActionLoading ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        Validating Google Location...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Publish to Google Business Profile
                      </>
                    )}
                  </button>
                )}

                {/* General Mark as Published */}
                {activeEditingRecord.status !== 'published' && (
                  <button
                    onClick={async () => {
                      const updated = await updateContentRecord(activeEditingRecord.id, {
                        title: activeEditingRecord.title,
                        body: activeEditingRecord.body,
                        status: 'published',
                        published_at: new Date().toISOString(),
                      });
                      setActiveEditingRecord(updated);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Published
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Safe In-App Content Deletion Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={recordToDelete !== null}
        title="Delete Content Post"
        itemName={recordToDelete?.title}
        message="Are you sure you want to permanently delete this content item? This action cannot be undone."
        confirmLabel="Delete Post"
        onConfirm={() => {
          if (recordToDelete) {
            deleteContentRecord(recordToDelete.id);
            if (activeEditingRecord?.id === recordToDelete.id) {
              setActiveEditingRecord(null);
            }
            setRecordToDelete(null);
          }
        }}
        onClose={() => setRecordToDelete(null)}
      />
    </div>
  );
};
export default ContentStudioView;
