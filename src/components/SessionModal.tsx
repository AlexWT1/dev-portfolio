'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import MetricChart from './MetricChart';
import { SessionRecord } from '@/types';
import { formatTokens, formatCost, formatDuration } from '@/lib/utils';
import {
  Brain,
  Clock,
  Coins,
  FileCode,
  GitCompare,
  Plus,
  Minus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SessionModalProps {
  session: SessionRecord;
  open: boolean;
  onClose: () => void;
}

export default function SessionModal({ session, open, onClose }: SessionModalProps) {
  const totalAdditions = session.changes.reduce((sum, c) => sum + c.additions, 0);
  const totalDeletions = session.changes.reduce((sum, c) => sum + c.deletions, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-5 w-5" />
            Session Details
          </DialogTitle>
          <DialogDescription>
            {new Date(session.date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Model and duration strip */}
            <div className="flex flex-wrap gap-3">
              <Badge variant="default" className="gap-1.5 px-3 py-1">
                <Brain className="h-3.5 w-3.5" />
                {session.model}
              </Badge>
              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(session.durationMinutes)}
              </Badge>
              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                <Coins className="h-3.5 w-3.5" />
                {formatCost(session.costUSD)}
              </Badge>
              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                <FileCode className="h-3.5 w-3.5" />
                {session.changes.length} files
              </Badge>
              {session.gitDiffUrl && (
                <a
                  href={session.gitDiffUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Badge variant="warning" className="gap-1.5 px-3 py-1 hover:opacity-80">
                    <GitCompare className="h-3.5 w-3.5" />
                    View Diff
                  </Badge>
                </a>
              )}
            </div>

            {/* Summary */}
            <div>
              <h4 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Summary
              </h4>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {session.summary}
              </p>
            </div>

            <Separator />

            {/* Metrics Chart */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Metrics Breakdown
              </h4>
              <MetricChart session={session} />
            </div>

            <Separator />

            {/* Files Changed */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Files Changed
              </h4>
              <div className="space-y-1">
                {/* Header */}
                <div className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                  <span className="flex-1">File</span>
                  <span className="w-16 text-right">Added</span>
                  <span className="w-16 text-right">Deleted</span>
                  <span className="w-20 text-right">Type</span>
                </div>

                {/* Rows */}
                <ScrollArea className="max-h-48">
                  <div className="space-y-0.5">
                    {session.changes.map((change, index) => (
                      <motion.div
                        key={change.path}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                      >
                        <div className="flex flex-1 items-center gap-2 overflow-hidden">
                          {change.type === 'added' && <Plus className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                          {change.type === 'modified' && <Pencil className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                          {change.type === 'deleted' && <Trash2 className="h-3.5 w-3.5 shrink-0 text-red-500" />}
                          <span className="truncate text-xs font-mono text-zinc-700 dark:text-zinc-300">
                            {change.path}
                          </span>
                        </div>
                        <span className="w-16 text-right text-xs text-emerald-600 dark:text-emerald-400">
                          +{change.additions}
                        </span>
                        <span className="w-16 text-right text-xs text-red-600 dark:text-red-400">
                          -{change.deletions}
                        </span>
                        <Badge
                          variant={
                            change.type === 'added'
                              ? 'success'
                              : change.type === 'deleted'
                                ? 'destructive'
                                : 'warning'
                          }
                          className="w-20 justify-center text-[10px] font-normal capitalize"
                        >
                          {change.type}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Summary row */}
                <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-800/20">
                  <span className="flex-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Total
                  </span>
                  <span className="w-16 text-right text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    +{totalAdditions}
                  </span>
                  <span className="w-16 text-right text-xs font-medium text-red-600 dark:text-red-400">
                    -{totalDeletions}
                  </span>
                  <span className="w-20 text-right text-xs font-medium text-zinc-500">
                    {session.changes.length} files
                  </span>
                </div>
              </div>
            </div>

            {/* Token usage detail */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Tokens In</p>
                <p className="mt-1 text-lg font-semibold">{formatTokens(session.tokensIn)}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Tokens Out</p>
                <p className="mt-1 text-lg font-semibold">{formatTokens(session.tokensOut)}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Tokens</p>
                <p className="mt-1 text-lg font-semibold">{formatTokens(session.totalTokens)}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Cost</p>
                <p className="mt-1 text-lg font-semibold">{formatCost(session.costUSD)}</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
