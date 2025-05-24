import React, { useState } from 'react';
import { AddChildForm } from '../features/children/components/AddChildForm';
import type { ChildFormData } from '../features/children/types';

export function ManageChildrenPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<ChildFormData[]>([]);

  const handleAddChild = async (data: ChildFormData) => {
    setIsLoading(true);
    try {
      // TODO: Add API call to save child data
      setChildren((prev) => [...prev, data]);
      // Show success message
    } catch (error) {
      // Show error message
      console.error('Failed to add child:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Add Your Children
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Add your children's details to get started with their reading journey.
          </p>
        </div>

        <AddChildForm onSubmit={handleAddChild} isLoading={isLoading} />

        {children.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Added Children
            </h2>
            <div className="space-y-4">
              {children.map((child, index) => (
                <div
                  key={index}
                  className="bg-white shadow rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {child.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Age: {child.age}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      Reading Interests
                    </h4>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {child.readingInterests.map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      Reward Preferences
                    </h4>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {child.rewardPreferences.map((reward) => (
                        <span
                          key={reward}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {reward}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 