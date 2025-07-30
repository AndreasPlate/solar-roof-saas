import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface CSSGridLayoutProps {
  children: ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  mdCols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  lgCols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
  customColumns?: string
}

const colsMap = {
  1: "grid-cols-1",
  2: "grid-cols-2", 
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
  10: "grid-cols-10",
  11: "grid-cols-11",
  12: "grid-cols-12"
}

const mdColsMap = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3", 
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  7: "md:grid-cols-7",
  8: "md:grid-cols-8",
  9: "md:grid-cols-9",
  10: "md:grid-cols-10",
  11: "md:grid-cols-11",
  12: "md:grid-cols-12"
}

const lgColsMap = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4", 
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  7: "lg:grid-cols-7",
  8: "lg:grid-cols-8",
  9: "lg:grid-cols-9",
  10: "lg:grid-cols-10",
  11: "lg:grid-cols-11",
  12: "lg:grid-cols-12"
}

const gapMap = {
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12"
}

// Responsive CSS Grid layout based on kern-architecten-webapp patterns
export function CSSGridLayout({ 
  children, 
  className, 
  cols = 1,
  mdCols,
  lgCols,
  gap = 4,
  customColumns 
}: CSSGridLayoutProps) {
  const gridClasses = cn(
    "grid",
    colsMap[cols],
    mdCols && mdColsMap[mdCols],
    lgCols && lgColsMap[lgCols],
    gapMap[gap],
    className
  )

  if (customColumns) {
    return (
      <div 
        className={cn("grid", gapMap[gap], className)}
        style={{ gridTemplateColumns: customColumns }}
      >
        {children}
      </div>
    )
  }

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}