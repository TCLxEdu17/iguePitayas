export function buildDateRange(period: string): { startDate: Date; endDate: Date } {
  const now = new Date()
  const endDate = new Date(now)
  endDate.setHours(23, 59, 59, 999)

  let startDate: Date

  if (period === 'week') {
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 6)
    startDate.setHours(0, 0, 0, 0)
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    startDate.setHours(0, 0, 0, 0)
  } else {
    // day
    startDate = new Date(now)
    startDate.setHours(0, 0, 0, 0)
  }

  return { startDate, endDate }
}
