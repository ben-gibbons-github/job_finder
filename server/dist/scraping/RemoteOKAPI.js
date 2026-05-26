import { fetchJson, normalizeJobsWithCoordinates } from './PortalIngestionUtils.js';
function parseRemoteOkJob(job) {
    return {
        title: job.position || 'Unknown Role',
        company: job.company || 'Unknown Company',
        location: job.location || 'Remote',
        remote: 'Remote',
        type: 'Full-time',
        sourceUrl: job.url || 'https://remoteok.com/',
        posted: job.date,
        description: job.description || '',
        tags: Array.isArray(job.tags) ? job.tags : [],
    };
}
export async function fetchAllRemoteOkJobs() {
    try {
        const payload = (await fetchJson('https://remoteok.com/api'));
        const jobs = Array.isArray(payload) ? payload.slice(1) : [];
        const normalized = jobs
            .filter((job) => Boolean(job?.url))
            .map((job) => parseRemoteOkJob(job));
        return normalizeJobsWithCoordinates('RemoteOK', normalized);
    }
    catch (error) {
        console.warn('[RemoteOKAPI] Failed to fetch jobs:', String(error));
        return [];
    }
}
