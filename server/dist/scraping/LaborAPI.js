import { fetchJson, normalizeJobsWithCoordinates } from './PortalIngestionUtils.js';
const ARBEITNOW_BASE_URL = 'https://www.arbeitnow.com/api/job-board-api?limit=100&page=1';
const MAX_ARBEITNOW_PAGES = 3;
function stripHtmlTags(value) {
    return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function toIsoDate(seconds) {
    if (!seconds || Number.isNaN(seconds)) {
        return undefined;
    }
    return new Date(seconds * 1000).toISOString();
}
function isLaborJob(job) {
    const haystack = [
        job.title || '',
        job.description || '',
        ...(Array.isArray(job.tags) ? job.tags : []),
        ...(Array.isArray(job.job_types) ? job.job_types : []),
    ]
        .join(' ')
        .toLowerCase();
    const laborPattern = /labor|warehouse|manufactur|construction|trade|mechanic|technician|operations|logistics|transport|maintenance|field service|installation|repair/;
    return laborPattern.test(haystack);
}
function mapLaborJob(job) {
    const title = (job.title || '').trim();
    const sourceUrl = (job.url || '').trim();
    if (!title || !sourceUrl) {
        return null;
    }
    return {
        title,
        company: (job.company_name || 'Unknown Company').trim(),
        location: (job.location || 'Unknown').trim(),
        remote: job.remote ? 'Remote' : 'On-site',
        type: Array.isArray(job.job_types) && job.job_types.length > 0 ? job.job_types[0] : 'Full-time',
        sourceUrl,
        posted: toIsoDate(job.created_at),
        description: stripHtmlTags(job.description || ''),
        tags: Array.isArray(job.tags) ? [...job.tags, 'Labor'] : ['Labor'],
    };
}
export async function fetchAllLaborJobs() {
    try {
        const normalized = [];
        let nextUrl = ARBEITNOW_BASE_URL;
        for (let i = 0; i < MAX_ARBEITNOW_PAGES && nextUrl; i += 1) {
            const payload = (await fetchJson(nextUrl));
            const jobs = Array.isArray(payload.data) ? payload.data : [];
            for (const job of jobs) {
                if (!isLaborJob(job)) {
                    continue;
                }
                const mapped = mapLaborJob(job);
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
        return normalizeJobsWithCoordinates('Labor', Array.from(dedup.values()));
    }
    catch (error) {
        console.warn('[LaborAPI] Failed to fetch jobs:', String(error));
        return [];
    }
}
