import { useState } from 'react'
import JobDistributionGraph, { type JobDistributionMeta } from './JobDistributionGraph'
import ScoreWeightSliders, { type ScoreWeights } from './ScoreWeightSliders'
import { usePinnedHoverPopover } from './usePinnedHoverPopover'
import ActionsMenu from './ActionsMenu'

interface InsightsHoverPopoversProps {
  searchMeta: JobDistributionMeta | null
  scoreWeights: ScoreWeights
  onScoreWeightsChange: (weights: ScoreWeights) => void
  onOpenAiCorpus: () => void
  onRunAuditAllInSearch: () => void
  isEnabled: boolean
  hasSearched: boolean
}

export default function InsightsHoverPopovers({
  searchMeta,
  scoreWeights,
  onScoreWeightsChange,
  onOpenAiCorpus,
  onRunAuditAllInSearch,
  isEnabled,
  hasSearched,
}: InsightsHoverPopoversProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const {
    containerRef,
    visiblePopover,
    setHoverPopover,
    clearHoverPopover,
  } = usePinnedHoverPopover()

  return (
    <div className="advanced-options">
      <div className="advanced-options__header">
        <button
          type="button"
          className={`advanced-options__toggle ${hasSearched ? 'advanced-options__toggle--searched' : ''}`.trim()}
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
        >
          <span>Advanced options</span>
          <span className={`advanced-options__chevron ${isExpanded ? 'advanced-options__chevron--open' : ''}`}>▾</span>
        </button>
      </div>

      {isExpanded && (
        <div
          className={`app-insights-actions ${isEnabled ? '' : 'app-insights-actions--disabled'}`.trim()}
          aria-label="Insights controls"
          ref={containerRef}
          onMouseLeave={clearHoverPopover}
        >
      <div
        className="app-insights-actions__item"
        onMouseEnter={() => {
          if (isEnabled) {
            setHoverPopover('distribution')
          }
        }}
      >
        <button
          type="button"
          className={`app-insights-actions__button ${visiblePopover === 'distribution' ? 'app-insights-actions__button--active' : ''}`}
        >
          Score distribution
        </button>
        <div
          className={`app-insights-hover-panel ${visiblePopover === 'distribution' ? 'app-insights-hover-panel--open' : ''}`}
          onMouseEnter={() => setHoverPopover('distribution')}
        >
          <JobDistributionGraph meta={searchMeta} />
        </div>
      </div>

      <div
        className="app-insights-actions__item"
        onMouseEnter={() => {
          if (isEnabled) {
            setHoverPopover('weights')
          }
        }}
      >
        <button
          type="button"
          className={`app-insights-actions__button ${visiblePopover === 'weights' ? 'app-insights-actions__button--active' : ''}`}
        >
          Score weights
        </button>
        <div
          className={`app-insights-hover-panel app-insights-hover-panel--weights ${visiblePopover === 'weights' ? 'app-insights-hover-panel--open' : ''}`}
          onMouseEnter={() => setHoverPopover('weights')}
        >
          <ScoreWeightSliders
            weights={scoreWeights}
            onChange={onScoreWeightsChange}
          />
        </div>
      </div>

      <ActionsMenu
        visiblePopover={visiblePopover}
        setHoverPopover={setHoverPopover}
        onOpenAiCorpus={onOpenAiCorpus}
        onRunAuditAllInSearch={onRunAuditAllInSearch}
        isEnabled={isEnabled}
      />
        </div>
      )}
    </div>
  )
}
