'use client';

import { useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type HistoryRow = {
  id: string;
  date: string;
  exerciseName: string;
  reps: number;
  weight: number;
  volume: number;
};

type SortColumn = 'date' | 'exerciseName' | 'reps' | 'weight' | 'volume';
type SortDirection = 'asc' | 'desc';

const COLUMNS: { key: SortColumn; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'exerciseName', label: 'Exercise' },
  { key: 'reps', label: 'Reps' },
  { key: 'weight', label: 'Weight' },
  { key: 'volume', label: 'Volume' },
];

const ALL_EXERCISES = 'all';

export function WorkoutHistoryTable({ rows }: { rows: HistoryRow[] }) {
  const [exerciseFilter, setExerciseFilter] = useState(ALL_EXERCISES);
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const exerciseOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.exerciseName))).sort(),
    [rows],
  );

  const visibleRows = useMemo(() => {
    const filtered =
      exerciseFilter === ALL_EXERCISES
        ? rows
        : rows.filter((row) => row.exerciseName === exerciseFilter);

    return [...filtered].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      const comparison =
        typeof aValue === 'number' && typeof bValue === 'number'
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue));
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [rows, exerciseFilter, sortColumn, sortDirection]);

  function toggleSort(column: SortColumn) {
    if (column === sortColumn) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label htmlFor="exercise-filter">Exercise</Label>
        <Select value={exerciseFilter} onValueChange={(value) => value && setExerciseFilter(value)}>
          <SelectTrigger id="exercise-filter" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_EXERCISES}>All exercises</SelectItem>
            {exerciseOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {visibleRows.length === 0 ? (
        <p className="text-muted-foreground text-sm">No sets logged yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              {COLUMNS.map((column) => (
                <th key={column.key} className="py-2 font-medium">
                  <button
                    type="button"
                    aria-label={`Sort by ${column.label}`}
                    className="flex items-center gap-1"
                    onClick={() => toggleSort(column.key)}
                  >
                    {column.label}
                    {sortColumn === column.key && (
                      <span aria-hidden="true">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="py-2">{row.date}</td>
                <td className="py-2">{row.exerciseName}</td>
                <td className="py-2">{row.reps}</td>
                <td className="py-2">{row.weight}</td>
                <td className="py-2">{row.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
