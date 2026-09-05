export interface CalendarDay {
  date: Date
  inCurrentMonth: boolean
}

// builds full weeks (Mon-Sun) of days covering the given month, padded with
// the tail end of the previous month and the start of the next one
export function buildMonthGrid(
  year: number,
  monthIndex: number
): CalendarDay[] {
  const firstOfMonth = new Date(year, monthIndex, 1)
  const lastOfMonth = new Date(year, monthIndex + 1, 0)

  // 0 = Sunday ... 6 = Saturday -> shift so 0 = Monday ... 6 = Sunday
  const leadingGap = (firstOfMonth.getDay() + 6) % 7
  const trailingGap = (7 - ((lastOfMonth.getDay() + 6) % 7) - 1) % 7

  const days: CalendarDay[] = []

  for (let i = leadingGap; i > 0; i--) {
    days.push({
      date: new Date(year, monthIndex, 1 - i),
      inCurrentMonth: false,
    })
  }

  for (let day = 1; day <= lastOfMonth.getDate(); day++) {
    days.push({ date: new Date(year, monthIndex, day), inCurrentMonth: true })
  }

  for (let i = 1; i <= trailingGap; i++) {
    days.push({
      date: new Date(year, monthIndex + 1, i),
      inCurrentMonth: false,
    })
  }

  return days
}

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
