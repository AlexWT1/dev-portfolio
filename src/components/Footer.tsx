import Link from 'next/link';
import { Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Built with{' '}
          <Heart className="inline-block h-3.5 w-3.5 text-red-500" fill="currentColor" />{' '}
          using AI agents
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            <Github className="h-5 w-5" />
          </Link>
          <Link
            href="/admin"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
