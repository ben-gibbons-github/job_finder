import React from 'react';
import JobTileDropdown from './JobTileDropdown';

interface JobScores {
  resume: number;
  impact: number;
  location: number;
  fresh: number;
  audit: number;
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

interface JobTileProps {
  wrapper?: RankedJobWrapper;
  resumeId?: string;
  resumeText?: string;
  resumeDisplayName?: string;
  selectedResumeIds?: string[];
  resumeCatalogById?: Record<string, ResumeCatalogEntry>;
}

const formatScore = (score: number): string => {
  return (score * 100).toFixed(1);
};

const JobTile: React.FC<JobTileProps> = ({
  wrapper,
  resumeId,
  resumeText,
  resumeDisplayName,
  selectedResumeIds,
  resumeCatalogById,
}) => {
  const job = wrapper?.job;
  const scores = wrapper?.scores;
  const totalScore = wrapper?.totalScore;

  return (
    <div className="job-tile">
      <div className="job-tile-header">
        <h2 className="job-title">{job?.name || 'Job Title'}</h2>
        <JobTileDropdown
          job={job}
          resumeId={resumeId}
          resumeText={resumeText}
          resumeDisplayName={resumeDisplayName}
          selectedResumeIds={selectedResumeIds}
          resumeCatalogById={resumeCatalogById}
        />
      </div>
      <div className="job-meta">
        <p className="job-company"><strong>Company:</strong> {job?.company_name || 'Company Name'}</p>
        <p className="job-location"><strong>Location:</strong> {job?.location || 'Location'}</p>
        <p className="job-type"><strong>Type:</strong> {job?.type || 'Full-time'}</p>
        {job?.remote && <p className="job-remote"><strong>Remote:</strong> {job.remote}</p>}
      </div>
      <p className="job-description">{job?.description || 'Job description goes here. Click to learn more.'}</p>
      {job?.ai_summary && <p className="job-summary"><em>{job.ai_summary}</em></p>}
      
      {scores && (
        <div className="job-scores">
          <div className="scores-header">
            <strong>Match Scores:</strong> {totalScore !== undefined && <span className="total-score">Total: {formatScore(totalScore)}%</span>}
          </div>
          <div className="scores-grid">
            <div className="score-item">
              <span className="score-label">Resume:</span>
              <span className="score-value">{formatScore(scores.resume)}%</span>
            </div>
            <div className="score-item">
              <span className="score-label">Impact:</span>
              <span className="score-value">{formatScore(scores.impact)}%</span>
            </div>
            <div className="score-item">
              <span className="score-label">Location:</span>
              <span className="score-value">{formatScore(scores.location)}%</span>
            </div>
            <div className="score-item">
              <span className="score-label">Fresh:</span>
              <span className="score-value">{formatScore(scores.fresh)}%</span>
            </div>
            <div className="score-item">
              <span className="score-label">Audit:</span>
              <span className="score-value">{formatScore(scores.audit)}%</span>
            </div>
          </div>
        </div>
      )}

      {job?.source_url && <a href={job.source_url} target="_blank" rel="noopener noreferrer" className="job-link">View Job</a>}
    </div>
  );
};

export default JobTile;
