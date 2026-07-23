import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getBookBySlug } from '@/lib/actions/book.actions'
import VapiControls from '@/components/VapiControls'

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  await auth.protect()

  const { slug } = await params
  const result = await getBookBySlug(slug)

  if (!result.success || !result.data) redirect('/')

  const book = result.data

  return (
    <div className="book-page-container">
      <Link href="/" className="back-btn-floating" aria-label="Go back">
        <ArrowLeft className="size-5 text-[var(--text-primary)]" />
      </Link>

      <div className="vapi-main-container gap-6">
        <VapiControls book={book} />
      </div>
    </div>
  )
}

export default Page
