import fs from 'fs';
import path from 'path';
import { saveAiVisibilityCheck, getAiVisibilityChecks } from '../../db/service.ts';
import type { AiVisibilityObservation, AiVisibilityCheckItem } from './types.ts';

export interface BusinessProfileForAi {
  name: string;
  industry?: string;
  city?: string;
  state?: string;
  country?: string;
  competitors?: string[];
}

export interface ProviderKeys {
  openai?: string;
  anthropic?: string;
  perplexity?: string;
  groq?: string;
}

export function getAppLevelLlmKeys(): ProviderKeys {
  let diskKeys: Record<string, string> = {};
  try {
    const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const content = fs.readFileSync(settingsPath, 'utf8');
      const parsed = JSON.parse(content);
      diskKeys = parsed.providerKeys || {};
    }
  } catch {
    // ignore
  }

  return {
    openai: diskKeys.OPENAI_API_KEY || diskKeys.openaiKey || diskKeys.openai || process.env.OPENAI_API_KEY || '',
    anthropic: diskKeys.ANTHROPIC_API_KEY || diskKeys.anthropicKey || diskKeys.anthropic || diskKeys.claude || process.env.ANTHROPIC_API_KEY || '',
    perplexity: diskKeys.PERPLEXITY_API_KEY || diskKeys.perplexityKey || diskKeys.perplexity || process.env.PERPLEXITY_API_KEY || '',
    groq: diskKeys.GROQ_API_KEY || diskKeys.groqKey || diskKeys.groq || process.env.GROQ_API_KEY || '',
  };
}

/**
 * Generate representative queries for an AI engine from business profile data
 */
export function generateAiPrompts(profile: BusinessProfileForAi): string[] {
  const ind = profile.industry || 'services provider';
  const loc = profile.city ? `${profile.city}${profile.state ? ', ' + profile.state : ''}` : 'the area';

  return [
    `Who are the best ${ind} companies in ${loc}? List your top recommendations with a brief explanation.`,
    `Can you recommend top rated ${ind} specialists near ${loc}?`,
  ];
}

/**
 * Query an individual LLM provider with standard concise prompt.
 * Strictly no mock simulation: if a provider key is not configured or fails,
 * return success: false without fabricating text.
 */
async function queryLlmProvider(
  provider: 'openai' | 'anthropic' | 'perplexity' | 'groq',
  prompt: string,
  keys: ProviderKeys,
  businessName: string
): Promise<{ text: string; success: boolean; error?: string }> {
  // 1. OpenAI
  if (provider === 'openai' && keys.openai) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
        headers: {
          Authorization: `Bearer ${keys.openai}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.2,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const text = json.choices?.[0]?.message?.content || '';
        return { text, success: Boolean(text.trim()) };
      }
    } catch (e: any) {
      console.warn('[AiVisibility] OpenAI call failed:', e?.message || e);
    }
  }

  // 2. Anthropic
  if (provider === 'anthropic' && keys.anthropic) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
        headers: {
          'x-api-key': keys.anthropic,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const block = json.content?.[0];
        const text = block?.text || '';
        return { text, success: Boolean(text.trim()) };
      }
    } catch (e: any) {
      console.warn('[AiVisibility] Anthropic call failed:', e?.message || e);
    }
  }

  // 3. Gemini — REMOVED Oct 2026 (region restrictions produced
  //    user-incomprehensible failures; fan-out keeps OpenAI/Anthropic/Perplexity/Groq).

  // 4. Perplexity
  if (provider === 'perplexity' && keys.perplexity) {
    try {
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
        headers: {
          Authorization: `Bearer ${keys.perplexity}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const text = json.choices?.[0]?.message?.content || '';
        return { text, success: Boolean(text.trim()) };
      }
    } catch (e: any) {
      console.warn('[AiVisibility] Perplexity call failed:', e?.message || e);
    }
  }

  // 5. Groq
  if (provider === 'groq' && keys.groq) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
        headers: {
          Authorization: `Bearer ${keys.groq}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const text = json.choices?.[0]?.message?.content || '';
        return { text, success: Boolean(text.trim()) };
      }
    } catch (e: any) {
      console.warn('[AiVisibility] Groq call failed:', e?.message || e);
    }
  }

  // NO SIMULATION: Never fabricate an AI observation if provider wasn't queried
  return {
    text: '',
    success: false,
    error: `Provider ${provider} not configured or API key unavailable`,
  };
}

/**
 * Parse actual response text to extract:
 * business_mentioned, position, competitors_mentioned, citation_sources
 */
function parseObservationDetails(rawText: string, businessName: string, knownCompetitors: string[] = []) {
  const textLower = rawText.toLowerCase();
  const bName = businessName.trim();
  const bNameLower = bName.toLowerCase();
  const businessMentioned = bNameLower.length > 2 && textLower.includes(bNameLower);

  let position: number | null = null;
  const lines = rawText.split('\n');
  const competitorCandidates: string[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    // Match "1. Brand Name: desc" or "1) Brand Name -" or "**1. Brand Name**"
    const numberedMatch = trimmed.match(/^(\d+)[\.\)]\s*(?:\*\*)?([A-Za-z0-9&',. ]+?)(?:\*\*)?(?::|\s-\s|\s–\s|\n|$)/);
    if (numberedMatch) {
      const rankNum = parseInt(numberedMatch[1], 10);
      const entityName = numberedMatch[2].trim();
      if (businessMentioned && position === null && entityName.toLowerCase().includes(bNameLower)) {
        position = rankNum;
      } else if (entityName.length > 2 && !entityName.toLowerCase().includes(bNameLower)) {
        competitorCandidates.push(entityName);
      }
    } else {
      // Bullet matches: "- **Acme Plumbing** - "
      const bulletMatch = trimmed.match(/^(?:[-*•])\s*(?:\*\*)?([A-Za-z0-9&',. ]+?)(?:\*\*)?(?::|\s-\s|\s–\s)/);
      if (bulletMatch) {
        const entityName = bulletMatch[1].trim();
        if (entityName.length > 2 && !entityName.toLowerCase().includes(bNameLower)) {
          competitorCandidates.push(entityName);
        }
      }
    }
  });

  if (businessMentioned && position === null) {
    if (textLower.includes('first recommendation') || textLower.includes('top choice') || textLower.includes('#1')) {
      position = 1;
    }
  }

  // Cross-reference with known competitors
  const competitorsMentioned = new Set<string>();
  for (const comp of knownCompetitors) {
    if (comp && comp.length > 2 && textLower.includes(comp.toLowerCase())) {
      competitorsMentioned.add(comp);
    }
  }
  for (const cand of competitorCandidates) {
    if (cand.length > 2 && cand.length < 40 && !['the', 'based', 'note', 'here', 'these', 'top', 'best'].includes(cand.toLowerCase())) {
      competitorsMentioned.add(cand);
    }
  }

  // Citation sources: URLs or domain names
  const citationSources = new Set<string>();
  const urlMatches = rawText.match(/https?:\/\/[^\s)\]>"']+/gi);
  if (urlMatches) {
    for (const u of urlMatches) {
      try {
        const parsedUrl = new URL(u);
        citationSources.add(parsedUrl.hostname.replace(/^www\./, ''));
      } catch {
        citationSources.add(u);
      }
    }
  }
  const domainMatches = rawText.match(/\b([a-zA-Z0-9-]+\.(?:com|org|net|gov|edu|ai|co|io))\b/gi);
  if (domainMatches) {
    for (const d of domainMatches) {
      const lowerD = d.toLowerCase();
      if (!['openai.com', 'anthropic.com', 'google.com'].includes(lowerD)) {
        citationSources.add(lowerD);
      }
    }
  }

  return {
    businessMentioned,
    position,
    competitorsMentioned: Array.from(competitorsMentioned).slice(0, 8),
    citationSources: Array.from(citationSources).slice(0, 8),
  };
}

/**
 * Execute genuine multi-LLM brand citation benchmark.
 * Queries configured providers (OpenAI, Anthropic, Perplexity, Groq)
 * and stores each real observation with all 9 required fields in database & disk storage.
 * If no providers are configured or responsive, NO fake metrics are created.
 */
export async function executeAiVisibilityAudit(params: {
  userId: string;
  userEmail?: string;
  businessId?: string;
  profile: BusinessProfileForAi;
}): Promise<{
  checks: AiVisibilityObservation[];
  score: number | null; // null if no observations exist, percentage if real observations exist
  totalMentions: number;
  totalChecks: number;
  provider_status?: 'success' | 'not_configured' | 'authentication_error' | 'quota_exceeded' | 'unavailable' | 'connected_no_data';
  message?: string;
}> {
  const prompts = generateAiPrompts(params.profile);
  const keys = getAppLevelLlmKeys();

  // Detect which providers are actually configured
  const candidateProviders: Array<'openai' | 'anthropic' | 'perplexity' | 'groq'> = [];
  if (keys.openai) candidateProviders.push('openai');
  if (keys.perplexity) candidateProviders.push('perplexity');
  if (keys.anthropic) candidateProviders.push('anthropic');
  if (keys.groq) candidateProviders.push('groq');

  if (candidateProviders.length === 0) {
    return {
      checks: [],
      score: null,
      totalMentions: 0,
      totalChecks: 0,
      provider_status: 'not_configured',
      message: 'No AI provider API key configured. Provide an API key (e.g. OpenAI, Anthropic, Perplexity, Groq) to execute real AI visibility queries.',
    };
  }

  const results: AiVisibilityObservation[] = [];
  let mentionCount = 0;
  const bName = (params.profile.name || '').trim();
  const locationStr = [params.profile.city, params.profile.state].filter(Boolean).join(', ') || 'Local Area';

  // Run prompts across candidate providers
  for (const provider of candidateProviders) {
    for (const query of prompts) {
      const { text, success } = await queryLlmProvider(provider, query, keys, bName);
      if (!success || !text.trim()) continue;

      const { businessMentioned, position, competitorsMentioned, citationSources } = parseObservationDetails(
        text,
        bName,
        params.profile.competitors || []
      );

      if (businessMentioned) mentionCount++;

      const record: AiVisibilityObservation = {
        id: `aiv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        businessId: params.businessId || '',
        userId: params.userId,
        userEmail: params.userEmail,
        businessName: bName,
        query,
        date: new Date().toISOString(),
        location: locationStr,
        provider,
        business_mentioned: businessMentioned,
        position,
        competitors_mentioned: competitorsMentioned,
        citation_sources: citationSources,
        raw_observation: text,
        // Compatibility
        prompt: query,
        mentioned: businessMentioned,
        responseSnippet: text.slice(0, 180).trim(),
        checkedAt: new Date().toISOString(),
      };

      // Persist to Database table ai_visibility_checks and disk fallback
      await saveAiVisibilityCheck(record);
      results.push(record);
    }
  }

  const totalChecks = results.length;
  const score = totalChecks > 0 ? Math.round((mentionCount / totalChecks) * 100) : null;

  return {
    checks: results,
    score,
    totalMentions: mentionCount,
    totalChecks,
    provider_status: totalChecks > 0 ? 'success' : 'connected_no_data',
    message: totalChecks === 0 ? 'Connected to AI providers, but no observations were returned.' : undefined,
  };
}

/**
 * Retrieve past real AI visibility observations for user or business
 */
export async function getAiVisibilityHistory(userIdOrEmailOrBusinessId?: string): Promise<AiVisibilityObservation[]> {
  const rows = await getAiVisibilityChecks(userIdOrEmailOrBusinessId, 50);
  return (rows || []).map((r: any) => ({
    id: r.id,
    businessId: r.businessId || '',
    userId: r.userId,
    userEmail: r.userEmail,
    businessName: r.businessName,
    query: r.query || r.prompt || '',
    date: r.date || (r.checkedAt ? new Date(r.checkedAt).toISOString() : new Date().toISOString()),
    location: r.location || '',
    provider: r.provider,
    business_mentioned: Boolean(r.business_mentioned ?? r.businessMentioned ?? r.mentioned),
    position: typeof r.position === 'number' ? r.position : null,
    competitors_mentioned: r.competitors_mentioned || r.competitorsMentioned || [],
    citation_sources: r.citation_sources || r.citationSources || [],
    raw_observation: r.raw_observation || r.rawObservation || r.responseSnippet || '',
    prompt: r.query || r.prompt || '',
    mentioned: Boolean(r.business_mentioned ?? r.businessMentioned ?? r.mentioned),
    responseSnippet: r.responseSnippet || (r.raw_observation ? r.raw_observation.slice(0, 180) : ''),
    checkedAt: r.date || (r.checkedAt ? new Date(r.checkedAt).toISOString() : new Date().toISOString()),
  }));
}

