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
  qualityOfLife: number
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

export type SearchCommand = 'AIAuditAllJobsInThisSearch'

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
  hiddenJobUrls?: string[]
  hiddenCompanies?: string[]
  command?: SearchCommand
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
  qualityOfLife: number
}

/**
 * AI data attached per ranked result so client can render loaded-state indicators
 */
export interface JobAiPayload {
  audit: {
    hasData: boolean
    score: number
    redFlagScore: number
    summary: string
    redFlagSummary: string
  }
  impact: {
    hasData: boolean
    score: number
    summary: string
  }
  qualityOfLife: {
    hasData: boolean
    score: number
    summary: string
  }
}

export interface SearchAiCoverage {
  auditPercent: number
  impactPercent: number
  qualityOfLifePercent: number
  totalMatched: number
}

export interface SearchScoreBucket {
  start: number
  end: number
  count: number
}

export interface SearchResultMeta {
  aiCoverage: SearchAiCoverage
  scoreDistribution: SearchScoreBucket[]
}

/**
 * Wrapper combining a job with its scores and total score
 */
export interface RankedJobWrapper {
  job: ScrapedJob
  scores: JobScores
  totalScore: number
  aiPayload?: JobAiPayload
}
