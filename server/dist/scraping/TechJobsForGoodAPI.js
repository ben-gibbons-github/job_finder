import { normalizeJobsWithCoordinates } from './PortalIngestionUtils.js';
import { collectPaginatedHtmlJobs, stripHtmlTags } from './PaginatedHtmlScrapeUtils.js';
const TECH_JOBS_FOR_GOOD_URL = 'https://www.techjobsforgood.com/jobs/';
const MAX_TECH_JOBS_FOR_GOOD_PAGES = 200;
function pageUrl(page) {
    const url = new URL(TECH_JOBS_FOR_GOOD_URL);
    if (page > 1) {
        url.searchParams.set('page', String(page));
    }
    return url.toString();
}
function extractCompanyName(listingText) {
    const normalized = listingText.replace(/\s+/g, ' ').trim();
    if (!normalized) {
        return 'Unknown Company';
    }
    const locationPatterns = [
        /\bRemote\s*\([^)]*\)/,
        /\bRemote\b/,
        /\b[A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+)*,\s*[A-Z]{2}(?:\s*\([^)]+\))?\b/,
        /\b[A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+)*\s*,\s*[A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+)*\b/,
    ];
    let locationIndex = -1;
    for (const pattern of locationPatterns) {
        const match = normalized.match(pattern);
        if (match?.index !== undefined && match.index >= 0) {
            locationIndex = match.index;
            break;
        }
    }
    const prefix = locationIndex > 0 ? normalized.slice(0, locationIndex).trim() : normalized;
    const companyMatch = prefix.match(/([A-Z0-9&.,'()\-]+(?:\s+[A-Z0-9&.,'()\-]+){0,6})\s*$/);
    if (companyMatch?.[1]) {
        return companyMatch[1].trim();
    }
    return 'Unknown Company';
}
function parseTechJobsForGood(html) {
    const jobs = [];
    const linkPattern = /<a[^>]+href="((?:https:\/\/www\.techjobsforgood\.com)?\/jobs\/[0-9]+\/?(?:\?[^"\s]*)?)"[^>]*>([\s\S]*?)<\/a>/gi;
    for (const match of html.matchAll(linkPattern)) {
        const rawUrl = (match[1] || '').trim();
        const sourceUrl = rawUrl.startsWith('http') ? rawUrl : `https://www.techjobsforgood.com${rawUrl}`;
        const title = stripHtmlTags(match[2] || '');
        if (!sourceUrl || !title) {
            continue;
        }
        if (/saved jobs|my applications|create email alert|post a job/i.test(title)) {
            continue;
        }
        const from = match.index ?? 0;
        const context = html.slice(Math.max(0, from - 400), from + 1200);
        const locationMatch = context.match(/\b(Remote\s*\([^)]*\)|[A-Za-z .'-]+,\s*[A-Z]{2})\b/);
        const company = extractCompanyName(title);
        jobs.push({
            title,
            company,
            location: locationMatch?.[1]?.trim() || 'Unknown',
            remote: /\bremote\b/i.test(context) ? 'Remote' : 'Unknown',
            type: 'Unknown',
            sourceUrl,
            description: '',
            tags: ['TechJobsForGood', 'Mission Driven', 'Tech'],
        });
    }
    return jobs;
}
export async function fetchAllTechJobsForGoodJobs() {
    try {
        const normalized = await collectPaginatedHtmlJobs({
            sourceName: 'TechJobsForGood',
            maxPages: MAX_TECH_JOBS_FOR_GOOD_PAGES,
            pageUrl,
            parseJobs: (html) => parseTechJobsForGood(html),
            hasNextPage: (html, page) => /\bnext\b/i.test(html) || new RegExp(`\\b${page + 1}\\b`).test(html),
        });
        return normalizeJobsWithCoordinates('TechJobsForGood', normalized);
    }
    catch (error) {
        console.warn('[TechJobsForGoodAPI] Failed to fetch jobs:', String(error));
        return [];
    }
}
