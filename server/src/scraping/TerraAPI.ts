import type { ScrapedJob } from './ScrapedJob.js';
import { fetchPortalJobsFromEndpointList } from './GenericEndpointPortalAPI.js';
import { fetchTerraAggregateJobs } from './TerraBoardFallback.js';

export async function fetchAllTerraJobs(): Promise<ScrapedJob[]> {
  const direct = await fetchPortalJobsFromEndpointList({
    source: 'Terra',
    envVar: 'TERRA_FEED_ENDPOINTS',
  });

  if (direct.length > 0) {
    return direct;
  }

  return fetchTerraAggregateJobs();
}
