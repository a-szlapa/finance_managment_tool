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

import { BudgetEvent, EventKind, Recurrence } from "@/app/types"

interface NewEventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (event: BudgetEvent) => void
}

const EMPTY_FORM = {
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

export default function NewEventModal({
  open,
  onOpenChange,
  onCreate,
}: NewEventModalProps) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)

  //that is some wizard shit tbh
  //basically
  {/*
    typeof EMPTY_FORM grabs the type of the variable
    wich in this case would be something like
    {
        name: string,
        amount: string,
        kind: EventKind,
        recurrence: Recurrence,
    ...}
    
    then keyof grabs the keys from thistype to get
    name|amount|kind and so on
    and then K extends that thingamajig creating an equivalent of
    type K = name|amount|kind and so on */}

  //in short dynamic type for update (duh)
  const update = <K extends keyof typeof EMPTY_FORM>(
    key: K,
    value: (typeof EMPTY_FORM)[K] //additionally smart, k isreused to check propper type of the inputed data
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  const reset = () => {
    setForm(EMPTY_FORM)
    setError(null)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
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
                <Label htmlFor="dayOfMonth">Day of month</Label>
                <Input
                  id="dayOfMonth"
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
                <Label htmlFor="intervalDays">Repeat every (days)</Label>
                <Input
                  id="intervalDays"
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
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
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
                <Label htmlFor="startDate">Start date (optional)</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">End date (optional)</Label>
                <Input
                  id="endDate"
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
                <Label htmlFor="startDateInterval">Start date</Label>
                <Input
                  id="startDateInterval"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDateInterval">End date (optional)</Label>
                <Input
                  id="endDateInterval"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => update("endDate", e.target.value)}
                />
              </div>
            </div>
          )}

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
              Mark as hypothetical ("what if")
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
