"use client";

import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactClose,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
} from "@/components/ai-elements/artifact";
import { ElementBadge, PreviewThumb } from "@/components/demo/shared";
import {
  artifactCopy,
  terminalLog,
  type ArtifactMode,
} from "@/lib/mock-agent-chat-data";
import {
  CheckCircle2Icon,
  Code2Icon,
  InfoIcon,
  PanelRightIcon,
  PlayIcon,
  RefreshCwIcon,
  TerminalIcon,
} from "lucide-react";

export function ArtifactPanel({
  mode,
  onClose,
  onModeChange,
  onReplay,
}: {
  mode: ArtifactMode;
  onClose: () => void;
  onModeChange: (mode: ArtifactMode) => void;
  onReplay: () => void;
}) {
  const copy = artifactCopy[mode];

  return (
    <aside className="h-full w-[340px] shrink-0 overflow-hidden border-neutral-800 border-l bg-[#0c0c0c] p-3">
      <Artifact className="h-full rounded-lg border-neutral-800 bg-[#101010] text-neutral-100 shadow-none">
        <ArtifactHeader className="border-neutral-800 bg-[#141414] px-3 py-2">
          <div className="min-w-0">
            <div className="mb-1">
              <ElementBadge>AI Elements: Artifact</ElementBadge>
            </div>
            <ArtifactTitle className="truncate text-neutral-100">
              {copy.title}
            </ArtifactTitle>
            <ArtifactDescription className="line-clamp-2 text-[12px] text-neutral-500">
              {copy.description}
            </ArtifactDescription>
          </div>
          <ArtifactActions>
            <ArtifactAction
              className="text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100"
              icon={RefreshCwIcon}
              label="Replay stream"
              onClick={onReplay}
              tooltip="Replay stream"
            />
            <ArtifactClose
              className="text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100"
              onClick={onClose}
            />
          </ArtifactActions>
        </ArtifactHeader>
        <ArtifactContent className="min-h-0 overflow-y-auto p-3">
          <div className="mb-3 grid grid-cols-5 gap-1">
            {(
              [
                ["preview", PlayIcon],
                ["vscode", Code2Icon],
                ["terminal", TerminalIcon],
                ["info", InfoIcon],
                ["map", PanelRightIcon],
              ] as const
            ).map(([itemMode, Icon]) => (
              <button
                className={`flex h-8 items-center justify-center rounded-md border text-neutral-400 transition ${
                  mode === itemMode
                    ? "border-neutral-600 bg-neutral-800 text-neutral-100"
                    : "border-neutral-800 bg-neutral-950/30 hover:bg-neutral-900 hover:text-neutral-200"
                }`}
                key={itemMode}
                onClick={() => onModeChange(itemMode)}
                type="button"
              >
                <Icon className="size-3.5" />
                <span className="sr-only">{itemMode}</span>
              </button>
            ))}
          </div>
          <ArtifactBody mode={mode} />
        </ArtifactContent>
      </Artifact>
    </aside>
  );
}

function ArtifactBody({ mode }: { mode: ArtifactMode }) {
  if (mode === "preview") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
          <div className="mb-3 flex items-center justify-between text-[12px] text-neutral-500">
            <span>localhost preview</span>
            <span className="text-emerald-400">ready</span>
          </div>
          <PreviewThumb />
        </div>
        <StatusList
          items={[
            "Toolbar controls change Artifact content",
            "Transcript owns scroll",
            "Composer appends mock follow-up",
          ]}
        />
      </div>
    );
  }

  if (mode === "vscode") {
    return (
      <div className="space-y-3">
        <div className="rounded-md border border-neutral-800 bg-neutral-950/60 p-3">
          <div className="mb-2 flex items-center gap-2 text-[13px] text-neutral-300">
            <Code2Icon className="size-4 text-blue-400" />
            Workspace
          </div>
          <div className="space-y-1 font-mono text-[12px] text-neutral-500">
            <div>codex-agent-chat-demo</div>
            <div className="text-neutral-300">src/app/page.tsx</div>
            <div>src/components/ai-elements/artifact.tsx</div>
            <div>src/components/ai-elements/task.tsx</div>
          </div>
        </div>
        <p className="text-[13px] leading-6 text-neutral-400">
          This tab simulates editor context for the demo. It intentionally keeps
          the right rail narrow and task-focused.
        </p>
      </div>
    );
  }

  if (mode === "terminal") {
    return (
      <div className="space-y-3">
        <pre className="overflow-x-auto rounded-md border border-neutral-800 bg-neutral-950 p-3 font-mono text-[12px] leading-5 text-neutral-400">
          {terminalLog}
        </pre>
        <StatusList
          items={[
            "Mock terminal opened by toolbar and composer submit",
            "Build command is shown in Artifact content",
            "Close button collapses the panel",
          ]}
        />
      </div>
    );
  }

  if (mode === "info") {
    return (
      <div className="space-y-3 text-[13px] leading-6 text-neutral-400">
        <p>
          The shell keeps the Codex-like restraint, but the controls now have
          visible state changes. The right panel is optional, and the main
          transcript remains readable when it is closed.
        </p>
        <StatusList
          items={[
            "Generic demo project labels replace screenshot text",
            "Tool rows expand on click",
            "Replay stream restarts MessageResponse output",
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ElementMapRow
        label="Conversation / ConversationContent / ConversationScrollButton"
        value="Center transcript and scroll-to-bottom control"
      />
      <ElementMapRow
        label="PromptInput / Textarea / Footer / Tools / Submit"
        value="Floating bottom composer"
      />
      <ElementMapRow
        label="MessageResponse / Streamdown"
        value="Replayable streamed markdown response"
      />
      <ElementMapRow
        label="Artifact / Header / Title / Description / Actions / Content"
        value="Optional right-side panel"
      />
      <ElementMapRow
        label="Task / TaskTrigger / TaskContent / TaskItem / TaskItemFile"
        value="Quiet expandable tool-step details"
      />
    </div>
  );
}

function StatusList({ items }: { items: string[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          className="flex items-start gap-2 rounded-md border border-neutral-800 bg-neutral-950/40 p-2 text-[12px] leading-5 text-neutral-400"
          key={item}
        >
          <CheckCircle2Icon className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function ElementMapRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950/50 p-3">
      <div className="mb-1 font-mono text-[11px] text-neutral-300">
        {label}
      </div>
      <div className="text-[12px] leading-5 text-neutral-500">{value}</div>
    </div>
  );
}
