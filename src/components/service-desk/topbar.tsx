"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Bell, HelpCircle, Settings, Plus, Menu } from "lucide-react"
import { useWorkspace } from "@/lib/workspace-context"
import { Skeleton } from "@/components/ui/skeleton"

interface TopBarProps {
  onToggleLeftSidebar: () => void
  onToggleRightSidebar: () => void
  rightSidebarOpen: boolean
}

export function TopBar({ onToggleLeftSidebar, onToggleRightSidebar, rightSidebarOpen }: TopBarProps) {
  const { selectedWorkspace, isLoading } = useWorkspace();

  return (
    <div className="mx-auto flex w-full items-center gap-3 p-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleLeftSidebar}
        aria-label="Toggle navigation"
        className="h-8 w-8"
      >
        <Menu className="size-5" />
      </Button>

      {/* App launcher / logo placeholder */}
      <div className="h-8 w-8 rounded bg-muted" aria-hidden />

      {/* Breadcrumbs */}
      <div className="hidden min-w-0 md:block">
        <Breadcrumb>
          <BreadcrumbList className="text-sm">
            {isLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : selectedWorkspace ? (
              <BreadcrumbItem>
                <BreadcrumbPage>{selectedWorkspace.name}</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>No workspace selected</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Search */}
      <div className="ml-auto flex w-full max-w-[520px] items-center gap-2">
        <Input placeholder="Search" className="h-9" aria-label="Search" />
        <Button size="sm" className="h-9">
          <Plus className="mr-2 size-4" />
          Create
        </Button>
        <button
          aria-label="Notifications"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-muted"
        >
          <Bell className="size-4" />
        </button>
        <button
          aria-label="Help"
          onClick={onToggleRightSidebar}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted ${
            rightSidebarOpen ? "bg-muted" : "bg-background"
          }`}
        >
          <HelpCircle className="size-4" />
        </button>
        <button
          aria-label="Settings"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-muted"
        >
          <Settings className="size-4" />
        </button>
      </div>
    </div>
  )
}
