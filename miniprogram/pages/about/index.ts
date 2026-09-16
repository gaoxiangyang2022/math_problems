// pages/about/index.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  onLoad() {

  },

  /** 点击拨打电话 */
  callme() {
    wx.makePhoneCall({
      phoneNumber: '19138112344',
      fail: () => {
        // 用户取消或设备不支持拨号时静默处理
      }
    })
  },

  /** 点击复制微信号 */
  copyPhone() {
    wx.setClipboardData({
      data: '19138112344',
      success() {
        wx.showToast({ title: '微信号已复制' })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '小小数学家 · 陪孩子练口算的小程序',
      path: '/pages/index/index'
    }
  }
})
