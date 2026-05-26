import ClimateBaseScraper from './ClimateBase.js';
import GreenhouseScraper from './Greenhouse.js';
import LeverScraper from './Lever.js';
import AshbyScraper from './Ashby.js';
import BreezyScraper from './Breezy.js';
import BambooScraper from './Bamboo.js';
import BuiltInScraper from './BuiltIn.js';
import TerraScraper from './Terra.js';
import EightyKHoursScraper from './EightyKHours.js';
import RemoteOKScraper from './RemoteOK.js';
import ArbeitNowScraper from './ArbeitNow.js';
import MuseumScraper from './Museum.js';
import JobForGoodScraper from './JobForGood.js';
import GlobalJobsScraper from './GlobalJobs.js';
import CharityJobScraper from './CharityJob.js';
import EnvironmentJobScraper from './EnvironmentJob.js';
import ImpactPoolScraper from './ImpactPool.js';
import TechJobsForGoodScraper from './TechJobsForGood.js';
import EthicalJobsScraper from './EthicalJobs.js';
import ImpactOpportunityScraper from './ImpactOpportunity.js';
import EscapeTheCityScraper from './EscapeTheCity.js';
import CharityPeopleScraper from './CharityPeople.js';
import { ensureCacheDir, readAnyCache, readFreshCache, writeCache, } from './ScrapingCache.js';
const SCRAPER_COMPONENTS = [
    {
        name: 'ClimateBase',
        scrapeJobs: () => new ClimateBaseScraper().scrapeJobs(),
    },
    {
        name: 'Greenhouse',
        scrapeJobs: () => new GreenhouseScraper().scrapeJobs(),
    },
    {
        name: 'Lever',
        scrapeJobs: () => new LeverScraper().scrapeJobs(),
    },
    {
        name: 'Ashby',
        scrapeJobs: () => new AshbyScraper().scrapeJobs(),
    },
    {
        name: 'Breezy',
        scrapeJobs: () => new BreezyScraper().scrapeJobs(),
    },
    {
        name: 'Bamboo',
        scrapeJobs: () => new BambooScraper().scrapeJobs(),
    },
    {
        name: 'BuiltIn',
        scrapeJobs: () => new BuiltInScraper().scrapeJobs(),
    },
    {
        name: 'Terra',
        scrapeJobs: () => new TerraScraper().scrapeJobs(),
    },
    {
        name: '80kHours',
        scrapeJobs: () => new EightyKHoursScraper().scrapeJobs(),
    },
    {
        name: 'RemoteOK',
        scrapeJobs: () => new RemoteOKScraper().scrapeJobs(),
    },
    {
        name: 'ArbeitNow',
        scrapeJobs: () => new ArbeitNowScraper().scrapeJobs(),
    },
    {
        name: 'Museum',
        scrapeJobs: () => new MuseumScraper().scrapeJobs(),
    },
    {
        name: 'JobForGood',
        scrapeJobs: () => new JobForGoodScraper().scrapeJobs(),
    },
    {
        name: 'GlobalJobs',
        scrapeJobs: () => new GlobalJobsScraper().scrapeJobs(),
    },
    {
        name: 'CharityJob',
        scrapeJobs: () => new CharityJobScraper().scrapeJobs(),
    },
    {
        name: 'EnvironmentJob',
        scrapeJobs: () => new EnvironmentJobScraper().scrapeJobs(),
    },
    {
        name: 'ImpactPool',
        scrapeJobs: () => new ImpactPoolScraper().scrapeJobs(),
    },
    {
        name: 'TechJobsForGood',
        scrapeJobs: () => new TechJobsForGoodScraper().scrapeJobs(),
    },
    {
        name: 'EthicalJobs',
        scrapeJobs: () => new EthicalJobsScraper().scrapeJobs(),
    },
    {
        name: 'ImpactOpportunity',
        scrapeJobs: () => new ImpactOpportunityScraper().scrapeJobs(),
    },
    {
        name: 'EscapeTheCity',
        scrapeJobs: () => new EscapeTheCityScraper().scrapeJobs(),
    },
    {
        name: 'CharityPeople',
        scrapeJobs: () => new CharityPeopleScraper().scrapeJobs(),
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
