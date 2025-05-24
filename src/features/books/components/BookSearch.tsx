import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchBooks } from '../api/googleBooks';
import { BookCard } from './BookCard';
import type { Book } from '../types';

interface BookSearchProps {
  selectedAgeRange?: string;
  selectedInterests?: string[];
  onAddToWishlist: (book: Book) => void;
}

export function BookSearch({ 
  selectedAgeRange, 
  selectedInterests, 
  onAddToWishlist 
}: BookSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Construct search query based on age range and interests
  const constructSearchQuery = () => {
    let query = searchTerm;
    if (selectedInterests?.length) {
      query += ` subject:${selectedInterests.join(' OR subject:')}`;
    }
    if (selectedAgeRange) {
      // Map age ranges to reading levels
      const readingLevel = selectedAgeRange === '4-8' ? 'early reader' :
        selectedAgeRange === '9-12' ? 'middle grade' : 'young adult';
      query += ` ${readingLevel}`;
    }
    return query;
  };

  const { data: books, isLoading, error } = useQuery({
    queryKey: ['books', searchTerm, selectedAgeRange, selectedInterests],
    queryFn: () => searchBooks(constructSearchQuery()),
    enabled: Boolean(searchTerm || selectedInterests?.length),
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search books by title, author, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-md">
          Error loading books. Please try again.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books?.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onAddToWishlist={() => onAddToWishlist(book)}
          />
        ))}
      </div>

      {books?.length === 0 && searchTerm && (
        <div className="text-center text-gray-500">
          No books found. Try adjusting your search terms.
        </div>
      )}
    </div>
  );
} 