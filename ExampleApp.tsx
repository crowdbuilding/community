// ============================================================================
// EXAMPLE: Complete Things 3 Design System demo
// 
// This shows every component in action. Copy this as a starting point.
// ============================================================================

import React, { useState } from 'react'
import {
  Sidebar, SidebarLabel, NavItem,
  Checkbox, TaskList, TaskItem,
  Card, StatCard, Tag,
  Button, FAB, Modal,
} from './components/clean'

type View = 'inbox' | 'today' | 'upcoming' | 'anytime' | 'someday' | 'logbook'

export default function App() {
  const [activeView, setActiveView] = useState<View>('inbox')
  const [modalOpen, setModalOpen] = useState(false)
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Design tokens documentatie afronden', done: false },
    { id: 2, title: 'Review feedback verwerken', done: false },
    { id: 3, title: 'Component library opzetten', done: false },
    { id: 4, title: 'Animatie timing fine-tunen', done: false },
    { id: 5, title: 'Accessibility audit uitvoeren', done: true },
  ])

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <Sidebar>
        <SidebarLabel>Overzicht</SidebarLabel>
        <NavItem icon="fa-solid fa-inbox"       color="inbox"    label="Inbox"    badge={3}  active={activeView === 'inbox'}    onClick={() => setActiveView('inbox')} />
        <NavItem icon="fa-solid fa-star"        color="today"    label="Today"    badge={7}  active={activeView === 'today'}    onClick={() => setActiveView('today')} />
        <NavItem icon="fa-solid fa-calendar"    color="upcoming" label="Upcoming"            active={activeView === 'upcoming'} onClick={() => setActiveView('upcoming')} />
        <NavItem icon="fa-solid fa-layer-group" color="anytime"  label="Anytime"  badge={12} active={activeView === 'anytime'}  onClick={() => setActiveView('anytime')} />
        <NavItem icon="fa-solid fa-couch"       color="someday"  label="Someday"             active={activeView === 'someday'}  onClick={() => setActiveView('someday')} />
        <NavItem icon="fa-solid fa-book"        color="logbook"  label="Logbook"             active={activeView === 'logbook'}  onClick={() => setActiveView('logbook')} />

        <SidebarLabel>Projecten</SidebarLabel>
        <NavItem icon="fa-solid fa-circle-half-stroke" color="purple" label="Website redesign" isProject />
        <NavItem icon="fa-solid fa-circle-check"       color="green"  label="Q1 Rapportage"    isProject />
        <NavItem icon="fa-regular fa-circle"           color="orange" label="Verhuizing"        isProject />
      </Sidebar>

      {/* ── Main content ────────────────────────────────── */}
      <main style={{ flex: 1, padding: 32, maxWidth: 800 }}>

        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
          {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 32 }}>
          {tasks.filter(t => !t.done).length} openstaande taken
        </p>

        {/* ── Stat cards ──────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard
            icon="fa-solid fa-check-double"
            iconColor="var(--accent-green)"
            value={tasks.filter(t => t.done).length}
            label="Voltooid"
            change={{ value: '12%', positive: true }}
          />
          <StatCard
            icon="fa-solid fa-clock"
            iconColor="var(--accent-primary)"
            value={tasks.filter(t => !t.done).length}
            label="Openstaand"
          />
          <StatCard
            icon="fa-solid fa-folder-open"
            iconColor="var(--accent-purple)"
            value={3}
            label="Projecten"
          />
        </div>

        {/* ── Task list ───────────────────────────────────── */}
        <TaskList>
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              title={task.title}
              completed={task.done}
              onToggle={() => toggleTask(task.id)}
              meta={
                task.id === 1 ? <Tag color="blue" icon="fa-solid fa-tag">Design</Tag> :
                task.id === 2 ? <Tag color="red" icon="fa-solid fa-fire">Urgent</Tag> :
                task.id === 3 ? <Tag color="purple" icon="fa-solid fa-code">Dev</Tag> :
                undefined
              }
            />
          ))}
        </TaskList>

        {/* ── Buttons ─────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          <Button icon="fa-solid fa-plus" onClick={() => setModalOpen(true)}>
            Nieuwe taak
          </Button>
          <Button variant="ghost" icon="fa-solid fa-pencil">
            Bewerken
          </Button>
          <Button variant="danger" size="sm" icon="fa-solid fa-trash">
            Verwijderen
          </Button>
        </div>

        {/* ── Tags showcase ───────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
          <Tag color="blue" icon="fa-solid fa-tag">Design</Tag>
          <Tag color="yellow" icon="fa-solid fa-star">Priority</Tag>
          <Tag color="green" icon="fa-solid fa-check">Done</Tag>
          <Tag color="pink" icon="fa-solid fa-heart">Personal</Tag>
          <Tag color="purple" icon="fa-solid fa-code">Dev</Tag>
          <Tag color="orange" icon="fa-solid fa-bell">Reminder</Tag>
        </div>
      </main>

      {/* ── FAB ───────────────────────────────────────────── */}
      <FAB
        onClick={() => setModalOpen(true)}
        style={{ position: 'fixed', bottom: 32, right: 32 }}
        aria-label="Nieuwe taak"
      />

      {/* ── Modal ─────────────────────────────────────────── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Nieuwe taak</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
          Wat moet er gebeuren?
        </p>
        <input className="cl-input" placeholder="Taaknaam..." autoFocus />
        <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
          <Tag color="blue" icon="fa-solid fa-calendar">Vandaag</Tag>
          <Tag color="purple" icon="fa-solid fa-tag">Tag</Tag>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Annuleren</Button>
          <Button size="sm" icon="fa-solid fa-check" onClick={() => setModalOpen(false)}>Toevoegen</Button>
        </div>
      </Modal>
    </div>
  )
}
