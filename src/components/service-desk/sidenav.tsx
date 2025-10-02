"use client"

import { useEffect, useState } from "react"
import { ChevronDown, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import apiClient from "@/utils/api.client"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

interface Workspace {
  _id: string
  name: string
  // Add other properties if needed
}

const initialSections = [
  {
    title: "Queues",
    items: [
      { label: "All open", active: true },
      { label: "Assigned to me" },
      { label: "Unassigned" },
      { label: "View all queues" },
    ],
  },
  {
    title: "Views",
    items: [
      { label: "Reports" },
      { label: "Knowledge Base" },
      { label: "Customers" },
      { label: "Channels" },
      { label: "Raise a request" },
    ],
  },
  {
    title: "Recommended",
    items: [{ label: "Create a roadmap" }, { label: "More projects" }],
  },
]

export function SideNav() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isWorkspacesOpen, setIsWorkspacesOpen] = useState(false)

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await apiClient.get("/api/workspaces/")
        setWorkspaces(response.data)
      } catch (error) {
        console.error("Failed to fetch workspaces:", error)
      }
    }

    fetchWorkspaces()
  }, [])

  const toggleWorkspaces = () => {
    setIsWorkspacesOpen(!isWorkspacesOpen)
  }

  return (
    <nav className="text-sm">
      {initialSections.map((section) => (
        <div key={section.title} className="mb-3">
          <div className="px-2 pb-1 text-xs font-medium text-muted-foreground">
            {section.title}
          </div>
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.label}>
                <a
                  href="#"
                  className={cn(
                    "block rounded-md px-2 py-1.5 hover:bg-muted",
                    item.active ? "bg-muted font-medium" : ""
                  )}
                  aria-current={item.active ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          {section.title === "Views" && (
            <div className="mt-1">
              <button
                onClick={toggleWorkspaces}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-muted"
              >
                <span>Workspaces</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transform transition-transform",
                    isWorkspacesOpen ? "rotate-180" : ""
                  )}
                />
              </button>
              {isWorkspacesOpen && (
                <ul className="space-y-0.5 pl-4 pt-1">
                  {workspaces.map((workspace) => (
                    <li key={workspace._id}>
                      <ContextMenu>
                        <ContextMenuTrigger>
                          <a
                            href="#"
                            className="block rounded-md px-2 py-1.5 hover:bg-muted"
                          >
                            {workspace.name}
                          </a>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Rename
                          </ContextMenuItem>
                          <ContextMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Workspace
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}