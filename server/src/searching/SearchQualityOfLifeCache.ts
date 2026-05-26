import * as fs from 'fs'
import * as path from 'path'
import type { ScrapedJob } from '../scraping/ScrapedJob.js'
import type { QualityOfLifeResult } from './SearchQualityOfLife.js'

const CACHE_FILE = path.join(process.cwd(), 'server', 'cache', 'qualityoflifecache.json')

interface CachedQualityOfLife {
  employeeQualityOfLifeScore: number
  employeeQualityOfLifeSummary: string
  timestamp?: number
}

class SearchQualityOfLifeCache {
  private cache: Map<string, CachedQualityOfLife> = new Map()

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

  getCachedQualityOfLife(job: ScrapedJob): QualityOfLifeResult | null {
    const key = this.getJobKey(job)
    const cached = this.cache.get(key)
    if (cached) {
      return {
        employeeQualityOfLifeScore: cached.employeeQualityOfLifeScore,
        employeeQualityOfLifeSummary: cached.employeeQualityOfLifeSummary,
      }
    }
    return null
  }

  setCachedQualityOfLife(job: ScrapedJob, result: QualityOfLifeResult): void {
    const key = this.getJobKey(job)
    this.cache.set(key, {
      employeeQualityOfLifeScore: result.employeeQualityOfLifeScore,
      employeeQualityOfLifeSummary: result.employeeQualityOfLifeSummary,
      timestamp: Date.now(),
    })
    this.saveToFile()
  }

  deleteCachedQualityOfLife(job: ScrapedJob): void {
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
      const parsed = JSON.parse(data) as Record<string, CachedQualityOfLife>
      this.cache = new Map(Object.entries(parsed))
      console.log(`[SearchQualityOfLifeCache] Loaded ${this.cache.size} cached QoL scores from ${CACHE_FILE}`)
    } catch (error) {
      console.error(`[SearchQualityOfLifeCache] Failed to load cache from ${CACHE_FILE}:`, error)
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
      console.error(`[SearchQualityOfLifeCache] Failed to save cache to ${CACHE_FILE}:`, error)
    }
  }
}

export default new SearchQualityOfLifeCache()
