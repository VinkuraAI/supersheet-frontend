"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

type Ticket = {
  key: string
  type: "T" | "I" | "Q"
  summary: string
  reporter: string
  assignee?: { name: string; initials: string }
  status: "WAITING FOR SUPPORT" | "WAITING FOR APPROVAL" | "IN PROGRESS"
  created: string
  sla: string
}

const initialData: Ticket[] = [
  {
    key: "DEMO-4",
    type: "T",
    summary: "Collecting custom request details",
    reporter: "Example Customer",
    assignee: undefined,
    status: "WAITING FOR APPROVAL",
    created: "27/Sep/25",
    sla: "Sep 30 05:00 PM",
  },
  {
    key: "DEMO-3",
    type: "I",
    summary: "Agents & customers",
    reporter: "Example Customer",
    assignee: undefined,
    status: "WAITING FOR SUPPORT",
    created: "27/Sep/25",
    sla: "Sep 30 05:00 PM",
  },
  {
    key: "DEMO-2",
    type: "Q",
    summary: "Capturing customer email requests",
    reporter: "Example Customer",
    assignee: undefined,
    status: "WAITING FOR SUPPORT",
    created: "27/Sep/25",
    sla: "Sep 30 05:00 PM",
  },
  {
    key: "DEMO-1",
    type: "Q",
    summary: "What is a request?",
    reporter: "Example Customer",
    assignee: { name: "Akshit Shukla", initials: "AS" },
    status: "WAITING FOR SUPPORT",
    created: "27/Sep/25",
    sla: "Sep 30 05:00 PM",
  },
  {
    key: "DEMO-6",
    type: "T",
    summary: "Triaging requests into queues",
    reporter: "Example Customer",
    assignee: undefined,
    status: "WAITING FOR SUPPORT",
    created: "28/Sep/25",
    sla: "Sep 30 05:00 PM",
  },
]

function StatusPill({ status }: { status: Ticket["status"] }) {
  const map: Record<Ticket["status"], string> = {
    "WAITING FOR SUPPORT": "bg-secondary text-secondary-foreground",
    "WAITING FOR APPROVAL": "bg-accent text-accent-foreground",
    "IN PROGRESS": "bg-primary text-primary-foreground",
  }
  return (
    <Badge variant="secondary" className={map[status]}>
      {status}
    </Badge>
  )
}

// Truncated Cell Component with Popover
function TruncatedCell({ 
  content, 
  onDoubleClick 
}: { 
  content: string
  onDoubleClick?: () => void 
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div 
          className="cursor-pointer hover:text-primary hover:underline truncate w-full text-left"
          onDoubleClick={onDoubleClick}
          title={content}
        >
          {content}
        </div>
      </PopoverTrigger>
      <PopoverContent className="max-w-md p-4" side="top">
        <div className="text-sm whitespace-pre-wrap break-words">
          {content}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function TicketsTable() {
  const [data, setData] = useState<Ticket[]>(initialData)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    checkbox: 50,
    type: 60,
    key: 100,
    summary: 200,
    reporter: 120,
    assignee: 150,
    status: 180,
    created: 100,
    sla: 140,
  })
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null)
  const [editValue, setEditValue] = useState("")
  const resizingRef = useRef<{ col: string; startX: number; startWidth: number } | null>(null)

  // Handle column resize
  const handleMouseDown = (col: string, e: React.MouseEvent) => {
    e.preventDefault()
    resizingRef.current = {
      col,
      startX: e.clientX,
      startWidth: columnWidths[col],
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return
      const { col, startX, startWidth } = resizingRef.current
      const diff = e.clientX - startX
      const newWidth = Math.max(60, startWidth + diff)
      setColumnWidths((prev) => ({ ...prev, [col]: newWidth }))
    }

    const handleMouseUp = () => {
      resizingRef.current = null
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  // Handle double-click to edit
  const handleDoubleClick = (rowIndex: number, col: string, value: string) => {
    setEditingCell({ row: rowIndex, col })
    setEditValue(value)
  }

  // Save edited value
  const handleSaveEdit = () => {
    if (!editingCell) return
    const { row, col } = editingCell
    setData((prev) =>
      prev.map((item, i) =>
        i === row
          ? {
              ...item,
              [col]: editValue,
            }
          : item,
      ),
    )
    setEditingCell(null)
    setEditValue("")
  }

  // Add new row
  const handleAddRow = () => {
    const maxKey = data.length > 0 ? Math.max(...data.map((d) => Number(d.key.split("-")[1]))) : 0
    const newRow: Ticket = {
      key: `DEMO-${maxKey + 1}`,
      type: "T",
      summary: "New ticket",
      reporter: "New Customer",
      assignee: undefined,
      status: "WAITING FOR SUPPORT",
      created: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }),
      sla: "TBD",
    }
    setData((prev) => [...prev, newRow])
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 p-3 border-b bg-card">
        <Button onClick={handleAddRow} size="sm" className="gap-2">
          <Plus className="size-4" />
          Add Row
        </Button>
        <Button
          onClick={() => {
            // Placeholder for add column functionality
            alert("Add Column functionality can be implemented based on your schema")
          }}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Plus className="size-4" />
          Add Column
        </Button>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-primary w-full pr-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="border-r bg-muted/30 relative"
                style={{ width: columnWidths.checkbox, minWidth: columnWidths.checkbox }}
              >
                <Checkbox aria-label="Select all" />
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                  onMouseDown={(e) => handleMouseDown("checkbox", e)}
                />
              </TableHead>
              <TableHead
                className="border-r text-center bg-background relative"
                style={{ width: columnWidths.type, minWidth: columnWidths.type }}
              >
                T
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                  onMouseDown={(e) => handleMouseDown("type", e)}
                />
              </TableHead>
              <TableHead
                className="border-r bg-muted/30 relative"
                style={{ width: columnWidths.key, minWidth: columnWidths.key }}
              >
                Key
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                  onMouseDown={(e) => handleMouseDown("key", e)}
                />
              </TableHead>
              <TableHead
                className="border-r bg-background relative"
                style={{ width: columnWidths.summary, minWidth: columnWidths.summary }}
              >
                Summary
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                  onMouseDown={(e) => handleMouseDown("summary", e)}
                />
              </TableHead>
              <TableHead
                className="border-r bg-muted/30 relative"
                style={{ width: columnWidths.reporter, minWidth: columnWidths.reporter }}
              >
                Reporter
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                  onMouseDown={(e) => handleMouseDown("reporter", e)}
                />
              </TableHead>
              <TableHead
                className="border-r bg-background relative"
                style={{ width: columnWidths.assignee, minWidth: columnWidths.assignee }}
              >
                Assignee
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                  onMouseDown={(e) => handleMouseDown("assignee", e)}
                />
              </TableHead>
              <TableHead
                className="border-r bg-muted/30 relative"
                style={{ width: columnWidths.status, minWidth: columnWidths.status }}
              >
                Status
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                  onMouseDown={(e) => handleMouseDown("status", e)}
                />
              </TableHead>
              <TableHead
                className="border-r bg-background relative"
                style={{ width: columnWidths.created, minWidth: columnWidths.created }}
              >
                Created
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                  onMouseDown={(e) => handleMouseDown("created", e)}
                />
              </TableHead>
              <TableHead
                className="bg-muted/30 relative"
                style={{ width: columnWidths.sla, minWidth: columnWidths.sla }}
              >
                Time to resolution
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                  onMouseDown={(e) => handleMouseDown("sla", e)}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((t, rowIndex) => (
              <TableRow key={t.key} className="hover:bg-primary/5">
                <TableCell className="border-r bg-muted/30" style={{ width: columnWidths.checkbox }}>
                  <Checkbox aria-label={`Select ${t.key}`} />
                </TableCell>
                <TableCell className="border-r text-center bg-background" style={{ width: columnWidths.type }}>
                  {editingCell?.row === rowIndex && editingCell?.col === "type" ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                      autoFocus
                      className="h-7 text-xs"
                    />
                  ) : (
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded border text-xs cursor-pointer"
                      onDoubleClick={() => handleDoubleClick(rowIndex, "type", t.type)}
                    >
                      {t.type}
                    </span>
                  )}
                </TableCell>
                <TableCell
                  className="border-r font-medium bg-muted/30 overflow-hidden"
                  style={{ width: columnWidths.key, maxWidth: columnWidths.key }}
                >
                  {editingCell?.row === rowIndex && editingCell?.col === "key" ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                      autoFocus
                      className="h-7"
                    />
                  ) : (
                    <TruncatedCell 
                      content={t.key} 
                      onDoubleClick={() => handleDoubleClick(rowIndex, "key", t.key)}
                    />
                  )}
                </TableCell>
                <TableCell
                  className="border-r bg-background overflow-hidden"
                  style={{ width: columnWidths.summary, maxWidth: columnWidths.summary }}
                >
                  {editingCell?.row === rowIndex && editingCell?.col === "summary" ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                      autoFocus
                      className="h-7"
                    />
                  ) : (
                    <TruncatedCell 
                      content={t.summary} 
                      onDoubleClick={() => handleDoubleClick(rowIndex, "summary", t.summary)}
                    />
                  )}
                </TableCell>
                <TableCell
                  className="border-r text-muted-foreground bg-muted/30 overflow-hidden"
                  style={{ width: columnWidths.reporter, maxWidth: columnWidths.reporter }}
                >
                  {editingCell?.row === rowIndex && editingCell?.col === "reporter" ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                      autoFocus
                      className="h-7"
                    />
                  ) : (
                    <TruncatedCell 
                      content={t.reporter} 
                      onDoubleClick={() => handleDoubleClick(rowIndex, "reporter", t.reporter)}
                    />
                  )}
                </TableCell>
                <TableCell 
                  className="border-r bg-background overflow-hidden" 
                  style={{ width: columnWidths.assignee, maxWidth: columnWidths.assignee }}
                >
                  {t.assignee ? (
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      <Avatar className="size-6 flex-shrink-0">
                        <AvatarFallback className="text-xs">{t.assignee.initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <TruncatedCell 
                          content={t.assignee.name} 
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Unassigned</span>
                  )}
                </TableCell>
                <TableCell 
                  className="border-r bg-muted/30 overflow-hidden" 
                  style={{ width: columnWidths.status, maxWidth: columnWidths.status }}
                >
                  <StatusPill status={t.status} />
                </TableCell>
                <TableCell
                  className="border-r bg-background overflow-hidden"
                  style={{ width: columnWidths.created, maxWidth: columnWidths.created }}
                >
                  {editingCell?.row === rowIndex && editingCell?.col === "created" ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                      autoFocus
                      className="h-7"
                    />
                  ) : (
                    <TruncatedCell 
                      content={t.created} 
                      onDoubleClick={() => handleDoubleClick(rowIndex, "created", t.created)}
                    />
                  )}
                </TableCell>
                <TableCell
                  className="bg-muted/30 overflow-hidden"
                  style={{ width: columnWidths.sla, maxWidth: columnWidths.sla }}
                >
                  {editingCell?.row === rowIndex && editingCell?.col === "sla" ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                      autoFocus
                      className="h-7"
                    />
                  ) : (
                    <TruncatedCell 
                      content={t.sla} 
                      onDoubleClick={() => handleDoubleClick(rowIndex, "sla", t.sla)}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
