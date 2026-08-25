/**
 * Editorial reading container for Course Guides.
 *
 * Deliberately not `.ag-shell`. The application shell is a 6xl grid built for
 * scanning decision data in columns; a Guide is continuous prose and needs a
 * single narrow measure. Keeping them as separate containers is what stops the
 * Guide from drifting back into looking like a Course Page.
 */

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function GuideMeasure({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn("ag-measure", className)}>{children}</div>
}
