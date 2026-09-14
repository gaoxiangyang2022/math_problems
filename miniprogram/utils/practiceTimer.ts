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

export interface PracticeTimer {
  start: () => void
  pause: () => void
  reset: () => void
  stop: () => number
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
    isRunning() {
      return running
    },
    getElapsed() {
      const current = running ? elapsed + (Date.now() - startedAt) / 1000 : elapsed
      return Math.max(Math.round(current), 0)
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
