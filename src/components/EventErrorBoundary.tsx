import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class EventErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[v0] Event view crashed:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return <section className="event-error-state scroll-panel"><p className="eyebrow">Faxe Ordenens arkiv</p><h2 className="panel-title">Faxingen kunne ikke vises</h2><p className="panel-desc">Denne begivenhed indeholder data i et ældre format. Krøniken er stadig intakt.</p><button className="back-link" onClick={() => window.location.reload()}>Genindlæs begivenhed</button></section>
  }
}
