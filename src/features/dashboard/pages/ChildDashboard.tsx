import React from 'react';
import { useAuth } from '../../auth/context/AuthContext';

export function ChildDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-blue-600">
            Welcome back, {user?.username}! 📚
          </h2>
          <p className="mt-2 text-gray-600">
            Ready for another reading adventure?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Current Book
            </h3>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No book currently assigned</p>
              <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                Start Reading
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Reading Rewards 🌟
            </h3>
            <div className="mt-4 space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">
                  No rewards available yet
                </p>
                <p className="mt-1 text-sm text-yellow-600">
                  Complete your reading goals to earn rewards!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Reading Progress 📈
          </h3>
          <div className="mt-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    0%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  style={{ width: '0%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Reading Achievements 🏆
          </h3>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">📖</div>
              <p className="text-sm font-medium text-gray-900">Books Read</p>
              <p className="text-xl font-bold text-blue-600">0</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <p className="text-sm font-medium text-gray-900">Rewards Earned</p>
              <p className="text-xl font-bold text-blue-600">0</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⏱️</div>
              <p className="text-sm font-medium text-gray-900">Reading Time</p>
              <p className="text-xl font-bold text-blue-600">0 mins</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 