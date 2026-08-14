import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from '@repo/ui';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

// Page-level composition of Popover + Calendar (both @repo/ui primitives),
// per UI-SPEC's Component Inventory — NOT a new @repo/ui primitive.
export function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from?: Date;
  to?: Date;
  onChange: (range: { from?: Date; to?: Date }) => void;
}) {
  const selected: DateRange | undefined =
    from || to ? { from, to } : undefined;

  const label =
    from && to
      ? `${format(from, 'MMM d, yyyy')} - ${format(to, 'MMM d, yyyy')}`
      : from
        ? format(from, 'MMM d, yyyy')
        : 'Pick a date range';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[260px] justify-start text-left font-normal"
        >
          <CalendarIcon />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={selected}
          onSelect={(range) =>
            onChange({ from: range?.from, to: range?.to })
          }
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
