import { AppState } from "@/app/types"
import { todayISO } from "@/lib/date"

export function exportAppState(state: Pick<AppState, "events" | "settings">) {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `budget-forecast-${todayISO()}.json`
  a.click()

  URL.revokeObjectURL(url)
}

// loose runtime validation - just enough to catch "this isn't our file" before
// it corrupts the app's state, not a full schema validator. This is a local
// personal tool, not a public upload endpoint, so field-by-field event
// validation would be overkill.
export function parseImportedAppState(raw: string): AppState | null {
  try {
    const parsed = JSON.parse(raw)

    if (!parsed || typeof parsed !== "object") return null
    if (!Array.isArray(parsed.events)) return null
    if (!parsed.settings || typeof parsed.settings !== "object") return null

    const s = parsed.settings
    if (
      typeof s.initialBalance !== "number" ||
      typeof s.currency !== "string" ||
      typeof s.initialBalanceDate !== "string" ||
      typeof s.savings !== "number"
    ) {
      return null
    }

    const eventsLookRight = parsed.events.every(
      (e: unknown) =>
        e !== null &&
        typeof e === "object" &&
        typeof (e as Record<string, unknown>).id === "string" &&
        typeof (e as Record<string, unknown>).name === "string"
    )
    if (!eventsLookRight) return null

    return parsed as AppState
  } catch {
    return null
  }
}