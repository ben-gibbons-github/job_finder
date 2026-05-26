import { fetchPortalJobsFromEndpointList } from './GenericEndpointPortalAPI.js';
import { fetchThemedJobsFromPublicBoards } from './ThemedSourceUtils.js';
const ART_KEYWORDS = [
    'artist',
    'arts',
    'creative',
    'illustrator',
    'animator',
    'gallery',
    'curator',
    'visual design',
    'graphic design',
    'fine art',
    'performing arts',
    'music',
    'theater',
    'theatre',
    'storytelling',
    'creative producer',
    'creative technologist',
];
export async function fetchAllArtJobs() {
    const direct = await fetchPortalJobsFromEndpointList({
        source: 'ArtJobs',
        envVar: 'ART_FEED_ENDPOINTS',
    });
    if (direct.length > 0) {
        return direct;
    }
    return fetchThemedJobsFromPublicBoards('ArtJobs', ART_KEYWORDS);
}
