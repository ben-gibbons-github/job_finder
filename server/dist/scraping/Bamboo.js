import { fetchAllBambooJobs } from './BambooAPI.js';
export default class BambooScraper {
    async scrapeJobs() {
        try {
            return await fetchAllBambooJobs();
        }
        catch (error) {
            console.error('Error scraping Bamboo jobs:', error);
            return [];
        }
    }
}
