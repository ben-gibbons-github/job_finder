import React, { useState } from 'react';
import JobTileDropdown from './JobTileDropdown';
import GenericPopover from './GenericPopover';

interface JobScores {
  resume: number;
  impact: number;
  location: number;
  fresh: number;
  audit: number;
  qualityOfLife: number;
}

interface RankedJobWrapper {
  job?: {
    name?: string;
    company_name?: string;
    location?: string;
    remote?: string;
    description?: string;
    type?: string;
    source_url?: string;
    ai_summary?: string;
  };
  scores?: JobScores;
  totalScore?: number;
}

interface ResumeCatalogEntry {
  displayName?: string;
  name?: string;
  id?: string;
}

interface AuditRequestKey {
  source_url?: string;
  name?: string;
  company_name?: string;
}

interface AuditResult {
  auditScore: number;
  auditText: string;
  error?: string;
}

interface ImpactResult {
  ai_impact_score: number;
  ai_impact_summary: string;
  error?: string;
}

interface QualityOfLifeResult {
  employeeQualityOfLifeScore: number;
  employeeQualityOfLifeSummary: string;
  error?: string;
}

interface JobTileProps {
  wrapper?: RankedJobWrapper;
  resumeId?: string;
  resumeText?: string;
  resumeDisplayName?: string;
  selectedResumeIds?: string[];
  resumeCatalogById?: Record<string, ResumeCatalogEntry>;
  onAuditRequest?: (key: AuditRequestKey, onResult: (result: AuditResult) => void) => void;
  auditResultOverride?: AuditResult;
  impactResultOverride?: ImpactResult;
  qualityOfLifeResultOverride?: QualityOfLifeResult;
  onHideJob?: (jobUrl?: string) => void;
  onHideCompany?: (companyName?: string) => void;
}

const formatScore = (score: number): string => {
  return (score * 100).toFixed(1);
};

type ScoreBand = 'blue' | 'green' | 'yellow' | 'red';

const getScoreBand = (score?: number): ScoreBand => {
  if (!Number.isFinite(score)) {
    return 'red';
  }
  if ((score as number) >= 0.85) {
    return 'blue';
  }
  if ((score as number) >= 0.65) {
    return 'green';
  }
  if ((score as number) >= 0.4) {
    return 'yellow';
  }
  return 'red';
};

const JobTile: React.FC<JobTileProps> = ({
  wrapper,
  resumeId,
  resumeText,
  resumeDisplayName,
  selectedResumeIds,
  resumeCatalogById,
  onAuditRequest,
  auditResultOverride,
  impactResultOverride,
  qualityOfLifeResultOverride,
  onHideJob,
  onHideCompany,
}) => {
  const job = wrapper?.job;
  const scores = wrapper?.scores;
  const totalScore = wrapper?.totalScore;

  const [auditLoading, setAuditLoading] = useState(false);
  const [auditScore, setAuditScore] = useState<number | null>(null);
  const [auditText, setAuditText] = useState<string | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [isStatsPopoverOpen, setIsStatsPopoverOpen] = useState(false);

  // auditResultOverride comes from the App-level job:audit:result listener;
  // local ack state takes precedence when this tile triggered the audit.
  const resolvedAuditScore = auditScore ?? (auditResultOverride?.auditScore ?? null);
  const resolvedAuditText = auditText ?? (auditResultOverride?.auditText ?? null);
  const resolvedAuditError = auditError ?? (auditResultOverride?.error ?? null);

  const handleRunAudit = () => {
    if (!onAuditRequest || auditLoading) return;
    setAuditLoading(true);
    setAuditError(null);
    onAuditRequest(
      { source_url: job?.source_url, name: job?.name, company_name: job?.company_name },
      (result) => {
        setAuditLoading(false);
        if (result.error) {
          setAuditError(result.error);
        } else {
          setAuditScore(result.auditScore);
          setAuditText(result.auditText);
        }
      },
    );
  };

  const displayedAuditScore = resolvedAuditScore !== null ? resolvedAuditScore / 100 : scores?.audit;
  const displayedImpactScore = impactResultOverride ? impactResultOverride.ai_impact_score / 100 : scores?.impact;
  const displayedQualityOfLifeScore = qualityOfLifeResultOverride
    ? qualityOfLifeResultOverride.employeeQualityOfLifeScore / 100
    : scores?.qualityOfLife;
  const resolvedImpactSummary = impactResultOverride?.ai_impact_summary?.trim() || '';
  const resolvedQualityOfLifeSummary = qualityOfLifeResultOverride?.employeeQualityOfLifeSummary?.trim() || '';
  const normalizedAuditText = String(resolvedAuditText ?? '').trim().toLowerCase();
  const normalizedImpactSummary = resolvedImpactSummary.trim().toLowerCase();
  const normalizedQualityOfLifeSummary = resolvedQualityOfLifeSummary.trim().toLowerCase();

  const auditFailed = Boolean(resolvedAuditError) || normalizedAuditText.includes('searchaudit failed');
  const impactFailed = Boolean(impactResultOverride?.error) || normalizedImpactSummary.includes('searchimpactai failed');
  const qualityOfLifeFailed = Boolean(qualityOfLifeResultOverride?.error) || normalizedQualityOfLifeSummary.includes('searchqualityoflife failed');

  const hasResolvedAudit = !auditFailed && (
    resolvedAuditScore !== null ||
    normalizedAuditText.length > 0
  );
  const hasResolvedImpact = !impactFailed && Boolean(impactResultOverride) && (
    normalizedImpactSummary.length > 0 || Number.isFinite(Number(impactResultOverride?.ai_impact_score))
  );
  const isAuditComplete = hasResolvedAudit && hasResolvedImpact;
  const auditNeedsRetry = (auditFailed || impactFailed) && !auditLoading;
  const auditButtonState = auditLoading
    ? 'running'
    : isAuditComplete
      ? 'complete'
      : auditNeedsRetry
        ? 'retry'
        : 'ready';

  const hasAiImpact = !impactFailed && Boolean(impactResultOverride && resolvedImpactSummary.length > 0);
  const hasAiQualityOfLife = !qualityOfLifeFailed && Boolean(qualityOfLifeResultOverride && resolvedQualityOfLifeSummary.length > 0);
  const hasAiAudit = !auditFailed && Boolean(resolvedAuditText && resolvedAuditText.trim().length > 0);
  const resumeBand = getScoreBand(scores?.resume);
  const impactBand = getScoreBand(displayedImpactScore);
  const qualityOfLifeBand = getScoreBand(displayedQualityOfLifeScore);
  const locationBand = getScoreBand(scores?.location);
  const freshBand = getScoreBand(scores?.fresh);
  const auditBand = getScoreBand(displayedAuditScore);

  const getFullAuditText = (): string => {
    if (!resolvedAuditText) {
      return 'No audit available yet.';
    }

    try {
      const parsed = JSON.parse(resolvedAuditText);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return resolvedAuditText;
    }
  };

  const openSourceUrl = () => {
    if (!job?.source_url) {
      return;
    }
    window.open(job.source_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="job-tile">
      <div className="job-tile-fixed-layout">
        <div className="job-tile-header">
          <h2 className="job-title">{job?.name || 'Job Title'}</h2>
          <JobTileDropdown
            job={job}
            resumeId={resumeId}
            resumeText={resumeText}
            resumeDisplayName={resumeDisplayName}
            selectedResumeIds={selectedResumeIds}
            resumeCatalogById={resumeCatalogById}
            onHideJob={onHideJob}
            onHideCompany={onHideCompany}
          />
        </div>

        <div className="job-meta">
          <p className="job-company"><strong>Company:</strong> {job?.company_name || 'Company Name'}</p>
          <p className="job-location"><strong>Location:</strong> {job?.location || 'Location'}</p>
          <p className="job-type"><strong>Type:</strong> {job?.type || 'Full-time'}</p>
          {job?.remote && <p className="job-remote"><strong>Remote:</strong> {job.remote}</p>}
        </div>

        <div className="job-text-block">
          <p className="job-description">{job?.description || 'Job description goes here. Click to learn more.'}</p>
          {job?.ai_summary && <p className="job-summary"><em>{job.ai_summary}</em></p>}
        </div>

        {scores && (
          <div className="job-scores">
            <div className="scores-header">
              <strong>Match Scores:</strong>
              {totalScore !== undefined && <span className="total-score">Total: {formatScore(totalScore)}%</span>}
            </div>

            <div className="score-bubbles-row">
              <div className={`score-bubble score-bubble--${resumeBand}`}>
                <span className="score-bubble-label">Resume</span>
                <span className="score-bubble-value">{formatScore(scores.resume)}%</span>
              </div>

              <div className={`score-bubble score-bubble--impact score-bubble--${impactBand}`}>
                <span className="score-bubble-label">
                  Impact
                  {(hasAiImpact || impactFailed) && (
                    <span className="score-ai-indicator" title="Impact score from AI impact analysis">
                      <span className={`score-ai-dot score-ai-dot--impact ${impactFailed ? 'score-ai-dot--failed' : 'score-ai-dot--ok'}`} />
                      <span className="score-ai-icon">{impactFailed ? '⚠' : '✨'}</span>
                    </span>
                  )}
                </span>
                <span className="score-bubble-value">{displayedImpactScore !== undefined ? formatScore(displayedImpactScore) + '%' : '—'}</span>
              </div>

              <div className={`score-bubble score-bubble--${qualityOfLifeBand}`}>
                <span className="score-bubble-label">
                  QoL
                  {(hasAiQualityOfLife || qualityOfLifeFailed) && (
                    <span className="score-ai-indicator" title="Quality-of-life score from AI quality-of-life analysis">
                      <span className={`score-ai-dot ${qualityOfLifeFailed ? 'score-ai-dot--failed' : 'score-ai-dot--ok'}`} />
                      <span className="score-ai-icon">{qualityOfLifeFailed ? '⚠' : '🧭'}</span>
                    </span>
                  )}
                </span>
                <span className="score-bubble-value">{displayedQualityOfLifeScore !== undefined ? formatScore(displayedQualityOfLifeScore) + '%' : '—'}</span>
              </div>

              <div className={`score-bubble score-bubble--${locationBand}`}>
                <span className="score-bubble-label">Location</span>
                <span className="score-bubble-value">{formatScore(scores.location)}%</span>
              </div>

              <div className={`score-bubble score-bubble--${freshBand}`}>
                <span className="score-bubble-label">Fresh</span>
                <span className="score-bubble-value">{formatScore(scores.fresh)}%</span>
              </div>

              <div className={`score-bubble score-bubble--audit score-bubble--${auditBand}`}>
                <span className="score-bubble-label">
                  Audit
                  {(hasAiAudit || auditFailed) && (
                    <span className="score-ai-indicator" title="Audit score from AI audit analysis">
                      <span className={`score-ai-dot score-ai-dot--audit ${auditFailed ? 'score-ai-dot--failed' : 'score-ai-dot--ok'}`} />
                      <span className="score-ai-icon">{auditFailed ? '⚠' : '🤖'}</span>
                    </span>
                  )}
                </span>
                <span className="score-bubble-value">
                  {auditLoading ? '⏳ Running…' : displayedAuditScore !== undefined ? formatScore(displayedAuditScore) + '%' : '—'}
                </span>
              </div>
            </div>

            <div className="job-tile-actions-row">
              <button
                className={`audit-run-btn audit-run-btn--${auditButtonState}`}
                onClick={handleRunAudit}
                disabled={!onAuditRequest || auditLoading || isAuditComplete}
                title="Run AI audit for this job"
              >
                {auditLoading ? 'Running audit…' : isAuditComplete ? 'Audit complete' : auditNeedsRetry ? 'Retry audit' : 'Run audit'}
              </button>

              <button
                type="button"
                className="job-link-btn job-link-btn--view"
                onClick={openSourceUrl}
                disabled={!job?.source_url}
                title={job?.source_url ? 'Open source job post' : 'No job URL available'}
              >
                View job
              </button>

              <button
                type="button"
                className="job-link-btn job-link-btn--stats"
                onClick={() => setIsStatsPopoverOpen(true)}
              >
                View stats
              </button>
            </div>

            {resolvedImpactSummary && (
              <div className="audit-summary impact-summary">
                <p className="audit-summary-text">{resolvedImpactSummary}</p>
              </div>
            )}

            {resolvedAuditError && <div className="audit-error">{resolvedAuditError}</div>}
          </div>
        )}

        {!scores && (
          <div className="job-tile-actions-row">
            <button
              className={`audit-run-btn audit-run-btn--${auditButtonState}`}
              onClick={handleRunAudit}
              disabled={!onAuditRequest || auditLoading || isAuditComplete}
              title="Run AI audit for this job"
            >
              {auditLoading ? 'Running audit…' : isAuditComplete ? 'Audit complete' : auditNeedsRetry ? 'Retry audit' : 'Run audit'}
            </button>

            <button
              type="button"
              className="job-link-btn job-link-btn--view"
              onClick={openSourceUrl}
              disabled={!job?.source_url}
              title={job?.source_url ? 'Open source job post' : 'No job URL available'}
            >
              View job
            </button>

            <button
              type="button"
              className="job-link-btn job-link-btn--stats"
              onClick={() => setIsStatsPopoverOpen(true)}
            >
              View stats
            </button>
          </div>
        )}
      </div>

      <GenericPopover
        isOpen={isStatsPopoverOpen}
        onClose={() => setIsStatsPopoverOpen(false)}
        title={`${job?.name || 'Job'} stats`}
        className="job-stats-popover"
      >
        <div className="job-stats-content">
          <section className="job-stats-section">
            <h3>Score breakdown</h3>
            <div className="job-stats-score-grid">
              <div><strong>Total</strong>: {totalScore !== undefined ? `${formatScore(totalScore)}%` : '—'}</div>
              <div><strong>Resume</strong>: {scores ? `${formatScore(scores.resume)}%` : '—'}</div>
              <div><strong>Impact</strong>: {displayedImpactScore !== undefined ? `${formatScore(displayedImpactScore)}%` : '—'}</div>
              <div><strong>QoL</strong>: {displayedQualityOfLifeScore !== undefined ? `${formatScore(displayedQualityOfLifeScore)}%` : '—'}</div>
              <div><strong>Location</strong>: {scores ? `${formatScore(scores.location)}%` : '—'}</div>
              <div><strong>Fresh</strong>: {scores ? `${formatScore(scores.fresh)}%` : '—'}</div>
              <div><strong>Audit</strong>: {displayedAuditScore !== undefined ? `${formatScore(displayedAuditScore)}%` : '—'}</div>
            </div>
          </section>

          <section className="job-stats-section">
            <h3>Full job text</h3>
            <pre className="audit-full-text-pre">{job?.description || 'No job description available.'}</pre>
            {job?.ai_summary && <pre className="audit-full-text-pre">{job.ai_summary}</pre>}
          </section>

          <section className="job-stats-section">
            <h3>Impact report</h3>
            <pre className="audit-full-text-pre">
              {resolvedImpactSummary || 'No impact report available yet.'}
            </pre>
          </section>

          <section className="job-stats-section">
            <h3>Quality of life report</h3>
            <pre className="audit-full-text-pre">
              {resolvedQualityOfLifeSummary || 'No quality-of-life report available yet.'}
            </pre>
          </section>

          <section className="job-stats-section">
            <h3>AI audit report</h3>
            <pre className="audit-full-text-pre">{getFullAuditText()}</pre>
          </section>
        </div>
      </GenericPopover>
    </div>
  );
};

export default JobTile;
