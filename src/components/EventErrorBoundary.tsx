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
    return <section className="event-error-state scroll-panel"><p className="eyebrow">Faxe Ordenens arkiv</p><h2 className="panel-title">Faxingen lot seg ikke vise</h2><p className="panel-desc">Denne begivenhet er nedskrevet i en eldre form. Krøniken er ennu uskadd.</p><button className="back-link" onClick={() => window.location.reload()}>Hent begivenheten påny</button></section>
  }
}
