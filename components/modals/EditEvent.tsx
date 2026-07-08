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

import { BudgetEvent, EventKind } from "@/app/types"
import { createEmptyForm } from "./EventForm"
import EventDateFields from "@/components/modals/EventDateFields"

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
  const [form, setForm] = useState(createEmptyForm)
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
  const update = <K extends keyof ReturnType<typeof createEmptyForm>>(
    key: K,
    value: ReturnType<typeof createEmptyForm>[K]
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

          <EventDateFields form={form} setForm={setForm} idPrefix="edit-" />

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