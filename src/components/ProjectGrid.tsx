'use client';

import { Project } from '@/types';
import ProjectCard from './ProjectCard';
import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';

interface ProjectGridProps {
  projects: Project[];
  sessionCounts: Record<string, number>;
  onDelete?: (projectId: string) => void;
}

export default function ProjectGrid({ projects, sessionCounts, onDelete }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          <FolderOpen className="h-8 w-8 text-zinc-400" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">No projects yet</h2>
        <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          Import your first project data in the Admin section to get started.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          index={index}
          sessionCount={sessionCounts[project.id] || 0}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
