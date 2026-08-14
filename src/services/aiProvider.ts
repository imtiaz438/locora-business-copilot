import { AIProviderConfig, AIProviderId } from '../types';

export const SUPPORTED_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'gemini',
    name: 'Google Gemini 3.6',
    description: 'Ultra-fast multimodal AI model optimized for business reasoning & content generation (Gemini 3.6 Flash)',
    apiKeyEnv: 'GEMINI_API_KEY',
    isCustomKeySet: true,
    model: 'gemini-3.6-flash',
    isUpcoming: false,
    statusTag: 'Active',
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT-4o)',
    description: 'High precision intelligence for complex strategy, legal contract drafting, and executive messaging',
    apiKeyEnv: 'OPENAI_API_KEY',
    isCustomKeySet: false,
    model: 'gpt-4o-mini',
    isUpcoming: false,
    statusTag: 'Active',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude 3.5',
    description: 'Nuanced writing, empathetic customer support replies, and persuasive marketing copy',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    isCustomKeySet: false,
    model: 'claude-3-5-sonnet',
    isUpcoming: false,
    statusTag: 'Active',
  },
  {
    id: 'perplexity',
    name: 'Perplexity Sonar',
    description: 'Web-grounded business research, competitor discovery, and live local market intelligence',
    apiKeyEnv: 'PERPLEXITY_API_KEY',
    isCustomKeySet: false,
    model: 'sonar-medium',
    isUpcoming: false,
    statusTag: 'Active',
  },
  // Upcoming / Coming Soon AI Models (Tagged as Upcoming)
  {
    id: 'opus',
    name: 'Anthropic Claude 3.7 Opus',
    description: 'Ultra-deep strategic reasoning, complex multi-step financial modeling, and long-form document synthesis',
    apiKeyEnv: 'ANTHROPIC_OPUS_API_KEY',
    isCustomKeySet: false,
    model: 'claude-3-7-opus',
    isUpcoming: true,
    statusTag: 'Upcoming Feature',
    category: 'Reasoning Engine',
  },
  {
    id: 'cursor',
    name: 'Cursor AI Agent',
    description: 'Autonomous multi-file business logic generation, deep codebase indexing, and workflow refactoring',
    apiKeyEnv: 'CURSOR_AGENT_KEY',
    isCustomKeySet: false,
    model: 'cursor-agent-v1',
    isUpcoming: true,
    statusTag: 'Upcoming Feature',
    category: 'Agentic AI',
  },
  {
    id: 'grok',
    name: 'xAI Grok (Grok 3)',
    description: 'Real-time social sentiment analysis, viral hook generation, and live x.com web search grounding',
    apiKeyEnv: 'GROK_API_KEY',
    isCustomKeySet: false,
    model: 'grok-3-beta',
    isUpcoming: true,
    statusTag: 'Upcoming Feature',
    category: 'Realtime Search & Social',
  },
];

export const ACTIVE_PROVIDERS = SUPPORTED_PROVIDERS.filter((p) => !p.isUpcoming);
export const UPCOMING_PROVIDERS = SUPPORTED_PROVIDERS.filter((p) => p.isUpcoming);

export function getProviderConfig(providerId: AIProviderId): AIProviderConfig {
  return SUPPORTED_PROVIDERS.find((p) => p.id === providerId) || SUPPORTED_PROVIDERS[0];
}
