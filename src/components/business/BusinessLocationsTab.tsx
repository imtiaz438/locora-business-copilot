import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GoogleAddressAutocomplete, LocationData } from '../GoogleAddressAutocomplete';
import { CountryAutocomplete } from '../CountryAutocomplete';
import {
  MapPinned,
  Building2,
  Plus,
  Trash2,
  CheckCircle2,
  MapPin,
  Phone,
  Clock,
  AlertCircle,
  X,
  Info,
  GitFork,
} from 'lucide-react';

export const BusinessLocationsTab: React.FC = () => {
  const {
    activeBusiness,
    addLocation,
    removeLocation,
    user,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states for Add Location
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('United States');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');

  // Primary location derived from core business address
  const primaryLocation = {
    id: 'primary',
    name: activeBusiness.locationName || `${activeBusiness.city || 'Primary'} Location (HQ)`,
    address: activeBusiness.address || '',
    city: activeBusiness.city || '',
    state: activeBusiness.state || '',
    country: activeBusiness.country || 'United States',
    zip: activeBusiness.zip || '',
    phone: activeBusiness.phone || '',
    isMain: true,
  };

  // Secondary locations
  const secondaryLocations = activeBusiness.locations || [];
  const allLocations = [primaryLocation, ...secondaryLocations];

  const handleLocationSelect = (loc: LocationData) => {
    if (loc.address) setAddress(loc.address);
    if (loc.city) setCity(loc.city);
    if (loc.state) setState(loc.state);
    if (loc.country) setCountry(loc.country);
    if (loc.zip) setZip(loc.zip);
    if (!name) {
      setName(`${loc.city || 'Secondary'} Location`);
    }
  };

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addLocation(activeBusiness.id, {
      name: name.trim(),
      address: address.trim() || activeBusiness.address || '',
      city: city.trim() || activeBusiness.city || '',
      state: state.trim() || activeBusiness.state || '',
      country: country.trim() || 'United States',
      zip: zip.trim() || activeBusiness.zip || '',
      phone: phone.trim() || activeBusiness.phone || '',
    });

    setName('');
    setAddress('');
    setCity('');
    setState('');
    setCountry('United States');
    setZip('');
    setPhone('');
    setShowAddModal(false);

    setFeedback({
      type: 'success',
      message: `Location "${name}" added to ${activeBusiness.name}. It does not count against your business quota.`,
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDeleteLocation = (locationId: string) => {
    if (removeLocation) {
      removeLocation(activeBusiness.id, locationId);
      setFeedback({
        type: 'success',
        message: 'Location removed successfully.',
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header card with action */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-[#059669] border border-emerald-200">
              <MapPinned className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold font-heading text-slate-900">
                Locations: {activeBusiness.name}
              </h2>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Physical locations belonging to this business. Locations share the business identity and profile, and do not count against your Business plan quota.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Location</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VISUAL HIERARCHY TREE (As specified in requirement 9) */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold font-heading text-slate-900">
          <GitFork className="w-4 h-4 text-[#059669]" />
          <span>Unified Business & Locations Architecture</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          A physical location does <strong>not</strong> become another Business unless you explicitly create a separate Business. Locations allow you to manage multiple physical addresses while keeping the business identity and profile unified.
        </p>

        {/* Tree Display */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 font-mono text-xs text-slate-700 space-y-1 overflow-x-auto shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Building2 className="w-3.5 h-3.5 text-[#059669]" />
            <span>{activeBusiness.name}</span>
          </div>
          <div className="pl-4 text-slate-600">
            ├── <span>Business Profile (Shared Core Identity)</span>
          </div>
          <div className="pl-4 text-slate-600">
            ├── <span>Location: {primaryLocation.city || 'Primary'} (Primary Location)</span>
          </div>
          {secondaryLocations.map((loc, idx) => {
            const isLast = idx === secondaryLocations.length - 1;
            return (
              <div key={loc.id} className="pl-4 text-slate-600">
                {isLast ? '└──' : '├──'} <span>Location: {loc.name || loc.city || `Location ${idx + 2}`}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* LOCATIONS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-heading text-slate-900">
            Physical Locations ({allLocations.length})
          </h3>
          <span className="text-xs text-slate-500">
            Quota: Shared under {activeBusiness.name}
          </span>
        </div>

        {allLocations.map((loc) => {
          const isMain = loc.isMain;
          const addressLine = loc.address
            ? `${loc.address}, ${loc.city || ''} ${loc.state || ''} ${loc.zip || ''}`
            : `${loc.city || 'City not set'}, ${loc.state || loc.country || ''}`;

          return (
            <div
              key={loc.id}
              className={`bg-white border rounded-2xl p-5 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isMain ? 'border-emerald-200' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-sm font-bold text-slate-900 font-heading">
                    {loc.name}
                  </h4>
                  {isMain ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#059669] border border-emerald-200">
                      Primary Location
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      Additional Location
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{addressLine}</span>
                </p>

                {loc.phone && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{loc.phone}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 sm:self-center shrink-0">
                {!isMain && (
                  <button
                    onClick={() => handleDeleteLocation(loc.id)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-xs font-medium cursor-pointer transition-colors"
                    title="Remove this location"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-fadeIn font-sans">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#059669] uppercase tracking-wider font-heading">
                  Unified Business Hierarchy
                </span>
                <h3 className="text-lg font-bold font-heading text-slate-900">
                  Add Location to {activeBusiness.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This location belongs to {activeBusiness.name} and does not consume a business slot.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Richmond Location / Eastside Clinic"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <GoogleAddressAutocomplete
                  value={address}
                  onChange={setAddress}
                  label="Street Address"
                  helperText="Search address via Google Places autocomplete"
                  onSelectLocation={handleLocationSelect}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Richmond"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. VIC"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="e.g. 3121"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Country
                  </label>
                  <CountryAutocomplete
                    value={country}
                    onChange={setCountry}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +61 3 9428 1234"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#059669] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
