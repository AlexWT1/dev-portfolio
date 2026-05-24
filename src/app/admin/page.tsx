'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Settings, Github, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminPage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-zinc-500">Please sign in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Admin</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your portfolio projects and sessions.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import from GitHub</CardTitle>
              <CardDescription>
                Browse your GitHub repositories and add them to your portfolio with auto-fetched
                data (stars, language, README, topics).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings">
                <Button className="gap-2">
                  <Github className="h-4 w-4" />
                  Go to Repository Browser
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Sessions</CardTitle>
              <CardDescription>
                Navigate to a project page to add coding sessions with metrics (tokens, duration,
                cost, file changes).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  View Projects
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>
                View aggregated metrics across all your projects and sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button variant="outline" className="gap-2">
                  View Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
