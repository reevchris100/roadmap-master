
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
    shareId: 'template-react-mastery',
    category: 'Tech',
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
    isPublic: true,
    userId: 'user_1',
    createdAt: new Date('2024-01-15'),
    isTemplate: true,
    category: 'Business',
    shareId: 'template-saas-launch',
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
  {
    id: 'roadmap_3',
    title: 'Intro to Generative AI',
    description: 'Understand LLMs, Prompts, and current AI trends.',
    isPublic: true,
    userId: 'user_1',
    createdAt: new Date('2024-02-10'),
    isTemplate: true,
    shareId: 'template-gen-ai',
    category: 'AI',
    milestones: [{ id: 'm3_1', roadmapId: 'roadmap_3', title: 'What is LLM?', description: 'Concept of Large Language Models', status: MilestoneStatus.PLANNED, order: 1, resources: [] }]
  },
  {
    id: 'roadmap_4',
    title: 'System Design Interview Guide',
    description: 'Scalability, Load Balancing, Caching and more.',
    isPublic: true,
    userId: 'user_1',
    createdAt: new Date('2024-02-12'),
    isTemplate: true,
    shareId: 'template-system-design',
    category: 'System Design',
    milestones: [{ id: 'm4_1', roadmapId: 'roadmap_4', title: 'Vertical vs Horizontal Scaling', description: 'Basics of scaling', status: MilestoneStatus.PLANNED, order: 1, resources: [] }]
  },
  {
    id: 'roadmap_5',
    title: 'Personal Finance Mastery',
    description: 'Budgeting, Investing, and Retirement planning.',
    isPublic: true,
    userId: 'user_1',
    createdAt: new Date('2024-02-15'),
    isTemplate: true,
    shareId: 'template-finance-mastery',
    category: 'Finance',
    milestones: [{ id: 'm5_1', roadmapId: 'roadmap_5', title: 'Tracking Expenses', description: 'Know where your money goes', status: MilestoneStatus.PLANNED, order: 1, resources: [] }]
  },
];

export const mockProgress: Progress[] = [
  { id: 'progress_1', userId: 'user_1', milestoneId: 'milestone_1_1', isCompleted: true },
  { id: 'progress_2', userId: 'user_1', milestoneId: 'milestone_2_1', isCompleted: true },
];
