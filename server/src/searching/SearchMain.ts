

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


class SearchMain {
  async search(jobs: ScrapedJob[], searchPayload: SearchPayload): Promise<{ matched: RankedJobWrapper[]; size: number }> {
    const logFlags: SearchLogFlags = searchPayload.searchLogFlags ?? {}
    const logSearchMain = logFlags.searchMain === true

    const rawQueryValue = searchPayload.query
    const rawQuery = typeof rawQueryValue === 'string' ? rawQueryValue : ''
    const queryTerms = rawQuery
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((term) => term.trim())
      .filter((term) => term.length > 0)

    if (logSearchMain) {
      console.log('SearchMain.search called with query:', rawQuery, 'parsed terms:', queryTerms, 'locationText:', searchPayload.locationText, 'resumeText length:', typeof searchPayload.resumeText === 'string' ? searchPayload.resumeText.length : 'N/A')
    }

    const matched = jobs.filter((job) => jobMatchesQuery(job, queryTerms, logFlags.query === true))

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
          (scores.audit ?? 0) * (searchPayload.scoreWeights?.audit ?? 1);
          
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
    sliced.map((wrapper, index) => {
      const shouldLaunch = true
      wrapper.scores.audit = Math.min(auditJob(wrapper.job, logFlags.audit === true, shouldLaunch) / 100, 1.0)
    })
    return { matched: sliced, size: rankedWrappers.length }
  }
}

// Re-export interfaces for backwards compatibility
export type { ScoreWeights, SearchPayload, SearchLogFlags, JobScores, RankedJobWrapper } from './SearchInterfaces.js'

export default SearchMain
