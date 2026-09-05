import { EventKind, Recurrence } from "@/lib/types/appData"
import { todayISO } from "@/lib/helperFunctions/date"

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
