"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Bell, HelpCircle, Plus, Menu } from "lucide-react"
import { useWorkspace } from "@/lib/workspace-context"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import ProfileDialog from "@/components/auth/ProfileDialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/lib/user-context"

interface TopBarProps {
  onToggleLeftSidebar: () => void
  onToggleRightSidebar: () => void
  rightSidebarOpen: boolean
}

// Function to generate a random gentle background color
const getRandomColor = () => {
  const colors = [
    "bg-red-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export function TopBar({ onToggleLeftSidebar, onToggleRightSidebar, rightSidebarOpen }: TopBarProps) {
  const { selectedWorkspace, isLoading: isWorkspaceLoading } = useWorkspace()
  const { user, isLoading: isUserLoading } = useUser()
  const [avatarColor, setAvatarColor] = useState("")

  useEffect(() => {
    setAvatarColor(getRandomColor())
  }, [])

  const getInitials = (name: string) => {
    if (!name) return ""
    const nameParts = name.split(" ")
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    }
    return name[0].toUpperCase()
  }

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
            {isWorkspaceLoading ? (
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
        <Button size="sm" className="h-9" disabled={!selectedWorkspace}>
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
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 rounded-full">
              {isUserLoading ? (
                <Skeleton className="h-8 w-8 rounded-full" />
              ) : (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || ""} alt={user?.fullName} />
                  <AvatarFallback className={`text-sm text-primary-foreground ${avatarColor}`}>
                    {getInitials(user?.fullName || "")}
                  </AvatarFallback>
                </Avatar>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <ProfileDialog />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
