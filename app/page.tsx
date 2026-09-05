"use client"
import NavBar from "@/components/NavBar"
import Callendar from "@/components/pages/Callendar"
import Dashboard from "@/components/pages/Dashboard"
import Events from "@/components/pages/Events"
import Settings from "@/components/pages/Settings"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import NewEventModal from "@/components/modals/NewEvent"
import { AppState, BudgetEvent } from "@/lib/types/appData"
import {
  defaultAppState,
  loadAppState,
  saveAppState,
} from "@/lib/helperFunctions/appStateStorage"
import React, { useEffect, useState } from "react"

export default function page() {
  const [appState, setAppState] = useState<AppState>(defaultAppState)

  // true once we've attempted to load from localStorage - guards the save
  // effect below so it doesn't fire with the empty default and overwrite
  // whatever was already stored, before the load below has run
  const [hydrated, setHydrated] = useState(false)

  const [tab, setTab] = useState("Dashboard")
  const [modalOpen, setModalOpen] = useState(false)
  const [newEventDefaultDate, setNewEventDefaultDate] = useState<
    string | undefined
  >(undefined)

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

  const openNewEventModal = (date?: string) => {
    setNewEventDefaultDate(date)
    setModalOpen(true)
  }

  return (
    <>
      <div className="flex w-full flex-row justify-center py-10">
        <div className="w-1/8">{/* side panel L */}</div>
        <main className="w-3/4 max-w-3/4">
          <Tabs
            value={tab}
            onValueChange={setTab}
            className="w-full flex-1 gap-5"
          >
            <NavBar
              onNewEvent={() => openNewEventModal()}
              showNewEventButton={tab !== "Settings"}
            />
            <Separator className="mb-1" />
            <TabsContent value="Dashboard">
              <Dashboard events={appState.events} settings={appState.settings} />
            </TabsContent>
            <TabsContent value="Callendar">
              <Callendar
                events={appState.events}
                onUpdate={handleUpdateEvent}
                onDelete={handleDeleteEvent}
                onRequestNewEvent={openNewEventModal}
              />
            </TabsContent>
            <TabsContent value="Events">
              <Events
                events={appState.events}
                onUpdate={handleUpdateEvent}
                onDelete={handleDeleteEvent}
              />
            </TabsContent>
            <TabsContent value="Settings">
              <Settings
                settings={appState.settings}
                events={appState.events}
                onUpdateSettings={handleUpdateSettings}
                onApplyAllHypothetical={handleApplyAllHypothetical}
                onImport={handleImportState}
              />
            </TabsContent>
          </Tabs>
        </main>
        <div className="w-1/8">{/* side panel L */}</div>
      </div>

      <NewEventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreate={handleCreateEvent}
        defaultDate={newEventDefaultDate}
      />
    </>
  )
}
