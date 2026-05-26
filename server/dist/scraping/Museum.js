import { fetchAllMuseumJobs } from './MuseumAPI.js';
export default class MuseumScraper {
    async scrapeJobs() {
        try {
            return await fetchAllMuseumJobs();
        }
        catch (error) {
            console.error('Error scraping Museum jobs:', error);
            return [];
        }
    }
}
