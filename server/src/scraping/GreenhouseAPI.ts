import type { ScrapedJob } from './ScrapedJob.js';
import { fetchJson, normalizeJobsWithCoordinates, parseCsvEnv, type NormalizedPortalJob } from './PortalIngestionUtils.js';
import { fetchPortalFallbackJobs } from './TerraBoardFallback.js';

const DEFAULT_GREENHOUSE_BOARDS = ['stripe'];
const GREENHOUSE_PER_PAGE = 100;
const MAX_GREENHOUSE_PAGES = 100;

interface GreenhouseJob {
  title?: string;
  absolute_url?: string;
  updated_at?: string;
  location?: { name?: string };
 content?: string;
  metadata?: Array<{ name?: string; value?: string }>;
}

interface GreenhouseBoardResponse {
  jobs?: GreenhouseJob[];
}

function parseGreenhouseJob(board: string, job: GreenhouseJob): NormalizedPortalJob {
  const metadata = Array.isArray(job.metadata) ? job.metadata : [];
  const team = metadata.find((m) => (m?.name || '').toLowerCase().includes('team'))?.value;

  return {
    title: job.title || 'Unknown Role',
    company: board,
    location: job.location?.name || 'Remote',
    remote: 'Unknown',
    type: 'Full-time',
    sourceUrl: job.absolute_url || `https://boards.greenhouse.io/${board}`,
    posted: job.updated_at,
    description: job.content || '',
    tags: team ? [team] : [],
  };
}

export async function fetchAllGreenhouseJobs(): Promise<ScrapedJob[]> {
  const envBoards = parseCsvEnv(process.env.GREENHOUSE_BOARDS);
  const boards = envBoards.length > 0 ? envBoards : DEFAULT_GREENHOUSE_BOARDS;

  const normalized: NormalizedPortalJob[] = [];

  for (const board of boards) {
    try {
      for (let page = 1; page <= MAX_GREENHOUSE_PAGES; page += 1) {
        const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs?content=true&page=${page}&per_page=${GREENHOUSE_PER_PAGE}`;
        const payload = (await fetchJson(url)) as GreenhouseBoardResponse;
        const jobs = Array.isArray(payload.jobs) ? payload.jobs : [];
        if (jobs.length === 0) {
          break;
        }

        normalized.push(...jobs.map((job) => parseGreenhouseJob(board, job)));

        if (jobs.length < GREENHOUSE_PER_PAGE) {
          break;
        }
      }
    } catch (error) {
      console.warn(`[GreenhouseAPI] Failed board ${board}:`, String(error));
    }
  }

  const direct = await normalizeJobsWithCoordinates('Greenhouse', normalized);
  if (direct.length > 0) {
    return direct;
  }

  return fetchPortalFallbackJobs('Greenhouse', (url) =>
    /greenhouse\.io|boards-api\.greenhouse\.io/i.test(url),
  );
}
