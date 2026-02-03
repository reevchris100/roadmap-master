
import type { Roadmap, Progress, User } from '../types';
import { MilestoneStatus, ResourceType, SubscriptionStatus } from '../types';

export const mockUser: User = {
    id: 'user_1',
    email: 'dev@example.com',
    name: 'Alex Doe',
    paypalSubscriptionId: null,
    subscriptionStatus: SubscriptionStatus.FREE,
    createdAt: new Date(),
};

export const mockRoadmaps: Roadmap[] = [
  {
    id: 'roadmap_1',
    title: 'Learn React from Scratch',
    description: 'A comprehensive guide to mastering React, from the basics to advanced concepts.',
    isPublic: true,
    userId: 'user_1',
    createdAt: new Date('2023-10-26'),
    isTemplate: true,
    milestones: [
      {
        id: 'milestone_1_1',
        roadmapId: 'roadmap_1',
        title: 'Fundamentals of JavaScript (ES6+)',
        description: 'Understand the core concepts of modern JavaScript necessary for React.',
        status: MilestoneStatus.COMPLETED,
        order: 1,
        resources: [
          { id: 'res_1', milestoneId: 'milestone_1_1', title: 'JavaScript.info', url: '#', type: ResourceType.ARTICLE },
          { id: 'res_2', milestoneId: 'milestone_1_1', title: 'ES6 for Everyone by Wes Bos', url: '#', type: ResourceType.VIDEO },
        ],
      },
      {
        id: 'milestone_1_2',
        roadmapId: 'roadmap_1',
        title: 'React Basics: Components, Props, and State',
        description: 'Learn the fundamental building blocks of React applications.',
        status: MilestoneStatus.IN_PROGRESS,
        order: 2,
        resources: [
            { id: 'res_3', milestoneId: 'milestone_1_2', title: 'Official React Tutorial', url: '#', type: ResourceType.ARTICLE },
        ]
      },
      {
        id: 'milestone_1_3',
        roadmapId: 'roadmap_1',
        title: 'State Management with Hooks',
        description: 'Master useState, useEffect, useContext, and other essential hooks.',
        status: MilestoneStatus.PLANNED,
        order: 3,
        resources: [],
      },
    ],
  },
  {
    id: 'roadmap_2',
    title: 'Launch a SaaS Product',
    description: 'From idea to launch, this roadmap covers the essential steps to get your SaaS business off the ground.',
    isPublic: false,
    userId: 'user_1',
    createdAt: new Date('2024-01-15'),
    isTemplate: false,
    milestones: [
      {
        id: 'milestone_2_1',
        roadmapId: 'roadmap_2',
        title: 'Idea Validation & Market Research',
        description: 'Ensure your idea has potential before writing a single line of code.',
        status: MilestoneStatus.COMPLETED,
        order: 1,
        resources: [],
      },
      {
        id: 'milestone_2_2',
        roadmapId: 'roadmap_2',
        title: 'Build an MVP',
        description: 'Develop the core features of your product to attract initial users.',
        status: MilestoneStatus.PLANNED,
        order: 2,
        resources: [],
      },
    ],
  },
];

export const mockProgress: Progress[] = [
    { id: 'progress_1', userId: 'user_1', milestoneId: 'milestone_1_1', isCompleted: true },
    { id: 'progress_2', userId: 'user_1', milestoneId: 'milestone_2_1', isCompleted: true },
];
