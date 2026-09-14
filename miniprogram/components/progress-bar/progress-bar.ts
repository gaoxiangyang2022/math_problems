// components/progress-bar/progress-bar.ts
import { formatDuration } from '../../utils/practiceTimer';

interface TimerState {
  /** 本次练习累计秒数（已结算部分） */
  elapsedSeconds: number
  /** 当前这一段计时的起点 */
  startedAt: number
  running: boolean
  /** 本题累计秒数（已结算部分） */
  problemElapsed: number
  problemStartedAt: number
  problemRunning: boolean
  lastElapsed: number
  lastProblemElapsed: number
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
    showTimer: { type: Boolean, value: true } // 是否显示计时
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
      state.elapsedSeconds = 0
      state.startedAt = 0
      state.running = false
      state.problemElapsed = 0
      state.problemStartedAt = 0
      state.problemRunning = false
      state.lastElapsed = -1
      state.lastProblemElapsed = -1
      state.tickTimer = setInterval(() => {
        this.refreshTimer()
      }, 1000)
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
        state.elapsedSeconds += (now - state.startedAt) / 1000
        state.startedAt = now
      }
    },
    collectProblemElapsed() {
      const state = this as unknown as TimerState
      if (state.problemRunning) {
        const now = Date.now()
        state.problemElapsed += (now - state.problemStartedAt) / 1000
        state.problemStartedAt = now
      }
    },
    currentElapsed() {
      const state = this as unknown as TimerState
      const extra = state.running ? (Date.now() - state.startedAt) / 1000 : 0
      return Math.max(Math.round(state.elapsedSeconds + extra), 0)
    },
    currentProblemElapsed() {
      const state = this as unknown as TimerState
      const extra = state.problemRunning ? (Date.now() - state.problemStartedAt) / 1000 : 0
      return Math.max(Math.round(state.problemElapsed + extra), 0)
    },
    refreshTimer() {
      if (!this.properties.showTimer) return
      const state = this as unknown as TimerState
      const elapsed = this.currentElapsed()
      const problemElapsed = this.currentProblemElapsed()
      if (elapsed === state.lastElapsed && problemElapsed === state.lastProblemElapsed) return
      state.lastElapsed = elapsed
      state.lastProblemElapsed = problemElapsed
      this.setData({
        timerText: state.running || elapsed > 0 ? formatDuration(elapsed) : '',
        problemTimerText: state.problemRunning || problemElapsed > 0 ? formatDuration(problemElapsed) : ''
      })
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
      state.elapsedSeconds = 0
      state.running = false
      state.startedAt = 0
      state.lastElapsed = -1
      this.refreshTimer()
    },
    /** 新的一题开始计时 */
    startProblemTimer() {
      const state = this as unknown as TimerState
      state.problemElapsed = 0
      state.problemRunning = true
      state.problemStartedAt = Date.now()
      state.lastProblemElapsed = -1
      this.refreshTimer()
    },
    /** 本题作答结束，停止计时 */
    stopProblemTimer() {
      this.collectProblemElapsed()
      const state = this as unknown as TimerState
      state.problemRunning = false
      this.refreshTimer()
    },
    /** 整场练习结束，返回总用时（秒） */
    stopTimer() {
      this.pauseTimer()
      this.stopProblemTimer()
      return this.currentElapsed()
    },
    /** 供页面读取：本次练习总用时（秒） */
    getElapsedSeconds() {
      return this.currentElapsed()
    }
  }
})
