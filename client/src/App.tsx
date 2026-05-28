import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import './App.css'
import JobTile from './JobTile'
import Pagination from './Pagination'
import SearchTextEntry from './SearchTextEntry'
import LocationDropdown from './LocationDropdown'
import { extractTextFromFile } from './ResumeReader'
import UploadResume from './UploadResume'
import { type ScoreWeights } from './ScoreWeightSliders'
import BulkAuditButton from './AuditAllButton'
import GlobalAIButton from './GlobalAIButton'
import { type JobDistributionMeta } from './JobDistributionGraph'
import SearchLoadingBar from './SearchLoadingBar'
import InsightsHoverPopovers from './InsightsHoverPopovers'

type SearchCommand = 'AIAuditAllJobsInThisSearch'

interface ClientSearchPayload {
  query: string
  resumeText: string
  locationText: string
  start: number
  end: number
  scoreWeights: ScoreWeights
  hiddenJobUrls: string[]
  hiddenCompanies: string[]
  command?: SearchCommand
}

const socket = io('http://localhost:4000')
const HIDDEN_JOBS_CACHE_KEY = 'hiddenJobsByUrl'
const HIDDEN_COMPANIES_CACHE_KEY = 'hiddenCompaniesByName'

function normalizeCompanyName(companyName?: string): string {
  return String(companyName ?? '').trim().toLowerCase()
}

function readStringArrayCache(cacheKey: string): string[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(cacheKey)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed
      .map((entry) => String(entry ?? '').trim())
      .filter((entry) => entry.length > 0)
  } catch {
    return []
  }
}

function writeStringArrayCache(cacheKey: string, entries: string[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(cacheKey, JSON.stringify(entries))
}

function App() {
  const [resumeText, setResumeText] = useState('')
  const [uploadedResumeName, setUploadedResumeName] = useState('')
  const [locationText, setLocationText] = useState('')
  const [query, setQuery] = useState('')
  const [jobs, setJobs] = useState<any[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [searchMeta, setSearchMeta] = useState<JobDistributionMeta | null>(null)
  const [isSearching, setIsSearching] = useState(true)
  const [openAiCorpusSignal, setOpenAiCorpusSignal] = useState(0)
  const [searchStart, setSearchStart] = useState(0)
  const [searchEnd, setSearchEnd] = useState(100)
  const [scoreWeights, setScoreWeights] = useState<ScoreWeights>({
    resume: 1,
    impact: 1,
    location: 1,
    fresh: 1,
    audit: 1,
    qualityOfLife: 1,
  })
  const [auditResults, setAuditResults] = useState<Record<string, { auditScore: number; auditText: string; error?: string }>>({})
  const [impactResults, setImpactResults] = useState<Record<string, { ai_impact_score: number; ai_impact_summary: string; error?: string }>>({})
  const [qualityOfLifeResults, setQualityOfLifeResults] = useState<Record<string, { employeeQualityOfLifeScore: number; employeeQualityOfLifeSummary: string; error?: string }>>({})
  const [hiddenJobUrls, setHiddenJobUrls] = useState<string[]>(() => readStringArrayCache(HIDDEN_JOBS_CACHE_KEY))
  const [hiddenCompanies, setHiddenCompanies] = useState<string[]>(() => readStringArrayCache(HIDDEN_COMPANIES_CACHE_KEY))
  const selectedResumeIds: string[] = []
  const resumeCatalogById = {}

  const itemsPerPage = Math.max(1, searchEnd - searchStart)
  const currentPage = Math.floor(searchStart / itemsPerPage) + 1

  const handlePageChange = (page: number) => {
    const safePage = Math.max(1, page)
    const nextStart = (safePage - 1) * itemsPerPage
    setSearchStart(nextStart)
    setSearchEnd(nextStart + itemsPerPage)
  }

  const handleTextSearch = (nextQuery: string) => {
    setQuery(nextQuery)
  }

  useEffect(() => {
    const onSearchResults = (response: { results: any[]; total: number; meta?: JobDistributionMeta; error?: string }) => {
      setIsSearching(false)
      if (response?.results) {
        console.log('Received search results:', response.results)
        setJobs(response.results)
        setTotalItems(typeof response.total === 'number' ? response.total : response.results.length)
        setSearchMeta(response.meta ?? null)
      }
    }

    const onAuditResult = (payload: { source_url?: string; auditScore: number; auditText: string; error?: string }) => {
      if (payload?.source_url) {
        setAuditResults((prev) => ({ ...prev, [payload.source_url!]: payload }))
      }
    }

    const onImpactResult = (payload: { source_url?: string; ai_impact_score?: number; ai_impact_summary?: string; impactScore?: number; impactSummary?: string; error?: string }) => {
      if (payload?.source_url) {
        setImpactResults((prev) => ({
          ...prev,
          [payload.source_url!]: {
            ai_impact_score: Number(payload.ai_impact_score ?? payload.impactScore ?? 0),
            ai_impact_summary: String(payload.ai_impact_summary ?? payload.impactSummary ?? ''),
            error: payload.error,
          },
        }))
      }
    }

    const onQualityOfLifeResult = (payload: {
      source_url?: string
      employeeQualityOfLifeScore?: number
      employeeQualityOfLifeSummary?: string
      error?: string
    }) => {
      if (payload?.source_url) {
        setQualityOfLifeResults((prev) => ({
          ...prev,
          [payload.source_url!]: {
            employeeQualityOfLifeScore: Number(payload.employeeQualityOfLifeScore ?? 0),
            employeeQualityOfLifeSummary: String(payload.employeeQualityOfLifeSummary ?? ''),
            error: payload.error,
          },
        }))
      }
    }

    socket.on('search:results', onSearchResults)
    socket.on('job:audit:result', onAuditResult)
    socket.on('job:impact:result', onImpactResult)
    socket.on('job:qualityOfLife:result', onQualityOfLifeResult)

    return () => {
      socket.off('search:results', onSearchResults)
      socket.off('job:audit:result', onAuditResult)
      socket.off('job:impact:result', onImpactResult)
      socket.off('job:qualityOfLife:result', onQualityOfLifeResult)
    }
  }, [])

  useEffect(() => {
    writeStringArrayCache(HIDDEN_JOBS_CACHE_KEY, hiddenJobUrls)
  }, [hiddenJobUrls])

  useEffect(() => {
    writeStringArrayCache(HIDDEN_COMPANIES_CACHE_KEY, hiddenCompanies)
  }, [hiddenCompanies])

  useEffect(() => {
    const payload: ClientSearchPayload = {
      query,
      resumeText,
      locationText,
      start: searchStart,
      end: searchEnd,
      scoreWeights,
      hiddenJobUrls,
      hiddenCompanies,
    }

    setIsSearching(true)
    socket.emit('search', payload)
  }, [query, resumeText, locationText, searchStart, searchEnd, scoreWeights, hiddenJobUrls, hiddenCompanies])

  const handleRunAuditAllInSearch = () => {
    const payload: ClientSearchPayload = {
      query,
      resumeText,
      locationText,
      start: searchStart,
      end: searchEnd,
      scoreWeights,
      hiddenJobUrls,
      hiddenCompanies,
      command: 'AIAuditAllJobsInThisSearch',
    }

    socket.emit('search', payload)
  }

  const onResumeUpload = async (file: File) => {
    setUploadedResumeName(file.name)

    try {
      const extractedText = await extractTextFromFile(file)
      setResumeText(extractedText)
    } catch (error) {
      console.error('Failed to parse resume file:', error)
      setResumeText('')
    }
  }

  const handleAuditRequest = (
    key: { source_url?: string; name?: string; company_name?: string },
    onResult: (result: { auditScore: number; auditText: string; error?: string }) => void,
  ) => {
    socket.emit('job:audit', key, onResult)
  }

  const handleHideJob = (jobUrl?: string) => {
    const normalized = String(jobUrl ?? '').trim()
    if (!normalized) {
      return
    }

    setHiddenJobUrls((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]))
  }

  const handleHideCompany = (companyName?: string) => {
    const normalized = normalizeCompanyName(companyName)
    if (!normalized) {
      return
    }

    setHiddenCompanies((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]))
  }

  const visibleJobs = jobs.filter((wrapper) => {
    const jobUrl = String(wrapper?.job?.source_url ?? '').trim()
    const companyName = normalizeCompanyName(wrapper?.job?.company_name)
    if (jobUrl && hiddenJobUrls.includes(jobUrl)) {
      return false
    }
    if (companyName && hiddenCompanies.includes(companyName)) {
      return false
    }
    return true
  })

  const hasVisibleResults = visibleJobs.length > 0

  return (
    <main className="app">
      <h1>Super Job Search</h1>
      <InsightsHoverPopovers
        searchMeta={searchMeta}
        scoreWeights={scoreWeights}
        onScoreWeightsChange={setScoreWeights}
        onOpenAiCorpus={() => setOpenAiCorpusSignal((value) => value + 1)}
        onRunAuditAllInSearch={handleRunAuditAllInSearch}
        isEnabled={hasVisibleResults}
      />

      <GlobalAIButton
        resumeText={resumeText}
        jobs={jobs}
        auditResults={auditResults}
        impactResults={impactResults}
        showButton={false}
        openSignal={openAiCorpusSignal}
      />
      <BulkAuditButton showButton={false} />

      <section
        className="compact-search-bar compact-search-bar--expanded"
        aria-label="Primary search controls"
      >
        <div className="compact-search-bar__text">
          <SearchTextEntry onSearch={handleTextSearch} resultCount={totalItems} />
        </div>

        <div className={`compact-search-bar__location ${hasVisibleResults ? '' : 'compact-search-bar__location--disabled'}`.trim()}>
          <LocationDropdown
            onSelectLocation={(location) => setLocationText(location.displayLabel)}
            placeholder={hasVisibleResults ? 'Location' : 'Location (disabled until results load)'}
          />
        </div>

        <UploadResume
          uploadedResumeName={uploadedResumeName}
          resumeText={resumeText}
          onResumeUpload={onResumeUpload}
          isEnabled={hasVisibleResults}
        />
      </section>

      {!isSearching && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}

      <SearchLoadingBar isVisible={isSearching} />

      {!isSearching && (
        <>
          <div className="job-list">
            {visibleJobs.map((wrapper) => (
              <JobTile
                key={wrapper.job?.name + wrapper.job?.location + wrapper.job?.company_name + wrapper.job?.source_url + resumeText + JSON.stringify(scoreWeights)}
                wrapper={wrapper}
                resumeText={resumeText}
                resumeDisplayName={uploadedResumeName}
                selectedResumeIds={selectedResumeIds}
                resumeCatalogById={resumeCatalogById}
                onAuditRequest={handleAuditRequest}
                auditResultOverride={wrapper.job?.source_url ? auditResults[wrapper.job.source_url] : undefined}
                impactResultOverride={wrapper.job?.source_url ? impactResults[wrapper.job.source_url] : undefined}
                qualityOfLifeResultOverride={wrapper.job?.source_url ? qualityOfLifeResults[wrapper.job.source_url] : undefined}
                onHideJob={handleHideJob}
                onHideCompany={handleHideCompany}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}

    </main>
  )
}

export default App
