Component({
  properties: {
    title: { type: String, value: '' }
  },

  data: {
    statusBarHeight: 20,
    navHeight: 64
  },

  lifetimes: {
    attached() {
      const info = wx.getSystemInfoSync()
      const statusBarHeight = info.statusBarHeight || 20
      this.setData({
        statusBarHeight,
        navHeight: statusBarHeight + 48
      })
    }
  },

  methods: {
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        wx.navigateBack()
      } else {
        wx.reLaunch({ url: '/pages/index/index' })
      }
    }
  }
})
