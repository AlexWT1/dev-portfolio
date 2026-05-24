'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { SessionRecord } from '@/types';
import { formatTokens, formatCost, formatDuration } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SessionModal from './SessionModal';
import { Brain, Clock, Coins, FileCode, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SessionTimelineProps {
  sessions: SessionRecord[];
  onSessionDeleted?: () => void;
}

export default function SessionTimeline({ sessions, onSessionDeleted }: SessionTimelineProps) {
  const { data: session } = useSession();
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const confirmDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setConfirmDeleteId(sessionId);
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;

    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        toast.error('Failed to delete session');
        return;
      }
      toast.success('Session deleted');
      onSessionDeleted?.();
    } catch {
      toast.error('Failed to delete session');
    }
    setDeletingId(null);
  };

  const authSession = session;

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Brain className="mb-3 h-10 w-10 text-zinc-400" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No sessions recorded yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-0 h-full w-px bg-zinc-200 dark:bg-zinc-800" />

        <div className="space-y-6">
          {sessions.map((s, index) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="relative pl-12"
            >
              {/* Timeline dot */}
              <div className="absolute left-[13px] top-1.5 h-3 w-3 rounded-full border-2 border-zinc-900 bg-white dark:border-zinc-50 dark:bg-zinc-950" />

              {/* Session card */}
              <div className="group cursor-pointer rounded-lg border border-zinc-200 bg-white p-4 transition-all duration-200 hover:border-zinc-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(s.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{s.model}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {authSession && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-500/10"
                        onClick={(e) => confirmDeleteSession(e, s.id)}
                        disabled={deletingId === s.id}
                      >
                        {deletingId === s.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => setSelectedSession(s)}
                    >
                      Details
                    </Button>
                  </div>
                </div>

                {/* Summary */}
                <p className="mb-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {s.summary}
                </p>

                {/* Metrics row */}
                <div className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Brain className="h-3.5 w-3.5" />
                    {formatTokens(s.totalTokens)} tokens
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(s.durationMinutes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5" />
                    {formatCost(s.costUSD)}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileCode className="h-3.5 w-3.5" />
                    {s.changes.length} files
                  </span>
                </div>

                {/* File changes preview */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.changes.slice(0, 3).map((change) => (
                    <Badge
                      key={change.path}
                      variant={
                        change.type === 'added'
                          ? 'success'
                          : change.type === 'deleted'
                            ? 'destructive'
                            : 'warning'
                      }
                      className="max-w-[200px] truncate text-[10px] font-normal"
                    >
                      {change.path.split('/').pop()}
                    </Badge>
                  ))}
                  {s.changes.length > 3 && (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      +{s.changes.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedSession && (
        <SessionModal
          session={selectedSession}
          open={!!selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}

      <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              Delete Session
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The session and all its data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
