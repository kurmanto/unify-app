import { getSessionGuide, getPhaseLabel } from "@/lib/rolfing/ten-series";
import { Badge } from "@/components/ui/badge";

const phaseColors: Record<string, string> = {
  sleeve: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  core: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  integration: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export function SessionGuidePreview({ sessionNumber }: { sessionNumber: number }) {
  const guide = getSessionGuide(sessionNumber);
  if (!guide) return null;

  return (
    <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium">
          Session {guide.session}: {guide.name}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${phaseColors[guide.phase] ?? ""}`}
        >
          {getPhaseLabel(guide.phase)}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {guide.focus_areas.map((area) => (
          <Badge key={area} variant="secondary" className="text-xs">
            {area}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {guide.philosophy}
      </p>
    </div>
  );
}
