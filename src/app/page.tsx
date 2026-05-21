"use client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BadgeCheckIcon,
  BotIcon,
  CheckCircle2Icon,
  FileCode2Icon,
  FileDiffIcon,
  GitBranchIcon,
  Layers2Icon,
  PaperclipIcon,
  PlusIcon,
  RefreshCcwIcon,
  SendHorizontalIcon,
  ShieldCheckIcon,
  SquareTerminalIcon,
  TimerResetIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const FINAL_RESPONSE = `## Implementation summary

The demo now presents Codex as a focused light-theme agent chat:

- The app shell is locked to the viewport.
- The conversation is the only scrolling region.
- The workspace panel was removed so the experience stays on the sidebar and chat.
- The final response continues to stream through Streamdown.

\`\`\`tsx
<Conversation className="min-h-0 flex-1 overflow-hidden">
  <ConversationContent scrollClassName="overflow-y-auto overflow-x-hidden" />
</Conversation>
\`\`\`

- [x] Use AI Elements for conversation, messages, reasoning, tasks, tools, code, and prompt input.
- [x] Render Markdown with heading, list, code, checklist, and table content.
- [ ] Connect the mocked timeline to a real Codex runtime.

| Area | Result | Notes |
| --- | --- | --- |
| Layout | Complete | Two columns, no page overflow |
| Theme | Complete | shadcn semantic colors on Geist |
| Streaming | Running | Replay restarts the response |
`;

const DIFF_CODE = `diff --git a/src/app/page.tsx b/src/app/page.tsx
--- a/src/app/page.tsx
+++ b/src/app/page.tsx
@@ -1,7 +1,13 @@
-<main className="grid min-h-screen grid-cols-[260px_1fr_360px]">
-  <AgentRail />
-  <AgentTimeline />
-  <WorkspaceArtifact />
+<main className="flex h-dvh w-dvw overflow-hidden">
+  <Sidebar />
+  <section className="min-h-0 min-w-0 flex-1 overflow-hidden">
+    <Header />
+    <Conversation />
+    <Composer />
+  </section>
 </main>`;

const TERMINAL_OUTPUT = `$ npm run build

> codex-agent-chat-demo@0.1.0 build
> next build

▲ Next.js 16.2.6
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages`;

const sessions = [
  { title: "Revise chat shell", meta: "Running", active: true },
  { title: "Review AI Elements", meta: "18 min ago", active: false },
  { title: "Polish streaming", meta: "Yesterday", active: false },
];

const branchStats = [
  ["agent/chat-demo", "branch"],
  ["gpt-5.5-codex", "model"],
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

  const approvalLabel = useMemo(() => {
    if (approvalState === "pending") {
      return "Approve";
    }
    if (approvalState === "running") {
      return "Complete";
    }
    return "Reset";
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
    <main className="flex h-dvh w-dvw overflow-hidden bg-background text-foreground">
      <aside className="flex h-full w-[76px] shrink-0 flex-col overflow-hidden border-r bg-muted/30 sm:w-[236px]">
        <div className="shrink-0 border-b p-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
              <BotIcon className="size-4" />
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold">Codex</p>
              <p className="truncate text-xs text-muted-foreground">
                Agent app
              </p>
            </div>
          </div>
          <Button className="mt-3 h-8 w-full justify-center sm:justify-start" type="button">
            <PlusIcon className="size-4" />
            <span className="hidden sm:inline">New task</span>
          </Button>
        </div>

        <div className="shrink-0 border-b p-2">
          <button
            className="flex w-full min-w-0 items-center gap-2 rounded-md border bg-background px-2 py-2 text-left text-sm transition-colors hover:bg-accent"
            type="button"
          >
            <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
            <span className="hidden min-w-0 truncate font-medium sm:block">
              codex-agent-chat-demo
            </span>
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-hidden p-2">
          <p className="hidden px-2 pb-2 text-xs font-medium text-muted-foreground sm:block">
            Recent
          </p>
          <div className="space-y-1">
            {sessions.map((session) => (
              <button
                className={[
                  "flex w-full min-w-0 items-start gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                  session.active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                ].join(" ")}
                key={session.title}
                type="button"
              >
                <BotIcon className="mt-0.5 size-4 shrink-0" />
                <span className="hidden min-w-0 sm:block">
                  <span className="block truncate font-medium">
                    {session.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {session.meta}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </nav>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background px-3 sm:px-4">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-sm font-semibold sm:text-base">
                Revise Codex Agent Chat Demo
              </h1>
              <Badge className="gap-1.5 text-emerald-700" variant="secondary">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Running
              </Badge>
            </div>
            <div className="mt-1 hidden min-w-0 items-center gap-1.5 sm:flex">
              {branchStats.map(([label, value]) => (
                <Badge
                  className="max-w-[180px] gap-1.5 truncate font-normal"
                  key={label}
                  variant="outline"
                >
                  <GitBranchIcon className="size-3" />
                  <span className="truncate">{label}</span>
                  <span className="text-muted-foreground">{value}</span>
                </Badge>
              ))}
            </div>
          </div>
          <Button
            className="shrink-0"
            onClick={replayStream}
            size="sm"
            type="button"
            variant="outline"
          >
            <RefreshCcwIcon className="size-4" />
            <span className="hidden sm:inline">Replay</span>
          </Button>
        </header>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Conversation className="min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
            <ConversationContent
              className="mx-auto w-full max-w-4xl gap-5 px-3 py-5 pb-8 sm:px-6"
              scrollClassName="overflow-y-auto overflow-x-hidden overscroll-contain"
            >
              <Message className="max-w-[760px]" from="user">
                <MessageContent className="rounded-lg border bg-card px-4 py-3 shadow-sm">
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">USER</Badge>
                    <span>Today, 14:36</span>
                  </div>
                  <p className="text-sm leading-6">
                    Revise the demo so the shell never overflows, only the
                    central conversation scrolls, the right workspace panel is
                    gone, and the UI feels like a light shadcn/Geist app.
                  </p>
                </MessageContent>
              </Message>

              <Message className="max-w-[900px]" from="assistant">
                <MessageContent className="w-full gap-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">CODEX</Badge>
                    <span>gpt-5.5-codex</span>
                    <span>/</span>
                    <span className="truncate">autonomous edit session</span>
                  </div>

                  <Reasoning
                    className="rounded-md border bg-card p-3"
                    defaultOpen
                    duration={7}
                    isStreaming={isStreaming}
                  >
                    <ReasoningTrigger />
                    <ReasoningContent>
                      {`I need to constrain the root layout first, then simplify the shell to a sidebar and chat. The important risk is scroll ownership: the page, sidebar, header, and composer should stay fixed while the AI Elements conversation content owns vertical scrolling.`}
                    </ReasoningContent>
                  </Reasoning>

                  <Task className="rounded-md border bg-card p-3">
                    <TaskTrigger title="Plan implementation" />
                    <TaskContent>
                      <TaskItem>
                        Replace the three-column dark shell in{" "}
                        <TaskItemFile>src/app/page.tsx</TaskItemFile>.
                      </TaskItem>
                      <TaskItem>
                        Keep AI Elements components in the mocked timeline.
                      </TaskItem>
                      <TaskItem>
                        Lock root sizing and verify the production build.
                      </TaskItem>
                    </TaskContent>
                  </Task>

                  <Tool className="bg-card" defaultOpen>
                    <ToolHeader
                      state="output-available"
                      title="Inspect installed UI"
                      toolName="read_file"
                      type="dynamic-tool"
                    />
                    <ToolContent className="border-t">
                      <div className="grid min-w-0 gap-2 text-xs sm:grid-cols-3">
                        {[
                          "components.json",
                          "src/app/globals.css",
                          "src/components/ai-elements/conversation.tsx",
                        ].map((file) => (
                          <div
                            className="flex min-w-0 items-center gap-2 rounded-md border bg-muted/40 px-2 py-2 font-mono"
                            key={file}
                          >
                            <FileCode2Icon className="size-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate">{file}</span>
                          </div>
                        ))}
                      </div>
                    </ToolContent>
                  </Tool>

                  <Tool className="bg-card" defaultOpen={false}>
                    <ToolHeader
                      state="output-available"
                      title="Patch layout"
                      toolName="apply_patch"
                      type="dynamic-tool"
                    />
                    <ToolContent className="border-t">
                      <CodeBlock
                        className="bg-background"
                        code={DIFF_CODE}
                        language="diff"
                        showLineNumbers
                      >
                        <CodeBlockHeader>
                          <CodeBlockTitle>
                            <FileDiffIcon className="size-3.5" />
                            <CodeBlockFilename>page.tsx.patch</CodeBlockFilename>
                          </CodeBlockTitle>
                          <CodeBlockCopyButton className="size-7" />
                        </CodeBlockHeader>
                      </CodeBlock>
                    </ToolContent>
                  </Tool>

                  <Tool className="bg-card" defaultOpen>
                    <ToolHeader
                      state={toolStates[approvalState]}
                      title="Run production build"
                      toolName="shell"
                      type="dynamic-tool"
                    />
                    <ToolContent className="border-t">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                          <SquareTerminalIcon className="size-4 shrink-0" />
                          <code className="truncate rounded-md border bg-muted px-2 py-1">
                            npm run build
                          </code>
                        </div>
                        <Button
                          className="h-7"
                          onClick={cycleApproval}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          {approvalState === "pending" ? (
                            <ShieldCheckIcon className="size-3.5 text-amber-600" />
                          ) : (
                            <CheckCircle2Icon className="size-3.5 text-emerald-600" />
                          )}
                          {approvalLabel}
                        </Button>
                      </div>
                      <CodeBlock
                        className="mt-3 bg-background"
                        code={
                          approvalState === "pending"
                            ? "$ npm run build\n\napproval required before running command"
                            : TERMINAL_OUTPUT
                        }
                        language="bash"
                      />
                    </ToolContent>
                  </Tool>

                  <div className="min-w-0 rounded-md border bg-card p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <BadgeCheckIcon className="size-4 shrink-0 text-emerald-600" />
                        <p className="truncate text-sm font-medium">
                          Final response
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {isStreaming ? (
                          <TimerResetIcon className="size-3 animate-spin" />
                        ) : (
                          <CheckCircle2Icon className="size-3 text-emerald-600" />
                        )}
                        {isStreaming ? "streaming" : "complete"}
                      </Badge>
                    </div>
                    <MessageResponse
                      className="prose prose-neutral max-w-none overflow-hidden text-sm leading-6 prose-headings:font-semibold prose-pre:overflow-hidden prose-table:table-fixed prose-table:text-xs prose-td:break-words prose-th:break-words [&_*]:max-w-full"
                      isAnimating={isStreaming}
                    >
                      {streamedMarkdown}
                    </MessageResponse>
                  </div>
                </MessageContent>
              </Message>
            </ConversationContent>
            <ConversationScrollButton className="bg-background shadow-sm" />
          </Conversation>

          <div className="shrink-0 border-t bg-background p-3 sm:p-4">
            <PromptInput className="mx-auto max-w-4xl" onSubmit={() => undefined}>
              <PromptInputTextarea
                className="max-h-24 min-h-16 text-sm"
                placeholder="Ask Codex to build, fix, or explain..."
              />
              <PromptInputFooter className="border-t bg-card">
                <PromptInputTools>
                  <PromptInputButton tooltip="Attach file">
                    <PaperclipIcon className="size-4" />
                  </PromptInputButton>
                  <PromptInputButton tooltip="Context">
                    <Layers2Icon className="size-4" />
                    <span className="hidden sm:inline">Context</span>
                  </PromptInputButton>
                  <PromptInputSelect defaultValue="gpt-5.5-codex">
                    <PromptInputSelectTrigger className="h-8 w-[146px]">
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
                <PromptInputSubmit>
                  <SendHorizontalIcon className="size-4" />
                </PromptInputSubmit>
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </section>
    </main>
  );
}
