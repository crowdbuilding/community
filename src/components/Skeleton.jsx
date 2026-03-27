/**
 * Lightweight skeleton loading components.
 * Usage: <Skeleton.Card />, <Skeleton.Row />, <Skeleton.Text />
 */

function Line({ width = '100%', height = 14 }) {
  return <div className="skeleton-line" style={{ width, height }} />
}

function Card() {
  return (
    <div className="skeleton-card">
      <Line width="60%" height={18} />
      <Line width="40%" />
      <Line width="80%" />
    </div>
  )
}

function Row() {
  return (
    <div className="skeleton-row">
      <div className="skeleton-circle" />
      <div className="skeleton-row__text">
        <Line width="50%" height={16} />
        <Line width="30%" />
      </div>
    </div>
  )
}

function Grid({ count = 3 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }, (_, i) => <Card key={i} />)}
    </div>
  )
}

function List({ count = 4 }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }, (_, i) => <Row key={i} />)}
    </div>
  )
}

/** Full page loading state with optional title skeleton */
function Page({ title = true, rows = 4 }) {
  return (
    <div className="skeleton-page">
      {title && <Line width="200px" height={26} />}
      <div style={{ height: 16 }} />
      <List count={rows} />
    </div>
  )
}

const Skeleton = { Line, Card, Row, Grid, List, Page }
export default Skeleton
