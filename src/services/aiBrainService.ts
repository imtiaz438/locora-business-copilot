import { BusinessBrain, AiAction } from '../types/production';

class AiBrainService {
  async getBrain(businessId: string): Promise<BusinessBrain | null> {
    const res = await fetch(`/api/production/brain/${encodeURIComponent(businessId)}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async synthesize(businessId: string): Promise<BusinessBrain> {
    const res = await fetch(`/api/production/brain/${encodeURIComponent(businessId)}/synthesize`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getAiActions(businessId: string): Promise<AiAction[]> {
    const res = await fetch(`/api/production/brain/${encodeURIComponent(businessId)}/actions`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async executeAction(businessId: string, actionType: string, payload: Record<string, any>): Promise<AiAction> {
    const res = await fetch(`/api/production/brain/${encodeURIComponent(businessId)}/actions`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionType, payload }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}

export const aiBrainService = new AiBrainService();
