import { AIProviderConfig, AIProviderId } from '../types';

export const SUPPORTED_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'groq',
    name: 'Groq (Meta Llama 3.3 70B & 3.1 8B)',
    description: 'Ultra-low-latency high-speed inference powered by specialized LPU chips for instant real-time AI responses (Default AI Engine on Free & All Plans)',
    apiKeyEnv: 'GROQ_API_KEY',
    isCustomKeySet: true,
    model: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Meta Llama 3.3 70B Versatile', description: 'Flagship open model running at 300+ tokens/sec on Groq LPUs (Recommended Default)', badge: 'Ultra Fast Default', isDefault: true },
      { id: 'llama-3.1-8b-instant', name: 'Meta Llama 3.1 8B Instant', description: 'Sub-second lightweight generation ideal for rapid draft summaries and replies', badge: 'Fastest Free' },
      { id: 'llama-3.2-3b-preview', name: 'Meta Llama 3.2 3B Preview', description: 'Ultra-compact lightweight model with lightning fast latency', badge: 'Ultra Low Latency' },
      { id: 'llama-3.2-1b-preview', name: 'Meta Llama 3.2 1B Preview', description: 'Smallest footprint instant generation model', badge: 'Lightweight' },
      { id: 'llama3-70b-8192', name: 'Meta Llama 3 70B', description: 'High-capacity 70B parameter model with 8k context', badge: '70B Capacity' },
      { id: 'llama3-8b-8192', name: 'Meta Llama 3 8B', description: 'Instant response model for high-frequency commands', badge: 'Instant 8B' },
      { id: 'mixtral-8x7b-32768', name: 'Mistral Mixtral 8x7B', description: 'High-performance Mixture-of-Experts with 32k context window', badge: 'MoE' },
      { id: 'gemma2-9b-it', name: 'Google Gemma 2 9B (Groq)', description: 'Google high-efficiency instruction-tuned model running on Groq LPUs', badge: 'Gemma 9B' },
    ],
    isUpcoming: false,
    statusTag: 'Active / Default Engine',
    category: 'Ultra Fast LPU',
  },
  {
    id: 'gemini',
    name: 'Google Gemini 3.6 & 3.7',
    description: 'Multimodal AI model optimized for business reasoning, code synthesis & document generation',
    apiKeyEnv: 'GEMINI_API_KEY',
    isCustomKeySet: false,
    model: 'gemini-3.6-flash',
    models: [
      { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', description: 'Ultra-fast, low latency, intelligent multimodal reasoning', badge: 'Multimodal Flash', isDefault: true },
      { id: 'gemini-3.6-pro', name: 'Gemini 3.6 Pro', description: 'Advanced mathematical, multi-step business logic and deep reasoning', badge: 'Deep Reasoning' },
      { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', description: 'Flagship multimodal speed & high-throughput generation', badge: 'Latest Gen' },
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', description: 'Next-gen enterprise reasoning and long context capabilities', badge: 'Pro Preview' },
      { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', description: 'Lightweight high-efficiency model for quick utilities', badge: 'Lite' },
    ],
    isUpcoming: false,
    statusTag: 'Active / Multi-Model',
    category: 'Multimodal Engine',
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT-5.6 Sol / Terra / Luna & GPT-4o)',
    description: 'Precision frontier intelligence for complex coding, scientific reasoning, legal strategy, and high-volume tasks (Supports GPT-5.6 Sol, Terra, Luna & GPT-4o)',
    apiKeyEnv: 'OPENAI_API_KEY',
    isCustomKeySet: false,
    model: 'gpt-5.6-sol',
    models: [
      { id: 'gpt-5.6-sol', name: 'GPT-5.6 Sol (or Soul)', description: 'The flagship, most powerful frontier model designed for complex coding, heavy science tasks, advanced reasoning, and professional work.', badge: 'Flagship Frontier', isDefault: true },
      { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra', description: 'A balanced mid-tier model that offers strong performance for everyday work while remaining significantly cheaper to run than Sol.', badge: 'Balanced Mid-Tier' },
      { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna', description: 'A fast, highly cost-efficient model optimized for high-volume or lightweight tasks.', badge: 'Fast & Cost-Efficient' },
      { id: 'gpt-4o', name: 'GPT-4o (Omni Multimodal)', description: 'General high-capability multimodal model for business operations and daily drafting', badge: 'Omni' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast, cost-effective model for daily drafts and quick replies', badge: 'Fast' },
      { id: 'o3-mini', name: 'o3-mini (Deep Reasoning)', description: 'Deep reasoning model for math, coding, and logical planning', badge: 'Reasoning' },
    ],
    isUpcoming: false,
    statusTag: 'Active / BYOK Ready',
    category: 'Frontier & General Intelligence',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude (3.7 Sonnet, Opus 4.8 & Haiku 4.5)',
    description: 'Nuanced writing, empathetic customer support replies, and persuasive marketing copy (Supports Claude 3.7 Sonnet, Opus 4.8 & Haiku 4.5)',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    isCustomKeySet: false,
    model: 'claude-3-7-sonnet-20250219',
    models: [
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', description: 'Hybrid reasoning and instant response model with unmatched writing quality', badge: 'Latest 3.7', isDefault: true },
      { id: 'claude-opus-4-8', name: 'Claude Opus 4.8 (claude-opus-4-8)', description: 'Former state-of-the-art flagship model now transitioned to legacy/fallback status.', badge: 'Legacy Flagship' },
      { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5 (claude-haiku-4-5)', description: 'The lightweight, high-speed model optimized for rapid responses with extended thinking capabilities.', badge: 'High-Speed Thinking' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Industry benchmark for nuanced copy and sophisticated code', badge: 'Proven' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Lightning-fast generation for customer service and quick summaries', badge: 'Fast' },
    ],
    isUpcoming: false,
    statusTag: 'Active / BYOK Ready',
    category: 'Creative & Nuanced',
  },
  {
    id: 'perplexity',
    name: 'Perplexity Sonar Search',
    description: 'Live web-grounded business research, competitor discovery, and live local market intelligence with citations',
    apiKeyEnv: 'PERPLEXITY_API_KEY',
    isCustomKeySet: false,
    model: 'sonar-pro',
    models: [
      { id: 'sonar-pro', name: 'Sonar Pro Search', description: 'Deep web search grounding with multi-source verification & rich citations', badge: 'Deep Web', isDefault: true },
      { id: 'sonar', name: 'Sonar Fast Search', description: 'Fast online search grounding for real-time market queries', badge: 'Fast' },
    ],
    isUpcoming: false,
    statusTag: 'Active / BYOK Ready',
    category: 'Web Grounded',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek V3 & R1',
    description: 'Open-weights reasoning engine with exceptional coding, cost-efficiency, and mathematical analysis',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    isCustomKeySet: false,
    model: 'deepseek-chat',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek-V3 (671B)', description: 'General high-performance language model for copywriting and business logic', badge: 'V3 671B', isDefault: true },
      { id: 'deepseek-reasoner', name: 'DeepSeek-R1 (Reasoning)', description: 'Reinforcement-learning-optimized reasoning for complex problem solving', badge: 'R1 Reasoning' },
    ],
    isUpcoming: false,
    statusTag: 'Active / BYOK Ready',
    category: 'High-Efficiency Reasoning',
  },
  // Upcoming / Future Roadmap AI Models (Coming in Next Releases)
  {
    id: 'grok',
    name: 'xAI Grok (Grok 3 & Grok 3 Deep Reasoning)',
    description: 'Real-time social sentiment analysis, viral hook generation, and live x.com web search grounding with frontier reasoning',
    apiKeyEnv: 'GROK_API_KEY',
    isCustomKeySet: false,
    model: 'grok-3-beta',
    isUpcoming: true,
    statusTag: 'Coming Soon • Q3 Roadmap',
    category: 'Realtime Search & Social',
  },
  {
    id: 'cursor',
    name: 'Cursor AI Agent Protocol (v2 Autonomous)',
    description: 'Autonomous multi-file business logic generation, deep codebase indexing, and multi-step workflow refactoring',
    apiKeyEnv: 'CURSOR_AGENT_KEY',
    isCustomKeySet: false,
    model: 'cursor-agent-v2',
    isUpcoming: true,
    statusTag: 'Coming Soon • Q3 Roadmap',
    category: 'Agentic Autonomous AI',
  },
  {
    id: 'llama4',
    name: 'Meta Llama 4 Frontier (400B+ Reasoning)',
    description: 'Next-generation open-weights frontier model architecture with native multimodal reasoning and 1M context window',
    apiKeyEnv: 'LLAMA4_API_KEY',
    isCustomKeySet: false,
    model: 'llama-4-frontier-preview',
    isUpcoming: true,
    statusTag: 'Coming Soon • Frontier Preview',
    category: 'Open Frontier AI',
  },
  {
    id: 'apple_intelligence',
    name: 'Apple Intelligence & Private Cloud Gateway',
    description: 'Enterprise privacy-first on-device intelligence and confidential cloud compute business workflows',
    apiKeyEnv: 'APPLE_INTELLIGENCE_KEY',
    isCustomKeySet: false,
    model: 'apple-pcc-gateway',
    isUpcoming: true,
    statusTag: 'Coming Soon • Enterprise Beta',
    category: 'Private Cloud Compute',
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
