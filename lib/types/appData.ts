// Domain types for Budget Forecast

export type EventKind = "income" | "expense"
export type Recurrence = "once" | "monthly" | "interval"

// type for a budget event
export interface BudgetEvent {
  id: string
  name: string
  amount: number // keep as bigger than 0, subtractions handled by kind
  kind: EventKind // dictates type of event, used to decide behavior of the amaunt from amaunt field
  recurrence: Recurrence // dictates whether the event should repeat or not
  date?: string // ISO yyyy-mm-dd, used for "once" events

  // used for monthly recurrence
  dayOfMonth?: number // 1-31

  // used for interval recurrence
  intervalDays?: number

  startDate?: string
  endDate?: string // optional cap for recurring series

  // exceptions (skipped occurrences) for recurring events, used when a singular event is removed from a reoccuring list of events
  exceptions?: string[] // ISO dates of the mentioned exceptions
  hypothetical?: boolean // used for the "what if" functionality
  notes?: string
}

// type for the settings
export interface AppSettings {
  initialBalance: number
  currency: string // currency type such as PLN, EUR, USD, GBP and so on
  initialBalanceDate: string // ISO date the initial balance is anchored to
  savings: number // a pool of money u dont want to spend but is technically avaliable
}

// this is kinda used as the memmory (?), local storage backed for now
export interface AppState {
  events: BudgetEvent[]
  settings: AppSettings
}

// most fields similar to the budget event, this is a single "instance" of an
// event on a specific date - what recurring events actually expand into
export interface Occurrence {
  eventId: string
  date: string // ISO yyyy-mm-dd
  name: string
  amount: number // signed: +income / -expense
  kind: EventKind
  hypothetical?: boolean
}
