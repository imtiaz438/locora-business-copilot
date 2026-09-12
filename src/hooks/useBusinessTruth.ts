import { useApp } from '../context/AppContext';
import type { BusinessTruth } from '../types';

/**
 * Hook to access the canonical Business Truth / Business Brain context.
 *
 * Strict Rules:
 * - Every feature must read business identity and business facts from this service.
 * - If a field is missing, return null.
 * - Never substitute another business.
 * - Never invent a value.
 */
export function useBusinessTruth(): {
  businessTruth: BusinessTruth | null;
  isLoading: boolean;
  getBusinessTruth: (businessId: string, forceFresh?: boolean) => Promise<BusinessTruth | null>;
  refreshBusinessTruth: (businessId?: string) => Promise<BusinessTruth | null>;
} {
  const { businessTruth, isLoadingBusinessTruth, getBusinessTruth, refreshBusinessTruth } = useApp();

  return {
    businessTruth,
    isLoading: isLoadingBusinessTruth,
    getBusinessTruth,
    refreshBusinessTruth,
  };
}
