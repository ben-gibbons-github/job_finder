import type { ScrapedJob } from './ScrapedJob.js';
import { normalizeJobsWithCoordinates, type NormalizedPortalJob } from './PortalIngestionUtils.js';
import { collectPaginatedHtmlJobs, stripHtmlTags } from './PaginatedHtmlScrapeUtils.js';

const ETHICAL_JOBS_URL = 'https://www.ethicaljobs.com.au/jobs';
const MAX_ETHICAL_JOBS_PAGES = 250;

function fallbackTitleFromUrl(sourceUrl: string): string {
  const slug = sourceUrl.split('/').filter(Boolean).at(-1) || '';
  if (!slug) {
    return 'Unknown Role';
  }
  return slug
    .replace(/[0-9]+$/g, '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function pageUrl(page: number): string {
  const url = new URL(ETHICAL_JOBS_URL);
  if (page > 1) {
    url.searchParams.set('page', String(page));
  }
  return url.toString();
}

function parseEthicalJobs(html: string): NormalizedPortalJob[] {
  const jobs: NormalizedPortalJob[] = [];
  const linkPattern =
    /href="((?:https:\/\/www\.ethicaljobs\.com\.au)?\/members\/[^"\s]+)"/gi;

  for (const match of html.matchAll(linkPattern)) {
    const rawUrl = (match[1] || '').trim();
    const sourceUrl = rawUrl.startsWith('http') ? rawUrl : `https://www.ethicaljobs.com.au${rawUrl}`;
    const from = match.index ?? 0;
    const context = html.slice(Math.max(0, from - 450), from + 1200);

    const nearbyTitleMatch = context.match(/>\s*([^<]{6,140})\s*<\/a>/i);
    const extractedTitle = stripHtmlTags(nearbyTitleMatch?.[1] || '');
    const title = extractedTitle || fallbackTitleFromUrl(sourceUrl);

    if (!sourceUrl || !title) {
      continue;
    }

    if (/ethical jobs logo|job search|about us|career advice|save\b/i.test(title)) {
      continue;
    }

    const companyMatch = context.match(/([A-Z][A-Za-z0-9&.,'()\- ]{2,100})\s+Job location/i);
    const locationMatch = context.match(/Job location\s+([^<\n\r]{2,100})/i);

    jobs.push({
      title,
      company: (companyMatch?.[1] || 'Ethical Jobs').trim(),
      location: locationMatch?.[1]?.trim() || 'Unknown',
      remote: /remote|work from home/i.test(context) ? 'Remote' : 'Unknown',
      type: 'Unknown',
      sourceUrl,
      description: '',
      tags: ['EthicalJobs', 'For Purpose'],
    });
  }

  return jobs;
}

export async function fetchAllEthicalJobs(): Promise<ScrapedJob[]> {
  try {
    const normalized = await collectPaginatedHtmlJobs({
      sourceName: 'EthicalJobs',
      maxPages: MAX_ETHICAL_JOBS_PAGES,
      pageUrl,
      parseJobs: (html) => parseEthicalJobs(html),
      hasNextPage: (html) => /\bnext\b/i.test(html),
    });

    return normalizeJobsWithCoordinates('EthicalJobs', normalized);
  } catch (error) {
    console.warn('[EthicalJobsAPI] Failed to fetch jobs:', String(error));
    return [];
  }
}
