import { fetchAllGreenhouseJobs } from './GreenhouseAPI.js';
export default class GreenhouseScraper {
    async scrapeJobs() {
        try {
            return await fetchAllGreenhouseJobs();
        }
        catch (error) {
            console.error('Error scraping Greenhouse jobs:', error);
            return [];
        }
    }
}
