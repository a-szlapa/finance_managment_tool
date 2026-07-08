"use client"

import { Dispatch, SetStateAction } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Recurrence, todayISO } from "@/app/types"
import { EventFormState } from "@/components/modals/EventForm"

interface EventDateFieldsProps {
  form: EventFormState
  setForm: Dispatch<SetStateAction<EventFormState>>
  idPrefix?: string // avoids duplicate DOM ids when both modals are mounted at once
}

export default function EventDateFields({
  form,
  setForm,
  idPrefix = "",
}: EventDateFieldsProps) {
  const update = <K extends keyof EventFormState>(
    key: K,
    value: EventFormState[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  // - once -> monthly/interval: carry the once-off date into both start & end
  // - monthly/interval -> once: carry the start date back into date
  // - either direction, if there's nothing to carry, fall back to today
  const handleRecurrenceChange = (next: Recurrence) => {
    setForm((prev) => {
      const today = todayISO()

      if (prev.recurrence === "once" && next !== "once") {
        const carried = prev.date || today
        return { ...prev, recurrence: next, startDate: carried, endDate: carried }
      }

      if (prev.recurrence !== "once" && next === "once") {
        return { ...prev, recurrence: next, date: prev.startDate || today }
      }

      // monthly <-> interval: same underlying fields, nothing to move
      return { ...prev, recurrence: next }
    })
  }

  const id = (name: string) => `${idPrefix}${name}`

  return (
    <>
      <div className="grid w-full grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Recurrence</Label>
          <Select
            value={form.recurrence}
            onValueChange={(v) => handleRecurrenceChange(v as Recurrence)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="once">One-off</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="interval">Every N days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {form.recurrence === "monthly" && (
          <div className="space-y-1.5">
            <Label htmlFor={id("dayOfMonth")}>Day of month</Label>
            <Input
              id={id("dayOfMonth")}
              type="number"
              min="1"
              max="31"
              placeholder="e.g. 1"
              value={form.dayOfMonth}
              onChange={(e) => update("dayOfMonth", e.target.value)}
            />
          </div>
        )}

        {form.recurrence === "interval" && (
          <div className="space-y-1.5">
            <Label htmlFor={id("intervalDays")}>Repeat every (days)</Label>
            <Input
              id={id("intervalDays")}
              type="number"
              min="1"
              placeholder="e.g. 14"
              value={form.intervalDays}
              onChange={(e) => update("intervalDays", e.target.value)}
            />
          </div>
        )}
      </div>

      {form.recurrence === "once" && (
        <div className="space-y-1.5">
          <Label htmlFor={id("date")}>Date</Label>
          <Input
            id={id("date")}
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            className="[&::-webkit-calendar-picker-indicator]:opacity-60 dark:[&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>
      )}

      {form.recurrence === "monthly" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={id("startDate")}>Start date (optional)</Label>
            <Input
              id={id("startDate")}
              type="date"
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              className="[&::-webkit-calendar-picker-indicator]:opacity-60 dark:[&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={id("endDate")}>End date (optional)</Label>
            <Input
              id={id("endDate")}
              type="date"
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
              className="[&::-webkit-calendar-picker-indicator]:opacity-60 dark:[&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
        </div>
      )}

      {form.recurrence === "interval" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={id("startDateInterval")}>Start date</Label>
            <Input
              id={id("startDateInterval")}
              type="date"
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              className="[&::-webkit-calendar-picker-indicator]:opacity-60 dark:[&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={id("endDateInterval")}>End date (optional)</Label>
            <Input
              id={id("endDateInterval")}
              type="date"
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
              className="[&::-webkit-calendar-picker-indicator]:opacity-60 dark:[&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
        </div>
      )}
    </>
  )
}