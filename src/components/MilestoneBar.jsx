import { useProject } from '../contexts/ProjectContext'

export default function MilestoneBar() {
  const { milestones } = useProject()

  if (!milestones.length) return null

  return (
    <div className="milestone-bar">
      <div className="milestone-track">
        {milestones.map((m) => (
          <div key={m.id} className={`milestone-step milestone-${m.status}`}>
            <span className="milestone-label">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
