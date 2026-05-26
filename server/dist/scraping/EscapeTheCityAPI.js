import { normalizeJobsWithCoordinates } from './PortalIngestionUtils.js';
import { collectPaginatedHtmlJobs, stripHtmlTags } from './PaginatedHtmlScrapeUtils.js';
const ESCAPE_THE_CITY_URL = 'https://www.escapethecity.org/search/jobs';
const MAX_ESCAPE_THE_CITY_PAGES = 60;
function pageUrl(page) {
    const url = new URL(ESCAPE_THE_CITY_URL);
    if (page > 1) {
        url.searchParams.set('page', String(page));
    }
    return url.toString();
}
function parseEscapeTheCityJobs(html) {
    const jobs = [];
    const linkPattern = /<a[^>]+href="(https:\/\/www\.escapethecity\.org\/opportunity\/[0-9]+-[^"\s]+(?:\?[^"\s]*)?)"[^>]*>([\s\S]*?)<\/a>/gi;
    for (const match of html.matchAll(linkPattern)) {
        const sourceUrl = (match[1] || '').trim();
        const rawTitle = stripHtmlTags(match[2] || '');
        const title = rawTitle.replace(/^view job\s*/i, '').trim();
        if (!sourceUrl || !title) {
            continue;
        }
        if (/view job|find a job|job posting|terms|privacy/i.test(title)) {
            continue;
        }
        const from = match.index ?? 0;
        const context = html.slice(Math.max(0, from - 500), from + 1200);
        const orgMatch = context.match(/\n\s*([A-Z][A-Za-z0-9&.,'()\- ]{2,90})\s*\n\s*\[Image: Image\]/);
        const locationMatch = context.match(/\n\s*([A-Za-z .,'()\-\/]{2,100})\s*\n\s*(?:Shaping|Join|Job|NEW|From|\[Image: Image\])/);
        jobs.push({
            title,
            company: (orgMatch?.[1] || 'Escape The City').trim(),
            location: locationMatch?.[1]?.trim() || 'Unknown',
            remote: /remote/i.test(context) ? 'Remote' : 'Unknown',
            type: 'Unknown',
            sourceUrl,
            description: '',
            tags: ['EscapeTheCity', 'Mission Driven'],
        });
    }
    return jobs;
}
export async function fetchAllEscapeTheCityJobs() {
    try {
        const normalized = await collectPaginatedHtmlJobs({
            sourceName: 'EscapeTheCity',
            maxPages: MAX_ESCAPE_THE_CITY_PAGES,
            pageUrl,
            parseJobs: (html) => parseEscapeTheCityJobs(html),
            hasNextPage: (html) => /load more|showing\s+\d+\s*-\s*\d+\s+of\s+\d+/i.test(html),
        });
        return normalizeJobsWithCoordinates('EscapeTheCity', normalized);
    }
    catch (error) {
        console.warn('[EscapeTheCityAPI] Failed to fetch jobs:', String(error));
        return [];
    }
}
