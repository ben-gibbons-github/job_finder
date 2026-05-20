import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promises as fs } from 'node:fs'

export interface CachedLocationOption {
  value: string
  label: string
  country?: string
  state?: string
  displayLabel: string
  lat: number
  lng: number
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const CACHE_FILE_PATH = path.resolve(__dirname, '../../cache/locationsearch.json')

type LocationSearchCacheStore = Record<string, CachedLocationOption[]>

const locationSearchCache = new Map<string, CachedLocationOption[]>()
let loadPromise: Promise<void> | null = null
let writeQueue: Promise<void> = Promise.resolve()

async function ensureCacheLoaded(): Promise<void> {
  if (loadPromise) {
    return loadPromise
  }

  loadPromise = (async () => {
    try {
      const raw = await fs.readFile(CACHE_FILE_PATH, 'utf8')
      const parsed = JSON.parse(raw) as unknown
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return
      }

      const asRecord = parsed as LocationSearchCacheStore
      for (const [query, results] of Object.entries(asRecord)) {
        if (!query || !Array.isArray(results)) {
          continue
        }

        const filtered = results.filter((item) => {
          return (
            item &&
            typeof item.value === 'string' &&
            typeof item.label === 'string' &&
            typeof item.displayLabel === 'string' &&
            Number.isFinite(item.lat) &&
            Number.isFinite(item.lng)
          )
        })

        if (filtered.length > 0) {
          locationSearchCache.set(query, filtered)
        }
      }
    } catch {
      // No cache file yet or invalid JSON; start with empty in-memory cache.
    }
  })()

  return loadPromise
}

async function persistCacheToDisk(): Promise<void> {
  const payload: LocationSearchCacheStore = Object.fromEntries(locationSearchCache)

  writeQueue = writeQueue
    .then(async () => {
      await fs.mkdir(path.dirname(CACHE_FILE_PATH), { recursive: true })
      await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(payload, null, 2), 'utf8')
    })
    .catch(() => undefined)

  return writeQueue
}

export async function getCachedLocationSearch(query: string): Promise<CachedLocationOption[] | null> {
  await ensureCacheLoaded()
  return locationSearchCache.get(query) ?? null
}

export async function setCachedLocationSearch(
  query: string,
  results: CachedLocationOption[]
): Promise<void> {
  if (!query || results.length === 0) {
    return
  }

  await ensureCacheLoaded()
  locationSearchCache.set(query, results)
  await persistCacheToDisk()
}
