import { fetchAllGoodJobs } from './GoodJobsAPI.js';
export default class GoodJobsScraper {
    async scrapeJobs() {
        try {
            return await fetchAllGoodJobs();
        }
        catch (error) {
            console.error('Error scraping Good jobs:', error);
            return [];
        }
    }
}
