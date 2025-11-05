"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { LogOut, Trash2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/utils/api.client";
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/user-context"

// Function to generate a random gentle background color
const getRandomColor = () => {
  const colors = [
    "bg-red-200",
    "bg-green-200",
    "bg-blue-200",
    "bg-yellow-200",
    "bg-purple-200",
    "bg-pink-200",
    "bg-indigo-200",
    "bg-teal-200",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export default function ProfileDialog() {
  const { user, refetch } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState("")
  const { toast } = useToast()
  const router = useRouter()
  const [avatarColor, setAvatarColor] = useState("")

  useEffect(() => {
    if (user) {
      setTempName(user.fullName)
    }
    setAvatarColor(getRandomColor())
  }, [user])

  const handleSaveName = async () => {
    try {
      await apiClient.put("/users/me", { fullName: tempName })
      refetch()
      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your name has been successfully updated.",
      })
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to update your name.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      await apiClient.post("/users/logout", {})
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
      router.push("/auth")
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to log out.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await apiClient.delete("/users/delete")
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      })
      router.push("/auth")
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to delete your account.",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string) => {
    if (!name) return ""
    const nameParts = name.split(" ")
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    }
    return name[0].toUpperCase()
  }

  if (!user) {
    return null
  }

  return (
    <Card className="w-full border-0">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar || ""} alt={user.fullName} />
            <AvatarFallback className={`text-2xl text-primary-foreground ${avatarColor}`}>
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-2xl">Profile Settings</CardTitle>
        <CardDescription>Manage your account information and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name Section */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-semibold">
            Name
          </Label>
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                id="name"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter your name"
                className="flex-1"
              />
              <Button onClick={handleSaveName} size="icon" className="shrink-0">
                <Save className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false)
                  setTempName(user.fullName)
                }}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                ✕
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <span className="text-foreground">{user.fullName}</span>
              <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm">
                Edit
              </Button>
            </div>
          )}
        </div>

        {/* Email Section */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-semibold">
            Email
          </Label>
          <div className="p-3 border rounded-lg bg-muted/30">
            <span className="text-muted-foreground">{user.email}</span>
          </div>
        </div>

        {/* Actions Section */}
        <div className="pt-4 space-y-3 border-t">
          <h3 className="text-base font-semibold mb-3">Account Actions</h3>

          {/* Logout Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start bg-transparent" size="lg">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to logout? You will need to sign in again to access your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete Account Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full justify-start" size="lg">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account Permanently?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove all your data from
                  our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
