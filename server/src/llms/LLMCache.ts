import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promises as fs } from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const CACHE_FILE_PATH = path.resolve(__dirname, '../../cache/llmanswers.json')

type LLMAnswerCache = Record<string, string>

let cache: LLMAnswerCache = {}
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

      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        cache = Object.fromEntries(
          Object.entries(parsed as Record<string, unknown>)
            .filter(([key, value]) => typeof key === 'string' && typeof value === 'string')
            .map(([key, value]) => [key, value as string])
        )
      }
    } catch {
      cache = {}
    }
  })()

  return loadPromise
}

function persistCache(): Promise<void> {
  writeQueue = writeQueue
    .then(async () => {
      await fs.mkdir(path.dirname(CACHE_FILE_PATH), { recursive: true })
      await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(cache, null, 2), 'utf8')
    })
    .catch(() => undefined)

  return writeQueue
}

export async function getCachedAnswer(question: string): Promise<string | null> {
  const key = question.trim()
  if (!key) {
    return null
  }

  await ensureCacheLoaded()
  return cache[key] ?? null
}

export async function setCachedAnswer(question: string, answer: string): Promise<void> {
  const key = question.trim()
  const value = answer.trim()
  if (!key || !value) {
    return
  }

  await ensureCacheLoaded()
  cache[key] = value
  await persistCache()
}
