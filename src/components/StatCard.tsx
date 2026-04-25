import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "info" | "destructive" | "muted";
  className?: string;
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  info: "text-info",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
};

export function StatCard({ label, value, hint, tone = "default", className }: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-lg border border-border bg-surface px-5 py-4 transition-colors hover:border-foreground/20",
        className
      )}
    >
      <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className={cn("font-mono text-[28px] font-semibold leading-none tracking-tight", toneClasses[tone])}>
        {value}
      </div>
      {hint && (
        <div className="mt-2 text-[11px] text-muted-foreground">{hint}</div>
      )}
    </div>
  );
}
