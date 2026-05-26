

import type { ScrapedJob } from '../scraping/ScrapedJob.js'
import type {
  ScoreWeights,
  SearchPayload,
  SearchLogFlags,
  JobScores,
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

class SearchMain {
  async search(jobs: ScrapedJob[], searchPayload: SearchPayload): Promise<{ matched: RankedJobWrapper[]; size: number }> {
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

    const matched = visibleJobs.filter((job) => jobMatchesQuery(job, queryTerms, logFlags.query === true))

    const resumeText = typeof searchPayload.resumeText === 'string' ? searchPayload.resumeText : ''
    const locationText = typeof searchPayload.locationText === 'string' ? searchPayload.locationText : ''

    // Geocode user location
    const userLocCoords = await geocodeUserLocation(locationText, logFlags.location === true)
    const userLat = userLocCoords?.lat ?? null
    const userLon = userLocCoords?.lon ?? null

    if (logSearchMain) {
      console.log('User location geocoded to:', userLocCoords, 'for location text:', locationText)
    }
    // return { matched: [], size: matched.length }

    // Geocode all job locations
    const jobsWithCoords = await geocodeJobLocations(matched, logFlags.location === true)

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
        }
      })
      .sort((a, b) => b.totalScore - a.totalScore)

    const start = Number.isInteger(searchPayload.start) ? Number(searchPayload.start) : 0
    const end = Number.isInteger(searchPayload.end) ? Number(searchPayload.end) : rankedWrappers.length

    if (start < 0 || end < 0 || end <= start) {
      return { matched: rankedWrappers, size: rankedWrappers.length }
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
    return { matched: sliced, size: rankedWrappers.length }
  }
}

// Re-export interfaces for backwards compatibility
export type { ScoreWeights, SearchPayload, SearchLogFlags, JobScores, RankedJobWrapper } from './SearchInterfaces.js'

export default SearchMain
