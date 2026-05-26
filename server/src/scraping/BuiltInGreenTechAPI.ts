import type { ScrapedJob } from './ScrapedJob.js';
import { normalizeJobsWithCoordinates, type NormalizedPortalJob } from './PortalIngestionUtils.js';

const BUILTIN_GREENTECH_JOBS_URL = 'https://www.builtin.com/jobs/greentech';
const MAX_BUILTIN_GREENTECH_PAGES = 50;

function collectBuiltInEntries(value: unknown): NormalizedPortalJob[] {
  if (Array.isArray(value)) return value.flatMap((item) => collectBuiltInEntries(item));
  if (!value || typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;
  const entries: NormalizedPortalJob[] = [];
  const url = typeof obj.url === 'string' ? obj.url : '';
  const title = typeof obj.name === 'string' ? obj.name : typeof obj.title === 'string' ? obj.title : '';

  if (url.includes('builtin.com') && title) {
    entries.push({
      title: title.trim(),
      company: 'BuiltIn GreenTech',
      location: 'Remote',
      remote: 'Unknown',
      type: 'Full-time',
      sourceUrl: url,
      description: '',
      tags: ['BuiltIn', 'GreenTech', 'TechForGood', 'Climate'],
    });
  }

  for (const nested of Object.values(obj)) entries.push(...collectBuiltInEntries(nested));
  return entries;
}

export async function fetchAllBuiltInGreenTechJobs(): Promise<ScrapedJob[]> {
  try {
    const normalized: NormalizedPortalJob[] = [];

    for (let page = 1; page <= MAX_BUILTIN_GREENTECH_PAGES; page += 1) {
      const url = page === 1 ? BUILTIN_GREENTECH_JOBS_URL : `${BUILTIN_GREENTECH_JOBS_URL}?page=${page}`;
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(30_000),
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          'User-Agent': 'job-finder-super-scraper/1.0',
        },
      });

      if (!response.ok) {
        if (page === 1) return [];
        break;
      }

      const html = await response.text();
      const pageRows: NormalizedPortalJob[] = [];
      const scriptPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
      for (const match of html.matchAll(scriptPattern)) {
        const raw = (match[1] || '').trim();
        if (!raw) continue;
        try {
          pageRows.push(...collectBuiltInEntries(JSON.parse(raw)));
        } catch {
          // Ignore malformed blocks.
        }
      }

      const urlPattern = /https:\/\/builtin\.com\/job\/[^"<\s]+/gi;
      for (const match of html.matchAll(urlPattern)) {
        const sourceUrl = (match[0] || '').trim();
        if (!sourceUrl) continue;
        const slugPart = sourceUrl.split('/job/')[1] || '';
        const slugTitle = slugPart.split('/')[0]?.replace(/[-_]+/g, ' ').trim() || 'BuiltIn Job';
        pageRows.push({
          title: slugTitle,
          company: 'BuiltIn GreenTech',
          location: 'Remote',
          remote: 'Unknown',
          type: 'Full-time',
          sourceUrl,
          description: '',
          tags: ['BuiltIn', 'GreenTech', 'TechForGood', 'Climate'],
        });
      }

      if (pageRows.length === 0) break;
      const before = normalized.length;
      normalized.push(...pageRows);
      if (normalized.length === before) break;
      const hasNextPage = new RegExp(`[?&]page=${page + 1}(?:[^0-9]|$)`, 'i').test(html) || /next page|rel="next"/i.test(html);
      if (!hasNextPage) break;
    }

    const dedup = new Map<string, NormalizedPortalJob>();
    for (const row of normalized) dedup.set(row.sourceUrl, row);
    return normalizeJobsWithCoordinates('BuiltInGreenTech', Array.from(dedup.values()));
  } catch (error) {
    console.warn('[BuiltInGreenTechAPI] Failed to fetch jobs:', String(error));
    return [];
  }
}
