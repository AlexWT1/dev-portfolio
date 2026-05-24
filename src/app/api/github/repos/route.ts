import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the user's account to access the GitHub token
    const { prisma } = await import('@/lib/prisma');
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'github',
      },
    });

    if (!account?.access_token) {
      return NextResponse.json({ error: 'No GitHub token found' }, { status: 401 });
    }

    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100&type=all', {
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
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
  } catch (error) {
    console.error('Failed to fetch repos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
