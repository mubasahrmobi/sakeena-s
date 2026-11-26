import { Shell } from "@/components/Shell";

/** Shown instantly while an admin page loads: the sidebar stays put and only the content area pulses. */
export default function Loading() {
  return (
    <Shell title="Loading…">
      <div className="animate-pulse space-y-4" aria-busy="true">
        <div className="h-10 w-1/3 bg-ink/10" />
        <div className="h-64 bg-ink/10" />
        <div className="h-10 w-1/2 bg-ink/10" />
      </div>
    </Shell>
  );
}
