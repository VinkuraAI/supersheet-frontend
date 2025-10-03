"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

import { useWorkspace } from "@/lib/workspace-context";

function FilterButton({
  label,
  items,
  disabled,
}: {
  label: string
  items: string[]
  disabled: boolean
}) {
  const [selected, setSelected] = useState<string[]>([])
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="justify-between gap-2 bg-transparent flex-shrink-0 whitespace-nowrap"
          disabled={disabled}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="size-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((name) => {
          const checked = selected.includes(name)
          return (
            <DropdownMenuCheckboxItem
              key={name}
              checked={checked}
              onCheckedChange={(v) => {
                setSelected((prev) => (v ? [...prev, name] : prev.filter((i) => i !== name)))
              }}
            >
              {name}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function FiltersBar() {
  const { selectedWorkspace } = useWorkspace();
  const disabled = !selectedWorkspace;

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2 overflow-x-auto flex-nowrap pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent">
        <Input placeholder="Search work" className="h-9 w-[220px] flex-shrink-0" aria-label="Search work" disabled={disabled} />
        <FilterButton label="Request type" items={["Incident", "Task", "Question"]} disabled={disabled} />
        <FilterButton label="Status" items={["Waiting for support", "In progress", "Done"]} disabled={disabled} />
        <FilterButton label="Assignee" items={["Unassigned", "Me", "Team"]} disabled={disabled} />
        <FilterButton label="More filters" items={["Created date", "Reporter", "SLA"]} disabled={disabled} />
      </div>
      <div className="text-xs text-muted-foreground px-1 flex-shrink-0">{disabled ? "-" : "5 work items"}</div>
    </div>
  )
}
