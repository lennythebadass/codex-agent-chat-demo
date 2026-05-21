import { Button } from "@/components/ui/button";
import { GitMini } from "@/components/demo/shared";
import type { Project } from "@/lib/mock-agent-chat-data";
import {
  ChevronRightIcon,
  CircleIcon,
  FolderIcon,
  PanelLeftIcon,
  PlugIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  WorkflowIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function DemoSidebar({ projects }: { projects: Project[] }) {
  return (
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
                <span className="min-w-0 flex-1 truncate">{project.name}</span>
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
          Build chat demo
        </button>
        <button
          className="flex h-8 w-full items-center rounded-md px-2 text-left text-[13px] text-neutral-400 hover:bg-white/[0.045] hover:text-neutral-200"
          type="button"
        >
          Review scroll behavior
        </button>
      </div>

      <Button
        className="mx-2 mb-2 flex h-9 shrink-0 items-center gap-2 rounded-md px-2 text-[13px] text-neutral-400 hover:bg-white/[0.055] hover:text-neutral-100"
        type="button"
        variant="ghost"
      >
        <SettingsIcon className="size-4" />
        Settings
      </Button>
    </aside>
  );
}

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
