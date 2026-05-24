'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, GitFork, Clock, ExternalLink, FolderCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Project } from '@/types';
import { getRelativeDate, formatTokens } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  index: number;
  sessionCount: number;
}

export default function ProjectCard({ project, index, sessionCount }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Link href={`/projects/${project.slug}`}>
        <Card className="group relative h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50">
          {/* Hover gradient accent */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-zinc-50 dark:via-zinc-400 dark:to-zinc-50" />

          <CardContent className="p-5">
            {/* Header */}
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  <FolderCode className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-semibold leading-tight group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                    {project.title}
                  </h3>
                  {project.language && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {project.language}
                    </span>
                  )}
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            {/* Description */}
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
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
