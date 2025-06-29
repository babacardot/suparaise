interface SchedulerConfig {
  maxConcurrentBrowsers: number
  peakHours: { start: number; end: number }[] // UTC hours when usage is high
  offPeakDiscountFactor: number
  priorityLevels: Record<string, number> // FREE: 3, PRO: 2, MAX: 1
}

interface SubmissionJob {
  id: string
  startupId: string
  targetId: string
  priority: number
  estimatedDuration: number // minutes
  createdAt: Date
  userTier: 'FREE' | 'PRO' | 'MAX'
}

export class AgentScheduler {
  private config: SchedulerConfig
  private activeJobs: Map<string, SubmissionJob> = new Map()
  private queue: SubmissionJob[] = []

  constructor(config: SchedulerConfig) {
    this.config = config
  }

  // Optimize scheduling to minimize browser costs
  scheduleSubmission(job: SubmissionJob): {
    scheduled: boolean
    estimatedStart?: Date
  } {
    const currentHour = new Date().getUTCHours()
    const isOffPeak = !this.isCurrentlyPeakHours(currentHour)

    // Prioritize based on user tier and timing
    const effectivePriority = this.calculateEffectivePriority(job, isOffPeak)

    // Check if we can run immediately
    if (this.canRunImmediately(job)) {
      this.activeJobs.set(job.id, job)
      return { scheduled: true, estimatedStart: new Date() }
    }

    // Add to queue with smart positioning
    this.addToQueue(job, effectivePriority)

    return {
      scheduled: false,
      estimatedStart: this.estimateStartTime(job),
    }
  }

  private calculateEffectivePriority(
    job: SubmissionJob,
    isOffPeak: boolean,
  ): number {
    let priority = this.config.priorityLevels[job.userTier]

    // Boost FREE users during off-peak hours to improve their experience
    if (job.userTier === 'FREE' && isOffPeak) {
      priority -= 0.5
    }

    // Age-based priority boost (older jobs get higher priority)
    const ageHours = (Date.now() - job.createdAt.getTime()) / (1000 * 60 * 60)
    priority -= Math.min(ageHours * 0.1, 1) // Max 1 point boost for age

    return priority
  }

  private canRunImmediately(job: SubmissionJob): boolean {
    const currentConcurrent = this.activeJobs.size
    const userConcurrentCount = Array.from(this.activeJobs.values()).filter(
      (j) => j.startupId === job.startupId,
    ).length

    // Check global limits
    if (currentConcurrent >= this.config.maxConcurrentBrowsers) {
      return false
    }

    // Check per-user limits based on tier
    const maxUserConcurrent = this.getUserConcurrentLimit(job.userTier)
    if (userConcurrentCount >= maxUserConcurrent) {
      return false
    }

    return true
  }

  private getUserConcurrentLimit(tier: 'FREE' | 'PRO' | 'MAX'): number {
    switch (tier) {
      case 'FREE':
        return 1
      case 'PRO':
        return 3
      case 'MAX':
        return 8
      default:
        return 1
    }
  }

  private isCurrentlyPeakHours(hour: number): boolean {
    return this.config.peakHours.some(
      (peak) => hour >= peak.start && hour <= peak.end,
    )
  }

  private addToQueue(job: SubmissionJob, priority: number): void {
    job.priority = priority

    // Insert in priority order (lower number = higher priority)
    const insertIndex = this.queue.findIndex(
      (queuedJob) => queuedJob.priority > priority,
    )

    if (insertIndex === -1) {
      this.queue.push(job)
    } else {
      this.queue.splice(insertIndex, 0, job)
    }
  }

  private estimateStartTime(job: SubmissionJob): Date {
    // Calculate based on queue position and average job duration
    const position = this.queue.findIndex((j) => j.id === job.id)
    const averageJobDuration = 15 // minutes
    const estimatedWaitMinutes =
      position * (averageJobDuration / this.config.maxConcurrentBrowsers)

    return new Date(Date.now() + estimatedWaitMinutes * 60 * 1000)
  }

  // Process queue when browsers become available
  processQueue(): SubmissionJob[] {
    const readyJobs: SubmissionJob[] = []

    while (
      this.queue.length > 0 &&
      this.activeJobs.size < this.config.maxConcurrentBrowsers
    ) {
      const nextJob = this.queue.shift()!

      if (this.canRunImmediately(nextJob)) {
        this.activeJobs.set(nextJob.id, nextJob)
        readyJobs.push(nextJob)
      } else {
        // Put it back at the front if it still can't run
        this.queue.unshift(nextJob)
        break
      }
    }

    return readyJobs
  }

  // Mark job as completed
  completeJob(jobId: string): void {
    this.activeJobs.delete(jobId)

    // Process queue for newly available slots
    this.processQueue()
  }

  // Get queue status for a specific user
  getQueueStatus(startupId: string): {
    position: number
    estimatedWait: number
    activeJobs: number
  } {
    const queuePosition = this.queue.findIndex(
      (job) => job.startupId === startupId,
    )
    const activeCount = Array.from(this.activeJobs.values()).filter(
      (job) => job.startupId === startupId,
    ).length

    const estimatedWaitMinutes =
      queuePosition === -1
        ? 0
        : queuePosition * (15 / this.config.maxConcurrentBrowsers)

    return {
      position: queuePosition + 1,
      estimatedWait: estimatedWaitMinutes,
      activeJobs: activeCount,
    }
  }
}

// Smart configuration that minimizes costs
export const createOptimizedScheduler = (): AgentScheduler => {
  return new AgentScheduler({
    maxConcurrentBrowsers: 25, // Match HyperBrowser Startup tier
    peakHours: [
      { start: 9, end: 17 }, // 9 AM - 5 PM UTC (Business hours)
      { start: 14, end: 22 }, // 2 PM - 10 PM UTC (US West Coast business hours)
    ],
    offPeakDiscountFactor: 0.7,
    priorityLevels: {
      FREE: 3,
      PRO: 2,
      MAX: 1,
    },
  })
}

export default AgentScheduler
