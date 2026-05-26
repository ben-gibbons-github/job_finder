import * as fs from 'fs'
import * as path from 'path'
import type { ScrapedJob } from '../scraping/ScrapedJob.js'

const CACHE_FILE = path.join(process.cwd(), 'server', 'cache', 'impactcache.json')

interface CachedImpact {
  impactScore: number
  impactSummary: string
  timestamp?: number
}

class SearchImpactAICache {
  private cache: Map<string, CachedImpact> = new Map()

  constructor() {
    this.loadFromFile()
  }

  private getJobKey(job: ScrapedJob): string {
    const sourceUrl = job.source_url?.trim()
    if (sourceUrl) {
      return sourceUrl
    }
    return `${job.name}::${job.company_name}::${job.location}`
  }

  getCachedImpact(job: ScrapedJob): CachedImpact | null {
    const key = this.getJobKey(job)
    return this.cache.get(key) ?? null
  }

  setCachedImpact(job: ScrapedJob, result: CachedImpact): void {
    const key = this.getJobKey(job)
    this.cache.set(key, {
      impactScore: result.impactScore,
      impactSummary: result.impactSummary,
      timestamp: Date.now(),
    })
    this.saveToFile()
  }

  deleteCachedImpact(job: ScrapedJob): void {
    const key = this.getJobKey(job)
    if (this.cache.delete(key)) {
      this.saveToFile()
    }
  }

  private loadFromFile(): void {
    try {
      if (!fs.existsSync(CACHE_FILE)) {
        return
      }
      const data = fs.readFileSync(CACHE_FILE, 'utf-8')
      const parsed = JSON.parse(data) as Record<string, CachedImpact>
      this.cache = new Map(Object.entries(parsed))
      console.log(`[SearchImpactAICache] Loaded ${this.cache.size} cached impact entries from ${CACHE_FILE}`)
    } catch (error) {
      console.error(`[SearchImpactAICache] Failed to load cache from ${CACHE_FILE}:`, error)
      this.cache = new Map()
    }
  }

  private saveToFile(): void {
    try {
      const dir = path.dirname(CACHE_FILE)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      const obj = Object.fromEntries(this.cache)
      fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf-8')
    } catch (error) {
      console.error(`[SearchImpactAICache] Failed to save cache to ${CACHE_FILE}:`, error)
    }
  }
}

export default new SearchImpactAICache()
