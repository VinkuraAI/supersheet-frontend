"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

export function RightPanel() {
  const [checks, setChecks] = useState([true, false, false, false, false])

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-xs">Demo service project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          <div className="text-[0.65rem] text-muted-foreground">Demo basics</div>
          <ol className="space-y-1.5 text-xs">
            {[
              "Pick up your first request",
              "Reply to an example customer",
              "Resolve your first request",
              "Pretend to be a customer",
              "Invite your team to explore",
            ].map((label, idx) => (
              <li key={label} className="flex items-start gap-1.5">
                <Checkbox
                  id={`step-${idx}`}
                  checked={checks[idx]}
                  onCheckedChange={(v) => setChecks((prev) => prev.map((c, i) => (i === idx ? !!v : c)))}
                  className="mt-0 h-3 w-3"
                />
                <label htmlFor={`step-${idx}`} className="cursor-pointer leading-5">
                  {label}
                </label>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-xs">Reference design</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <figure className="rounded-md overflow-hidden border">
            <img
              src="/images/ui-to-build.jpeg"
              alt="Reference screenshot of the target Jira-like service desk UI"
              className="w-full h-auto"
            />
            <figcaption className="p-1.5 text-[0.65rem] text-muted-foreground">This preview is for reference only.</figcaption>
          </figure>
        </CardContent>
      </Card>

      <div className="text-[0.65rem] text-muted-foreground">
        <a href="#" className="underline hover:text-foreground">
          Remove demo activities
        </a>
      </div>
    </div>
  )
}
