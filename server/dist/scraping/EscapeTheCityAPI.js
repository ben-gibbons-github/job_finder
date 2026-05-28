import { normalizeJobsWithCoordinates } from './PortalIngestionUtils.js';
const ALGOLIA_APP_ID = '6E1NSXNTTH';
const ALGOLIA_API_KEY = process.env.ESCAPE_THE_CITY_ALGOLIA_API_KEY ?? '';
const ALGOLIA_INDEX = 'listings-live';
const ESCAPE_BASE_URL = 'https://www.escapethecity.org';
const HITS_PER_PAGE = 120;
const MAX_ESCAPE_THE_CITY_PAGES = 200;
const FETCH_TIMEOUT_MS = 30_000;
function asStringArray(value) {
    if (!value) {
        return [];
    }
    return Array.isArray(value) ? value.filter(Boolean) : [value];
}
async function fetchEscapeTheCityPage(page) {
    if (!ALGOLIA_API_KEY) {
        throw new Error('Missing ESCAPE_THE_CITY_ALGOLIA_API_KEY');
    }
    const url = `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}/query`;
    const params = new URLSearchParams({
        query: '',
        page: String(page),
        hitsPerPage: String(HITS_PER_PAGE),
        facetFilters: JSON.stringify([
            ['published:true'],
            ['option-job-search-version:public-jobs'],
        ]),
    });
    const res = await fetch(url, {
        method: 'POST',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'job-finder-super-scraper/1.0',
            'x-algolia-application-id': ALGOLIA_APP_ID,
            'x-algolia-api-key': ALGOLIA_API_KEY,
        },
        body: JSON.stringify({ params: params.toString() }),
    });
    if (!res.ok) {
        throw new Error(`Algolia request failed: ${res.status} ${res.statusText}`);
    }
    return (await res.json());
}
function toNormalizedJob(hit) {
    const slug = (hit.slug || '').trim();
    const title = (hit['job-title'] || '').trim();
    if (!slug || !title) {
        return null;
    }
    const sourceUrl = `${ESCAPE_BASE_URL}/opportunity/${slug}`;
    const remoteOptions = asStringArray(hit['option-remote']);
    const roleTerms = asStringArray(hit['option-term']);
    return {
        title,
        company: (hit['org-name'] || 'Escape The City').trim(),
        location: (hit['location-txt'] || 'Unknown').trim(),
        remote: remoteOptions[0] || 'Unknown',
        type: roleTerms[0] || 'Unknown',
        sourceUrl,
        posted: hit['posted-date'] || undefined,
        description: hit.description || '',
        tags: ['EscapeTheCity', 'Mission Driven', ...asStringArray(hit.cause)],
    };
}
export async function fetchAllEscapeTheCityJobs() {
    try {
        const allJobs = [];
        const seenUrls = new Set();
        let totalPages = 1;
        for (let page = 0; page < Math.min(MAX_ESCAPE_THE_CITY_PAGES, totalPages); page += 1) {
            const data = await fetchEscapeTheCityPage(page);
            totalPages = Math.max(1, data.nbPages || totalPages);
            for (const hit of data.hits || []) {
                const job = toNormalizedJob(hit);
                if (!job || seenUrls.has(job.sourceUrl)) {
                    continue;
                }
                seenUrls.add(job.sourceUrl);
                allJobs.push(job);
            }
        }
        return normalizeJobsWithCoordinates('EscapeTheCity', allJobs);
    }
    catch (error) {
        console.warn('[EscapeTheCityAPI] Failed to fetch jobs:', String(error));
        return [];
    }
}
