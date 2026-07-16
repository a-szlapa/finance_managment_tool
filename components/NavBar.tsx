import React from "react"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { Plus } from "lucide-react"
import { Button } from "./ui/button"

type NavBarProps = {}

export default function NavBar({}: NavBarProps) {
  return (
    <div className="flex flex-row align items-center justify-between border-border border-b-1 py-2">
      <TabsList>
        <TabsTrigger value="Dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="Callendar">Callendar</TabsTrigger>
        <TabsTrigger value="Events">Event List</TabsTrigger>
        <TabsTrigger value="Settings">Settings</TabsTrigger>
      </TabsList>

      <Button className="m-1">
        <Plus data-icon="inline-start" />
        New event
      </Button>
    </div>
  )
}
