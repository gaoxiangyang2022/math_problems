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
    progressPercent: 0
  },

  observers: {
    'index,total': function(index: number, total: number) {
      const safeTotal = Math.max(Number(total) || 0, 0)
      const safeIndex = Math.max(Number(index) || 0, 0)
      const displayIndex = safeTotal ? Math.min(safeIndex, safeTotal) : 0
      const progressPercent = safeTotal ? Math.min((displayIndex / safeTotal) * 100, 100) : 0
      this.setData({
        displayIndex,
        displayTotal: safeTotal,
        progressPercent
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
