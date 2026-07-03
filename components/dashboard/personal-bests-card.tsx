import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type PersonalBest = {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  date: string;
};

export function PersonalBestsCard({ bests }: { bests: PersonalBest[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal bests</CardTitle>
      </CardHeader>
      <CardContent>
        {bests.length === 0 ? (
          <p className="text-muted-foreground text-sm">No personal bests yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 font-medium">Exercise</th>
                <th className="py-2 font-medium">Best set</th>
                <th className="py-2 font-medium">Est. 1RM</th>
              </tr>
            </thead>
            <tbody>
              {bests.map((best) => (
                <tr key={best.exerciseId} className="border-b last:border-0">
                  <td className="py-2">{best.exerciseName}</td>
                  <td className="py-2">
                    {best.weight} × {best.reps}
                  </td>
                  <td className="py-2">{best.estimated1RM} lb</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
