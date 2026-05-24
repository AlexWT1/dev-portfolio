import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { owner, repo } = await req.json();
    if (!owner || !repo) {
      return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: 'github' },
    });

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (account?.access_token) {
      headers.Authorization = `Bearer ${account.access_token}`;
    }

    // Fetch repo info
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch repo' }, { status: repoRes.status });
    }
    const repoData = await repoRes.json();

    // Fetch README
    const readmeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      { headers: { ...headers, Accept: 'application/vnd.github.v3.raw' } }
    );
    let readme = '';
    if (readmeRes.ok) {
      readme = await readmeRes.text();
    }

    return NextResponse.json({
      title: repoData.name,
      description: repoData.description || '',
      stars: repoData.stargazers_count,
      language: repoData.language,
      htmlUrl: repoData.html_url,
      readme,
      topics: repoData.topics || [],
      license: repoData.license?.spdx_id || null,
      updatedAt: repoData.updated_at,
    });
  } catch (error) {
    console.error('Failed to fetch repo info:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
