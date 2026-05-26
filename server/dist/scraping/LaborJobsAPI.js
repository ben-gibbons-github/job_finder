import { fetchPortalJobsFromEndpointList } from './GenericEndpointPortalAPI.js';
import { fetchThemedJobsFromPublicBoards } from './ThemedSourceUtils.js';
const LABOR_KEYWORDS = [
    'labor',
    'union',
    'collective bargaining',
    'trade worker',
    'skilled trades',
    'electrician',
    'plumber',
    'carpenter',
    'welder',
    'machinist',
    'manufacturing',
    'warehouse',
    'logistics worker',
    'construction',
    'operations technician',
    'field technician',
    'apprentice',
    'maintenance',
    'labor organizer',
];
export async function fetchAllLaborJobs() {
    const direct = await fetchPortalJobsFromEndpointList({
        source: 'LaborJobs',
        envVar: 'LABOR_FEED_ENDPOINTS',
    });
    if (direct.length > 0) {
        return direct;
    }
    return fetchThemedJobsFromPublicBoards('LaborJobs', LABOR_KEYWORDS);
}
