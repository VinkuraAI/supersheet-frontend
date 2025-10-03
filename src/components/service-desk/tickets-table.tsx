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
import { Plus, Trash2 } from "lucide-react"



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

import { useWorkspace } from "@/lib/workspace-context";

export function TicketsTable({ tickets, schema, setData }: {
  tickets: any[];
  schema: any[];
  setData: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const { selectedWorkspace } = useWorkspace();
  const disabled = !selectedWorkspace;

  const [data, setInternalData] = useState(tickets);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const resizingRef = useRef<{ col: string; startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    setInternalData(tickets);
    const initialWidths: Record<string, number> = { checkbox: 50 };
    schema.forEach(col => {
      initialWidths[col.name] = 150; // Default width
    });
    setColumnWidths(initialWidths);
  }, [tickets, schema]);

  // Handle column resize
  const handleMouseDown = (col: string, e: React.MouseEvent) => {
    if (disabled) return;
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
    if (disabled) return;
    setEditingCell({ row: rowIndex, col })
    setEditValue(value)
  }

  const handleSaveEdit = () => {
    if (!editingCell) return;
    const { row, col } = editingCell;
    const newData = data.map((item, i) =>
      i === row
        ? {
            ...item,
            data: { ...item.data, [col]: editValue },
          }
        : item,
    );
    setData(newData);
    setEditingCell(null);
    setEditValue("");
  };

  const handleAddRow = () => {
    if (disabled) return;
    const newRow: any = { data: {} };
    schema.forEach(col => {
      newRow.data[col.name] = ""; // Initialize with empty strings
    });
    setData((prev: any) => [...prev, newRow]);
  };

  const handleDeleteRows = () => {
    if (disabled) return;
    setData((prev: any) => prev.filter((_: any, index: number) => !selectedRows.has(index)));
    setSelectedRows(new Set());
  };

  // Handle individual row selection
  const handleRowSelect = (rowIndex: number, checked: boolean) => {
    if (disabled) return;
    setSelectedRows((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(rowIndex)
      } else {
        newSet.delete(rowIndex)
      }
      return newSet
    })
  }

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (disabled) return;
    if (checked) {
      setSelectedRows(new Set(data.map((_, index) => index)))
    } else {
      setSelectedRows(new Set())
    }
  }

  return (
    <div className={`flex flex-col h-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex gap-2 p-3 border-b bg-card">
        <Button onClick={handleAddRow} size="sm" className="gap-2" disabled={disabled}>
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
          disabled={disabled}
        >
          <Plus className="size-4" />
          Add Column
        </Button>
        <Button
          onClick={handleDeleteRows}
          size="sm"
          variant="destructive"
          className="gap-2"
          disabled={selectedRows.size === 0 || disabled}
        >
          <Trash2 className="size-4" />
          Delete Row{selectedRows.size > 1 ? 's' : ''}
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
                <Checkbox 

                  aria-label="Select all" 
                  checked={selectedRows.size === data.length && data.length > 0}
                  onCheckedChange={(checked) => handleSelectAll(checked === true)}
                />
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                  onMouseDown={(e) => handleMouseDown("checkbox", e)}
                />
              </TableHead>
              {schema.map(col => (
                <TableHead
                  key={col.name}
                  className="border-r bg-muted/30 relative"
                  style={{ width: columnWidths[col.name], minWidth: columnWidths[col.name] }}
                >
                  {col.name}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                    onMouseDown={(e) => handleMouseDown(col.name, e)}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-primary/5">
                <TableCell 
                  className="border-r bg-muted/30 cursor-pointer"
                  style={{ width: columnWidths.checkbox }}
                  onClick={() => handleRowSelect(rowIndex, !selectedRows.has(rowIndex))}
                >
                  <Checkbox 
                    aria-label={`Select row ${rowIndex}`}
                    checked={selectedRows.has(rowIndex)}
                    onCheckedChange={(checked) => handleRowSelect(rowIndex, checked === true)}
                  />
                </TableCell>
                {schema.map(col => (
                  <TableCell
                    key={col.name}
                    className="border-r bg-background overflow-hidden"
                    style={{ width: columnWidths[col.name], maxWidth: columnWidths[col.name] }}
                  >
                    {editingCell?.row === rowIndex && editingCell?.col === col.name ? (
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
                        content={row.data[col.name]} 
                        onDoubleClick={() => handleDoubleClick(rowIndex, col.name, row.data[col.name])}
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody></Table>
      </div>
    </div>
  )
}
