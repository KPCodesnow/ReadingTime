import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Book } from '../../books/types';
import type { ReadingAssignment } from '../../books/types';

interface ReadingProgressProps {
  assignment: ReadingAssignment;
  book: Book;
  onProgressUpdate: (data: ProgressUpdateData) => void;
}

interface ProgressUpdateData {
  assignmentId: string;
  pagesRead: number;
  minutesSpent: number;
  notes?: string;
}

const progressSchema = z.object({
  pagesRead: z.number()
    .min(1, 'Pages must be greater than 0')
    .max(1000, 'Pages seems too high'),
  minutesSpent: z.number()
    .min(1, 'Reading time must be at least 1 minute')
    .max(480, 'Reading time cannot exceed 8 hours'),
  notes: z.string().optional(),
});

export function ReadingProgress({ assignment, book, onProgressUpdate }: ReadingProgressProps) {
  const [showCompletion, setShowCompletion] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<z.infer<typeof progressSchema>>({
    resolver: zodResolver(progressSchema),
  });

  const pagesRead = watch('pagesRead');
  const wouldComplete = (assignment.currentPage + (pagesRead || 0)) >= book.pageCount;

  const onSubmit = (data: z.infer<typeof progressSchema>) => {
    const willComplete = assignment.currentPage + data.pagesRead >= book.pageCount;
    if (willComplete) {
      setShowCompletion(true);
    }
    onProgressUpdate({
      assignmentId: assignment.id,
      pagesRead: data.pagesRead,
      minutesSpent: data.minutesSpent,
      notes: data.notes,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-start space-x-4">
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            className="h-32 w-24 object-cover rounded"
          />
          <div>
            <h3 className="text-lg font-semibold">{book.title}</h3>
            <p className="text-sm text-gray-600">by {book.author}</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm">
                Current page: {assignment.currentPage} of {book.pageCount}
              </p>
              <p className="text-sm">
                Time spent: {assignment.minutesRead} minutes
              </p>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                <div
                  className="h-2 bg-primary rounded-full"
                  style={{
                    width: `${(assignment.currentPage / book.pageCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="pagesRead" className="block text-sm font-medium text-gray-700">
                Pages Read
              </label>
              <input
                type="number"
                id="pagesRead"
                {...register('pagesRead', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
              {errors.pagesRead && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.pagesRead.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="minutesSpent" className="block text-sm font-medium text-gray-700">
                Minutes Spent
              </label>
              <input
                type="number"
                id="minutesSpent"
                {...register('minutesSpent', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
              {errors.minutesSpent && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.minutesSpent.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="What did you think about what you read?"
            />
          </div>

          {wouldComplete && !showCompletion && (
            <div className="p-4 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-800">
                You're about to finish the book! Make sure you've understood everything before marking it as complete.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full py-2 px-4"
          >
            Update Progress
          </button>
        </form>
      </div>

      {showCompletion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-primary">Congratulations! 🎉</h3>
            <p className="mt-2">You've finished the book!</p>
            <p className="mt-1 text-sm text-gray-600">
              Great job completing "{book.title}"
            </p>
            <button
              onClick={() => setShowCompletion(false)}
              className="mt-4 btn-primary w-full py-2"
            >
              Continue Reading Journey
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 