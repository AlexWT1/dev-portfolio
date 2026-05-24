'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, Clock, ExternalLink, FolderCode, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Project } from '@/types';
import { getRelativeDate } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  index: number;
  sessionCount: number;
  onDelete?: (projectId: string) => void;
}

export default function ProjectCard({ project, index, sessionCount, onDelete }: ProjectCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects?id=${project.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete?.(project.id);
      }
    } catch (err) {
      console.error('Failed to delete project');
    }
    setDeleting(false);
    setDialogOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Card className="group relative h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50">
        {/* Hover gradient accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-zinc-50 dark:via-zinc-400 dark:to-zinc-50" />

        <CardContent className="p-5">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between gap-2">
            <Link href={`/projects/${project.slug}`} className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                <FolderCode className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold leading-tight group-hover:text-zinc-600 dark:group-hover:text-zinc-300 truncate">
                  {project.title}
                </h3>
                {project.language && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {project.language}
                  </span>
                )}
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-1">
              <Link href={`/projects/${project.slug}`}>
                <ExternalLink className="h-4 w-4 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                    onClick={(e) => { e.stopPropagation(); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent onClick={(e) => e.stopPropagation()}>
                  <DialogHeader>
                    <DialogTitle>Delete project</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete &quot;{project.title}&quot;? This will also remove all associated sessions. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="gap-2"
                    >
                      {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Description */}
          <Link href={`/projects/${project.slug}`}>
            <p className="mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {project.description}
            </p>

            {/* Tech stack */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {project.techStack.slice(0, 4).map((tech) => (
                <Badge key={tech} variant="secondary" className="text-[10px] font-normal">
                  {tech}
                </Badge>
              ))}
              {project.techStack.length > 4 && (
                <Badge variant="outline" className="text-[10px] font-normal">
                  +{project.techStack.length - 4}
                </Badge>
              )}
            </div>

            {/* Footer stats */}
            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              {project.stars !== undefined && (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" />
                  {project.stars}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {getRelativeDate(project.updatedAt)}
              </span>
              <span className="flex items-center gap-1">
                <FolderCode className="h-3.5 w-3.5" />
                {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}
              </span>
            </div>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
