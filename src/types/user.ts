export interface BaseUser {
  id: string;
  username: string;
  email: string;
  role: 'parent' | 'child';
  familyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChildUser extends BaseUser {
  role: 'child';
  age: number;
  readingLevel: string;
  interests: string[];
  parentId: string;
}

export interface ParentUser extends BaseUser {
  role: 'parent';
  children: ChildUser[];
}

export type User = ParentUser | ChildUser; 