'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { AggregatedMetrics } from '@/types';
import { formatTokens, formatCost, formatDuration } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardChartsProps {
  metrics: AggregatedMetrics;
}

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-md dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardCharts({ metrics }: DashboardChartsProps) {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.totalProjects}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.totalSessions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Total Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatTokens(metrics.totalTokens)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCost(metrics.totalCostUSD)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Total Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatDuration(metrics.totalDurationMinutes)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tokens over time */}
      {metrics.tokensByDay.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tokens Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metrics.tokensByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:opacity-20" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#888' }}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(v) => formatTokens(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="tokens"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#3b82f6' }}
                  name="Tokens"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Models distribution */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Models</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topModels.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={metrics.topModels}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="tokens"
                      nameKey="model"
                      label={({ model, percent }) =>
                        `${model} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {metrics.topModels.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-1">
                  {metrics.topModels.map((m, i) => (
                    <div key={m.model} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        {m.model}
                      </span>
                      <span className="text-zinc-500">
                        {m.count} sessions &middot; {formatTokens(m.tokens)} tokens
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-zinc-500">No data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Languages</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topLanguages.length > 0 ? (
              <div className="space-y-3">
                {metrics.topLanguages.map((lang, i) => (
                  <div key={lang.language} className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="flex-1 text-sm">{lang.language}</span>
                    <span className="text-sm text-zinc-500">{lang.count} projects</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
