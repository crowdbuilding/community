import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef({})

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => Object.values(timersRef.current).forEach(clearTimeout)
  }, [])

  const addToast = useCallback((message, type = 'error', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev.slice(-2), { id, message, type }]) // max 3 toasts

    timersRef.current[id] = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
      delete timersRef.current[id]
    }, duration)

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    clearTimeout(timersRef.current[id])
    delete timersRef.current[id]
  }, [])

  const toast = useCallback({
    error: (msg) => addToast(msg, 'error'),
    success: (msg) => addToast(msg, 'success', 3000),
    info: (msg) => addToast(msg, 'info', 3500),
  }, [addToast])

  // Make toast callable as toast.error(), toast.success(), etc.
  const api = useCallback(() => {}, [])
  api.error = (msg) => addToast(msg, 'error')
  api.success = (msg) => addToast(msg, 'success', 3000)
  api.info = (msg) => addToast(msg, 'info', 3500)

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.type}`} onClick={() => removeToast(t.id)}>
            <i className={`fa-solid ${t.type === 'error' ? 'fa-circle-exclamation' : t.type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}`} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
