import { normalizeJobsWithCoordinates } from './PortalIngestionUtils.js';
const REQUEST_TIMEOUT_MS = 30_000;
async function fetchJson(url) {
    const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: {
            Accept: 'application/json, text/plain, */*',
            'User-Agent': 'job-finder-super-scraper/1.0',
        },
    });
    if (!response.ok) {
        throw new Error(`Failed ${url}: ${response.status} ${response.statusText}`);
    }
    return response.json();
}
function asString(value) {
    return typeof value === 'string' ? value.trim() : '';
}
function asStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .map((entry) => asString(entry))
        .filter((entry) => entry.length > 0);
}
function parseRemotive(payload) {
    if (!payload || typeof payload !== 'object') {
        return [];
    }
    const jobs = payload.jobs;
    if (!Array.isArray(jobs)) {
        return [];
    }
    const normalized = [];
    for (const job of jobs) {
        if (!job || typeof job !== 'object') {
            continue;
        }
        const row = job;
        const title = asString(row.title);
        const sourceUrl = asString(row.url);
        if (!title || !sourceUrl) {
            continue;
        }
        normalized.push({
            title,
            company: asString(row.company_name) || 'Unknown Company',
            location: asString(row.candidate_required_location) || 'Remote',
            remote: 'Remote',
            type: asString(row.job_type) || 'Unknown',
            sourceUrl,
            posted: asString(row.publication_date) || undefined,
            description: asString(row.description),
            tags: asStringArray(row.tags),
        });
    }
    return normalized;
}
function parseJobicy(payload) {
    if (!payload || typeof payload !== 'object') {
        return [];
    }
    const maybeArray = payload.jobs ?? payload.data;
    if (!Array.isArray(maybeArray)) {
        return [];
    }
    const normalized = [];
    for (const job of maybeArray) {
        if (!job || typeof job !== 'object') {
            continue;
        }
        const row = job;
        const title = asString(row.jobTitle) || asString(row.title);
        const sourceUrl = asString(row.url) || asString(row.jobUrl);
        if (!title || !sourceUrl) {
            continue;
        }
        const tags = [
            ...asStringArray(row.jobIndustry),
            ...asStringArray(row.jobTags),
            ...asStringArray(row.tags),
            asString(row.jobCategory),
        ].filter((entry) => entry.length > 0);
        normalized.push({
            title,
            company: asString(row.companyName) || asString(row.company) || 'Unknown Company',
            location: asString(row.jobGeo) || asString(row.location) || 'Remote',
            remote: 'Remote',
            type: asString(row.jobType) || asString(row.type) || 'Unknown',
            sourceUrl,
            posted: asString(row.pubDate) || asString(row.date) || undefined,
            description: asString(row.jobDescription) || asString(row.description),
            tags,
        });
    }
    return normalized;
}
function includesAnyKeyword(text, keywords) {
    const normalized = text.toLowerCase();
    return keywords.some((keyword) => normalized.includes(keyword));
}
function filterByTheme(jobs, keywords) {
    return jobs.filter((job) => {
        const textBlob = [
            job.title,
            job.company,
            job.location,
            job.description,
            (job.tags || []).join(' '),
        ]
            .join(' ')
            .toLowerCase();
        return includesAnyKeyword(textBlob, keywords);
    });
}
export async function fetchThemedJobsFromPublicBoards(source, keywords) {
    const collected = [];
    try {
        const remotivePayload = await fetchJson('https://remotive.com/api/remote-jobs');
        collected.push(...parseRemotive(remotivePayload));
    }
    catch (error) {
        console.warn(`[${source}] Remotive fetch failed:`, String(error));
    }
    try {
        const jobicyPayload = await fetchJson('https://jobicy.com/api/v2/remote-jobs');
        collected.push(...parseJobicy(jobicyPayload));
    }
    catch (error) {
        console.warn(`[${source}] Jobicy fetch failed:`, String(error));
    }
    if (collected.length === 0) {
        return [];
    }
    const themed = filterByTheme(collected, keywords);
    const dedupByUrl = new Map();
    for (const job of themed) {
        if (!dedupByUrl.has(job.sourceUrl)) {
            dedupByUrl.set(job.sourceUrl, {
                ...job,
                tags: [...(job.tags || []), source],
            });
        }
    }
    return normalizeJobsWithCoordinates(source, Array.from(dedupByUrl.values()));
}
