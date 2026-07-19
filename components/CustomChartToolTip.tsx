import React from 'react'
import type { TooltipProps } from 'recharts'

type CustomTooltipProps = {
  
}

export default function CustomTooltip({ active, payload, label }: TooltipProps<any, any>) {
  return (
    <div>CustomTooltip</div>
  )
}
