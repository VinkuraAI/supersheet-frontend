"use client"

import { Suspense, useState, useEffect, ReactNode } from "react"
import { useParams } from "next/navigation"
import { TopBar } from "@/components/service-desk/topbar"
import { SideNav } from "@/components/service-desk/sidenav"
import { RightPanel } from "@/components/service-desk/right-panel"
import { AiChatWidget } from "@/components/service-desk/ai-chat-widget"
import { useIsMobile } from "@/hooks/use-mobile"
import { NoWorkspaceSelected } from "@/components/service-desk/no-workspace-selected"
import { useWorkspace } from "@/lib/workspace-context"
import { Skeleton } from "@/components/ui/skeleton"

interface WorkspaceLayoutProps {
  children: ReactNode
}

export function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth

      if (width < 1272) {
        setLeftSidebarOpen(false)
        setRightSidebarOpen(false)
      } else {
        setLeftSidebarOpen(true)
        setRightSidebarOpen(false)
      }
    }

    // Run on mount
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <PageContent
      leftSidebarOpen={leftSidebarOpen}
      rightSidebarOpen={rightSidebarOpen}
      setLeftSidebarOpen={setLeftSidebarOpen}
      setRightSidebarOpen={setRightSidebarOpen}
      isMobile={isMobile}
    >
      {children}
    </PageContent>
  )
}

interface PageContentProps {
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  setLeftSidebarOpen: (open: boolean) => void
  setRightSidebarOpen: (open: boolean) => void
  isMobile: boolean
  children: ReactNode
}

function PageContent({
  leftSidebarOpen,
  rightSidebarOpen,
  setLeftSidebarOpen,
  setRightSidebarOpen,
  isMobile,
  children
}: PageContentProps) {
  const { selectedWorkspace, isLoading } = useWorkspace()
  const params = useParams()
  const workspaceId = params.id as string

  if (isLoading) {
    return (
      <main className="min-h-dvh flex flex-col text-[0.75rem]">
        <header className="border-b bg-card flex-shrink-0">
          <div className="mx-auto flex w-full items-center gap-2 p-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-4 w-32" />
            <div className="ml-auto" />
            <Skeleton className="h-7 w-16" />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-8 w-48" />
        </div>
      </main>
    )
  }

  if (!selectedWorkspace) {
    return <NoWorkspaceSelected />
  }

  return (
    <main className="min-h-dvh flex flex-col text-[0.75rem]">
      <header className="fixed top-0 left-0 right-0 z-40 h-[60px] border-b bg-card">
        <TopBar
          onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
          onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
          rightSidebarOpen={rightSidebarOpen}
        />
      </header>

      <section className="flex flex-1 overflow-hidden relative pt-[60px]">
        {/* Left sidebar - fixed and toggleable */}
        <aside
          className={`
            fixed left-0 top-[60px] bottom-0 z-30 w-64 
            border-r bg-card transition-transform duration-300 ease-in-out
            ${leftSidebarOpen && !isMobile ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <SideNav />
        </aside>

        {/* Main content area */}
        <div
          className={`
            flex-1 transition-all duration-300 ease-in-out overflow-hidden h-full
            ${leftSidebarOpen && !isMobile ? 'ml-64' : 'ml-0'}
            ${rightSidebarOpen && !isMobile ? 'mr-[320px]' : 'mr-0'}
          `}
        >
          {children}
        </div>

        {/* Right sidebar - fixed and toggleable */}
        <aside
          className={`
            fixed right-0 top-[60px] bottom-0 z-30 w-[320px] 
            border-l bg-card transition-transform duration-300 ease-in-out overflow-hidden
            ${rightSidebarOpen && !isMobile ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          <RightPanel />
        </aside>
      </section>

      {/* AI Chat Widget - Hide on settings page */}
      {!params.id?.includes('settings') && typeof window !== 'undefined' && !window.location.pathname.includes('/settings') && <AiChatWidget />}
    </main>
  )
}