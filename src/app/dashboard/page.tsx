import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const sess = await auth();
  if (!sess?.user?.id) redirect('/');

  const projects = await prisma.project.findMany({
    where: { ownerId: sess.user.id },
  });

  const sessions = await prisma.sessionRecord.findMany({
    where: { project: { ownerId: sess.user.id } },
  });

  const totalSessions = sessions.length;
  const totalTokens = sessions.reduce((sum, s) => sum + s.totalTokens, 0);
  const totalCostUSD = sessions.reduce((sum, s) => sum + s.costUSD, 0);
  const totalDurationMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  // Top models
  const modelMap = new Map<string, { count: number; tokens: number }>();
  for (const s of sessions) {
    const existing = modelMap.get(s.model) || { count: 0, tokens: 0 };
    existing.count++;
    existing.tokens += s.totalTokens;
    modelMap.set(s.model, existing);
  }
  const topModels = Array.from(modelMap.entries())
    .map(([model, data]) => ({ model, count: data.count, tokens: data.tokens }))
    .sort((a, b) => b.tokens - a.tokens);

  // Top languages
  const langMap = new Map<string, number>();
  for (const p of projects) {
    if (p.language) {
      langMap.set(p.language, (langMap.get(p.language) || 0) + 1);
    }
  }
  const topLanguages = Array.from(langMap.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count);

  // Tokens by day
  const dayMap = new Map<string, { tokens: number; cost: number }>();
  for (const s of sessions) {
    const day = s.date.toISOString().substring(0, 10);
    const existing = dayMap.get(day) || { tokens: 0, cost: 0 };
    existing.tokens += s.totalTokens;
    existing.cost += s.costUSD;
    dayMap.set(day, existing);
  }
  const tokensByDay = Array.from(dayMap.entries())
    .map(([date, data]) => ({ date, tokens: data.tokens, cost: data.cost }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const costByDay = tokensByDay.map((d) => ({ date: d.date, cost: d.cost }));

  const metrics = {
    totalProjects: projects.length,
    totalSessions,
    totalTokens,
    totalCostUSD,
    totalDurationMinutes,
    topModels,
    topLanguages,
    tokensByDay,
    costByDay,
  };

  return <DashboardClient metrics={metrics} />;
}
