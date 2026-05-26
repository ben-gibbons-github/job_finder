import { fetchAllImpactOpportunityJobs } from './ImpactOpportunityAPI.js';
export default class ImpactOpportunityScraper {
    async scrapeJobs() {
        try {
            return await fetchAllImpactOpportunityJobs();
        }
        catch (error) {
            console.error('Error scraping ImpactOpportunity jobs:', error);
            return [];
        }
    }
}
