import { fetchAllEnvironmentJobs } from './EnvironmentJobAPI.js';
export default class EnvironmentJobScraper {
    async scrapeJobs() {
        try {
            return await fetchAllEnvironmentJobs();
        }
        catch (error) {
            console.error('Error scraping EnvironmentJob jobs:', error);
            return [];
        }
    }
}
