import { scrapeJobsMain } from './dist/scraping/ScrapeJobMain.js';

async function run() {
  try {
    const jobs = await scrapeJobsMain();
    console.log('TOTAL_JOBS: ' + (jobs ? jobs.length : 0));
    const counts = {};
    if (jobs && Array.isArray(jobs)) {
      jobs.forEach(job => {
        const source = job.source || 'Unknown';
        counts[source] = (counts[source] || 0) + 1;
      });
    }
    console.log('COUNTS: ' + JSON.stringify(counts));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
