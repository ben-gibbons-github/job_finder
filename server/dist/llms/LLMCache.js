import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CacheHandler } from '../utils/CacheHandler.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_FILE_PATH = path.resolve(__dirname, '../../cache/llmanswers.json');
const cacheHandler = new CacheHandler(CACHE_FILE_PATH);
let cache = {};
let loadPromise = null;
async function ensureCacheLoaded() {
    if (loadPromise) {
        return loadPromise;
    }
    loadPromise = (async () => {
        try {
            const parsed = await cacheHandler.loadWithFallback((raw) => JSON.parse(raw));
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                cache = Object.fromEntries(Object.entries(parsed)
                    .filter(([key, value]) => typeof key === 'string' && typeof value === 'string')
                    .map(([key, value]) => [key, value]));
            }
        }
        catch {
            cache = {};
        }
    })();
    return loadPromise;
}
function persistCache() {
    return cacheHandler.save(JSON.stringify(cache, null, 2)).catch(() => undefined);
}
export async function getCachedAnswer(question) {
    const key = question.trim();
    if (!key) {
        return null;
    }
    await ensureCacheLoaded();
    return cache[key] ?? null;
}
export async function setCachedAnswer(question, answer) {
    const key = question.trim();
    const value = answer.trim();
    if (!key || !value) {
        return;
    }
    await ensureCacheLoaded();
    cache[key] = value;
    await persistCache();
}
