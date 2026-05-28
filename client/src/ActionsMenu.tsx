import { type InsightsPopoverKey } from './usePinnedHoverPopover'

interface ActionsMenuProps {
  visiblePopover: InsightsPopoverKey | null
  setHoverPopover: (popover: InsightsPopoverKey) => void
  onOpenAiCorpus: () => void
  onRunAuditAllInSearch: () => void
  isEnabled: boolean
}

export default function ActionsMenu({
  visiblePopover,
  setHoverPopover,
  onOpenAiCorpus,
  onRunAuditAllInSearch,
  isEnabled,
}: ActionsMenuProps) {
  return (
    <div
      className="app-insights-actions__item"
      onMouseEnter={() => {
        if (isEnabled) {
          setHoverPopover('actions')
        }
      }}
    >
      <button
        type="button"
        className={`app-insights-actions__button ${visiblePopover === 'actions' ? 'app-insights-actions__button--active' : ''}`}
      >
        Actions
      </button>
      <div
        className={`app-insights-hover-panel app-insights-hover-panel--menu ${visiblePopover === 'actions' ? 'app-insights-hover-panel--open' : ''}`}
        onMouseEnter={() => {
          if (isEnabled) {
            setHoverPopover('actions')
          }
        }}
      >
        <div className="insights-actions-menu">
          <button type="button" className="insights-actions-menu__item" onClick={onOpenAiCorpus}>
            Open AI Resume-vs-Jobs Text
          </button>
          <button type="button" className="insights-actions-menu__item" onClick={onRunAuditAllInSearch}>
            Run audit on all jobs in search
          </button>
        </div>
      </div>
    </div>
  )
}