import type { ScrapedJob } from '../scraping/ScrapedJob.js';
import { geocodeJobLocations } from '../searching/SearchDistance.js';

function isMissingCoordinates(job: ScrapedJob): boolean {
  return (
    typeof job.location_lat !== 'number' ||
    typeof job.location_lon !== 'number' ||
    Number.isNaN(job.location_lat) ||
    Number.isNaN(job.location_lon) ||
    (job.location_lat === 0 && job.location_lon === 0)
  );
}

export function startBackgroundGeocodeJobs(jobs: ScrapedJob[]): void {
  const startedAtMs = Date.now();
  console.log(`[BackgroundGeocode] Triggered for ${jobs.length} jobs.`);

  const missingCoordinatesCount = jobs.filter(isMissingCoordinates).length;

  if (missingCoordinatesCount === 0) {
    console.log('[BackgroundGeocode] Skipping: no jobs are missing coordinates.');
    return;
  }

  console.log(
    `[BackgroundGeocode] Starting startup geocoding for ${missingCoordinatesCount}/${jobs.length} jobs missing coordinates...`
  );

  // Fire-and-forget: do not block startup/search availability on geocoding.
  void (async () => {
    try {
      console.log('[BackgroundGeocode] Worker started (non-blocking).');
      const geocodedJobs = await geocodeJobLocations(jobs, true);
      console.log('[BackgroundGeocode] Geocode lookup pass completed. Merging coordinates into in-memory jobs...');

      // Merge geocoded coordinates back into in-memory job objects.
      for (let i = 0; i < jobs.length; i += 1) {
        jobs[i].location_lat = geocodedJobs[i].location_lat;
        jobs[i].location_lon = geocodedJobs[i].location_lon;
      }

      const remainingMissingCoordinatesCount = jobs.filter(isMissingCoordinates).length;
      const geocodedCount = Math.max(0, missingCoordinatesCount - remainingMissingCoordinatesCount);
      const resolvedPct = missingCoordinatesCount > 0
        ? ((geocodedCount / missingCoordinatesCount) * 100).toFixed(1)
        : '0.0';
      const durationMs = Date.now() - startedAtMs;

      console.log(
        `[BackgroundGeocode] Startup geocoding complete: resolved ${geocodedCount}/${missingCoordinatesCount} missing job coordinates (${resolvedPct}%). Remaining missing: ${remainingMissingCoordinatesCount}. Took ${durationMs}ms.`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const durationMs = Date.now() - startedAtMs;
      console.error(`[BackgroundGeocode] Startup geocoding failed after ${durationMs}ms: ${message}`);
    }
  })();
}
