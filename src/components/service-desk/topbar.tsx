"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Bell, 
  HelpCircle, 
  Plus, 
  Menu, 
  Home, 
  ChevronRight, 
  LogOut,
  User,
  FolderOpen,
  FileText
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorkspace } from "@/lib/workspace-context"
import { useUser } from "@/lib/user-context"
import apiClient from "@/utils/api.client"

interface TopBarProps {
  onToggleLeftSidebar: () => void
  onToggleRightSidebar: () => void
  rightSidebarOpen: boolean
}

// Logout Dialog Component
function LogoutDialog() {
  const router = useRouter()
  
  const handleLogout = async () => {
    try {
      await apiClient.post("/users/logout", {})
      router.push("/auth")
    } catch (error) {
      console.error("Logout failed:", error)
      router.push("/auth") // Redirect anyway
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="w-full gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[400px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Logout Confirmation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to logout? You will be redirected to the login page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout}>
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// User Avatar Colors
const avatarColors = [
  "bg-blue-500", "bg-green-500", "bg-red-500", "bg-yellow-500",
  "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"
]

const getRandomColor = () => avatarColors[Math.floor(Math.random() * avatarColors.length)]

const getInitials = (name: string) => {
  if (!name) return "U"
  const nameParts = name.split(" ")
  if (nameParts.length > 1) {
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
  }
  return name[0].toUpperCase()
}

export function TopBar({ onToggleLeftSidebar, onToggleRightSidebar, rightSidebarOpen }: TopBarProps) {
  const router = useRouter()
  const { selectedWorkspace, isLoading: isWorkspaceLoading, canCreateWorkspace, workspaceCount, maxWorkspaces } = useWorkspace()
  const { user, isLoading: isUserLoading } = useUser()
  const [avatarColor, setAvatarColor] = useState("")

  useEffect(() => {
    setAvatarColor(getRandomColor())
  }, [])

  // Detect current page based on URL
  const getCurrentPage = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      if (path.includes('/documents')) {
        return { name: 'Documents', icon: 'folder' }
      }
      if (path.includes('/forms')) {
        return { name: 'Forms', icon: 'file' }
      }
    }
    return null
  }

  const currentPage = getCurrentPage()

  const handleBackToWorkspace = () => {
    const workspaceId = selectedWorkspace?._id
    if (workspaceId) {
      router.push(`/workspace/${workspaceId}`)
    }
  }

  return (
    <div className="mx-auto flex w-full items-center gap-4 px-4 py-2">
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleLeftSidebar}
        className="h-8 w-8 hover:bg-accent/50 rounded-md"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Breadcrumbs */}
      <div className="flex items-center min-w-0 flex-1">
        <Breadcrumb>
          <BreadcrumbList className="text-sm">
            {isWorkspaceLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Home className="h-4 w-4" />
                    <span>home</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                
                <BreadcrumbSeparator className="text-muted-foreground/50">
                  <ChevronRight className="h-3 w-3" />
                </BreadcrumbSeparator>
                
                <BreadcrumbItem>
                  {selectedWorkspace ? (
                    currentPage ? (
                      <BreadcrumbLink
                        onClick={handleBackToWorkspace}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>{selectedWorkspace.name}</span>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="font-medium text-foreground flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        {selectedWorkspace.name}
                      </BreadcrumbPage>
                    )
                  ) : (
                    <BreadcrumbPage className="text-muted-foreground italic">
                      No workspace selected
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                
                {/* Current Page (if exists) */}
                {currentPage && (
                  <>
                    <BreadcrumbSeparator className="text-muted-foreground/50">
                      <ChevronRight className="h-3 w-3" />
                    </BreadcrumbSeparator>
                    
                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-medium text-foreground flex items-center gap-2">
                        {currentPage.icon === 'folder' && <FolderOpen className="h-4 w-4" />}
                        {currentPage.icon === 'file' && <FileText className="h-4 w-4" />}
                        {currentPage.name}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Search - Hidden on mobile */}
      <div className="hidden lg:flex items-center">
        <Input 
          placeholder="Search..." 
          className="h-8 w-72 text-sm bg-accent/30 border-0 focus-visible:ring-1 focus-visible:ring-ring" 
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Create Button */}
        <Button 
          size="sm" 
          className="h-8 px-4 text-sm font-medium" 
          onClick={() => {
            if (canCreateWorkspace) {
              router.push('/welcome?create=true')
            }
          }}
          disabled={!canCreateWorkspace}
          title={!canCreateWorkspace ? `Workspace limit reached (${workspaceCount}/${maxWorkspaces})` : 'Create new workspace'}
        >
          <Plus className="h-4 w-4 mr-1" />
          Create
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-accent/50 rounded-md relative"
        >
          <Bell className="h-4 w-4" />
          {/* Optional notification badge */}
          {/* <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" /> */}
        </Button>

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleRightSidebar}
          className={`h-8 w-8 hover:bg-accent/50 rounded-md ${rightSidebarOpen ? "bg-accent" : ""}`}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>

        {/* User Avatar */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 rounded-full p-0 hover:ring-2 hover:ring-ring/20 ml-1">
              {isUserLoading ? (
                <Skeleton className="h-7 w-7 rounded-full" />
              ) : (
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.avatar || ""} alt={user?.fullName} />
                  <AvatarFallback className={`text-xs font-medium text-white ${avatarColor}`}>
                    {getInitials(user?.fullName || "")}
                  </AvatarFallback>
                </Avatar>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[320px] p-6">
            <DialogHeader>
              <DialogTitle className="text-center">Account</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatar || ""} alt={user?.fullName} />
                <AvatarFallback className={`text-lg font-medium text-white ${avatarColor}`}>
                  {getInitials(user?.fullName || "")}
                </AvatarFallback>
              </Avatar>
              <div className="text-center space-y-1">
                <p className="font-medium">{user?.fullName}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div className="w-full space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                >
                  <User className="h-4 w-4" />
                  Manage Profile
                </Button>
                <LogoutDialog />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
