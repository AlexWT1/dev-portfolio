'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, FileJson, Brain, Clock, GitCompare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface FileChange {
  path: string;
  type: 'added' | 'modified' | 'deleted';
  additions: number;
  deletions: number;
}

interface SessionJson {
  model?: string;
  summary?: string;
  date?: string;
  duration?: string;
  durationMinutes?: number;
  tokensIn?: number;
  tokensOut?: number;
  totalTokens?: number;
  costUSD?: number;
  gitDiffUrl?: string;
  changes?: FileChange[];
}

interface AddSessionFormProps {
  projectId: string;
  onSessionAdded: () => void;
}

const typeColors = {
  added: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  modified: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  deleted: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
} as const;

function parseAndValidate(json: any): SessionJson | null {
  if (!json.model || typeof json.model !== 'string' || !json.model.trim()) {
    toast.error('Missing required field: "model" (non-empty string)');
    return null;
  }
  if (!json.summary || typeof json.summary !== 'string' || !json.summary.trim()) {
    toast.error('Missing required field: "summary" (non-empty string)');
    return null;
  }

  const validated: SessionJson = {
    model: json.model.trim(),
    summary: json.summary.trim(),
  };

  if (json.date) validated.date = json.date;
  if (typeof json.duration === 'string') validated.duration = json.duration;
  else if (typeof json.duration === 'number') validated.duration = String(json.duration);
  if (typeof json.durationMinutes === 'number') validated.durationMinutes = json.durationMinutes;
  if (typeof json.tokensIn === 'number') validated.tokensIn = json.tokensIn;
  if (typeof json.tokensOut === 'number') validated.tokensOut = json.tokensOut;
  if (typeof json.totalTokens === 'number') validated.totalTokens = json.totalTokens;
  if (typeof json.costUSD === 'number') validated.costUSD = json.costUSD;
  if (typeof json.gitDiffUrl === 'string') validated.gitDiffUrl = json.gitDiffUrl;

  if (Array.isArray(json.changes)) {
    validated.changes = json.changes.map((c: any) => ({
      path: String(c.path || ''),
      type: (['added', 'modified', 'deleted'].includes(c.type) ? c.type : 'modified') as FileChange['type'],
      additions: typeof c.additions === 'number' ? c.additions : 0,
      deletions: typeof c.deletions === 'number' ? c.deletions : 0,
    }));
  }

  return validated;
}

export default function AddSessionForm({ projectId, onSessionAdded }: AddSessionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sessionData, setSessionData] = useState<SessionJson | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.json')) {
      toast.error('Please upload a .json file');
      return;
    }

    setFileName(file.name);

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const validated = parseAndValidate(json);

      if (validated) {
        setSessionData(validated);
        toast.success('Session loaded from file!');
      }
    } catch (err) {
      toast.error('Invalid JSON file. Please check the format.');
    }
  }, [parseAndValidate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [processFile]);

  const handleSubmit = async () => {
    if (!sessionData) return;

    setSubmitting(true);
    try {
      const tokensIn = sessionData.tokensIn || 0;
      const tokensOut = sessionData.tokensOut || 0;
      const totalTokens = sessionData.totalTokens || (tokensIn + tokensOut);

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          date: sessionData.date || new Date().toISOString(),
          duration: sessionData.duration || '',
          durationMinutes: sessionData.durationMinutes || 0,
          model: sessionData.model,
          tokensIn,
          tokensOut,
          totalTokens,
          costUSD: sessionData.costUSD || 0,
          summary: sessionData.summary,
          changes: sessionData.changes || [],
          gitDiffUrl: sessionData.gitDiffUrl || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to create session');
        setSubmitting(false);
        return;
      }

      toast.success('Session added successfully!');
      setSessionData(null);
      setFileName('');
      setIsOpen(false);
      onSessionAdded();
    } catch (err) {
      toast.error('Failed to create session');
    }
    setSubmitting(false);
  };

  const resetForm = () => {
    setSessionData(null);
    setFileName('');
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="gap-2">
        <FileJson className="h-4 w-4" />
        Import from JSON
      </Button>
    );
  }

  const totalTokens = (sessionData?.tokensIn || 0) + (sessionData?.tokensOut || 0);
  const displayTokens = sessionData?.totalTokens || totalTokens;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Import Session</CardTitle>
            <CardDescription>Drop a JSON file or paste its content</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { resetForm(); setIsOpen(false); }}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {!sessionData ? (
            /* Drop zone */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200
                ${dragOver
                  ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-800/50'
                  : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileSelect}
              />
              <motion.div
                animate={dragOver ? { scale: 1.05 } : { scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                  <Upload className={`h-8 w-8 ${dragOver ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {dragOver ? 'Drop your file here' : 'Drag & drop your session JSON here'}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    or click to browse files
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                  <FileJson className="h-3 w-3" />
                  .json format —{' '}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Show example format
                      const example = {
                        model: "Claude 4 Sonnet",
                        summary: "What was accomplished",
                        duration: "1h 30m",
                        durationMinutes: 90,
                        tokensIn: 5000,
                        tokensOut: 15000,
                        costUSD: 0.42,
                        changes: [
                          { path: "src/file.ts", type: "modified", additions: 50, deletions: 10 }
                        ]
                      };
                      navigator.clipboard?.writeText(JSON.stringify(example, null, 2))
                        .then(() => toast.success('Example copied to clipboard!'))
                        .catch(() => toast.error('Could not copy to clipboard'));
                    }}
                    className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    copy example
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            /* Preview & Submit */
            <AnimatePresence mode="wait">
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* File info bar */}
                <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <FileJson className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium text-emerald-700 dark:text-emerald-300">{fileName}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <button
                    onClick={resetForm}
                    className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    Choose another file
                  </button>
                </div>

                {/* Model + Duration */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <Brain className="h-3.5 w-3.5" />
                      Model
                    </div>
                    <p className="mt-1 text-sm font-medium">{sessionData.model}</p>
                  </div>
                  {sessionData.duration && (
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <Clock className="h-3.5 w-3.5" />
                        Duration
                      </div>
                      <p className="mt-1 text-sm font-medium">
                        {sessionData.duration}
                        {sessionData.durationMinutes ? ` (${sessionData.durationMinutes} min)` : ''}
                      </p>
                    </div>
                  )}
                </div>

                {/* Token metrics */}
                {(sessionData.tokensIn !== undefined || sessionData.tokensOut !== undefined || sessionData.costUSD !== undefined) && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {sessionData.tokensIn !== undefined && (
                      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Tokens In</div>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {sessionData.tokensIn.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {sessionData.tokensOut !== undefined && (
                      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Tokens Out</div>
                        <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                          {sessionData.tokensOut.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {sessionData.costUSD !== undefined && (
                      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Cost</div>
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          ${sessionData.costUSD.toFixed(4)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Total tokens */}
                {displayTokens > 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/50">
                    <Brain className="h-4 w-4 text-zinc-400" />
                    Total: <strong>{displayTokens.toLocaleString()}</strong> tokens
                  </div>
                )}

                {/* Summary */}
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Summary</div>
                  <p className="mt-1 text-sm leading-relaxed">{sessionData.summary}</p>
                </div>

                {/* Git diff URL */}
                {sessionData.gitDiffUrl && (
                  <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-800/50">
                    <GitCompare className="h-3.5 w-3.5 text-zinc-400" />
                    <a
                      href={sessionData.gitDiffUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
                    >
                      {sessionData.gitDiffUrl}
                    </a>
                  </div>
                )}

                {/* File Changes */}
                {sessionData.changes && sessionData.changes.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="mb-3 text-sm font-medium">File Changes ({sessionData.changes.length})</h4>
                      <div className="space-y-1">
                        {sessionData.changes.map((fc, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/50"
                          >
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${typeColors[fc.type]}`}>
                              {fc.type}
                            </span>
                            <code className="flex-1 truncate text-xs">{fc.path}</code>
                            {fc.additions > 0 && (
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                +{fc.additions}
                              </span>
                            )}
                            {fc.deletions > 0 && (
                              <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                -{fc.deletions}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Submit */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {submitting ? 'Saving...' : 'Save Session'}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
