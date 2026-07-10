import { Loader2 } from 'lucide-react'

interface LoadingOverlayProps {
  title?: string
  steps?: string[]
}

const DEFAULT_STEPS = [
  'Reading your PDF',
  'Generating book cover',
  'Configuring voice assistant',
]

const LoadingOverlay = ({
  title = 'Synthesizing your book...',
  steps = DEFAULT_STEPS,
}: LoadingOverlayProps) => {
  return (
    <div className="loading-wrapper">
      <div className="loading-shadow-wrapper bg-white shadow-soft-lg">
        <div className="loading-shadow">
          <Loader2 className="loading-animation size-10 text-[var(--accent-warm)]" />
          <h2 className="loading-title">{title}</h2>
          <div className="loading-progress">
            {steps.map((step) => (
              <div key={step} className="loading-progress-item">
                <span className="loading-progress-status" />
                <span className="text-[var(--text-secondary)]">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingOverlay
