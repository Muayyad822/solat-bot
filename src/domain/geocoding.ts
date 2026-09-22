import { find as findTimezone } from 'geo-tz';
import axios from 'axios';

export interface LocationDetails {
  timezone: string;
  city: string;
  state: string;
  country: string;
  continent: string;
  locationName: string;
}

/**
 * Resolves location details (City, State, Country, Continent, Timezone, and formatted Location Name)
 * given latitude and longitude coordinates.
 */
export async function resolveLocationDetails(lat: number, lng: number): Promise<LocationDetails> {
  // 1. Resolve IANA Timezone using geo-tz offline database
  const timezones = findTimezone(lat, lng);
  const timezone = timezones[0] || 'UTC';

  let city = '';
  let state = '';
  let country = '';
  let continent = '';

  // 2. Reverse Geocode via BigDataCloud API (lightweight, fast, no API key required)
  try {
    const res = await axios.get('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      params: {
        latitude: lat,
        longitude: lng,
        localityLanguage: 'en',
      },
      timeout: 3500,
      headers: {
        'User-Agent': 'NidaaBot/1.0 (https://nidaa.app)',
      },
    });

    if (res.data) {
      const data = res.data;
      city = data.city || data.locality || data.localityInfo?.informative?.[0]?.name || '';
      state = data.principalSubdivision || '';
      country = data.countryName || '';
      continent = data.continent || '';
    }
  } catch (err) {
    console.warn('[Geocoding] BigDataCloud reverse geocode failed, attempting Nominatim fallback:', (err as Error).message);
  }

  // 3. Fallback to OpenStreetMap Nominatim if BigDataCloud didn't return city & country
  if (!city || !country) {
    try {
      const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          format: 'json',
          lat,
          lon: lng,
          zoom: 10,
        },
        timeout: 3500,
        headers: {
          'User-Agent': 'NidaaBot/1.0 (https://nidaa.app)',
        },
      });

      if (res.data && res.data.address) {
        const addr = res.data.address;
        if (!city) city = addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
        if (!state) state = addr.state || addr.region || '';
        if (!country) country = addr.country || '';
      }
    } catch (err) {
      console.warn('[Geocoding] Nominatim fallback failed:', (err as Error).message);
    }
  }

  // 4. Construct human-friendly Location Name
  let locationName = '';
  if (city && country) {
    locationName = state && state !== city ? `${city}, ${state}, ${country}` : `${city}, ${country}`;
  } else if (state && country) {
    locationName = `${state}, ${country}`;
  } else if (country) {
    locationName = country;
  } else {
    // If reverse geocoding unavailable, fallback to readable timezone name
    locationName = timezone.replace('_', ' ');
  }

  return {
    timezone,
    city,
    state,
    country,
    continent,
    locationName,
  };
}

/**
 * Returns a human-readable fallback location string from an IANA timezone identifier
 * for existing users registered prior to reverse-geocoding integration.
 */
export function getFallbackLocationName(tz?: string): string {
  if (!tz) return 'Location Set';
  const cleanTz = tz.trim();

  // Known IANA mapping shortcuts
  if (cleanTz === 'Africa/Lagos') return 'Lagos, Nigeria';
  if (cleanTz === 'Africa/Accra') return 'Accra, Ghana';
  if (cleanTz === 'Africa/Cairo') return 'Cairo, Egypt';
  if (cleanTz === 'Europe/London') return 'London, United Kingdom';
  if (cleanTz === 'Asia/Kuala_Lumpur') return 'Kuala Lumpur, Malaysia';
  if (cleanTz === 'Asia/Riyadh') return 'Riyadh, Saudi Arabia';
  if (cleanTz === 'America/New_York') return 'New York, USA';

  const parts = cleanTz.split('/');
  if (parts.length >= 2) {
    const cityOrRegion = parts[parts.length - 1].replace(/_/g, ' ');
    const continentOrRegion = parts[0].replace(/_/g, ' ');
    return `${cityOrRegion}, ${continentOrRegion}`;
  }
  return cleanTz.replace(/_/g, ' ');
}

