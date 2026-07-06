"use client"

import { useState } from "react"

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

export default function Page() {
  const [tab, setTab] = useState("dashboard")

  const showButton = ["dashboard", "callendar", "events"].includes(tab)

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
            <Button className="bg-primary gap-1.5 shadow-sm">
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
            <Events />
          </TabsContent>

          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}