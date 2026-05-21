"use client";

import { ArtifactPanel } from "@/components/demo/artifact-panel";
import { ElementBadge, PreviewThumb } from "@/components/demo/shared";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Task,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskTrigger,
} from "@/components/ai-elements/task";
import { Button } from "@/components/ui/button";
import {
  baseWorkSteps,
  finalAssistantMarkdown,
  initialUserMessage,
  type ArtifactMode,
  type WorkStep,
} from "@/lib/mock-agent-chat-data";
import {
  ArrowDownIcon,
  BotIcon,
  BoxesIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  Code2Icon,
  FileSearchIcon,
  InfoIcon,
  LayoutPanelTopIcon,
  MicIcon,
  MoreHorizontalIcon,
  PanelRightIcon,
  PaperclipIcon,
  PlayIcon,
  RefreshCwIcon,
  SendIcon,
  ShieldIcon,
  SquareTerminalIcon,
  WorkflowIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const stepIcons: Record<WorkStep["icon"], LucideIcon> = {
  "arrow-down": ArrowDownIcon,
  bot: BotIcon,
  boxes: BoxesIcon,
  "check-circle": CheckCircle2Icon,
  code: Code2Icon,
  "file-search": FileSearchIcon,
  info: InfoIcon,
  "layout-panel": LayoutPanelTopIcon,
  play: PlayIcon,
  refresh: RefreshCwIcon,
  send: SendIcon,
  terminal: SquareTerminalIcon,
  workflow: WorkflowIcon,
};

export function AgentChat() {
  const [artifactMode, setArtifactMode] = useState<ArtifactMode>("map");
  const [artifactOpen, setArtifactOpen] = useState(false);
  const [dynamicSteps, setDynamicSteps] = useState<WorkStep[]>([]);
  const [expandedStepIds, setExpandedStepIds] = useState<Set<string>>(
    () => new Set(["quiet-tools"])
  );
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<"ready" | "submitted">(
    "ready"
  );
  const [streamedMarkdown, setStreamedMarkdown] = useState("");
  const [workflowOpen, setWorkflowOpen] = useState(true);

  const workSteps = useMemo(
    () => [...baseWorkSteps, ...dynamicSteps],
    [dynamicSteps]
  );

  const openArtifact = useCallback((mode: ArtifactMode) => {
    setArtifactMode(mode);
    setArtifactOpen(true);
  }, []);

  const replayStream = useCallback(() => {
    setStreamedMarkdown("");
    setIsStreaming(true);
  }, []);

  const toggleStep = useCallback((id: string, open: boolean) => {
    setExpandedStepIds((current) => {
      const next = new Set(current);
      if (open) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleComposerSubmit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }

      const id = `follow-up-${Date.now()}`;
      setFollowUps((current) => [...current, trimmed]);
      setDynamicSteps((current) => [
        ...current,
        {
          id,
          text: `收到新的跟进：“${trimmed}”。我把它作为 mock agent step 追加到 transcript，并把右侧 Artifact 切到终端状态，模拟 Codex 正在继续处理。`,
          tool: "Queued mock follow-up action",
          detail:
            "这个提交不会调用真实模型，但会更新页面状态，证明 composer 已经接入交互流。",
          command: "mock-agent enqueue follow-up",
          output: `queued: ${trimmed}`,
          patch: "+ appended user follow-up\n+ appended agent step\n+ opened terminal artifact",
          files: ["src/components/demo/agent-chat.tsx"],
          icon: "bot",
          status: "complete",
        },
      ]);
      setExpandedStepIds((current) => new Set(current).add(id));
      openArtifact("terminal");
      setSubmitStatus("submitted");
      window.setTimeout(() => setSubmitStatus("ready"), 650);
    },
    [openArtifact]
  );

  useEffect(() => {
    if (!isStreaming) {
      return;
    }

    let index = 0;
    const interval = window.setInterval(() => {
      index = Math.min(index + 8, finalAssistantMarkdown.length);
      setStreamedMarkdown(finalAssistantMarkdown.slice(0, index));
      if (index >= finalAssistantMarkdown.length) {
        window.clearInterval(interval);
        setIsStreaming(false);
      }
    }, 24);

    return () => window.clearInterval(interval);
  }, [isStreaming]);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#090909]">
      <ChatHeader
        artifactMode={artifactMode}
        artifactOpen={artifactOpen}
        onOpenArtifact={openArtifact}
        onSetArtifactOpen={setArtifactOpen}
      />

      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <Conversation className="h-full min-h-0 overflow-hidden bg-[#090909]">
            <ConversationContent
              className="mx-auto w-full max-w-[880px] gap-0 px-6 pb-56 pt-5"
              scrollClassName="h-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain"
            >
              <div className="mb-8 flex justify-end">
                <div className="max-w-[420px] rounded-2xl bg-[#202020] px-4 py-2 text-[14px] text-neutral-200 shadow-sm">
                  {initialUserMessage}
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between gap-3">
                <button
                  aria-expanded={workflowOpen}
                  className="flex min-w-0 items-center gap-2 rounded-md px-1 py-1 text-left text-[13px] text-neutral-500 transition hover:bg-white/[0.035] hover:text-neutral-300"
                  onClick={() => setWorkflowOpen((open) => !open)}
                  type="button"
                >
                  {workflowOpen ? (
                    <ChevronDownIcon className="size-3.5 shrink-0" />
                  ) : (
                    <ChevronRightIcon className="size-3.5 shrink-0" />
                  )}
                  <span>Worked for 21m 36s</span>
                  <span className="hidden text-neutral-600 sm:inline">
                    {workSteps.length} steps
                  </span>
                </button>
                <ElementBadge>AI Elements: Tool/Task style disclosure</ElementBadge>
              </div>
              <div className="mb-7 h-px bg-neutral-800/80" />

              {workflowOpen ? (
                <>
                  <div className="space-y-7">
                    {/* Mock workSteps -> Task disclosures */}
                    {workSteps.map((step) => (
                      <WorkStepRow
                        expanded={expandedStepIds.has(step.id)}
                        key={step.id}
                        onOpenChange={(open) => toggleStep(step.id, open)}
                        step={step}
                      />
                    ))}
                  </div>

                  <div className="mt-8 flex items-end gap-3">
                    <PreviewThumb />
                    <PreviewThumb compact />
                    <Button
                      className="mb-2 size-8 rounded-full border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                      onClick={() => openArtifact("preview")}
                      size="icon"
                      type="button"
                      variant="outline"
                    >
                      <ArrowDownIcon className="size-4" />
                    </Button>
                  </div>
                </>
              ) : null}

              <div
                className={
                  workflowOpen
                    ? "mt-8 flex items-center justify-between gap-3"
                    : "mt-2 flex items-center justify-between gap-3"
                }
              >
                <ElementBadge>AI Elements: MessageResponse/Streamdown</ElementBadge>
                <Button
                  className="h-7 gap-1.5 border-neutral-800 bg-neutral-900 px-2 text-[12px] text-neutral-300 hover:bg-neutral-800"
                  onClick={replayStream}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <RefreshCwIcon className="size-3.5" />
                  Replay stream
                </Button>
              </div>
              <div className="mt-4 text-[15px] leading-7 text-neutral-300">
                {/* finalAssistantMarkdown -> MessageResponse */}
                <MessageResponse
                  className="prose-invert max-w-none text-neutral-300 [&_*]:border-neutral-800 [&_code]:text-neutral-200 [&_pre]:bg-neutral-950"
                  isAnimating={isStreaming}
                >
                  {streamedMarkdown}
                </MessageResponse>
              </div>

              {followUps.map((followUp) => (
                <div className="mt-8 flex justify-end" key={followUp}>
                  <div className="max-w-[420px] rounded-2xl bg-[#202020] px-4 py-2 text-[14px] text-neutral-200 shadow-sm">
                    {followUp}
                  </div>
                </div>
              ))}
            </ConversationContent>
            <ConversationScrollButton className="bottom-36 border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800" />
          </Conversation>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#090909] via-[#090909]/95 to-transparent px-6 pb-5 pt-16">
            <div className="pointer-events-none mx-auto mb-2 flex max-w-[860px] justify-end">
              <ElementBadge>AI Elements: PromptInput</ElementBadge>
            </div>
            <PromptInput
              className="pointer-events-auto mx-auto max-w-[860px] rounded-3xl border border-neutral-700/80 bg-[#171717] shadow-2xl shadow-black/50"
              // PromptInput submit -> mock follow-up
              onSubmit={(message) => handleComposerSubmit(message.text)}
            >
              <PromptInputTextarea
                className="max-h-28 min-h-16 border-0 bg-transparent px-4 pt-4 text-[15px] text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-0"
                placeholder="Ask for follow-up changes"
              />
              <PromptInputFooter className="border-0 bg-transparent px-3 pb-3 pt-1">
                <PromptInputTools>
                  <PromptInputButton className="text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100">
                    <PaperclipIcon className="size-4" />
                  </PromptInputButton>
                  <PromptInputButton className="gap-1.5 text-amber-400 hover:bg-neutral-800 hover:text-amber-300">
                    <ShieldIcon className="size-4" />
                    <span>Full access</span>
                    <ChevronDownIcon className="size-3" />
                  </PromptInputButton>
                </PromptInputTools>
                <PromptInputTools>
                  <PromptInputSelect defaultValue="5.5-high">
                    <PromptInputSelectTrigger className="h-8 w-[104px] border-0 bg-transparent text-neutral-300 hover:bg-neutral-800">
                      <PromptInputSelectValue />
                    </PromptInputSelectTrigger>
                    <PromptInputSelectContent>
                      <PromptInputSelectItem value="5.5-high">
                        5.5 High
                      </PromptInputSelectItem>
                      <PromptInputSelectItem value="5.5-fast">
                        5.5 Fast
                      </PromptInputSelectItem>
                    </PromptInputSelectContent>
                  </PromptInputSelect>
                  <PromptInputButton className="text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100">
                    <MicIcon className="size-4" />
                  </PromptInputButton>
                  <PromptInputSubmit
                    className="size-8 rounded-full bg-neutral-200 text-neutral-950 hover:bg-white"
                    status={submitStatus}
                  >
                    <SendIcon className="size-4" />
                  </PromptInputSubmit>
                </PromptInputTools>
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>

        {artifactOpen ? (
          <ArtifactPanel
            mode={artifactMode}
            onClose={() => setArtifactOpen(false)}
            onModeChange={openArtifact}
            onReplay={replayStream}
          />
        ) : (
          <button
            className="my-3 mr-3 flex h-[calc(100%-1.5rem)] w-9 shrink-0 items-start justify-center rounded-lg border border-neutral-800 bg-neutral-950/40 pt-3 text-neutral-500 transition hover:bg-neutral-900 hover:text-neutral-200"
            onClick={() => openArtifact("map")}
            type="button"
          >
            <PanelRightIcon className="size-4" />
            <span className="sr-only">Open Artifact panel</span>
          </button>
        )}
      </div>
    </section>
  );
}

function ChatHeader({
  artifactMode,
  artifactOpen,
  onOpenArtifact,
  onSetArtifactOpen,
}: {
  artifactMode: ArtifactMode;
  artifactOpen: boolean;
  onOpenArtifact: (mode: ArtifactMode) => void;
  onSetArtifactOpen: (open: boolean) => void;
}) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 px-5">
      <div className="flex min-w-0 items-center gap-2">
        <h1 className="truncate text-[15px] font-medium text-neutral-200">
          Improve agent workspace
        </h1>
        <ElementBadge>AI Elements: Conversation</ElementBadge>
        <Button
          className="size-7 text-neutral-500 hover:text-neutral-200"
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 text-neutral-500">
        <Button
          className="h-7 gap-1.5 border-neutral-800 bg-neutral-900 px-2 text-neutral-300 hover:bg-neutral-800"
          onClick={() => onOpenArtifact("preview")}
          size="sm"
          type="button"
          variant="outline"
        >
          <PlayIcon className="size-3.5" />
          <span className="hidden text-[12px] md:inline">Run Preview</span>
        </Button>
        <Button
          className="h-7 gap-1.5 border-neutral-800 bg-neutral-900 px-2 text-neutral-300 hover:bg-neutral-800"
          onClick={() => onOpenArtifact("vscode")}
          size="sm"
          type="button"
          variant="outline"
        >
          <Code2Icon className="size-3.5 text-blue-400" />
          <span className="hidden text-[12px] md:inline">VS Code</span>
        </Button>
        <Button
          className="size-7 text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200"
          onClick={() => onOpenArtifact("terminal")}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <SquareTerminalIcon className="size-4" />
          <span className="sr-only">Terminal</span>
        </Button>
        <Button
          className="size-7 text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200"
          onClick={() => onOpenArtifact("info")}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <InfoIcon className="size-4" />
          <span className="sr-only">Info</span>
        </Button>
        <Button
          className="size-7 text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200"
          onClick={() =>
            artifactOpen && artifactMode === "map"
              ? onSetArtifactOpen(false)
              : onOpenArtifact("map")
          }
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <PanelRightIcon className="size-4" />
          <span className="sr-only">Panel</span>
        </Button>
      </div>
    </header>
  );
}

function WorkStepRow({
  expanded,
  onOpenChange,
  step,
}: {
  expanded: boolean;
  onOpenChange: (open: boolean) => void;
  step: WorkStep;
}) {
  const Icon = stepIcons[step.icon];

  return (
    <div>
      <p className="whitespace-pre-wrap text-[15px] leading-7 text-neutral-300">
        {step.text}
      </p>
      <Task
        className="mt-3"
        defaultOpen={false}
        onOpenChange={onOpenChange}
        open={expanded}
      >
        <TaskTrigger
          className="flex max-w-full items-center gap-2 text-left text-[13px] text-neutral-500 transition hover:text-neutral-300"
          title={step.tool}
        >
          <Icon className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{step.tool}</span>
          <span
            className={`size-1.5 shrink-0 rounded-full ${
              step.status === "complete" ? "bg-emerald-500" : "bg-amber-400"
            }`}
          />
          <ChevronDownIcon className="size-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
        </TaskTrigger>
        <TaskContent className="max-w-[780px]">
          <TaskItem>{step.detail}</TaskItem>
          <div className="flex flex-wrap gap-1.5">
            {step.files.map((file) => (
              <TaskItemFile
                className="border-neutral-800 bg-neutral-900 text-neutral-300"
                key={file}
              >
                {file}
              </TaskItemFile>
            ))}
          </div>
          <div className="rounded-md border border-neutral-800 bg-neutral-950/70 p-3 font-mono text-[12px] text-neutral-400">
            <div className="mb-2 text-neutral-500">$ {step.command}</div>
            <pre className="whitespace-pre-wrap">{step.output}</pre>
          </div>
          <div className="rounded-md border border-neutral-800 bg-neutral-950/40 p-3">
            <div className="mb-1 text-[12px] font-medium text-neutral-500">
              Patch summary
            </div>
            <pre className="whitespace-pre-wrap font-mono text-[12px] text-neutral-400">
              {step.patch}
            </pre>
          </div>
        </TaskContent>
      </Task>
    </div>
  );
}
