import type { ScrapedJob } from './ScrapedJob.js';
import { normalizeJobsWithCoordinates, type NormalizedPortalJob } from './PortalIngestionUtils.js';
import { collectPaginatedHtmlJobs, stripHtmlTags } from './PaginatedHtmlScrapeUtils.js';

const TECH_JOBS_FOR_GOOD_URL = 'https://www.techjobsforgood.com/jobs/';
const MAX_TECH_JOBS_FOR_GOOD_PAGES = 200;

function pageUrl(page: number): string {
  const url = new URL(TECH_JOBS_FOR_GOOD_URL);
  if (page > 1) {
    url.searchParams.set('page', String(page));
  }
  return url.toString();
}

function parseTechJobsForGood(html: string): NormalizedPortalJob[] {
  const jobs: NormalizedPortalJob[] = [];
  const linkPattern =
    /<a[^>]+href="((?:https:\/\/www\.techjobsforgood\.com)?\/jobs\/[0-9]+\/?(?:\?[^"\s]*)?)"[^>]*>([\s\S]*?)<\/a>/gi;

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
    const companyMatch = context.match(/\]\s*([A-Z][A-Z0-9&.,'()\- ]{2,80})\s+(?:Remote|[A-Z][a-z])/);
    const locationMatch = context.match(/\b(Remote\s*\([^)]*\)|[A-Za-z .'-]+,\s*[A-Z]{2})\b/);

    jobs.push({
      title,
      company: (companyMatch?.[1] || 'Tech Jobs For Good').trim(),
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

export async function fetchAllTechJobsForGoodJobs(): Promise<ScrapedJob[]> {
  try {
    const normalized = await collectPaginatedHtmlJobs({
      sourceName: 'TechJobsForGood',
      maxPages: MAX_TECH_JOBS_FOR_GOOD_PAGES,
      pageUrl,
      parseJobs: (html) => parseTechJobsForGood(html),
      hasNextPage: (html, page) =>
        /\bnext\b/i.test(html) || new RegExp(`\\b${page + 1}\\b`).test(html),
    });

    return normalizeJobsWithCoordinates('TechJobsForGood', normalized);
  } catch (error) {
    console.warn('[TechJobsForGoodAPI] Failed to fetch jobs:', String(error));
    return [];
  }
}
