import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProjectProvider } from './contexts/ProjectContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { useProject } from './contexts/ProjectContext'
import Layout from './components/Layout'
import Login from './views/Login'
import AuthCallback from './views/AuthCallback'
import Dashboard from './views/Dashboard'
import ProjectsOverview from './views/ProjectsOverview'
import Updates from './views/Updates'
import Community from './views/Community'
import Events from './views/Events'
import Members from './views/Members'
import Settings from './views/Settings'
import Roadmap from './views/Roadmap'

function AuthGuard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-page"><p>Laden...</p></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function HomeRedirect() {
  const { memberships, isPlatformAdmin, loading } = useAuth()
  if (loading) return <div className="loading-page"><p>Laden...</p></div>

  if (isPlatformAdmin) return <Navigate to="/projects" replace />
  if (memberships.length === 1) return <Navigate to={`/p/${memberships[0].project_id}`} replace />
  if (memberships.length > 1) return <Navigate to="/projects" replace />
  return <div className="empty-state"><h2>Welkom</h2><p>Je bent nog niet lid van een project.</p></div>
}

function ProjectShell() {
  return (
    <ProjectProvider>
      <ProjectThemeWrapper>
        <Layout />
      </ProjectThemeWrapper>
    </ProjectProvider>
  )
}

function ProjectThemeWrapper({ children }) {
  const { branding } = useProject()
  return (
    <ThemeProvider projectBranding={branding}>
      {children}
    </ThemeProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route path="/" element={<AuthGuard><HomeRedirect /></AuthGuard>} />
            <Route path="/projects" element={<AuthGuard><ProjectsOverview /></AuthGuard>} />

            <Route path="/p/:projectId" element={<AuthGuard><ProjectShell /></AuthGuard>}>
              <Route index element={<Dashboard />} />
              <Route path="updates" element={<Updates />} />
              <Route path="community" element={<Community />} />
              <Route path="events" element={<Events />} />
              <Route path="roadmap" element={<Roadmap />} />
              <Route path="members" element={<Members />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
