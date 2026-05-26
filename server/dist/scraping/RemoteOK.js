import { fetchAllRemoteOkJobs } from './RemoteOKAPI.js';
export default class RemoteOKScraper {
    async scrapeJobs() {
        try {
            return await fetchAllRemoteOkJobs();
        }
        catch (error) {
            console.error('Error scraping RemoteOK jobs:', error);
            return [];
        }
    }
}
