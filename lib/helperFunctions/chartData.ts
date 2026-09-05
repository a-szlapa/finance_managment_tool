import { AppSettings, BudgetEvent } from "@/lib/types/appData"
import { type chartData, type chartDataPoint } from "@/lib/types/chatData"
import { generateOccurrences } from "@/lib/helperFunctions/occurrences"
import { addDays, toISODate, todayISO } from "@/lib/helperFunctions/date"

// how far past "today" the projection reaches by default - long enough to be
// useful, short enough that the chart isn't mostly empty flat line
const DEFAULT_FORECAST_DAYS = 180

// absolute cap on the projection window so a single far-future one-off event
// can't blow the chart (and the funds slider tick list) up to an unusable size
const MAX_FORECAST_DAYS = 730

const isoToLocalDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

// the projection always covers at least DEFAULT_FORECAST_DAYS, but stretches
// to include any one-off/ended events that land further out than that
function resolveRangeEnd(events: BudgetEvent[], rangeStart: string): string {
  const start = isoToLocalDate(rangeStart)
  const defaultEnd = toISODate(addDays(start, DEFAULT_FORECAST_DAYS))
  const hardCap = toISODate(addDays(start, MAX_FORECAST_DAYS))

  let latest = defaultEnd

  for (const event of events) {
    const candidates = [event.date, event.endDate].filter(
      (value): value is string => Boolean(value)
    )
    for (const candidate of candidates) {
      if (candidate > latest && candidate <= hardCap) latest = candidate
    }
  }

  return latest
}

// turns the raw list of budget events into a day-by-day series the dashboard
// chart can render: running balance (real events only), a savings floor, and
// a "what if" line that also folds in hypothetical events
export function buildChartData(
  events: BudgetEvent[],
  settings: AppSettings
): chartData {
  const rangeStart = settings.initialBalanceDate || todayISO()
  const rangeEnd = resolveRangeEnd(events, rangeStart)

  const occurrences = generateOccurrences(events, rangeStart, rangeEnd)

  // net movement per day, split into "confirmed" vs "everything including
  // hypotheticals" so the two running totals can be accumulated in one pass
  const realByDate = new Map<string, number>()
  const allByDate = new Map<string, number>()

  for (const occurrence of occurrences) {
    allByDate.set(
      occurrence.date,
      (allByDate.get(occurrence.date) ?? 0) + occurrence.amount
    )
    if (!occurrence.hypothetical) {
      realByDate.set(
        occurrence.date,
        (realByDate.get(occurrence.date) ?? 0) + occurrence.amount
      )
    }
  }

  const start = isoToLocalDate(rangeStart)
  const end = isoToLocalDate(rangeEnd)
  // diff via UTC-anchored calendar days rather than raw ms, so a DST
  // transition inside the range can't quietly drop or duplicate a day
  const dayCount =
    Math.round(
      (Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
        Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
        86_400_000
    ) + 1

  let balance = settings.initialBalance
  let whatIf = settings.initialBalance

  const points: chartDataPoint[] = []

  for (let i = 0; i < dayCount; i++) {
    const date = addDays(start, i)
    const iso = toISODate(date)

    balance += realByDate.get(iso) ?? 0
    whatIf += allByDate.get(iso) ?? 0

    points.push({
      date,
      balance: Number(balance.toFixed(2)),
      savings: settings.savings,
      whatIf: Number(whatIf.toFixed(2)),
    })
  }

  return points
}

// builds the ascending tick list the vertical (funds) RangePicker drags
// across - bounded to the actual data with a little breathing room, and
// coarsened to a sensible step so the tick list doesn't get huge on wide
// balance ranges
export function buildFundsTicks(
  data: chartData,
  settings: AppSettings
): number[] {
  const values = data.flatMap((point) => [
    point.balance,
    point.whatIf,
    point.savings,
  ])
  values.push(settings.initialBalance, settings.savings, 0)

  const min = Math.min(...values)
  const max = Math.max(...values)

  const span = Math.max(max - min, 1)
  const padding = Math.max(span * 0.1, 10)

  const niceMin = Math.floor(min - padding)
  const niceMax = Math.ceil(max + padding)

  const targetTickCount = 400
  const step = Math.max(1, Math.ceil((niceMax - niceMin) / targetTickCount))

  const ticks: number[] = []
  for (let value = niceMin; value <= niceMax; value += step) {
    ticks.push(value)
  }
  if (ticks[ticks.length - 1] !== niceMax) ticks.push(niceMax)

  return ticks
}
