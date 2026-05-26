import { fetchAllArbeitNowJobs } from './ArbeitNowAPI.js';
export default class ArbeitNowScraper {
    async scrapeJobs() {
        try {
            return await fetchAllArbeitNowJobs();
        }
        catch (error) {
            console.error('Error scraping ArbeitNow jobs:', error);
            return [];
        }
    }
}
