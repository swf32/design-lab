import { Component, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
  fallback: (error: Error, reset: () => void) => ReactNode
}

type ErrorBoundaryState = { error: Error | null }

// A crash inside a fullscreen review surface (Page/Wireframe/Playground) previously unmounted the
// entire React root with no way back short of a manual reload, because nothing above it ever
// caught the render error. Scoping a boundary around each fullscreen view keeps the shell (and
// its popstate/navigation listeners) alive so "Back" and "Reload this view" stay usable.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error('Design Lab view crashed:', error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) return this.props.fallback(this.state.error, this.reset)
    return this.props.children
  }
}
