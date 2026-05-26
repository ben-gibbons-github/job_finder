import { fetchAllLeverJobs } from './LeverAPI.js';
export default class LeverScraper {
    async scrapeJobs() {
        try {
            return await fetchAllLeverJobs();
        }
        catch (error) {
            console.error('Error scraping Lever jobs:', error);
            return [];
        }
    }
}
