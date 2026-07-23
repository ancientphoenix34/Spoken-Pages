'use client'

import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const SearchBar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="library-search-wrapper">
      <Search className="icon-sm ml-3 text-[var(--text-muted)]" />
      <input
        type="text"
        placeholder="Search by title or author..."
        defaultValue={searchParams.get('q') ?? ''}
        onChange={handleChange}
        className="library-search-input"
        aria-label="Search books by title or author"
      />
    </div>
  )
}

export default SearchBar
