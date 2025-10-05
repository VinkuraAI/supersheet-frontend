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
  DialogHeader,
  DialogTitle,
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
    <div className="mx-auto flex w-full items-center gap-2 p-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleLeftSidebar}
        aria-label="Toggle navigation"
        className="h-6 w-6"
      >
        <Menu className="size-4" />
      </Button>

      {/* App launcher / logo placeholder */}
      <div className="h-6 w-6 rounded bg-muted" aria-hidden />

      {/* Breadcrumbs */}
      <div className="hidden min-w-0 md:block">
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            {isWorkspaceLoading ? (
              <Skeleton className="h-4 w-24" />
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
      <div className="ml-auto flex w-full max-w-[390px] items-center gap-1.5">
        <Input placeholder="Search" className="h-7 text-xs" aria-label="Search" />
        <Button size="sm" className="h-7 px-2 text-xs" disabled={!selectedWorkspace}>
          <Plus className="mr-1.5 size-3" />
          Create
        </Button>
        <button
          aria-label="Notifications"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border bg-background hover:bg-muted"
        >
          <Bell className="size-3" />
        </button>
        <button
          aria-label="Help"
          onClick={onToggleRightSidebar}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-md border hover:bg-muted ${
            rightSidebarOpen ? "bg-muted" : "bg-background"
          }`}
        >
          <HelpCircle className="size-3" />
        </button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="h-7 w-7 rounded-full p-0">
              {isUserLoading ? (
                <Skeleton className="h-6 w-6 rounded-full" />
              ) : (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user?.avatar || ""} alt={user?.fullName} />
                  <AvatarFallback className={`text-xs text-primary-foreground ${avatarColor}`}>
                    {getInitials(user?.fullName || "")}
                  </AvatarFallback>
                </Avatar>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="sr-only">
              <DialogTitle>Profile Settings</DialogTitle>
            </DialogHeader>
            <ProfileDialog />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
