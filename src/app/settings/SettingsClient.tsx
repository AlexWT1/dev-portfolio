'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
  Github,
  Star,
  GitFork,
  Loader2,
  Plus,
  Check,
  ExternalLink,
  RefreshCw,
  Globe,
  Lock,
  FolderCode,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface GitHubRepo {
  id: string;
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  stars: number;
  language: string | null;
  topics: string[];
  updatedAt: string;
  owner: string;
  isPrivate: boolean;
  fork: boolean;
}

interface ExistingProject {
  id: string;
  slug: string;
  title: string;
  githubUrl: string | null;
}

export default function SettingsClient() {
  const { data: session } = useSession();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [existingProjects, setExistingProjects] = useState<ExistingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');

  const fetchData = useCallback(async (forceSync = false) => {
    if (forceSync) setSyncing(true);
    else setLoading(true);
    try {
      const [reposRes, projectsRes] = await Promise.all([
        forceSync
          ? fetch('/api/github/repos', { method: 'POST' })
          : fetch('/api/github/repos'),
        fetch('/api/projects'),
      ]);
      if (reposRes.ok) {
        setRepos(await reposRes.json());
      } else {
        const data = await reposRes.json().catch(() => null);
        if (data?.needsReauth) {
          toast.error('GitHub token expired. Please sign out and sign in again to refresh it.');
        }
      }
      if (projectsRes.ok) setExistingProjects(await projectsRes.json());
      if (forceSync && reposRes.ok) toast.success('Repositories synced with GitHub');
    } catch (err) {
      toast.error(forceSync ? 'Failed to sync repositories' : 'Failed to load data');
    }
    if (forceSync) setSyncing(false);
    else setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isRepoAdded = (repo: GitHubRepo) => {
    return existingProjects.some((p) => p.githubUrl === repo.htmlUrl);
  };

  const findExistingProject = (repo: GitHubRepo) => {
    return existingProjects.find((p) => p.githubUrl === repo.htmlUrl);
  };

  const handleAddRepo = async (repo: GitHubRepo) => {
    setImporting(repo.id);
    try {
      const infoRes = await fetch('/api/github/repo-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner: repo.owner, repo: repo.name }),
      });

      if (!infoRes.ok) {
        const data = await infoRes.json().catch(() => null);
        toast.error(data?.needsReauth ? 'GitHub token expired. Please sign in again.' : 'Failed to fetch repo details');
        setImporting(null);
        return;
      }

      const info = await infoRes.json();

      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: info.title || repo.name,
          description: info.description || repo.description,
          githubUrl: info.htmlUrl || repo.htmlUrl,
          stars: info.stars ?? repo.stars,
          language: info.language || repo.language,
          readme: info.readme || '',
          techStack: info.topics || repo.topics || [],
          status: 'active',
        }),
      });

      if (!projectRes.ok) {
        const err = await projectRes.json();
        toast.error(err.error || 'Failed to create project');
        setImporting(null);
        return;
      }

      toast.success(`Added "${info.title || repo.name}" to your portfolio`);
      await fetchData();
    } catch (err) {
      toast.error('Failed to import repository');
    }
    setImporting(null);
  };

  const handleSyncRepo = async (repo: GitHubRepo) => {
    const existing = findExistingProject(repo);
    if (!existing) return;

    setImporting(repo.id);
    try {
      const infoRes = await fetch('/api/github/repo-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner: repo.owner, repo: repo.name }),
      });

      if (!infoRes.ok) {
        const data = await infoRes.json().catch(() => null);
        toast.error(data?.needsReauth ? 'GitHub token expired. Please sign in again.' : 'Failed to fetch repo details');
        setImporting(null);
        return;
      }

      const info = await infoRes.json();

      const updateRes = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: existing.id,
          description: info.description || repo.description,
          stars: info.stars ?? repo.stars,
          language: info.language || repo.language,
          readme: info.readme || '',
          techStack: info.topics || repo.topics || [],
        }),
      });

      if (!updateRes.ok) {
        toast.error('Failed to sync project');
        setImporting(null);
        return;
      }

      toast.success(`Synced "${repo.name}" with GitHub`);
      await fetchData();
    } catch (err) {
      toast.error('Failed to sync repository');
    }
    setImporting(null);
  };

  const filteredRepos = repos.filter((repo) => {
    if (filter === 'public' && repo.isPrivate) return false;
    if (filter === 'private' && !repo.isPrivate) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        repo.name.toLowerCase().includes(q) ||
        repo.fullName.toLowerCase().includes(q) ||
        (repo.description && repo.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-zinc-500">Please sign in to access settings.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Select GitHub repositories to add to your portfolio. Project data (stars, language,
            README) is fetched automatically.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => fetchData(true)}
              disabled={syncing}
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync GitHub'}
            </Button>

            <div className="flex items-center gap-2">
            <Badge
              variant={filter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilter('all')}
            >
              All
            </Badge>
            <Badge
              variant={filter === 'public' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilter('public')}
            >
              <Globe className="mr-1 h-3 w-3" />
              Public
            </Badge>
            <Badge
              variant={filter === 'private' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilter('private')}
            >
              <Lock className="mr-1 h-3 w-3" />
              Private
            </Badge>
           </div>
          </div>
         </div>

        {/* Repo grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FolderCode className="mb-3 h-12 w-12 text-zinc-400" />
            <p className="text-zinc-500">
              {searchQuery
                ? 'No repositories match your search.'
                : 'No GitHub repositories found. Make sure your GitHub token has the `repo` scope.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredRepos.map((repo, index) => {
                const added = isRepoAdded(repo);
                const existing = findExistingProject(repo);

                return (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Card className="group transition-all duration-200 hover:shadow-md">
                      <CardContent className="flex items-start gap-4 p-4">
                        {/* Icon */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                          {repo.isPrivate ? (
                            <Lock className="h-5 w-5 text-zinc-400" />
                          ) : (
                            <Github className="h-5 w-5 text-zinc-400" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium leading-tight">{repo.name}</h3>
                                {repo.fork && (
                                  <Badge variant="outline" className="text-[10px] font-normal">
                                    Fork
                                  </Badge>
                                )}
                                {repo.isPrivate && (
                                  <Badge variant="outline" className="text-[10px] font-normal">
                                    Private
                                  </Badge>
                                )}
                              </div>
                              {repo.description && (
                                <p className="mt-0.5 line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">
                                  {repo.description}
                                </p>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex shrink-0 items-center gap-1">
                              {added && existing ? (
                                <>
                                  <Button variant="ghost" size="sm" className="gap-2 text-emerald-500" asChild>
                                    <a href={`/projects/${existing.slug}`}>
                                      <Check className="h-4 w-4" />
                                      <span className="hidden sm:inline">Added</span>
                                    </a>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={() => handleSyncRepo(repo)}
                                    disabled={importing === repo.id}
                                  >
                                    {importing === repo.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <RefreshCw className="h-3.5 w-3.5" />
                                    )}
                                    <span className="hidden sm:inline">Sync</span>
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => handleAddRepo(repo)}
                                  disabled={importing === repo.id}
                                >
                                  {importing === repo.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Plus className="h-4 w-4" />
                                  )}
                                  <span className="hidden sm:inline">Add</span>
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5" />
                              {repo.stars}
                            </span>
                            {repo.language && (
                              <Badge variant="secondary" className="text-[10px] font-normal">
                                {repo.language}
                              </Badge>
                            )}
                            <span className="truncate text-zinc-400">
                              {repo.fullName}
                            </span>
                            <a
                              href={repo.htmlUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>

                          {/* Topics */}
                          {repo.topics.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {repo.topics.slice(0, 6).map((topic) => (
                                <Badge
                                  key={topic}
                                  variant="outline"
                                  className="text-[10px] font-normal"
                                >
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
