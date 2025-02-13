import { useQuery } from "@tanstack/react-query";
import { type Completion } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { subDays, format, isSameDay } from "date-fns";

export default function Heatmap() {
  const { data: completions } = useQuery<Completion[]>({
    queryKey: ["/api/completions"],
  });

  // Generate last 90 days
  const days = Array.from({ length: 90 }, (_, i) => {
    const date = subDays(new Date(), i);
    const count = completions?.filter(c => 
      isSameDay(new Date(c.completedAt), date)
    ).length || 0;
    return { date, count };
  }).reverse();

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-secondary";
    if (count <= 2) return "bg-primary/30";
    if (count <= 4) return "bg-primary/60";
    return "bg-primary";
  };

  return (
    <Card className="p-4">
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <div className="space-y-2 text-sm text-muted-foreground pr-2">
          <div>Mon</div>
          <div>Wed</div>
          <div>Fri</div>
          <div>Sun</div>
        </div>
        
        <div className="grid grid-cols-[repeat(13,1fr)] gap-1">
          {days.map(({ date, count }) => (
            <div
              key={date.toISOString()}
              className={`
                aspect-square rounded-sm ${getIntensity(count)}
                group relative
              `}
            >
              <div className="
                opacity-0 group-hover:opacity-100
                absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                bg-popover text-popover-foreground text-xs
                rounded px-2 py-1 whitespace-nowrap
              ">
                {format(date, "MMM d, yyyy")}: {count} completions
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
