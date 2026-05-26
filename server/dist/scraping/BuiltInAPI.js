import { fetchPortalJobsFromEndpointList } from './GenericEndpointPortalAPI.js';
import { normalizeJobsWithCoordinates } from './PortalIngestionUtils.js';
import { fetchPortalFallbackJobs } from './TerraBoardFallback.js';
const BUILTIN_JOBS_URL = 'https://www.builtin.com/jobs';
const MAX_BUILTIN_PAGES = 50;
function collectBuiltInEntries(value) {
    if (Array.isArray(value)) {
        return value.flatMap((item) => collectBuiltInEntries(item));
    }
    if (!value || typeof value !== 'object') {
        return [];
    }
    const obj = value;
    const entries = [];
    const url = typeof obj.url === 'string' ? obj.url : '';
    const title = typeof obj.name === 'string'
        ? obj.name
        : typeof obj.title === 'string'
            ? obj.title
            : '';
    if (url.includes('builtin.com') && title) {
        entries.push({
            title: title.trim(),
            company: 'BuiltIn',
            location: 'Remote',
            remote: 'Unknown',
            type: 'Full-time',
            sourceUrl: url,
            description: '',
            tags: ['BuiltIn'],
        });
    }
    for (const nested of Object.values(obj)) {
        entries.push(...collectBuiltInEntries(nested));
    }
    return entries;
}
async function fetchBuiltInPageJobs() {
    try {
        const normalized = [];
        for (let page = 1; page <= MAX_BUILTIN_PAGES; page += 1) {
            const url = page === 1 ? BUILTIN_JOBS_URL : `${BUILTIN_JOBS_URL}?page=${page}`;
            const response = await fetch(url, {
                method: 'GET',
                signal: AbortSignal.timeout(30_000),
                headers: {
                    Accept: 'text/html,application/xhtml+xml',
                    'User-Agent': 'job-finder-super-scraper/1.0',
                },
            });
            if (!response.ok) {
                if (page === 1) {
                    return [];
                }
                break;
            }
            const html = await response.text();
            const pageRows = [];
            const scriptPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
            for (const match of html.matchAll(scriptPattern)) {
                const raw = (match[1] || '').trim();
                if (!raw) {
                    continue;
                }
                try {
                    const parsed = JSON.parse(raw);
                    pageRows.push(...collectBuiltInEntries(parsed));
                }
                catch {
                    // Ignore malformed blocks and continue parsing other JSON-LD scripts.
                }
            }
            // BuiltIn frequently renders links directly in HTML without JSON-LD.
            const urlPattern = /https:\/\/builtin\.com\/job\/[^"]+/gi;
            for (const match of html.matchAll(urlPattern)) {
                const sourceUrl = (match[0] || '').trim();
                if (!sourceUrl) {
                    continue;
                }
                const slugPart = sourceUrl.split('/job/')[1] || '';
                const slugTitle = slugPart.split('/')[0]?.replace(/[-_]+/g, ' ').trim() || 'BuiltIn Job';
                pageRows.push({
                    title: slugTitle,
                    company: 'BuiltIn',
                    location: 'Remote',
                    remote: 'Unknown',
                    type: 'Full-time',
                    sourceUrl,
                    description: '',
                    tags: ['BuiltIn'],
                });
            }
            if (pageRows.length === 0) {
                break;
            }
            const before = normalized.length;
            normalized.push(...pageRows);
            const added = normalized.length - before;
            if (added === 0) {
                break;
            }
            const hasNextPage = new RegExp(`[?&]page=${page + 1}(?:[^0-9]|$)`, 'i').test(html) ||
                /next page|rel="next"/i.test(html);
            if (!hasNextPage) {
                break;
            }
        }
        if (normalized.length === 0) {
            return [];
        }
        const dedup = new Map();
        for (const row of normalized) {
            dedup.set(row.sourceUrl, row);
        }
        return normalizeJobsWithCoordinates('BuiltIn', Array.from(dedup.values()));
    }
    catch {
        return [];
    }
}
export async function fetchAllBuiltInJobs() {
    const direct = await fetchPortalJobsFromEndpointList({
        source: 'BuiltIn',
        envVar: 'BUILTIN_FEED_ENDPOINTS',
    });
    if (direct.length > 0) {
        return direct;
    }
    const builtinPageJobs = await fetchBuiltInPageJobs();
    if (builtinPageJobs.length > 0) {
        return builtinPageJobs;
    }
    return fetchPortalFallbackJobs('BuiltIn', (url) => /builtin\.com/i.test(url));
}
