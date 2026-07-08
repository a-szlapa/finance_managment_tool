import { EventKind, Recurrence } from "@/app/types";

export const EMPTY_FORM = {
  name: "",
  amount: "",
  kind: "expense" as EventKind,
  recurrence: "once" as Recurrence,
  date: "",
  dayOfMonth: "",
  intervalDays: "",
  startDate: "",
  endDate: "",
  notes: "",
  hypothetical: false,
}