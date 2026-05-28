import searchAuditCache from '../searching/SearchAuditCache.js'
import searchImpactAICache from '../searching/SearchImpactAICache.js'
import searchQualityOfLifeCache from '../searching/SearchQualityOfLifeCache.js'
import type { ScrapedEmployer } from './ScrapedEmployer.js'
import type { ScrapedJob } from './ScrapedJob.js'

function clampToPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.max(0, Math.min(100, Math.round(value)))
}

function parseLegacyAuditText(auditText: string): { summary: string; jobQuality: number; redFlags: number } | null {
  const trimmed = String(auditText ?? '').trim()
  if (!trimmed) {
    return null
  }

  try {
    const parsed = JSON.parse(trimmed) as {
      summary?: unknown
      jobQuality?: unknown
      redFlags?: unknown
    }

    const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : ''
    const jobQuality = clampToPercent(Number(parsed.jobQuality))
    const redFlags = clampToPercent(Number(parsed.redFlags))
    return { summary, jobQuality, redFlags }
  } catch {
    return null
  }
}

function applyLegacyCachesToEmployer(job: ScrapedJob, employer: ScrapedEmployer): void {
  const cachedAudit = searchAuditCache.getCachedAudit(job)
  if (cachedAudit) {
    job.audit_number = clampToPercent(cachedAudit.auditScore)
    job.audit_text = cachedAudit.auditText

    const parsedAudit = parseLegacyAuditText(cachedAudit.auditText)
    if (parsedAudit) {
      employer.ai_score = parsedAudit.jobQuality
      employer.ai_red_flag_score = parsedAudit.redFlags
      if (parsedAudit.summary) {
        employer.ai_summary = parsedAudit.summary
      }
    } else {
      employer.ai_score = clampToPercent(cachedAudit.auditScore)
      if (!employer.ai_summary && cachedAudit.auditText.trim().length > 0) {
        employer.ai_summary = cachedAudit.auditText.trim().slice(0, 2000)
      }
    }
  } else if (job.audit_number > 0 && String(job.audit_text ?? '').trim().length > 0) {
    employer.ai_score = clampToPercent(job.audit_number)
    const parsedAudit = parseLegacyAuditText(job.audit_text)
    if (parsedAudit) {
      employer.ai_red_flag_score = parsedAudit.redFlags
      if (parsedAudit.summary) {
        employer.ai_summary = parsedAudit.summary
      }
    }
  }

  const cachedImpact = searchImpactAICache.getCachedImpact(job)
  if (cachedImpact) {
    employer.ai_impact_score = clampToPercent(cachedImpact.impactScore)
    employer.ai_impact_summary = String(cachedImpact.impactSummary ?? '').trim()
  }

  const cachedQualityOfLife = searchQualityOfLifeCache.getCachedQualityOfLife(job)
  if (cachedQualityOfLife) {
    employer.employeeQualityOfLifeScore = clampToPercent(cachedQualityOfLife.employeeQualityOfLifeScore)
    employer.employeeQualityOfLifeSummary = String(cachedQualityOfLife.employeeQualityOfLifeSummary ?? '').trim()
  }
}

export function gatherLegacyAIData(jobs: ScrapedJob[], employerDatastore: Map<string, ScrapedEmployer>): void {
  for (const job of jobs) {
    const employer = job.scrapedEmployer
    if (!employer) {
      continue
    }

    applyLegacyCachesToEmployer(job, employer)

    const key = String(employer.name ?? '').trim().toLowerCase()
    if (!key) {
      continue
    }
    employerDatastore.set(key, employer)
  }
}
