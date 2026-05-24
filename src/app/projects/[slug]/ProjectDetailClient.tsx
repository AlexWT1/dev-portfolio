'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Star,
  ArrowLeft,
  ExternalLink,
  Calendar,
  FolderCode,
  Brain,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import SessionTimeline from '@/components/SessionTimeline';
import AddSessionForm from '@/components/sessions/AddSessionForm';
import { ProjectWithSessions } from '@/types';
import { getRelativeDate } from '@/lib/utils';

interface ProjectDetailClientProps {
  project: ProjectWithSessions;
}

export default function ProjectDetailClient({ project: initialProject }: ProjectDetailClientProps) {
  const { data: session } = useSession();
  const [project, setProject] = useState<ProjectWithSessions>(initialProject);
  const [loading, setLoading] = useState(false);

  const refreshSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions?projectId=${project.id}`);
      if (res.ok) {
        const sessions = await res.json();
        setProject((prev) => ({ ...prev, sessions }));
      }
    } catch (err) {
      console.error('Failed to refresh sessions');
    }
    setLoading(false);
  }, [project.id]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Button>
        </Link>
      </motion.div>

      {/* Project header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <FolderCode className="h-5 w-5" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
              </div>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                {project.description}
              </p>
            </div>
          </div>

          {/* Tags and links */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant={project.status === 'active' ? 'success' : project.status === 'completed' ? 'default' : 'secondary'}
              className="gap-1.5"
            >
              {project.status}
            </Badge>
            {project.language && (
              <Badge variant="outline" className="gap-1.5">
                <FolderCode className="h-3 w-3" />
                {project.language}
              </Badge>
            )}
            {project.stars !== undefined && (
              <Badge variant="secondary" className="gap-1.5">
                <Star className="h-3 w-3" />
                {project.stars}
              </Badge>
            )}
            <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <Calendar className="h-3.5 w-3.5" />
              Updated {getRelativeDate(project.updatedAt)}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {project.sessions.length} sessions
            </span>
          </div>

          {/* Tech stack */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="secondary" className="font-normal">
                {tech}
              </Badge>
            ))}
          </div>

          {/* Links */}
          <div className="mt-4 flex flex-wrap gap-2">
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  GitHub
                </Button>
              </a>
            )}
          </div>
        </div>
      </motion.div>

      <Separator className="mb-8" />

      {/* Tabs: README + Sessions with AI */}
      <Tabs defaultValue="readme">
        <TabsList className="mb-6">
          <TabsTrigger value="readme" className="gap-2">
            <FolderCode className="h-4 w-4" />
            README
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Brain className="h-4 w-4" />
            Sessions with AI ({project.sessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="readme">
          {project.readme ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <MarkdownRenderer content={project.readme} />
            </motion.div>
          ) : (
            <div className="rounded-xl border border-zinc-200 p-12 text-center dark:border-zinc-800">
              <p className="text-sm text-zinc-500">No README available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sessions">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {session && (
              <AddSessionForm projectId={project.id} onSessionAdded={refreshSessions} />
            )}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                </div>
              ) : (
                <SessionTimeline sessions={project.sessions} onSessionDeleted={refreshSessions} />
              )}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
