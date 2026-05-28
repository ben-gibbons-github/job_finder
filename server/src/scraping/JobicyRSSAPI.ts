import type { ScrapedJob } from './ScrapedJob.js';
import { normalizeJobsWithCoordinates, type NormalizedPortalJob } from './PortalIngestionUtils.js';

const JOBICY_RSS_URL = 'https://jobicy.com/?feed=job_feed';

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripHtml(value: string): string {
  return decodeXmlEntities(String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function parseJobicyRss(xml: string): NormalizedPortalJob[] {
  const jobs: NormalizedPortalJob[] = [];
  const itemPattern = /<item>([\s\S]*?)<\/item>/gi;

  for (const match of xml.matchAll(itemPattern)) {
    const item = match[1] || '';
    const title = stripHtml(item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');
    const sourceUrl = stripHtml(item.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || '');
    const description = stripHtml(item.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || '');
    const posted = stripHtml(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || '');

    if (!title || !sourceUrl) {
      continue;
    }

    jobs.push({
      title,
      company: 'Jobicy Employer',
      location: /remote/i.test(title + ' ' + description) ? 'Remote' : 'Unknown',
      remote: /remote/i.test(title + ' ' + description) ? 'Remote' : 'Unknown',
      type: 'Unknown',
      sourceUrl,
      posted: posted || undefined,
      description,
      tags: ['Jobicy', 'Remote', 'RSS'],
    });
  }

  return jobs;
}

export async function fetchAllJobicyRssJobs(): Promise<ScrapedJob[]> {
  try {
    const response = await fetch(JOBICY_RSS_URL, {
      method: 'GET',
      signal: AbortSignal.timeout(30_000),
      headers: {
        Accept: 'application/rss+xml,application/xml,text/xml',
        'User-Agent': 'job-finder-super-scraper/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    const normalized = parseJobicyRss(xml);

    const dedup = new Map<string, NormalizedPortalJob>();
    for (const row of normalized) {
      dedup.set(row.sourceUrl, row);
    }

    return normalizeJobsWithCoordinates('JobicyRSS', Array.from(dedup.values()));
  } catch (error) {
    console.warn('[JobicyRSSAPI] Failed to fetch jobs:', String(error));
    return [];
  }
}
