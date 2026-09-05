"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import EditEventModal from "@/components/modals/EditEvent"
import { BudgetEvent, Occurrence } from "@/lib/types/appData"
import { generateOccurrences } from "@/lib/helperFunctions/occurrences"
import {
  buildMonthGrid,
  WEEKDAY_LABELS,
} from "@/lib/helperFunctions/calendarGrid"
import { toISODate, todayISO } from "@/lib/helperFunctions/date"
import { cn } from "@/lib/utils"

interface CallendarProps {
  events: BudgetEvent[]
  onUpdate: (event: BudgetEvent) => void
  onDelete: (id: string) => void
  onRequestNewEvent: (date?: string) => void
}

const MONTH_LABEL_FORMAT = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
})

const formatAmount = (amount: number) =>
  amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: "always",
  })

const MAX_VISIBLE_PER_DAY = 3

export default function Callendar({
  events,
  onUpdate,
  onDelete,
  onRequestNewEvent,
}: CallendarProps) {
  const today = todayISO()
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editingEvent, setEditingEvent] = useState<BudgetEvent | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deletingEvent, setDeletingEvent] = useState<BudgetEvent | null>(null)

  const grid = useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor]
  )

  const occurrencesByDate = useMemo(() => {
    const rangeStart = toISODate(grid[0].date)
    const rangeEnd = toISODate(grid[grid.length - 1].date)
    const occurrences = generateOccurrences(events, rangeStart, rangeEnd)

    const map = new Map<string, Occurrence[]>()
    for (const occurrence of occurrences) {
      const list = map.get(occurrence.date) ?? []
      list.push(occurrence)
      map.set(occurrence.date, list)
    }
    return map
  }, [events, grid])

  const eventsById = useMemo(() => {
    const map = new Map<string, BudgetEvent>()
    for (const event of events) map.set(event.id, event)
    return map
  }, [events])

  const goToPreviousMonth = () =>
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  const goToNextMonth = () =>
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  const goToToday = () => {
    const now = new Date()
    setCursor(new Date(now.getFullYear(), now.getMonth(), 1))
  }

  const selectedOccurrences = selectedDate
    ? (occurrencesByDate.get(selectedDate) ?? [])
    : []
  const selectedDayNet = selectedOccurrences.reduce(
    (sum, occ) => sum + occ.amount,
    0
  )

  const openEdit = (event: BudgetEvent) => {
    setEditingEvent(event)
    setEditOpen(true)
  }

  const confirmDelete = () => {
    if (deletingEvent) onDelete(deletingEvent.id)
    setDeletingEvent(null)
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">
          {MONTH_LABEL_FORMAT.format(cursor)}
        </h2>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-t-lg border-x border-t bg-border text-center text-xs font-medium text-muted-foreground">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="bg-card py-2">
            {label}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-b-lg border bg-border">
        {grid.map(({ date, inCurrentMonth }) => {
          const dateISO = toISODate(date)
          const dayOccurrences = occurrencesByDate.get(dateISO) ?? []
          const isToday = dateISO === today
          const overflowCount = dayOccurrences.length - MAX_VISIBLE_PER_DAY

          return (
            <button
              key={dateISO}
              onClick={() => setSelectedDate(dateISO)}
              className={cn(
                "flex min-h-24 flex-col gap-1 bg-card p-1.5 text-left align-top transition-colors hover:bg-muted/60",
                !inCurrentMonth && "bg-card/50 text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                  isToday && "bg-primary text-primary-foreground"
                )}
              >
                {date.getDate()}
              </span>

              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                {dayOccurrences.slice(0, MAX_VISIBLE_PER_DAY).map((occ, i) => (
                  <span
                    key={`${occ.eventId}-${i}`}
                    className={cn(
                      "truncate rounded px-1 py-0.5 text-left text-[0.65rem] leading-tight font-medium",
                      occ.kind === "income"
                        ? "bg-emerald-600/10 text-emerald-600"
                        : "bg-red-600/10 text-red-600"
                    )}
                  >
                    {occ.name}
                  </span>
                ))}
                {overflowCount > 0 && (
                  <span className="text-[0.65rem] text-muted-foreground">
                    +{overflowCount} more
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Day detail */}
      <Dialog
        open={selectedDate !== null}
        onOpenChange={(open) => !open && setSelectedDate(null)}
      >
        <DialogContent className="w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate &&
                new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                  undefined,
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
            </DialogTitle>
            <DialogDescription>
              {selectedOccurrences.length === 0
                ? "Nothing scheduled for this day."
                : `Net ${formatAmount(selectedDayNet)} across ${selectedOccurrences.length} event${selectedOccurrences.length === 1 ? "" : "s"}.`}
            </DialogDescription>
          </DialogHeader>

          {selectedOccurrences.length > 0 && (
            <ul className="max-h-72 divide-y overflow-y-auto rounded-lg border">
              {selectedOccurrences.map((occ, i) => {
                const sourceEvent = eventsById.get(occ.eventId)
                return (
                  <li
                    key={`${occ.eventId}-${i}`}
                    className="flex items-center justify-between gap-3 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate text-sm font-medium">
                          {occ.name}
                        </span>
                        {occ.hypothetical && (
                          <Badge
                            variant="outline"
                            className="border-amber-300 text-[0.65rem] font-normal text-amber-600"
                          >
                            What if
                          </Badge>
                        )}
                      </div>
                    </div>

                    <span
                      className={cn(
                        "shrink-0 font-mono text-sm font-medium",
                        occ.kind === "income"
                          ? "text-emerald-600"
                          : "text-red-600"
                      )}
                    >
                      {formatAmount(occ.amount)}
                    </span>

                    {sourceEvent && (
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => openEdit(sourceEvent)}
                        >
                          <Pencil className="size-3.5" />
                          <span className="sr-only">Edit {occ.name}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-red-600"
                          onClick={() => setDeletingEvent(sourceEvent)}
                        >
                          <Trash2 className="size-3.5" />
                          <span className="sr-only">Delete {occ.name}</span>
                        </Button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => {
                if (selectedDate) onRequestNewEvent(selectedDate)
                setSelectedDate(null)
              }}
            >
              <Plus className="size-4" />
              Add event on this day
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditEventModal
        open={editOpen}
        onOpenChange={setEditOpen}
        event={editingEvent}
        onUpdate={onUpdate}
      />

      <AlertDialog
        open={deletingEvent !== null}
        onOpenChange={(open) => !open && setDeletingEvent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &quot;{deletingEvent?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone. If this is a recurring event, every
              occurrence will be removed, not just this one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-600/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
