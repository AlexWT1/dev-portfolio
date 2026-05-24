'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Github, Layers, Sparkles, Star, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectGrid from '@/components/ProjectGrid';
import { Project } from '@/types';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/projects')
        .then((res) => res.json())
        .then((data) => setProjects(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  // Compute stats
  const totalSessions = projects.reduce((sum, p) => sum + (p.sessionCount || 0), 0);
  const totalStars = projects.reduce((sum, p) => sum + (p.stars || 0), 0);

  const sessionCounts: Record<string, number> = {};
  projects.forEach((p) => {
    sessionCounts[p.id] = p.sessionCount || 0;
  });

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center"
        >
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-100 dark:bg-zinc-800">
            <Code2 className="h-10 w-10" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Dev Portfolio
          </h1>
          <p className="mb-8 max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
            Track your AI-assisted development sessions. Sign in with GitHub to import your
            repositories and log your coding sessions with detailed metrics.
          </p>
          <Button
            size="lg"
            className="gap-3 text-base"
            onClick={() => signIn('github')}
          >
            <Github className="h-5 w-5" />
            Sign in with GitHub
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex flex-col items-center text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Development Portfolio
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            A timeline of AI-assisted development sessions. Each project showcases the
            collaborative process between human creativity and AI capabilities.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Layers className="h-4 w-4" />
              <span>
                <strong className="text-zinc-900 dark:text-zinc-50">{projects.length}</strong>{' '}
                projects
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Zap className="h-4 w-4" />
              <span>
                <strong className="text-zinc-900 dark:text-zinc-50">{totalSessions}</strong>{' '}
                sessions
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Star className="h-4 w-4" />
              <span>
                <strong className="text-zinc-900 dark:text-zinc-50">{totalStars}</strong>{' '}
                stars
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Sparkles className="h-4 w-4" />
              <span>AI-powered development</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Project grid */}
      <ProjectGrid projects={projects} sessionCounts={sessionCounts} onDelete={handleDeleteProject} />
    </div>
  );
}
