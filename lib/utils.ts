import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const clamp = (val: number, min: number, max: number): number => 
  Math.max(min, Math.min(val, max));