import { askGeminiWithSearch } from '../llms/AskLLM.js';
import searchImpactAICache from './SearchImpactAICache.js';
const inFlightImpacts = new Set();
const impactCompletionCallbacks = new Map();
function fireImpactCallbacks(impactKey, result) {
    const cbs = impactCompletionCallbacks.get(impactKey);
    if (cbs) {
        impactCompletionCallbacks.delete(impactKey);
        for (const cb of cbs)
            cb(result);
    }
}
const ENABLE_TEMP_LLM_CONCURRENCY_CAP = true;
const TEMP_MAX_SIMULTANEOUS_LLM_IMPACT_CALLS = 3;
const QUOTA_WARN_LOG_INTERVAL_MS = 15_000;
let activeLlmImpactCalls = 0;
const pendingLlmImpactQueue = [];
let lastQuotaWarnAt = 0;
function isQuotaError(error) {
    const text = String(error).toLowerCase();
    return (text.includes('resource_exhausted') ||
        text.includes('quota exceeded') ||
        text.includes('request failed (429)'));
}
function clampToPercent(value) {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.max(0, Math.min(100, Math.round(value)));
}
function parseScore(value) {
    if (typeof value === 'number') {
        return clampToPercent(value);
    }
    if (typeof value === 'string') {
        const parsed = Number(value.replace(/%/g, '').trim());
        return clampToPercent(parsed);
    }
    return clampToPercent(Number.NaN);
}
function parseImpactObject(input) {
    if (!input || typeof input !== 'object') {
        return null;
    }
    const parsed = input;
    const impactScore = parseScore(parsed.impactScore ?? parsed.impact_score ?? parsed.score);
    const impactSummaryRaw = typeof parsed.impactSummary === 'string'
        ? parsed.impactSummary
        : typeof parsed.impact_summary === 'string'
            ? parsed.impact_summary
            : typeof parsed.summary === 'string'
                ? parsed.summary
                : '';
    const impactSummary = impactSummaryRaw.trim();
    if (impactSummary.length === 0 && impactScore === 0) {
        return null;
    }
    return { impactScore, impactSummary };
}
function extractBalancedJsonObjects(text) {
    const blocks = [];
    let depth = 0;
    let start = -1;
    let inString = false;
    let escaped = false;
    for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];
        if (inString) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (ch === '\\') {
                escaped = true;
                continue;
            }
            if (ch === '"') {
                inString = false;
            }
            continue;
        }
        if (ch === '"') {
            inString = true;
            continue;
        }
        if (ch === '{') {
            if (depth === 0) {
                start = i;
            }
            depth += 1;
            continue;
        }
        if (ch === '}') {
            if (depth > 0) {
                depth -= 1;
                if (depth === 0 && start !== -1) {
                    blocks.push(text.slice(start, i + 1));
                    start = -1;
                }
            }
        }
    }
    return blocks;
}
function parseFromJsonCandidates(responseText) {
    const candidates = [];
    const fencedMatches = responseText.match(/```(?:json)?\s*([\s\S]*?)```/gi);
    if (fencedMatches) {
        for (const match of fencedMatches) {
            const cleaned = match.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
            if (cleaned.length > 0) {
                candidates.push(cleaned);
            }
        }
    }
    const balancedObjects = extractBalancedJsonObjects(responseText);
    candidates.push(...balancedObjects);
    for (const candidate of candidates) {
        try {
            const parsed = JSON.parse(candidate);
            const normalized = parseImpactObject(parsed);
            if (normalized) {
                return normalized;
            }
        }
        catch {
            // Try next candidate.
        }
    }
    return null;
}
function parseFromRegexFallback(responseText) {
    const scoreMatch = responseText.match(/"?impactScore"?\s*[:=]\s*"?([0-9]+(?:\.[0-9]+)?)%?"?/i)
        ?? responseText.match(/impact\s*score\s*[:=]\s*([0-9]+(?:\.[0-9]+)?)%?/i);
    const summaryMatch = responseText.match(/"?impactSummary"?\s*[:=]\s*"([\s\S]*?)"\s*(?:,|}|$)/i)
        ?? responseText.match(/"?summary"?\s*[:=]\s*"([\s\S]*?)"\s*(?:,|}|$)/i);
    const impactScore = scoreMatch ? parseScore(scoreMatch[1]) : 0;
    const impactSummary = summaryMatch ? summaryMatch[1].trim() : '';
    if (impactSummary.length === 0 && impactScore === 0) {
        return null;
    }
    return { impactScore, impactSummary };
}
function parseFromPlainTextFallback(responseText) {
    const cleaned = responseText
        .replace(/```(?:json)?/gi, '')
        .replace(/```/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (!cleaned) {
        return null;
    }
    return {
        impactScore: 0,
        impactSummary: cleaned.slice(0, 1200),
    };
}
function parseImpactRatings(responseText) {
    const jsonCandidate = parseFromJsonCandidates(responseText);
    if (jsonCandidate) {
        return jsonCandidate;
    }
    const regexCandidate = parseFromRegexFallback(responseText);
    if (regexCandidate) {
        return regexCandidate;
    }
    return parseFromPlainTextFallback(responseText);
}
function getJobImpactKey(job) {
    const sourceUrl = job.source_url?.trim();
    if (sourceUrl) {
        return sourceUrl;
    }
    return `${job.name}::${job.company_name}::${job.location}`;
}
function isFailedImpactText(impactSummary) {
    if (typeof impactSummary !== 'string') {
        return false;
    }
    const normalized = impactSummary.trim().toLowerCase();
    return normalized === 'searchimpactai failed' || normalized.includes('searchimpactai failed');
}
function clearFailedImpact(job) {
    searchImpactAICache.deleteCachedImpact(job);
    job.ai_impact_score = 0;
    job.ai_impact_summary = '';
}
function ensureImpactFields(job) {
    if (typeof job.ai_impact_summary !== 'string') {
        job.ai_impact_summary = '';
    }
    if (typeof job.ai_impact_score !== 'number' || !Number.isFinite(job.ai_impact_score)) {
        job.ai_impact_score = 0;
    }
}
function runWithLlmConcurrencyCap(runImpact) {
    if (!ENABLE_TEMP_LLM_CONCURRENCY_CAP) {
        runImpact();
        return;
    }
    const launch = () => {
        activeLlmImpactCalls += 1;
        runImpact();
    };
    if (activeLlmImpactCalls < TEMP_MAX_SIMULTANEOUS_LLM_IMPACT_CALLS) {
        launch();
        return;
    }
    pendingLlmImpactQueue.push(launch);
}
function releaseLlmConcurrencySlot() {
    if (!ENABLE_TEMP_LLM_CONCURRENCY_CAP) {
        return;
    }
    activeLlmImpactCalls = Math.max(0, activeLlmImpactCalls - 1);
    const next = pendingLlmImpactQueue.shift();
    if (next) {
        next();
    }
}
export function impactJobAI(job, shouldLog = false, shouldLaunch = false) {
    ensureImpactFields(job);
    const impactKey = getJobImpactKey(job);
    if (job.ai_impact_summary.trim().length > 0) {
        if (isFailedImpactText(job.ai_impact_summary)) {
            clearFailedImpact(job);
        }
        else {
            return clampToPercent(job.ai_impact_score);
        }
    }
    const cached = searchImpactAICache.getCachedImpact(job);
    if (cached) {
        if (isFailedImpactText(cached.impactSummary)) {
            if (shouldLog) {
                console.log(`[SearchImpactAI] Cached failure found for ${job.name}; deleting and retrying.`);
            }
            clearFailedImpact(job);
        }
        else {
            job.ai_impact_score = cached.impactScore;
            job.ai_impact_summary = cached.impactSummary;
            return clampToPercent(job.ai_impact_score);
        }
    }
    if (inFlightImpacts.has(impactKey)) {
        return clampToPercent(job.ai_impact_score);
    }
    if (!shouldLaunch) {
        return clampToPercent(job.ai_impact_score);
    }
    const question = [
        'Perform due diligence on this company and estimate REAL-WORLD POSITIVE IMPACT.',
        'Focus only on measurable net positive outcomes, not marketing claims.',
        '',
        'Positive impact categories:',
        '- communitySupport',
        '- socialJustice',
        '- education',
        '- mentalHealth',
        '- medicalLifeSaving',
        '- greenTechCarbonReduction',
        '- disabilityAccessibility',
        '- childProtection',
        '',
        'Also explicitly check for negatives:',
        '- money-first priorities',
        '- environmental harm',
        '- defense/surveillance/military use',
        '- harm to users or vulnerable groups',
        '- any harms to children',
        '',
        'Return ONLY valid JSON with this exact shape:',
        '{"impactSummary":"string","impactScore":number}',
        '',
        'Scoring guidance:',
        '- impactScore from 0 to 100.',
        '- 0 means no meaningful positive impact or net harmful.',
        '- 100 means exceptional and credible positive impact.',
        '- Penalize greenwashing and impact-washing.',
        '',
        'Role details:',
        `Company: ${job.company_name}`,
        `Title: ${job.name}`,
        `Location: ${job.location}`,
        `URL: ${job.source_url} (source: ${job.source})`,
        '',
        'Job description:',
        `${job.description}`,
    ].join('\n');
    console.log('Initiating AI impact analysis for job:', job.name, 'with question:', question);
    inFlightImpacts.add(impactKey);
    runWithLlmConcurrencyCap(() => {
        void (async () => {
            try {
                const [result] = await askGeminiWithSearch([question], {
                    systemInstruction: 'You are a strict impact due-diligence analyst. Use web evidence and output compact JSON only.',
                });
                const parsed = parseImpactRatings(result.answer);
                if (!parsed) {
                    throw new Error(`SearchImpactAI failed to parse response for job: ${job.name}`);
                }
                console.log("result.answer", result.answer);
                console.log('AI impact analysis completed for job:', job.name, 'result:', parsed);
                job.ai_impact_score = parsed.impactScore;
                job.ai_impact_summary = parsed.impactSummary;
                searchImpactAICache.setCachedImpact(job, {
                    impactScore: parsed.impactScore,
                    impactSummary: parsed.impactSummary,
                });
                fireImpactCallbacks(impactKey, {
                    impactScore: parsed.impactScore,
                    impactSummary: parsed.impactSummary,
                });
            }
            catch (error) {
                fireImpactCallbacks(impactKey, {
                    impactScore: clampToPercent(job.ai_impact_score),
                    impactSummary: job.ai_impact_summary,
                    error: String(error),
                });
                if (shouldLog) {
                    if (isQuotaError(error)) {
                        const now = Date.now();
                        if (now - lastQuotaWarnAt >= QUOTA_WARN_LOG_INTERVAL_MS) {
                            lastQuotaWarnAt = now;
                            console.warn('[SearchImpactAI] Gemini rate/quota limit reached. Impact calls will retry more slowly.');
                        }
                    }
                    else {
                        console.error(`[SearchImpactAI] Impact call failed for ${job.name}:`, error);
                    }
                }
            }
            finally {
                inFlightImpacts.delete(impactKey);
                releaseLlmConcurrencySlot();
            }
        })();
    });
    return clampToPercent(job.ai_impact_score);
}
export function impactJobAIAsync(job, shouldLog = false) {
    ensureImpactFields(job);
    const impactKey = getJobImpactKey(job);
    if (job.ai_impact_summary.trim().length > 0) {
        if (isFailedImpactText(job.ai_impact_summary)) {
            clearFailedImpact(job);
        }
        else {
            return Promise.resolve({
                impactScore: clampToPercent(job.ai_impact_score),
                impactSummary: job.ai_impact_summary,
            });
        }
    }
    const cached = searchImpactAICache.getCachedImpact(job);
    if (cached) {
        if (isFailedImpactText(cached.impactSummary)) {
            clearFailedImpact(job);
        }
        else {
            job.ai_impact_score = cached.impactScore;
            job.ai_impact_summary = cached.impactSummary;
            return Promise.resolve({
                impactScore: cached.impactScore,
                impactSummary: cached.impactSummary,
            });
        }
    }
    return new Promise((resolve) => {
        const existing = impactCompletionCallbacks.get(impactKey) ?? [];
        existing.push(resolve);
        impactCompletionCallbacks.set(impactKey, existing);
        impactJobAI(job, shouldLog, true);
    });
}
