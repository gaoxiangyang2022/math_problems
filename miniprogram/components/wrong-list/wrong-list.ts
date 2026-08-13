import { clearPracticeStats, getPracticeStats } from '../../utils/practiceStats';

const app = getApp();

Component({
  properties: {
    wrongList: { type: Array, value: [] },
    sessionTotal: { type: Number, value: 0 },
  },

  data: {
    stats: { total: 0, wrong: 0 },
    sessionCorrect: 0,
    demoVisible: false,
    demoQuestion: '',
    demoAnswer: 0,
    emojiStr: [...app.globalData.emojiArray].sort(() => Math.random() - 0.5),
    guli: ["你算的数学题，计算器都自愧不如，为你骄傲！", "这么难的步骤你都攻克了，像个小专家", "将来一定能成大器", "这个进步太棒了，我看到了你的努力", "你比上次更熟练了，这就是坚持的力量", "这么难的题目你都完美解答，像个小专家", "看你这专注的样子，将来一定能成大器", "大脑像肌肉，越练越强壮", "你专注的样子像给知识充电的电池", "你现在的努力，是给未来的自己写信", "你今天的坚持，会变成明天的超能力", "你解方程像侦探破案一样精彩！", "成果会消失，但能力永远跟着你", "照这个速度，下个月你能当小老师"]
  },

  lifetimes: {
    attached() {
      this.refreshStats()
      this.refreshSessionSummary()
    }
  },

  observers: {
    'wrongList, sessionTotal': function() {
      this.refreshSessionSummary()
    }
  },

  methods: {
    refreshSessionSummary() {
      const total = Math.max(Number(this.properties.sessionTotal) || 0, 0)
      const wrong = Math.max(this.properties.wrongList.length || 0, 0)
      this.setData({
        sessionCorrect: Math.max(total - wrong, 0)
      })
    },
    refreshStats() {
      const stats = getPracticeStats()
      this.setData({
        stats: {
          total: Number(stats.total) || 0,
          wrong: Number(stats.wrong) || 0
        }
      })
    },
    changeEmlji() {
      this.setData({
        emojiStr: [...app.globalData.emojiArray].sort(() => Math.random() - 0.5),
        guli: [...this.data.guli].sort(() => Math.random() - 0.5)
      })
    },
    goDemo(e) {
      const item = e.currentTarget.dataset.item
      this.setData({
        demoVisible: true,
        demoQuestion: item.question,
        demoAnswer: Number(item.correctAnswer)
      })
    },
    closeDemo() {
      this.setData({ demoVisible: false })
    },
    clearStats() {
      wx.showModal({
        title: '清空今日统计',
        content: '要把今天累计做题和错题数量清零吗？',
        confirmText: '清空',
        cancelText: '取消',
        success: (res) => {
          if (!res.confirm) return
          const stats = clearPracticeStats()
          this.setData({
            stats: {
              total: stats.total,
              wrong: stats.wrong
            }
          })
        }
      })
    },
    restart() {
      this.triggerEvent('restart')
    }
  }
})
