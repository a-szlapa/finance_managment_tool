import { BudgetEvent, Occurrence } from "@/lib/types/appData"
import { toISODate, daysInMonth } from "@/lib/helperFunctions/date"

const isoToDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

const signedAmount = (event: BudgetEvent) =>
  event.kind === "income" ? event.amount : -event.amount

const toOccurrence = (event: BudgetEvent, dateISO: string): Occurrence => ({
  eventId: event.id,
  date: dateISO,
  name: event.name,
  amount: signedAmount(event),
  kind: event.kind,
  hypothetical: event.hypothetical,
})

// expands a list of budget events into their concrete occurrences for the
// given [rangeStart, rangeEnd] ISO date window (inclusive on both ends)
export function generateOccurrences(
  events: BudgetEvent[],
  rangeStart: string,
  rangeEnd: string
): Occurrence[] {
  const occurrences: Occurrence[] = []

  for (const event of events) {
    const exceptions = new Set(event.exceptions ?? [])

    if (event.recurrence === "once") {
      if (!event.date) continue
      if (event.date < rangeStart || event.date > rangeEnd) continue
      if (exceptions.has(event.date)) continue
      occurrences.push(toOccurrence(event, event.date))
      continue
    }

    if (event.recurrence === "monthly") {
      if (!event.dayOfMonth) continue

      const seriesStart =
        event.startDate && event.startDate > rangeStart
          ? event.startDate
          : rangeStart
      const seriesEnd =
        event.endDate && event.endDate < rangeEnd ? event.endDate : rangeEnd
      if (seriesStart > seriesEnd) continue

      const start = isoToDate(seriesStart)
      const end = isoToDate(seriesEnd)
      // walk month-by-month rather than day-by-day so a 31st on a short
      // month doesn't get skipped or roll into the next month
      const cursor = new Date(start.getFullYear(), start.getMonth(), 1)

      while (cursor <= end) {
        const day = Math.min(
          event.dayOfMonth,
          daysInMonth(cursor.getFullYear(), cursor.getMonth())
        )
        const dateISO = toISODate(
          new Date(cursor.getFullYear(), cursor.getMonth(), day)
        )

        if (
          dateISO >= seriesStart &&
          dateISO <= seriesEnd &&
          !exceptions.has(dateISO)
        ) {
          occurrences.push(toOccurrence(event, dateISO))
        }

        cursor.setMonth(cursor.getMonth() + 1)
      }
      continue
    }

    if (event.recurrence === "interval") {
      if (!event.startDate || !event.intervalDays || event.intervalDays <= 0)
        continue

      const seriesEnd =
        event.endDate && event.endDate < rangeEnd ? event.endDate : rangeEnd
      if (event.startDate > seriesEnd) continue

      // fast-forward to the neighbourhood of rangeStart, staying aligned to
      // the original startDate rather than restarting the count from there
      const start = isoToDate(event.startDate)
      const rangeStartDate = isoToDate(rangeStart)
      const cursor = new Date(start)

      if (cursor < rangeStartDate) {
        const msPerDay = 24 * 60 * 60 * 1000
        const daysSinceStart = Math.floor(
          (rangeStartDate.getTime() - start.getTime()) / msPerDay
        )
        const steps = Math.floor(daysSinceStart / event.intervalDays)
        cursor.setDate(cursor.getDate() + steps * event.intervalDays)
      }

      const endDate = isoToDate(seriesEnd)

      while (cursor <= endDate) {
        const dateISO = toISODate(cursor)
        if (
          dateISO >= rangeStart &&
          dateISO >= event.startDate &&
          !exceptions.has(dateISO)
        ) {
          occurrences.push(toOccurrence(event, dateISO))
        }
        cursor.setDate(cursor.getDate() + event.intervalDays)
      }
      continue
    }
  }

  return occurrences.sort((a, b) => a.date.localeCompare(b.date))
}
