"use client"

import { useEffect, useState } from "react"

import Callendar from "@/components/Callendar"
import Dashboard from "@/components/Dashboard"
import Events from "@/components/Events"
import Settings from "@/components/Settings"

import { Plus } from 'lucide-react';

import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { AppState, BudgetEvent } from "./types"
import NewEventModal from "@/components/modals/NewEvent"
import { loadAppState, saveAppState } from "@/lib/storage"

export default function Page() {
  const [appState, setAppState] = useState<AppState>({
    events: [],
    settings: {} as AppState["settings"], // replace with actuall default settings once i implement those
  })

  // true once we've attempted to load from localStorage - guards the save
  // effect below so it doesn't fire with the empty default and overwrite
  // whatever was already stored, before the load below has run
  const [hydrated, setHydrated] = useState(false)

  const [tab, setTab] = useState("dashboard")
  const [modalOpen, setModalOpen] = useState(false)

  const showButton = ["dashboard", "callendar", "events"].includes(tab) //cool way to write a "true if val in arr" type func

  // load once on mount - can't do this in useState's initializer because
  // this component is server-rendered first, and window/localStorage don't
  // exist there
  useEffect(() => {
    const stored = loadAppState()
    if (stored) setAppState(stored)
    setHydrated(true)
  }, [])

  // save on every change, once hydration has settled
  useEffect(() => {
    if (!hydrated) return
    saveAppState(appState)
  }, [appState, hydrated])

  const handleCreateEvent = (event: BudgetEvent) => {
    setAppState((prev) => ({
      ...prev,
      events: [...prev.events, event],
    }))
  }

  const handleUpdateEvent = (event: BudgetEvent) => {
    setAppState((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === event.id ? event : e)),
    }))
  }

  const handleDeleteEvent = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }))
  }

  const handleUpdateSettings = (settings: AppState["settings"]) => {
    setAppState((prev) => ({ ...prev, settings }))
  }

  const handleApplyAllHypothetical = () => {
    setAppState((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.hypothetical ? { ...e, hypothetical: undefined } : e
      ),
    }))
  }

  const handleImportState = (state: AppState) => {
    setAppState(state)
  }

  return (
    <div className="mx-auto flex min-h-svh w-3/4">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="flex items-center justify-between gap-4 border-b px-6 py-3">
          <TabsList className="h-11 gap-1 rounded-lg bg-muted/60 p-1">
            <TabsTrigger value="dashboard" className="rounded-md px-5 py-2 text-sm font-medium transition-colors">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="callendar" className="rounded-md px-5 py-2 text-sm font-medium transition-colors">
              Callendar
            </TabsTrigger>
            <TabsTrigger value="events" className="rounded-md px-5 py-2 text-sm font-medium transition-colors">
              Events
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-md px-5 py-2 text-sm font-medium transition-colors">
              Settings
            </TabsTrigger>
          </TabsList>

          {showButton && (
            <Button className="bg-primary gap-1.5 shadow-sm" onClick={() => setModalOpen(true)}>
              <Plus className="size-4" />
              New event
            </Button>
          )}
        </div>

        <div className="p-6">
          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="callendar">
            <Callendar />
          </TabsContent>

          <TabsContent value="events">
            <Events
              events={appState.events}
              onUpdate={handleUpdateEvent}
              onDelete={handleDeleteEvent}
            />
          </TabsContent>

          <TabsContent value="settings">
            <TabsContent value="settings">
            <Settings
              settings={appState.settings}
              events={appState.events}
              onUpdateSettings={handleUpdateSettings}
              onApplyAllHypothetical={handleApplyAllHypothetical}
              onImport={handleImportState}
            />
          </TabsContent>
          </TabsContent>
        </div>
      </Tabs>

      <NewEventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreate={handleCreateEvent}
      />
    </div>
  )
}