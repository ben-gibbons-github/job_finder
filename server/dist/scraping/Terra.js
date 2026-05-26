import { fetchAllTerraJobs } from './TerraAPI.js';
export default class TerraScraper {
    async scrapeJobs() {
        try {
            return await fetchAllTerraJobs();
        }
        catch (error) {
            console.error('Error scraping Terra jobs:', error);
            return [];
        }
    }
}
