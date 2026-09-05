import React from "react"
import { TabsList, TabsTrigger } from "./ui/tabs"
import { Plus } from "lucide-react"
import { Button } from "./ui/button"

type NavBarProps = {
  onNewEvent?: () => void
  showNewEventButton?: boolean
}

export default function NavBar({
  onNewEvent,
  showNewEventButton = true,
}: NavBarProps) {
  return (
    <div className="align flex flex-row items-center justify-between">
      <TabsList>
        <TabsTrigger value="Dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="Callendar">Callendar</TabsTrigger>
        <TabsTrigger value="Events">Event List</TabsTrigger>
        <TabsTrigger value="Settings">Settings</TabsTrigger>
      </TabsList>

      {showNewEventButton && (
        <Button className="" onClick={onNewEvent}>
          <Plus data-icon="inline-start" />
          New event
        </Button>
      )}
    </div>
  )
}
