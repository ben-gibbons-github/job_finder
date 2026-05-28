

import type { ScrapedJob } from '../scraping/ScrapedJob.js'
import type {
  ScoreWeights,
  SearchPayload,
  SearchLogFlags,
  JobScores,
  JobAiPayload,
  SearchAiCoverage,
  SearchResultMeta,
  SearchScoreBucket,
  RankedJobWrapper,
} from './SearchInterfaces.js'
import { auditJob } from './SearchAudit.js'
import { geocodeUserLocation, geocodeJobLocations } from './SearchDistance.js'
import { calculateIndividualScores, jobMatchesQuery } from './SearchUtils.js'

const SERVER_HIDDEN_EXCLUSIONS_ENABLED = true

function normalizeExactUrl(value: unknown): string {
  return String(value ?? '').trim()
}

function normalizeExactCompanyName(value: unknown): string {
  return String(value ?? '').trim().toLowerCase()
}

function buildJobAiPayload(job: ScrapedJob): JobAiPayload | undefined {
  const employer = job.scrapedEmployer
  if (!employer) {
    return undefined
  }

  const auditSummary = String(employer.ai_summary ?? '').trim()
  const auditRedFlagSummary = String(employer.ai_red_flag_summary ?? '').trim()
  const impactSummary = String(employer.ai_impact_summary ?? '').trim()
  const qualityOfLifeSummary = String(employer.employeeQualityOfLifeSummary ?? '').trim()

  const auditScore = Number(employer.ai_score ?? 0)
  const redFlagScore = Number(employer.ai_red_flag_score ?? 0)
  const impactScore = Number(employer.ai_impact_score ?? 0)
  const qualityOfLifeScore = Number(employer.employeeQualityOfLifeScore ?? 0)

  return {
    audit: {
      hasData:
        auditSummary.length > 0 ||
        auditRedFlagSummary.length > 0 ||
        Number.isFinite(auditScore) && auditScore > 0 ||
        Number.isFinite(redFlagScore) && redFlagScore > 0,
      score: Number.isFinite(auditScore) ? auditScore : 0,
      redFlagScore: Number.isFinite(redFlagScore) ? redFlagScore : 0,
      summary: auditSummary,
      redFlagSummary: auditRedFlagSummary,
    },
    impact: {
      hasData: impactSummary.length > 0 || (Number.isFinite(impactScore) && impactScore > 0),
      score: Number.isFinite(impactScore) ? impactScore : 0,
      summary: impactSummary,
    },
    qualityOfLife: {
      hasData: qualityOfLifeSummary.length > 0 || (Number.isFinite(qualityOfLifeScore) && qualityOfLifeScore > 0),
      score: Number.isFinite(qualityOfLifeScore) ? qualityOfLifeScore : 0,
      summary: qualityOfLifeSummary,
    },
  }
}

function toPercent(part: number, total: number): number {
  if (total <= 0) {
    return 0
  }
  return Number(((part / total) * 100).toFixed(1))
}

function buildSearchAiCoverage(wrappers: RankedJobWrapper[]): SearchAiCoverage {
  const totalMatched = wrappers.length
  const auditCount = wrappers.filter((wrapper) => wrapper.aiPayload?.audit?.hasData === true).length
  const impactCount = wrappers.filter((wrapper) => wrapper.aiPayload?.impact?.hasData === true).length
  const qualityOfLifeCount = wrappers.filter((wrapper) => wrapper.aiPayload?.qualityOfLife?.hasData === true).length

  return {
    auditPercent: toPercent(auditCount, totalMatched),
    impactPercent: toPercent(impactCount, totalMatched),
    qualityOfLifePercent: toPercent(qualityOfLifeCount, totalMatched),
    totalMatched,
  }
}

function buildScoreDistribution(wrappers: RankedJobWrapper[]): SearchScoreBucket[] {
  const buckets = new Map<number, number>()

  for (const wrapper of wrappers) {
    const scorePercent = Number(wrapper.totalScore ?? 0) * 100
    if (!Number.isFinite(scorePercent)) {
      continue
    }
    const bucketStart = Math.max(0, Math.floor(scorePercent / 10) * 10)
    buckets.set(bucketStart, (buckets.get(bucketStart) ?? 0) + 1)
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([start, count]) => ({
      start,
      end: start + 9,
      count,
    }))
}

class SearchMain {
  async search(jobs: ScrapedJob[], searchPayload: SearchPayload): Promise<{ matched: RankedJobWrapper[]; size: number; meta: SearchResultMeta }> {
    const logFlags: SearchLogFlags = searchPayload.searchLogFlags ?? {}
    const logSearchMain = logFlags.searchMain === true
    const hiddenExclusionsEnabled = SERVER_HIDDEN_EXCLUSIONS_ENABLED

    const rawQueryValue = searchPayload.query
    const rawQuery = typeof rawQueryValue === 'string' ? rawQueryValue : ''
    const queryTerms = rawQuery
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((term) => term.trim())
      .filter((term) => term.length > 0)

    const hiddenJobUrls = hiddenExclusionsEnabled && Array.isArray(searchPayload.hiddenJobUrls)
      ? new Set(
          searchPayload.hiddenJobUrls
            .map((value: unknown) => normalizeExactUrl(value))
            .filter((value: string) => value.length > 0),
        )
      : new Set<string>()
    const hiddenCompanies = hiddenExclusionsEnabled && Array.isArray(searchPayload.hiddenCompanies)
      ? new Set(
          searchPayload.hiddenCompanies
            .map((value: unknown) => normalizeExactCompanyName(value))
            .filter((value: string) => value.length > 0),
        )
      : new Set<string>()

    const visibleJobs = jobs.filter((job) => {
      const sourceUrl = normalizeExactUrl(job.source_url)
      const companyName = normalizeExactCompanyName(job.company_name)
      if (sourceUrl && hiddenJobUrls.has(sourceUrl)) {
        return false
      }
      if (companyName && hiddenCompanies.has(companyName)) {
        return false
      }
      return true
    })

    if (logSearchMain) {
      console.log(
        'SearchMain.search called with query:',
        rawQuery,
        'parsed terms:',
        queryTerms,
        'locationText:',
        searchPayload.locationText,
        'resumeText length:',
        typeof searchPayload.resumeText === 'string' ? searchPayload.resumeText.length : 'N/A',
        'hiddenExclusionsEnabled:',
        hiddenExclusionsEnabled,
        'hiddenJobUrls:',
        hiddenJobUrls.size,
        'hiddenCompanies:',
        hiddenCompanies.size,
      )
    }

    const matched = queryTerms.length > 0
      ? visibleJobs.filter((job) => jobMatchesQuery(job, queryTerms, logFlags.query === true))
      : visibleJobs // If no query terms, consider all visible jobs as matched (subject to pagination later)

    const resumeText = typeof searchPayload.resumeText === 'string' ? searchPayload.resumeText : ''
    const locationText = typeof searchPayload.locationText === 'string' ? searchPayload.locationText : ''

    // Geocode user location
    const userLocCoords = locationText.length > 0 ? await geocodeUserLocation(locationText, logFlags.location === true) : null
    const userLat = userLocCoords?.lat ?? null
    const userLon = userLocCoords?.lon ?? null
    const hasUsableUserCoords =
      typeof userLat === 'number' &&
      typeof userLon === 'number' &&
      Number.isFinite(userLat) &&
      Number.isFinite(userLon)

    if (logSearchMain) {
      console.log('User location geocoded to:', userLocCoords, 'for location text:', locationText)
    }
    // return { matched: [], size: matched.length }

    // Geocoding every job location is expensive and only helps when user coordinates exist.
    // For empty/failed location input paths, skip this entirely and rely on text/remote scoring.
    const jobsWithCoords = hasUsableUserCoords
      ? await geocodeJobLocations(matched, logFlags.location === true)
      : matched

    // Calculate scores for each job and create wrappers
    const rankedWrappers = jobsWithCoords
      .map((job) => {
        const scores = calculateIndividualScores(job, resumeText, locationText, userLat, userLon, logFlags)
        // Calculate total score using weights
        const totalScore =
          (scores.resume ?? 0) * (searchPayload.scoreWeights?.resume ?? 1) +
          (scores.impact ?? 0) * (searchPayload.scoreWeights?.impact ?? 1) +
          (scores.location ?? 0) * (searchPayload.scoreWeights?.location ?? 1) +
          (scores.fresh ?? 0) * (searchPayload.scoreWeights?.fresh ?? 1) +
          (scores.audit ?? 0) * (searchPayload.scoreWeights?.audit ?? 1) + 
          (scores.qualityOfLife ?? 0) * (searchPayload.scoreWeights?.qualityOfLife ?? 1);
          
        return {
          job,
          scores,
          totalScore,
          aiPayload: buildJobAiPayload(job),
        }
      })
      .sort((a, b) => b.totalScore - a.totalScore)

    const start = Number.isInteger(searchPayload.start) ? Number(searchPayload.start) : 0
    const end = Number.isInteger(searchPayload.end) ? Number(searchPayload.end) : rankedWrappers.length
    const meta: SearchResultMeta = {
      aiCoverage: buildSearchAiCoverage(rankedWrappers),
      scoreDistribution: buildScoreDistribution(rankedWrappers),
    }

    if (start < 0 || end < 0 || end <= start) {
      return { matched: rankedWrappers, size: rankedWrappers.length, meta }
    }

    if (logSearchMain) {
      console.log(rankedWrappers.length, 'jobs matched the query. Returning ranked slice from', start, 'to', end)
      console.log('SearchPayload: ' + JSON.stringify(searchPayload))
    }

    const sliced = rankedWrappers.slice(start, end)
    // sliced.map((wrapper, index) => {
    //   const shouldLaunch = true
    //   wrapper.scores.audit = Math.min(auditJob(wrapper.job, logFlags.audit === true, shouldLaunch) / 100, 1.0)
    // })
    return { matched: sliced, size: rankedWrappers.length, meta }
  }
}

// Re-export interfaces for backwards compatibility
export type {
  ScoreWeights,
  SearchPayload,
  SearchLogFlags,
  JobScores,
  JobAiPayload,
  SearchAiCoverage,
  SearchScoreBucket,
  SearchResultMeta,
  RankedJobWrapper,
} from './SearchInterfaces.js'

export default SearchMain
