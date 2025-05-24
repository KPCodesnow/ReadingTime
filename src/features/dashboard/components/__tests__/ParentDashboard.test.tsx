import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ParentDashboard } from '../ParentDashboard';
import { AuthProvider } from '../../../auth/context/AuthContext';

const mockChildren = [
  {
    id: '1',
    username: 'Alice',
    age: 8,
    readingLevel: 'intermediate',
    currentAssignments: [
      {
        id: 'a1',
        bookId: 'b1',
        currentPage: 25,
        pageCount: 100,
        title: 'Magic Tree House',
        dueDate: new Date('2024-02-01'),
        status: 'in_progress' as const,
      },
    ],
    recentProgress: [
      {
        date: '2024-01-15',
        pagesRead: 10,
        minutesSpent: 20,
      },
    ],
    readingStreak: 5,
    totalBooksCompleted: 3,
  },
  {
    id: '2',
    username: 'Bob',
    age: 10,
    readingLevel: 'advanced',
    currentAssignments: [],
    recentProgress: [],
    readingStreak: 0,
    totalBooksCompleted: 1,
  },
];

const mockBooks = [
  {
    id: 'b1',
    title: 'Magic Tree House',
    author: 'Mary Pope Osborne',
    coverUrl: 'https://example.com/cover.jpg',
    pageCount: 100,
    readingLevel: 'intermediate',
  },
];

describe('ParentDashboard', () => {
  it('renders children overview cards', () => {
    render(
      <AuthProvider>
        <ParentDashboard children={mockChildren} books={mockBooks} />
      </AuthProvider>
    );

    expect(screen.getByTestId('child-card-1')).toHaveTextContent('Alice');
    expect(screen.getByTestId('child-card-2')).toHaveTextContent('Bob');
    expect(screen.getByText('5 day streak')).toBeInTheDocument();
    expect(screen.getByText('3 books completed')).toBeInTheDocument();
  });

  it('shows reading progress for each child', () => {
    render(
      <AuthProvider>
        <ParentDashboard children={mockChildren} books={mockBooks} />
      </AuthProvider>
    );

    const aliceCard = screen.getByTestId('child-card-1');
    expect(aliceCard).toHaveTextContent('25% complete');
    expect(aliceCard).toHaveTextContent('Magic Tree House');
    expect(aliceCard).toHaveTextContent('Due: Feb 1, 2024');
  });

  it('allows assigning new books', async () => {
    const onAssignBook = vi.fn();
    render(
      <AuthProvider>
        <ParentDashboard 
          children={mockChildren} 
          books={mockBooks} 
          onAssignBook={onAssignBook} 
        />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('assign-book-button-2'));
    
    await waitFor(() => {
      expect(screen.getByTestId('book-assignment-modal')).toBeInTheDocument();
    });
  });

  it('shows reading activity timeline', () => {
    render(
      <AuthProvider>
        <ParentDashboard children={mockChildren} books={mockBooks} />
      </AuthProvider>
    );

    const timeline = screen.getByTestId('reading-timeline');
    expect(timeline).toHaveTextContent('Jan 15, 2024');
    expect(timeline).toHaveTextContent('10 pages');
    expect(timeline).toHaveTextContent('20 minutes');
  });

  it('displays achievement badges', () => {
    render(
      <AuthProvider>
        <ParentDashboard children={mockChildren} books={mockBooks} />
      </AuthProvider>
    );

    const badges = screen.getByTestId('achievement-badges');
    expect(badges).toHaveTextContent('5 Day Streak');
    expect(badges).toHaveTextContent('3 Books Read');
  });

  it('shows reading level progress', () => {
    render(
      <AuthProvider>
        <ParentDashboard children={mockChildren} books={mockBooks} />
      </AuthProvider>
    );

    expect(screen.getByTestId('reading-level-1')).toHaveTextContent('intermediate');
    expect(screen.getByTestId('reading-level-2')).toHaveTextContent('advanced');
  });
}); 