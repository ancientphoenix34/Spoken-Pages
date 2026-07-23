import BookCard from '@/components/BookCard'
import LibraryHero from '@/components/LibraryHero'
import SearchBar from '@/components/SearchBar'
import { searchBooks } from '@/lib/actions/book.actions'
export const dynamic='force-dynamic';

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

const Page = async ({ searchParams }: PageProps) => {

  const { q } = await searchParams;
  const query = q ?? '';

  const bookResults= await searchBooks(query);
  const books=bookResults.success ? bookResults.data??[]:[]

  return (
    <div className="wrapper container">
      <LibraryHero />

      <div className='library-books-header'>
        <h2 className='library-books-heading'>Recent Books</h2>
        <SearchBar />
      </div>

      {books.length > 0 ? (
        <div className='library-books-grid'>
           { books.map((book)=>(
            <BookCard key={book._id} title={book.title} author={book.author} coverURL={book.coverURL} slug={book.slug}/>
           ))}
        </div>
      ) : (
        <p className='library-empty-text'>No books found{query ? ` for "${query}"` : ''}.</p>
      )}
    </div>
  )
}

export default Page
