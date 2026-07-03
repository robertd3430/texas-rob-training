'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

export type WeeklyVolumePoint = { weekStart: string; totalVolume: number };

function formatWeekLabel(weekStart: string) {
  return new Date(`${weekStart}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function VolumeTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <div className="bg-popover text-popover-foreground rounded-lg border px-3 py-2 text-sm shadow-md">
      <p className="text-muted-foreground">{formatWeekLabel(String(point.payload.weekStart))}</p>
      <p className="font-semibold">{Number(point.value).toLocaleString()} lb</p>
    </div>
  );
}

export function WeeklyVolumeChart({ data }: { data: WeeklyVolumePoint[] }) {
  if (data.length === 0) {
    return <p className="text-muted-foreground text-sm">No workouts logged yet.</p>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="weekStart"
            tickFormatter={formatWeekLabel}
            tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            content={(props) => <VolumeTooltip {...props} />}
            cursor={{ fill: 'var(--color-muted)' }}
          />
          <Bar
            dataKey="totalVolume"
            name="Volume"
            fill="var(--color-primary)"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
