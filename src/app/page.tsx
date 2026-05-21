"use client";

import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
} from "@/components/ai-elements/artifact";
import {
  CodeBlock,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ai-elements/code-block";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  FileTree,
  FileTreeFile,
  FileTreeFolder,
} from "@/components/ai-elements/file-tree";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
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
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Task,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskTrigger,
} from "@/components/ai-elements/task";
import { Tool, ToolContent, ToolHeader } from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import {
  ArchiveIcon,
  BadgeCheckIcon,
  BellIcon,
  BotIcon,
  BoxesIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  CircleDotIcon,
  Clock3Icon,
  Code2Icon,
  CopyIcon,
  FileCode2Icon,
  FileDiffIcon,
  GitBranchIcon,
  GitCommitHorizontalIcon,
  GitPullRequestArrowIcon,
  HardDriveIcon,
  HistoryIcon,
  Layers2Icon,
  ListChecksIcon,
  LockIcon,
  MoreHorizontalIcon,
  PanelRightIcon,
  PaperclipIcon,
  PlayIcon,
  PlusIcon,
  RefreshCcwIcon,
  SearchIcon,
  SendHorizontalIcon,
  Settings2Icon,
  ShieldCheckIcon,
  SparklesIcon,
  SplitIcon,
  SquareTerminalIcon,
  TimerResetIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const FINAL_RESPONSE = `## Implementation summary

The Codex App chat demo now behaves like a focused coding-agent workspace:

- Added a dark desktop shell with a project rail, session list, model/branch badges, and running status.
- Built an autonomous agent timeline with planning, file inspection, patching, terminal output, and a final streamed answer.
- Rendered file context beside the conversation with a selectable tree and code/diff preview.
- Wired mock controls for replaying the stream and approving the queued command.

\`\`\`tsx
<MessageResponse isAnimating={isStreaming}>
  {streamedMarkdown}
</MessageResponse>
\`\`\`

- [x] Use AI Elements for conversation, messages, prompt input, reasoning, tools, tasks, code, file tree, and artifact panel.
- [x] Show Streamdown markdown while the final assistant response animates.
- [x] Keep the experience mocked and frontend-only.
- [ ] Connect to a real Codex agent runtime.

| Area | Status | Notes |
| --- | --- | --- |
| Timeline | Complete | Dense agent events with collapsible details |
| Streaming | Running | Character chunks feed Streamdown |
| Approval | Mocked | Toggle switches queued/running/completed states |
| Files | Complete | Tree, diff, and command output are visible |
`;

const DIFF_CODE = `diff --git a/src/app/page.tsx b/src/app/page.tsx
index 0f15a2b..a9d03ee 100644
--- a/src/app/page.tsx
+++ b/src/app/page.tsx
@@ -1,16 +1,42 @@
-export default function Home() {
-  return <main>Start here</main>;
-}
+"use client";
+
+export default function Home() {
+  return (
+    <main className="grid min-h-screen grid-cols-[260px_1fr_360px]">
+      <AgentRail />
+      <AgentTimeline />
+      <WorkspaceArtifact />
+    </main>
+  );
+}`;

const PAGE_SNIPPET = `const agentSteps = [
  { label: "Read app scaffold", state: "done" },
  { label: "Plan Codex-style shell", state: "done" },
  { label: "Patch page.tsx", state: "running" },
  { label: "Run production build", state: "queued" },
];`;

const TERMINAL_OUTPUT = `$ npm run build

> codex-agent-chat-demo@0.1.0 build
> next build

▲ Next.js 16.2.6
✓ Compiled successfully in 3.1s
✓ Linting and checking validity of types
✓ Generating static pages`;

const sessions = [
  {
    title: "Recreate Codex agent chat",
    meta: "Running now",
    active: true,
  },
  {
    title: "Add approval state toggles",
    meta: "18 min ago",
    active: false,
  },
  {
    title: "Inspect AI Elements APIs",
    meta: "Yesterday",
    active: false,
  },
  {
    title: "Polish Streamdown response",
    meta: "May 20",
    active: false,
  },
];

const branchStats = [
  ["main", "clean"],
  ["agent/chat-demo", "+1 file"],
  ["gpt-5.5-codex", "high"],
];

const toolStates = {
  pending: "approval-requested",
  running: "input-available",
  done: "output-available",
} as const;

export default function Home() {
  const [approvalState, setApprovalState] =
    useState<keyof typeof toolStates>("pending");
  const [streamedMarkdown, setStreamedMarkdown] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedPath, setSelectedPath] = useState("src/app/page.tsx");

  const approvalLabel = useMemo(() => {
    if (approvalState === "pending") {
      return "Approve command";
    }
    if (approvalState === "running") {
      return "Mark complete";
    }
    return "Reset approval";
  }, [approvalState]);

  const replayStream = useCallback(() => {
    setStreamedMarkdown("");
    setIsStreaming(true);
  }, []);

  const cycleApproval = useCallback(() => {
    setApprovalState((current) => {
      if (current === "pending") {
        return "running";
      }
      if (current === "running") {
        return "done";
      }
      return "pending";
    });
  }, []);

  useEffect(() => {
    if (!isStreaming) {
      return;
    }

    let index = 0;
    const interval = window.setInterval(() => {
      index = Math.min(index + 8, FINAL_RESPONSE.length);
      setStreamedMarkdown(FINAL_RESPONSE.slice(0, index));

      if (index >= FINAL_RESPONSE.length) {
        window.clearInterval(interval);
        setIsStreaming(false);
      }
    }, 28);

    return () => window.clearInterval(interval);
  }, [isStreaming]);

  return (
    <main className="flex min-h-screen bg-[#080808] text-[#ededed]">
      <aside className="hidden w-[276px] shrink-0 border-[#262626] border-r bg-[#0b0b0b] lg:flex lg:flex-col">
        <div className="border-[#262626] border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md border border-[#303030] bg-[#151515]">
                <SparklesIcon className="size-3.5 text-white" />
              </div>
              <div>
                <p className="text-[13px] font-medium leading-none">Codex</p>
                <p className="mt-1 text-[11px] text-[#8a8a8a]">Agent app</p>
              </div>
            </div>
            <Button
              className="size-7 border-[#2a2a2a] bg-[#111] text-[#a1a1a1] hover:bg-[#1a1a1a] hover:text-white"
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <BellIcon className="size-3.5" />
            </Button>
          </div>

          <div className="mt-4 rounded-md border border-[#252525] bg-[#111] p-2">
            <div className="flex items-center gap-2 text-[#d6d6d6]">
              <HardDriveIcon className="size-3.5 text-[#8a8a8a]" />
              <span className="truncate text-[12px] font-medium">
                codex-agent-chat-demo
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#8a8a8a]">
              <CircleDotIcon className="size-3 text-emerald-400" />
              <span>repo indexed</span>
              <span className="text-[#4a4a4a]">/</span>
              <span>1 changed file</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-[#262626] border-b p-3">
          <Button
            className="h-8 flex-1 justify-start border-[#2a2a2a] bg-[#111] px-2 text-[#cfcfcf] hover:bg-[#1a1a1a]"
            type="button"
            variant="outline"
          >
            <SearchIcon className="size-3.5" />
            Search
          </Button>
          <Button
            className="h-8 border-[#2a2a2a] bg-[#ededed] text-[#0a0a0a] hover:bg-white"
            type="button"
          >
            <PlusIcon className="size-3.5" />
            New
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#6f6f6f]">
              Recent sessions
            </p>
            <HistoryIcon className="size-3.5 text-[#6f6f6f]" />
          </div>
          <div className="space-y-1">
            {sessions.map((session) => (
              <button
                className={[
                  "w-full rounded-md border px-2.5 py-2 text-left transition-colors",
                  session.active
                    ? "border-[#333] bg-[#171717] text-white"
                    : "border-transparent text-[#b8b8b8] hover:bg-[#121212]",
                ].join(" ")}
                key={session.title}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <BotIcon className="size-3.5 text-[#8a8a8a]" />
                  <span className="truncate text-[12px] font-medium">
                    {session.title}
                  </span>
                </div>
                <p className="mt-1 pl-5 text-[11px] text-[#7a7a7a]">
                  {session.meta}
                </p>
              </button>
            ))}
          </div>
        </nav>

        <div className="border-[#262626] border-t p-3">
          <div className="rounded-md border border-[#252525] bg-[#101010] p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[12px] text-[#dcdcdc]">
                <ShieldCheckIcon className="size-3.5 text-emerald-400" />
                Workspace trusted
              </div>
              <LockIcon className="size-3.5 text-[#6f6f6f]" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#8a8a8a]">
              <div className="rounded border border-[#232323] bg-[#0b0b0b] px-2 py-1.5">
                tests queued
              </div>
              <div className="rounded border border-[#232323] bg-[#0b0b0b] px-2 py-1.5">
                patch ready
              </div>
            </div>
          </div>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-[58px] shrink-0 items-center justify-between border-[#262626] border-b bg-[#0d0d0d]/95 px-3 sm:px-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-[14px] font-medium">
                Recreate Codex App Agent Chat
              </p>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Running
              </span>
            </div>
            <div className="mt-1 hidden items-center gap-1.5 text-[11px] text-[#8a8a8a] sm:flex">
              {branchStats.map(([label, value]) => (
                <span
                  className="inline-flex items-center gap-1 rounded border border-[#252525] bg-[#111] px-1.5 py-0.5"
                  key={label}
                >
                  <GitBranchIcon className="size-3" />
                  {label}
                  <span className="text-[#5f5f5f]">{value}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="h-8 border-[#303030] bg-[#141414] px-2 text-[#dcdcdc] hover:bg-[#1d1d1d]"
              onClick={replayStream}
              type="button"
              variant="outline"
            >
              <RefreshCcwIcon className="size-3.5" />
              <span className="hidden sm:inline">Replay stream</span>
            </Button>
            <Button
              className="size-8 border-[#303030] bg-[#141414] text-[#bdbdbd] hover:bg-[#1d1d1d]"
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-h-0 flex-col border-[#262626] xl:border-r">
            <Conversation className="min-h-0 bg-[#080808]">
              <ConversationContent className="gap-5 px-3 py-5 sm:px-6">
                <Message from="user" className="max-w-[860px]">
                  <MessageContent className="rounded-lg border border-[#2b2b2b] bg-[#171717] px-4 py-3 text-[#ededed] shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                    <div className="mb-2 flex items-center gap-2 text-[11px] text-[#8a8a8a]">
                      <span className="rounded border border-[#333] px-1.5 py-0.5 font-mono">
                        USER
                      </span>
                      <span>Today, 14:36</span>
                    </div>
                    <p className="text-[14px] leading-6">
                      Build a high-fidelity Codex App-style agent chat demo
                      using AI Elements and Streamdown. Make the mocked agent
                      timeline feel like real autonomous coding work.
                    </p>
                  </MessageContent>
                </Message>

                <Message from="assistant" className="max-w-[930px]">
                  <MessageContent className="w-full gap-4">
                    <div className="flex items-center gap-2 text-[11px] text-[#8a8a8a]">
                      <span className="rounded border border-[#303030] bg-[#111] px-1.5 py-0.5 font-mono text-[#d6d6d6]">
                        CODEX
                      </span>
                      <span>gpt-5.5-codex</span>
                      <span className="text-[#454545]">/</span>
                      <span>autonomous edit session</span>
                    </div>

                    <Reasoning
                      className="rounded-md border border-[#262626] bg-[#101010] p-3"
                      defaultOpen
                      duration={7}
                      isStreaming={isStreaming}
                    >
                      <ReasoningTrigger className="text-[#a9a9a9] hover:text-white" />
                      <ReasoningContent className="prose prose-invert max-w-none text-[13px] text-[#a6a6a6]">
                        {`I need to inspect the scaffold and installed components first, then build a single polished client-side page. The demo should prioritize visual fidelity: a dark desktop shell, compact agent timeline, collapsible work blocks, a file artifact surface, and visible Streamdown rendering during the final response.`}
                      </ReasoningContent>
                    </Reasoning>

                    <Task className="rounded-md border border-[#262626] bg-[#0f0f0f] p-3">
                      <TaskTrigger
                        className="text-[#ababab] hover:text-white"
                        title="Plan implementation"
                      />
                      <TaskContent className="text-[#a9a9a9]">
                        <TaskItem>
                          Map page structure from{" "}
                          <TaskItemFile className="border-[#303030] bg-[#171717] text-[#e5e5e5]">
                            src/app/page.tsx
                          </TaskItemFile>
                        </TaskItem>
                        <TaskItem>
                          Verify AI Elements component APIs before use.
                        </TaskItem>
                        <TaskItem>
                          Stream a Markdown summary through MessageResponse.
                        </TaskItem>
                      </TaskContent>
                    </Task>

                    <Tool
                      className="border-[#262626] bg-[#101010]"
                      defaultOpen
                    >
                      <ToolHeader
                        className="text-[#dadada]"
                        state="output-available"
                        title="Read files"
                        toolName="read_file"
                        type="dynamic-tool"
                      />
                      <ToolContent className="border-[#262626] border-t text-[#bdbdbd]">
                        <div className="grid gap-2 text-[12px] sm:grid-cols-3">
                          {[
                            "src/app/page.tsx",
                            "src/components/ai-elements/message.tsx",
                            "src/components/ai-elements/prompt-input.tsx",
                          ].map((file) => (
                            <div
                              className="flex items-center gap-2 rounded border border-[#252525] bg-[#0a0a0a] px-2 py-1.5 font-mono text-[#cfcfcf]"
                              key={file}
                            >
                              <FileCode2Icon className="size-3.5 text-[#8a8a8a]" />
                              <span className="truncate">{file}</span>
                            </div>
                          ))}
                        </div>
                      </ToolContent>
                    </Tool>

                    <Tool
                      className="border-[#262626] bg-[#101010]"
                      defaultOpen={false}
                    >
                      <ToolHeader
                        className="text-[#dadada]"
                        state="output-available"
                        title="Apply patch"
                        toolName="apply_patch"
                        type="dynamic-tool"
                      />
                      <ToolContent className="border-[#262626] border-t">
                        <CodeBlock
                          className="border-[#262626] bg-[#0b0b0b]"
                          code={DIFF_CODE}
                          language="diff"
                          showLineNumbers
                        >
                          <CodeBlockHeader className="border-[#252525] bg-[#151515]">
                            <CodeBlockTitle>
                              <FileDiffIcon className="size-3.5" />
                              <CodeBlockFilename>
                                page.tsx.patch
                              </CodeBlockFilename>
                            </CodeBlockTitle>
                            <CodeBlockCopyButton className="size-6 text-[#9a9a9a]" />
                          </CodeBlockHeader>
                        </CodeBlock>
                      </ToolContent>
                    </Tool>

                    <Tool
                      className="border-[#262626] bg-[#101010]"
                      defaultOpen
                    >
                      <ToolHeader
                        className="text-[#dadada]"
                        state={toolStates[approvalState]}
                        title="Run production build"
                        toolName="shell"
                        type="dynamic-tool"
                      />
                      <ToolContent className="border-[#262626] border-t">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-[12px] text-[#a9a9a9]">
                            <SquareTerminalIcon className="size-4 text-[#8a8a8a]" />
                            <code className="rounded border border-[#303030] bg-[#090909] px-2 py-1 text-[#dcdcdc]">
                              npm run build
                            </code>
                          </div>
                          <Button
                            className={[
                              "h-7 border px-2 text-[12px]",
                              approvalState === "pending"
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15"
                                : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15",
                            ].join(" ")}
                            onClick={cycleApproval}
                            type="button"
                            variant="outline"
                          >
                            {approvalState === "pending" ? (
                              <ShieldCheckIcon className="size-3.5" />
                            ) : (
                              <CheckCircle2Icon className="size-3.5" />
                            )}
                            {approvalLabel}
                          </Button>
                        </div>
                        <CodeBlock
                          className="mt-3 border-[#262626] bg-[#070707]"
                          code={
                            approvalState === "pending"
                              ? "$ npm run build\n\napproval required before running command"
                              : TERMINAL_OUTPUT
                          }
                          language="bash"
                        />
                      </ToolContent>
                    </Tool>

                    <div className="rounded-md border border-[#262626] bg-[#101010] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BadgeCheckIcon className="size-4 text-emerald-400" />
                          <p className="text-[13px] font-medium text-[#e8e8e8]">
                            Final response
                          </p>
                        </div>
                        <span className="rounded-full border border-[#303030] bg-[#141414] px-2 py-0.5 text-[11px] text-[#8a8a8a]">
                          {isStreaming ? "streaming" : "complete"}
                        </span>
                      </div>
                      <MessageResponse
                        className="prose prose-invert max-w-none text-[14px] leading-6 text-[#e7e7e7] prose-a:text-white prose-code:text-[#f0f0f0] prose-headings:text-white prose-li:marker:text-[#8a8a8a] prose-pre:border prose-pre:border-[#292929] prose-pre:bg-[#090909] prose-table:text-[13px] prose-th:border-[#303030] prose-td:border-[#303030]"
                        isAnimating={isStreaming}
                      >
                        {streamedMarkdown}
                      </MessageResponse>
                    </div>
                  </MessageContent>
                </Message>
              </ConversationContent>
              <ConversationScrollButton className="border-[#303030] bg-[#171717] text-white hover:bg-[#222]" />
            </Conversation>

            <div className="shrink-0 border-[#262626] border-t bg-[#0d0d0d] p-3 sm:p-4">
              <PromptInput
                className="mx-auto max-w-4xl"
                onSubmit={() => undefined}
              >
                <PromptInputTextarea
                  className="min-h-20 text-[14px] text-[#ededed] placeholder:text-[#6f6f6f]"
                  placeholder="Ask Codex to build, fix, or explain..."
                />
                <PromptInputFooter className="border-[#242424] border-t bg-[#101010]">
                  <PromptInputTools>
                    <PromptInputButton className="text-[#a7a7a7] hover:bg-[#1c1c1c] hover:text-white">
                      <PaperclipIcon className="size-4" />
                    </PromptInputButton>
                    <PromptInputButton className="text-[#a7a7a7] hover:bg-[#1c1c1c] hover:text-white">
                      <Layers2Icon className="size-4" />
                      <span className="hidden sm:inline">Context</span>
                    </PromptInputButton>
                    <PromptInputSelect defaultValue="gpt-5.5-codex">
                      <PromptInputSelectTrigger className="h-8 w-[146px] text-[#bdbdbd] hover:bg-[#1c1c1c]">
                        <PromptInputSelectValue />
                      </PromptInputSelectTrigger>
                      <PromptInputSelectContent>
                        <PromptInputSelectItem value="gpt-5.5-codex">
                          gpt-5.5-codex
                        </PromptInputSelectItem>
                        <PromptInputSelectItem value="gpt-5.4">
                          gpt-5.4
                        </PromptInputSelectItem>
                      </PromptInputSelectContent>
                    </PromptInputSelect>
                  </PromptInputTools>
                  <PromptInputSubmit className="bg-[#ededed] text-[#080808] hover:bg-white">
                    <SendHorizontalIcon className="size-4" />
                  </PromptInputSubmit>
                </PromptInputFooter>
              </PromptInput>
            </div>
          </div>

          <aside className="min-h-0 bg-[#0b0b0b] p-3 xl:block">
            <Artifact className="h-full rounded-lg border-[#262626] bg-[#101010] shadow-none">
              <ArtifactHeader className="border-[#262626] bg-[#141414] px-3 py-2.5">
                <div className="min-w-0">
                  <ArtifactTitle className="flex items-center gap-2 text-[#ededed]">
                    <PanelRightIcon className="size-4 text-[#8a8a8a]" />
                    Workspace
                  </ArtifactTitle>
                  <ArtifactDescription className="text-[12px] text-[#8a8a8a]">
                    Files, patch preview, and command context
                  </ArtifactDescription>
                </div>
                <ArtifactActions>
                  <ArtifactAction
                    className="text-[#9a9a9a] hover:bg-[#202020] hover:text-white"
                    icon={CopyIcon}
                    label="Copy"
                  />
                  <ArtifactAction
                    className="text-[#9a9a9a] hover:bg-[#202020] hover:text-white"
                    icon={Settings2Icon}
                    label="Settings"
                  />
                </ArtifactActions>
              </ArtifactHeader>
              <ArtifactContent className="space-y-4 p-3">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["files", "18"],
                    ["edits", "+312"],
                    ["tests", approvalState === "done" ? "pass" : "ready"],
                  ].map(([label, value]) => (
                    <div
                      className="rounded-md border border-[#252525] bg-[#0b0b0b] px-2 py-2"
                      key={label}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#6f6f6f]">
                        {label}
                      </p>
                      <p className="mt-1 text-[13px] text-[#ededed]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <FileTree
                  className="border-[#262626] bg-[#0b0b0b] text-[12px] text-[#d4d4d4]"
                  defaultExpanded={new Set(["src", "src/app", "src/components"])}
                  onSelect={setSelectedPath}
                  selectedPath={selectedPath}
                >
                  <FileTreeFolder name="src" path="src">
                    <FileTreeFolder name="app" path="src/app">
                      <FileTreeFile name="page.tsx" path="src/app/page.tsx" />
                      <FileTreeFile
                        name="globals.css"
                        path="src/app/globals.css"
                      />
                    </FileTreeFolder>
                    <FileTreeFolder name="components" path="src/components">
                      <FileTreeFile
                        name="message.tsx"
                        path="src/components/ai-elements/message.tsx"
                      />
                      <FileTreeFile
                        name="prompt-input.tsx"
                        path="src/components/ai-elements/prompt-input.tsx"
                      />
                    </FileTreeFolder>
                  </FileTreeFolder>
                  <FileTreeFile name="package.json" path="package.json" />
                </FileTree>

                <CodeBlock
                  className="border-[#262626] bg-[#080808]"
                  code={selectedPath.endsWith("page.tsx") ? DIFF_CODE : PAGE_SNIPPET}
                  language={selectedPath.endsWith("page.tsx") ? "diff" : "tsx"}
                  showLineNumbers
                >
                  <CodeBlockHeader className="border-[#252525] bg-[#151515]">
                    <CodeBlockTitle>
                      <Code2Icon className="size-3.5" />
                      <CodeBlockFilename>{selectedPath}</CodeBlockFilename>
                    </CodeBlockTitle>
                    <CodeBlockCopyButton className="size-6 text-[#9a9a9a]" />
                  </CodeBlockHeader>
                </CodeBlock>

                <div className="rounded-md border border-[#262626] bg-[#0b0b0b] p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[12px] text-[#dcdcdc]">
                      <ListChecksIcon className="size-4 text-[#8a8a8a]" />
                      Agent queue
                    </div>
                    <span className="text-[11px] text-[#6f6f6f]">
                      4 steps
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[
                      ["Inspect component APIs", "done", CheckCircle2Icon],
                      ["Patch chat layout", "done", CheckCircle2Icon],
                      [
                        "Await build approval",
                        approvalState === "pending" ? "queued" : "done",
                        approvalState === "pending" ? Clock3Icon : CheckCircle2Icon,
                      ],
                      [
                        "Stream final summary",
                        isStreaming ? "running" : "done",
                        isStreaming ? TimerResetIcon : CheckCircle2Icon,
                      ],
                    ].map(([label, state, Icon]) => (
                      <div
                        className="flex items-center gap-2 text-[12px]"
                        key={label as string}
                      >
                        <Icon
                          className={[
                            "size-3.5",
                            state === "running"
                              ? "animate-spin text-amber-300"
                              : state === "queued"
                                ? "text-amber-300"
                                : "text-emerald-400",
                          ].join(" ")}
                        />
                        <span className="min-w-0 flex-1 truncate text-[#cfcfcf]">
                          {label as string}
                        </span>
                        <ChevronRightIcon className="size-3 text-[#555]" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] text-[#a8a8a8]">
                  {[
                    [GitCommitHorizontalIcon, "1 commit staged"],
                    [GitPullRequestArrowIcon, "PR draft ready"],
                    [SplitIcon, "branch agent/chat-demo"],
                    [ArchiveIcon, "no backend"],
                    [BoxesIcon, "AI Elements"],
                    [PlayIcon, "Streamdown replay"],
                  ].map(([Icon, label]) => (
                    <span
                      className="inline-flex items-center gap-1 rounded-full border border-[#262626] bg-[#111] px-2 py-1"
                      key={label as string}
                    >
                      <Icon className="size-3" />
                      {label as string}
                    </span>
                  ))}
                </div>
              </ArtifactContent>
            </Artifact>
          </aside>
        </div>
      </section>
    </main>
  );
}
