import { useEffect } from 'react';
import type { SeoPageContext, CompletePageSeoResult } from '../lib/seo/types';
import { generateCompletePageSeo } from '../lib/seo/seoService';

function updateMetaTag(attributeName: 'name' | 'property', attributeValue: string, content: string) {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateCanonicalLink(url: string) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function updateJsonLd(data: Record<string, any>) {
  if (typeof document === 'undefined') return;
  const scriptId = 'locora-dynamic-seo-ld';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data, null, 2);
}

export type DynamicSeoHookReturn = CompletePageSeoResult & {
  seoResult: CompletePageSeoResult;
};

/**
 * React hook that injects and manages dynamic SEO/GEO metadata, OpenGraph,
 * Twitter card, canonical tags, and Schema.org structured data.
 */
export function useDynamicSeo(
  inputContextOrResult: SeoPageContext | CompletePageSeoResult,
  dependencies: any[] = []
): DynamicSeoHookReturn {
  const result: CompletePageSeoResult =
    'keywords' in inputContextOrResult && 'metadata' in inputContextOrResult
      ? (inputContextOrResult as CompletePageSeoResult)
      : generateCompletePageSeo(inputContextOrResult as SeoPageContext);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const { metadata, structuredData } = result;

    // 1. Title
    document.title = metadata.title;

    // 2. Meta description & robots
    updateMetaTag('name', 'description', metadata.metaDescription);
    updateMetaTag('name', 'robots', metadata.robots);

    // 3. Canonical Link
    updateCanonicalLink(metadata.canonicalUrl);

    // 4. OpenGraph tags
    updateMetaTag('property', 'og:title', metadata.openGraph.title);
    updateMetaTag('property', 'og:description', metadata.openGraph.description);
    updateMetaTag('property', 'og:url', metadata.openGraph.url);
    updateMetaTag('property', 'og:type', metadata.openGraph.type);
    updateMetaTag('property', 'og:site_name', metadata.openGraph.siteName);
    if (metadata.openGraph.image) {
      updateMetaTag('property', 'og:image', metadata.openGraph.image);
    }

    // 5. Twitter Card
    updateMetaTag('name', 'twitter:card', metadata.twitter.card);
    updateMetaTag('name', 'twitter:title', metadata.twitter.title);
    updateMetaTag('name', 'twitter:description', metadata.twitter.description);
    if (metadata.twitter.image) {
      updateMetaTag('name', 'twitter:image', metadata.twitter.image);
    }

    // 6. Schema.org JSON-LD
    updateJsonLd(structuredData);
  }, [
    result.metadata.title,
    result.metadata.metaDescription,
    result.metadata.canonicalUrl,
    result.metadata.robots,
    ...dependencies,
  ]);

  return Object.assign(result, { seoResult: result });
}
