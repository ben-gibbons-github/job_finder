import type { Socket } from 'socket.io'

export type RateLimitEventName =
  | 'client:hello'
  | 'search'
  | 'search:auditAll'
  | 'search:suggestions'
  | 'locations:search'
  | 'job:audit'

interface LeakyBucketConfig {
  capacity: number
  leakPerSecond: number
}

interface LeakyBucketState {
  level: number
  lastUpdatedAtMs: number
}

const SOCKET_RATE_LIMITS: Record<RateLimitEventName, LeakyBucketConfig> = {
  'client:hello': {
    capacity: Number(process.env.SOCKET_RATE_LIMIT_HELLO_CAPACITY ?? 10),
    leakPerSecond: Number(process.env.SOCKET_RATE_LIMIT_HELLO_LEAK_PER_SECOND ?? 2),
  },
  search: {
    capacity: Number(process.env.SOCKET_RATE_LIMIT_SEARCH_CAPACITY ?? 20),
    leakPerSecond: Number(process.env.SOCKET_RATE_LIMIT_SEARCH_LEAK_PER_SECOND ?? 1.5),
  },
  'search:auditAll': {
    capacity: Number(process.env.SOCKET_RATE_LIMIT_AUDIT_ALL_CAPACITY ?? 2),
    leakPerSecond: Number(process.env.SOCKET_RATE_LIMIT_AUDIT_ALL_LEAK_PER_SECOND ?? 0.03),
  },
  'search:suggestions': {
    capacity: Number(process.env.SOCKET_RATE_LIMIT_SUGGESTIONS_CAPACITY ?? 30),
    leakPerSecond: Number(process.env.SOCKET_RATE_LIMIT_SUGGESTIONS_LEAK_PER_SECOND ?? 4),
  },
  'locations:search': {
    capacity: Number(process.env.SOCKET_RATE_LIMIT_LOCATION_CAPACITY ?? 25),
    leakPerSecond: Number(process.env.SOCKET_RATE_LIMIT_LOCATION_LEAK_PER_SECOND ?? 3),
  },
  'job:audit': {
    capacity: Number(process.env.SOCKET_RATE_LIMIT_JOB_AUDIT_CAPACITY ?? 8),
    leakPerSecond: Number(process.env.SOCKET_RATE_LIMIT_JOB_AUDIT_LEAK_PER_SECOND ?? 0.4),
  },
}

const socketBucketStore = new Map<string, Map<RateLimitEventName, LeakyBucketState>>()

function clampConfig(config: LeakyBucketConfig): LeakyBucketConfig {
  return {
    capacity: Number.isFinite(config.capacity) && config.capacity > 0 ? config.capacity : 1,
    leakPerSecond: Number.isFinite(config.leakPerSecond) && config.leakPerSecond > 0 ? config.leakPerSecond : 0.1,
  }
}

function getSocketBuckets(socketId: string): Map<RateLimitEventName, LeakyBucketState> {
  const existing = socketBucketStore.get(socketId)
  if (existing) {
    return existing
  }

  const created = new Map<RateLimitEventName, LeakyBucketState>()
  socketBucketStore.set(socketId, created)
  return created
}

export function consumeLeakyBucket(socketId: string, eventName: RateLimitEventName): boolean {
  const nowMs = Date.now()
  const config = clampConfig(SOCKET_RATE_LIMITS[eventName])
  const socketBuckets = getSocketBuckets(socketId)
  const current = socketBuckets.get(eventName) ?? { level: 0, lastUpdatedAtMs: nowMs }
  const elapsedSeconds = Math.max(0, (nowMs - current.lastUpdatedAtMs) / 1000)
  const leakedLevel = Math.max(0, current.level - elapsedSeconds * config.leakPerSecond)

  if (leakedLevel + 1 > config.capacity) {
    socketBuckets.set(eventName, { level: leakedLevel, lastUpdatedAtMs: nowMs })
    return false
  }

  socketBuckets.set(eventName, { level: leakedLevel + 1, lastUpdatedAtMs: nowMs })
  return true
}

export function emitRateLimitError(socket: Socket, eventName: RateLimitEventName): void {
  socket.emit('error:rate_limited', {
    event: eventName,
    error: 'Rate limit exceeded. Please retry shortly.',
  })
}

export function callbackRateLimitError<T extends { error?: string }>(
  callback: ((response: T) => void) | undefined,
  response: T,
): void {
  callback?.(response)
}

export function clearSocketRateLimitState(socketId: string): void {
  socketBucketStore.delete(socketId)
}
