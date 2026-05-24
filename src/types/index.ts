// Matches Prisma schema models

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string | null;
  stars: number;
  language: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  readme: string | null;
  ownerId: string;
  sessionCount?: number;
}

export interface ProjectWithSessions extends Project {
  sessions: SessionRecord[];
  sessionCount?: number;
}

export interface FileChange {
  path: string;
  type: 'added' | 'modified' | 'deleted';
  additions: number;
  deletions: number;
}

export interface SessionRecord {
  id: string;
  date: string;
  duration: string;
  durationMinutes: number;
  model: string;
  tokensIn: number;
  tokensOut: number;
  totalTokens: number;
  costUSD: number;
  summary: string;
  changes: FileChange[];
  gitDiffUrl: string | null;
  projectId: string;
  createdAt: string;
}

export interface AggregatedMetrics {
  totalProjects: number;
  totalSessions: number;
  totalTokens: number;
  totalCostUSD: number;
  totalDurationMinutes: number;
  topModels: { model: string; count: number; tokens: number }[];
  topLanguages: { language: string; count: number }[];
  tokensByDay: { date: string; tokens: number }[];
  costByDay: { date: string; cost: number }[];
}

export interface GitHubRepo {
  id: string;
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  stars: number;
  language: string | null;
  topics: string[];
  updatedAt: string;
  owner: string;
  isPrivate: boolean;
  fork: boolean;
}

export interface GitHubRepoDetail {
  title: string;
  description: string;
  stars: number;
  language: string | null;
  htmlUrl: string;
  readme: string;
  topics: string[];
  license: string | null;
  updatedAt: string;
}
