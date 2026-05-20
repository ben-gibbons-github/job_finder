import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import './App.css'
import JobTile from './JobTile'
import Pagination from './Pagination'
import SearchTextEntry from './SearchTextEntry'
import LocationDropdown from './LocationDropdown'
import ResumeUpload from './ResumeUpload'
import ScoreWeightSliders, { type ScoreWeights } from './ScoreWeightSliders'

const socket = io('http://localhost:4000')

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
  const [searchEnd, setSearchEnd] = useState(20)
  const [scoreWeights, setScoreWeights] = useState<ScoreWeights>({
    resume: 1,
    impact: 1,
    location: 1,
    fresh: 1,
    audit: 1,
  })
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

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('server:hello', onHello)
    socket.on('search:results', onSearchResults)

    if (socket.connected) {
      setConnected(true)
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('server:hello', onHello)
      socket.off('search:results', onSearchResults)
    }
  }, [])

  useEffect(() => {
    socket.emit('search', {
      query,
      resumeText,
      locationText,
      start: searchStart,
      end: searchEnd,
      scoreWeights,
    })
  }, [query, resumeText, locationText, searchStart, searchEnd, scoreWeights])

  const onResumeUpload = (file: File) => {
    setUploadedResumeName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => setResumeText((e.target?.result as string) ?? '')
    reader.readAsText(file)
  }

  return (
    <main className="app">
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
      <LocationDropdown
        onSelectLocation={(location) => setLocationText(location.displayLabel)}
        placeholder="Search location (city, state, country)..."
      />
      <ResumeUpload onUpload={onResumeUpload} />

      <div className="job-list">
        {jobs.map((wrapper) => (
          <JobTile
            key={wrapper.job?.name + wrapper.job?.location + wrapper.job?.company_name + wrapper.job?.source_url + resumeText + JSON.stringify(scoreWeights)}
            wrapper={wrapper}
            resumeText={resumeText}
            resumeDisplayName={uploadedResumeName}
            selectedResumeIds={selectedResumeIds}
            resumeCatalogById={resumeCatalogById}
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
