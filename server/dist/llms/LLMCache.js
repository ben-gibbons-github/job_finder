import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_FILE_PATH = path.resolve(__dirname, '../../cache/llmanswers.json');
let cache = {};
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
    writeQueue = writeQueue
        .then(async () => {
        await fs.mkdir(path.dirname(CACHE_FILE_PATH), { recursive: true });
        await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(cache, null, 2), 'utf8');
    })
        .catch(() => undefined);
    return writeQueue;
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
