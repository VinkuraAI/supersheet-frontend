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
  FileText,
  BarChart3,
  Share2,
  Settings
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorkspace } from "@/lib/workspace-context"
import { useAuth } from "@/lib/auth-context"
import apiClient from "@/utils/api.client"
import { ShareWorkspaceDialog } from "@/components/dialogs/share-workspace-dialog"

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
  const { selectedWorkspace, isLoading: isWorkspaceLoading, canCreateWorkspace, workspaceCount, maxWorkspaces, permissions } = useWorkspace()
  const { user, isLoading: isUserLoading } = useAuth()
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
      if (path.includes('/reports')) {
        return { name: 'Reports', icon: 'chart' }
      }
      if (path.includes('/settings')) {
        return { name: 'Settings', icon: 'settings' }
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
    <div className="mx-auto flex w-full items-center gap-4 px-6 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm z-50 transition-all duration-300">
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleLeftSidebar}
        className="h-9 w-9 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumbs */}
      <div className="flex items-center min-w-0 flex-1">
        <Breadcrumb>
          <BreadcrumbList className="text-sm font-medium">
            {isWorkspaceLoading ? (
              <Skeleton className="h-5 w-32 rounded-md" />
            ) : (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer group"
                  >
                    <div className="p-1 rounded-md group-hover:bg-blue-50 transition-colors">
                      <Home className="h-4 w-4" />
                    </div>
                    <span>Home</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator className="text-slate-300">
                  <ChevronRight className="h-3.5 w-3.5" />
                </BreadcrumbSeparator>

                <BreadcrumbItem>
                  {selectedWorkspace ? (
                    currentPage ? (
                      <BreadcrumbLink
                        onClick={handleBackToWorkspace}
                        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer group"
                      >
                        <div className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-100 group-hover:ring-blue-200 transition-all" />
                        <span>{selectedWorkspace.name}</span>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="font-semibold text-slate-800 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-50" />
                        {selectedWorkspace.name}
                      </BreadcrumbPage>
                    )
                  ) : (
                    <BreadcrumbPage className="text-slate-400 italic">
                      No workspace selected
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>

                {/* Current Page (if exists) */}
                {currentPage && (
                  <>
                    <BreadcrumbSeparator className="text-slate-300">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </BreadcrumbSeparator>

                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-semibold text-slate-800 flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60">
                        {currentPage.icon === 'folder' && <FolderOpen className="h-3.5 w-3.5 text-blue-600" />}
                        {currentPage.icon === 'file' && <FileText className="h-3.5 w-3.5 text-purple-600" />}
                        {currentPage.icon === 'chart' && <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />}
                        {currentPage.icon === 'settings' && <Settings className="h-3.5 w-3.5 text-slate-600" />}
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
      <div className="hidden lg:flex items-center relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        </div>
        <Input
          placeholder="Search..."
          className="h-9 w-64 pl-9 text-sm bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl transition-all duration-200 hover:bg-slate-100 focus:bg-white"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Share Button - Only if workspace is selected and user has permission */}
        {selectedWorkspace && permissions.canManageMembers && (
          <ShareWorkspaceDialog>
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-4 text-sm font-medium border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all duration-200"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </ShareWorkspaceDialog>
        )}

        {/* Settings Button */}
        {selectedWorkspace && permissions.canDeleteWorkspace && (
          <Button
            size="sm"
            variant="ghost"
            className="h-9 w-9 px-0 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            onClick={() => router.push(`/workspace/${selectedWorkspace._id}/settings`)}
            title="Workspace Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}

        {/* Create Button */}
        <Button
          size="sm"
          className="h-9 px-4 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30"
          onClick={() => {
            if (canCreateWorkspace) {
              router.push('/welcome?create=true')
            }
          }}
          disabled={!canCreateWorkspace}
          title={!canCreateWorkspace ? `Workspace limit reached (${workspaceCount}/${maxWorkspaces})` : 'Create new workspace'}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create
        </Button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors relative"
        >
          <Bell className="h-5 w-5" />
        </Button>

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleRightSidebar}
          className={`h-9 w-9 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors ${rightSidebarOpen ? "bg-blue-50 text-blue-600" : ""}`}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* User Avatar */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 rounded-full p-0 hover:ring-4 hover:ring-slate-100 transition-all ml-1">
              {isUserLoading ? (
                <Skeleton className="h-9 w-9 rounded-full" />
              ) : (
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                  <AvatarImage src={""} alt={user?.name} />
                  <AvatarFallback className={`text-xs font-bold text-white ${avatarColor}`}>
                    {getInitials(user?.name || "")}
                  </AvatarFallback>
                </Avatar>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[360px] p-0 overflow-hidden rounded-3xl border-slate-100 shadow-2xl">
            <DialogTitle className="sr-only">Account</DialogTitle>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pt-8 pb-20 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <div className="relative z-10">
                <h3 className="text-white font-bold text-lg mb-1">
                  {(() => {
                    const hour = new Date().getHours();
                    if (hour < 12) return 'Good morning';
                    if (hour < 18) return 'Good afternoon';
                    return 'Good evening';
                  })()}, {user?.name?.split(' ')[0]}!
                </h3>
                <p className="text-blue-100 text-sm font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="px-6 pb-6 -mt-12 relative z-20">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                    <AvatarImage src={""} alt={user?.name} />
                    <AvatarFallback className={`text-3xl font-bold text-white ${avatarColor}`}>
                      {getInitials(user?.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start gap-3 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-blue-700 hover:border-blue-200 transition-all group"
                  onClick={() => router.push('/user/settings')}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <User className="h-4 w-4 text-slate-600 group-hover:text-blue-600" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-slate-700 group-hover:text-blue-700">Manage Profile</span>
                    <span className="text-[10px] text-slate-400 font-medium">Update your personal details</span>
                  </div>
                </Button>

                <LogoutDialog />
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400 font-medium">Logged in as {user?.name}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
