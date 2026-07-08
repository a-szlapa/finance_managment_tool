"use client"

import { useMemo, useState } from "react"
import {
  Pencil,
  Trash2,
  Search,
  ArrowUpDown,
  Repeat,
  CalendarClock,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { BudgetEvent } from "@/app/types"

interface EventsProps {
  events: BudgetEvent[]
  onUpdate: (event: BudgetEvent) => void
  onDelete: (id: string) => void
}

type KindFilter = "all" | "income" | "expense"
type RecurrenceFilter = "all" | "once" | "monthly" | "interval"
type SortKey =
  | "date-asc"
  | "date-desc"
  | "amount-asc"
  | "amount-desc"
  | "name-asc"
  | "name-desc"

// the date that represents "when" for an event - one-offs use `date`,
// recurring ones use `startDate` (missing dates always sink to the bottom)
const eventSortDate = (event: BudgetEvent) =>
  event.recurrence === "once" ? event.date : event.startDate

const recurrenceLabel: Record<BudgetEvent["recurrence"], string> = {
  once: "One-off",
  monthly: "Monthly",
  interval: "Recurring",
}

const formatAmount = (event: BudgetEvent) => {
  const formatted = event.amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return event.kind === "income" ? `+${formatted}` : `-${formatted}`
}

const formatDate = (value?: string) => {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const formatRecurrenceDetail = (event: BudgetEvent) => {
  if (event.recurrence === "monthly") {
    return `Day ${event.dayOfMonth} of every month`
  }
  if (event.recurrence === "interval") {
    return `Every ${event.intervalDays} day${event.intervalDays === 1 ? "" : "s"}`
  }
  return formatDate(event.date) ?? "No date set"
}

export default function Events({ events, onUpdate, onDelete }: EventsProps) {
  const [query, setQuery] = useState("")
  const [kindFilter, setKindFilter] = useState<KindFilter>("all")
  const [recurrenceFilter, setRecurrenceFilter] =
    useState<RecurrenceFilter>("all")
  const [sortKey, setSortKey] = useState<SortKey>("date-asc")

  const [editingEvent, setEditingEvent] = useState<BudgetEvent | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deletingEvent, setDeletingEvent] = useState<BudgetEvent | null>(null)

  const visibleEvents = useMemo(() => {
    const q = query.trim().toLowerCase()

    const filtered = events.filter((event) => {
      if (kindFilter !== "all" && event.kind !== kindFilter) return false
      if (recurrenceFilter !== "all" && event.recurrence !== recurrenceFilter)
        return false

      if (!q) return true

      return (
        event.name.toLowerCase().includes(q) ||
        (event.notes?.toLowerCase().includes(q) ?? false)
      )
    })

    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "amount-asc":
          return a.amount - b.amount
        case "amount-desc":
          return b.amount - a.amount
        case "date-asc":
        case "date-desc": {
          const aDate = eventSortDate(a)
          const bDate = eventSortDate(b)

          if (!aDate && !bDate) return 0
          if (!aDate) return 1
          if (!bDate) return -1

          return sortKey === "date-asc"
            ? aDate.localeCompare(bDate)
            : bDate.localeCompare(aDate)
        }
        default:
          return 0
      }
    })
  }, [events, query, kindFilter, recurrenceFilter, sortKey])

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search events..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Select
          value={kindFilter}
          onValueChange={(v) => setKindFilter(v as KindFilter)}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={recurrenceFilter}
          onValueChange={(v) => setRecurrenceFilter(v as RecurrenceFilter)}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Recurrence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All recurrences</SelectItem>
            <SelectItem value="once">One-off</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="interval">Every N days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-full sm:w-[170px]">
            <ArrowUpDown className="size-3.5" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-asc">Date (soonest)</SelectItem>
            <SelectItem value="date-desc">Date (latest)</SelectItem>
            <SelectItem value="amount-desc">Amount (high-low)</SelectItem>
            <SelectItem value="amount-asc">Amount (low-high)</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {visibleEvents.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          {events.length === 0
            ? "No events yet. Add one to get started."
            : "No events match your filters."}
        </div>
      ) : (
        <ul className="divide-y rounded-lg border">
          {visibleEvents.map((event) => (
            <li
              key={event.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-medium">{event.name}</span>

                  <Badge variant="outline" className="gap-1 text-xs font-normal">
                    {event.recurrence === "once" ? (
                      <CalendarClock className="size-3" />
                    ) : (
                      <Repeat className="size-3" />
                    )}
                    {recurrenceLabel[event.recurrence]}
                  </Badge>

                  {event.hypothetical && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-amber-300 text-xs font-normal text-amber-600"
                    >
                      <Sparkles className="size-3" />
                      What if
                    </Badge>
                  )}
                </div>

                <p className="text-muted-foreground mt-0.5 truncate text-sm">
                  {formatRecurrenceDetail(event)}
                  {event.notes ? ` · ${event.notes}` : ""}
                </p>
              </div>

              <span
                className={`shrink-0 font-mono text-sm font-medium ${
                  event.kind === "income" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {formatAmount(event)}
              </span>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => openEdit(event)}
                >
                  <Pencil className="size-4" />
                  <span className="sr-only">Edit {event.name}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-red-600 size-8"
                  onClick={() => setDeletingEvent(event)}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete {event.name}</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <EditEventModal
        open={editOpen}
        onOpenChange={setEditOpen}
        event={editingEvent}
        onUpdate={onUpdate}
      />

      {/* the "wont accidentally delete" part */}
      <AlertDialog
        open={deletingEvent !== null}
        onOpenChange={(open) => !open && setDeletingEvent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deletingEvent?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. The event and its schedule will be
              permanently removed.
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