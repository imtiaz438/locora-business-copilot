import fs from 'fs';
import path from 'path';
import { resolveRouteMetadata, injectMetadataIntoHtml } from '../src/utils/seoMetadata';
import { getArticleSlug, getArticleMeta, injectArticleContent } from './prerenderArticles';
import { SEO_RESOURCES_DATABASE } from '../src/data/seo/resourcesData';

const MARKETING_ROUTES_TO_PRERENDER: string[] = [
  '/directory',
  '/products',
  '/pricing',
  '/features',
  '/resources',
  '/use-cases',
  '/about',
  '/contact',
  '/security',
  '/privacy',
  '/terms',
  '/refund',
  // Layer 3: Industry PSEO Pages
  '/for/restaurants',
  '/for/hvac-contractors',
  '/for/real-estate',
  '/for/law-firms',
  '/for/plumbers',
  '/for/med-spas',
  '/for/auto-repair',
  '/for/contractors',
  '/for/agencies',
  '/for/dentists',
  // Layer 1: Feature Detail Pages
  '/features/ai-business-audit',
  '/features/marketing-planner',
  '/features/seo-audit',
  '/features/ai-proposal-generator',
  '/features/document-generator',
  '/features/ai-business-chat',
  '/features/crm',
  '/features/invoicing',
  '/features/reputation-management',
  // Layer 2: Use Cases Pages
  '/use-cases/local-seo',
  '/use-cases/lead-generation',
  '/use-cases/client-management',
  '/use-cases/marketing-planning',
  '/use-cases/agency-operations',
  '/use-cases/business-growth',
  // Layer 4: Resource articles — generated dynamically from the article database
  // so every current and future article is prerendered automatically.
  ...Object.keys(SEO_RESOURCES_DATABASE).map((slug) => `/resources/${slug}`),
];

async function prerenderMarketingRoutes() {
  const distPath = path.resolve(process.cwd(), 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');

  if (!fs.existsSync(indexHtmlPath)) {
    console.warn('[Prerender] dist/index.html not found. Skipping static HTML generation.');
    return;
  }

  const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
  console.log(`[Prerender] Generating static HTML for ${MARKETING_ROUTES_TO_PRERENDER.length} marketing routes...`);

  let count = 0;
  let articleCount = 0;
  for (const route of MARKETING_ROUTES_TO_PRERENDER) {
    const meta = resolveRouteMetadata(route, 'locoraai.com');
    // Article routes get their real per-article title/description plus
    // server-side body content + JSON-LD so non-JS crawlers can read them.
    const articleSlug = getArticleSlug(route);
    const finalMeta = articleSlug ? { ...meta, ...getArticleMeta(articleSlug) } : meta;
    let prerenderedHtml = injectMetadataIntoHtml(baseHtml, finalMeta);
    if (articleSlug) {
      prerenderedHtml = injectArticleContent(prerenderedHtml, articleSlug);
      articleCount++;
    }

    const cleanRoute = route.replace(/^\/+/, '');
    const routeDir = path.join(distPath, cleanRoute);

    // 1. Write nested directory index.html (e.g. dist/products/index.html)
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    fs.writeFileSync(path.join(routeDir, 'index.html'), prerenderedHtml, 'utf-8');

    // 2. Also write direct .html file if not a root slash (e.g. dist/products.html)
    const directFile = path.join(distPath, `${cleanRoute}.html`);
    const parentDir = path.dirname(directFile);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(directFile, prerenderedHtml, 'utf-8');

    count++;
  }

  console.log(`[Prerender] Successfully pre-rendered ${count} public marketing routes with unique metadata and self-referential canonical tags (${articleCount} with server-side article content for AI crawlers).`);
}

prerenderMarketingRoutes().catch((err) => {
  console.error('[Prerender] Fatal error during static pre-rendering:', err);
  process.exit(1);
});
