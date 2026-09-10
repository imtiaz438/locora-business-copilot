import { AIProviderConfig, AIProviderId } from '../types';

export const SUPPORTED_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'groq',
    name: 'Groq LPUs (Meta Llama 3.3 70B & 3.1 8B)',
    description: 'Ultra-low-latency real-time inference engine running at 300+ tokens/sec on specialized LPUs (Default Engine)',
    apiKeyEnv: 'GROQ_API_KEY',
    isCustomKeySet: true,
    model: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Meta Llama 3.3 70B Versatile', description: 'Flagship reasoning model running at 300+ tokens/sec on Groq LPUs', badge: 'Ultra Fast Default', isDefault: true },
      { id: 'llama-3.1-8b-instant', name: 'Meta Llama 3.1 8B Instant', description: 'Lightweight generation ideal for rapid draft summaries and replies', badge: 'Fastest Free' },
      { id: 'llama-3.2-3b-preview', name: 'Meta Llama 3.2 3B Preview', description: 'Ultra-compact lightweight model with lightning fast latency', badge: 'Ultra Low Latency' },
      { id: 'mixtral-8x7b-32768', name: 'Mistral Mixtral 8x7B (Groq)', description: 'High-performance Mixture-of-Experts with 32k context window', badge: 'MoE' },
    ],
    isUpcoming: false,
    statusTag: 'Active / Default Engine',
    category: 'Ultra Fast LPU',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude (3.7 Sonnet, Opus 4.8 & Haiku 4.5)',
    description: 'Nuanced writing, empathetic customer support replies, and persuasive marketing copy',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    isCustomKeySet: true,
    model: 'claude-3-7-sonnet-20250219',
    models: [
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', description: 'Hybrid reasoning and instant response model with unmatched writing quality', badge: 'Latest 3.7', isDefault: true },
      { id: 'claude-opus-4-8', name: 'Claude Opus 4.8', description: 'Deep strategic reasoning model for high-stakes business decisions', badge: 'Flagship' },
      { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', description: 'The lightweight, high-speed model optimized for rapid responses with extended thinking', badge: 'High-Speed Thinking' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Industry benchmark for nuanced copy and sophisticated code', badge: 'Proven' },
    ],
    isUpcoming: false,
    statusTag: 'Active / Advanced Intelligence',
    category: 'Creative & Nuanced',
  },
];

export const ACTIVE_PROVIDERS = SUPPORTED_PROVIDERS.filter((p) => !p.isUpcoming);
export const UPCOMING_PROVIDERS = SUPPORTED_PROVIDERS.filter((p) => p.isUpcoming);

export function getProviderConfig(providerId: AIProviderId): AIProviderConfig {
  return SUPPORTED_PROVIDERS.find((p) => p.id === providerId) || SUPPORTED_PROVIDERS[0];
}

export function getProviderModelsWithFallback(
  providerId: string,
  dynamicModelsMap?: Record<string, Array<{ id: string; name: string; description?: string; badge?: string }>>
): Array<{ id: string; name: string; description: string; badge?: string; isDefault?: boolean }> {
  if (dynamicModelsMap && dynamicModelsMap[providerId] && dynamicModelsMap[providerId].length > 0) {
    return dynamicModelsMap[providerId].map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description || `Discovered model (${m.id})`,
      badge: m.badge || 'Verified',
    }));
  }
  const config = SUPPORTED_PROVIDERS.find((p) => p.id === providerId);
  return (config?.models || []) as Array<{ id: string; name: string; description: string; badge?: string; isDefault?: boolean }>;
}

export function getModelDisplayName(providerId: string, modelId: string, dynamicModelsMap?: Record<string, Array<{ id: string; name: string }>>): string {
  const models = getProviderModelsWithFallback(providerId, dynamicModelsMap as any);
  const found = models.find((m) => m.id === modelId);
  if (found) return found.name;
  return modelId.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
