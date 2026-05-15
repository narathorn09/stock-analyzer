"use client"

import { Component, type ReactNode } from "react"

type Props = { children: ReactNode; fallback?: ReactNode }
type State = { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-sm">
            <p className="text-zinc-400">Something went wrong loading this section.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="rounded bg-zinc-800 px-3 py-1 text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              Try again
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
