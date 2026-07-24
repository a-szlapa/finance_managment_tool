"use client"
import { clamp } from "@/lib/utils"
import { GripHorizontal, GripVertical } from "lucide-react"
import { stringify } from "querystring"
import React, { useEffect, useRef, useState } from "react"

type Orientation = "horizontal" | "vertical"
type DragMode = null | "start" | "end" | "move"

type RangePickerProps = {
  tickList: any[]
  minTickGap?: number
  startVal: number
  endVal: number
  startSetter: React.Dispatch<React.SetStateAction<number>>
  endSetter: React.Dispatch<React.SetStateAction<number>>
  orientation?: Orientation
  formater?: (value:any) => string
}

export default function RangePicker({
  tickList,
  minTickGap = 1,
  startVal,
  endVal,
  startSetter,
  endSetter,
  orientation = "horizontal",
  formater= (element: any) => {return element.toString()}
}: RangePickerProps) {
  const setStartTick = (val: number) => {
    startSetter(val)
  }

  const setEndTick = (val: number) => {
    endSetter(val)
  }

  const trackRef = useRef<HTMLDivElement>(null)

  const [dragMode, setDragMode] = useState<DragMode>(null)

  const dragOriginRef = useRef({ clientX: 0, startVal: 0, endVal: 0 })

  const rangeDisplayStart = (startVal / (tickList.length - 1)) * 100
  const rangeDisplayEnd = (endVal / (tickList.length - 1)) * 100

  function beginDrag(mode: DragMode) {
    return (event: React.PointerEvent) => {
      event.preventDefault()
      const pointerPos =
        orientation == "vertical" ? event.clientY : event.clientX
      if (mode == "move") {
        dragOriginRef.current = {
          clientX: pointerPos,
          startVal,
          endVal,
        }
      }
      setDragMode(mode)
    }
  }

  function updateRange(clientX: number) {
    const track = trackRef.current?.getBoundingClientRect()
    if (!track) return

    const track_space = orientation == "vertical" ? track.height : track.width

    const tickSize = track_space / (tickList.length - 1)

    const handlePosition =
      (clientX - (orientation == "vertical" ? track.top : track.left)) /
      tickSize

    if (dragMode == "start") {
      let tickIndex = clamp(Math.round(handlePosition), 0, endVal - minTickGap)
      setStartTick(tickIndex)
    }

    if (dragMode == "end") {
      let tickIndex = clamp(
        Math.round(handlePosition),
        startVal + minTickGap,
        tickList.length - 1
      )
      setEndTick(tickIndex)
    }

    if (dragMode == "move") {
      const dragDelta = clientX - dragOriginRef.current.clientX
      const tickDelta = Math.round(dragDelta / tickSize)
      const width =
        dragOriginRef.current.endVal - dragOriginRef.current.startVal

      let tickStartIndex = clamp(
        dragOriginRef.current.startVal + tickDelta,
        0,
        tickList.length - 1 - width
      )
      let tickEndIndex = tickStartIndex + width

      setStartTick(tickStartIndex)
      setEndTick(tickEndIndex)
    }
  }

  useEffect(() => {
    if (!dragMode) return

    const handleDrag = (event: PointerEvent) => {
      if (orientation == "horizontal") {
        updateRange(event.clientX)
      } else {
        updateRange(event.clientY)
      }
    }

    const handleUp = () => {
      setDragMode(null)
    }

    window.addEventListener("pointermove", handleDrag)
    window.addEventListener("pointerup", handleUp)

    return () => {
      window.removeEventListener("pointermove", handleDrag)
      window.removeEventListener("pointerup", handleUp)
    }
  }, [dragMode, rangeDisplayStart, rangeDisplayEnd, endVal, startVal])

  return (
    <>
      {orientation === "horizontal" && (
        <div
          ref={trackRef}
          className="relative h-9 w-full rounded-md bg-muted select-none"
        >
          <div
            className="absolute top-0 bottom-0 cursor-grab touch-none bg-primary active:cursor-grabbing"
            style={{
              left: `${rangeDisplayStart}%`,
              width: `${rangeDisplayEnd - rangeDisplayStart}%`,
            }}
            onPointerDown={beginDrag("move")}
          />

          {/* Start handle hitbox */}
          <div
            className="absolute top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
            style={{ left: `${rangeDisplayStart}%` }}
            onPointerDown={beginDrag("start")}
          >
            <div className="flex h-9 w-5 items-center justify-center rounded-l-md border-2 border-primary bg-background shadow">
              <GripVertical className="size-4 text-muted-foreground" />
            </div>
          </div>

          {/* End handle hitbox */}
          <div
            className="absolute top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
            style={{ left: `${rangeDisplayEnd}%` }}
            onPointerDown={beginDrag("end")}
          >
            <div className="flex h-9 w-5 items-center justify-center rounded-r-md border-2 border-primary bg-background shadow">
              <GripVertical className="size-4 text-muted-foreground" />
            </div>
          </div>
          <div
            className="absolute top-full mt-1 -translate-x-1/2 text-xs whitespace-nowrap text-muted-foreground"
            style={{ left: `${rangeDisplayStart}%` }}
          >
            {formater(tickList[startVal])}
          </div>

          <div
            className="absolute top-full mt-1 -translate-x-1/2 text-xs whitespace-nowrap text-muted-foreground"
            style={{ left: `${rangeDisplayEnd}%` }}
          >
            {formater(tickList[endVal])}
          </div>
        </div>
      )}

      {orientation === "vertical" && (
        <div
          ref={trackRef}
          className="relative h-full w-9 rounded-md bg-muted select-none"
        >
          <div
            className="absolute right-0 left-0 cursor-grab touch-none bg-primary active:cursor-grabbing"
            style={{
              top: `${rangeDisplayStart}%`,
              height: `${rangeDisplayEnd - rangeDisplayStart}%`,
            }}
            onPointerDown={beginDrag("move")}
          />

          {/* Start handle hitbox */}
          <div
            className="absolute left-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
            style={{ top: `${rangeDisplayStart}%` }}
            onPointerDown={beginDrag("start")}
          >
            <div className="flex h-5 w-9 items-center justify-center rounded-t-md border-2 border-primary bg-background shadow">
              <GripHorizontal className="size-4 text-muted-foreground" />
            </div>
          </div>

          {/* End handle hitbox */}
          <div
            className="absolute left-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
            style={{ top: `${rangeDisplayEnd}%` }}
            onPointerDown={beginDrag("end")}
          >
            <div className="flex h-5 w-9 items-center justify-center rounded-b-md border-2 border-primary bg-background shadow">
              <GripHorizontal className="size-4 text-muted-foreground" />
            </div>
          </div>

          <div
            className="absolute right-full mr-1 -translate-y-1/2 text-xs whitespace-nowrap text-muted-foreground"
            style={{ top: `${rangeDisplayStart}%` }}
          >
            {formater(tickList[startVal])}
          </div>
          <div
            className="absolute right-full mr-1 -translate-y-1/2 text-xs whitespace-nowrap text-muted-foreground"
            style={{ top: `${rangeDisplayEnd}%` }}
          >
            {formater(tickList[endVal])}
          </div>
        </div>
      )}
    </>
  )
}
