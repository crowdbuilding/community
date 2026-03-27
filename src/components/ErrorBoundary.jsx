import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // In production: send to error monitoring (Sentry, etc.)
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__card">
            <i className="fa-solid fa-triangle-exclamation error-boundary__icon" />
            <h2>Er ging iets mis</h2>
            <p>Er is een onverwachte fout opgetreden. Probeer de pagina opnieuw te laden.</p>
            <button className="btn-primary" onClick={this.handleReload}>
              <i className="fa-solid fa-rotate-right" /> Opnieuw laden
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
