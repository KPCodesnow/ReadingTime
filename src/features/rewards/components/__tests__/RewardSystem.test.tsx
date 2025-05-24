import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RewardSystem } from '../RewardSystem';
import { AuthProvider } from '../../../auth/context/AuthContext';

const mockChild = {
  id: '1',
  username: 'child1',
  age: 8,
  readingLevel: 'intermediate',
  interests: ['fantasy', 'adventure'],
  rewards: [],
  points: 100,
};

const mockRewards = [
  {
    id: '1',
    title: 'Extra Screen Time',
    description: '30 minutes of extra screen time',
    pointsCost: 50,
    type: 'screen_time',
    duration: 30,
  },
  {
    id: '2',
    title: 'Choose Dinner',
    description: 'Pick what to have for dinner',
    pointsCost: 75,
    type: 'choice',
  },
  {
    id: '3',
    title: 'New Book',
    description: 'Get a new book of your choice',
    pointsCost: 150,
    type: 'item',
  },
];

describe('RewardSystem', () => {
  it('renders available rewards and points balance', () => {
    render(
      <AuthProvider>
        <RewardSystem child={mockChild} rewards={mockRewards} onRedeemReward={() => {}} />
      </AuthProvider>
    );

    expect(screen.getByTestId('points-balance')).toHaveTextContent('100 points available');
    expect(screen.getByTestId('reward-1')).toHaveTextContent('Extra Screen Time');
    expect(screen.getByTestId('reward-2')).toHaveTextContent('Choose Dinner');
    expect(screen.getByTestId('reward-3')).toHaveTextContent('New Book');
  });

  it('handles reward redemption', async () => {
    const onRedeemReward = vi.fn();
    render(
      <AuthProvider>
        <RewardSystem child={mockChild} rewards={mockRewards} onRedeemReward={onRedeemReward} />
      </AuthProvider>
    );

    // Try to redeem the "Extra Screen Time" reward
    fireEvent.click(screen.getByTestId('redeem-button-1'));

    await waitFor(() => {
      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('confirm-redemption'));

    await waitFor(() => {
      expect(onRedeemReward).toHaveBeenCalledWith({
        childId: mockChild.id,
        rewardId: mockRewards[0].id,
      });
    });
  });

  it('disables rewards that cost too many points', () => {
    render(
      <AuthProvider>
        <RewardSystem child={mockChild} rewards={mockRewards} onRedeemReward={() => {}} />
      </AuthProvider>
    );

    // The "New Book" reward costs 150 points, but child only has 100
    const expensiveReward = screen.getByTestId('reward-3');
    const redeemButton = screen.getByTestId('redeem-button-3');

    expect(expensiveReward).toHaveTextContent('Not enough points');
    expect(redeemButton).toBeDisabled();
    expect(redeemButton).toHaveClass('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
  });

  it('shows confirmation dialog with reward details', async () => {
    render(
      <AuthProvider>
        <RewardSystem child={mockChild} rewards={mockRewards} onRedeemReward={() => {}} />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('redeem-button-1'));

    await waitFor(() => {
      const dialog = screen.getByTestId('confirmation-dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveTextContent('30 minutes of extra screen time');
      expect(dialog).toHaveTextContent('50 points will be deducted');
    });
  });

  it('allows canceling reward redemption', async () => {
    const onRedeemReward = vi.fn();
    render(
      <AuthProvider>
        <RewardSystem child={mockChild} rewards={mockRewards} onRedeemReward={onRedeemReward} />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('redeem-button-1'));
    
    await waitFor(() => {
      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('cancel-redemption'));

    await waitFor(() => {
      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
    });
    expect(onRedeemReward).not.toHaveBeenCalled();
  });
}); 