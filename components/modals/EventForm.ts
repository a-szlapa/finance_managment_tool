import { BudgetEvent, EventKind, Recurrence } from "@/app/types"
import { todayISO } from "@/lib/date"


export interface EventFormState {
  name: string
  amount: string
  kind: EventKind
  recurrence: Recurrence
  date: string
  dayOfMonth: string
  intervalDays: string
  startDate: string
  endDate: string
  notes: string
  hypothetical: boolean
}

export const createEmptyForm = (): EventFormState => ({
  name: "",
  amount: "",
  kind: "expense",
  recurrence: "once",
  date: todayISO(),
  dayOfMonth: "",
  intervalDays: "",
  startDate: "",
  endDate: "",
  notes: "",
  hypothetical: false,
})