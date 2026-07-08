"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { BudgetEvent, EventKind, Recurrence } from "@/app/types"
import { EMPTY_FORM } from "./EventForm"

interface EditEventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: BudgetEvent | null
  onUpdate: (event: BudgetEvent) => void
}

// turns a BudgetEvent into the shape the form fields want
const eventToForm = (event: BudgetEvent) => ({
  name: event.name,
  amount: String(event.amount),
  kind: event.kind,
  recurrence: event.recurrence,
  date: event.date ?? "",
  dayOfMonth: event.dayOfMonth ? String(event.dayOfMonth) : "",
  intervalDays: event.intervalDays ? String(event.intervalDays) : "",
  startDate: event.startDate ?? "",
  endDate: event.endDate ?? "",
  notes: event.notes ?? "",
  hypothetical: event.hypothetical ?? false,
})

export default function EditEventModal({
  open,
  onOpenChange,
  event,
  onUpdate,
}: EditEventModalProps) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)

  // reload form contents every time the modal opens for a (possibly new) event -
  // otherwise editing event B right after event A briefly shows A's stale values
  useEffect(() => {
    if (open && event) {
      setForm(eventToForm(event))
      setError(null)
    }
  }, [open, event])
  
  //wizard shit once more
  const update = <K extends keyof typeof EMPTY_FORM>(
    key: K,
    value: (typeof EMPTY_FORM)[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleOpenChange = (next: boolean) => {
    if (!next) setError(null)
    onOpenChange(next)
  }

  const handleSubmit = () => {
    if (!event) return

    const amountNum = parseFloat(form.amount)

    if (!form.name.trim()) {
      setError("Name is required.")
      return
    }

    if (!amountNum || amountNum <= 0) {
      setError("Amount must be greater than 0.")
      return
    }

    if (form.recurrence === "once" && !form.date) {
      setError("Pick a date for a one-off event.")
      return
    }

    if (form.recurrence === "monthly") {
      const dom = parseInt(form.dayOfMonth, 10)

      if (!dom || dom < 1 || dom > 31) {
        setError("Day of month must be between 1 and 31.")
        return
      }
    }

    if (form.recurrence === "interval") {
      const days = parseInt(form.intervalDays, 10)

      if (!days || days <= 0) {
        setError("Interval days must be greater than 0.")
        return
      }
    }

    const updated: BudgetEvent = {
      id: event.id, // keep the original id
      name: form.name.trim(),
      amount: amountNum,
      kind: form.kind,
      recurrence: form.recurrence,
      hypothetical: form.hypothetical || undefined,
      notes: form.notes.trim() || undefined,
      exceptions: event.exceptions, // not editable here, carry over untouched
    }

    if (form.recurrence === "once") {
      updated.date = form.date
    } else {
      updated.startDate = form.startDate || undefined
      updated.endDate = form.endDate || undefined

      if (form.recurrence === "monthly") {
        updated.dayOfMonth = parseInt(form.dayOfMonth, 10)
      }

      if (form.recurrence === "interval") {
        updated.intervalDays = parseInt(form.intervalDays, 10)
      }
    }

    onUpdate(updated)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit event</DialogTitle>
          <DialogDescription>
            Update the details of this event.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              placeholder="e.g. Rent, Paycheck"
              className="w-full"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          {/* Amount + Type */}
          <div className="grid w-full grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Type</Label>

              <Select
                value={form.kind}
                onValueChange={(v) => update("kind", v as EventKind)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="income">income</SelectItem>
                  <SelectItem value="expense">expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-3">
            {/* Recurrence */}
            <div className="space-y-1.5">
              <Label>Recurrence</Label>

              <Select
                value={form.recurrence}
                onValueChange={(v) => update("recurrence", v as Recurrence)}
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
                <Label htmlFor="edit-dayOfMonth">Day of month</Label>
                <Input
                  id="edit-dayOfMonth"
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
                <Label htmlFor="edit-intervalDays">Repeat every (days)</Label>
                <Input
                  id="edit-intervalDays"
                  type="number"
                  min="1"
                  placeholder="e.g. 14"
                  value={form.intervalDays}
                  onChange={(e) => update("intervalDays", e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Conditional fields based on recurrence */}
          {form.recurrence === "once" && (
            <div className="space-y-1.5">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
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
                <Label htmlFor="edit-startDate">Start date (optional)</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-endDate">End date (optional)</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => update("endDate", e.target.value)}
                />
              </div>
            </div>
          )}

          {form.recurrence === "interval" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-startDateInterval">Start date</Label>
                <Input
                  id="edit-startDateInterval"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-endDateInterval">End date (optional)</Label>
                <Input
                  id="edit-endDateInterval"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => update("endDate", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-notes">Notes (optional)</Label>
            <Textarea
              id="edit-notes"
              placeholder="Any extra detail..."
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>

          {/* Hypothetical */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="edit-hypothetical"
              checked={form.hypothetical}
              onCheckedChange={(checked) =>
                update("hypothetical", checked === true)
              }
            />
            <Label htmlFor="edit-hypothetical" className="font-normal">
              Mark as hypothetical ("what if")
            </Label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}