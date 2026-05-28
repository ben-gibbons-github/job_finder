import { normalizeJobsWithCoordinates } from './PortalIngestionUtils.js';
import { collectPaginatedHtmlJobs, stripHtmlTags } from './PaginatedHtmlScrapeUtils.js';
const CHARITYJOB_URL = 'https://www.charityjob.co.uk/jobs';
const MAX_CHARITYJOB_PAGES = 300;
function pageUrl(page) {
    const url = new URL(CHARITYJOB_URL);
    if (page > 1) {
        url.searchParams.set('page', String(page));
    }
    return url.toString();
}
function parseCharityJobs(html) {
    const jobs = [];
    const linkPattern = /<a[^>]+href="((?:https:\/\/www\.charityjob\.co\.uk)?\/jobs\/[^"?#]+\/[0-9]+(?:\?[^\"]*)?)"[^>]*>([\s\S]*?)<\/a>/gi;
    for (const match of html.matchAll(linkPattern)) {
        const rawUrl = (match[1] || '').trim();
        const sourceUrl = rawUrl.startsWith('http') ? rawUrl : `https://www.charityjob.co.uk${rawUrl}`;
        const title = stripHtmlTags(match[2] || '');
        if (!sourceUrl || !title) {
            continue;
        }
        if (/jobs\/?\?/.test(sourceUrl) || /apply now|featured|top job|charity job logo/i.test(title)) {
            continue;
        }
        const from = match.index ?? 0;
        const context = html.slice(from, from + 800);
        const companyMatch = context.match(/<a[^>]+href="javascript:void\(0\)"[^>]*>([^<]+)<\/a>/i);
        const locationMatch = context.match(/,\s*([^<\n\r]{2,100})\s*\((?:On-site|Hybrid|Remote)\)/i);
        jobs.push({
            title,
            company: (companyMatch?.[1] || 'CharityJob').trim(),
            location: locationMatch?.[1]?.trim() || 'Unknown',
            remote: /\((?:[^)]*remote[^)]*)\)/i.test(context) ? 'Remote' : 'Unknown',
            type: 'Unknown',
            sourceUrl,
            description: '',
            tags: ['CharityJob', 'Charity'],
        });
    }
    return jobs;
}
export async function fetchAllCharityJobs() {
    try {
        const normalized = await collectPaginatedHtmlJobs({
            sourceName: 'CharityJob',
            maxPages: MAX_CHARITYJOB_PAGES,
            pageUrl,
            parseJobs: (html) => parseCharityJobs(html),
            hasNextPage: (html, page) => new RegExp(`\\b${page + 1}\\b`).test(html) || /next|page \d+ of \d+/i.test(html),
        });
        return normalizeJobsWithCoordinates('CharityJob', normalized);
    }
    catch (error) {
        console.warn('[CharityJobAPI] Failed to fetch jobs:', String(error));
        return [];
    }
}
