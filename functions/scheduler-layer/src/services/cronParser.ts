import { CronExpression } from '../types/index.ts'

export class CronParser {
  static parse(cronExpression: string): CronExpression {
    const parts = cronExpression.split(' ')
    if (parts.length !== 5) {
      throw new Error('Invalid cron expression format')
    }

    return {
      minute: parts[0],
      hour: parts[1],
      day_of_month: parts[2],
      month: parts[3],
      day_of_week: parts[4]
    }
  }

  static getNextRun(cronExpression: string, timezone: string = 'UTC'): Date {
    const cron = this.parse(cronExpression)
    const now = new Date()
    const next = new Date(now)

    // Reset seconds and milliseconds
    next.setSeconds(0, 0)

    // Add one minute to start checking from the next minute
    next.setMinutes(next.getMinutes() + 1)

    while (!this.matchesCron(next, cron)) {
      next.setMinutes(next.getMinutes() + 1)
    }

    return next
  }

  private static matchesCron(date: Date, cron: CronExpression): boolean {
    return (
      this.matchesField(date.getMinutes(), cron.minute) &&
      this.matchesField(date.getHours(), cron.hour) &&
      this.matchesField(date.getDate(), cron.day_of_month) &&
      this.matchesField(date.getMonth() + 1, cron.month) &&
      this.matchesField(date.getDay(), cron.day_of_week)
    )
  }

  private static matchesField(value: number, field: string): boolean {
    if (field === '*') return true

    const parts = field.split(',')
    for (const part of parts) {
      if (part.includes('/')) {
        const [range, step] = part.split('/')
        const [start, end] = range.split('-').map(Number)
        if (value >= start && value <= (end || value) && (value - start) % Number(step) === 0) {
          return true
        }
      } else if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number)
        if (value >= start && value <= end) {
          return true
        }
      } else if (Number(part) === value) {
        return true
      }
    }

    return false
  }

  static validate(cronExpression: string): boolean {
    try {
      this.parse(cronExpression)
      return true
    } catch {
      return false
    }
  }
} 