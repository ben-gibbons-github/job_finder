import React from 'react'
import './ScoreWeightSliders.css'

export interface ScoreWeights {
  resume: number
  impact: number
  location: number
  fresh: number
  audit: number
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
]

const ScoreWeightSliders: React.FC<ScoreWeightSlidersProps> = ({ weights, onChange }) => {
  const handleChange = (key: keyof ScoreWeights, value: number) => {
    onChange({ ...weights, [key]: value })
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
    </div>
  )
}

export default ScoreWeightSliders
