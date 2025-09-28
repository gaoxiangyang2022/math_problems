// components/range-total/range-total.ts
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

  /**
   * 组件的方法列表
   */
  methods: {
    changeRange(e) {
      const { range } = e.currentTarget.dataset;
      this.setData({
        currentRange: range
      });
    },  
    changeTotal(e) {
      const { total } = e.currentTarget.dataset;
      this.setData({
        currentTotal: total
      });
    },
    startTest(){
      this.triggerEvent('beginTest', { total: this.data.currentTotal,range: this.data.currentRange })
    }
  }
})