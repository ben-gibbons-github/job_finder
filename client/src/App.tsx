import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import './App.css'
import JobTile from './JobTile'
import Pagination from './Pagination'
import SearchTextEntry from './SearchTextEntry'
import LocationDropdown from './LocationDropdown'
import ResumeUpload from './ResumeUpload'
import ScoreWeightSliders, { type ScoreWeights } from './ScoreWeightSliders'
import BulkAuditButton from './AuditAllButton'
import GlobalAIButton from './GlobalAIButton'

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
  const [connected, setConnected] = useState(false)
  const [serverMessage, setServerMessage] = useState('Waiting for server message...')
  const [resumeText, setResumeText] = useState('')
  const [uploadedResumeName, setUploadedResumeName] = useState('')
  const [locationText, setLocationText] = useState('')
  const [query, setQuery] = useState('')
  const [jobs, setJobs] = useState<any[]>([])
  const [totalItems, setTotalItems] = useState(0)
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

  useEffect(() => {
    const onConnect = () => {
      setConnected(true)
    }

    const onDisconnect = () => {
      setConnected(false)
    }

    const onHello = (message: string) => {
      setServerMessage(message)
    }

    const onSearchResults = (response: { results: any[]; total: number; error?: string }) => {
      if (response?.results) {
        console.log('Received search results:', response.results)
        setJobs(response.results)
        setTotalItems(typeof response.total === 'number' ? response.total : response.results.length)
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

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('server:hello', onHello)
    socket.on('search:results', onSearchResults)
    socket.on('job:audit:result', onAuditResult)
    socket.on('job:impact:result', onImpactResult)
    socket.on('job:qualityOfLife:result', onQualityOfLifeResult)

    if (socket.connected) {
      setConnected(true)
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('server:hello', onHello)
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
    socket.emit('search', {
      query,
      resumeText,
      locationText,
      start: searchStart,
      end: searchEnd,
      scoreWeights,
      hiddenJobUrls,
      hiddenCompanies,
    })
  }, [query, resumeText, locationText, searchStart, searchEnd, scoreWeights, hiddenJobUrls, hiddenCompanies])

  const onResumeUpload = (file: File) => {
    setUploadedResumeName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => setResumeText((e.target?.result as string) ?? '')
    reader.readAsText(file)
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

  return (
    <main className="app">
      <GlobalAIButton
        resumeText={resumeText}
        jobs={jobs}
        auditResults={auditResults}
        impactResults={impactResults}
      />
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
      <h1>Super Job Search</h1>
      <p>
        Server status:{' '}
        <strong className={connected ? 'connected' : 'disconnected'}>
          {connected ? 'Connected' : 'Disconnected'}
        </strong>
      </p>
      <p>Message from server: {serverMessage}</p>

      <div className="search-controls-top">
        <SearchTextEntry
          onSearch={setQuery}
          onChange={setQuery}
        />
        <ScoreWeightSliders
          weights={scoreWeights}
          onChange={setScoreWeights}
        />
      </div>
      <BulkAuditButton />
      <LocationDropdown
        onSelectLocation={(location) => setLocationText(location.displayLabel)}
        placeholder="Search location (city, state, country)..."
      />
      <ResumeUpload onUpload={onResumeUpload} />

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
    </main>
  )
}

export default App
