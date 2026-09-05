import React, { useMemo } from "react"
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart"
import { type chartData } from "@/lib/types/chatData"
import { formatCurrency, formatCurrencyPrecise } from "@/lib/helperFunctions/format"
import { todayISO, toISODate } from "@/lib/helperFunctions/date"

type BalanceChartProps = {
  chartData: chartData
  fundsStart: number
  fundsEnd: number
  currency?: string
  showWhatIf?: boolean
}

export default function BalanceChart({
  chartData,
  fundsStart,
  fundsEnd,
  currency = "USD",
  showWhatIf = false,
}: BalanceChartProps) {
  const chartConfig = {
    balance: {
      label: "Balance",
      color: "var(--chart-1)",
    },
    whatIf: {
      label: "Projected (with what-ifs)",
      color: "var(--chart-3)",
    },
    savings: {
      label: "Savings",
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig

  // "today" only draws a reference line when it actually falls inside the
  // visible window - otherwise recharts just silently skips it
  const today = useMemo(() => {
    const iso = todayISO()
    return chartData.find((point) => toISODate(point.date) === iso)?.date
  }, [chartData])

  const savingsValue = chartData[0]?.savings

  return (
    <div className="h-full w-full">
      <ChartContainer className="h-full w-full" config={chartConfig}>
        <ComposedChart
          accessibilityLayer
          data={chartData}
          margin={{
            top: 32,
            bottom: 16,
            right: 12,
          }}
        >
          <defs>
            <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-balance)"
                stopOpacity={0.35}
              />
              <stop
                offset="95%"
                stopColor="var(--color-balance)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} />

          <XAxis
            dataKey="date"
            tickLine={true}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => {
              return value.toLocaleDateString("en-GB")
            }}
          />
          <YAxis
            domain={[fundsStart, fundsEnd]}
            dataKey="balance"
            tickLine={true}
            axisLine={false}
            tickMargin={8}
            width={64}
            tickFormatter={(value) => formatCurrency(value, currency)}
          />

          {savingsValue ? (
            <ReferenceLine
              y={savingsValue}
              stroke="var(--color-savings)"
              strokeDasharray="4 4"
              strokeOpacity={0.7}
              ifOverflow="visible"
            />
          ) : null}

          {today ? (
            <ReferenceLine
              x={today}
              stroke="var(--muted-foreground)"
              strokeDasharray="3 3"
              strokeOpacity={0.6}
              label={{
                value: "Today",
                position: "insideTopLeft",
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
            />
          ) : null}

          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const raw = payload?.[0]?.payload?.date
                  return raw ? new Date(raw).toLocaleDateString("en-GB") : ""
                }}
                formatter={(value, name, item) => {
                  const color = item?.color ?? item?.payload?.fill
                  return (
                    <div className="flex w-full items-center justify-between gap-4">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-2 w-2 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-muted-foreground">
                          {chartConfig[name as keyof typeof chartConfig]
                            ?.label ?? name}
                        </span>
                      </div>
                      <span className="font-mono font-medium tabular-nums">
                        {formatCurrencyPrecise(Number(value), currency)}
                      </span>
                    </div>
                  )
                }}
              />
            }
          />

          <Area
            dataKey="balance"
            type="stepAfter"
            fill="url(#balanceFill)"
            stroke="var(--color-balance)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />

          {showWhatIf ? (
            <Line
              dataKey="whatIf"
              type="stepAfter"
              stroke="var(--color-whatIf)"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
              isAnimationActive={false}
            />
          ) : null}

          <ChartLegend content={<ChartLegendContent />} />
        </ComposedChart>
      </ChartContainer>
    </div>
  )
}
