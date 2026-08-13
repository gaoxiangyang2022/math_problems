// components/range-total/range-total.ts
const STORAGE_KEY = 'rangeTotalSettings'

const getSavedSettings = () => {
  const saved = wx.getStorageSync(STORAGE_KEY) || {}
  return {
    currentRange: Number(saved.currentRange) || 10,
    currentTotal: Number(saved.currentTotal) || 50
  }
}

const saveSettings = (settings: { currentRange: number, currentTotal: number }) => {
  wx.setStorageSync(STORAGE_KEY, settings)
}

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    range: { type: Boolean ,value: true},
    total: { type: Boolean ,value: true},
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentRange:10,
    currentTotal:50,
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
        currentTotal: Number(this.data.currentTotal) || 50
      }
      saveSettings(settings)
      this.setData(settings);
    },  
    changeTotal(e) {
      const total = Number(e.currentTarget.dataset.total) || 50;
      const settings = {
        currentRange: Number(this.data.currentRange) || 10,
        currentTotal: total
      }
      saveSettings(settings)
      this.setData(settings);
    },
    startTest(){
      this.triggerEvent('beginTest', { total: this.data.currentTotal,range: this.data.currentRange })
    }
    ,
    startPrint(){
      this.triggerEvent('beginPrint', { total: this.data.currentTotal,range: this.data.currentRange })
    }
  }
})
