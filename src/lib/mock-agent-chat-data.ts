export type Project = {
  badge: string;
  chats: { active?: boolean; meta?: string; title: string }[];
  name: string;
};

export type WorkStepIcon =
  | "arrow-down"
  | "bot"
  | "boxes"
  | "check-circle"
  | "code"
  | "file-search"
  | "info"
  | "refresh"
  | "send"
  | "terminal"
  | "workflow";

export type WorkStep = {
  command: string;
  detail: string;
  files: string[];
  icon: WorkStepIcon;
  id: string;
  output: string;
  patch: string;
  status: "complete" | "running";
  text: string;
  tool: string;
};

export const projects: Project[] = [
  {
    name: "agent-ui-demo",
    badge: "demo",
    chats: [
      { title: "Improve agent workspace", meta: "now", active: true },
      { title: "Chat layout pass", meta: "1h" },
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

export const initialUserMessage =
  "中间对话现在太短而且不能滚；把工作过程做成可以整体收起的区域，底部输入框还是浮着。";

export const baseWorkSteps: WorkStep[] = [
  {
    id: "read-context",
    text: "我先读了当前页面和 AI Elements 组件的本地 API，确认这版 Next 结构、Conversation 滚动方式，以及 PromptInput 的提交组合。",
    tool: "Explored page and AI Elements APIs",
    detail:
      "确认页面是 client component，Conversation 基于 StickToBottom，PromptInput 的 onSubmit 会提供 message.text。",
    command: "sed -n '1,260p' src/app/page.tsx",
    output: "Found inert toolbar icons, short transcript, screenshot-specific project labels.",
    patch: "No edits yet. Context pass only.",
    files: [
      "src/app/page.tsx",
      "src/components/ai-elements/conversation.tsx",
      "src/components/ai-elements/prompt-input.tsx",
    ],
    icon: "file-search",
    status: "complete",
  },
  {
    id: "rename-sidebar",
    text: "我把左侧项目和会话换成演示用的中性名称，保留 Projects / chats 的信息层级，但不沿用参考图里的具体文案。",
    tool: "Updated demo project labels",
    detail:
      "项目名变成 agent-ui-demo、website-redesign、docs-lab、mobile-prototype；当前会话是 Improve agent workspace。",
    command: "edited data arrays",
    output: "Replaced copied labels with generic workspace examples.",
    patch: "+ agent-ui-demo\n+ website-redesign\n+ docs-lab\n+ Improve agent workspace",
    files: ["src/app/page.tsx"],
    icon: "code",
    status: "complete",
  },
  {
    id: "simplify-shell",
    text: "接着我把界面收敛成左侧 sidebar 和中间 chat 两块，让用户的注意力停在对话、工作流和底部输入框上。",
    tool: "Simplified workspace shell",
    detail:
      "顶部只保留会话标题和低噪音菜单；辅助操作被移除，避免出现不清楚含义的工作区概念。",
    command: "remove side rail state and toolbar actions",
    output: "The shell now presents sidebar plus central conversation only.",
    patch: "- side rail state\n- top-right workspace action group",
    files: ["src/app/page.tsx"],
    icon: "workflow",
    status: "complete",
  },
  {
    id: "quiet-tools",
    text: "每个 Codex 步骤现在都是可点击的 disclosure。默认只露出一行工具摘要，点开才看到文件 chips、命令输出和补丁摘要。",
    tool: "Added AI Elements Task disclosures",
    detail:
      "使用 Task / TaskTrigger / TaskContent / TaskItem / TaskItemFile 组织展开内容，视觉上压低对话外的噪音。",
    command: "expandedStepIds toggles by step id",
    output: "Collapsed rows stay one line; expanded rows show implementation details.",
    patch: "+ <Task open={expandedStepIds.has(step.id)} ...>",
    files: ["src/app/page.tsx", "src/components/ai-elements/task.tsx"],
    icon: "boxes",
    status: "complete",
  },
  {
    id: "scroll-owner",
    text: "我把 transcript 增长到足够产生 overflow，并保留底部 floating composer。外层 main、sidebar 和 header 都不让 document 滚动。",
    tool: "Locked viewport, extended transcript",
    detail:
      "ConversationContent 底部留出 composer 高度，scrollClassName 使用 overflow-y-auto / overflow-x-hidden。",
    command: "ConversationContent scrollClassName='overflow-y-auto overflow-x-hidden'",
    output: "The central conversation owns vertical scrolling.",
    patch: "+ pb-44\n+ overscroll-contain",
    files: ["src/app/page.tsx", "src/app/globals.css"],
    icon: "arrow-down",
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
    patch:
      "+ workflowOpen\n+ setWorkflowOpen((open) => !open)\n+ conditional workflow rendering",
    files: ["src/app/page.tsx"],
    icon: "workflow",
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
    icon: "file-search",
    status: "complete",
  },
  {
    id: "stream-replay",
    text: "我保留流式回答，但加了 Replay stream 操作。点击会清空当前 markdown，然后重新按块写入 MessageResponse。",
    tool: "Implemented replayable stream",
    detail:
      "replayStream 复位 streamedMarkdown/isStreaming；useEffect 用 interval 模拟 token stream。",
    command: "setStreamedMarkdown(''); setIsStreaming(true);",
    output: "Stream can be restarted from the conversation controls.",
    patch: "+ <Button onClick={replayStream}>Replay stream</Button>",
    files: ["src/app/page.tsx"],
    icon: "refresh",
    status: "complete",
  },
  {
    id: "composer-submit",
    text: "底部输入框现在有最小真实行为：提交非空内容会追加一个 mock user follow-up，再追加一条新的 agent step。",
    tool: "Added mock composer submit",
    detail: "PromptInput 的 onSubmit 读取 message.text；空提交不改状态。",
    command: "onSubmit={(message) => handleSubmit(message.text)}",
    output: "Submitting text updates transcript state instead of doing nothing.",
    patch: "+ setFollowUps(...)\n+ setDynamicSteps(...)",
    files: ["src/app/page.tsx"],
    icon: "send",
    status: "complete",
  },
  {
    id: "component-map",
    text: "我加了细小的 AI Elements 标注：Conversation、PromptInput、MessageResponse/Streamdown、Tool/Task style disclosure 都能在界面里被定位。",
    tool: "Annotated AI Elements usage",
    detail: "主界面使用低对比 badge，标出当前页面实际展示的 AI Elements primitives。",
    command: "renderElementBadge('AI Elements: Conversation')",
    output: "Labels are present without turning the shell into documentation.",
    patch: "+ inline AI Elements badges",
    files: ["src/app/page.tsx"],
    icon: "info",
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
    icon: "bot",
    status: "complete",
  },
  {
    id: "header-cleanup",
    text: "我把顶部右侧那组操作按钮拿掉了，避免不必要的工作区入口占据注意力。",
    tool: "Removed header action buttons",
    detail: "Header remains a compact conversation title row; replay controls stay near the streamed answer where they are easier to understand.",
    command: "delete header action group",
    output: "Top-right action buttons are no longer rendered.",
    patch: "- top-right workspace action group",
    files: ["src/components/demo/agent-chat.tsx"],
    icon: "code",
    status: "complete",
  },
  {
    id: "mock-data-cleanup",
    text: "我顺手清理了只服务辅助面板的 mock 数据，让页面数据只描述当前还存在的 sidebar、conversation、workflow 和 composer。",
    tool: "Removed unused mock data",
    detail: "删除不再需要的模式枚举、面板标题文案和终端日志常量，避免后续维护时误以为界面仍支持这些入口。",
    command: "rg unused workspace panel state",
    output:
      "Demo data now only describes the visible sidebar, chat, workflow, stream, and composer.",
    patch: "- panel mode data\n- panel copy\n- panel terminal log",
    files: ["src/lib/mock-agent-chat-data.ts"],
    icon: "terminal",
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
    icon: "check-circle",
    status: "running",
  },
];

export const finalAssistantMarkdown = `这轮我把中间 Chat 调整成更接近真实 Codex 会话的形态：上方是可折叠的工作过程，下方保留一段完整的最终回复，底部 composer 始终浮在视口内，不参与 transcript 滚动。

### 交互结构

工作流标题行现在独立成一个开关。展开时可以看到从需求拆解、组件审计、滚动归属、交互联动到构建验证的完整过程；收起时只留下最终答复，适合用户快速阅读结论。这个行为比把每个步骤单独折叠更接近实际使用：过程可以整体隐藏，最终结果不会消失。

- 中间 transcript 使用 \`Conversation\` / \`ConversationContent\`，滚动类放在真实的 scroll container 上。
- 工作过程使用 \`Task\` disclosure 保持低噪音，默认只展示一行摘要。
- 最终回复使用 \`MessageResponse\` 渲染 markdown，包含列表、代码块和检查项。
- 底部 \`PromptInput\` 仍然浮在渐隐层上，提交后会追加 mock follow-up。

### 实现摘要

本次重点不是改变整体视觉语言，而是修复中间区域“看起来像聊天，但实际没有足够内容和明确滚动归属”的问题。页面外层继续使用锁定视口：\`main\`、中间 section 和 sidebar 都是 \`overflow-hidden\` 的布局容器；真正允许滚动的只有 Conversation 内部由 use-stick-to-bottom 管理的元素。

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

这版没有按参考图逐字复刻输入框、文案或步骤名，而是保留 Codex demo 自己的语气：项目名、会话名和过程描述都使用通用产品研发场景。用户打开页面后仍然能识别“左侧项目 / 中间会话 / 底部输入”的信息架构，但不会被截图中的具体业务文本绑住。

工作过程默认展开，是为了让部署后的 demo 首屏下面确实有足够 transcript 内容，可以马上验证滚轮和触控板滚动。点击 “Worked for 21m 36s” 后，过程区会整体消失，最终回复仍然留在对话里，底部 reply box 也不会移动到滚动内容中。

### 验证清单

- [x] 中间 Chat 内容增加到 14 个以上步骤和一段长最终回复。
- [x] Workflow 可以整体展开和收起。
- [x] 收起 Workflow 后最终回复仍然可读。
- [x] 输入框保持浮动，不进入 scroll content。
- [x] AI Elements 标注仍然存在但保持低对比。
- [x] 生产构建通过后，这个 demo 可以作为当前部署版本使用。`;

export const STREAM_NOTE = finalAssistantMarkdown;
