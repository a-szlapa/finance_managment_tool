"use client"

import { useState } from "react"

import Callendar from "@/components/Callendar"
import Dashboard from "@/components/Dashboard"
import Events from "@/components/Events"
import Settings from "@/components/Settings"

import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppState, BudgetEvent } from "./types"
import NewEventModal from "@/components/modals/NewEvent"

export default function Page() {
  const [appState, setAppState] = useState<AppState>({
    events: [],
    settings: {} as AppState["settings"], // replace with actuall default settings once i implement those
  })

  const [tab, setTab] = useState("dashboard")
  const [modalOpen, setModalOpen] = useState(false)

  const showButton = ["dashboard", "callendar", "events"].includes(tab) //cool way to write a "true if val in arr" type func

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

  return (
    <div className="mx-auto flex min-h-svh w-3/4">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="flex items-center justify-between gap-4 border-b px-6 py-3">
          <TabsList className="h-11 gap-1 rounded-lg bg-muted/60 p-1">
            <TabsTrigger
              value="dashboard"
              className="rounded-md px-5 py-2 text-sm font-medium transition-colors"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="callendar"
              className="rounded-md px-5 py-2 text-sm font-medium transition-colors"
            >
              Callendar
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="rounded-md px-5 py-2 text-sm font-medium transition-colors"
            >
              Events
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-md px-5 py-2 text-sm font-medium transition-colors"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          {showButton && (
            <Button
              className="gap-1.5 bg-primary shadow-sm"
              onClick={() => setModalOpen(true)}
            >
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
            <Settings />
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
