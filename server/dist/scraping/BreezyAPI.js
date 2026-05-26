import { fetchPortalJobsFromEndpointList } from './GenericEndpointPortalAPI.js';
import { fetchPortalFallbackJobs } from './TerraBoardFallback.js';
export async function fetchAllBreezyJobs() {
    const direct = await fetchPortalJobsFromEndpointList({
        source: 'Breezy',
        envVar: 'BREEZY_FEED_ENDPOINTS',
    });
    if (direct.length > 0) {
        return direct;
    }
    return fetchPortalFallbackJobs('Breezy', (url) => /breezy\.hr/i.test(url));
}
