import { fetchAllLaborJobs } from './LaborAPI.js';
export default class LaborScraper {
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
