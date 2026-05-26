import * as fs from 'fs';
import * as path from 'path';
const CACHE_FILE = path.join(process.cwd(), 'server', 'cache', 'impactcache.json');
class SearchImpactAICache {
    cache = new Map();
    constructor() {
        this.loadFromFile();
    }
    getJobKey(job) {
        const sourceUrl = job.source_url?.trim();
        if (sourceUrl) {
            return sourceUrl;
        }
        return `${job.name}::${job.company_name}::${job.location}`;
    }
    getCachedImpact(job) {
        const key = this.getJobKey(job);
        return this.cache.get(key) ?? null;
    }
    setCachedImpact(job, result) {
        const key = this.getJobKey(job);
        this.cache.set(key, {
            impactScore: result.impactScore,
            impactSummary: result.impactSummary,
            timestamp: Date.now(),
        });
        this.saveToFile();
    }
    deleteCachedImpact(job) {
        const key = this.getJobKey(job);
        if (this.cache.delete(key)) {
            this.saveToFile();
        }
    }
    loadFromFile() {
        try {
            if (!fs.existsSync(CACHE_FILE)) {
                return;
            }
            const data = fs.readFileSync(CACHE_FILE, 'utf-8');
            const parsed = JSON.parse(data);
            this.cache = new Map(Object.entries(parsed));
            console.log(`[SearchImpactAICache] Loaded ${this.cache.size} cached impact entries from ${CACHE_FILE}`);
        }
        catch (error) {
            console.error(`[SearchImpactAICache] Failed to load cache from ${CACHE_FILE}:`, error);
            this.cache = new Map();
        }
    }
    saveToFile() {
        try {
            const dir = path.dirname(CACHE_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const obj = Object.fromEntries(this.cache);
            fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
        }
        catch (error) {
            console.error(`[SearchImpactAICache] Failed to save cache to ${CACHE_FILE}:`, error);
        }
    }
}
export default new SearchImpactAICache();
