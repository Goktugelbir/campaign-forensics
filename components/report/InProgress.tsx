import { Hourglass } from "lucide-react";
import { EmptyState } from "../EmptyState";

/** Shown when a step's JSON file doesn't exist yet — the tab never crashes. */
export function InProgress({ step }: { step: "Evidence" | "Diagnosis" | "Relaunch" }) {
  return (
    <EmptyState
      icon={Hourglass}
      title={`${step} in progress`}
      description="This step of the investigation hasn't produced its file yet. The report fills in as each step finishes."
    />
  );
}
