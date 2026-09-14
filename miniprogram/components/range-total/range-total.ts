// components/range-total/range-total.ts
const STORAGE_KEY = 'rangeTotalSettings'

export type PracticeMode = 'input' | 'choice'

const normalizeMode = (mode: string): PracticeMode => {
  return mode === 'choice' ? 'choice' : 'input'
}

const getSavedSettings = () => {
  const saved = wx.getStorageSync(STORAGE_KEY) || {}
  return {
    currentRange: Number(saved.currentRange) || 10,
    currentTotal: Number(saved.currentTotal) || 50,
    practiceMode: normalizeMode(saved.practiceMode)
  }
}

const saveSettings = (settings: { currentRange: number, currentTotal: number, practiceMode: PracticeMode }) => {
  wx.setStorageSync(STORAGE_KEY, settings)
}

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    range: { type: Boolean ,value: true},
    total: { type: Boolean ,value: true},
    // 只有支持"选择题模式"的练习页才打开：简单加减法、乘法口算
    showMode: { type: Boolean ,value: false},
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentRange:10,
    currentTotal:50,
    practiceMode:'input' as PracticeMode,
  },

  lifetimes: {
    attached() {
      const settings = getSavedSettings()
      this.setData(settings)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeRange(e) {
      const range = Number(e.currentTarget.dataset.range) || 10;
      const settings = {
        currentRange: range,
        currentTotal: Number(this.data.currentTotal) || 50,
        practiceMode: normalizeMode(this.data.practiceMode)
      }
      saveSettings(settings)
      this.setData(settings);
    },  
    changeTotal(e) {
      const total = Number(e.currentTarget.dataset.total) || 50;
      const settings = {
        currentRange: Number(this.data.currentRange) || 10,
        currentTotal: total,
        practiceMode: normalizeMode(this.data.practiceMode)
      }
      saveSettings(settings)
      this.setData(settings);
    },
    changeMode(e) {
      const practiceMode = normalizeMode(`${e.currentTarget.dataset.mode}`)
      const settings = {
        currentRange: Number(this.data.currentRange) || 10,
        currentTotal: Number(this.data.currentTotal) || 50,
        practiceMode
      }
      saveSettings(settings)
      this.setData(settings)
    },
    startTest(){
      const detail: { total: number, range: number, mode?: PracticeMode } = {
        total: this.data.currentTotal,
        range: this.data.currentRange
      }
      // 只有显示答题方式的页面才把模式带出去
      if (this.properties.showMode) {
        detail.mode = normalizeMode(this.data.practiceMode)
      }
      this.triggerEvent('beginTest', detail)
    }
    ,
    startPrint(){
      this.triggerEvent('beginPrint', { total: this.data.currentTotal, range: this.data.currentRange })
    }
  }
})
