import type { ScrapedJob } from '../scraping/ScrapedJob.js'

/**
 * Weights for scoring different aspects of job matches
 */
export interface ScoreWeights {
  resume: number
  impact: number
  location: number
  fresh: number
  audit: number
}

/**
 * Per-submodule logging controls for search pipeline
 */
export interface SearchLogFlags {
  searchMain?: boolean
  query?: boolean
  resume?: boolean
  impact?: boolean
  location?: boolean
  fresh?: boolean
  audit?: boolean
}

/**
 * Search parameters and configuration
 */
export interface SearchPayload {
  query?: string
  resumeText?: string
  locationText?: string
  start?: number
  end?: number
  location?: string
  resume?: object
  scoreWeights?: ScoreWeights
  searchLogFlags?: SearchLogFlags
  [key: string]: any
}

/**
 * Individual scores for different ranking criteria
 */
export interface JobScores {
  resume: number
  impact: number
  location: number
  fresh: number
  audit: number
}

/**
 * Wrapper combining a job with its scores and total score
 */
export interface RankedJobWrapper {
  job: ScrapedJob
  scores: JobScores
  totalScore: number
}
