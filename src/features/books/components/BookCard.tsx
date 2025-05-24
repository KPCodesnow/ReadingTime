import React from 'react';
import { useWishlist } from '../hooks/useWishlist';
import type { Book } from '../types';

interface BookCardProps {
  book: Book;
  onAddToWishlist: () => void;
}

export function BookCard({ book, onAddToWishlist }: BookCardProps) {
  const { isInWishlist } = useWishlist();
  const bookInWishlist = isInWishlist(book.id);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="aspect-w-3 aspect-h-4 relative">
        <img
          src={book.imageUrl || '/placeholder-book.png'}
          alt={book.title}
          className="object-cover w-full h-full"
        />
        {book.averageRating && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-sm font-medium flex items-center">
            <span className="mr-1">⭐</span>
            {book.averageRating.toFixed(1)}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          by {book.authors?.join(', ')}
        </p>
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <span className="mr-2">📖</span>
          {book.pageCount} pages
        </div>

        {book.categories?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {book.categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3">
          {book.retailPrice ? (
            <div className="text-lg font-semibold text-gray-900">
              ${book.retailPrice.toFixed(2)}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Price not available
            </div>
          )}
        </div>

        {book.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-3">
            {book.description}
          </p>
        )}

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={onAddToWishlist}
            disabled={bookInWishlist}
            className={`${
              bookInWishlist
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } px-4 py-2 rounded-md text-sm font-medium transition-colors`}
          >
            {bookInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
          </button>
          
          <a
            href={book.previewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Preview →
          </a>
        </div>
      </div>
    </div>
  );
} 