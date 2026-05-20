import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_FILE_PATH = path.resolve(__dirname, '../../cache/locationsearch.json');
const locationSearchCache = new Map();
let loadPromise = null;
let writeQueue = Promise.resolve();
async function ensureCacheLoaded() {
    if (loadPromise) {
        return loadPromise;
    }
    loadPromise = (async () => {
        try {
            const raw = await fs.readFile(CACHE_FILE_PATH, 'utf8');
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                return;
            }
            const asRecord = parsed;
            for (const [query, results] of Object.entries(asRecord)) {
                if (!query || !Array.isArray(results)) {
                    continue;
                }
                const filtered = results.filter((item) => {
                    return (item &&
                        typeof item.value === 'string' &&
                        typeof item.label === 'string' &&
                        typeof item.displayLabel === 'string' &&
                        Number.isFinite(item.lat) &&
                        Number.isFinite(item.lng));
                });
                if (filtered.length > 0) {
                    locationSearchCache.set(query, filtered);
                }
            }
        }
        catch {
            // No cache file yet or invalid JSON; start with empty in-memory cache.
        }
    })();
    return loadPromise;
}
async function persistCacheToDisk() {
    const payload = Object.fromEntries(locationSearchCache);
    writeQueue = writeQueue
        .then(async () => {
        await fs.mkdir(path.dirname(CACHE_FILE_PATH), { recursive: true });
        await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(payload, null, 2), 'utf8');
    })
        .catch(() => undefined);
    return writeQueue;
}
export async function getCachedLocationSearch(query) {
    await ensureCacheLoaded();
    return locationSearchCache.get(query) ?? null;
}
export async function setCachedLocationSearch(query, results) {
    if (!query || results.length === 0) {
        return;
    }
    await ensureCacheLoaded();
    locationSearchCache.set(query, results);
    await persistCacheToDisk();
}
