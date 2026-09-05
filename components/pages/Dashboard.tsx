"use client"

import React, { useEffect, useMemo, useState } from "react"
import BalanceChart from "../BalanceChart"
import RangePicker from "../RangePicker"
import { buildChartData, buildFundsTicks } from "@/lib/helperFunctions/chartData"
import { formatCurrency } from "@/lib/helperFunctions/format"
import { clamp } from "@/lib/utils"
import { AppSettings, BudgetEvent } from "@/lib/types/appData"
import {
  loadDashboardRange,
  saveDashboardRange,
} from "@/lib/helperFunctions/dashboard-storage"

type DashboardProps = {
  events: BudgetEvent[]
  settings: AppSettings
}

export default function Dashboard({ events, settings }: DashboardProps) {
  // events -> a day-by-day projection, recomputed whenever an event or a
  // setting (initial balance, savings, etc) changes
  const chartData = useMemo(
    () => buildChartData(events, settings),
    [events, settings]
  )

  const dates = useMemo(() => chartData.map((point) => point.date), [chartData])
  const funds = useMemo(
    () => buildFundsTicks(chartData, settings),
    [chartData, settings]
  )
  const fundsDescending = useMemo(() => funds.toReversed(), [funds])

  const showWhatIf = useMemo(
    () => events.some((event) => event.hypothetical),
    [events]
  )

  const [startTimeIndex, setStartTimeIndex] = useState(0)
  const [endTimeIndex, setEndTimeIndex] = useState(
    () => Math.max(dates.length - 1, 0)
  )

  const [startMoneyIndex, setStartMoneyIndex] = useState(0)
  const [endMoneyIndex, setEndMoneyIndex] = useState(
    () => Math.max(funds.length - 1, 0)
  )

  const [hydrated, setHydrated] = useState(false)

  // load once on mount
  useEffect(() => {
    const stored = loadDashboardRange()
    if (stored) {
      setStartTimeIndex(clamp(stored.startTimeIndex, 0, dates.length - 1))
      setEndTimeIndex(clamp(stored.endTimeIndex, 0, dates.length - 1))
      setStartMoneyIndex(clamp(stored.startMoneyIndex, 0, funds.length - 1))
      setEndMoneyIndex(clamp(stored.endMoneyIndex, 0, funds.length - 1))
    }
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // the projection window/funds range can grow or shrink as events change -
  // keep the slider indices in bounds rather than pointing past the new data
  useEffect(() => {
    const maxIndex = Math.max(dates.length - 1, 0)
    setStartTimeIndex((i) => clamp(i, 0, maxIndex))
    setEndTimeIndex((i) => clamp(i, 0, maxIndex))
  }, [dates.length])

  useEffect(() => {
    const maxIndex = Math.max(funds.length - 1, 0)
    setStartMoneyIndex((i) => clamp(i, 0, maxIndex))
    setEndMoneyIndex((i) => clamp(i, 0, maxIndex))
  }, [funds.length])

  // save on every change, once hydration has settled
  useEffect(() => {
    if (!hydrated) return
    saveDashboardRange({
      startTimeIndex,
      endTimeIndex,
      startMoneyIndex,
      endMoneyIndex,
    })
  }, [startTimeIndex, endTimeIndex, startMoneyIndex, endMoneyIndex, hydrated])

  const visibleChartData = useMemo(() => {
    if (dates.length === 0) return []
    return chartData.filter((point) => {
      const time = point.date.getTime()
      return (
        time >= dates[startTimeIndex].getTime() &&
        time <= dates[endTimeIndex].getTime()
      )
    })
  }, [chartData, dates, startTimeIndex, endTimeIndex])

  return (
    <>
      <div className="grid grid-cols-[auto_1fr] grid-rows-[550_auto]">
        <div className="py-5">
          <RangePicker
            tickList={fundsDescending}
            startSetter={setStartMoneyIndex}
            endSetter={setEndMoneyIndex}
            startVal={startMoneyIndex}
            endVal={endMoneyIndex}
            orientation="vertical"
            formater={(value) => formatCurrency(value, settings.currency)}
          />
        </div>
        <BalanceChart
          chartData={visibleChartData}
          fundsStart={fundsDescending[endMoneyIndex]}
          fundsEnd={fundsDescending[startMoneyIndex]}
          currency={settings.currency}
          showWhatIf={showWhatIf}
        />
        <div className="h-full w-full"></div>
        <div className="pl-5">
          <RangePicker
            tickList={dates}
            startSetter={setStartTimeIndex}
            endSetter={setEndTimeIndex}
            startVal={startTimeIndex}
            endVal={endTimeIndex}
            formater={(date) => {
              return date.toLocaleDateString("en-GB")
            }}
          />
        </div>
      </div>
    </>
  )
}
