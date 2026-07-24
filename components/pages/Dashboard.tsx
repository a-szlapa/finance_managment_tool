import React, { useEffect, useState } from "react"
import BalanceChart from "../BalanceChart"
import RangePicker from "../RangePicker"
import genChartData from "@/lib/helperFunctions/mockChartData"
import { type chartData } from "@/lib/types/chatData"
import { Button } from "../ui/button"
import { loadDashboardRange, saveDashboardRange } from "@/lib/helperFunctions/dashboard-storage"

type DashboardProps = {}

export default function Dashboard({}: DashboardProps) {
  const [chartData, setChartData] = useState<chartData>(genChartData(20))
  const dates = chartData.map((e) => {
    return e.date
  })
  const funds = Array.from({ length: 1001 }, (_, i) => i)

  const [startTimeIndex, setStartTimeIndex] = useState(0)
  const [endTimeIndex, setEndtTimeIndex] = useState(dates.length - 1)

  const [startMoneyIndex, setStartMoneyIndex] = useState(0)
  const [endMoneyIndex, setEndMoneyIndex] = useState(funds.length - 1)

  const [hydrated, setHydrated] = useState(false)

  // load once on mount
  useEffect(() => {
    const stored = loadDashboardRange()
    if (stored) {
      setStartTimeIndex(stored.startTimeIndex)
      setEndtTimeIndex(stored.endTimeIndex)
      setStartMoneyIndex(stored.startMoneyIndex)
      setEndMoneyIndex(stored.endMoneyIndex)
    }
    setHydrated(true)
  }, [])

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

  const visibleChartData = chartData.filter((point) => {
    const time = point.date.getTime()
    return (
      time >= dates[startTimeIndex].getTime() &&
      time <= dates[endTimeIndex].getTime()
    )
  })
  return (
    <>
      <div className="grid grid-cols-[auto_1fr] grid-rows-[550_auto]">
        <div className="py-5">
          <RangePicker
            tickList={funds.toReversed()}
            startSetter={setStartMoneyIndex}
            endSetter={setEndMoneyIndex}
            startVal={startMoneyIndex}
            endVal={endMoneyIndex}
            orientation="vertical"
          />
        </div>
        <BalanceChart
          chartData={visibleChartData}
          fundsStart={funds.toReversed()[endMoneyIndex]}
          fundsEnd={funds.toReversed()[startMoneyIndex]}
        />
        <div className="h-full w-full"></div>
        <div className="pl-5">
          <RangePicker
            tickList={dates}
            startSetter={setStartTimeIndex}
            endSetter={setEndtTimeIndex}
            startVal={startTimeIndex}
            endVal={endTimeIndex}
            formater={(date) => {
              return date.toLocaleDateString("en-GB")
            }}
          />
        </div>

        {/* <BalanceChart />

      <div className="min-h-20"></div>
      <RangePicker
        tickList={dates}
        startSetter={setStartTimeIndex}
        endSetter={setEndtTimeIndex}
        startVal={startTimeIndex}
        endVal={endTimeIndex}
      /> */}
      </div>
    </>
  )
}
