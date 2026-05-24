import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

async function fetchGitHubRepos(userId: string, forceSync: boolean) {
  const { prisma } = await import('@/lib/prisma');
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: 'github',
    },
  });

  if (!account?.access_token) {
    return NextResponse.json({ error: 'No GitHub token found' }, { status: 401 });
  }

  const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
    headers: {
      Authorization: `Bearer ${account.access_token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  };

  if (forceSync) {
    fetchOptions.cache = 'no-store';
  } else {
    fetchOptions.next = { revalidate: 60 };
  }

  const response = await fetch(
    'https://api.github.com/user/repos?sort=updated&per_page=100&type=all',
    fetchOptions,
  );

  if (!response.ok) {
    if (response.status === 401) {
      return NextResponse.json(
        { error: 'GitHub token expired or invalid. Please sign out and sign in again.', needsReauth: true },
        { status: 401 },
      );
    }
    return NextResponse.json({ error: 'GitHub API error' }, { status: response.status });
  }

  const repos = await response.json();

  const formatted = repos.map((repo: any) => ({
    id: repo.id.toString(),
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description || '',
    htmlUrl: repo.html_url,
    stars: repo.stargazers_count,
    language: repo.language,
    topics: repo.topics || [],
    updatedAt: repo.updated_at,
    owner: repo.owner.login,
    isPrivate: repo.private,
    fork: repo.fork,
  }));

  return NextResponse.json(formatted);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return await fetchGitHubRepos(session.user.id, false);
  } catch (error) {
    console.error('Failed to fetch repos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return await fetchGitHubRepos(session.user.id, true);
  } catch (error) {
    console.error('Failed to sync repos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
