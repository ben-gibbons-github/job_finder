import { fetchAllBreezyJobs } from './BreezyAPI.js';
export default class BreezyScraper {
    async scrapeJobs() {
        try {
            return await fetchAllBreezyJobs();
        }
        catch (error) {
            console.error('Error scraping Breezy jobs:', error);
            return [];
        }
    }
}
