import { fetchPortalJobsFromEndpointList } from './GenericEndpointPortalAPI.js';
import { fetchThemedJobsFromPublicBoards } from './ThemedSourceUtils.js';
const MUSEUM_KEYWORDS = [
    'museum',
    'curator',
    'collections',
    'archivist',
    'exhibition',
    'historian',
    'public history',
    'museum educator',
    'heritage',
    'cultural institution',
    'gallery',
    'conservation',
    'anthropology',
    'natural history',
];
export async function fetchAllMuseumJobs() {
    const direct = await fetchPortalJobsFromEndpointList({
        source: 'MuseumJobs',
        envVar: 'MUSEUM_FEED_ENDPOINTS',
    });
    if (direct.length > 0) {
        return direct;
    }
    return fetchThemedJobsFromPublicBoards('MuseumJobs', MUSEUM_KEYWORDS);
}
