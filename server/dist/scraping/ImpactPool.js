import { fetchAllImpactPoolJobs } from './ImpactPoolAPI.js';
export default class ImpactPoolScraper {
    async scrapeJobs() {
        try {
            return await fetchAllImpactPoolJobs();
        }
        catch (error) {
            console.error('Error scraping ImpactPool jobs:', error);
            return [];
        }
    }
}
