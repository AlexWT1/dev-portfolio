import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProjectDetailClient from './ProjectDetailClient';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sess = await auth();

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      sessions: {
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!project) notFound();

  const formatted = {
    ...project,
    techStack: Array.isArray(project.techStack) ? project.techStack : [],
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    sessions: project.sessions.map((s) => ({
      ...s,
      date: s.date.toISOString(),
      createdAt: s.createdAt.toISOString(),
      changes: typeof s.changes === 'string' ? JSON.parse(s.changes) : s.changes,
    })),
  };

  return <ProjectDetailClient project={formatted as any} />;
}
