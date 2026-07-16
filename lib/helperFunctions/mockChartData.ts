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
  let output:chartData = []
  Array.from({length: length}).forEach(i => {
    const date = new Date();
    date.setDate(date.getDate() + 3)
    output.push(genChartDataPoint(date))
  });
  return output
}
