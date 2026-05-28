import { useState } from 'react'

interface UploadResumeProps {
  uploadedResumeName: string
  resumeText: string
  onResumeUpload: (file: File) => void
  isEnabled: boolean
}

function buildResumePreview(resumeText: string): string {
  const trimmed = String(resumeText ?? '').trim()
  return trimmed.length > 0 ? trimmed : 'No resume uploaded.'
}

export default function UploadResume({
  uploadedResumeName,
  resumeText,
  onResumeUpload,
  isEnabled,
}: UploadResumeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const previewText = buildResumePreview(resumeText)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) {
      return
    }

    void onResumeUpload(selectedFile)
  }

  return (
    <div
      className={`compact-search-bar__resume app-resume-upload ${isEnabled ? '' : 'compact-search-bar__resume--disabled'}`.trim()}
      onMouseEnter={() => {
        if (isEnabled) {
          setIsHovered(true)
        }
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input
        id="compact-resume-input"
        type="file"
        accept=".txt,.pdf,.docx,.rtf"
        className="compact-search-bar__resume-input"
        onChange={handleFileChange}
        disabled={!isEnabled}
      />
      <label htmlFor="compact-resume-input" className="compact-search-bar__resume-button">
        Upload Resume
      </label>
      {uploadedResumeName && (
        <span className="compact-search-bar__resume-name" title={uploadedResumeName}>
          {uploadedResumeName}
        </span>
      )}

      <div
        className={`app-resume-upload__popover app-insights-hover-panel app-insights-hover-panel--resume ${isHovered ? 'app-insights-hover-panel--open' : ''}`.trim()}
        aria-hidden={!isHovered}
      >
        <div className="app-resume-upload__title">Resume Preview</div>
        <textarea
          readOnly
          spellCheck={false}
          value={previewText}
          className="app-resume-upload__textarea"
        />
      </div>
    </div>
  )
}
