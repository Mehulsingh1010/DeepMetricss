import * as React from "react"

import { cn } from "@/lib/utils"

const Chart = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  return <div className={cn("rounded-md border", className)} ref={ref} {...props} />
})
Chart.displayName = "Chart"

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn("py-4", className)} ref={ref} {...props} />
  },
)
ChartContainer.displayName = "ChartContainer"

const ChartLegend = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn("mt-4 flex justify-center text-sm opacity-80", className)} ref={ref} {...props} />
  },
)
ChartLegend.displayName = "ChartLegend"

const ChartTooltip = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn("rounded-md border bg-popover p-4 text-sm shadow-sm", className)} ref={ref} {...props} />
  },
)
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return <p className={cn("font-medium", className)} ref={ref} {...props} />
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export { Chart, ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent }

