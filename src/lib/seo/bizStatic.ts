/**
 * Static body content for directory business pages (/biz/<slug>), injected
 * at serve time into #root for non-JS crawlers (see server.ts
 * handleHtmlRequest). Same pattern as scripts/prerenderPages.ts: the React
 * detail view fetches its listing client-side, so crawlers otherwise see an
 * empty shell and Google classifies the page as a soft 404.
 *
 * Built ONLY from the listing's real fields — the published snapshot entity
 * plus, when available, the full listing behind GET
 * /api/directory/business/:slugOrId (description + review texts). Absent
 * fields are skipped, never defaulted or padded: no invented services, no
 * placeholder hours, no ratings that were not recorded. The honesty guards
 * mirror DirectoryBusinessDetailView (rating shown only when a real rating
 * AND review count exist; hours only when authentic hours are present).
 *
 * No JSON-LD is emitted here: per-route structured data is owned by the
 * metadata layer (resolveRouteMetadata / generateCompletePageSeo), which
 * already injects its schema into <head> for these routes.
 *
 * React's createRoot().render() clears #root before mounting, so this is a
 * progressive enhancement only — browsers never receive it (server injects
 * for crawler user agents only, per the no-flash policy).
 */
import { escapeHtml } from '../../utils/seoMetadata';
import type { PublishedBusinessEntity } from './types';

const e = escapeHtml;

function cleanText(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/**
 * Normalize opening hours from either stored shape — string[] (already
 * "Day: time" lines or raw strings) or a Record<day, time> map — into
 * display lines. Mirrors the formatting in DirectoryBusinessDetailView.
 * Returns [] when no authentic hours exist.
 */
function normalizeHours(hours: unknown): string[] {
  if (!hours) return [];
  if (Array.isArray(hours)) {
    return hours
      .filter((h): h is string => typeof h === 'string' && h.trim().length > 0)
      .map((h) => h.trim());
  }
  if (typeof hours === 'object') {
    return Object.entries(hours as Record<string, unknown>)
      .filter(([, time]) => typeof time === 'string' && (time as string).trim().length > 0)
      .map(([day, time]) => `${day}: ${(time as string).trim()}`);
  }
  return [];
}

function uniqueStrings(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const s = cleanText(item);
    if (s && !seen.has(s.toLowerCase())) {
      seen.add(s.toLowerCase());
      out.push(s);
    }
  }
  return out;
}

/**
 * Build the static HTML body for one published directory listing.
 *
 * @param entity      The published snapshot entity (name, category, city,
 *                    contact facts, services, rating — already restricted
 *                    to published listings by the snapshot builder).
 * @param fullListing Optional full listing from
 *                    dbService.getDirectoryListingBySlugOrId (or the static
 *                    fallback), used only for the extras the snapshot does
 *                    not carry: description and review texts. Ignored when
 *                    it reports itself suspended or unpublished.
 */
export function buildBizStaticHtml(
  entity: PublishedBusinessEntity,
  fullListing?: any | null
): string {
  if (!entity || !entity.name) return '';

  const extras =
    fullListing &&
    fullListing.directoryStatus !== 'SUSPENDED' &&
    fullListing.isPublishedInDirectory !== false
      ? fullListing
      : null;

  const name = entity.name;
  const cityState = [cleanText(entity.city), cleanText(entity.state)]
    .filter(Boolean)
    .join(', ');
  const subline = entity.category
    ? cityState
      ? `${entity.category} in ${cityState}`
      : entity.category
    : cityState;

  // Rating: real rating AND a real review count, or nothing (same guard
  // the client view applies to its aggregate rating).
  const rating =
    typeof entity.rating === 'number' && entity.rating > 0
      ? entity.rating
      : typeof extras?.gbpData?.averageRating === 'number' && extras.gbpData.averageRating > 0
        ? extras.gbpData.averageRating
        : null;
  const reviewCount =
    typeof entity.reviewCount === 'number' && entity.reviewCount > 0
      ? entity.reviewCount
      : typeof extras?.gbpData?.reviewCount === 'number' && extras.gbpData.reviewCount > 0
        ? extras.gbpData.reviewCount
        : null;
  const ratingLine =
    rating !== null && reviewCount !== null
      ? `<p>Rated ${rating.toFixed(1)} out of 5 based on ${reviewCount} customer reviews</p>`
      : '';

  // About: only the listing's own recorded description, when one exists.
  const description =
    cleanText(extras?.scrapedContent?.description) ||
    cleanText(extras?.scrapedContent?.aboutSummary);
  const aboutBlock = description
    ? `<section>\n<h2>About ${e(name)}</h2>\n<p>${e(description)}</p>\n</section>`
    : '';

  // Contact facts: address / phone / website, each only when recorded.
  const rawAddress =
    cleanText(entity.address) ||
    cleanText(extras?.address) ||
    cleanText(extras?.gbpData?.address);
  let address = rawAddress;
  if (address && cityState && !address.toLowerCase().includes(cleanText(entity.city).toLowerCase())) {
    address = `${address}, ${cityState}`;
  }
  const phone = cleanText(entity.phone) || cleanText(extras?.phone) || cleanText(extras?.gbpData?.phone);
  const rawWebsite = cleanText(entity.website) || cleanText(extras?.websiteUrl);
  const website = rawWebsite
    ? rawWebsite.startsWith('http')
      ? rawWebsite
      : `https://${rawWebsite}`
    : '';
  const contactItems: string[] = [];
  if (address) contactItems.push(`<p>Address: ${e(address)}</p>`);
  if (phone) {
    const telHref = phone.replace(/[^+\d]/g, '');
    contactItems.push(`<p>Phone: <a href="tel:${e(telHref)}">${e(phone)}</a></p>`);
  }
  if (website) {
    contactItems.push(`<p>Website: <a href="${e(website)}" rel="noopener noreferrer">${e(website)}</a></p>`);
  }
  const contactBlock = contactItems.length
    ? `<section>\n<h2>Contact &amp; location</h2>\n${contactItems.join('\n')}\n</section>`
    : '';

  // Services: the listing's recorded services only.
  const services = uniqueStrings(
    entity.services && entity.services.length > 0
      ? entity.services
      : extras?.scrapedContent?.serviceTags
  );
  const servicesBlock = services.length
    ? `<section>\n<h2>Services</h2>\n<ul>\n${services.map((s) => `  <li>${e(s)}</li>`).join('\n')}\n</ul>\n</section>`
    : '';

  // Opening hours: only authentic recorded hours.
  const hoursLines = normalizeHours(
    entity.openingHours && entity.openingHours.length > 0
      ? entity.openingHours
      : extras?.gbpData?.hours
  );
  const hoursBlock = hoursLines.length
    ? `<section>\n<h2>Opening hours</h2>\n<ul>\n${hoursLines.map((h) => `  <li>${e(h)}</li>`).join('\n')}\n</ul>\n</section>`
    : '';

  // Reviews: the listing's own recorded review texts (top 3, already
  // ordered most-recent-first by the data layer). No source is claimed —
  // the static layer does not label reviews as Google or otherwise.
  const rawReviews: any[] = Array.isArray(extras?.gbpData?.reviews) ? extras.gbpData.reviews : [];
  const reviews = rawReviews
    .filter((r) => r && cleanText(r.comment).length > 0)
    .slice(0, 3);
  const reviewsBlock = reviews.length
    ? `<section>\n<h2>Customer reviews</h2>\n${reviews
        .map((r) => {
          const author = cleanText(r.authorName);
          const when = cleanText(r.relativePublishTimeDescription);
          const stars =
            typeof r.rating === 'number' && r.rating > 0 ? `Rated ${r.rating} out of 5` : '';
          const footer = [author, stars, when].filter(Boolean).join(' · ');
          return `<blockquote>\n<p>${e(cleanText(r.comment))}</p>${footer ? `\n<footer>${e(footer)}</footer>` : ''}\n</blockquote>`;
        })
        .join('\n')}\n</section>`
    : '';

  const canonical = `https://locoraai.com/biz/${entity.slug}`;
  const claimBlock = `<p>Is this your business? <a href="${e(canonical)}">Claim this listing</a> to update your details, respond to reviews, and run a free visibility checkup.</p>`;

  return [
    `<article>`,
    `<header>`,
    `<h1>${e(name)}</h1>`,
    subline ? `<p>${e(subline)}</p>` : '',
    ratingLine,
    `</header>`,
    aboutBlock,
    contactBlock,
    servicesBlock,
    hoursBlock,
    reviewsBlock,
    claimBlock,
    `</article>`,
  ]
    .filter(Boolean)
    .join('\n');
}
