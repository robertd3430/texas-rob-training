import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type RecentWorkout = {
  id: string;
  date: string;
  routineName: string | null;
  exerciseNames: string[];
  totalSets: number;
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function RecentWorkoutsCard({ workouts }: { workouts: RecentWorkout[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent workouts</CardTitle>
      </CardHeader>
      <CardContent>
        {workouts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No workouts logged yet.</p>
        ) : (
          <ul className="space-y-3">
            {workouts.map((workout) => (
              <li key={workout.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{formatDate(workout.date)}</span>
                  <span className="text-muted-foreground">{workout.totalSets} sets</span>
                </div>
                <p className="text-muted-foreground">
                  {workout.routineName ? `${workout.routineName} — ` : ''}
                  {workout.exerciseNames.length > 0
                    ? workout.exerciseNames.join(', ')
                    : 'No sets logged'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
