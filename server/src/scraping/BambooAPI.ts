import type { ScrapedJob } from './ScrapedJob.js';
import { fetchPortalJobsFromEndpointList } from './GenericEndpointPortalAPI.js';
import { fetchPortalFallbackJobs } from './TerraBoardFallback.js';

export async function fetchAllBambooJobs(): Promise<ScrapedJob[]> {
  const direct = await fetchPortalJobsFromEndpointList({
    source: 'Bamboo',
    envVar: 'BAMBOO_FEED_ENDPOINTS',
  });

  if (direct.length > 0) {
    return direct;
  }

  return fetchPortalFallbackJobs('Bamboo', (url) => /bamboohr\.com/i.test(url));
}
