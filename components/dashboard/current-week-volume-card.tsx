import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type CurrentWeekVolume = {
  totalVolume: number;
  totalSets: number;
  workoutCount: number;
} | null;

export function CurrentWeekVolumeCard({ data }: { data: CurrentWeekVolume }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
      </CardHeader>
      <CardContent>
        {data === null ? (
          <p className="text-muted-foreground text-sm">No workouts logged this week.</p>
        ) : (
          <dl className="grid grid-cols-3 gap-2 text-center">
            <div>
              <dt className="text-muted-foreground text-xs">Volume</dt>
              <dd className="text-lg font-semibold">{data.totalVolume.toLocaleString()} lb</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Sets</dt>
              <dd className="text-lg font-semibold">{data.totalSets}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Workouts</dt>
              <dd className="text-lg font-semibold">{data.workoutCount}</dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
