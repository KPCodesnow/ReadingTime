import type { Book, BookSearchResponse } from '../types';

const GOOGLE_BOOKS_API_KEY = process.env.VITE_GOOGLE_BOOKS_API_KEY;
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export async function searchBooks(query: string): Promise<Book[]> {
  const params = new URLSearchParams({
    q: query,
    key: GOOGLE_BOOKS_API_KEY || '',
    maxResults: '20',
    printType: 'books',
    langRestrict: 'en',
  });

  const response = await fetch(`${GOOGLE_BOOKS_API_URL}?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }

  const data: BookSearchResponse = await response.json();

  return data.items.map(item => ({
    id: item.id,
    title: item.volumeInfo.title,
    authors: item.volumeInfo.authors,
    description: item.volumeInfo.description,
    imageUrl: item.volumeInfo.imageLinks?.thumbnail,
    pageCount: item.volumeInfo.pageCount,
    categories: item.volumeInfo.categories,
    averageRating: item.volumeInfo.averageRating,
    ratingsCount: item.volumeInfo.ratingsCount,
    retailPrice: item.saleInfo?.retailPrice?.amount,
    previewLink: item.volumeInfo.previewLink,
    publishedDate: item.volumeInfo.publishedDate,
    publisher: item.volumeInfo.publisher,
    language: item.volumeInfo.language,
    isbn: item.volumeInfo.industryIdentifiers?.find(id => 
      id.type === 'ISBN_13' || id.type === 'ISBN_10'
    )?.identifier,
  }));
} 