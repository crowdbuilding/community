import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProjectProvider } from './contexts/ProjectContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { useProject } from './contexts/ProjectContext'
import Layout from './components/Layout'
import { ConfirmProvider } from './components/ConfirmDialog'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'
import Login from './views/Login'
import AuthCallback from './views/AuthCallback'
import Dashboard from './views/Dashboard'
import Updates from './views/Updates'
import Community from './views/Community'
import Events from './views/Events'
import Members from './views/Members'
import Settings from './views/Settings'
import Roadmap from './views/Roadmap'
import ProfessionalUpdates from './views/ProfessionalUpdates'
import Documents from './views/Documents'
import AdviseurTeam from './views/AdviseurTeam'
import Profile from './views/Profile'
import DocumentArchive from './views/DocumentArchive'
import OrgDashboard from './views/OrgDashboard'
import OrgSettings from './views/OrgSettings'
import NewProject from './views/NewProject'
import JoinProject from './views/JoinProject'
import IntakeForm from './views/IntakeForm'
import Ledenwerving from './views/Ledenwerving'
import PrivacyPolicy from './views/PrivacyPolicy'
import CookieConsent from './components/CookieConsent'

function NotFound() {
  return (
    <div className="error-boundary">
      <div className="error-boundary__card">
        <i className="fa-solid fa-compass error-boundary__icon" style={{ color: 'var(--text-tertiary)' }} />
        <h2>Pagina niet gevonden</h2>
        <p>Deze pagina bestaat niet of je hebt geen toegang.</p>
        <button className="btn-primary" onClick={() => window.location.href = '/'}>
          <i className="fa-solid fa-house" /> Naar home
        </button>
      </div>
    </div>
  )
}

function AuthGuard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-page"><p>Laden...</p></div>
  if (!user) {
    // Remember where the user wanted to go
    const path = window.location.pathname
    if (path && path !== '/' && path !== '/login') {
      try { localStorage.setItem('redirectAfterLogin', path) } catch {}
    }
    return <Navigate to="/login" replace />
  }
  return children
}

function HomeRedirect() {
  const { memberships, isOrgAdmin, primaryOrgId, loading } = useAuth()
  if (loading) return <div className="loading-page"><p>Laden...</p></div>

  // Org admin → org dashboard
  if (isOrgAdmin && primaryOrgId) return <Navigate to={`/org/${primaryOrgId}`} replace />
  // Single project member → project
  if (memberships.length === 1) return <Navigate to={`/p/${memberships[0].project_id}`} replace />
  // Multi-project member → first project (TODO: project selector)
  if (memberships.length > 1) return <Navigate to={`/p/${memberships[0].project_id}`} replace />

  return <div className="empty-state"><h2>Welkom</h2><p>Je bent nog niet lid van een project.</p></div>
}

function MemberGate() {
  const { membership, loading } = useProject()
  if (loading) return <div className="loading-page"><p>Laden...</p></div>
  if (!membership) return <JoinProject />
  return <Layout />
}

function ProjectShell() {
  return (
    <ProjectProvider>
      <ProjectThemeWrapper>
        <MemberGate />
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
    <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
          <ConfirmProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/intake/:projectId" element={<IntakeForm />} />

            <Route path="/" element={<AuthGuard><HomeRedirect /></AuthGuard>} />

            {/* Org-level routes */}
            <Route path="/org/:orgId" element={<AuthGuard><OrgDashboard /></AuthGuard>} />
            <Route path="/org/:orgId/settings" element={<AuthGuard><OrgSettings /></AuthGuard>} />
            <Route path="/org/:orgId/new-project" element={<AuthGuard><NewProject /></AuthGuard>} />

            {/* Project-level routes */}
            <Route path="/p/:projectId" element={<AuthGuard><ProjectShell /></AuthGuard>}>
              <Route index element={<Dashboard />} />
              <Route path="updates" element={<Updates />} />
              <Route path="documenten" element={<Documents />} />
              <Route path="pro-updates" element={<ProfessionalUpdates />} />
              <Route path="adviseurs" element={<AdviseurTeam />} />
              <Route path="community" element={<Community />} />
              <Route path="events" element={<Events />} />
              <Route path="roadmap" element={<Roadmap />} />
              <Route path="documents" element={<DocumentArchive />} />
              <Route path="members" element={<Members />} />
              <Route path="ledenwerving" element={<Ledenwerving />} />
              <Route path="profile" element={<Profile />} />
              {/* Settings moved to org dashboard */}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ConfirmProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
    <CookieConsent />
    </ErrorBoundary>
  )
}
