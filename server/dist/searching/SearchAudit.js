import { askGeminiWithSearch } from '../llms/AskLLM.js';
const inFlightAudits = new Set();
// Temporary throttle flag: toggle this off to remove the concurrency cap.
const ENABLE_TEMP_LLM_CONCURRENCY_CAP = true;
const TEMP_MAX_SIMULTANEOUS_LLM_AUDITS = 3;
const QUOTA_WARN_LOG_INTERVAL_MS = 15_000;
let activeLlmAuditCalls = 0;
const pendingLlmAuditQueue = [];
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
function extractJsonObject(text) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
        return null;
    }
    return text.slice(start, end + 1);
}
function parseAuditRatings(responseText) {
    const jsonSlice = extractJsonObject(responseText);
    if (!jsonSlice) {
        return null;
    }
    try {
        const parsed = JSON.parse(jsonSlice);
        const jobQuality = clampToPercent(Number(parsed.jobQuality));
        const redFlags = clampToPercent(Number(parsed.redFlags));
        const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
        return { jobQuality, redFlags, summary };
    }
    catch {
        return null;
    }
}
function getJobAuditKey(job) {
    const sourceUrl = job.source_url?.trim();
    if (sourceUrl) {
        return sourceUrl;
    }
    return `${job.name}::${job.company_name}::${job.location}`;
}
function runWithLlmConcurrencyCap(runAudit) {
    if (!ENABLE_TEMP_LLM_CONCURRENCY_CAP) {
        runAudit();
        return;
    }
    const launch = () => {
        activeLlmAuditCalls += 1;
        runAudit();
    };
    if (activeLlmAuditCalls < TEMP_MAX_SIMULTANEOUS_LLM_AUDITS) {
        launch();
        return;
    }
    pendingLlmAuditQueue.push(launch);
}
function releaseLlmConcurrencySlot() {
    if (!ENABLE_TEMP_LLM_CONCURRENCY_CAP) {
        return;
    }
    activeLlmAuditCalls = Math.max(0, activeLlmAuditCalls - 1);
    const next = pendingLlmAuditQueue.shift();
    if (next) {
        next();
    }
}
export function auditJob(job, shouldLog = false, shouldLaunch = false, onComplete) {
    const auditKey = getJobAuditKey(job);
    shouldLog = true;
    if (job.audit_number > 0 && job.audit_text.trim().length > 0) {
        if (shouldLog) {
            console.log(`[SearchAudit] Existing audit data found for ${job.name}; skipping LLM audit.`);
        }
        onComplete?.(clampToPercent(job.audit_number));
        return clampToPercent(job.audit_number);
    }
    if (inFlightAudits.has(auditKey)) {
        if (shouldLog) {
            console.log(`[SearchAudit] Audit already in flight for ${job.name}; skipping duplicate launch.`);
        }
        return clampToPercent(job.audit_number);
    }
    if (!shouldLaunch)
        return clampToPercent(job.audit_number);
    const question = [
        'Do quick background research on this job posting and return ONLY valid JSON.',
        'Rate both values from 0 to 100:',
        '- jobQuality: higher is better quality',
        '- redFlags: higher means more red flags',
        'JSON shape:',
        '{"jobQuality": number, "redFlags": number, "summary": "string"}',
        `jobName: ${job.name}`,
        `company: ${job.company_name}`,
        `location: ${job.location}`,
        `type: ${job.type}`,
        `source: ${job.source}`,
        `url: ${job.source_url}`,
        `description: ${job.description}`,
        `aiSummary: ${job.ai_summary}`,
        `aiRedFlagSummary: ${job.ai_red_flag_summary}`,
        `tags: ${job.tags.join(', ')}`
    ].join('\n');
    if (shouldLog) {
        // console.log(`[SearchAudit] Running Gemini background audit for ${job.name}`)
    }
    inFlightAudits.add(auditKey);
    runWithLlmConcurrencyCap(() => {
        void (async () => {
            try {
                console.log(`[SearchAudit] Asking Gemini with search for ${job.name}`);
                const [result] = await askGeminiWithSearch([question], {
                    systemInstruction: 'You are a strict job-posting auditor. Keep output compact and produce JSON only.'
                });
                const parsed = parseAuditRatings(result.answer);
                if (!parsed) {
                    throw new Error(`SearchAudit failed to parse Gemini response for job: ${job.name}`);
                }
                const finalAuditScore = clampToPercent((parsed.jobQuality + (100 - parsed.redFlags)) / 2);
                job.audit_number = finalAuditScore;
                job.audit_text = JSON.stringify({
                    jobQuality: parsed.jobQuality,
                    redFlags: parsed.redFlags,
                    finalAuditScore,
                    summary: parsed.summary
                });
                if (shouldLog) {
                    console.log(`[SearchAudit] Audit complete for ${job.name}`, {
                        jobQuality: parsed.jobQuality,
                        redFlags: parsed.redFlags,
                        finalAuditScore
                    });
                }
                onComplete?.(finalAuditScore);
            }
            catch (error) {
                if (shouldLog) {
                    if (isQuotaError(error)) {
                        const now = Date.now();
                        if (now - lastQuotaWarnAt >= QUOTA_WARN_LOG_INTERVAL_MS) {
                            lastQuotaWarnAt = now;
                            console.warn('[SearchAudit] Gemini rate/quota limit reached. Audits will retry more slowly.');
                        }
                    }
                    else {
                        console.error(`[SearchAudit] Audit failed for ${job.name}:`, error);
                    }
                }
            }
            finally {
                inFlightAudits.delete(auditKey);
                releaseLlmConcurrencySlot();
            }
        })();
    });
    // Background audit is running; return current score for now.
    return clampToPercent(job.audit_number);
}
