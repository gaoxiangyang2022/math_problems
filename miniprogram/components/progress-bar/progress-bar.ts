// components/progress-bar/progress-bar.ts
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    index: { type: Number },
    total: { type: Number },
    wrongNum: { type: Number}    
  },

  /**
   * 组件的初始数据
   */
  data: {
    displayIndex: 0,
    displayTotal: 0,
    progressPercent: 0,
    progressMood: '开始啦'
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

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
