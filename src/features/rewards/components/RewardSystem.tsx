import React, { useState } from 'react';
import type { ChildUser } from '../../../types/user';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  type: 'screen_time' | 'choice' | 'item';
  duration?: number;
}

interface RewardSystemProps {
  child: ChildUser & { points: number };
  rewards: Reward[];
  onRedeemReward: (data: { childId: string; rewardId: string }) => void;
}

export function RewardSystem({ child, rewards, onRedeemReward }: RewardSystemProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
  };

  const handleConfirmRedemption = () => {
    if (selectedReward) {
      onRedeemReward({
        childId: child.id,
        rewardId: selectedReward.id,
      });
      setSelectedReward(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rewards</h2>
        <div className="text-lg font-semibold text-primary" data-testid="points-balance">
          {child.points} points available
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const canAfford = child.points >= reward.pointsCost;
          return (
            <div
              key={reward.id}
              className="reward-card p-4 rounded-lg border border-gray-200"
              data-testid={`reward-${reward.id}`}
              style={{ opacity: canAfford ? 1 : 0.75 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{reward.title}</h3>
                  <p className="text-sm text-gray-600">{reward.description}</p>
                </div>
                <div className="text-primary font-medium">{reward.pointsCost} pts</div>
              </div>

              {reward.type === 'screen_time' && reward.duration && (
                <div className="mt-2 text-sm text-gray-600">
                  Duration: {reward.duration} minutes
                </div>
              )}

              <div className="mt-4">
                {!canAfford && (
                  <p className="text-sm text-red-600 mb-2" data-testid="insufficient-points-message">
                    Not enough points
                  </p>
                )}
                <button
                  onClick={() => handleRedeemClick(reward)}
                  disabled={!canAfford}
                  data-testid={`redeem-button-${reward.id}`}
                  className={`w-full py-2 px-4 rounded-md ${
                    canAfford
                      ? 'btn-primary'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Redeem
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedReward && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          data-testid="confirmation-dialog"
        >
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold">Confirm Redemption</h3>
            <div className="mt-4">
              <p className="font-medium">{selectedReward.title}</p>
              <p className="text-sm text-gray-600 mt-1">{selectedReward.description}</p>
              <p className="text-sm text-primary mt-2">
                {selectedReward.pointsCost} points will be deducted from your balance
              </p>
            </div>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleConfirmRedemption}
                className="btn-primary flex-1 py-2"
                data-testid="confirm-redemption"
              >
                Confirm
              </button>
              <button
                onClick={() => setSelectedReward(null)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
                data-testid="cancel-redemption"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 