// components/progress-bar/progress-bar.ts
import { formatPreciseDuration } from '../../utils/practiceTimer';

interface TimerState {
  /** 本次练习累计毫秒（已结算部分） */
  elapsedMs: number
  /** 当前这一段计时的起点 */
  startedAt: number
  running: boolean
  /** 本题累计毫秒（已结算部分） */
  problemElapsedMs: number
  problemStartedAt: number
  problemRunning: boolean
  lastTick: number
  tickTimer: number | null
}

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    index: { type: Number },
    total: { type: Number },
    wrongNum: { type: Number},
    showTimer: { type: Boolean, value: true },        // 是否显示整场用时
    showProblemTimer: { type: Boolean, value: true }, // 是否显示"本题用时"
    // 竞速模式：不显示本题计时和题目数，只突出总用时 + 每题平均
    speedMode: { type: Boolean, value: false },
    /** 每题平均用时文案，例如 "均 2.4秒"，由页面算好传进来 */
    averageText: { type: String, value: '' }
  },

  /**
   * 组件的初始数据
   */
  data: {
    displayIndex: 0,
    displayTotal: 0,
    progressPercent: 0,
    progressMood: '开始啦',
    timerText: '',
    problemTimerText: ''
  },

  observers: {
    'index,total': function(index: number, total: number) {
      const safeTotal = Math.max(Number(total) || 0, 0)
      const safeIndex = Math.max(Number(index) || 0, 0)
      const displayIndex = safeTotal ? Math.min(safeIndex, safeTotal) : 0
      const progressPercent = safeTotal ? Math.min((displayIndex / safeTotal) * 100, 100) : 0
      const remaining = Math.max(safeTotal - displayIndex, 0)
      let progressMood = '开始啦'
      if (!safeTotal) {
        progressMood = '开始啦'
      } else if (displayIndex >= safeTotal) {
        progressMood = '完成啦，太棒了'
      } else if (remaining <= 3) {
        progressMood = '快完成啦，再坚持一下'
      } else if (displayIndex <= 3) {
        progressMood = '刚开始，慢慢来'
      } else if (progressPercent >= 60) {
        progressMood = '做得很好，继续加油'
      } else {
        progressMood = '一步一步来，稳稳的'
      }
      this.setData({
        displayIndex,
        displayTotal: safeTotal,
        progressPercent,
        progressMood
      })
    }
  },

  lifetimes: {
    attached() {
      const state = this as unknown as TimerState
      state.elapsedMs = 0
      state.startedAt = 0
      state.running = false
      state.problemElapsedMs = 0
      state.problemStartedAt = 0
      state.problemRunning = false
      state.lastTick = -1
      // 竞速模式要显示到 0.1 秒，刷新频率高一点
      const interval = this.properties.speedMode ? 100 : 500
      state.tickTimer = setInterval(() => {
        this.refreshTimer()
      }, interval)
    },
    detached() {
      const state = this as unknown as TimerState
      if (state.tickTimer) {
        clearInterval(state.tickTimer)
        state.tickTimer = null
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 每次结算时重新累计时间段，避免 setInterval 漂移
    collectElapsed() {
      const state = this as unknown as TimerState
      if (state.running) {
        const now = Date.now()
        state.elapsedMs += now - state.startedAt
        state.startedAt = now
      }
    },
    collectProblemElapsed() {
      const state = this as unknown as TimerState
      if (state.problemRunning) {
        const now = Date.now()
        state.problemElapsedMs += now - state.problemStartedAt
        state.problemStartedAt = now
      }
    },
    currentElapsedMs() {
      const state = this as unknown as TimerState
      const extra = state.running ? Date.now() - state.startedAt : 0
      return Math.max(Math.round(state.elapsedMs + extra), 0)
    },
    currentProblemElapsedMs() {
      const state = this as unknown as TimerState
      const extra = state.problemRunning ? Date.now() - state.problemStartedAt : 0
      return Math.max(Math.round(state.problemElapsedMs + extra), 0)
    },
    refreshTimer() {
      if (!this.properties.showTimer && !this.properties.showProblemTimer) return
      const state = this as unknown as TimerState
      const elapsedMs = this.currentElapsedMs()
      const problemMs = this.currentProblemElapsedMs()
      // 竞速模式按 0.1 秒刷新，普通模式按秒刷新
      const tick = this.properties.speedMode ? Math.floor(elapsedMs / 100) : Math.floor(elapsedMs / 1000)
      const patch = {} as Record<string, string>
      if (this.properties.showTimer && tick !== state.lastTick) {
        state.lastTick = tick
        patch.timerText = state.running || elapsedMs > 0 ? formatPreciseDuration(elapsedMs / 1000) : ''
      }
      if (this.properties.showProblemTimer) {
        patch.problemTimerText = state.problemRunning || problemMs > 0 ? formatPreciseDuration(problemMs / 1000) : ''
      }
      if (Object.keys(patch).length) this.setData(patch)
    },
    /** 开始整场练习计时 */
    startTimer() {
      const state = this as unknown as TimerState
      if (state.running) return
      state.running = true
      state.startedAt = Date.now()
      this.refreshTimer()
    },
    /** 暂停整场练习计时（切到后台或页面隐藏时调用） */
    pauseTimer() {
      this.collectElapsed()
      const state = this as unknown as TimerState
      state.running = false
      this.refreshTimer()
    },
    /** 重置整场练习计时 */
    resetTimer() {
      const state = this as unknown as TimerState
      state.elapsedMs = 0
      state.running = false
      state.startedAt = 0
      state.lastTick = -1
      this.refreshTimer()
    },
    /** 新的一题开始计时 */
    startProblemTimer() {
      const state = this as unknown as TimerState
      state.problemElapsedMs = 0
      state.problemRunning = true
      state.problemStartedAt = Date.now()
      this.refreshTimer()
    },
    /** 本题作答结束，停止计时 */
    stopProblemTimer() {
      this.collectProblemElapsed()
      const state = this as unknown as TimerState
      state.problemRunning = false
      this.refreshTimer()
    },
    /** 整场练习结束，返回总用时（毫秒） */
    stopTimer() {
      this.pauseTimer()
      this.stopProblemTimer()
      return this.currentElapsedMs()
    },
    /** 供页面读取：本次练习总用时（毫秒） */
    getElapsedMs() {
      return this.currentElapsedMs()
    },
    /** 供页面读取：本次练习总用时（秒，整数） */
    getElapsedSeconds() {
      return Math.round(this.currentElapsedMs() / 1000)
    }
  }
})
