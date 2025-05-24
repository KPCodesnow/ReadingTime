export interface Reward {
  id: string;
  name: string;
  description: string;
  createdBy: string; // parentId
  familyId: string;
  type: RewardType;
  status: RewardStatus;
  value?: number; // for monetary rewards
  expiresAt?: Date;
}

export type RewardType = 
  | 'screen_time'
  | 'activity'
  | 'monetary'
  | 'privilege'
  | 'custom';

export type RewardStatus = 
  | 'available'
  | 'assigned'
  | 'earned'
  | 'delivered'
  | 'expired';

export interface RewardAssignment {
  id: string;
  rewardId: string;
  childId: string;
  milestoneId: string;
  assignedAt: Date;
  earnedAt?: Date;
  deliveredAt?: Date;
  status: RewardStatus;
} 