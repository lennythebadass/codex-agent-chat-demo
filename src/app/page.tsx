"use client";

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
import { Button } from "@/components/ui/button";
import {
  ArrowDownIcon,
  BotIcon,
  BoxesIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleIcon,
  Code2Icon,
  FileSearchIcon,
  FolderIcon,
  InfoIcon,
  MicIcon,
  MoreHorizontalIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PaperclipIcon,
  PlayIcon,
  PlugIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  ShieldIcon,
  SparklesIcon,
  SquareTerminalIcon,
  WorkflowIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const STREAM_NOTE = `我把这版 Demo 收敛成 Codex 工作区的表达方式：

- 工具调用默认只显示**一行摘要**，细节不抢内容主线。
- 输入框悬浮在底部，像是持续跟进当前工作区。
- 只有中间 transcript 滚动，应用外壳保持固定。

\`\`\`ts
const toolCall = "Edited 5 files, explored 1 file, 1 search";
\`\`\`

- [x] restrained tool summaries
- [x] floating composer
- [x] Streamdown rendering`;

const projects = [
  {
    name: "lovable-design...",
    badge: "p",
    chats: [{ title: "提升 GitHub Star 到10...", meta: "2h" }],
  },
  { name: "open-growth", badge: "pc", chats: [] },
  {
    name: "private-starry...",
    badge: "p",
    chats: [
      { title: "规划图片素材目录", meta: "" },
      { title: "重构 shadcn UI/UX", meta: "55m", active: true },
    ],
  },
];

const workLog = [
  {
    text: "我会直接重构，不再沿用刚才那版 split-login 和 dashboard。先快速读一下当前被改过的页面，再把它们改成“进入创作环境 / 工作区切换器 / 命令式新建 / 编辑器主体”的结构。",
    tool: "Explored 4 files",
    icon: FileSearchIcon,
  },
  {
    text: "我会把登录页改成“进入工具的浮层”，工作区改成“演示切换器 + 创作命令中心”，并把 editor 主区补出右侧 Agent 语境面板。也会同步改 style guide，明确禁止把登录页做成左右 hero/form 分栏。",
    tool: "Edited 5 files, explored 1 file, 1 search",
    icon: Code2Icon,
  },
  {
    text: "结构已经真正换掉了：登录不再是左右分栏，工作区不再是 dashboard，创建也从大表单改成了命令中心。现在我跑格式、lint、类型检查和构建，把编译层面的边角都修干净。",
    tool: "Ran pnpm format && pnpm lint && pnpm --filter @starrykit/web typecheck && pnpm --filter @starrykit/e...",
    icon: SquareTerminalIcon,
  },
  {
    text: "构建已经通过了，只有 Vite 原本的 chunk size 提醒。现在我再启动本地预览抓登录页截图，确认这次真不是旧 layout 的换皮。",
    tool: "Ran 2 commands",
    icon: SquareTerminalIcon,
  },
];

function SidebarRow({ icon: Icon, label }: { icon: typeof SearchIcon; label: string }) {
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

function QuietTool({ icon: Icon, label }: { icon: typeof FileSearchIcon; label: string }) {
  return (
    <button
      className="mt-3 flex max-w-full items-center gap-2 text-left text-[13px] text-neutral-500 transition hover:text-neutral-300"
      type="button"
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function PreviewThumb({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-neutral-800 bg-neutral-100 p-2 shadow-2xl shadow-black/20 ${
        compact ? "h-28 w-20" : "h-28 w-44"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="h-2 w-12 rounded-full bg-neutral-300" />
        <div className="h-3 w-8 rounded-full bg-blue-500/80" />
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white p-2">
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
  const [streamedMarkdown, setStreamedMarkdown] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);

  const replayStream = useCallback(() => {
    setStreamedMarkdown("");
    setIsStreaming(true);
  }, []);

  useEffect(() => {
    if (!isStreaming) return;
    let index = 0;
    const interval = window.setInterval(() => {
      index = Math.min(index + 7, STREAM_NOTE.length);
      setStreamedMarkdown(STREAM_NOTE.slice(0, index));
      if (index >= STREAM_NOTE.length) {
        window.clearInterval(interval);
        setIsStreaming(false);
      }
    }, 26);
    return () => window.clearInterval(interval);
  }, [isStreaming]);

  return (
    <main className="flex h-dvh w-dvw overflow-hidden bg-[#070707] font-sans text-neutral-100">
      <aside className="flex h-full w-[286px] shrink-0 flex-col overflow-hidden border-neutral-800/80 border-r bg-[#151715]">
        <div className="flex h-9 shrink-0 items-center gap-2 px-3 text-neutral-500">
          <PanelLeftIcon className="size-4" />
          <ChevronRightIcon className="size-4 rotate-180" />
          <ChevronRightIcon className="size-4" />
        </div>

        <div className="shrink-0 px-2 pb-3">
          <SidebarRow icon={SparklesIcon} label="New chat" />
          <SidebarRow icon={SearchIcon} label="Search" />
          <SidebarRow icon={PlugIcon} label="Plugins" />
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
                  <span className="min-w-0 flex-1 truncate">{project.name}</span>
                  <span className="text-[11px] text-neutral-600">{project.badge}</span>
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                </div>
                {project.chats.length === 0 ? (
                  <div className="px-7 py-1 text-[12px] text-neutral-600">No chats</div>
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
                      <span className="min-w-0 flex-1 truncate">{chat.title}</span>
                      {chat.active ? <GitMini /> : null}
                      {chat.meta ? (
                        <span className="text-[12px] text-neutral-500">{chat.meta}</span>
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
          <div className="px-2 text-[12px] text-neutral-600">No chats</div>
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
        <header className="flex h-12 shrink-0 items-center justify-between px-5">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-[15px] font-medium text-neutral-200">
              重构 shadcn UI/UX
            </h1>
            <Button className="size-7 text-neutral-500 hover:text-neutral-200" size="icon-sm" type="button" variant="ghost">
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-500">
            <Button className="h-7 gap-1.5 border-neutral-800 bg-neutral-900 px-2 text-neutral-300 hover:bg-neutral-800" size="sm" type="button" variant="outline">
              <PlayIcon className="size-3.5" />
              <ChevronDownIcon className="size-3" />
            </Button>
            <Button className="h-7 gap-1.5 border-neutral-800 bg-neutral-900 px-2 text-neutral-300 hover:bg-neutral-800" size="sm" type="button" variant="outline">
              <Code2Icon className="size-3.5 text-blue-400" />
              <ChevronDownIcon className="size-3" />
            </Button>
            <SquareTerminalIcon className="size-4" />
            <InfoIcon className="size-4" />
            <PanelRightIcon className="size-4" />
          </div>
        </header>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <Conversation className="min-h-0 bg-[#090909]">
            <ConversationContent
              className="mx-auto w-full max-w-[860px] gap-0 px-6 pb-44 pt-5"
              scrollClassName="overflow-y-auto overflow-x-hidden overscroll-contain"
            >
              <div className="mb-8 flex justify-end">
                <div className="max-w-[360px] rounded-2xl bg-[#202020] px-4 py-2 text-[14px] text-neutral-200 shadow-sm">
                  好呀你重构吧
                </div>
              </div>

              <div className="mb-6 flex items-center gap-2 text-[13px] text-neutral-500">
                <span>Worked for 12m 15s</span>
                <ChevronDownIcon className="size-3.5" />
              </div>
              <div className="mb-7 h-px bg-neutral-800/80" />

              <div className="space-y-8">
                {workLog.map((item) => (
                  <div key={item.tool}>
                    <p className="whitespace-pre-wrap text-[15px] leading-7 text-neutral-300">
                      {item.text}
                    </p>
                    <QuietTool icon={item.icon} label={item.tool} />
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-end gap-3">
                <PreviewThumb />
                <PreviewThumb compact />
                <Button className="mb-2 size-8 rounded-full border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800" size="icon" type="button" variant="outline">
                  <ArrowDownIcon className="size-4" />
                </Button>
              </div>

              <div className="mt-8 text-[15px] leading-7 text-neutral-300">
                <MessageResponse
                  className="prose-invert max-w-none text-neutral-300 [&_*]:border-neutral-800 [&_code]:text-neutral-200 [&_pre]:bg-neutral-950"
                  isAnimating={isStreaming}
                >
                  {streamedMarkdown}
                </MessageResponse>
              </div>
            </ConversationContent>
            <ConversationScrollButton className="bottom-36 border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800" />
          </Conversation>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#090909] via-[#090909]/95 to-transparent px-6 pb-5 pt-16">
            <PromptInput
              className="pointer-events-auto mx-auto max-w-[860px] rounded-3xl border border-neutral-700/80 bg-[#171717] shadow-2xl shadow-black/50"
              onSubmit={() => undefined}
            >
              <PromptInputTextarea
                className="max-h-28 min-h-16 border-0 bg-transparent px-4 pt-4 text-[15px] text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-0"
                placeholder="Ask for follow-up changes"
              />
              <PromptInputFooter className="border-0 bg-transparent px-3 pb-3 pt-1">
                <PromptInputTools>
                  <PromptInputButton className="text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100" tooltip="Add context">
                    <PaperclipIcon className="size-4" />
                  </PromptInputButton>
                  <PromptInputButton className="gap-1.5 text-amber-400 hover:bg-neutral-800 hover:text-amber-300" tooltip="Access mode">
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
                      <PromptInputSelectItem value="5.5-high">5.5 High</PromptInputSelectItem>
                      <PromptInputSelectItem value="5.5-fast">5.5 Fast</PromptInputSelectItem>
                    </PromptInputSelectContent>
                  </PromptInputSelect>
                  <PromptInputButton className="text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100" tooltip="Voice">
                    <MicIcon className="size-4" />
                  </PromptInputButton>
                  <PromptInputSubmit className="size-8 rounded-full bg-neutral-200 text-neutral-950 hover:bg-white">
                    <SendIcon className="size-4" />
                  </PromptInputSubmit>
                </PromptInputTools>
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </section>
    </main>
  );
}

function GitMini() {
  return (
    <svg aria-hidden className="size-3.5 shrink-0 text-neutral-500" fill="none" viewBox="0 0 16 16">
      <path d="M4 3v5a4 4 0 0 0 4 4h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
      <path d="M4 5.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 14.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
