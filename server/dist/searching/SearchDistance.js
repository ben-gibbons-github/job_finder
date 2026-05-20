import { nameToLonLat } from '../utils/NameToLonLat.js';
/**
 * Distance and location-based scoring functionality
 * Handles geographic distance calculations and remote job detection
 */
/**
 * Helper function to convert degrees to radians
 */
function toRad(deg) {
    return (deg * Math.PI) / 180;
}
/**
 * Calculates the great-circle distance between two geographic points
 * using the Haversine formula
 *
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
/**
 * Helper function to safely convert any value to lowercase text
 */
function toSafeText(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value).toLowerCase();
}
/**
 * Detects if a job is marked as remote or work-from-home
 *
 * Uses heuristics to check job type and location for remote keywords
 *
 * @param job - The job to check
 * @returns true if the job appears to be remote
 */
export function isRemoteJob(job) {
    const remoteKeywords = ['remote', 'anywhere', 'distributed', 'work from home'];
    const loc = toSafeText(job.location);
    const typ = toSafeText(job.type);
    return remoteKeywords.some((kw) => loc.includes(kw) || typ.includes(kw));
}
/**
 * Calculates the location score based on geographic distance and remote status
 *
 * Score is normalized to 0-1 range:
 * - Remote jobs get a base score of 0.5
 * - Distance-based score is calculated using Haversine distance
 * - Takes the maximum of both approaches
 *
 * @param userLat - User's latitude (or null if not available)
 * @param userLon - User's longitude (or null if not available)
 * @param job - The job being scored
 * @param locationText - User's location text input (checked for "remote" keyword)
 * @returns Location score between 0 and 1
 */
export function calculateLocationScore(userLat, userLon, job, locationText, shouldLog = false) {
    let distanceScore = 0;
    const normalizedUserLocationText = toSafeText(locationText).trim();
    const normalizedJobLocation = toSafeText(job.location);
    const normalizedJobDescription = toSafeText(job.description);
    // Calculate distance-based score if coordinates are available
    if (userLat !== null &&
        userLon !== null &&
        Number.isFinite(userLat) &&
        Number.isFinite(userLon) &&
        typeof job.location_lat === 'number' &&
        typeof job.location_lon === 'number' &&
        Number.isFinite(job.location_lat) &&
        Number.isFinite(job.location_lon)) {
        if (shouldLog) {
            console.log(`Calculating location score for job "${job.name}" at "${job.location}" with user location "${locationText} ${userLat}, ${userLon} job.location_lat: ${job.location_lat} job.location_lon: ${job.location_lon}"`);
        }
        const distanceKm = haversineDistance(userLat, userLon, job.location_lat, job.location_lon);
        // Clamp to keep location score in [0, 1]
        distanceScore = Math.max(0, Math.min(1, (100 - Math.sqrt(distanceKm)) / 100));
        if (shouldLog) {
            console.log(`Calculated distance for job "${job.name}" at "${job.location}": ${distanceKm.toFixed(2)} km -> distanceScore: ${distanceScore.toFixed(4)}`);
        }
    }
    else if (normalizedUserLocationText.length > 0) {
        // Geocoding fallback: award a text-match score when user/job locations overlap.
        if (normalizedJobLocation.includes(normalizedUserLocationText) ||
            normalizedUserLocationText.includes(normalizedJobLocation)) {
            distanceScore = Math.max(0.6, distanceScore);
        }
        else {
            const userLocationTerms = normalizedUserLocationText.split(/\s+/).filter((t) => t.length >= 3);
            const hitCount = userLocationTerms.filter((term) => normalizedJobLocation.includes(term) || normalizedJobDescription.includes(term)).length;
            if (hitCount > 0 && userLocationTerms.length > 0) {
                distanceScore = Math.max(distanceScore, Math.min(0.5, hitCount / userLocationTerms.length));
            }
        }
    }
    // Apply remote job boost
    const remote = isRemoteJob(job) || normalizedUserLocationText.includes('remote');
    if (remote) {
        if (false)
            distanceScore = Math.max(distanceScore, 0.5);
    }
    if (shouldLog) {
        console.log(`Final location score for job "${job.name}" at "${job.location}": ${distanceScore.toFixed(4)} (remote: ${remote})`);
    }
    return distanceScore;
}
/**
 * Geocodes the user's location text to latitude/longitude coordinates
 *
 * @param locationText - User's location text (city, region, etc.)
 * @returns Object with lat/lon, or null if geocoding fails or text is empty
 */
export async function geocodeUserLocation(locationText, shouldLog = false) {
    if (locationText.trim().length === 0) {
        return null;
    }
    try {
        const userLoc = await nameToLonLat(locationText);
        if (shouldLog) {
            console.log('Geocoding user location:', locationText, '->', userLoc);
        }
        return { lat: userLoc.lat, lon: userLoc.lon };
    }
    catch (e) {
        // console.warn('Failed to geocode user location:', locationText, e)
        return null;
    }
}
/**
 * Geocodes job locations for all jobs that are missing coordinates
 *
 * Updates job.location_lat and job.location_lon for jobs that have no valid coordinates
 *
 * @param jobs - Array of jobs to geocode
 * @returns Array of jobs with updated location coordinates
 */
export async function geocodeJobLocations(jobs, shouldLog = false) {
    return Promise.all(jobs.map(async (job) => {
        let lat = job.location_lat;
        let lon = job.location_lon;
        // Check if coordinates are missing or invalid
        if ((typeof lat !== 'number' ||
            typeof lon !== 'number' ||
            isNaN(lat) ||
            isNaN(lon) ||
            (lat === 0 && lon === 0)) &&
            job.location) {
            try {
                if (shouldLog) {
                    console.log('Geocoding job location for job:', job.name, 'location:', job.location);
                }
                const loc = await nameToLonLat(job.location);
                lat = loc.lat;
                lon = loc.lon;
            }
            catch (e) {
                lat = NaN;
                lon = NaN;
                // console.warn('Failed to geocode job location:', job.location, 'for job:', job.name, e)
            }
        }
        return { ...job, location_lat: lat, location_lon: lon };
    }));
}
