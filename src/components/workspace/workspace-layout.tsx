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
            fixed left-0 top-[45px] bottom-0 z-30 w-[195px] 
            border-r bg-card transition-transform duration-200 ease-in-out
            ${leftSidebarOpen && !isMobile ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <SideNav />
        </aside>

        {/* Main content area */}
        <div 
          className={`
            flex-1 transition-all duration-200 ease-in-out overflow-hidden
            ${leftSidebarOpen && !isMobile ? 'ml-[195px]' : 'ml-0'}
            ${rightSidebarOpen && !isMobile ? 'mr-[320px]' : 'mr-0'}
          `}
        >
          {children}
        </div>

        {/* Right sidebar - fixed and toggleable */}
        <aside
          className={`
            fixed right-0 top-[45px] bottom-0 z-30 w-[320px] 
            border-l bg-card transition-transform duration-200 ease-in-out overflow-hidden
            ${rightSidebarOpen && !isMobile ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          <RightPanel />
        </aside>
      </section>

      {/* AI Chat Widget */}
      <AiChatWidget />
    </main>
  )
}