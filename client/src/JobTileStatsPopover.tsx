import React from 'react';
import GenericPopover from './GenericPopover';

interface JobTileStatsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  jobName?: string;
  jobSourceUrl?: string;
  companyName?: string;
  location?: string;
  jobType?: string;
  remote?: string;
  jobDescription?: string;
  jobSummary?: string;
  totalScore?: number;
  resumeScore?: number;
  impactScore?: number;
  qualityOfLifeScore?: number;
  locationScore?: number;
  freshScore?: number;
  auditScore?: number;
  impactSummary?: string;
  qualityOfLifeSummary?: string;
  fullAuditText: string;
}

const formatPercent = (score?: number): string => {
  if (!Number.isFinite(score)) {
    return '—';
  }
  return `${((score as number) * 100).toFixed(1)}%`;
};

const withFallback = (value?: string): string => {
  const normalized = String(value ?? '').trim();
  return normalized || '—';
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

const inlineTokenRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)|\*\*([^*]+)\*\*/g;

const splitUrlAndTrailingPunctuation = (rawUrl: string): { url: string; trailing: string } => {
  const match = rawUrl.match(/[),.;!?]+$/);
  if (!match) {
    return { url: rawUrl, trailing: '' };
  }
  return {
    url: rawUrl.slice(0, -match[0].length),
    trailing: match[0],
  };
};

const renderInlineRichText = (line: string, keyPrefix: string): React.ReactNode[] => {
  const output: React.ReactNode[] = [];
  let cursor = 0;
  let tokenIndex = 0;

  inlineTokenRegex.lastIndex = 0;
  let match = inlineTokenRegex.exec(line);
  while (match) {
    const start = match.index;
    const end = start + match[0].length;

    if (start > cursor) {
      output.push(line.slice(cursor, start));
    }

    const markdownLabel = match[1];
    const markdownUrl = match[2];
    const rawUrl = match[3];
    const boldText = match[4];

    if (markdownLabel && markdownUrl) {
      output.push(
        <a
          key={`${keyPrefix}-link-${tokenIndex}`}
          href={markdownUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="job-stats-link"
        >
          {markdownLabel}
        </a>,
      );
    } else if (rawUrl) {
      const { url, trailing } = splitUrlAndTrailingPunctuation(rawUrl);
      output.push(
        <a
          key={`${keyPrefix}-url-${tokenIndex}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="job-stats-link"
        >
          {url}
        </a>,
      );
      if (trailing) {
        output.push(trailing);
      }
    } else if (boldText) {
      output.push(
        <strong key={`${keyPrefix}-strong-${tokenIndex}`} className="job-stats-strong">
          {boldText}
        </strong>,
      );
    } else {
      output.push(match[0]);
    }

    cursor = end;
    tokenIndex += 1;
    match = inlineTokenRegex.exec(line);
  }

  if (cursor < line.length) {
    output.push(line.slice(cursor));
  }

  return output;
};

const RichTextBlock: React.FC<{ text?: string; fallback: string }> = ({ text, fallback }) => {
  const content = (text || '').trim();
  const safeContent = content || fallback;
  const paragraphs = safeContent.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="job-stats-text-block">
      {paragraphs.map((paragraph, paragraphIndex) => {
        const lines = paragraph.split('\n');
        return (
          <p key={`p-${paragraphIndex}`} className="job-stats-paragraph">
            {lines.map((line, lineIndex) => (
              <React.Fragment key={`l-${paragraphIndex}-${lineIndex}`}>
                {lineIndex > 0 ? <br /> : null}
                {renderInlineRichText(line, `p${paragraphIndex}-l${lineIndex}`)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};

interface SectionScoreBadgeProps {
  label: string;
  score?: number;
  extraClassName?: string;
}

const SectionScoreBadge: React.FC<SectionScoreBadgeProps> = ({ label, score, extraClassName }) => {
  return (
    <span className={`job-stats-inline-score job-stats-inline-score--${getScoreBand(score)} ${extraClassName || ''}`.trim()}>
      <span>{label}</span>
      <strong>{formatPercent(score)}</strong>
    </span>
  );
};

const JobTileStatsPopover: React.FC<JobTileStatsPopoverProps> = ({
  isOpen,
  onClose,
  jobName,
  jobSourceUrl,
  companyName,
  location,
  jobType,
  remote,
  jobDescription,
  jobSummary,
  totalScore,
  resumeScore,
  impactScore,
  qualityOfLifeScore,
  locationScore,
  freshScore,
  auditScore,
  impactSummary,
  qualityOfLifeSummary,
  fullAuditText,
}) => {
  const openJobListing = () => {
    if (!jobSourceUrl) {
      return;
    }
    window.open(jobSourceUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <GenericPopover
      isOpen={isOpen}
      onClose={onClose}
      title={`${jobName || 'Job'} stats`}
      className="job-stats-popover"
      headerActions={(
        <button
          type="button"
          className="job-stats-open-listing-btn"
          onClick={openJobListing}
          disabled={!jobSourceUrl}
          title={jobSourceUrl ? 'Open source job post' : 'No job URL available'}
        >
          View job listing
        </button>
      )}
    >
      <div className="job-stats-content">
        <section className="job-stats-section">
          <h3>Job details</h3>
          <div className="job-stats-meta-grid">
            <div className="job-stats-meta-item">
              <span className="job-stats-meta-label">Company</span>
              <strong>{withFallback(companyName)}</strong>
            </div>
            <div className="job-stats-meta-item">
              <span className="job-stats-meta-label">Location</span>
              <strong>{withFallback(location)}</strong>
            </div>
            <div className="job-stats-meta-item">
              <span className="job-stats-meta-label">Type</span>
              <strong>{withFallback(jobType)}</strong>
            </div>
            <div className="job-stats-meta-item">
              <span className="job-stats-meta-label">Remote</span>
              <strong>{withFallback(remote)}</strong>
            </div>
            <div className="job-stats-meta-item job-stats-meta-item--wide">
              <span className="job-stats-meta-label">Source URL</span>
              {jobSourceUrl ? (
                <a
                  href={jobSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="job-stats-link"
                >
                  {jobSourceUrl}
                </a>
              ) : (
                <strong>—</strong>
              )}
            </div>
          </div>
        </section>

        <section className="job-stats-section">
          <h3>Job description</h3>
          <RichTextBlock text={jobDescription} fallback="No job description available." />
          {jobSummary && <RichTextBlock text={jobSummary} fallback="" />}
        </section>

        <section className="job-stats-section">
          <h3>Score breakdown</h3>
          <div className="job-stats-score-bubbles">
            <div className={`job-stats-score-bubble job-stats-score-bubble--${getScoreBand(totalScore)}`}><span>Total</span><strong>{formatPercent(totalScore)}</strong></div>
            <div className={`job-stats-score-bubble job-stats-score-bubble--${getScoreBand(resumeScore)}`}><span>Resume</span><strong>{formatPercent(resumeScore)}</strong></div>
            <div className={`job-stats-score-bubble job-stats-score-bubble--impact job-stats-score-bubble--${getScoreBand(impactScore)}`}><span>Impact</span><strong>{formatPercent(impactScore)}</strong></div>
            <div className={`job-stats-score-bubble job-stats-score-bubble--${getScoreBand(qualityOfLifeScore)}`}><span>QoL</span><strong>{formatPercent(qualityOfLifeScore)}</strong></div>
            <div className={`job-stats-score-bubble job-stats-score-bubble--${getScoreBand(locationScore)}`}><span>Location</span><strong>{formatPercent(locationScore)}</strong></div>
            <div className={`job-stats-score-bubble job-stats-score-bubble--${getScoreBand(freshScore)}`}><span>Fresh</span><strong>{formatPercent(freshScore)}</strong></div>
            <div className={`job-stats-score-bubble job-stats-score-bubble--audit job-stats-score-bubble--${getScoreBand(auditScore)}`}><span>Audit</span><strong>{formatPercent(auditScore)}</strong></div>
          </div>
        </section>

        <section className="job-stats-section">
          <div className="job-stats-section-heading">
            <h3>Impact report</h3>
            <SectionScoreBadge label="Impact" score={impactScore} extraClassName="job-stats-inline-score--impact" />
          </div>
          <RichTextBlock text={impactSummary} fallback="No impact report available yet." />
        </section>

        <section className="job-stats-section">
          <div className="job-stats-section-heading">
            <h3>Quality of life report</h3>
            <SectionScoreBadge label="QoL" score={qualityOfLifeScore} />
          </div>
          <RichTextBlock text={qualityOfLifeSummary} fallback="No quality-of-life report available yet." />
        </section>

        <section className="job-stats-section">
          <div className="job-stats-section-heading">
            <h3>AI audit report</h3>
            <SectionScoreBadge label="Audit" score={auditScore} extraClassName="job-stats-inline-score--audit" />
          </div>
          <RichTextBlock text={fullAuditText} fallback="No audit report available yet." />
        </section>
      </div>
    </GenericPopover>
  );
};

export default JobTileStatsPopover;
