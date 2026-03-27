import { useState } from 'react'

const QUESTION_TYPES = [
  { value: 'text', label: 'Kort antwoord' },
  { value: 'textarea', label: 'Lang antwoord' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Keuzerondje' },
]

export default function IntakeQuestionEditor({ questions, onAdd, onUpdate, onDelete, onReorder }) {
  const [adding, setAdding] = useState(false)
  const [newText, setNewText] = useState('')
  const [newType, setNewType] = useState('text')
  const [newOptions, setNewOptions] = useState('')
  const [newRequired, setNewRequired] = useState(true)

  function handleAdd() {
    if (!newText.trim()) return
    const options = (newType === 'select' || newType === 'radio')
      ? newOptions.split('\n').map(o => o.trim()).filter(Boolean)
      : null

    onAdd({
      question_text: newText.trim(),
      question_type: newType,
      options,
      required: newRequired,
    })
    setNewText('')
    setNewType('text')
    setNewOptions('')
    setNewRequired(true)
    setAdding(false)
  }

  function handleMoveUp(index) {
    if (index === 0) return
    const reordered = [...questions]
    ;[reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]]
    onReorder(reordered)
  }

  function handleMoveDown(index) {
    if (index === questions.length - 1) return
    const reordered = [...questions]
    ;[reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]]
    onReorder(reordered)
  }

  return (
    <div className="intake-editor">
      {questions.length === 0 && !adding && (
        <p className="intake-editor__empty">
          Nog geen vragen toegevoegd. Voeg vragen toe die geïnteresseerden moeten beantwoorden.
        </p>
      )}

      <div className="intake-editor__list">
        {questions.map((q, i) => (
          <QuestionRow
            key={q.id}
            question={q}
            index={i}
            total={questions.length}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onMoveUp={() => handleMoveUp(i)}
            onMoveDown={() => handleMoveDown(i)}
          />
        ))}
      </div>

      {adding ? (
        <div className="intake-editor__add-form">
          <div className="form-group">
            <label>Vraag</label>
            <input
              type="text"
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="bijv. Wat is je woondroom?"
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group form-group--half">
              <label>Type</label>
              <select value={newType} onChange={e => setNewType(e.target.value)}>
                {QUESTION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group form-group--half">
              <label className="intake-editor__checkbox-label">
                <input
                  type="checkbox"
                  checked={newRequired}
                  onChange={e => setNewRequired(e.target.checked)}
                />
                Verplicht
              </label>
            </div>
          </div>

          {(newType === 'select' || newType === 'radio') && (
            <div className="form-group">
              <label>Opties (één per regel)</label>
              <textarea
                value={newOptions}
                onChange={e => setNewOptions(e.target.value)}
                placeholder={'Optie 1\nOptie 2\nOptie 3'}
                rows={3}
              />
            </div>
          )}

          <div className="intake-editor__add-actions">
            <button className="btn-secondary btn-sm" onClick={() => setAdding(false)}>Annuleren</button>
            <button className="btn-primary btn-sm" onClick={handleAdd} disabled={!newText.trim()}>Toevoegen</button>
          </div>
        </div>
      ) : (
        <button className="btn-secondary intake-editor__add-btn" onClick={() => setAdding(true)}>
          <i className="fa-solid fa-plus" /> Vraag toevoegen
        </button>
      )}
    </div>
  )
}

function QuestionRow({ question, index, total, onUpdate, onDelete, onMoveUp, onMoveDown }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(question.question_text)

  function handleSave() {
    onUpdate(question.id, { question_text: text.trim() })
    setEditing(false)
  }

  const typeLabel = QUESTION_TYPES.find(t => t.value === question.question_type)?.label || question.question_type

  return (
    <div className="intake-editor__row">
      <div className="intake-editor__row-order">
        <button
          className="intake-editor__order-btn"
          onClick={onMoveUp}
          disabled={index === 0}
          title="Omhoog"
        >
          <i className="fa-solid fa-chevron-up" />
        </button>
        <button
          className="intake-editor__order-btn"
          onClick={onMoveDown}
          disabled={index === total - 1}
          title="Omlaag"
        >
          <i className="fa-solid fa-chevron-down" />
        </button>
      </div>

      <div className="intake-editor__row-content">
        {editing ? (
          <div className="intake-editor__row-edit">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <div className="intake-editor__row-edit-actions">
              <button className="btn-secondary btn-sm" onClick={() => { setText(question.question_text); setEditing(false) }}>Annuleren</button>
              <button className="btn-primary btn-sm" onClick={handleSave}>Opslaan</button>
            </div>
          </div>
        ) : (
          <>
            <span className="intake-editor__row-text">{question.question_text}</span>
            <span className="intake-editor__row-meta">
              {typeLabel}
              {question.required && ' · Verplicht'}
              {!question.active && ' · Inactief'}
            </span>
          </>
        )}
      </div>

      <div className="intake-editor__row-actions">
        <button className="intake-editor__action-btn" onClick={() => setEditing(!editing)} title="Bewerken">
          <i className="fa-solid fa-pen" />
        </button>
        <button
          className="intake-editor__action-btn"
          onClick={() => onUpdate(question.id, { active: !question.active })}
          title={question.active ? 'Deactiveren' : 'Activeren'}
        >
          <i className={`fa-solid ${question.active ? 'fa-eye' : 'fa-eye-slash'}`} />
        </button>
        <button className="intake-editor__action-btn intake-editor__action-btn--danger" onClick={() => onDelete(question.id)} title="Verwijderen">
          <i className="fa-solid fa-trash" />
        </button>
      </div>
    </div>
  )
}
