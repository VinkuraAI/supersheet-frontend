import { cn } from "@/lib/utils"

const sections = [
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
  return (
    <nav className="text-sm">
      {sections.map((section) => (
        <div key={section.title} className="mb-3">
          <div className="px-2 pb-1 text-xs font-medium text-muted-foreground">{section.title}</div>
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.label}>
                <a
                  href="#"
                  className={cn(
                    "block rounded-md px-2 py-1.5 hover:bg-muted",
                    item.active ? "bg-muted font-medium" : "",
                  )}
                  aria-current={item.active ? "page" : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
