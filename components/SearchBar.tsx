'use client'

import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const SEARCH_DEBOUNCE_MS = 300

const SearchBar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (value) {
        params.set('q', value)
      } else {
        params.delete('q')
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, pathname])

  return (
    <div className="library-search-wrapper">
      <Search className="icon-sm ml-3 text-[var(--text-muted)]" />
      <input
        type="text"
        placeholder="Search by title or author..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="library-search-input"
        aria-label="Search books by title or author"
      />
    </div>
  )
}

export default SearchBar
