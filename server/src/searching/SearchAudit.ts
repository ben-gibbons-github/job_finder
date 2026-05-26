
import type { ScrapedJob } from '../scraping/ScrapedJob.js'
import { askGeminiWithSearch } from '../llms/AskLLM.js'
import searchAuditCache from './SearchAuditCache.js'

const inFlightAudits = new Set<string>()

export interface AuditResult {
  auditScore: number
  auditText: string
  error?: string
}

const auditCompletionCallbacks = new Map<string, Array<(r: AuditResult) => void>>()

function fireAuditCallbacks(auditKey: string, result: AuditResult): void {
  const cbs = auditCompletionCallbacks.get(auditKey)
  if (cbs) {
    auditCompletionCallbacks.delete(auditKey)
    for (const cb of cbs) cb(result)
  }
}

// Temporary throttle flag: toggle this off to remove the concurrency cap.
const ENABLE_TEMP_LLM_CONCURRENCY_CAP = true
const TEMP_MAX_SIMULTANEOUS_LLM_AUDITS = 3
const QUOTA_WARN_LOG_INTERVAL_MS = 15_000

let activeLlmAuditCalls = 0
const pendingLlmAuditQueue: Array<() => void> = []
let lastQuotaWarnAt = 0

function isQuotaError(error: unknown): boolean {
  const text = String(error).toLowerCase()
  return (
    text.includes('resource_exhausted') ||
    text.includes('quota exceeded') ||
    text.includes('request failed (429)')
  )
}

function clampToPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.max(0, Math.min(100, Math.round(value)))
}

function extractJsonObject(text: string): string | null {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    return null
  }
  return text.slice(start, end + 1)
}

function parseAuditRatings(responseText: string): { jobQuality: number; redFlags: number; summary: string } | null {
  const jsonSlice = extractJsonObject(responseText)
  if (!jsonSlice) {
    return null
  }

  try {
    const parsed = JSON.parse(jsonSlice) as {
      jobQuality?: unknown
      redFlags?: unknown
      summary?: unknown
    }

    const jobQuality = clampToPercent(Number(parsed.jobQuality))
    const redFlags = clampToPercent(Number(parsed.redFlags))
    const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : ''

    return { jobQuality, redFlags, summary }
  } catch {
    return null
  }
}

function getJobAuditKey(job: ScrapedJob): string {
  const sourceUrl = job.source_url?.trim()
  if (sourceUrl) {
    return sourceUrl
  }
  return `${job.name}::${job.company_name}::${job.location}`
}

function isFailedAuditText(auditText: string | undefined | null): boolean {
  if (typeof auditText !== 'string') {
    return false
  }

  const normalized = auditText.trim().toLowerCase()
  return normalized === 'searchaudit failed' || normalized.includes('searchaudit failed')
}

function clearFailedAudit(job: ScrapedJob): void {
  searchAuditCache.deleteCachedAudit(job)
  job.audit_number = 0
  job.audit_text = ''
}

function runWithLlmConcurrencyCap(runAudit: () => void): void {
  if (!ENABLE_TEMP_LLM_CONCURRENCY_CAP) {
    runAudit()
    return
  }

  const launch = () => {
    activeLlmAuditCalls += 1
    runAudit()
  }

  if (activeLlmAuditCalls < TEMP_MAX_SIMULTANEOUS_LLM_AUDITS) {
    launch()
    return
  }

  pendingLlmAuditQueue.push(launch)
}

function releaseLlmConcurrencySlot(): void {
  if (!ENABLE_TEMP_LLM_CONCURRENCY_CAP) {
    return
  }

  activeLlmAuditCalls = Math.max(0, activeLlmAuditCalls - 1)
  const next = pendingLlmAuditQueue.shift()
  if (next) {
    next()
  }
}

export function auditJob(job: ScrapedJob, shouldLog = false, shouldLaunch = false): number {
  const auditKey = getJobAuditKey(job)

  shouldLog = true
  if (isFailedAuditText(job.audit_text)) {
    if (shouldLog) {
      console.log(`[SearchAudit] Existing failure audit found for ${job.name}; deleting and retrying.`)
    }
    clearFailedAudit(job)
  }

  if (job.audit_number > 0 && job.audit_text.trim().length > 0) {
    if (shouldLog) {
      console.log(`[SearchAudit] Existing audit data found for ${job.name}; skipping LLM audit.`)
    }
    return clampToPercent(job.audit_number)
  }

  // Check cache
  const cached = searchAuditCache.getCachedAudit(job)
  if (cached) {
    if (isFailedAuditText(cached.auditText)) {
      if (shouldLog) {
        console.log(`[SearchAudit] Cached failure found for ${job.name}; deleting and retrying.`)
      }
      clearFailedAudit(job)
    } else {
      if (shouldLog) {
        console.log(`[SearchAudit] Cache hit for ${job.name}; using cached audit.`)
      }
      job.audit_number = cached.auditScore
      job.audit_text = cached.auditText
      return clampToPercent(job.audit_number)
    }
  }

  if (inFlightAudits.has(auditKey)) {
    if (shouldLog) {
      console.log(`[SearchAudit] Audit already in flight for ${job.name}; skipping duplicate launch.`)
    }
    return clampToPercent(job.audit_number)
  }

  if (!shouldLaunch)
    return clampToPercent(job.audit_number)

  const question = [
    'Do some background research on this job posting and return ONLY valid JSON. Summarize the research you found on the company. Highlight any red flags about the company or the job posting.',
    '',
    'Rate both values from 0 to 100:',
    '- jobQuality: higher is better quality',
    '- redFlags: higher means more red flags',
    '',
    'JSON shape:',
    '{"summary": "string", "jobQuality": number, "redFlags": number}',
    '',
    '',
    "You are a job-seeker's due-diligence assistant. I am considering applying to the following role and need a thorough background check on the company before I invest time in the application.",
    '',
    '## Role Details',
    `- **Company:** ${job.company_name}`,
    `- **Title:** ${job.name}`,
    `- **Location:** ${job.location}`,
    `Job posting URL: ${job.source_url} (source: ${job.source})`,
    '',
    '## Job Description (for context)',
    `${job.description}`,
    '',
    '---',
    '',
    '## Research Tasks',
    '',
    'Please investigate the following and provide a structured report:',
    '',
    '1. **Company Overview**',
    '   - What does the company do? What industry and stage (startup, scale-up, public, non-profit, government, etc.)?',
    '   - Approximate headcount and founding year.',
    '',
    '2. **Financial Health & Stability**',
    '   - Is the company profitable or venture-funded? Recent funding rounds or revenue signals.',
    '   - Any signs of financial distress, layoffs, or downsizing in the past 12–18 months?',
    '',
    '3. **Reputation & Culture**',
    '   - Glassdoor / Blind / LinkedIn review sentiment. Common praise and complaints.',
    '   - Any notable leadership controversies, lawsuits, or press scandals?',
    '',
    '4. **Mission Alignment & Impact**',
    "   - Does the company's stated mission match its actions? Any greenwashing or impact-washing red flags?",
    '',
    '5. **Role Legitimacy**',
    '   - Does this job posting appear genuine? Any signals it could be a ghost listing, scam, or role already filled?',
    "   - Is the listed location consistent with the company's known offices?",
    '',
    '6. **Red Flags Summary**',
    '   - List any significant concerns I should investigate further before applying.',
    '',
    '7. **Overall Verdict**',
    '   - On a scale of Low / Medium / High, rate the risk of this company being a poor employer.',
    '   - Should I proceed with the application, proceed with caution, or skip?',
    '',
    'Be direct and honest. Do not soften negative findings.',
    '',
    'Do some background research on this job posting and return ONLY valid JSON. Summarize the research you found on the company. Highlight any red flags about the company or the job posting.',
    '',
    'Rate both values from 0 to 100:',
    '- jobQuality: higher is better quality',
    '- redFlags: higher means more red flags',
    '',
    'JSON shape:',
    '{"summary": "string", "jobQuality": number, "redFlags": number}',
  ].join('\n')

  console.log(`[SearchAudit] Queuing Gemini audit for ${job.name} with question:\n${question}`)

  if (shouldLog) {
    // console.log(`[SearchAudit] Running Gemini background audit for ${job.name}`)
  }

  inFlightAudits.add(auditKey)

  runWithLlmConcurrencyCap(() => {
    void (async () => {
      try {

        console.log(`[SearchAudit] Asking Gemini with search for ${job.name}`)

        const [result] = await askGeminiWithSearch([question], {
          systemInstruction:
            'You are a strict job-posting auditor. Keep output compact and produce JSON only.'
        })

        const parsed = parseAuditRatings(result.answer)
        if (!parsed) {
          throw new Error(`SearchAudit failed to parse Gemini response for job: ${job.name} ${result.answer}`)
        }

        const finalAuditScore = clampToPercent((parsed.jobQuality + (100 - parsed.redFlags)) / 2)

        job.audit_number = finalAuditScore
        job.audit_text = JSON.stringify({
          jobQuality: parsed.jobQuality,
          redFlags: parsed.redFlags,
          finalAuditScore,
          summary: parsed.summary
        })

        // Cache the result
        searchAuditCache.setCachedAudit(job, { auditScore: finalAuditScore, auditText: job.audit_text })
        fireAuditCallbacks(auditKey, { auditScore: finalAuditScore, auditText: job.audit_text })

        if (shouldLog) {
          console.log(`[SearchAudit] Audit complete for ${job.name}`, {
            jobQuality: parsed.jobQuality,
            redFlags: parsed.redFlags,
            finalAuditScore
          })
        }
      } catch (error) {
        // Do not persist failed audits; keep state clear so next request can retry.
        clearFailedAudit(job)
        fireAuditCallbacks(auditKey, {
          auditScore: 0,
          auditText: '',
          error: String(error),
        })
        if (shouldLog) {
          if (isQuotaError(error)) {
            const now = Date.now()
            if (now - lastQuotaWarnAt >= QUOTA_WARN_LOG_INTERVAL_MS) {
              lastQuotaWarnAt = now
              console.warn('[SearchAudit] Gemini rate/quota limit reached. Audits will retry more slowly.')
            }
          } else {
            console.error(`[SearchAudit] Audit failed for ${job.name}:`, error)
          }
        }
      } finally {
        inFlightAudits.delete(auditKey)
        releaseLlmConcurrencySlot()
      }
    })()
  })

  // Background audit is running; return current score for now.
  return clampToPercent(job.audit_number)
}

/**
 * Async variant: resolves when the audit finishes (or immediately if already done).
 * Safe to call multiple times for the same job — duplicate launches are suppressed.
 */
export function auditJobAsync(job: ScrapedJob, shouldLog = false): Promise<AuditResult> {
  const auditKey = getJobAuditKey(job)

  if (isFailedAuditText(job.audit_text)) {
    clearFailedAudit(job)
  }

  if (job.audit_number > 0 && job.audit_text.trim().length > 0) {
    return Promise.resolve({ auditScore: clampToPercent(job.audit_number), auditText: job.audit_text })
  }

  // Check cache
  const cached = searchAuditCache.getCachedAudit(job)
  if (cached) {
    if (isFailedAuditText(cached.auditText)) {
      if (shouldLog) {
        console.log(`[SearchAudit] Cached failure found for ${job.name}; deleting and retrying.`)
      }
      clearFailedAudit(job)
    } else {
      job.audit_number = cached.auditScore
      job.audit_text = cached.auditText
      return Promise.resolve(cached)
    }
  }

  return new Promise((resolve) => {
    const existing = auditCompletionCallbacks.get(auditKey) ?? []
    existing.push(resolve)
    auditCompletionCallbacks.set(auditKey, existing)
    // auditJob deduplicates in-flight launches via inFlightAudits
    auditJob(job, shouldLog, true)
  })
}