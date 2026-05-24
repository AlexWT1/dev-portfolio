'use client';

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import DashboardCharts from '@/components/DashboardCharts';
import { AggregatedMetrics } from '@/types';

interface DashboardClientProps {
  metrics: AggregatedMetrics;
}

export default function DashboardClient({ metrics }: DashboardClientProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Aggregated metrics across all projects and sessions.
              </p>
            </div>
          </div>
        </div>

        <DashboardCharts metrics={metrics} />
      </motion.div>
    </div>
  );
}
