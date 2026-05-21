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
  ArrowDownIcon,
  BotIcon,
  BoxesIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleIcon,
  Code2Icon,
  FileSearchIcon,
  FolderIcon,
  InfoIcon,
  LayoutPanelTopIcon,
  MicIcon,
  MoreHorizontalIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PaperclipIcon,
  PlayIcon,
  PlugIcon,
  RefreshCwIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  ShieldIcon,
  SparklesIcon,
  SquareTerminalIcon,
  TerminalIcon,
  WorkflowIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const STREAM_NOTE = `这轮我把中间 Chat 调整成更接近真实 Codex 会话的形态：上方是可折叠的工作过程，下方保留一段完整的最终回复，底部 composer 始终浮在视口内，不参与 transcript 滚动。

### 交互结构

工作流标题行现在独立成一个开关。展开时可以看到从需求拆解、组件审计、滚动归属、Artifact 联动到构建验证的完整过程；收起时只留下最终答复，适合用户快速阅读结论。这个行为比把每个步骤单独折叠更接近实际使用：过程可以整体隐藏，最终结果不会消失。

- 中间 transcript 使用 \`Conversation\` / \`ConversationContent\`，滚动类放在真实的 scroll container 上。
- 工作过程使用 \`Task\` disclosure 保持低噪音，默认只展示一行摘要。
- 最终回复使用 \`MessageResponse\` 渲染 markdown，包含列表、代码块和检查项。
- 右侧 \`Artifact\` 仍然可以独立滚动，不会把页面 body 撑开。
- 底部 \`PromptInput\` 仍然浮在渐隐层上，提交后会追加 mock follow-up。

### 实现摘要

本次重点不是改变整体视觉语言，而是修复中间区域“看起来像聊天，但实际没有足够内容和明确滚动归属”的问题。页面外层继续使用锁定视口：\`main\`、中间 section、右侧 Artifact rail 都是 \`overflow-hidden\` 的布局容器；真正允许滚动的只有 Conversation 内部由 use-stick-to-bottom 管理的元素。

\`\`\`tsx
<Conversation className="min-h-0 flex-1 overflow-hidden">
  <ConversationContent
    className="mx-auto w-full max-w-[880px] gap-0 px-6 pb-56 pt-5"
    scrollClassName="h-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain"
  >
    {/* workflow toggle, timeline, final answer */}
  </ConversationContent>
</Conversation>
\`\`\`

### 产品层面的取舍

这版没有按参考图逐字复刻输入框、文案或步骤名，而是保留 Codex demo 自己的语气：项目名、会话名和过程描述都使用通用产品研发场景。用户打开页面后仍然能识别“左侧项目 / 中间会话 / 右侧产物 / 底部输入”的信息架构，但不会被截图中的具体业务文本绑住。

工作过程默认展开，是为了让部署后的 demo 首屏下面确实有足够 transcript 内容，可以马上验证滚轮和触控板滚动。点击 “Worked for 21m 36s” 后，过程区会整体消失，最终回复仍然留在对话里，底部 reply box 也不会移动到滚动内容中。

### 验证清单

- [x] 中间 Chat 内容增加到 14 个以上步骤和一段长最终回复。
- [x] Workflow 可以整体展开和收起。
- [x] 收起 Workflow 后最终回复仍然可读。
- [x] 输入框保持浮动，不进入 scroll content。
- [x] Artifact 面板保留，并且右侧内容可独立滚动。
- [x] AI Elements 标注仍然存在但保持低对比。
- [x] 生产构建通过后，这个 demo 可以作为当前部署版本使用。`;

type ArtifactMode = "preview" | "vscode" | "terminal" | "info" | "map";

type Project = {
  badge: string;
  chats: { active?: boolean; meta?: string; title: string }[];
  name: string;
};

type WorkStep = {
  command: string;
  detail: string;
  files: string[];
  icon: LucideIcon;
  id: string;
  output: string;
  patch: string;
  status: "complete" | "running";
  text: string;
  tool: string;
};

const projects: Project[] = [
  {
    name: "agent-ui-demo",
    badge: "demo",
    chats: [
      { title: "Improve agent workspace", meta: "now", active: true },
      { title: "Artifact panel pass", meta: "1h" },
    ],
  },
  {
    name: "website-redesign",
    badge: "web",
    chats: [
      { title: "Landing page audit", meta: "3h" },
      { title: "Navigation polish", meta: "Mon" },
    ],
  },
  {
    name: "docs-lab",
    badge: "docs",
    chats: [
      { title: "API guide cleanup", meta: "Tue" },
      { title: "Release note draft", meta: "" },
    ],
  },
  {
    name: "mobile-prototype",
    badge: "app",
    chats: [],
  },
];

const baseWorkSteps: WorkStep[] = [
  {
    id: "read-context",
    text: "我先读了当前页面和 AI Elements 组件的本地 API，确认这版 Next 结构、Conversation 滚动方式，以及 Artifact 的 header/action/content 组合。",
    tool: "Explored page and AI Elements APIs",
    detail: "确认页面是 client component，Conversation 基于 StickToBottom，PromptInput 的 onSubmit 会提供 message.text。",
    command: "sed -n '1,260p' src/app/page.tsx",
    output: "Found inert toolbar icons, short transcript, screenshot-specific project labels.",
    patch: "No edits yet. Context pass only.",
    files: [
      "src/app/page.tsx",
      "src/components/ai-elements/artifact.tsx",
      "src/components/ai-elements/conversation.tsx",
      "src/components/ai-elements/prompt-input.tsx",
    ],
    icon: FileSearchIcon,
    status: "complete",
  },
  {
    id: "rename-sidebar",
    text: "我把左侧项目和会话换成演示用的中性名称，保留 Projects / chats 的信息层级，但不沿用参考图里的具体文案。",
    tool: "Updated demo project labels",
    detail: "项目名变成 agent-ui-demo、website-redesign、docs-lab、mobile-prototype；当前会话是 Improve agent workspace。",
    command: "edited data arrays",
    output: "Replaced copied labels with generic workspace examples.",
    patch: "+ agent-ui-demo\n+ website-redesign\n+ docs-lab\n+ Improve agent workspace",
    files: ["src/app/page.tsx"],
    icon: Code2Icon,
    status: "complete",
  },
  {
    id: "artifact-state",
    text: "接着我加了 Artifact 状态：顶部 Run Preview、Open VS Code、Terminal、Info、Panel 都会打开同一个右侧面板，并切换不同内容。",
    tool: "Wired Artifact panel modes",
    detail: "artifactOpen 控制 rail 是否显示；artifactMode 控制 preview/vscode/terminal/info/map 内容。",
    command: "setArtifactOpen(true); setArtifactMode(mode);",
    output: "Toolbar actions now change right-side Artifact content.",
    patch: "+ type ArtifactMode = 'preview' | 'vscode' | 'terminal' | 'info' | 'map';",
    files: ["src/app/page.tsx"],
    icon: LayoutPanelTopIcon,
    status: "complete",
  },
  {
    id: "quiet-tools",
    text: "每个 Codex 步骤现在都是可点击的 disclosure。默认只露出一行工具摘要，点开才看到文件 chips、命令输出和补丁摘要。",
    tool: "Added AI Elements Task disclosures",
    detail: "使用 Task / TaskTrigger / TaskContent / TaskItem / TaskItemFile 组织展开内容，视觉上压低对话外的噪音。",
    command: "expandedStepIds toggles by step id",
    output: "Collapsed rows stay one line; expanded rows show implementation details.",
    patch: "+ <Task open={expandedStepIds.has(step.id)} ...>",
    files: ["src/app/page.tsx", "src/components/ai-elements/task.tsx"],
    icon: BoxesIcon,
    status: "complete",
  },
  {
    id: "scroll-owner",
    text: "我把 transcript 增长到足够产生 overflow，并保留底部 floating composer。外层 main、sidebar、header 和 Artifact 都不让 document 滚动。",
    tool: "Locked viewport, extended transcript",
    detail: "ConversationContent 底部留出 composer 高度，scrollClassName 使用 overflow-y-auto / overflow-x-hidden。",
    command: "ConversationContent scrollClassName='overflow-y-auto overflow-x-hidden'",
    output: "The central conversation owns vertical scrolling.",
    patch: "+ pb-44\n+ overscroll-contain",
    files: ["src/app/page.tsx", "src/app/globals.css"],
    icon: ArrowDownIcon,
    status: "complete",
  },
  {
    id: "workflow-toggle",
    text: "我把工作过程从普通说明行改成了可整体折叠的 workflow section。用户可以一键隐藏所有过程步骤，只保留最终回复。",
    tool: "Added workflow disclosure state",
    detail:
      "workflowOpen 默认 true；标题行按钮使用 ChevronDown / ChevronRight 显示当前状态，并通过 aria-expanded 暴露交互语义。",
    command: "const [workflowOpen, setWorkflowOpen] = useState(true);",
    output: "Workflow timeline can be collapsed as a complete section.",
    patch: "+ workflowOpen\n+ setWorkflowOpen((open) => !open)\n+ conditional workflow rendering",
    files: ["src/app/page.tsx"],
    icon: WorkflowIcon,
    status: "complete",
  },
  {
    id: "transcript-density",
    text: "我把中间 transcript 扩成更真实的研发过程：不再只有几行状态，而是包含需求澄清、组件审计、布局修复、内容填充、交互验证和回归检查。",
    tool: "Expanded realistic product/dev work log",
    detail:
      "工作日志保持通用中文产品研发语境，避免照搬截图里的业务文案，同时让滚动高度显著大于容器高度。",
    command: "baseWorkSteps.length >= 14",
    output: "Expanded transcript content now creates real vertical overflow.",
    patch: "+ additional WorkStep rows\n+ longer detail/output/patch summaries",
    files: ["src/app/page.tsx"],
    icon: FileSearchIcon,
    status: "complete",
  },
  {
    id: "stream-replay",
    text: "我保留流式回答，但加了 Replay stream 操作。点击会清空当前 markdown，然后重新按块写入 MessageResponse。",
    tool: "Implemented replayable stream",
    detail: "replayStream 复位 streamedMarkdown/isStreaming；useEffect 用 interval 模拟 token stream。",
    command: "setStreamedMarkdown(''); setIsStreaming(true);",
    output: "Stream can be restarted from the header or Artifact action.",
    patch: "+ <Button onClick={replayStream}>Replay stream</Button>",
    files: ["src/app/page.tsx"],
    icon: RefreshCwIcon,
    status: "complete",
  },
  {
    id: "composer-submit",
    text: "底部输入框现在有最小真实行为：提交非空内容会追加一个 mock user follow-up，再追加一条新的 agent step，并打开终端 Artifact 显示状态。",
    tool: "Added mock composer submit",
    detail: "PromptInput 的 onSubmit 读取 message.text；空提交不改状态。",
    command: "onSubmit={(message) => handleSubmit(message.text)}",
    output: "Submitting text updates transcript state instead of doing nothing.",
    patch: "+ setFollowUps(...)\n+ setDynamicSteps(...)",
    files: ["src/app/page.tsx"],
    icon: SendIcon,
    status: "complete",
  },
  {
    id: "component-map",
    text: "我加了细小的 AI Elements 标注：Conversation、PromptInput、MessageResponse/Streamdown、Artifact、Tool/Task style disclosure 都能在界面里被定位。",
    tool: "Annotated AI Elements usage",
    detail: "主界面使用低对比 badge；Info/Panel Artifact 里有完整组件地图。",
    command: "renderElementBadge('AI Elements: Conversation')",
    output: "Labels are present without turning the shell into documentation.",
    patch: "+ AI Elements map artifact tab",
    files: ["src/app/page.tsx"],
    icon: InfoIcon,
    status: "complete",
  },
  {
    id: "final-answer",
    text: "最终回答现在是文章式总结，包含 bullet、inline code、代码块和验证清单。即使 workflow 收起，这段内容也会继续显示在会话主体里。",
    tool: "Rewrote final MessageResponse content",
    detail:
      "STREAM_NOTE 扩展为长 markdown，覆盖交互结构、实现摘要、产品取舍和验证清单。",
    command: "MessageResponse renders STREAM_NOTE",
    output: "Final assistant response remains substantial and readable.",
    patch: "+ long final response markdown\n+ code block\n+ verification checklist",
    files: ["src/app/page.tsx"],
    icon: BotIcon,
    status: "complete",
  },
  {
    id: "preview-mode",
    text: "Run Preview 模式不是空面板，它显示一个紧凑预览和当前实现状态，方便演示右侧 Artifact 可以承载不同工作结果。",
    tool: "Built preview Artifact content",
    detail: "Preview artifact includes status rows and a compact mock app thumbnail.",
    command: "openArtifact('preview')",
    output: "Preview tab presents a demo run target and visible UI result.",
    patch: "+ renderArtifactBody('preview')",
    files: ["src/app/page.tsx"],
    icon: PlayIcon,
    status: "complete",
  },
  {
    id: "terminal-mode",
    text: "Terminal 模式展示构建命令、摘要日志和当前运行状态；这让顶部终端按钮有真实可见反馈。",
    tool: "Built terminal Artifact content",
    detail: "Terminal panel uses a quiet monospace log block and status chips.",
    command: "npm run build",
    output: "> codex-agent-chat-demo@0.1.0 build\n> next build\n\nCompiled successfully.",
    patch: "+ terminalLog",
    files: ["src/app/page.tsx"],
    icon: SquareTerminalIcon,
    status: "complete",
  },
  {
    id: "final-check",
    text: "最后我准备跑 build；如果 Next 或 TypeScript 报错，会按报错回到页面里修，不把半成品留在工作区。",
    tool: "Ready for build verification",
    detail: "需要验证类型、导入、组件 props 和 Tailwind class 没有破坏编译。",
    command: "npm run build",
    output: "Pending in this transcript until verification finishes.",
    patch: "No additional patch expected unless build reports errors.",
    files: ["src/app/page.tsx"],
    icon: CheckCircle2Icon,
    status: "running",
  },
];

const artifactCopy: Record<
  ArtifactMode,
  { description: string; title: string }
> = {
  preview: {
    title: "Run Preview",
    description: "Interactive Artifact showing the current demo surface.",
  },
  vscode: {
    title: "Open VS Code",
    description: "Workspace files and editor context for this demo.",
  },
  terminal: {
    title: "Terminal",
    description: "Command output and mock runtime status.",
  },
  info: {
    title: "Implementation Info",
    description: "What changed and why the controls are wired.",
  },
  map: {
    title: "AI Elements Map",
    description: "Where each AI Elements primitive is used in this screen.",
  },
};

const terminalLog = `$ npm run build
> codex-agent-chat-demo@0.1.0 build
> next build

▲ Next.js 16.2.6
Creating an optimized production build ...
Compiled successfully
Linting and checking validity of types ...`;

function SidebarRow({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] text-neutral-300 transition hover:bg-white/[0.055] hover:text-neutral-50"
      type="button"
    >
      <Icon className="size-4 text-neutral-500" />
      <span>{label}</span>
    </button>
  );
}

function ElementBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex h-5 items-center rounded border border-white/8 bg-white/[0.035] px-1.5 font-mono text-[10px] text-neutral-500">
      {children}
    </span>
  );
}

function PreviewThumb({ compact = false }: { compact?: boolean }) {
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

export default function Home() {
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
          files: ["src/app/page.tsx"],
          icon: BotIcon,
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
      index = Math.min(index + 8, STREAM_NOTE.length);
      setStreamedMarkdown(STREAM_NOTE.slice(0, index));
      if (index >= STREAM_NOTE.length) {
        window.clearInterval(interval);
        setIsStreaming(false);
      }
    }, 24);

    return () => window.clearInterval(interval);
  }, [isStreaming]);

  return (
    <main className="dark flex h-dvh w-dvw overflow-hidden bg-[#070707] font-sans text-neutral-100">
      <aside className="flex h-full w-[286px] shrink-0 flex-col overflow-hidden border-neutral-800/80 border-r bg-[#151715]">
        <div className="flex h-9 shrink-0 items-center gap-2 px-3 text-neutral-500">
          <PanelLeftIcon className="size-4" />
          <ChevronRightIcon className="size-4 rotate-180" />
          <ChevronRightIcon className="size-4" />
        </div>

        <div className="shrink-0 px-2 pb-3">
          <SidebarRow icon={SparklesIcon} label="New task" />
          <SidebarRow icon={SearchIcon} label="Search" />
          <SidebarRow icon={PlugIcon} label="Integrations" />
          <SidebarRow icon={WorkflowIcon} label="Automations" />
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-2">
          <p className="px-2 pb-1 text-[12px] font-medium text-neutral-500">
            Projects
          </p>
          <div className="space-y-1">
            {projects.map((project) => (
              <div key={project.name}>
                <div className="flex h-7 items-center gap-2 px-2 text-[13px] text-neutral-300">
                  <FolderIcon className="size-3.5 text-neutral-500" />
                  <span className="min-w-0 flex-1 truncate">
                    {project.name}
                  </span>
                  <span className="text-[10px] uppercase text-neutral-600">
                    {project.badge}
                  </span>
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                </div>
                {project.chats.length === 0 ? (
                  <div className="px-7 py-1 text-[12px] text-neutral-600">
                    No chats
                  </div>
                ) : (
                  project.chats.map((chat) => (
                    <button
                      className={`ml-5 flex h-8 w-[calc(100%-1.25rem)] items-center gap-2 rounded-md px-2 text-left text-[13px] transition ${
                        chat.active
                          ? "bg-white/[0.075] text-neutral-100"
                          : "text-neutral-400 hover:bg-white/[0.045] hover:text-neutral-200"
                      }`}
                      key={chat.title}
                      type="button"
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {chat.title}
                      </span>
                      {chat.active ? <GitMini /> : null}
                      {chat.meta ? (
                        <span className="text-[12px] text-neutral-500">
                          {chat.meta}
                        </span>
                      ) : (
                        <CircleIcon className="size-3 animate-pulse text-neutral-500" />
                      )}
                    </button>
                  ))
                )}
              </div>
            ))}
          </div>

          <p className="mt-5 px-2 pb-1 text-[12px] font-medium text-neutral-500">
            Chats
          </p>
          <button
            className="flex h-8 w-full items-center rounded-md px-2 text-left text-[13px] text-neutral-400 hover:bg-white/[0.045] hover:text-neutral-200"
            type="button"
          >
            Build Artifact demo
          </button>
          <button
            className="flex h-8 w-full items-center rounded-md px-2 text-left text-[13px] text-neutral-400 hover:bg-white/[0.045] hover:text-neutral-200"
            type="button"
          >
            Review scroll behavior
          </button>
        </div>

        <button
          className="mx-2 mb-2 flex h-9 shrink-0 items-center gap-2 rounded-md px-2 text-[13px] text-neutral-400 hover:bg-white/[0.055] hover:text-neutral-100"
          type="button"
        >
          <SettingsIcon className="size-4" />
          Settings
        </button>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#090909]">
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
              onClick={() => openArtifact("preview")}
              size="sm"
              type="button"
              variant="outline"
            >
              <PlayIcon className="size-3.5" />
              <span className="hidden text-[12px] md:inline">Run Preview</span>
            </Button>
            <Button
              className="h-7 gap-1.5 border-neutral-800 bg-neutral-900 px-2 text-neutral-300 hover:bg-neutral-800"
              onClick={() => openArtifact("vscode")}
              size="sm"
              type="button"
              variant="outline"
            >
              <Code2Icon className="size-3.5 text-blue-400" />
              <span className="hidden text-[12px] md:inline">VS Code</span>
            </Button>
            <Button
              className="size-7 text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200"
              onClick={() => openArtifact("terminal")}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <SquareTerminalIcon className="size-4" />
              <span className="sr-only">Terminal</span>
            </Button>
            <Button
              className="size-7 text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200"
              onClick={() => openArtifact("info")}
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
                  ? setArtifactOpen(false)
                  : openArtifact("map")
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

        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
            <Conversation className="h-full min-h-0 overflow-hidden bg-[#090909]">
              <ConversationContent
                className="mx-auto w-full max-w-[880px] gap-0 px-6 pb-56 pt-5"
                scrollClassName="h-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain"
              >
                <div className="mb-8 flex justify-end">
                  <div className="max-w-[420px] rounded-2xl bg-[#202020] px-4 py-2 text-[14px] text-neutral-200 shadow-sm">
                    中间对话现在太短而且不能滚；把工作过程做成可以整体收起的区域，底部输入框还是浮着。
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

                <div className={workflowOpen ? "mt-8 flex items-center justify-between gap-3" : "mt-2 flex items-center justify-between gap-3"}>
                  <ElementBadge>
                    AI Elements: MessageResponse/Streamdown
                  </ElementBadge>
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
                onSubmit={(message) => handleComposerSubmit(message.text)}
              >
                <PromptInputTextarea
                  className="max-h-28 min-h-16 border-0 bg-transparent px-4 pt-4 text-[15px] text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-0"
                  placeholder="Ask for follow-up changes"
                />
                <PromptInputFooter className="border-0 bg-transparent px-3 pb-3 pt-1">
                  <PromptInputTools>
                    <PromptInputButton
                      className="text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
                    >
                      <PaperclipIcon className="size-4" />
                    </PromptInputButton>
                    <PromptInputButton
                      className="gap-1.5 text-amber-400 hover:bg-neutral-800 hover:text-amber-300"
                    >
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
                    <PromptInputButton
                      className="text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
                    >
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
    </main>
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
  const Icon = step.icon;

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

function ArtifactPanel({
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

function GitMini() {
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
