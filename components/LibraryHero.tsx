import { Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const steps = [
  { title: 'Upload PDF', description: 'Add your book file' },
  { title: 'AI Processing', description: 'We analyze the content' },
  { title: 'Voice Chat', description: 'Discuss with AI' },
]


const LibraryHero = () => {
  return (
    <section className="library-hero-card mb-10 md:mb-16">
      <div className="library-hero-content">
        <div className="library-hero-text">
          <h1 className="library-hero-title">Your Library</h1>
          <p className="library-hero-description">
            Convert your books into interactive AI conversations. Listen,
            learn, and discuss your favorite reads.
          </p>
          <Link href="/books/new" className="library-cta-primary">
            <Plus className="icon-sm" />
            Add new book
          </Link>

          <div className="library-hero-illustration">
            <Image
              src="/assets/hero-illustration.png"
              alt="Vintage books, globe, and reading lamp"
              width={491}
              height={352}
              className="w-full max-w-[320px] h-auto"
              priority
            />
          </div>
        </div>

        <div className="library-hero-illustration-desktop">
          <Image
            src="/assets/hero-illustration.png"
            alt="Vintage books, globe, and reading lamp"
            width={491}
            height={352}
            className="w-full h-auto"
            priority
          />
        </div>

        <ol className="library-steps-card w-full space-y-4 lg:w-[260px] lg:shrink-0">
          {steps.map((step, index) => (
            <li key={step.title} className="library-step-item">
              <span className="library-step-number">{index + 1}</span>
              <div>
                <p className="library-step-title">{step.title}</p>
                <p className="library-step-description">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default LibraryHero
