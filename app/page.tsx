"use client"
import NavBar from "@/components/NavBar"
import Callendar from "@/components/pages/Callendar"
import Dashboard from "@/components/pages/Dashboard"
import Events from "@/components/pages/Events"
import Settings from "@/components/pages/Settings"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React, { useState } from "react"

export default function page() {
  return (
    <>
      <div className="w-full flex flex-row justify-center py-10">
        <div className="w-1/8">{/* side panel L */}</div>
        <main className="max-w-3/4 w-3/4">
          <Tabs className="w-full">
            <NavBar />
            <TabsContent value="Dashboard"><Dashboard></Dashboard></TabsContent>
            <TabsContent value="Callendar"><Callendar></Callendar></TabsContent>
            <TabsContent value="Events"><Events></Events></TabsContent>
            <TabsContent value="Settings"><Settings></Settings></TabsContent>
          </Tabs>
        </main>
        <div className="w-1/8">{/* side panel L */}</div>
      </div>
    </>
  )
}
