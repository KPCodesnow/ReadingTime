import React, { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { AddChildForm } from '../components/AddChildForm';
import type { ChildFormData } from '../types';

export function ManageChildrenPage() {
  const { childAccounts, addChild, resetChildPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [lastCreatedAccount, setLastCreatedAccount] = useState<{ email: string; password: string } | null>(null);
  const [resetPasswordResult, setResetPasswordResult] = useState<{ email: string; password: string } | null>(null);

  const handleAddChild = async (data: ChildFormData) => {
    setIsLoading(true);
    try {
      const newAccount = await addChild(data);
      setLastCreatedAccount(newAccount);
      setShowAddChildForm(false);
    } catch (error) {
      console.error('Failed to add child:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (childEmail: string) => {
    try {
      const result = await resetChildPassword(childEmail);
      setResetPasswordResult(result);
      // Clear the reset password result after 30 seconds
      setTimeout(() => setResetPasswordResult(null), 30000);
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manage Children
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage your children's profiles
            </p>
          </div>
          <button
            onClick={() => setShowAddChildForm(!showAddChildForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {showAddChildForm ? 'Cancel' : '+ Add New Child'}
          </button>
        </div>

        {(lastCreatedAccount || resetPasswordResult) && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">
              {lastCreatedAccount ? 'New child account created:' : 'Password has been reset:'}
            </span>
            <div className="mt-2">
              <p>Email: {lastCreatedAccount?.email || resetPasswordResult?.email}</p>
              <p>Password: {lastCreatedAccount?.password || resetPasswordResult?.password}</p>
              <p className="text-sm mt-1">Please save these credentials - you won't be able to see the password again!</p>
            </div>
            <button
              className="absolute top-0 right-0 px-4 py-3"
              onClick={() => {
                setLastCreatedAccount(null);
                setResetPasswordResult(null);
              }}
            >
              <span className="sr-only">Dismiss</span>
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        )}

        {childAccounts.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {childAccounts.map((child) => (
                <li key={child.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="text-lg font-medium text-blue-600 truncate">
                          {child.email.split('@')[0].replace('.', ' ')}
                        </div>
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="truncate">{child.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => handleResetPassword(child.email)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Reset Password
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View Progress
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">No Children Added Yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Click the "Add New Child" button to add your first child.
            </p>
          </div>
        )}

        {showAddChildForm && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Add New Child
            </h2>
            <AddChildForm onSubmit={handleAddChild} isLoading={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
} 