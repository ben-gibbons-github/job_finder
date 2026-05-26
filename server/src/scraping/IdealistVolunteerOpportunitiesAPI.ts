import type { ScrapedJob } from './ScrapedJob.js';
import { normalizeJobsWithCoordinates, type NormalizedPortalJob } from './PortalIngestionUtils.js';
import { collectPaginatedHtmlJobs, stripHtmlTags } from './PaginatedHtmlScrapeUtils.js';

const IDEALIST_VOLUNTEER_BASE_URL = 'https://www.idealist.org/en/volunteer-opportunities';
const MAX_IDEALIST_VOLUNTEER_PAGES = 500;

function pageUrl(page: number): string {
  const url = new URL(IDEALIST_VOLUNTEER_BASE_URL);
  if (page > 1) {
    url.searchParams.set('page', String(page));
  }
  return url.toString();
}

function titleFromPath(path: string): string {
  const slug = path.split('/').pop() || '';
  const noId = slug.replace(/^[a-f0-9]{24,40}-/i, '');
  return noId
    .split('-')
    .filter(Boolean)
    .slice(0, 12)
    .join(' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function parseIdealistVolunteerOpportunities(html: string): NormalizedPortalJob[] {
  const jobs: NormalizedPortalJob[] = [];
  const linkPattern = /<a[^>]+href="(\/en\/volunteer-opportunity\/[^"\s]+)"[^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(linkPattern)) {
    const path = (match[1] || '').trim();
    const sourceUrl = `https://www.idealist.org${path}`;
    const anchorText = stripHtmlTags(match[2] || '');
    const title = anchorText || titleFromPath(path);

    if (!sourceUrl || !title) {
      continue;
    }

    const from = match.index ?? 0;
    const context = html.slice(Math.max(0, from - 220), from + 900);

    jobs.push({
      title,
      company: 'Idealist Volunteer Host',
      location: 'Unknown',
      remote: /\bremote\b|\bvirtual\b|\bonline\b/i.test(context) ? 'Remote' : 'Unknown',
      type: 'Volunteer',
      sourceUrl,
      description: '',
      tags: ['Idealist', 'Volunteer'],
    });
  }

  return jobs;
}

export async function fetchAllIdealistVolunteerOpportunities(): Promise<ScrapedJob[]> {
  try {
    const normalized = await collectPaginatedHtmlJobs({
      sourceName: 'IdealistVolunteerOpportunities',
      maxPages: MAX_IDEALIST_VOLUNTEER_PAGES,
      pageUrl,
      parseJobs: (html) => parseIdealistVolunteerOpportunities(html),
    });

    return normalizeJobsWithCoordinates('IdealistVolunteerOpportunities', normalized);
  } catch (error) {
    console.warn('[IdealistVolunteerOpportunitiesAPI] Failed to fetch jobs:', String(error));
    return [];
  }
}
