import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReadingProgress } from '../ReadingProgress';
import { AuthProvider } from '../../../auth/context/AuthContext';

const mockAssignment = {
  id: '1',
  bookId: '1',
  childId: '1',
  assignedById: 'parent1',
  assignedAt: new Date('2024-01-01'),
  dueDate: new Date('2024-01-15'),
  status: 'in_progress' as const,
  currentPage: 25,
  minutesRead: 45,
  lastReadAt: new Date('2024-01-05'),
};

const mockBook = {
  id: '1',
  title: 'The Magic Tree House',
  author: 'Mary Pope Osborne',
  coverUrl: 'https://example.com/cover.jpg',
  description: 'A magical adventure',
  pageCount: 80,
  readingLevel: 'intermediate',
  genres: ['fantasy', 'adventure'],
};

describe('ReadingProgress', () => {
  it('renders reading progress form with current status', () => {
    render(
      <AuthProvider>
        <ReadingProgress assignment={mockAssignment} book={mockBook} onProgressUpdate={() => {}} />
      </AuthProvider>
    );

    expect(screen.getByText(/current page: 25 of 80/i)).toBeInTheDocument();
    expect(screen.getByText(/time spent: 45 minutes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pages read/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minutes spent/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update progress/i })).toBeInTheDocument();
  });

  it('handles progress update submission', async () => {
    const onProgressUpdate = vi.fn();
    render(
      <AuthProvider>
        <ReadingProgress 
          assignment={mockAssignment} 
          book={mockBook} 
          onProgressUpdate={onProgressUpdate} 
        />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/pages read/i), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/minutes spent/i), {
      target: { value: '20' },
    });
    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: 'Really enjoyed the adventure part!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update progress/i }));

    await waitFor(() => {
      expect(onProgressUpdate).toHaveBeenCalledWith({
        assignmentId: mockAssignment.id,
        pagesRead: 10,
        minutesSpent: 20,
        notes: 'Really enjoyed the adventure part!',
      });
    });
  });

  it('validates input values', async () => {
    render(
      <AuthProvider>
        <ReadingProgress 
          assignment={mockAssignment} 
          book={mockBook} 
          onProgressUpdate={() => {}} 
        />
      </AuthProvider>
    );

    // Try to submit with invalid values
    fireEvent.change(screen.getByLabelText(/pages read/i), {
      target: { value: '-1' },
    });
    fireEvent.change(screen.getByLabelText(/minutes spent/i), {
      target: { value: '0' },
    });
    fireEvent.click(screen.getByRole('button', { name: /update progress/i }));

    await waitFor(() => {
      expect(screen.getByText(/pages must be greater than 0/i)).toBeInTheDocument();
      expect(screen.getByText(/reading time must be at least 1 minute/i)).toBeInTheDocument();
    });
  });

  it('shows completion celebration when book is finished', async () => {
    const almostDoneAssignment = {
      ...mockAssignment,
      currentPage: 75,
    };

    render(
      <AuthProvider>
        <ReadingProgress 
          assignment={almostDoneAssignment} 
          book={mockBook} 
          onProgressUpdate={() => {}} 
        />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/pages read/i), {
      target: { value: '5' },
    });
    fireEvent.change(screen.getByLabelText(/minutes spent/i), {
      target: { value: '15' },
    });
    fireEvent.click(screen.getByRole('button', { name: /update progress/i }));

    await waitFor(() => {
      expect(screen.getByText(/congratulations/i)).toBeInTheDocument();
      expect(screen.getByText(/you've finished the book/i)).toBeInTheDocument();
    });
  });
}); 