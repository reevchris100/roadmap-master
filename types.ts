
export enum SubscriptionStatus {
  FREE = 'FREE',
  PRO = 'PRO',
}

export enum MilestoneStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum ResourceType {
  VIDEO = 'VIDEO',
  ARTICLE = 'ARTICLE',
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  paypalSubscriptionId?: string | null;
  subscriptionStatus: SubscriptionStatus;
  createdAt: Date;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  userId: string;
  createdAt: Date;
  milestones: Milestone[];
  isTemplate?: boolean;
  shareId?: string;
  category?: string;
}

export interface Milestone {
  id: string;
  roadmapId: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  order: number;
  resources: Resource[];
}

export interface Resource {
  id: string;
  milestoneId: string;
  title: string;
  url: string;
  type: ResourceType;
}

export interface Progress {
  id: string;
  userId: string;
  milestoneId: string;
  isCompleted: boolean;
}

export type Page = 'dashboard' | 'roadmapDetail' | 'settings' | 'pricing';