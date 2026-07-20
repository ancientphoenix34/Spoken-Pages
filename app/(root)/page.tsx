import BookCard from '@/components/BookCard'
import LibraryHero from '@/components/LibraryHero'
import { getAllBooks } from '@/lib/actions/book.actions'

const Page = async () => {

  const bookResults= await getAllBooks();
  
  const books=bookResults.success ? bookResults.data??[]:[] 
  return (
    <div className="wrapper container">
      <LibraryHero />

      <div className='library-books-grid'>
         { books.map((book)=>(
          <BookCard key={book._id} title={book.title} author={book.author} coverURL={book.coverURL} slug={book.slug}/>
         ))}
      </div>
    </div>
  )
}

export default Page
