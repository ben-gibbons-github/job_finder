import React, { useEffect, useRef, useState } from 'react';

interface Job {
  name?: string;
  company_name?: string;
  location?: string;
  remote?: string;
  description?: string;
  type?: string;
  source_url?: string;
  ai_summary?: string;
}

interface ResumeCatalogEntry {
  displayName?: string;
  name?: string;
  id?: string;
}

interface JobTileDropdownProps {
  job?: Job;
  resumeId?: string;
  resumeText?: string;
  resumeDisplayName?: string;
  selectedResumeIds?: string[];
  resumeCatalogById?: Record<string, ResumeCatalogEntry>;
}

function getSourceLabel(sourceUrl?: string): string {
  if (!sourceUrl) return 'Unknown source';
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, '');
  } catch {
    return sourceUrl;
  }
}

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    ok ? resolve() : reject(new Error('execCommand copy failed'));
  });
}

const JobTileDropdown: React.FC<JobTileDropdownProps> = ({
  job,
  resumeId,
  resumeText: uploadedResumeText,
  resumeDisplayName: uploadedResumeName,
  selectedResumeIds,
  resumeCatalogById,
}) => {
  const [open, setOpen] = useState(false);
  const [deepResearchPromptStatus, setDeepResearchPromptStatus] = useState('');
  const [deepResearchJobStatus, setDeepResearchJobStatus] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const showStatus = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    message: string,
  ) => {
    setter(message);
    setTimeout(() => setter(''), 2500);
  };

  const handleCopyDeepResearchPrompt = async () => {
    const company = job?.company_name || 'Unknown Company';
    const title = job?.name || 'Unknown Role';
    const location = job?.location || 'Unknown Location';
    const remote = job?.remote || '';
    const url = job?.source_url || '';
    const sourceLabel = getSourceLabel(job?.source_url);
    const description = job?.description || '';

    const remoteNote = remote ? `\nRemote preference: ${remote}` : '';
    const urlNote = url ? `\nJob posting URL: ${url} (source: ${sourceLabel})` : '';

    const prompt = `You are a job-seeker's due-diligence assistant. I am considering applying to the following role and need a thorough background check on the company before I invest time in the application.

## Role Details
- **Company:** ${company}
- **Title:** ${title}
- **Location:** ${location}${remoteNote}${urlNote}

## Job Description (for context)
${description}

---

## Research Tasks

Please investigate the following and provide a structured report:

1. **Company Overview**
   - What does the company do? What industry and stage (startup, scale-up, public, non-profit, government, etc.)?
   - Approximate headcount and founding year.

2. **Financial Health & Stability**
   - Is the company profitable or venture-funded? Recent funding rounds or revenue signals.
   - Any signs of financial distress, layoffs, or downsizing in the past 12–18 months?

3. **Reputation & Culture**
   - Glassdoor / Blind / LinkedIn review sentiment. Common praise and complaints.
   - Any notable leadership controversies, lawsuits, or press scandals?

4. **Mission Alignment & Impact**
   - Does the company's stated mission match its actions? Any greenwashing or impact-washing red flags?

5. **Role Legitimacy**
   - Does this job posting appear genuine? Any signals it could be a ghost listing, scam, or role already filled?
   - Is the listed location consistent with the company's known offices?

6. **Red Flags Summary**
   - List any significant concerns I should investigate further before applying.

7. **Overall Verdict**
   - On a scale of Low / Medium / High, rate the risk of this company being a poor employer.
   - Should I proceed with the application, proceed with caution, or skip?

Be direct and honest. Do not soften negative findings.`;

    try {
      await copyToClipboard(prompt);
      showStatus(setDeepResearchPromptStatus, '✅ Copied!');
    } catch {
      showStatus(setDeepResearchPromptStatus, '❌ Copy failed');
    }
    setOpen(false);
  };

  const handleCopyDeepReseachJobTemplate = async () => {
    const company = job?.company_name || 'Unknown Company';
    const title = job?.name || 'Unknown Role';
    const location = job?.location || 'Unknown Location';
    const remote = job?.remote || '';
    const url = job?.source_url || '';
    const sourceLabel = getSourceLabel(job?.source_url);
    const description = job?.description || '';

    const remoteNote = remote ? `\nRemote preference: ${remote}` : '';
    const urlNote = url ? `\nJob posting URL: ${url} (source: ${sourceLabel})` : '';

    // Resolve which resume to use
    const activeResumeId = resumeId || selectedResumeIds?.[0];
    let resumeDisplayName = uploadedResumeName || 'Selected Resume';
    let resumeText: string | null = uploadedResumeText || null;

    if (!resumeText && activeResumeId && resumeCatalogById) {
      const entry = resumeCatalogById[activeResumeId];
      if (entry) {
        resumeDisplayName = entry.displayName || entry.name || activeResumeId;
      }
    }

    if (!resumeText && activeResumeId) {
      try {
        const res = await fetch(
          `/api/resumes?resumeId=${encodeURIComponent(activeResumeId)}&includeText=1`,
        );
        if (res.ok) {
          const data = await res.json();
          resumeText = data?.text ?? data?.resumeText ?? null;
        }
      } catch {
        // fall through to placeholder
      }
    }

    const resumeSection = resumeText
      ? `## My Resume (${resumeDisplayName})
\`\`\`
${resumeText}
\`\`\``
      : `## My Resume
*(No resume was provided. Where tasks below require resume content, note what is missing and explain what I should supply before you can complete that section.)*`;

    const prompt = `You are an expert career coach, resume writer, and hiring consultant. I am preparing a full application package for the role below. Use the job description and my resume to complete all tasks.

## Role Details
- **Company:** ${company}
- **Title:** ${title}
- **Location:** ${location}${remoteNote}${urlNote}

## Job Description
${description}

---

${resumeSection}

---

## Tasks — complete every section below

### 1. Company & Role Research
- One-paragraph company overview (industry, stage, mission, size).
- Key business challenges this role is likely hired to solve.
- Culture signals from the job description language.

### 2. Role Analysis
- Extract the top 8–10 required skills/competencies from the job description.
- Identify any implicit requirements not explicitly stated.
- Flag any requirements that seem like stretch goals vs. hard gates.

### 3. Resume Gap Analysis
- Compare my resume against the role requirements.
- List: (a) strong matches, (b) partial matches I should highlight differently, (c) gaps I need to address or acknowledge.

### 4. Tailored Resume Rewrite
- Rewrite the most relevant 3–5 bullet points from my resume to directly mirror language in this job description.
- Preserve factual accuracy — do not invent achievements.
- Output as a ready-to-paste block.

### 5. Cover Letter
- Write a compelling, specific cover letter (300–400 words).
- Open with a hook tied to the company's mission or a recent company development.
- Middle paragraphs: connect 2–3 of my concrete achievements to the top role requirements.
- Close with a confident, non-desperate call to action.
- Do not use generic filler phrases like "I am a passionate team player."

### 6. ATS Keyword Mapping
- List the high-value keywords and phrases from the job description that should appear in my resume and cover letter.
- Flag any that are currently missing from my materials.

### 7. Interview Preparation
- Predict the 5 most likely interview questions for this specific role.
- For each question, draft a strong answer grounded in my resume experience using the STAR format where applicable.
- Include 3 sharp questions I should ask the interviewer that demonstrate strategic thinking.

### 8. Application Strategy
- Recommended application channels beyond the listed URL (referral networks, LinkedIn, direct outreach).
- One concrete suggestion for standing out (portfolio piece, cold outreach angle, etc.).

Be specific, direct, and high quality. Treat this as a real application I intend to submit.`;

    try {
      await copyToClipboard(prompt);
      showStatus(setDeepResearchJobStatus, '✅ Copied!');
    } catch {
      showStatus(setDeepResearchJobStatus, '❌ Copy failed');
    }
    setOpen(false);
  };

  return (
    <div className="job-tile-dropdown" ref={containerRef}>
      <button
        className="job-tile-dropdown-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Job options"
        aria-expanded={open}
        aria-haspopup="true"
      >
        ⋯
      </button>

      {open && (
        <div className="job-tile-dropdown-menu" role="menu">
          <button
            className="job-tile-dropdown-item"
            role="menuitem"
            onClick={handleCopyDeepResearchPrompt}
          >
            <span className="dropdown-item-icon">🔍</span>
            <span className="dropdown-item-label">Deep research AI prompt</span>
            {deepResearchPromptStatus && (
              <span className="dropdown-item-status">{deepResearchPromptStatus}</span>
            )}
          </button>

          <button
            className="job-tile-dropdown-item"
            role="menuitem"
            onClick={handleCopyDeepReseachJobTemplate}
          >
            <span className="dropdown-item-icon">🧰</span>
            <span className="dropdown-item-label">Deep reseach job template</span>
            {deepResearchJobStatus && (
              <span className="dropdown-item-status">{deepResearchJobStatus}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default JobTileDropdown;
