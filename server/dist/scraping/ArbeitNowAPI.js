import { fetchJson, normalizeJobsWithCoordinates } from './PortalIngestionUtils.js';
const ARBEITNOW_BASE_URL = 'https://www.arbeitnow.com/api/job-board-api?limit=100&page=1';
const MAX_ARBEITNOW_PAGES = 200;
function stripHtmlTags(value) {
    return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function toIsoDate(seconds) {
    if (!seconds || Number.isNaN(seconds)) {
        return undefined;
    }
    return new Date(seconds * 1000).toISOString();
}
function mapArbeitnowJob(job) {
    const title = (job.title || '').trim();
    const sourceUrl = (job.url || '').trim();
    if (!title || !sourceUrl) {
        return null;
    }
    const inputTags = Array.isArray(job.tags) ? job.tags.filter(Boolean) : [];
    const tags = inputTags.length > 0 ? [...inputTags, 'ArbeitNow'] : ['ArbeitNow'];
    return {
        title,
        company: (job.company_name || 'Unknown Company').trim(),
        location: (job.location || 'Unknown').trim(),
        remote: job.remote ? 'Remote' : 'On-site',
        type: Array.isArray(job.job_types) && job.job_types.length > 0 ? job.job_types[0] : 'Full-time',
        sourceUrl,
        posted: toIsoDate(job.created_at),
        description: stripHtmlTags(job.description || ''),
        tags,
    };
}
export async function fetchAllArbeitNowJobs() {
    try {
        const normalized = [];
        let nextUrl = ARBEITNOW_BASE_URL;
        const visited = new Set();
        for (let i = 0; i < MAX_ARBEITNOW_PAGES && nextUrl; i += 1) {
            if (visited.has(nextUrl)) {
                break;
            }
            visited.add(nextUrl);
            let payload;
            try {
                payload = (await fetchJson(nextUrl));
            }
            catch (error) {
                if (normalized.length === 0) {
                    throw error;
                }
                console.warn(`[ArbeitNowAPI] Stopping pagination after partial success at ${nextUrl}: ${String(error)}`);
                break;
            }
            const jobs = Array.isArray(payload.data) ? payload.data : [];
            for (const job of jobs) {
                const mapped = mapArbeitnowJob(job);
                if (mapped) {
                    normalized.push(mapped);
                }
            }
            const candidate = payload.links?.next;
            nextUrl = typeof candidate === 'string' && candidate.length > 0 ? candidate : null;
        }
        const dedup = new Map();
        for (const row of normalized) {
            dedup.set(row.sourceUrl, row);
        }
        return normalizeJobsWithCoordinates('ArbeitNow', Array.from(dedup.values()));
    }
    catch (error) {
        console.warn('[ArbeitNowAPI] Failed to fetch jobs:', String(error));
        return [];
    }
}
