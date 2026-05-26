import { fetchAllAshbyJobs } from './AshbyAPI.js';
export default class AshbyScraper {
    async scrapeJobs() {
        try {
            return await fetchAllAshbyJobs();
        }
        catch (error) {
            console.error('Error scraping Ashby jobs:', error);
            return [];
        }
    }
}
