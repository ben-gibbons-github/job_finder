import {
  LatLonPair,
  getCachedLocation,
  hasCachedLocation,
  cacheLocation,
  initializeCache,
  clearLocationCache,
  getCacheSize,
} from './NameToLonLatCache.js';
import { geocodingStrategies } from './NameToLonLatStrategies.js';
import { enqueueNameToLonLatRetry, startNameToLonLatRetryWorker } from './NameToLonLatRetryQueue.js';

startNameToLonLatRetryWorker();

/**
 * Converts a place name to latitude and longitude coordinates
 * Uses a global cache to avoid repeated API calls for the same location
 * Tries up to 5 different geocoding APIs in order, rotating on failure
 * @param placeName - The name of the place to geocode
 * @returns Promise resolving to {lat, lon} pair
 */
export async function nameToLonLat(placeName: string): Promise<LatLonPair> {
  // console.log('Geocoding place name 1:', placeName);

  await initializeCache();

  const normalizedName = placeName.trim().toLowerCase();

  // console.log('Geocoding place name 2:', normalizedName);

  // Check cache first
  if (hasCachedLocation(normalizedName)) {

    // console.log('Found cached location for:', normalizedName);
    return getCachedLocation(normalizedName)!;
  }
  // console.log('Not found in cache for:', normalizedName);

  // Try each geocoding strategy in order
  let lastError: any = null;
  for (const strategy of geocodingStrategies) {
    try {
      // console.log('Attempting geocoding with strategy:', strategy.name, 'for location:', normalizedName);
      const latLon = await strategy(placeName);
      // Store in cache
      console.log('Caching location for:', normalizedName, '->', latLon);
      cacheLocation(normalizedName, latLon);
      return latLon;
    } catch (err) {
      /*
      console.warn(
        'Geocoding strategy failed:',
        strategy.name,
        'for location:',
        normalizedName,
        'error:',
        err instanceof Error ? err.message : String(err)
      );*/
      lastError = err;
    }
  }
  enqueueNameToLonLatRetry(placeName);
  throw new Error(`Failed to geocode location "${placeName}" with all providers: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

// Re-export cache functions for backwards compatibility
export { clearLocationCache, getCacheSize } from './NameToLonLatCache.js';
