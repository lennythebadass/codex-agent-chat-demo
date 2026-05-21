export function ElementBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex h-5 items-center rounded border border-white/8 bg-white/[0.035] px-1.5 font-mono text-[10px] text-neutral-500">
      {children}
    </span>
  );
}

export function PreviewThumb({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-lg border border-neutral-800 bg-neutral-100 p-2 shadow-2xl shadow-black/20 ${
        compact ? "h-28 w-20" : "h-28 w-44"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="h-2 w-12 rounded-full bg-neutral-300" />
        <div className="h-3 w-8 rounded-full bg-emerald-500/80" />
      </div>
      <div className="rounded-md border border-neutral-200 bg-white p-2">
        <div className="mb-2 h-2 w-2/3 rounded bg-neutral-800" />
        <div className="space-y-1.5">
          <div className="h-1.5 rounded bg-neutral-200" />
          <div className="h-1.5 w-4/5 rounded bg-neutral-200" />
          <div className="h-1.5 w-3/5 rounded bg-neutral-200" />
        </div>
        <div className="mt-5 h-5 rounded bg-neutral-900" />
      </div>
    </div>
  );
}

export function GitMini() {
  return (
    <svg
      aria-hidden
      className="size-3.5 shrink-0 text-neutral-500"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M4 3v5a4 4 0 0 0 4 4h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
      <path
        d="M4 5.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 14.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}
