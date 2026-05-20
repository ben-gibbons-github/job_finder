import axios from 'axios';
import { getCachedLocationSearch, setCachedLocationSearch } from './LocationSearchCache.js';
export async function searchLocationsOpenStreetMap(query) {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length < 2) {
        return [];
    }
    const cached = await getCachedLocationSearch(normalizedQuery);
    if (cached) {
        return cached;
    }
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
            q: query,
            format: 'jsonv2',
            addressdetails: 1,
            limit: 8,
        },
        headers: {
            'User-Agent': 'JobFinder/1.0 (location-autocomplete)',
        },
    });
    const rawResults = Array.isArray(response.data) ? response.data : [];
    const mapped = rawResults
        .map((item) => {
        const city = item?.address?.city ||
            item?.address?.town ||
            item?.address?.village ||
            item?.address?.hamlet ||
            item?.name ||
            String(item?.display_name || '').split(',')[0];
        const state = item?.address?.state;
        const country = item?.address?.country;
        const lat = Number.parseFloat(item?.lat);
        const lng = Number.parseFloat(item?.lon);
        if (!city || Number.isNaN(lat) || Number.isNaN(lng)) {
            return null;
        }
        return {
            value: `${city}|${lat}|${lng}`,
            label: city,
            country,
            state,
            displayLabel: [city, state, country].filter(Boolean).join(', '),
            lat,
            lng,
        };
    })
        .filter((item) => item !== null);
    const deduped = Array.from(new Map(mapped.map((loc) => [loc.displayLabel.toLowerCase(), loc])).values());
    await setCachedLocationSearch(normalizedQuery, deduped);
    return deduped;
}
