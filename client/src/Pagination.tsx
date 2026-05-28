import React from 'react'
import './Pagination.css'

interface PaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const [customPage, setCustomPage] = React.useState('')

  if (totalPages <= 1) {
    return null
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 5
    const halfWindow = Math.floor(maxPagesToShow / 2)

    let startPage = Math.max(1, currentPage - halfWindow)
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) {
        pages.push('...')
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...')
      }
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  const submitCustomPage = () => {
    const parsed = Number(customPage)
    if (!Number.isFinite(parsed)) {
      return
    }
    const clamped = Math.max(1, Math.min(totalPages, Math.trunc(parsed)))
    onPageChange(clamped)
    setCustomPage('')
  }

  return (
    <div className="pagination">
      <button
        className="pagination-btn pagination-prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← Previous
      </button>

      <div className="pagination-numbers">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                ...
              </span>
            )
          }

          return (
            <button
              key={page}
              className={`pagination-number ${page === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </button>
          )
        })}
      </div>

      <div className="pagination-jump" aria-label="Jump to custom page">
        <input
          type="number"
          min={1}
          max={totalPages}
          value={customPage}
          onChange={(event) => setCustomPage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              submitCustomPage()
            }
          }}
          className="pagination-jump-input"
          placeholder="Page"
        />
        <button
          type="button"
          className="pagination-jump-btn"
          onClick={submitCustomPage}
          disabled={customPage.trim().length === 0}
        >
          Go
        </button>
      </div>

      <button
        className="pagination-btn pagination-next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next →
      </button>

      <div className="pagination-info">
        Page {currentPage} of {totalPages} ({totalItems} items)
      </div>
    </div>
  )
}

export default Pagination
