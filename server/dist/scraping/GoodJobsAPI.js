import { fetchPortalJobsFromEndpointList } from './GenericEndpointPortalAPI.js';
import { fetchThemedJobsFromPublicBoards } from './ThemedSourceUtils.js';
const GOOD_JOB_KEYWORDS = [
    'nonprofit',
    'non-profit',
    'public interest',
    'social impact',
    'mission driven',
    'mission-driven',
    'community',
    'climate',
    'sustainability',
    'public health',
    'human rights',
    'civic',
    'equity',
    'justice',
    'education access',
    'affordable housing',
    'food security',
    'child welfare',
    'global health',
    'humanitarian',
];
export async function fetchAllGoodJobs() {
    const direct = await fetchPortalJobsFromEndpointList({
        source: 'GoodJobs',
        envVar: 'GOOD_JOBS_FEED_ENDPOINTS',
    });
    if (direct.length > 0) {
        return direct;
    }
    return fetchThemedJobsFromPublicBoards('GoodJobs', GOOD_JOB_KEYWORDS);
}
