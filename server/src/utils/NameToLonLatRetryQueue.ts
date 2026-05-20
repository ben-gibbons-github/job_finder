import { cacheLocation, hasCachedLocation, initializeCache } from './NameToLonLatCache.js';
import { geocodingStrategies } from './NameToLonLatStrategies.js';

interface RetryItem {
  originalName: string;
  normalizedName: string;
  attempts: number;
  nextAttemptAt: number;
}

const retryQueue: RetryItem[] = [];
const queuedNames = new Set<string>();

const RETRY_WORK_INTERVAL_MS = 10_000;
const BASE_RETRY_DELAY_MS = 90_000;
const MAX_RETRY_DELAY_MS = 30 * 60_000;

let workerStarted = false;
let workerIsBusy = false;

function normalizePlaceName(placeName: string): string {
  return placeName.trim().toLowerCase();
}

function computeRetryDelayMs(attempts: number): number {
  const exponential = BASE_RETRY_DELAY_MS * 2 ** Math.max(0, attempts - 1);
  return Math.min(exponential, MAX_RETRY_DELAY_MS);
}

function scheduleForRetry(item: RetryItem): void {
  if (!queuedNames.has(item.normalizedName)) {
    retryQueue.push(item);
    queuedNames.add(item.normalizedName);
  }
}

async function processRetryItem(item: RetryItem): Promise<void> {
  await initializeCache();

  if (hasCachedLocation(item.normalizedName)) {
    return;
  }

  for (const strategy of geocodingStrategies) {
    try {
      const latLon = await strategy(item.originalName);
      cacheLocation(item.normalizedName, latLon);
      return;
    } catch {
      // Try next strategy.
    }
  }

  const nextAttempts = item.attempts + 1;
  const retryDelayMs = computeRetryDelayMs(nextAttempts);
  scheduleForRetry({
    ...item,
    attempts: nextAttempts,
    nextAttemptAt: Date.now() + retryDelayMs,
  });
}

async function processOneDueRetryItem(): Promise<void> {
  if (workerIsBusy) {
    return;
  }

  const now = Date.now();
  const dueIndex = retryQueue.findIndex((item) => item.nextAttemptAt <= now);
  if (dueIndex === -1) {
    return;
  }

  const [item] = retryQueue.splice(dueIndex, 1);
  queuedNames.delete(item.normalizedName);

  workerIsBusy = true;
  try {
    await processRetryItem(item);
  } finally {
    workerIsBusy = false;
  }
}

export function startNameToLonLatRetryWorker(): void {
  if (workerStarted) {
    return;
  }

  workerStarted = true;
  const timer = setInterval(() => {
    void processOneDueRetryItem();
  }, RETRY_WORK_INTERVAL_MS);

  timer.unref();
}

export function enqueueNameToLonLatRetry(placeName: string): void {
  const normalizedName = normalizePlaceName(placeName);
  if (!normalizedName || queuedNames.has(normalizedName) || hasCachedLocation(normalizedName)) {
    return;
  }

  startNameToLonLatRetryWorker();

  const firstDelayMs = computeRetryDelayMs(1);
  scheduleForRetry({
    originalName: placeName,
    normalizedName,
    attempts: 1,
    nextAttemptAt: Date.now() + firstDelayMs,
  });
}
