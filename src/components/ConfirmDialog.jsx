import { createContext, useContext, useState, useCallback } from 'react'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null)

  const confirm = useCallback((message, { danger = false } = {}) => {
    return new Promise(resolve => {
      setState({ message, danger, resolve })
    })
  }, [])

  function handleConfirm() {
    state?.resolve(true)
    setState(null)
  }

  function handleCancel() {
    state?.resolve(false)
    setState(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="confirm-dialog__icon">
              <i className={`fa-solid ${state.danger ? 'fa-triangle-exclamation' : 'fa-circle-question'}`} />
            </div>
            <p className="confirm-dialog__message">{state.message}</p>
            <div className="confirm-dialog__actions">
              <button className="btn-secondary" onClick={handleCancel}>Annuleren</button>
              <button
                className={`btn-primary ${state.danger ? 'btn-primary--danger' : ''}`}
                onClick={handleConfirm}
                autoFocus
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext)
  if (!confirm) throw new Error('useConfirm must be used within ConfirmProvider')
  return confirm
}
