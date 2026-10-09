import { GrowthOpportunity, GrowthPlan, GrowthTask } from '../types/production';

class GrowthService {
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 20000): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  async getOpportunities(businessId: string): Promise<GrowthOpportunity[]> {
    // Bounded wait: a hung backend must fail into the honest empty state,
    // never leave the UI spinning forever.
    const res = await this.fetchWithTimeout(`/api/production/growth/${encodeURIComponent(businessId)}/opportunities`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getPlans(businessId: string): Promise<GrowthPlan[]> {
    const res = await fetch(`/api/production/growth/${encodeURIComponent(businessId)}/plans`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getTasks(businessId: string): Promise<GrowthTask[]> {
    const res = await fetch(`/api/production/growth/${encodeURIComponent(businessId)}/tasks`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async detectOpportunities(businessId: string): Promise<GrowthOpportunity[]> {
    const res = await fetch(`/api/production/growth/${encodeURIComponent(businessId)}/opportunities/detect`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.opportunities || [];
  }

  async updateTaskStatus(
    businessId: string,
    taskId: string,
    status: 'todo' | 'in_progress' | 'done'
  ): Promise<GrowthTask> {
    const res = await fetch(`/api/production/growth/${encodeURIComponent(businessId)}/tasks/${encodeURIComponent(taskId)}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}

export const growthService = new GrowthService();
