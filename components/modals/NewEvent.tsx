"use client"

import { useState } from "react"

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

import { BudgetEvent, EventKind } from "@/lib/types/appData"
import { createEmptyForm } from "./EventForm"
import EventDateFields from "@/components/modals/EventDateFields"

interface NewEventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (event: BudgetEvent) => void
  defaultDate?: string // ISO date to pre-fill when opened from a calendar day
}

export default function NewEventModal({
  open,
  onOpenChange,
  onCreate,
  defaultDate,
}: NewEventModalProps) {
  const [form, setForm] = useState(createEmptyForm)
  const [error, setError] = useState<string | null>(null)

  // dynamic type for update: grabs the key union off the form's shape so
  // `update` stays type-safe without spelling out every field by hand
  const update = <K extends keyof ReturnType<typeof createEmptyForm>>(
    key: K,
    value: ReturnType<typeof createEmptyForm>[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  const reset = () => {
    setForm({
      ...createEmptyForm(),
      date: defaultDate ?? createEmptyForm().date,
    })
    setError(null)
  }

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setForm((prev) => ({ ...prev, date: defaultDate ?? prev.date }))
    } else {
      reset()
    }
    onOpenChange(next)
  }

  const handleSubmit = () => {
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

    const event: BudgetEvent = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      amount: amountNum,
      kind: form.kind,
      recurrence: form.recurrence,
      hypothetical: form.hypothetical || undefined,
      notes: form.notes.trim() || undefined,
    }

    if (form.recurrence === "once") {
      event.date = form.date
    } else {
      event.startDate = form.startDate || undefined
      event.endDate = form.endDate || undefined

      if (form.recurrence === "monthly") {
        event.dayOfMonth = parseInt(form.dayOfMonth, 10)
      }

      if (form.recurrence === "interval") {
        event.intervalDays = parseInt(form.intervalDays, 10)
      }
    }

    onCreate(event)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New event</DialogTitle>
          <DialogDescription>
            Add an income or expense, one-off or recurring.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Rent, Paycheck"
              className="w-full"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          {/* Amount + Type */}
          <div className="grid w-full grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
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

          <EventDateFields form={form} setForm={setForm} />

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any extra detail..."
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>

          {/* Hypothetical */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="hypothetical"
              checked={form.hypothetical}
              onCheckedChange={(checked) =>
                update("hypothetical", checked === true)
              }
            />
            <Label htmlFor="hypothetical" className="font-normal">
              Mark as hypothetical (&quot;what if&quot;)
            </Label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
