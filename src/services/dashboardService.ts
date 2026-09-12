import {
  NormalizedDashboardData,
  GrowthOpportunity,
  CalculatedMetrics,
  BusinessBrain,
} from '../types/production';

/**
 * Dashboard Data Access Service
 * 
 * Flow:
 * Dashboard UI → dashboardService → /api/production/dashboard → database/provider → normalized Locora data → UI
 * 
 * Strict multi-tenant isolation: Always requests data for the authenticated business_id.
 * UI components NEVER invent or hardcode data.
 */
class DashboardService {
  private cache: Map<string, { data: NormalizedDashboardData; timestamp: number }> = new Map();
  private readonly CACHE_TTL_MS = 60 * 1000; // 1 minute local freshness window

  /**
   * Retrieves full normalized dashboard data for the authenticated business
   */
  async getDashboard(businessId?: string, forceRefresh = false): Promise<NormalizedDashboardData> {
    const targetBizId = businessId || 'active';
    const cached = this.cache.get(targetBizId);

    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    const url = `/api/production/dashboard/${encodeURIComponent(targetBizId)}`;
    const res = await fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      if (res.status === 403) {
        throw new Error('Access denied: You do not have permission to view this business data.');
      }
      throw new Error(`Failed to load dashboard data: HTTP ${res.status}`);
    }

    const data: NormalizedDashboardData = await res.json();
    this.cache.set(targetBizId, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Fetches only the calculated metrics for the authenticated business
   */
  async getCalculatedMetrics(businessId?: string): Promise<CalculatedMetrics> {
    const dashboard = await this.getDashboard(businessId);
    return dashboard.calculatedMetrics;
  }

  /**
   * Fetches prioritized growth opportunities for the authenticated business
   */
  async getOpportunities(businessId?: string): Promise<GrowthOpportunity[]> {
    const dashboard = await this.getDashboard(businessId);
    return dashboard.opportunities;
  }

  /**
   * Fetches AI Business Brain synthesis for the authenticated business
   */
  async getBusinessBrain(businessId?: string): Promise<BusinessBrain | null> {
    const dashboard = await this.getDashboard(businessId);
    return dashboard.businessBrain;
  }

  /**
   * Invalidate local cache for a business
   */
  invalidateCache(businessId?: string): void {
    if (businessId) {
      this.cache.delete(businessId);
    } else {
      this.cache.clear();
    }
  }
}

export const dashboardService = new DashboardService();
