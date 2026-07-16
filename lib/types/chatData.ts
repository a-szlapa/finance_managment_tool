export type chartDataPoint = {
    date: Date,
    balance: number,
    savings: number,
    whatIf: number,
}

export type chartData = chartDataPoint[]