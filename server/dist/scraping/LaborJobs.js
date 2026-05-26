import { fetchAllLaborJobs } from './LaborJobsAPI.js';
export default class LaborJobsScraper {
    async scrapeJobs() {
        try {
            return await fetchAllLaborJobs();
        }
        catch (error) {
            console.error('Error scraping Labor jobs:', error);
            return [];
        }
    }
}
