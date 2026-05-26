import React from 'react'

const BulkAuditButton: React.FC = () => {
  const runBulkAuditForVisibleJobs = () => {
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.audit-run-btn'))

    buttons.forEach((button) => {
      if (!button.disabled) {
        button.click()
      }
    })
  }

  return (
    <button type="button" onClick={runBulkAuditForVisibleJobs}>
      Run audits for visible jobs
    </button>
  )
}

export default BulkAuditButton
