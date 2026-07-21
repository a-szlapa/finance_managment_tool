"use client"
import { clamp } from "@/lib/utils"
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
}

export default function RangePicker({
  tickList,
  minTickGap = 1,
  startVal,
  endVal,
  startSetter,
  endSetter,
}: RangePickerProps) {

  const setStartTick = (val: number) => {
    startSetter(val)
  }

  const setEndTick = (val: number) => {
    endSetter(val)
  }

  const trackRef = useRef<HTMLDivElement>(null)
  const [rangeDisplayStart, setRangeDisplayStart] = useState(0)
  const [rangeDisplayEnd, setrangeDisplayEnd] = useState(100)

  const [dragMode, setDragMode] = useState<DragMode>(null)

  const dragOriginRef = useRef({ clientX: 0, startVal: 0, endVal: 0 })

  function beginDrag(mode: DragMode) {
    return (event: React.PointerEvent) => {
      event.preventDefault()
      if (mode == "move") {
        dragOriginRef.current = {
          clientX: event.clientX,
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

    const tickSize = track.width / (tickList.length - 1)

    const handlePosition = (clientX - track.left) / tickSize

    if (dragMode == "start") {
      let tickIndex = clamp(Math.round(handlePosition), 0, endVal - minTickGap)
      setStartTick(tickIndex)

      const newStartPos = ((tickIndex * tickSize) / track.width) * 100
      setRangeDisplayStart(newStartPos)
    }

    if (dragMode == "end") {
      let tickIndex = clamp(
        Math.round(handlePosition),
        startVal + minTickGap,
        tickList.length - 1
      )
      setEndTick(tickIndex)

      const newEndPos = ((tickIndex * tickSize) / track.width) * 100
      setrangeDisplayEnd(newEndPos)
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

      const newStartPos = ((tickStartIndex * tickSize) / track.width) * 100
      const newEndPos = ((tickEndIndex * tickSize) / track.width) * 100
      setRangeDisplayStart(newStartPos)
      setrangeDisplayEnd(newEndPos)
    }
  }

  useEffect(() => {
    if (!dragMode) return

    const handleDrag = (event: PointerEvent) => {
      updateRange(event.clientX)
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
  }, [dragMode, rangeDisplayStart, rangeDisplayEnd])

  return (
    <div
      ref={trackRef}
      className="relative h-3 w-full rounded-full bg-muted select-none"
    >
      <div
        className="absolute top-0 bottom-0 cursor-grab touch-none rounded-full bg-primary active:cursor-grabbing"
        style={{
          left: `${rangeDisplayStart}%`,
          width: `${rangeDisplayEnd - rangeDisplayStart}%`,
        }}
        onPointerDown={beginDrag("move")}
      />

      <div
        className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-primary bg-background shadow active:cursor-grabbing"
        style={{ left: `${rangeDisplayStart}%` }}
        onPointerDown={beginDrag("start")}
      />

      <div
        className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-primary bg-background shadow active:cursor-grabbing"
        style={{ left: `${rangeDisplayEnd}%` }}
        onPointerDown={beginDrag("end")}
      />
    </div>
  )
}
