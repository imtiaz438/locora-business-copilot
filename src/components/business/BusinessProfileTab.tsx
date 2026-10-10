import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomLogoConfig } from '../../types';
import { GoogleAddressAutocomplete, LocationData } from '../GoogleAddressAutocomplete';
import { CountryAutocomplete } from '../CountryAutocomplete';
import {
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Globe,
  Phone,
  Mail,
  Clock,
  Image as ImageIcon,
  Tag,
  Share2,
  FileText,
  Sliders,
  Upload,
  RotateCcw,
  Sparkles,
  DollarSign,
  Users,
  Target,
  MessageSquare,
  ShieldCheck,
  X,
  Plus,
} from 'lucide-react';

export const BusinessProfileTab: React.FC = () => {
  const {
    activeBusiness,
    updateActiveBusiness,
    businessProfile,
    updateBusinessProfile,
    businessTruth,
    user,
  } = useApp();

  // Unified Form State for the selected business (corrected by the sync effect on mount)
  const [formData, setFormData] = useState(() => {
    const truth = (businessTruth as any) || {};
    const truthName = (typeof truth.name === 'string' && truth.name.trim()) || '';
    const truthCategory = (typeof truth.category === 'string' && truth.category.trim()) || '';
    const PLACEHOLDERS = ['My Business Workspace', 'My Local Business', 'Demo Growth Workspace'];
    const realOr = (v: unknown, fallback: string) => {
      const s = (typeof v === 'string' ? v : '').trim();
      return (s && !PLACEHOLDERS.includes(s)) ? s : fallback;
    };
    return {
      name: truthName || realOr(businessProfile?.name, '') || realOr(activeBusiness?.name, '') || '',
      category: truthCategory || realOr(businessProfile?.industry, '') || realOr(activeBusiness?.category, '') || 'Local Business',
      legalName: businessProfile?.legalName || truthName || '',
      description: businessProfile?.description || activeBusiness?.description || truth.description || '',
      website: businessProfile?.website || activeBusiness?.website || '',
      phone: businessProfile?.phone || activeBusiness?.phone || '',
      email: businessProfile?.email || activeBusiness?.email || user?.email || '',
      address: businessProfile?.address || activeBusiness?.address || '',
      city: businessProfile?.city || activeBusiness?.city || '',
      state: businessProfile?.state || activeBusiness?.state || '',
      country: businessProfile?.country || activeBusiness?.country || 'United States',
      zip: businessProfile?.zip || activeBusiness?.zip || '',
      hours: typeof businessProfile?.hours === 'string' && businessProfile.hours ? businessProfile.hours : (truth.hours || ''),
      services: businessProfile?.services || activeBusiness?.services || [],
      targetAudience: businessProfile?.targetAudience || '',
      toneOfVoice: businessProfile?.toneOfVoice || 'Professional, trustworthy, and friendly',
      currency: businessProfile?.currency || 'USD',
      taxId: businessProfile?.taxId || '',
      // Social Links
      linkedinUrl: (businessProfile as any)?.linkedinUrl || '',
      facebookUrl: (businessProfile as any)?.facebookUrl || '',
      instagramUrl: (businessProfile as any)?.instagramUrl || '',
      googleMapsUrl: (businessProfile as any)?.googleMapsUrl || '',
    };
  });

  // Keep form updated when the business, profile, or verified truth changes.
  // Verified truth is the final fallback for every field so stale or wrong
  // values (placeholders, cross-account artifacts) can never persist here.
  useEffect(() => {
    const truth = (businessTruth as any) || {};
    const truthName = (typeof truth.name === 'string' && truth.name.trim()) || '';
    const truthCategory = (typeof truth.category === 'string' && truth.category.trim()) || '';
    const PLACEHOLDERS = ['My Business Workspace', 'My Local Business', 'Demo Growth Workspace'];
    const realOr = (v: unknown, fallback: string) => {
      const s = (typeof v === 'string' ? v : '').trim();
      return (s && !PLACEHOLDERS.includes(s)) ? s : fallback;
    };
    setFormData({
      name: truthName || realOr(businessProfile?.name, '') || realOr(activeBusiness?.name, '') || '',
      category: truthCategory || realOr(businessProfile?.industry, '') || realOr(activeBusiness?.category, '') || 'Local Business',
      legalName: businessProfile?.legalName || truthName || '',
      description: businessProfile?.description || activeBusiness?.description || truth.description || '',
      website: businessProfile?.website || activeBusiness?.website || '',
      phone: businessProfile?.phone || activeBusiness?.phone || '',
      email: businessProfile?.email || activeBusiness?.email || user?.email || '',
      address: businessProfile?.address || activeBusiness?.address || '',
      city: businessProfile?.city || activeBusiness?.city || '',
      state: businessProfile?.state || activeBusiness?.state || '',
      country: businessProfile?.country || activeBusiness?.country || 'United States',
      zip: businessProfile?.zip || activeBusiness?.zip || '',
      hours: typeof businessProfile?.hours === 'string' && businessProfile.hours ? businessProfile.hours : (truth.hours || 'Mon-Fri: 8:00 AM - 6:00 PM'),
      services: businessProfile?.services || activeBusiness?.services || [],
      targetAudience: businessProfile?.targetAudience || '',
      toneOfVoice: businessProfile?.toneOfVoice || 'Professional, trustworthy, and friendly',
      currency: businessProfile?.currency || 'USD',
      taxId: businessProfile?.taxId || '',
      linkedinUrl: (businessProfile as any)?.linkedinUrl || '',
      facebookUrl: (businessProfile as any)?.facebookUrl || '',
      instagramUrl: (businessProfile as any)?.instagramUrl || '',
      googleMapsUrl: (businessProfile as any)?.googleMapsUrl || '',
    });
  }, [activeBusiness?.id, businessProfile, businessTruth]);

  const [newServiceInput, setNewServiceInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Logo config state
  const [logoUrlInput, setLogoUrlInput] = useState(
    businessProfile?.logoUrl || businessProfile?.logoConfig?.url || ''
  );
  const [logoConfigState, setLogoConfigState] = useState<CustomLogoConfig>(() => {
    return (
      businessProfile?.logoConfig || {
        url: businessProfile?.logoUrl || '',
        height: 36,
        alignment: 'left',
        padding: 'normal',
        bgStyle: 'transparent',
        fit: 'contain',
      }
    );
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLocationSelect = (loc: LocationData) => {
    setFormData((prev) => ({
      ...prev,
      address: loc.address || prev.address,
      city: loc.city || prev.city,
      state: loc.state || prev.state,
      country: loc.country || prev.country,
      zip: loc.zip || prev.zip,
    }));
  };

  const handleAddService = () => {
    if (newServiceInput.trim() && !formData.services.includes(newServiceInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, newServiceInput.trim()],
      }));
      setNewServiceInput('');
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== serviceToRemove),
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const format = file.type.includes('svg')
      ? 'svg'
      : file.type.includes('png')
      ? 'png'
      : 'jpg';
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result) {
        const updated: CustomLogoConfig = {
          ...logoConfigState,
          url: result,
          format,
          fileName: file.name,
        };
        setLogoConfigState(updated);
        setLogoUrlInput(result);
        updateBusinessProfile({ logoUrl: result, logoConfig: updated });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Update businessProfile
      updateBusinessProfile({
        name: formData.name,
        legalName: formData.legalName,
        industry: formData.category,
        description: formData.description,
        website: formData.website,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zip: formData.zip,
        hours: formData.hours,
        services: formData.services,
        targetAudience: formData.targetAudience,
        toneOfVoice: formData.toneOfVoice,
        currency: formData.currency,
        taxId: formData.taxId,
        ...({
          linkedinUrl: formData.linkedinUrl,
          facebookUrl: formData.facebookUrl,
          instagramUrl: formData.instagramUrl,
          googleMapsUrl: formData.googleMapsUrl,
        } as any),
      });

      // 2. Update activeBusiness
      if (updateActiveBusiness) {
        updateActiveBusiness({
          name: formData.name,
          category: formData.category,
          website: formData.website,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
          phone: formData.phone,
          email: formData.email,
          description: formData.description,
          services: formData.services,
        });
      }

      // 3. Persist to API if possible
      await fetch(`/api/workspace/businesses/${encodeURIComponent(activeBusiness.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          legalName: formData.legalName,
          description: formData.description,
          website: formData.website,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zip: formData.zip,
          services: formData.services,
        }),
      }).catch((err) => console.warn('Non-blocking business patch:', err));

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving business profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 font-sans">
      {/* Profile Notice Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-[#059669] border border-emerald-200">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold font-heading text-slate-900">
                Business Profile: {activeBusiness.name}
              </h2>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Core profile belonging to this business. Verified information feeds the Business Brain, local SEO, and client documents.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto shrink-0"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
          <span>Business profile changes have been saved to your workspace and database!</span>
        </div>
      )}

      {/* 1. CORE IDENTITY */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#059669]" />
            <span>Business Identity & Overview</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Basic identity parameters representing your selected business.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Business Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. ABC Dental"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Category / Industry *
            </label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Dental Clinic"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Legal Business Name
            </label>
            <input
              type="text"
              value={formData.legalName}
              onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              placeholder="e.g. ABC Dental Pty Ltd"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
            >
              <option value="USD">USD ($)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="NZD">NZD (NZ$)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Business Description & Value Proposition
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your services, patient/client focus, and what sets your business apart..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* 2. CONTACT & LOCATION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#059669]" />
            <span>Contact & Address Information</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical headquarters and customer contact channels.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Website
            </label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="e.g. abcdental.com.au"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +61 3 9000 1234"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Public Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. contact@abcdental.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <GoogleAddressAutocomplete
            value={formData.address}
            onChange={(val) => setFormData({ ...formData, address: val })}
            label="Street Address"
            helperText="Type or search via Google Places autocomplete"
            onSelectLocation={handleLocationSelect}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Melbourne"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              State / Region
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="e.g. VIC"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Postal / ZIP Code
            </label>
            <input
              type="text"
              value={formData.zip}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              placeholder="e.g. 3000"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Country
            </label>
            <CountryAutocomplete
              value={formData.country}
              onChange={(val) => setFormData({ ...formData, country: val })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Operating Hours
          </label>
          <input
            type="text"
            value={formData.hours}
            onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
            placeholder="e.g. Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* 3. SERVICES */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#059669]" />
            <span>Offered Services</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Key capabilities used for automated schema generation, local SEO ranking, and client proposals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {formData.services.map((srv, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200"
            >
              <span>{srv}</span>
              <button
                type="button"
                onClick={() => handleRemoveService(srv)}
                className="hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 max-w-md">
          <input
            type="text"
            value={newServiceInput}
            onChange={(e) => setNewServiceInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddService();
              }
            }}
            placeholder="Add new service (e.g. Teeth Whitening)..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddService}
            className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold cursor-pointer transition-colors shrink-0"
          >
            Add Service
          </button>
        </div>
      </div>

      {/* 4. LOGO & BRANDING */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#059669]" />
            <span>Logo & Visual Media</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload your official logo for portal branding, reports, and directory cards.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Logo Preview */}
          <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 overflow-hidden shrink-0 shadow-2xs">
            {logoUrlInput ? (
              <img
                src={logoUrlInput}
                alt="Business Logo"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <Building2 className="w-8 h-8 text-slate-300" />
            )}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Logo File</span>
              </button>

              {logoUrlInput && (
                <button
                  type="button"
                  onClick={() => {
                    setLogoUrlInput('');
                    updateBusinessProfile({ logoUrl: '' });
                  }}
                  className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-medium cursor-pointer transition-colors"
                >
                  Remove Logo
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Supports PNG, JPG, or SVG. Transparent background recommended.
            </p>
          </div>
        </div>
      </div>

      {/* 5. SOCIAL LINKS & ONLINE PRESENCE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#059669]" />
            <span>Social Links & Citations</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Public citations and profile links to strengthen organic local authority.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Google Maps / GBP Place URL
            </label>
            <input
              type="text"
              value={formData.googleMapsUrl}
              onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
              placeholder="https://maps.google.com/?cid=..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              LinkedIn Profile
            </label>
            <input
              type="text"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/company/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Facebook Page
            </label>
            <input
              type="text"
              value={formData.facebookUrl}
              onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
              placeholder="https://facebook.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Instagram Handle / URL
            </label>
            <input
              type="text"
              value={formData.instagramUrl}
              onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <p className="text-xs text-slate-500">
          All modifications apply directly to <strong>{activeBusiness.name}</strong>'s unified profile.
        </p>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
