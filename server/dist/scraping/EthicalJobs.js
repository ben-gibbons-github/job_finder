import { fetchAllEthicalJobs } from './EthicalJobsAPI.js';
export default class EthicalJobsScraper {
    async scrapeJobs() {
        try {
            return await fetchAllEthicalJobs();
        }
        catch (error) {
            console.error('Error scraping EthicalJobs jobs:', error);
            return [];
        }
    }
}
