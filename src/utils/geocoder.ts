/**
 * Resilient Multi-Provider Geocoding Utility
 * Safely resolves latitude and longitude coordinates for any business address,
 * street, city, state, postal code, or country string without failing.
 * Providers:
 * 1. Google Geocoding API (if Google Maps API key is configured)
 * 2. OpenStreetMap Photon Geocoder (high-speed global geocoding)
 * 3. OpenStreetMap Nominatim (authoritative fallback geocoding)
 */

export interface GeocodeInput {
  address?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  region?: string | null;
  zip?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress?: string;
  source: 'google' | 'photon' | 'nominatim';
}

function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

/**
 * Builds a clean, deduplicated address string for search queries.
 */
export function buildAddressQuery(input: GeocodeInput | string): string {
  if (typeof input === 'string') {
    return input.trim();
  }

  const street = (input.street || input.address || '').trim();
  const city = (input.city || '').trim();
  const state = (input.state || input.region || '').trim();
  const zip = (input.zip || input.postalCode || '').trim();
  const country = (input.country || '').trim() || 'United States';

  const parts: string[] = [];

  // Avoid repeating street if street is identical to zip or city
  if (street && street !== zip && street.toLowerCase() !== city.toLowerCase()) {
    parts.push(street);
  }

  if (city) {
    parts.push(city);
  }

  if (state && zip) {
    parts.push(`${state} ${zip}`);
  } else if (state) {
    parts.push(state);
  } else if (zip) {
    parts.push(zip);
  }

  if (country) {
    parts.push(country);
  }

  return parts.filter(Boolean).join(', ').trim();
}

/**
 * Resolve lat and lng coordinates for any given location address.
 */
export async function geocodeAddress(
  input: GeocodeInput | string,
  googleApiKey?: string
): Promise<GeocodeResult | null> {
  const query = buildAddressQuery(input);
  if (!query || query.length < 2) {
    return null;
  }

  // 1. Google Geocoding API (if key provided or present in environment)
  const apiKey = (
    googleApiKey ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    ''
  ).trim();

  if (apiKey) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const gRes = await fetch(gUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.status === 'OK' && gData.results && gData.results.length > 0) {
          const loc = gData.results[0].geometry?.location;
          if (loc && isValidCoordinate(Number(loc.lat), Number(loc.lng))) {
            return {
              lat: Number(loc.lat),
              lng: Number(loc.lng),
              formattedAddress: gData.results[0].formatted_address,
              source: 'google',
            };
          }
        }
      }
    } catch {
      // Continue to Photon
    }
  }

  // 2. OpenStreetMap Photon Geocoder
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const pUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
    const pRes = await fetch(pUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Locora/1.0 (support@locoraai.com)' },
    });
    clearTimeout(timeout);

    if (pRes.ok) {
      const pData = await pRes.json();
      if (pData.features && pData.features.length > 0) {
        const feat = pData.features[0];
        const coords = feat.geometry?.coordinates;
        if (Array.isArray(coords) && coords.length >= 2) {
          const lng = Number(coords[0]);
          const lat = Number(coords[1]);
          if (isValidCoordinate(lat, lng)) {
            const props = feat.properties || {};
            const desc = [
              props.name,
              props.street,
              props.city,
              props.state,
              props.postcode,
              props.country,
            ].filter(Boolean).join(', ');

            return {
              lat,
              lng,
              formattedAddress: desc || query,
              source: 'photon',
            };
          }
        }
      }
    }
  } catch {
    // Continue to Nominatim
  }

  // 3. OpenStreetMap Nominatim Geocoder
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const nUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const nRes = await fetch(nUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Locora/1.0 (support@locoraai.com)' },
    });
    clearTimeout(timeout);

    if (nRes.ok) {
      const nData = await nRes.json();
      if (Array.isArray(nData) && nData.length > 0) {
        const first = nData[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);
        if (isValidCoordinate(lat, lng)) {
          return {
            lat,
            lng,
            formattedAddress: first.display_name,
            source: 'nominatim',
          };
        }
      }
    }
  } catch {
    // Both failed
  }

  return null;
}
