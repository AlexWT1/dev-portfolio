import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    include: { _count: { select: { sessions: true } } },
    orderBy: { updatedAt: 'desc' },
  });

  const formatted = projects.map((p) => ({
    ...p,
    sessionCount: p._count.sessions,
    _count: undefined,
  }));

  return NextResponse.json(formatted);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, githubUrl, stars, language, readme, techStack, status } = body;

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const project = await prisma.project.create({
      data: {
        slug,
        title,
        description: description || '',
        githubUrl: githubUrl || null,
        stars: stars || 0,
        language: language || null,
        readme: readme || null,
        techStack: techStack || [],
        status: status || 'active',
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
