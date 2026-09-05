const STORAGE_KEY = "budget-forecast:dashboard-range"

interface DashboardRangeState {
  startTimeIndex: number
  endTimeIndex: number
  startMoneyIndex: number
  endMoneyIndex: number
}

export function loadDashboardRange(): DashboardRangeState | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as DashboardRangeState
  } catch (err) {
    console.error("Failed to load dashboard range from localStorage", err)
    return null
  }
}

export function saveDashboardRange(state: DashboardRangeState) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.error("Failed to save dashboard range to localStorage", err)
  }
}