export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  pageCount: number;
  readingLevel: string;
  genres: string[];
  isbn?: string;
}

export interface ReadingAssignment {
  id: string;
  bookId: string;
  childId: string;
  assignedById: string;
  assignedAt: Date;
  dueDate: Date;
  status: 'not_started' | 'in_progress' | 'completed';
  currentPage: number;
  minutesRead: number;
  lastReadAt?: Date;
}

export interface ReadingProgress {
  id: string;
  assignmentId: string;
  date: Date;
  pagesRead: number;
  minutesSpent: number;
  notes?: string;
}

export interface ReadingGoal {
  id: string;
  childId: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  metric: 'pages' | 'minutes' | 'books';
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'failed';
} 