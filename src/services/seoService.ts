import {
  TrackedKeyword,
  RankSnapshot,
  VisibilitySnapshot,
  WebsiteProject,
  CrawlRun,
  WebsiteIssue,
  SchemaData,
} from '../types/production';

class SeoService {
  async getTrackingStatus(businessId: string): Promise<{
    isConfigured: boolean;
    provider: string | null;
    providerStatus: string;
    trackedKeywordsCount: number;
    observationsCount: number;
    lastObservedAt: string | null;
    latestVisibility: VisibilitySnapshot | null;
  }> {
    const res = await fetch(`/api/production/seo/${encodeURIComponent(businessId)}/status`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async configureRankingTracker(businessId: string, providerName?: string): Promise<any> {
    const res = await fetch(`/api/production/seo/${encodeURIComponent(businessId)}/configure-tracker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ providerName }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async addTrackedKeyword(businessId: string, keyword: string, targetLocation?: string): Promise<TrackedKeyword> {
    const res = await fetch(`/api/production/seo/${encodeURIComponent(businessId)}/keywords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ keyword, targetLocation }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async recordSearchObservation(businessId: string, data: {
    keywordId: string;
    rankPosition: number;
    previousPosition?: number;
    searchEngine?: string;
    device?: string;
    snapshotDate?: string;
  }): Promise<RankSnapshot> {
    const res = await fetch(`/api/production/seo/${encodeURIComponent(businessId)}/record-observation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getSerpResults(businessId: string): Promise<any[]> {
    const res = await fetch(`/api/production/seo/${encodeURIComponent(businessId)}/serp-results`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getTrackedKeywords(businessId: string): Promise<TrackedKeyword[]> {
    const res = await fetch(`/api/production/seo/${encodeURIComponent(businessId)}/keywords`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getRankSnapshots(businessId: string): Promise<RankSnapshot[]> {
    const res = await fetch(`/api/production/seo/${encodeURIComponent(businessId)}/rank-snapshots`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getVisibilitySnapshots(businessId: string): Promise<VisibilitySnapshot[]> {
    const res = await fetch(`/api/production/seo/${encodeURIComponent(businessId)}/visibility`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getWebsiteIssues(businessId: string): Promise<WebsiteIssue[]> {
    const res = await fetch(`/api/production/seo/${encodeURIComponent(businessId)}/issues`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}

export const seoService = new SeoService();
