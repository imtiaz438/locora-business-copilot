import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BusinessProfileTab } from './business/BusinessProfileTab';
import { BusinessLocationsTab } from './business/BusinessLocationsTab';
import { BusinessDirectoryTab } from './business/BusinessDirectoryTab';
import {
  Building2,
  MapPinned,
  Globe,
  Sliders,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface BusinessHubViewProps {
  initialTab?: 'profile' | 'locations' | 'directory';
}

export const BusinessHubView: React.FC<BusinessHubViewProps> = ({
  initialTab = 'profile',
}) => {
  const {
    activeBusiness,
    businesses,
    setIsAddBusinessModalOpen,
    activeTab,
    setActiveTab,
  } = useApp();

  // Determine initial subtab based on prop or global activeTab
  const getSubTabFromContext = (): 'profile' | 'locations' | 'directory' => {
    if (activeTab === 'business_locations') return 'locations';
    if (activeTab === 'business_directory') return 'directory';
    if (activeTab === 'business_profile') return 'profile';
    return initialTab;
  };

  const [currentTab, setCurrentTab] = useState<'profile' | 'locations' | 'directory'>(
    getSubTabFromContext()
  );

  useEffect(() => {
    if (activeTab === 'business_locations') setCurrentTab('locations');
    else if (activeTab === 'business_directory') setCurrentTab('directory');
    else if (activeTab === 'business' || activeTab === 'business_profile') setCurrentTab('profile');
  }, [activeTab]);

  const hasBusiness = Boolean(
    activeBusiness &&
    activeBusiness.id &&
    activeBusiness.id !== 'workspace_pending' &&
    businesses.length > 0
  );

  if (!hasBusiness) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto mb-5 border border-emerald-100">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
              No Business Profile Configured
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Add your first business to manage profiles, configure physical locations, and publish to the verified directory.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setIsAddBusinessModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#059669] hover:bg-[#047857] text-white shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your Business</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const locationCount = (activeBusiness?.locations?.length || 0) + 1;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      {/* Top Business Context Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <button
                  onClick={() => setActiveTab('settings_businesses')}
                  className="hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Businesses</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-900 font-heading">
                  {activeBusiness?.name || 'Active Business'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#059669] border border-emerald-200">
                  Active Workspace
                </span>
              </div>
              <h1 className="text-xl font-extrabold font-heading text-slate-900 tracking-tight mt-1">
                {currentTab === 'profile' && 'Business Profile'}
                {currentTab === 'locations' && 'Business Locations'}
                {currentTab === 'directory' && 'Directory Publishing'}
              </h1>
            </div>

            {/* Quick Action: Settings -> Businesses */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('settings_businesses')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                title="View All Businesses & Plan Quotas"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span>Manage All Businesses</span>
              </button>
            </div>
          </div>

          {/* Unified Sub-Navigation Tabs: Profile, Locations, Directory */}
          <div className="flex items-center gap-2 mt-4 border-b border-slate-100 pb-0.5">
            <button
              onClick={() => {
                setCurrentTab('profile');
                setActiveTab('business');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                currentTab === 'profile'
                  ? 'border-[#059669] text-[#059669]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('locations');
                setActiveTab('business_locations');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                currentTab === 'locations'
                  ? 'border-[#059669] text-[#059669]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapPinned className="w-4 h-4" />
              <span>Locations</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {locationCount}
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('directory');
                setActiveTab('business_directory');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                currentTab === 'directory'
                  ? 'border-[#059669] text-[#059669]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Directory</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  activeBusiness?.isPublishedInDirectory
                    ? 'bg-emerald-500'
                    : 'bg-slate-300'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'profile' && <BusinessProfileTab />}
        {currentTab === 'locations' && <BusinessLocationsTab />}
        {currentTab === 'directory' && <BusinessDirectoryTab />}
      </div>
    </div>
  );
};
