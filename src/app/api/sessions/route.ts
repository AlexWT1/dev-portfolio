import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      projectId,
      date,
      duration,
      durationMinutes,
      model,
      tokensIn,
      tokensOut,
      totalTokens,
      costUSD,
      summary,
      changes,
      gitDiffUrl,
    } = body;

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const sessionRecord = await prisma.sessionRecord.create({
      data: {
        projectId,
        date: date ? new Date(date) : new Date(),
        duration: duration || '',
        durationMinutes: durationMinutes || 0,
        model: model || '',
        tokensIn: tokensIn || 0,
        tokensOut: tokensOut || 0,
        totalTokens: totalTokens || 0,
        costUSD: costUSD || 0,
        summary: summary || '',
        changes: changes || [],
        gitDiffUrl: gitDiffUrl || null,
      },
    });

    return NextResponse.json(sessionRecord, { status: 201 });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');

  const where: any = {
    project: { ownerId: session.user.id },
  };
  if (projectId) {
    where.projectId = projectId;
  }

  const sessions = await prisma.sessionRecord.findMany({
    where,
    orderBy: { date: 'desc' },
  });

  return NextResponse.json(sessions);
}
