export function LoadingBlock({ label = "불러오는 중…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-sm text-on-surface-variant">
      {/* MD3 circular progress indicator */}
      <span className="size-8 animate-spin rounded-full border-4 border-primary-container border-t-primary" />
      {label}
    </div>
  );
}
