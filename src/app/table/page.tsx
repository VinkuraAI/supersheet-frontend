"use client"

import { Suspense, useState, useEffect } from "react"
import { TopBar } from "@/components/service-desk/topbar"
import { SideNav } from "@/components/service-desk/sidenav"
import { FiltersBar } from "@/components/service-desk/filters-bar"
import { TicketsTable } from "@/components/service-desk/tickets-table"
import { RightPanel } from "@/components/service-desk/right-panel"
import { AiChatWidget } from "@/components/service-desk/ai-chat-widget"

export default function ServiceDeskPage() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      // Close both sidebars when screen is too narrow (below 1280px)
      if (width < 1272) {
        setLeftSidebarOpen(false)
        setRightSidebarOpen(false)
      }
    }

    // Run on mount
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [leftSidebarOpen, rightSidebarOpen])

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="border-b bg-card flex-shrink-0">
        <TopBar
          onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
          onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
          rightSidebarOpen={rightSidebarOpen}
        />
      </header>

      <section className="flex flex-1 overflow-hidden relative">
        {/* Left sidebar - fixed and toggleable */}
        <aside
          className={`
            fixed left-0 top-[57px] bottom-0 z-30 w-[260px] 
            bg-card border-r transition-transform duration-300
            overflow-y-auto scrollbar-hide
            ${leftSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          aria-label="Project navigation"
        >
          <div className="p-2">
            <SideNav />
          </div>
        </aside>

        {/* Center content - adjusts margin based on sidebar state */}
        <div
          className={`
            flex-1 flex flex-col transition-all duration-300 pb-24 w-fulln
            ${leftSidebarOpen ? "ml-[260px]" : "ml-0"}
            ${rightSidebarOpen ? "mr-[320px]" : "mr-0"}
          `}
        >
          <div className="flex-1 flex flex-col gap-3 p-4 overflow-hidden w-full ">
            <div className="bg-card border rounded-md flex-shrink-0">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h1 className="text-lg font-semibold text-pretty">All open</h1>
              </div>
              <div className="p-3">
                <Suspense>
                  <FiltersBar />
                </Suspense>
              </div>
            </div>

            <div className="bg-card border rounded-md flex-1 overflow-hidden flex flex-col">
              <TicketsTable />
            </div>
          </div>
        </div>

        {/* Right context panel - fixed and toggleable */}
        <aside
          className={`
            fixed right-0 top-[57px] bottom-0 z-30 w-[320px]
            bg-card border-l transition-transform duration-300
            overflow-y-auto scrollbar-hide
            ${rightSidebarOpen ? "translate-x-0" : "translate-x-full"}
          `}
          aria-label="Project info"
        >
          <div className="p-3">
            <RightPanel />
          </div>
        </aside>
      </section>

      <AiChatWidget />
    </main>
  )
}
