import React from 'react'
import './ScoreWeightSliders.css'

export interface ScoreWeights {
  resume: number
  impact: number
  location: number
  fresh: number
  audit: number
  qualityOfLife: number
}

interface ScoreWeightSlidersProps {
  weights: ScoreWeights
  onChange: (weights: ScoreWeights) => void
}

const SLIDERS: { key: keyof ScoreWeights; label: string }[] = [
  { key: 'resume',   label: 'Resume' },
  { key: 'impact',   label: 'Impact' },
  { key: 'location', label: 'Location' },
  { key: 'fresh',    label: 'Fresh' },
  { key: 'audit',    label: 'Audit' },
  { key: 'qualityOfLife', label: 'Quality of Life' },
]

const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  resume: 1,
  impact: 1,
  location: 1,
  fresh: 1,
  audit: 1,
  qualityOfLife: 1,
}

const ScoreWeightSliders: React.FC<ScoreWeightSlidersProps> = ({ weights, onChange }) => {
  const handleChange = (key: keyof ScoreWeights, value: number) => {
    onChange({ ...weights, [key]: value })
  }

  const isDefaultWeights = SLIDERS.every(({ key }) => weights[key] === DEFAULT_SCORE_WEIGHTS[key])

  const handleResetAll = () => {
    onChange({ ...DEFAULT_SCORE_WEIGHTS })
  }

  return (
    <div className="score-weight-sliders">
      <h3 className="score-weight-sliders__title">Score Weights</h3>
      <div className="score-weight-sliders__list">
        {SLIDERS.map(({ key, label }) => (
          <div key={key} className="score-weight-slider">
            <div className="score-weight-slider__header">
              <span className="score-weight-slider__label">{label}</span>
              <span className="score-weight-slider__value">{weights[key].toFixed(1)}</span>
            </div>
            <input
              type="range"
              className="score-weight-slider__input"
              min={0}
              max={10}
              step={0.1}
              value={weights[key]}
              onChange={(e) => handleChange(key, parseFloat(e.target.value))}
            />
          </div>
        ))}
      </div>

      <div className="score-weight-sliders__actions">
        <button
          type="button"
          className="score-weight-sliders__reset-btn"
          onClick={handleResetAll}
          disabled={isDefaultWeights}
        >
          Reset all
        </button>
      </div>
    </div>
  )
}

export default ScoreWeightSliders
