// index.ts
// 获取应用实例
const app = getApp<IAppOption>()
Component({
  data: {
    motto: 'Hello World',
  },
  methods: {
    goToSimpleAddSub(){
      wx.navigateTo({
        url: '/pages/compute/simpleAddSub/index'
      })
    },    
    goToAddSub(){
      wx.navigateTo({
        url: '/pages/compute/addSub/index'
      })
    },
    goToPage(){
      wx.showToast({
        title: '正在开发...',
        icon: 'none',
        duration: 2000
      })
    },
  },
})
