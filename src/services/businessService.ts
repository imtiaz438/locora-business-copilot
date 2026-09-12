import { Business, Location, DataConnection } from '../types/production';

class BusinessService {
  async getBusinesses(): Promise<Business[]> {
    const res = await fetch('/api/production/businesses', { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getBusiness(businessId: string): Promise<Business> {
    const res = await fetch(`/api/production/business/${encodeURIComponent(businessId)}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getLocations(businessId: string): Promise<Location[]> {
    const res = await fetch(`/api/production/locations/${encodeURIComponent(businessId)}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getDataConnections(businessId: string): Promise<DataConnection[]> {
    const res = await fetch(`/api/production/connections/${encodeURIComponent(businessId)}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async updateBusiness(businessId: string, updates: Partial<Business>): Promise<Business> {
    const res = await fetch(`/api/production/business/${encodeURIComponent(businessId)}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}

export const businessService = new BusinessService();
