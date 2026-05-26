import { fetchAllTechJobsForGoodJobs } from './TechJobsForGoodAPI.js';
export default class TechJobsForGoodScraper {
    async scrapeJobs() {
        try {
            return await fetchAllTechJobsForGoodJobs();
        }
        catch (error) {
            console.error('Error scraping TechJobsForGood jobs:', error);
            return [];
        }
    }
}
