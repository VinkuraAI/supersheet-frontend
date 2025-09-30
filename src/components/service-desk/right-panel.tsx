"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

export function RightPanel() {
  const [checks, setChecks] = useState([true, false, false, false, false])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Demo service project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-muted-foreground">Demo basics</div>
          <ol className="space-y-2 text-sm">
            {[
              "Pick up your first request",
              "Reply to an example customer",
              "Resolve your first request",
              "Pretend to be a customer",
              "Invite your team to explore",
            ].map((label, idx) => (
              <li key={label} className="flex items-start gap-2">
                <Checkbox
                  id={`step-${idx}`}
                  checked={checks[idx]}
                  onCheckedChange={(v) => setChecks((prev) => prev.map((c, i) => (i === idx ? !!v : c)))}
                  className="mt-0.5"
                />
                <label htmlFor={`step-${idx}`} className="cursor-pointer leading-6">
                  {label}
                </label>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reference design</CardTitle>
        </CardHeader>
        <CardContent>
          <figure className="rounded-md overflow-hidden border">
            <img
              src="/images/ui-to-build.jpeg"
              alt="Reference screenshot of the target Jira-like service desk UI"
              className="w-full h-auto"
            />
            <figcaption className="p-2 text-xs text-muted-foreground">This preview is for reference only.</figcaption>
          </figure>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        <a href="#" className="underline hover:text-foreground">
          Remove demo activities
        </a>
      </div>
    </div>
  )
}
