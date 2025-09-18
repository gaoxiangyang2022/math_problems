// index.ts
// 获取应用实例
const app = getApp<IAppOption>()
Component({
  data: {
    motto: 'Hello World',
    emo1:"",
    emo2:"",
    emo3:"",
    emo4:"",
  },
  lifetimes: {
    attached() {
      this.getEmoji()
    },
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
    goToMultip(){
      wx.navigateTo({
        url: '/pages/compute/multipTab/index'
      })
    },
    goToMult(){
      wx.navigateTo({
        url: '/pages/compute/multip/index'
      })
    },
    goToPage(){
      wx.showToast({
        title: '正在开发...',
        icon: 'none',
        duration: 2000
      })
    },
    getEmoji(){
      const emojis = [...app.globalData.emojiArray].sort(()=>Math.random()-0.5)
      const index = Math.ceil(Math.random()*10)
      this.setData({
        emo1:emojis[index],
        emo2:emojis[index+1],
        emo3:emojis[index+2],
        emo4:emojis[index+3]
      })
    }
  },
})
