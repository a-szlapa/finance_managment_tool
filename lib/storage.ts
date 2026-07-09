import { AppState } from "@/app/types"

const STORAGE_KEY = "budget-forecast:app-state"

export function loadAppState(): AppState | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AppState
  } catch (err) {
    // corrupted or unparsable data shouldn't crash the app - just start fresh
    console.error("Failed to load app state from localStorage", err)
    return null
  }
}

export function saveAppState(state: AppState) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    // e.g. storage full or disabled (private browsing) - fail quietly, don't break the UI
    console.error("Failed to save app state to localStorage", err)
  }
}