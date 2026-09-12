import { GoogleBusinessLocation, GoogleReview, GoogleProfileMetric } from '../types/production';

export interface ReviewSourcesResponse {
  hasAnyConnectedSource: boolean;
  googleBusiness: {
    connected: boolean;
    rating: number;
    reviewCount: number;
    listingName: string | null;
    lastSyncedAt: string | null;
  };
  connectedProviders: Array<{
    provider: string;
    status: string;
    connectedAt: string | null;
    config: Record<string, any>;
  }>;
  userEnteredCount: number;
  totalVerifiedReviews: number;
}

class ReputationService {
  async getLocation(businessId: string): Promise<GoogleBusinessLocation | null> {
    const res = await fetch(`/api/production/reputation/${encodeURIComponent(businessId)}/location`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getReviews(businessId: string): Promise<GoogleReview[]> {
    const res = await fetch(`/api/production/reputation/${encodeURIComponent(businessId)}/reviews`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async getSources(businessId: string): Promise<ReviewSourcesResponse> {
    const res = await fetch(`/api/production/reputation/${encodeURIComponent(businessId)}/sources`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async addReview(
    businessId: string,
    review: {
      authorName: string;
      rating: number;
      text?: string;
      sentiment?: string;
      source?: string;
      publishedAt?: string;
      replyText?: string;
    }
  ): Promise<GoogleReview> {
    const res = await fetch(`/api/production/reputation/${encodeURIComponent(businessId)}/reviews`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async deleteReview(businessId: string, reviewId: string): Promise<{ success: boolean }> {
    const res = await fetch(
      `/api/production/reputation/${encodeURIComponent(businessId)}/reviews/${encodeURIComponent(reviewId)}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async replyToReview(businessId: string, reviewId: string, replyText: string): Promise<GoogleReview> {
    const res = await fetch(
      `/api/production/reputation/${encodeURIComponent(businessId)}/reviews/${encodeURIComponent(reviewId)}/reply`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText }),
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async connectProvider(
    businessId: string,
    provider: string,
    profileUrl?: string,
    profileName?: string
  ): Promise<{ success: boolean }> {
    const res = await fetch(`/api/production/reputation/${encodeURIComponent(businessId)}/providers/connect`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, profileUrl, profileName }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async disconnectProvider(businessId: string, provider: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/production/reputation/${encodeURIComponent(businessId)}/providers/disconnect`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}

export const reputationService = new ReputationService();
