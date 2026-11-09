import type { EditableScore } from "@/features/admin/types";

type PublishScoreSummaryProps = {
  score: EditableScore | null;
};

export function PublishScoreSummary({ score }: PublishScoreSummaryProps) {
  const scoreFileName = score?.file_name ?? "No score";
  return (
    <section className="space-y-2">
      <h3 className="px-3 text-sm font-semibold">Score</h3>
      <div className="rounded-md px-3 py-2 text-sm">{scoreFileName}</div>
    </section>
  );
}
