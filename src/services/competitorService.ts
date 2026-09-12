import { Competitor, CompetitorSnapshot } from '../types/production';

class CompetitorService {
  async getCompetitors(businessId: string): Promise<Competitor[]> {
    const res = await fetch(`/api/production/competitors/${encodeURIComponent(businessId)}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getSnapshots(businessId: string): Promise<CompetitorSnapshot[]> {
    const res = await fetch(`/api/production/competitors/${encodeURIComponent(businessId)}/snapshots`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}

export const competitorService = new CompetitorService();
