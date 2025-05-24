import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Book } from '../types';

const WISHLIST_STORAGE_KEY = 'reading-time-wishlist';

// Helper functions for localStorage
const getStoredWishlist = (): Book[] => {
  const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const setStoredWishlist = (wishlist: Book[]) => {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
};

export function useWishlist() {
  const queryClient = useQueryClient();

  // Query for getting wishlist
  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: getStoredWishlist,
    staleTime: Infinity, // Data doesn't become stale since we update it manually
  });

  // Mutation for adding to wishlist
  const { mutate: addToWishlist } = useMutation({
    mutationFn: async (book: Book) => {
      const currentWishlist = getStoredWishlist();
      if (!currentWishlist.some(b => b.id === book.id)) {
        const newWishlist = [...currentWishlist, book];
        setStoredWishlist(newWishlist);
        return newWishlist;
      }
      return currentWishlist;
    },
    onSuccess: (newWishlist) => {
      queryClient.setQueryData(['wishlist'], newWishlist);
    },
  });

  // Mutation for removing from wishlist
  const { mutate: removeFromWishlist } = useMutation({
    mutationFn: async (bookId: string) => {
      const currentWishlist = getStoredWishlist();
      const newWishlist = currentWishlist.filter(book => book.id !== bookId);
      setStoredWishlist(newWishlist);
      return newWishlist;
    },
    onSuccess: (newWishlist) => {
      queryClient.setQueryData(['wishlist'], newWishlist);
    },
  });

  // Check if a book is in wishlist
  const isInWishlist = (bookId: string) => {
    return wishlist.some(book => book.id === bookId);
  };

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };
} 