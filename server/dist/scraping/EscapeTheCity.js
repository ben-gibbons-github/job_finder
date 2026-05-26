import { fetchAllEscapeTheCityJobs } from './EscapeTheCityAPI.js';
export default class EscapeTheCityScraper {
    async scrapeJobs() {
        try {
            return await fetchAllEscapeTheCityJobs();
        }
        catch (error) {
            console.error('Error scraping EscapeTheCity jobs:', error);
            return [];
        }
    }
}
