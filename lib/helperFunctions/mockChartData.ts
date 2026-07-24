import { chartData, chartDataPoint } from "../types/chatData"

function genChartDataPoint(date: Date): chartDataPoint {
  let temp = Number((Math.random() * (1000 - 800) + 800).toFixed(2))

  return {
    date: date,
    balance: temp,
    savings: 600,
    whatIf: temp,
  }
}

export default function genChartData(length: number): chartData {
  const startDate = new Date()

  return Array.from({ length }, (_, i) =>
    genChartDataPoint(new Date(startDate.setDate(startDate.getDate() + i)))
  )
}
