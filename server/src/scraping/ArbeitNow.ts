import { fetchAllArbeitNowJobs } from './ArbeitNowAPI.js';
import type { ScrapedJob } from './ScrapedJob.js';

export default class ArbeitNowScraper {
  async scrapeJobs(): Promise<ScrapedJob[]> {
    try {
      return await fetchAllArbeitNowJobs();
    } catch (error) {
      console.error('Error scraping ArbeitNow jobs:', error);
      return [];
    }
  }
}
