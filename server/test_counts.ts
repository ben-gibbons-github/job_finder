import { fetchAllEscapeTheCityJobs } from './src/scraping/EscapeTheCityAPI.js';
import { fetchAllCharityPeopleJobs } from './src/scraping/CharityPeopleAPI.js';

async function run() {
  try {
    const escapeJobs = await fetchAllEscapeTheCityJobs();
    const charityJobs = await fetchAllCharityPeopleJobs();
    console.log(`EscapeTheCity=${escapeJobs.length}`);
    console.log(`CharityPeople=${charityJobs.length}`);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    process.exit(1);
  }
}

run();
