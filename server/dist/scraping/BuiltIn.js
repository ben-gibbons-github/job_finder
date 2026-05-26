import { fetchAllBuiltInJobs } from './BuiltInAPI.js';
export default class BuiltInScraper {
    async scrapeJobs() {
        try {
            return await fetchAllBuiltInJobs();
        }
        catch (error) {
            console.error('Error scraping BuiltIn jobs:', error);
            return [];
        }
    }
}
