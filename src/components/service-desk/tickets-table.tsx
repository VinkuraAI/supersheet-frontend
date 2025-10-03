"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, RefreshCw, AlertTriangle, X } from "lucide-react";
import apiClient from "@/utils/api.client";

// Truncated Cell Component with Popover
function TruncatedCell({
  content,
  onDoubleClick,
}: {
  content: string;
  onDoubleClick?: () => void;
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
        <div className="text-sm whitespace-pre-wrap break-words">{content}</div>
      </PopoverContent>
    </Popover>
  );
}

import { useWorkspace } from "@/lib/workspace-context";

export function TicketsTable({
  tickets,
  schema,
  setData,
}: {
  tickets: any[];
  schema: any[];
  setData: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const { selectedWorkspace } = useWorkspace();
  const disabled = !selectedWorkspace;

  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const resizingRef = useRef<{
    col: string;
    startX: number;
    startWidth: number;
  } | null>(null);
  const initialData = useRef(tickets);
  const [isSynced, setIsSynced] = useState(true);
  const [showSyncWarning, setShowSyncWarning] = useState(false);
  const [filteredSchema, setFilteredSchema] = useState(schema);

  useEffect(() => {
    if (selectedWorkspace) {
      const localData = localStorage.getItem(
        `workspace-${selectedWorkspace._id}-data`
      );
      if (localData) {
        setData(JSON.parse(localData));
      }
      initialData.current = tickets;
    }
  }, [selectedWorkspace, setData]);

  useEffect(() => {
    const checkSyncStatus = () => {
      const added = tickets.some((row) => row.isNew);
      const updated = tickets.some((row) => {
        const initialRow = initialData.current.find((r) => r._id === row._id);
        return (
          initialRow &&
          JSON.stringify(initialRow) !== JSON.stringify(row) &&
          !row.isNew
        );
      });
      const deleted = initialData.current.some(
        (initialRow) => !tickets.some((row) => row._id === initialRow._id)
      );

      if (added || updated || deleted) {
        setIsSynced(false);
        setShowSyncWarning(true);
      } else {
        setIsSynced(true);
        setShowSyncWarning(false);
      }
    };

    checkSyncStatus();
  }, [tickets]);

  useEffect(() => {
    const newFilteredSchema = schema.filter(col => {
      return tickets.some(row => row.data[col.name] && row.data[col.name] !== "");
    });
    setFilteredSchema(newFilteredSchema);
  }, [tickets, schema]);

  useEffect(() => {
    const initialWidths: Record<string, number> = { checkbox: 50 };
    schema.forEach(col => {
      initialWidths[col.name] = 150; // Default width
    });
    setColumnWidths(initialWidths);
  }, [schema]);

  // Handle column resize
  const handleMouseDown = (col: string, e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    resizingRef.current = {
      col,
      startX: e.clientX,
      startWidth: columnWidths[col],
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const { col, startX, startWidth } = resizingRef.current;
      const diff = e.clientX - startX;
      const newWidth = Math.max(60, startWidth + diff);
      setColumnWidths((prev) => ({ ...prev, [col]: newWidth }));
    };

    const handleMouseUp = () => {
      resizingRef.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Handle double-click to edit
  const handleDoubleClick = (rowIndex: number, col: string, value: string) => {
    if (disabled) return;
    setEditingCell({ row: rowIndex, col });
    setEditValue(value);
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    const { row, col } = editingCell;
    const newData = tickets.map((item, i) =>
      i === row
        ? {
            ...item,
            data: { ...item.data, [col]: editValue },
          }
        : item
    );
    setData(newData);
    if (selectedWorkspace) {
      localStorage.setItem(
        `workspace-${selectedWorkspace._id}-data`,
        JSON.stringify(newData)
      );
    }
    setEditingCell(null);
    setEditValue("");
  };

  const handleAddRow = () => {
    if (disabled) return;
    const newRow: any = { data: {}, isNew: true };
    schema.forEach((col) => {
      newRow.data[col.name] = ""; // Initialize with empty strings
    });
    const newData = [...tickets, newRow];
    setData(newData);
    if (selectedWorkspace) {
      localStorage.setItem(
        `workspace-${selectedWorkspace._id}-data`,
        JSON.stringify(newData)
      );
    }
  };

  const handleDeleteRows = () => {
    if (disabled) return;
    const newData = tickets.filter(
      (_: any, index: number) => !selectedRows.has(index)
    );
    setData(newData);
    if (selectedWorkspace) {
      localStorage.setItem(
        `workspace-${selectedWorkspace._id}-data`,
        JSON.stringify(newData)
      );
    }
    setSelectedRows(new Set());
  };

  const handleAddColumn = () => {
    if (disabled) return;
    const newColumnName = prompt("Enter new column name");
    if (newColumnName) {
      const newColumn = { name: newColumnName, type: "text", isDefault: false };
      // I need to update the schema in the parent component
      // For now, I will just update the local state
      const newSchema = [...schema, newColumn];
      const newData = tickets.map((row) => ({
        ...row,
        data: {
          ...row.data,
          [newColumnName]: "",
        },
      }));
      setData(newData);
    }
  };

  const handleSync = async () => {
    if (disabled) return;

    const added = tickets.filter((row) => row.isNew);
    const updated = tickets.filter((row) => {
      const initialRow = initialData.current.find((r) => r._id === row._id);
      return (
        initialRow &&
        JSON.stringify(initialRow) !== JSON.stringify(row) &&
        !row.isNew
      );
    });
    const deleted = initialData.current.filter(
      (initialRow) => !tickets.some((row) => row._id === initialRow._id)
    );

    try {
      await apiClient.post(`/api/workspaces/${selectedWorkspace?._id}/sync`, {
        added,
        updated,
        deleted,
      });
      setIsSynced(true);
      setShowSyncWarning(false);
      alert("Sync successful!");
    } catch (error) {
      console.error("Sync failed:", error);
      alert("Sync failed. Please try again.");
    }
  };

  // Handle individual row selection
  const handleRowSelect = (rowIndex: number, checked: boolean) => {
    if (disabled) return;
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(rowIndex);
      } else {
        newSet.delete(rowIndex);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (disabled) return;
    if (checked) {
      setSelectedRows(new Set(tickets.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  };

  return (
    <div
      className={`flex flex-col h-full ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="flex gap-2 p-3 border-b bg-card">
        <Button
          onClick={handleAddRow}
          size="sm"
          className="gap-2"
          disabled={disabled}
        >
          <Plus className="size-4" />
          Add Row
        </Button>
        <Button
          onClick={handleAddColumn}
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
          Delete Row{selectedRows.size > 1 ? "s" : ""}
        </Button>
        <Button
          onClick={handleSync}
          size="sm"
          variant={isSynced ? "outline" : "default"}
          className={`gap-2 ${!isSynced ? "animate-pulse" : ""}`}
          disabled={disabled || isSynced}
        >
          <RefreshCw className="size-4" />
          Sync
        </Button>
      </div>

      {!isSynced && showSyncWarning && (
        <div className="fixed top-16 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-lg z-50">
          <div className="flex justify-between items-start">
            <div className="flex">
              <div className="py-1">
                <AlertTriangle className="h-6 w-6 text-yellow-500 mr-4" />
              </div>
              <div>
                <p className="font-bold">Unsynced Changes</p>
                <p className="text-sm">
                  You have changes that have not been synced with the server.
                </p>
              </div>
            </div>
            <button onClick={() => setShowSyncWarning(false)} className="ml-4">
              <X className="h-5 w-5 text-yellow-700" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-primary w-full pr-5">
        <Table style={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHeader>
            <TableRow>
              <TableHead
                className="border-r bg-muted/30 relative"
                style={{
                  width: columnWidths.checkbox,
                  minWidth: columnWidths.checkbox,
                }}
              >
                <Checkbox
                  aria-label="Select all"
                  checked={
                    selectedRows.size === tickets.length && tickets.length > 0
                  }
                  onCheckedChange={(checked) =>
                    handleSelectAll(checked === true)
                  }
                />
                <div
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50"
                  onMouseDown={(e) => handleMouseDown("checkbox", e)}
                />
              </TableHead>
              {filteredSchema.map((col) => (
                <TableHead
                  key={col.name}
                  className="border-r bg-muted/30 relative"
                  style={{
                    width: columnWidths[col.name],
                    minWidth: columnWidths[col.name],
                  }}
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
            {tickets.map((row, rowIndex) => (
              <TableRow
                key={row._id || rowIndex}
                className="hover:bg-primary/5"
              >
                <TableCell
                  className="border-r bg-muted/30 cursor-pointer min-w-10"
                  style={{ width: columnWidths.checkbox }}
                  onClick={() =>
                    handleRowSelect(rowIndex, !selectedRows.has(rowIndex))
                  }
                >
                  <Checkbox
                    aria-label={`Select row ${rowIndex}`}
                    checked={selectedRows.has(rowIndex)}
                    onCheckedChange={(checked) =>
                      handleRowSelect(rowIndex, checked === true)
                    }
                  />
                </TableCell>
                {filteredSchema.map((col) => (

<TableCell
                    key={col.name}
                    className="border-r bg-background overflow-hidden"
                    style={{
                      width: columnWidths[col.name],
                      maxWidth: columnWidths[col.name],
                    }}
                  >
                    {editingCell?.row === rowIndex &&
                    editingCell?.col === col.name ? (
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
                        onDoubleClick={() =>
                          handleDoubleClick(
                            rowIndex,
                            col.name,
                            row.data[col.name]
                          )
                        }
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
