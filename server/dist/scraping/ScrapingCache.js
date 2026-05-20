import path from 'node:path';
import { promises as fs } from 'node:fs';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_DIR = path.resolve(process.cwd(), 'cache');
function cacheFilePath(componentName) {
    return path.join(CACHE_DIR, `${componentName}.json`);
}
export async function ensureCacheDir() {
    await fs.mkdir(CACHE_DIR, { recursive: true });
}
export async function readFreshCache(componentName) {
    const filePath = cacheFilePath(componentName);
    try {
        const stat = await fs.stat(filePath);
        const cacheAgeMs = Date.now() - stat.mtimeMs;
        if (cacheAgeMs > CACHE_TTL_MS) {
            return null;
        }
        const raw = await fs.readFile(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            return null;
        }
        return parsed;
    }
    catch {
        return null;
    }
}
export async function readAnyCache(componentName) {
    const filePath = cacheFilePath(componentName);
    try {
        const raw = await fs.readFile(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            return null;
        }
        return parsed;
    }
    catch {
        return null;
    }
}
export async function writeCache(componentName, jobs) {
    const filePath = cacheFilePath(componentName);
    await fs.writeFile(filePath, JSON.stringify(jobs, null, 2), 'utf8');
}
