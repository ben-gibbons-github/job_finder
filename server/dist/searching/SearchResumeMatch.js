/**
 * Resume matching and text similarity functionality
 * Handles tokenization, normalization, and resume score calculation
 */
/**
 * Safely converts any value to lowercase text
 * Handles null, undefined, and non-string types
 *
 * @param value - Any value to convert
 * @returns Lowercased string, or empty string if value is null/undefined
 */
export function toSafeText(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value).toLowerCase();
}
/**
 * Tokenizes text into meaningful tokens
 * Converts to lowercase, removes special characters, and filters short tokens
 *
 * @param text - Text to tokenize
 * @returns Array of tokens with length >= 2
 */
export function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2);
}
/**
 * Calculates overlap score between source tokens and target text
 * Uses a weighted combination of coverage and hit saturation metrics
 *
 * Scoring logic:
 * - Coverage: percentage of source tokens found in target
 * - Hit saturation: balance between hits and noise (hits + 5)
 * - Final score: 35% coverage + 65% hit saturation (emphasizes quality over quantity)
 *
 * @param sourceTokens - Tokens from the search/resume query
 * @param targetText - Text to search within (job description, etc)
 * @returns Score between 0 and 1
 */
export function overlapScore(sourceTokens, targetText) {
    if (sourceTokens.length === 0) {
        return 0;
    }
    const uniqueSourceTokens = Array.from(new Set(sourceTokens));
    const targetTokens = new Set(tokenize(targetText));
    if (targetTokens.size === 0) {
        return 0;
    }
    let hits = 0;
    for (const token of uniqueSourceTokens) {
        if (targetTokens.has(token)) {
            hits += 1;
        }
    }
    const coverage = hits / uniqueSourceTokens.length;
    const hitSaturation = hits / (hits + 5);
    return Math.min(1, coverage * 0.35 + hitSaturation * 0.65) * 2;
}
/**
 * Calculates the resume score for a job based on resume content matching
 *
 * Combines resume text and creates a searchable target from job details,
 * then calculates overlap score
 *
 * @param job - The job to score
 * @param resumeText - User's resume text
 * @returns Resume match score between 0 and 1
 */
export function calculateResumeScore(job, resumeText, shouldLog = false) {
    const resumeTokens = tokenize(resumeText);
    const resumeTarget = [
        toSafeText(job.name),
        toSafeText(job.company_name),
        toSafeText(job.description),
        toSafeText(job.type),
        toSafeText(job.scrapedEmployer?.name || ''),
        toSafeText(job.scrapedEmployer?.ai_impact_summary || ''),
        toSafeText(job.scrapedEmployer?.ai_summary || ''),
        toSafeText(job.scrapedEmployer?.ai_red_flag_summary || ''),
        toSafeText(job.scrapedEmployer?.employeeQualityOfLifeSummary || ''),
        job.tags.map((tag) => toSafeText(tag)).join(' '),
    ].join(' ');
    const score = overlapScore(resumeTokens, resumeTarget);
    if (shouldLog) {
        console.log('Resume score calculated:', {
            jobName: job.name,
            resumeTokenCount: resumeTokens.length,
            score,
        });
    }
    return score;
}
