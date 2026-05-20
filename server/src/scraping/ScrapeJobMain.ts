import ClimateBaseScraper from './ClimateBase.js';
import {
  ensureCacheDir,
  readAnyCache,
  readFreshCache,
  writeCache,
} from './ScrapingCache.js';

import type { ScrapedJob } from './ScrapedJob.js';

interface ScraperComponent {
  name: string;
  scrapeJobs: () => Promise<ScrapedJob[]>;
}

const SCRAPER_COMPONENTS: ScraperComponent[] = [
  {
    name: 'ClimateBase',
    scrapeJobs: () => new ClimateBaseScraper().scrapeJobs(),
  },
];

async function loadComponentJobs(component: ScraperComponent): Promise<ScrapedJob[]> {
  const cachedJobs = await readFreshCache(component.name);

  if (cachedJobs) {
    console.log(`Loaded ${cachedJobs.length} jobs from cache for ${component.name}`);
    return cachedJobs;
  }

  const scrapedJobs = await component.scrapeJobs();

  if (scrapedJobs.length === 0) {
    console.warn(`Scraper for ${component.name} returned 0 jobs.`);

    const staleCache = await readAnyCache(component.name);
    if (staleCache) {
      console.warn(
        `Using stale cache for ${component.name} because fresh scrape returned 0 jobs (${staleCache.length} jobs)`
      );
      return staleCache;
    }

    return [];
  }

  await writeCache(component.name, scrapedJobs);
  console.log(`Scraped ${scrapedJobs.length} jobs from ${component.name} and updated cache`);

  return scrapedJobs;
}

export async function scrapeJobsMain() {
  const jobs: ScrapedJob[] = [];

  console.log('Starting job scraping...');

  await ensureCacheDir();

  for (const component of SCRAPER_COMPONENTS) {
    const componentJobs = await loadComponentJobs(component);
    jobs.push(...componentJobs);
  }

  console.log(`Total jobs collected: ${jobs.length}`);
  return jobs;
}
