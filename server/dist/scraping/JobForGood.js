import { fetchAllJobForGoodJobs } from './JobForGoodAPI.js';
export default class JobForGoodScraper {
    async scrapeJobs() {
        try {
            return await fetchAllJobForGoodJobs();
        }
        catch (error) {
            console.error('Error scraping JobForGood jobs:', error);
            return [];
        }
    }
}
