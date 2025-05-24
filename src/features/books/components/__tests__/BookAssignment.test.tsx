import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookAssignment } from '../BookAssignment';
import { AuthProvider } from '../../../auth/context/AuthContext';

const mockChildren = [
  { id: '1', username: 'child1', age: 8, readingLevel: 'intermediate' },
  { id: '2', username: 'child2', age: 10, readingLevel: 'advanced' },
];

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

describe('BookAssignment', () => {
  it('renders book assignment form with child selection', () => {
    render(
      <AuthProvider>
        <BookAssignment book={mockBook} children={mockChildren} onAssign={() => {}} />
      </AuthProvider>
    );

    expect(screen.getByText(mockBook.title)).toBeInTheDocument();
    expect(screen.getByLabelText(/select child/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /assign book/i })).toBeInTheDocument();
  });

  it('handles book assignment submission', async () => {
    const onAssign = vi.fn();
    render(
      <AuthProvider>
        <BookAssignment book={mockBook} children={mockChildren} onAssign={onAssign} />
      </AuthProvider>
    );

    // Select a child
    fireEvent.change(screen.getByLabelText(/select child/i), {
      target: { value: mockChildren[0].id },
    });

    // Set due date (2 weeks from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: dueDate.toISOString().split('T')[0] },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /assign book/i }));

    await waitFor(() => {
      expect(onAssign).toHaveBeenCalledWith({
        bookId: mockBook.id,
        childId: mockChildren[0].id,
        dueDate: expect.any(Date),
      });
    });
  });

  it('validates required fields', async () => {
    render(
      <AuthProvider>
        <BookAssignment book={mockBook} children={mockChildren} onAssign={() => {}} />
      </AuthProvider>
    );

    // Submit without selecting child or due date
    fireEvent.click(screen.getByRole('button', { name: /assign book/i }));

    await waitFor(() => {
      expect(screen.getByText(/please select a child/i)).toBeInTheDocument();
      expect(screen.getByText(/due date is required/i)).toBeInTheDocument();
    });
  });

  it('shows reading level mismatch warning', async () => {
    render(
      <AuthProvider>
        <BookAssignment book={mockBook} children={mockChildren} onAssign={() => {}} />
      </AuthProvider>
    );

    // Select child with different reading level
    fireEvent.change(screen.getByLabelText(/select child/i), {
      target: { value: mockChildren[1].id },
    });

    await waitFor(() => {
      expect(screen.getByText(/reading level mismatch/i)).toBeInTheDocument();
    });
  });
}); 