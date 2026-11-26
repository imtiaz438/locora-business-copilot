/**
 * Public response serializer for the directory API (Task 4 — privacy
 * sanitization, 2026-11-26).
 *
 * The directory data layer builds ONE listing record shape for every
 * consumer — owner workspace, admin tooling and the public API alike.
 * That record carries owner and operational fields (contact/owner email,
 * internal database id, Google location id, plan tier, source
 * attributions, diagnostic snapshot, directory metrics). Before this
 * module existed, GET /api/directory/business/:slugOrId and
 * GET /api/directory/listings returned the record verbatim to anonymous
 * callers, exposing those fields to anyone.
 *
 * toPublicBusinessDto builds the anonymous / non-owner response
 * FIELD BY FIELD from the explicit allowlist below — it never copies
 * the record and deletes keys, so a field added to the record tomorrow
 * stays private by default. Only fields a directory visitor
 * legitimately needs (and that the public pages actually render) are
 * included:
 *
 * - Identity & contact facts shown on the public profile: name, slug,
 *   website, phone, address, coordinates (map embed), category/city/
 *   state names + slugs.
 * - Public display state: published flag, directory status label,
 *   claimed / verified / GBP-connected badges, and a DERIVED
 *   `isPremium` boolean (the plan tier itself is never exposed; the
 *   public card/detail views only ever derived a premium badge from
 *   it).
 * - Review-source label: the public pages label the displayed reviews
 *   ("Google" vs "Owner-added"); the coarse enum is kept for that
 *   label. The internal `sourceAttributions` pipeline object is NOT
 *   kept.
 * - Social profile links the profile renders publicly.
 * - gbpData display subset: phone/address fallbacks, opening hours,
 *   rating + review count, the public review texts (with the business's
 *   public replies), and public media URLs (logo / cover / photos).
 * - scrapedContent display subset: meta title, description, service
 *   tags, about summary.
 *
 * Everything else — email / ownerEmail / claimedByEmail, internal id,
 * googleLocationId, planTier, sourceAttributions, diagnosticSnapshot,
 * directoryMetrics, qualityScore/qualityStatus, targetKeywords,
 * lastSyncedAt, gbpData.source, per-review internal ids, createdAt /
 * updatedAt — is excluded by construction.
 *
 * Authenticated OWNERS never pass through this serializer for their own
 * business: the handlers verify ownership server-side (session token →
 * email, see isListingOwner) and return the full record as before.
 */

function asStringOrNull(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function asNumberOrNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** Premium display badge derivation — mirrors the public UI's former
 *  planTier comparison (pro / agency / growth) without exposing the tier. */
export function isPremiumTier(planTier: unknown): boolean {
  return planTier === 'pro' || planTier === 'agency' || planTier === 'growth';
}

/**
 * Server-side ownership test for a directory listing record: the
 * session email (from the validated session token — never from a
 * client-supplied header, query param or body field) must match one of
 * the record's owner identity fields. Mirrors the comparison the
 * business-detail handler has always used for its owner-preview gate.
 */
export function isListingOwner(listing: any, sessionEmail: string): boolean {
  if (!listing || !sessionEmail) return false;
  const email = sessionEmail.toLowerCase().trim();
  if (!email) return false;
  const candidates = [listing.ownerEmail, listing.email, listing.claimedByEmail];
  return candidates.some(
    (c) => typeof c === 'string' && c.toLowerCase().trim() === email
  );
}

/** Public review DTO: the fields the profile page renders for a review.
 *  The internal review record id is omitted (the UI used it only as a
 *  React key and now falls back to a positional key). */
export function toPublicReviewDto(review: any): Record<string, unknown> {
  if (!review || typeof review !== 'object') return {};
  return {
    authorName: asStringOrNull(review.authorName) || 'Verified Customer',
    rating: asNumberOrNull(review.rating),
    comment: typeof review.comment === 'string' ? review.comment : '',
    relativePublishTimeDescription: asStringOrNull(review.relativePublishTimeDescription),
    publishedAt: asStringOrNull(review.publishedAt),
    replyText: asStringOrNull(review.replyText),
    responseDate: asStringOrNull(review.responseDate),
    source: asStringOrNull(review.source),
  };
}

/**
 * Build the public (anonymous / non-owner) representation of one
 * directory listing record from the explicit allowlist. Tolerates both
 * record builders (Postgres mapper and in-memory mapper), whose shapes
 * differ slightly in which optional fields are present.
 */
export function toPublicBusinessDto(listing: any): Record<string, unknown> {
  const l = listing && typeof listing === 'object' ? listing : {};

  const gbp = l.gbpData && typeof l.gbpData === 'object' ? l.gbpData : null;
  const scraped =
    l.scrapedContent && typeof l.scrapedContent === 'object' ? l.scrapedContent : null;

  const socialLinks: Record<string, string> = {};
  if (l.socialLinks && typeof l.socialLinks === 'object') {
    for (const [k, v] of Object.entries(l.socialLinks)) {
      if (typeof v === 'string' && v.trim().length > 0) socialLinks[k] = v;
    }
  }

  const dto: Record<string, unknown> = {
    businessName: asStringOrNull(l.businessName) || '',
    slug: asStringOrNull(l.slug) || '',
    websiteUrl: asStringOrNull(l.websiteUrl) || '',
    phone: asStringOrNull(l.phone),
    address: asStringOrNull(l.address),
    latitude: asNumberOrNull(l.latitude),
    longitude: asNumberOrNull(l.longitude),
    categorySlug: asStringOrNull(l.categorySlug) || '',
    categoryName: asStringOrNull(l.categoryName) || '',
    citySlug: asStringOrNull(l.citySlug) || '',
    cityName: asStringOrNull(l.cityName) || '',
    stateCode: asStringOrNull(l.stateCode) || '',
    isPublishedInDirectory: l.isPublishedInDirectory === true,
    directoryStatus: asStringOrNull(l.directoryStatus),
    isClaimed: l.isClaimed === true,
    isVerified: l.isVerified === true,
    gbpConnected: l.gbpConnected === true,
    isPremium: isPremiumTier(l.planTier),
    reviewSource: asStringOrNull(l.reviewSource),
    socialLinks,
    gbpData: gbp
      ? {
          phone: asStringOrNull(gbp.phone),
          address: asStringOrNull(gbp.address),
          hours: gbp.hours ?? null,
          averageRating: asNumberOrNull(gbp.averageRating),
          reviewCount: asNumberOrNull(gbp.reviewCount) ?? 0,
          reviews: Array.isArray(gbp.reviews) ? gbp.reviews.map(toPublicReviewDto) : [],
          coverImageUrl: asStringOrNull(gbp.coverImageUrl),
          logoUrl: asStringOrNull(gbp.logoUrl),
          mediaPhotos: Array.isArray(gbp.mediaPhotos)
            ? gbp.mediaPhotos.filter((p: unknown) => typeof p === 'string')
            : [],
        }
      : null,
    scrapedContent: scraped
      ? {
          metaTitle: asStringOrNull(scraped.metaTitle),
          description: typeof scraped.description === 'string' ? scraped.description : '',
          serviceTags: Array.isArray(scraped.serviceTags)
            ? scraped.serviceTags.filter((s: unknown) => typeof s === 'string')
            : [],
          aboutSummary: typeof scraped.aboutSummary === 'string' ? scraped.aboutSummary : '',
        }
      : null,
  };

  // Owner-preview parity: the flag only ever exists on the owner path,
  // but keep the DTO shape stable if a draft record is ever serialized.
  if (l.isDraft === true) dto.isDraft = true;

  return dto;
}
