import React, { useState } from 'react';
import { BookSearch } from '../features/books/components/BookSearch';
import { useWishlist } from '../features/books/hooks/useWishlist';
import type { Book } from '../features/books/types';

export function BooksPage() {
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Book Discovery
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Find and save books for your children's reading journey.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Search Books
              </h2>
              
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Range
                  </label>
                  <select
                    value={selectedAgeRange}
                    onChange={(e) => setSelectedAgeRange(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Ages</option>
                    <option value="4-8">4-8 years</option>
                    <option value="9-12">9-12 years</option>
                    <option value="13-16">13-16 years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interests
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'fantasy', 'science', 'history', 'adventure',
                      'mystery', 'animals', 'sports', 'technology'
                    ].map((interest) => (
                      <label
                        key={interest}
                        className="inline-flex items-center"
                      >
                        <input
                          type="checkbox"
                          checked={selectedInterests.includes(interest)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInterests((prev) => [...prev, interest]);
                            } else {
                              setSelectedInterests((prev) =>
                                prev.filter((i) => i !== interest)
                              );
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {interest}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <BookSearch
                selectedAgeRange={selectedAgeRange}
                selectedInterests={selectedInterests}
                onAddToWishlist={addToWishlist}
              />
            </div>
          </div>

          {/* Wishlist sidebar */}
          <div className="lg:w-80">
            <div className="bg-white shadow rounded-lg p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                My Book Wishlist
              </h2>

              {wishlist.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Your wishlist is empty. Add books to save them for later.
                </p>
              ) : (
                <div className="space-y-4">
                  {wishlist.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-start space-x-4 p-3 bg-gray-50 rounded-md"
                    >
                      <img
                        src={book.imageUrl || '/placeholder-book.png'}
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {book.title}
                        </h4>
                        {book.authors && (
                          <p className="text-xs text-gray-500 mt-1">
                            by {book.authors[0]}
                          </p>
                        )}
                        <button
                          onClick={() => removeFromWishlist(book.id)}
                          className="mt-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 