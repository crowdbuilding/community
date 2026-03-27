import { useState, useRef, useEffect } from 'react'

/**
 * Reusable DS dropdown filter with grouped options.
 *
 * groups: [{ label: 'Fase', options: [{ key, label, dot? }] }]
 * value: active filter key
 * onChange: (key) => void
 * allLabel: label for "show all" option (default: 'Alles')
 */
export default function FilterDropdown({ groups, value, onChange, allLabel = 'Alles' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Find the active label
  const activeLabel = value === 'Alles'
    ? allLabel
    : groups.flatMap(g => g.options).find(o => o.key === value)?.label || value

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  function select(key) {
    onChange(key)
    setOpen(false)
  }

  return (
    <div className="filter-dropdown" ref={ref}>
      <button
        className={`filter-dropdown__trigger ${open ? 'filter-dropdown__trigger--open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span>{activeLabel}</span>
        <i className={`fa-solid fa-chevron-down filter-dropdown__chevron ${open ? 'filter-dropdown__chevron--open' : ''}`} />
      </button>

      {open && (
        <div className="filter-dropdown__menu">
          {/* All option */}
          <button
            className={`filter-dropdown__item ${value === 'Alles' ? 'filter-dropdown__item--active' : ''}`}
            onClick={() => select('Alles')}
          >
            {allLabel}
          </button>

          {groups.map(group => (
            <div key={group.label} className="filter-dropdown__group">
              <div className="filter-dropdown__group-label">{group.label}</div>
              {group.options.map(opt => (
                <button
                  key={opt.key}
                  className={`filter-dropdown__item ${value === opt.key ? 'filter-dropdown__item--active' : ''}`}
                  onClick={() => select(opt.key)}
                >
                  {opt.dot && (
                    <span className="filter-dropdown__dot" style={{ background: opt.dot }} />
                  )}
                  {opt.label}
                  {opt.active && (
                    <span className="filter-dropdown__active-badge">actief</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
