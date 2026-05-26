import { fetchAllCharityJobs } from './CharityJobAPI.js';
export default class CharityJobScraper {
    async scrapeJobs() {
        try {
            return await fetchAllCharityJobs();
        }
        catch (error) {
            console.error('Error scraping CharityJob jobs:', error);
            return [];
        }
    }
}
