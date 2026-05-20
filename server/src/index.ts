import cors from 'cors'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

import type { ScrapedJob } from './scraping/ScrapedJob.js'
import { scrapeJobsMain } from './scraping/ScrapeJobMain.js'
import { searchLocationsOpenStreetMap, type LocationOption } from './searching/LocationSearch.js'
import SearchMain, { type SearchPayload, type RankedJobWrapper } from './searching/SearchMain.js'

// Global job list
let JOBS: ScrapedJob[] = []
const searchMain = new SearchMain()

;(async () => {
  try {
    JOBS = await scrapeJobsMain()
    console.log(`Loaded ${JOBS.length} jobs at startup.`)
  } catch (err) {
    console.error('Failed to scrape jobs on startup:', err)
  }
})()

const PORT = Number(process.env.PORT) || 4000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3010'

const app = express()

app.use(cors({ origin: CLIENT_ORIGIN }))

app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from Express + Socket.IO server!' })
})

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
  },
})

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`)

  socket.emit('server:hello', 'Hello from Socket.IO server!')

  socket.on('client:hello', (message: string) => {
    console.log(`Client says: ${message}`)
    socket.emit('server:hello', `Server received: ${message}`)
  })

  socket.on(
    'search',
    (
      payload: SearchPayload,
      callback?: (response: { results: RankedJobWrapper[]; total: number; error?: string }) => void,
    ) => {
      try {
        // console.log('payload', payload)
        ;(async () => {
          const results = await searchMain.search(JOBS, payload)
          const response = {
            results: results.matched,
            total: results.size,
          }
          callback?.(response)
          console.log(`Search completed with query: ${payload.query}, results found: ${results.size}`, payload)
          socket.emit('search:results', response)
        })()
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`Search failed: ${message}`)
        const errorResponse = {
          results: [],
          total: 0,
          error: 'Search failed',
        }
        callback?.(errorResponse)
        socket.emit('search:results', errorResponse)
      }
    },
  )

  socket.on(
    'locations:search',
    async (
      payload: { query?: string },
      callback?: (response: { options: LocationOption[]; error?: string }) => void,
    ) => {
      const query = (payload?.query || '').trim()

      if (query.length < 2) {
        callback?.({ options: [] })
        return
      }

      try {
        const options = await searchLocationsOpenStreetMap(query)
        callback?.({ options })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`Location search failed for "${query}": ${message}`)
        callback?.({ options: [], error: 'Failed to search locations' })
      }
    },
  )

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`)
  })

  
})

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
