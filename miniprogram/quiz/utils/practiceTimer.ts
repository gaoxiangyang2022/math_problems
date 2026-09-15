/**
 * 练习计时工具
 * - formatDuration：把秒数格式化成"几分几秒"
 * - createPracticeTimer：一次练习的计时器（总用时）
 * - createProblemTimer：单题的计时器
 */

export const formatDuration = (seconds: number) => {
  const safe = Math.max(Math.floor(Number(seconds) || 0), 0)
  const minutes = Math.floor(safe / 60)
  const rest = safe % 60
  if (minutes <= 0) {
    return `${rest}秒`
  }
  return rest > 0 ? `${minutes}分${rest}秒` : `${minutes}分`
}

/**
 * 竞速模式要精确到 0.1 秒，才看得出熟练程度
 * 例如 3.4秒 / 1分05.2秒
 */
export const formatPreciseDuration = (seconds: number) => {
  const safe = Math.max(Number(seconds) || 0, 0)
  const minutes = Math.floor(safe / 60)
  const rest = safe - minutes * 60
  if (minutes <= 0) {
    return `${rest.toFixed(1)}秒`
  }
  return `${minutes}分${rest.toFixed(1)}秒`
}

/** 总用时 ÷ 题目数，得到每题平均用时（秒） */
export const averageSeconds = (totalSeconds: number, count: number) => {
  const safeTotal = Math.max(Number(totalSeconds) || 0, 0)
  const safeCount = Math.max(Math.floor(Number(count) || 0), 0)
  if (!safeCount) return 0
  return safeTotal / safeCount
}

export interface PracticeTimer {
  start: () => void
  pause: () => void
  reset: () => void
  stop: () => number
  /** 停止并返回毫秒（竞速模式用，精度到 0.1 秒） */
  stopMs: () => number
  /** 当前已用毫秒 */
  getElapsedMs: () => number
  isRunning: () => boolean
  getElapsed: () => number
}

/**
 * 总用时计时器
 * 支持暂停/继续，多次暂停的时间不会累计
 */
export const createPracticeTimer = (): PracticeTimer => {
  let elapsed = 0
  let startedAt = 0
  let running = false

  const collect = () => {
    if (running) {
      elapsed += (Date.now() - startedAt) / 1000
      startedAt = Date.now()
    }
  }

  return {
    start() {
      if (running) return
      running = true
      startedAt = Date.now()
    },
    pause() {
      if (!running) return
      collect()
      running = false
    },
    reset() {
      elapsed = 0
      running = false
      startedAt = 0
    },
    stop() {
      this.pause()
      return Math.max(Math.round(elapsed), 0)
    },
    stopMs() {
      this.pause()
      return Math.max(Math.round(elapsed * 1000), 0)
    },
    isRunning() {
      return running
    },
    getElapsed() {
      const current = running ? elapsed + (Date.now() - startedAt) / 1000 : elapsed
      return Math.max(Math.round(current), 0)
    },
    getElapsedMs() {
      const current = running ? elapsed + (Date.now() - startedAt) / 1000 : elapsed
      return Math.max(Math.round(current * 1000), 0)
    }
  }
}

export interface ProblemTimer {
  start: () => void
  reset: () => void
  stop: () => void
  isRunning: () => boolean
  getElapsed: () => number
}

/**
 * 单题计时器：每换一题重置一次，答完后停止
 */
export const createProblemTimer = (): ProblemTimer => {
  let elapsed = 0
  let startedAt = 0
  let running = false

  const collect = () => {
    if (running) {
      elapsed += (Date.now() - startedAt) / 1000
      startedAt = Date.now()
    }
  }

  return {
    start() {
      if (running) return
      running = true
      startedAt = Date.now()
    },
    reset() {
      elapsed = 0
      startedAt = 0
      running = false
    },
    stop() {
      if (!running) return
      collect()
      running = false
    },
    isRunning() {
      return running
    },
    getElapsed() {
      const current = running ? elapsed + (Date.now() - startedAt) / 1000 : elapsed
      return Math.max(Math.round(current), 0)
    }
  }
}
