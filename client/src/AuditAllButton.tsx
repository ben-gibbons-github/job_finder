import React, { useEffect } from 'react'

interface BulkAuditButtonProps {
  showButton?: boolean
  runSignal?: number
}

const BulkAuditButton: React.FC<BulkAuditButtonProps> = ({ showButton = true, runSignal = 0 }) => {
  const runBulkAuditForVisibleJobs = () => {
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.audit-run-btn'))

    buttons.forEach((button) => {
      if (!button.disabled) {
        button.click()
      }
    })
  }

  useEffect(() => {
    if (runSignal > 0) {
      runBulkAuditForVisibleJobs()
    }
  }, [runSignal])

  if (!showButton) {
    return null
  }

  return (
    <button type="button" onClick={runBulkAuditForVisibleJobs}>
      Run audits for visible jobs
    </button>
  )
}

export default BulkAuditButton
