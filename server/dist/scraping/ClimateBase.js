import { fetchAllClimatebaseJobs } from './ClimateBaseAPI.js';
export default class ClimateBaseScraper {
    async scrapeJobs() {
        try {
            return await fetchAllClimatebaseJobs();
        }
        catch (error) {
            console.error('Error scraping ClimateBase jobs:', error);
            return [];
        }
    }
}
