export interface Book {
  id: string;
  title: string;
  authors?: string[];
  description?: string;
  imageUrl?: string;
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  retailPrice?: number;
  previewLink?: string;
  publishedDate?: string;
  publisher?: string;
  language?: string;
  isbn?: string;
}

export interface BookSearchResponse {
  items: GoogleBookItem[];
  totalItems: number;
}

interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail: string;
      smallThumbnail: string;
    };
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    previewLink?: string;
    publishedDate?: string;
    publisher?: string;
    language?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
  saleInfo?: {
    listPrice?: {
      amount: number;
      currencyCode: string;
    };
    retailPrice?: {
      amount: number;
      currencyCode: string;
    };
  };
} 