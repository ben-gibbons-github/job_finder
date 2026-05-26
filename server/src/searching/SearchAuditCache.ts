import * as fs from 'fs'
import * as path from 'path'
import type { ScrapedJob } from '../scraping/ScrapedJob.js'
import type { AuditResult } from './SearchAudit.js'

const CACHE_FILE = path.join(process.cwd(), 'server', 'cache', 'auditcache.json')

interface CachedAudit {
  auditScore: number
  auditText: string
  timestamp?: number
}

class SearchAuditCache {
  private cache: Map<string, CachedAudit> = new Map()

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

  getCachedAudit(job: ScrapedJob): AuditResult | null {
    const key = this.getJobKey(job)
    const cached = this.cache.get(key)
    if (cached) {
      return {
        auditScore: cached.auditScore,
        auditText: cached.auditText,
      }
    }
    return null
  }

  setCachedAudit(job: ScrapedJob, result: AuditResult): void {
    const key = this.getJobKey(job)
    this.cache.set(key, {
      auditScore: result.auditScore,
      auditText: result.auditText,
      timestamp: Date.now(),
    })
    this.saveToFile()
  }

  deleteCachedAudit(job: ScrapedJob): void {
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
      const parsed = JSON.parse(data) as Record<string, CachedAudit>
      this.cache = new Map(Object.entries(parsed))
      console.log(`[SearchAuditCache] Loaded ${this.cache.size} cached audits from ${CACHE_FILE}`)
    } catch (error) {
      console.error(`[SearchAuditCache] Failed to load cache from ${CACHE_FILE}:`, error)
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
      console.error(`[SearchAuditCache] Failed to save cache to ${CACHE_FILE}:`, error)
    }
  }
}

export default new SearchAuditCache()
