import { scrapeJobsMain } from './dist/scraping/ScrapeJobMain.js';
scrapeJobsMain().then(jobs => {
  if (!jobs) {
    console.log('No jobs returned');
    return;
  }
  const counts = jobs.reduce((acc, job) => {
    const source = job.source || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify(counts, null, 2));
}).catch(err => {
  console.error(err);
  process.exit(1);
});
