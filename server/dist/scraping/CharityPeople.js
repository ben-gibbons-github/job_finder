import { fetchAllCharityPeopleJobs } from './CharityPeopleAPI.js';
export default class CharityPeopleScraper {
    async scrapeJobs() {
        try {
            return await fetchAllCharityPeopleJobs();
        }
        catch (error) {
            console.error('Error scraping CharityPeople jobs:', error);
            return [];
        }
    }
}
