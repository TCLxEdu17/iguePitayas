import { buildDateRange } from '@/lib/dashboard'

describe('buildDateRange', () => {
  it('month starts on day 1', () => {
    const { startDate } = buildDateRange('month')
    expect(startDate.getDate()).toBe(1)
    expect(startDate.getHours()).toBe(0)
  })

  it('week covers 7 days', () => {
    const { startDate, endDate } = buildDateRange('week')
    const diffMs = endDate.getTime() - startDate.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    expect(diffDays).toBeGreaterThanOrEqual(6)
    expect(diffDays).toBeLessThanOrEqual(7)
  })

  it('day starts at midnight', () => {
    const { startDate } = buildDateRange('day')
    expect(startDate.getHours()).toBe(0)
    expect(startDate.getMinutes()).toBe(0)
  })

  it('endDate is at end of day', () => {
    const { endDate } = buildDateRange('day')
    expect(endDate.getHours()).toBe(23)
    expect(endDate.getSeconds()).toBe(59)
  })
})
