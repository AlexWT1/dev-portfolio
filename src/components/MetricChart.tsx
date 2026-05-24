'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SessionRecord } from '@/types';

interface MetricChartProps {
  session: SessionRecord;
}

const COLORS = {
  tokensIn: '#3b82f6',
  tokensOut: '#8b5cf6',
  additions: '#10b981',
  deletions: '#ef4444',
};

export default function MetricChart({ session }: MetricChartProps) {
  const tokenData = [
    { name: 'Tokens In', value: session.tokensIn, fill: COLORS.tokensIn },
    { name: 'Tokens Out', value: session.tokensOut, fill: COLORS.tokensOut },
  ];

  const changeData = [
    { name: 'Additions', value: session.changes.reduce((s, c) => s + c.additions, 0), fill: COLORS.additions },
    { name: 'Deletions', value: session.changes.reduce((s, c) => s + c.deletions, 0), fill: COLORS.deletions },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-md dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Token usage chart */}
      <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <h5 className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Token Usage
        </h5>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={tokenData} barSize={40}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#888' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {tokenData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Code changes chart */}
      <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <h5 className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Code Changes
        </h5>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={changeData} barSize={40}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#888' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {changeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
