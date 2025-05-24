import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Book } from '../types';
import type { ChildUser } from '../../../types/user';

interface BookAssignmentProps {
  book: Book;
  children: ChildUser[];
  onAssign: (data: BookAssignmentData) => void;
}

interface BookAssignmentData {
  bookId: string;
  childId: string;
  dueDate: Date;
}

const assignmentSchema = z.object({
  childId: z.string().min(1, 'Please select a child'),
  dueDate: z.string().min(1, 'Due date is required').transform((date) => new Date(date)),
});

export function BookAssignment({ book, children, onAssign }: BookAssignmentProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(assignmentSchema),
  });

  const selectedChildId = watch('childId');
  const selectedChild = children.find((child) => child.id === selectedChildId);
  const hasReadingLevelMismatch = selectedChild && selectedChild.readingLevel !== book.readingLevel;

  const onSubmit = (data: z.infer<typeof assignmentSchema>) => {
    onAssign({
      bookId: book.id,
      childId: data.childId,
      dueDate: data.dueDate,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <img
          src={book.coverUrl}
          alt={`Cover of ${book.title}`}
          className="h-32 w-24 object-cover rounded"
        />
        <div>
          <h3 className="text-lg font-semibold">{book.title}</h3>
          <p className="text-sm text-gray-600">by {book.author}</p>
          <p className="text-sm text-gray-600">
            {book.pageCount} pages • {book.readingLevel} level
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="childId" className="block text-sm font-medium text-gray-700">
            Select Child
          </label>
          <select
            id="childId"
            {...register('childId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value="">Select a child...</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.username} ({child.age} years old)
              </option>
            ))}
          </select>
          {errors.childId && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.childId.message}
            </p>
          )}
          {hasReadingLevelMismatch && (
            <p className="mt-1 text-sm text-amber-600" role="alert">
              Reading level mismatch: This book may be too {selectedChild.readingLevel === 'advanced' ? 'easy' : 'difficult'} for {selectedChild.username}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            {...register('dueDate')}
            min={new Date().toISOString().split('T')[0]}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.dueDate.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-2 px-4"
        >
          Assign Book
        </button>
      </form>
    </div>
  );
} 