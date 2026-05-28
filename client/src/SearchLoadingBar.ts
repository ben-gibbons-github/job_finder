import { createElement } from 'react'

interface SearchLoadingBarProps {
  isVisible: boolean
}

export default function SearchLoadingBar({ isVisible }: SearchLoadingBarProps) {
  if (!isVisible) {
    return null
  }

  return createElement(
    'section',
    { className: 'search-loading', 'aria-live': 'polite', 'aria-label': 'Searching jobs' },
    createElement('div', { className: 'search-loading__label' }, 'Searching jobs...'),
    createElement(
      'div',
      { className: 'search-loading__track' },
      createElement('div', { className: 'search-loading__bar' }),
    ),
  )
}
