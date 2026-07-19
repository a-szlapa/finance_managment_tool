import React from "react"
import { CartesianGrid, XAxis, Line, LineChart, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart"
import genChartData from "@/lib/helperFunctions/mockChartData"

type BalanceChartProps = {}

export default function BalanceChart({}: BalanceChartProps) {
  const chartData = genChartData(20)
  const chartConfig = {
    desktop: {
      label: "Balance",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig
  return (
    <div className="">
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid  />
          <XAxis
            dataKey="date"
            tickLine={true}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => {
              return value.toLocaleDateString("en-GB")
            }}
          />
          <YAxis dataKey="balance" tickLine={true} axisLine={false} tickMargin={8}/>
          <ChartTooltip
            cursor={false}

            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const raw = payload?.[0]?.payload?.date
                  return raw ? new Date(raw).toLocaleDateString("en-GB") : ""
                }}
              />
            }
          />
          <Line
            dataKey="balance"
            type="stepAfter"
            stroke="var(--color-desktop)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
