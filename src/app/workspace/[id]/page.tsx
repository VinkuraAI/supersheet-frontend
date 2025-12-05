"use client"
import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useWorkspaceDetails } from "@/features/workspace/hooks/use-workspaces"
import { Loader2 } from "lucide-react"

export default function WorkspaceRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.id as string

  const { data: workspace, isLoading } = useWorkspaceDetails(workspaceId)

  useEffect(() => {
    if (workspace) {
      const routePrefix = (workspace.mainFocus === 'product-management' || workspace.mainFocus === 'project-management') ? 'pm' : 'hr'
      router.replace(`/${routePrefix}/workspace/${workspace._id}`)
    }
  }, [workspace, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  )
}
