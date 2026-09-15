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

export function formatRelativeTime(isoDate: string): string {
  const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return "hoje"
  if (days === 1) return "1 dia atrás"
  return `${days} dias atrás`
}
