import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value)
}

export function percentage(current: number, max: number): number {
  if (max <= 0) return 0
  return clamp((current / max) * 100, 0, 100)
}
