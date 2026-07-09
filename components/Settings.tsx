"use client"

import { useEffect, useRef, useState } from "react"
import { Download, Upload, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

import { AppSettings, AppState, BudgetEvent } from "@/app/types"
import { exportAppState, parseImportedAppState } from "@/lib/app-data"

interface SettingsProps {
  settings: AppSettings
  events: BudgetEvent[]
  onUpdateSettings: (settings: AppSettings) => void
  onApplyAllHypothetical: () => void
  onImport: (state: AppState) => void
}

interface SettingsFormState {
  initialBalance: string
  initialBalanceDate: string
  savings: string
  currency: string
}

const settingsToForm = (settings: AppSettings): SettingsFormState => ({
  initialBalance: Number.isFinite(settings.initialBalance)
    ? String(settings.initialBalance)
    : "",
  initialBalanceDate: settings.initialBalanceDate ?? "",
  savings: Number.isFinite(settings.savings) ? String(settings.savings) : "",
  currency: settings.currency ?? "",
})

export default function Settings({
  settings,
  events,
  onUpdateSettings,
  onApplyAllHypothetical,
  onImport,
}: SettingsProps) {
  const [form, setForm] = useState<SettingsFormState>(() =>
    settingsToForm(settings)
  )
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // resync if settings change from outside this form (e.g. an import)
  useEffect(() => {
    setForm(settingsToForm(settings))
  }, [settings])

  const update = <K extends keyof SettingsFormState>(
    key: K,
    value: SettingsFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    const initialBalance = parseFloat(form.initialBalance)
    const savings = parseFloat(form.savings)

    if (Number.isNaN(initialBalance)) {
      setError("Starting balance must be a number.")
      return
    }

    if (!form.initialBalanceDate) {
      setError("Pick a date for the starting balance.")
      return
    }

    if (Number.isNaN(savings) || savings < 0) {
      setError("Savings must be 0 or greater.")
      return
    }

    if (!form.currency.trim()) {
      setError("Currency is required.")
      return
    }

    onUpdateSettings({
      initialBalance,
      initialBalanceDate: form.initialBalanceDate,
      savings,
      currency: form.currency.trim().toUpperCase(),
    })

    setError(null)
    setSaved(true)
  }

  // --- apply all what-ifs ---
  const [applyOpen, setApplyOpen] = useState(false)
  const hypotheticalCount = events.filter((e) => e.hypothetical).length

  const confirmApply = () => {
    onApplyAllHypothetical()
    setApplyOpen(false)
  }

  // --- import ---
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<AppState | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = "" // reset so picking the same file twice still fires onChange
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const parsed = parseImportedAppState(String(reader.result))
      if (!parsed) {
        setImportError(
          "That file doesn't look like a budget forecast export."
        )
        return
      }
      setImportError(null)
      setPendingImport(parsed)
    }
    reader.readAsText(file)
  }

  const confirmImport = () => {
    if (pendingImport) onImport(pendingImport)
    setPendingImport(null)
  }

  return (
    <div className="max-w-xl space-y-8">
      {/* Starting balance */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-medium">Starting balance</h2>
          <p className="text-muted-foreground text-sm">
            The anchor point your forecast is calculated from.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="initialBalance">Starting balance</Label>
            <Input
              id="initialBalance"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.initialBalance}
              onChange={(e) => update("initialBalance", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="initialBalanceDate">As of</Label>
            <Input
              id="initialBalanceDate"
              type="date"
              value={form.initialBalanceDate}
              onChange={(e) => update("initialBalanceDate", e.target.value)}
              className="[&::-webkit-calendar-picker-indicator]:opacity-60 dark:[&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="savings">Savings</Label>
            <Input
              id="savings"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.savings}
              onChange={(e) => update("savings", e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              Set aside, but still technically available.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              placeholder="e.g. USD, EUR, PLN"
              maxLength={8}
              value={form.currency}
              onChange={(e) => update("currency", e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>Save changes</Button>
          {saved && (
            <span className="text-muted-foreground text-sm">Saved.</span>
          )}
        </div>
      </section>

      <div className="border-t" />

      {/* What-if events */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-medium">What-if events</h2>
          <p className="text-muted-foreground text-sm">
            {hypotheticalCount === 0
              ? "No what-if events right now."
              : `${hypotheticalCount} event${hypotheticalCount === 1 ? "" : "s"} currently marked as what-if.`}
          </p>
        </div>

        <Button
          variant="outline"
          className="gap-1.5"
          disabled={hypotheticalCount === 0}
          onClick={() => setApplyOpen(true)}
        >
          <Sparkles className="size-4" />
          Apply all what-if events
        </Button>

        <AlertDialog open={applyOpen} onOpenChange={setApplyOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Apply {hypotheticalCount} what-if event
                {hypotheticalCount === 1 ? "" : "s"}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                These events will become permanent and no longer marked as
                what-if. This can't be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmApply}>
                Apply
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      <div className="border-t" />

      {/* Data */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-medium">Data</h2>
          <p className="text-muted-foreground text-sm">
            Back up your events and settings, or restore from a file.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => exportAppState({ events, settings })}
          >
            <Download className="size-4" />
            Export data
          </Button>

          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-4" />
            Import data
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {importError && <p className="text-sm text-red-600">{importError}</p>}

        <AlertDialog
          open={pendingImport !== null}
          onOpenChange={(open) => !open && setPendingImport(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Replace current data?</AlertDialogTitle>
              <AlertDialogDescription>
                {pendingImport &&
                  `This file has ${pendingImport.events.length} event${pendingImport.events.length === 1 ? "" : "s"}. Importing will replace all events and settings currently stored in this browser. This can't be undone.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-600/90"
                onClick={confirmImport}
              >
                Replace data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  )
}