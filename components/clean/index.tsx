// ============================================================================
// CLEAN DESIGN SYSTEM — React Component Library
// 
// Usage:
//   import { Sidebar, NavItem, Checkbox, TaskList, TaskItem,
//            Card, StatCard, Tag, Button, FAB, Modal } from './components/clean'
//
// Requires: clean-tokens.css + clean-components.css imported in your entry point
// ============================================================================

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
} from 'react'

// ── Helper ────────────────────────────────────────────────────────────────────

/** Merge class names, filtering out falsy values */
function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
}

export function Sidebar({ children, className, ...props }: SidebarProps) {
  return (
    <nav className={cx('cl-sidebar', className)} {...props}>
      {children}
    </nav>
  )
}

interface SidebarLabelProps {
  children: ReactNode
}

export function SidebarLabel({ children }: SidebarLabelProps) {
  return <div className="cl-sidebar-label">{children}</div>
}

// ── NavItem ───────────────────────────────────────────────────────────────────

type NavItemColor =
  | 'inbox' | 'today' | 'upcoming' | 'anytime' | 'someday' | 'logbook'
  | 'green' | 'purple' | 'orange' | 'red' | 'blue' | 'pink'

const NAV_COLOR_MAP: Record<NavItemColor, string> = {
  inbox:    'var(--clean-inbox)',
  today:    'var(--clean-today)',
  upcoming: 'var(--clean-upcoming)',
  anytime:  'var(--clean-anytime)',
  someday:  'var(--clean-someday)',
  logbook:  'var(--clean-logbook)',
  green:    'var(--accent-green)',
  purple:   'var(--accent-purple)',
  orange:   'var(--accent-orange)',
  red:      'var(--accent-red)',
  blue:     'var(--accent-primary)',
  pink:     'var(--accent-pink)',
}

interface NavItemProps {
  icon: string            // FA class, e.g. "fa-solid fa-inbox"
  color: NavItemColor
  label: string
  badge?: string | number
  active?: boolean
  isProject?: boolean
  onClick?: () => void
  className?: string
}

export function NavItem({
  icon, color, label, badge, active = false, isProject = false, onClick, className,
}: NavItemProps) {
  return (
    <div
      className={cx(
        'cl-nav-item',
        active && 'cl-nav-item--active',
        isProject && 'cl-nav-item--project',
        className,
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <i
        className={cx('cl-nav-item__icon', icon)}
        style={{ color: NAV_COLOR_MAP[color] }}
        aria-hidden="true"
      />
      <span>{label}</span>
      {badge !== undefined && <span className="cl-nav-item__badge">{badge}</span>}
    </div>
  )
}

// ── Checkbox ──────────────────────────────────────────────────────────────────

interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  className?: string
}

export function Checkbox({ checked = false, onChange, className }: CheckboxProps) {
  const ref = useRef<HTMLButtonElement>(null)

  const handleClick = useCallback(() => {
    onChange?.(!checked)
  }, [checked, onChange])

  // Re-trigger animation on check
  useEffect(() => {
    if (checked && ref.current) {
      ref.current.style.animation = 'none'
      ref.current.offsetHeight // reflow
      ref.current.style.animation = ''
    }
  }, [checked])

  return (
    <button
      ref={ref}
      className={cx('cl-checkbox', checked && 'cl-checkbox--checked', className)}
      onClick={handleClick}
      role="checkbox"
      aria-checked={checked}
      type="button"
    />
  )
}

// ── TaskList ──────────────────────────────────────────────────────────────────

interface TaskListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function TaskList({ children, className, ...props }: TaskListProps) {
  return (
    <div className={cx('cl-task-list', className)} {...props}>
      {children}
    </div>
  )
}

// ── TaskItem ──────────────────────────────────────────────────────────────────

interface TaskItemProps {
  title: string
  completed?: boolean
  onToggle?: (completed: boolean) => void
  meta?: ReactNode         // Right side: tags, dates, icons
  className?: string
}

export function TaskItem({ title, completed = false, onToggle, meta, className }: TaskItemProps) {
  return (
    <div className={cx('cl-task-item', completed && 'cl-task-item--completed', className)}>
      <Checkbox checked={completed} onChange={onToggle} />
      <span className="cl-task-item__title">{title}</span>
      {meta && <div className="cl-task-item__meta">{meta}</div>}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────

type CardVariant = 'default' | 'elevated' | 'modal'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  hoverable?: boolean
  children: ReactNode
}

export function Card({ variant = 'default', hoverable = false, children, className, ...props }: CardProps) {
  return (
    <div
      className={cx(
        'cl-card',
        variant === 'elevated' && 'cl-card--elevated',
        variant === 'modal' && 'cl-card--modal',
        hoverable && 'cl-card--hoverable',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: string              // FA class
  iconColor: string         // CSS color or var(--token)
  value: string | number
  valueColor?: string       // CSS color for the number
  label: string
  change?: { value: string; positive: boolean }
  className?: string
}

export function StatCard({ icon, iconColor, value, valueColor, label, change, className }: StatCardProps) {
  return (
    <div className={cx('cl-stat-card', className)}>
      <div className="cl-stat-card__icon">
        <i className={icon} style={{ color: iconColor }} aria-hidden="true" />
      </div>
      <div className="cl-stat-card__number" style={{ color: valueColor || iconColor }}>
        {value}
      </div>
      <div className="cl-stat-card__label">{label}</div>
      {change && (
        <div className={cx(
          'cl-stat-card__change',
          change.positive ? 'cl-stat-card__change--positive' : 'cl-stat-card__change--negative',
        )}>
          <i
            className={cx('fa-solid', change.positive ? 'fa-arrow-up' : 'fa-arrow-down')}
            style={{ fontSize: 9 }}
            aria-hidden="true"
          />
          {change.value}
        </div>
      )}
    </div>
  )
}

// ── Tag ───────────────────────────────────────────────────────────────────────

type TagColor = 'blue' | 'yellow' | 'red' | 'green' | 'pink' | 'purple' | 'orange'

interface TagProps {
  color: TagColor
  icon?: string             // FA class, e.g. "fa-solid fa-tag"
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Tag({ color, icon, children, className, onClick }: TagProps) {
  return (
    <span
      className={cx('cl-tag', `cl-tag--${color}`, className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon && <i className={icon} aria-hidden="true" />}
      {children}
    </span>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'ghost' | 'danger'
type ButtonSize = 'default' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: string             // FA class for left icon
  children: ReactNode
}

export function Button({
  variant = 'primary', size = 'default', icon, children, className, ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        'cl-btn',
        `cl-btn--${variant}`,
        size === 'sm' && 'cl-btn--sm',
        className,
      )}
      {...props}
    >
      {icon && <i className={icon} aria-hidden="true" />}
      {children}
    </button>
  )
}

// ── FAB (Magic Plus) ─────────────────────────────────────────────────────────

interface FABProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string
}

export function FAB({ icon = 'fa-solid fa-plus', className, ...props }: FABProps) {
  return (
    <button className={cx('cl-fab', className)} {...props}>
      <i className={icon} aria-hidden="true" />
    </button>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  const [exiting, setExiting] = useState(false)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const handleClose = useCallback(() => {
    setExiting(true)
    setTimeout(() => {
      setExiting(false)
      onClose()
    }, 200) // matches cl-modal-exit duration
  }, [onClose])

  if (!open && !exiting) return null

  return (
    <div className="cl-modal-backdrop" onClick={handleClose}>
      <div
        className={cx('cl-modal-card', exiting && 'cl-modal-card--exit', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
