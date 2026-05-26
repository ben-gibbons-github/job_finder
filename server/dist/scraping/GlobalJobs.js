import { fetchAllGlobalJobs } from './GlobalJobsAPI.js';
export default class GlobalJobsScraper {
    async scrapeJobs() {
        try {
            return await fetchAllGlobalJobs();
        }
        catch (error) {
            console.error('Error scraping GlobalJobs jobs:', error);
            return [];
        }
    }
}
