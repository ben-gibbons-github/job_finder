import { fetchAll80KHoursJobs } from './EightyKHoursAPI.js';
export default class EightyKHoursScraper {
    async scrapeJobs() {
        try {
            return await fetchAll80KHoursJobs();
        }
        catch (error) {
            console.error('Error scraping 80kHours jobs:', error);
            return [];
        }
    }
}
