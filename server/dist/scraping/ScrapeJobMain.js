import ClimateBaseScraper from './ClimateBase.js';
import { ensureCacheDir, readAnyCache, readFreshCache, writeCache, } from './ScrapingCache.js';
const SCRAPER_COMPONENTS = [
    {
        name: 'ClimateBase',
        scrapeJobs: () => new ClimateBaseScraper().scrapeJobs(),
    },
];
async function loadComponentJobs(component) {
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
            console.warn(`Using stale cache for ${component.name} because fresh scrape returned 0 jobs (${staleCache.length} jobs)`);
            return staleCache;
        }
        return [];
    }
    await writeCache(component.name, scrapedJobs);
    console.log(`Scraped ${scrapedJobs.length} jobs from ${component.name} and updated cache`);
    return scrapedJobs;
}
export async function scrapeJobsMain() {
    const jobs = [];
    console.log('Starting job scraping...');
    await ensureCacheDir();
    for (const component of SCRAPER_COMPONENTS) {
        const componentJobs = await loadComponentJobs(component);
        jobs.push(...componentJobs);
    }
    console.log(`Total jobs collected: ${jobs.length}`);
    return jobs;
}
