import { calculateFreshnessScore } from './SearchFreshness.js';
import { calculateLocationScore } from './SearchDistance.js';
import { calculateImpactScore } from './SearchImpact.js';
import { auditJob } from './SearchAudit.js';
import { toSafeText, calculateResumeScore } from './SearchResumeMatch.js';
/**
 * Calculate individual score components for a job
 *
 * @param job - The job to score
 * @param resumeText - User's resume text
 * @param locationText - User's location text
 * @param userLat - User's latitude (or null if not available)
 * @param userLon - User's longitude (or null if not available)
 * @returns JobScores object with resume, impact, location, freshness, and audit scores
 */
export function calculateIndividualScores(job, resumeText, locationText, userLat, userLon, logFlags = {}) {
    // Resume score
    const resumeScore = calculateResumeScore(job, resumeText, logFlags.resume === true);
    // Location score (based on distance and remote status)
    const locationScore = calculateLocationScore(userLat, userLon, job, locationText, logFlags.location === true);
    // Impact score (keyword scan + source impact prior)
    const impactScore = calculateImpactScore(job, logFlags.impact === true);
    // Freshness score
    const freshnessScore = calculateFreshnessScore(job.posted, logFlags.fresh === true);
    // Audit score from background audit pipeline (normalized to 0-1)
    const shouldLaunch = false;
    const auditScore = Math.min(auditJob(job, logFlags.audit === true, shouldLaunch) / 100, 1.0);
    if (logFlags.audit === true || logFlags.searchMain === true) {
        console.log('Calculated scores for job:', {
            name: job.name,
            company: job.company_name,
            resumeScore,
            impactScore,
            locationScore,
            freshnessScore,
            auditScore,
        });
    }
    return {
        resume: resumeScore,
        impact: impactScore,
        location: locationScore,
        fresh: freshnessScore,
        audit: auditScore,
    };
}
/**
 * Check if a job matches all query terms
 *
 * Searches across job name, company, location, description, type, source, URL,
 * posting date, AI summary, red flags, and tags
 *
 * @param job - The job to check
 * @param queryTerms - Array of search terms (already lowercased)
 * @returns true if job matches all query terms
 */
export function jobMatchesQuery(job, queryTerms, shouldLog = false) {
    if (queryTerms.length === 0) {
        return false;
    }
    const haystackParts = [
        toSafeText(job.name),
        toSafeText(job.company_name),
        toSafeText(job.location),
        toSafeText(job.description),
        toSafeText(job.type),
        toSafeText(job.source),
        toSafeText(job.source_url),
        toSafeText(job.posted),
        toSafeText(job.ai_summary),
        toSafeText(job.ai_red_flag_summary),
        job.tags.map((tag) => toSafeText(tag)).join(' '),
    ];
    const haystack = haystackParts.join(' ');
    const matches = queryTerms.every((term) => haystack.includes(term));
    if (shouldLog) {
        console.log('Query match check:', {
            jobName: job.name,
            queryTerms,
            matches,
        });
    }
    return matches;
}
