import { AgentChat } from "@/components/demo/agent-chat";
import { DemoSidebar } from "@/components/demo/sidebar";
import { projects } from "@/lib/mock-agent-chat-data";

export default function Home() {
  return (
    <main className="dark flex h-dvh w-dvw overflow-hidden bg-[#070707] font-sans text-neutral-100">
      <DemoSidebar projects={projects} />
      <AgentChat />
    </main>
  );
}
