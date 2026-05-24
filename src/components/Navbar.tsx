'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, Code2, BarChart3, Settings, LogOut, Github } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Projects', icon: Code2 },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuth = status === 'authenticated';

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
            <Code2 className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Dev Portfolio</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'gap-2',
                    isActive && 'dark:bg-zinc-800 dark:text-zinc-50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}

          {isAuth && (
            <Link href="/settings">
              <Button variant={pathname === '/settings' ? 'default' : 'ghost'} size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
          )}

          {/* User menu */}
          {isAuth ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2 h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                    <AvatarFallback className="text-xs">
                      {session.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium">{session.user?.name}</div>
                <div className="px-2 pb-1.5 text-xs text-zinc-500">{session.user?.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="gap-2 text-red-500">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="ml-2 gap-2"
              onClick={() => signIn('github')}
            >
              <Github className="h-4 w-4" />
              Sign in
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-zinc-200 dark:border-zinc-800 sm:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className="w-full justify-start gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
              {isAuth && (
                <Link href="/settings" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              )}
              {isAuth ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-red-500"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="w-full justify-start gap-2"
                  onClick={() => signIn('github')}
                >
                  <Github className="h-4 w-4" />
                  Sign in
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
