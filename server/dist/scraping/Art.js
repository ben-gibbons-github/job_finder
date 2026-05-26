import { fetchAllArtJobs } from './ArtAPI.js';
export default class ArtScraper {
    async scrapeJobs() {
        try {
            return await fetchAllArtJobs();
        }
        catch (error) {
            console.error('Error scraping Art jobs:', error);
            return [];
        }
    }
}
