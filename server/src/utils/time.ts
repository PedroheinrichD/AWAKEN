export function formatRemaining(endsAt: Date): string {
  const ms = endsAt.getTime() - Date.now()
  if (ms <= 0) return "Encerrado"

  const totalMinutes = Math.floor(ms / 60000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) return `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
}
