import { fetchAllMuseumJobs } from './MuseumJobsAPI.js';
export default class MuseumJobsScraper {
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
