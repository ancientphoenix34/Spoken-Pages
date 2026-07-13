import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Mic, MicOff } from 'lucide-react'
import { getBookBySlug } from '@/lib/actions/book.actions'
import { getVoice } from '@/lib/utils'

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { userId } = await auth()
  if (!userId) redirect('/')

  const { slug } = await params
  const result = await getBookBySlug(slug)

  if (!result.success || !result.data) redirect('/')

  const book = result.data
  const voice = getVoice(book.persona)

  return (
    <div className="book-page-container">
      <Link href="/" className="back-btn-floating" aria-label="Go back">
        <ArrowLeft className="size-5 text-[var(--text-primary)]" />
      </Link>

      <div className="vapi-main-container gap-6">
        <div className="vapi-header-card w-full">
          <div className="vapi-cover-wrapper">
            <Image
              src={book.coverURL}
              alt={book.title}
              width={120}
              height={180}
              className="vapi-cover-image"
            />
            <div className="vapi-mic-wrapper">
              <button type="button" className="vapi-mic-btn" aria-label="Toggle microphone">
                <MicOff className="size-5 text-[#212a3b]" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#212a3b]">
                {book.title}
              </h1>
              <p className="text-[#3d485e] mt-1">by {book.author}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="vapi-status-indicator">
                <span className="vapi-status-dot vapi-status-dot-ready" />
                <span className="vapi-status-text">Ready</span>
              </div>
              <div className="vapi-status-indicator">
                <span className="vapi-status-text">Voice: {voice.name}</span>
              </div>
              <div className="vapi-status-indicator">
                <span className="vapi-status-text">0:00/15:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="transcript-container min-h-[400px] w-full">
          <div className="transcript-empty">
            <Mic className="size-12 text-[var(--text-muted)] mb-4" />
            <p className="transcript-empty-text">No conversation yet</p>
            <p className="transcript-empty-hint">Click the mic button above to start talking</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
