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
    animalMove: 1,
  },
  lifetimes: {
    attached() {
      this.getEmoji()
    },
  },

  methods: {
  /**
  * 用户点击右上角分享
  */
//  onShareAppMessage() {
//   return {
//     title: '一起来学习吧！',
//     path: '/pages/index/index',
//   }
//  },
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
    goTotenFun(){
      // wx.navigateTo({
      //   url: '/pages/compute/tenFun/index'
      // })
      wx.openChannelsActivity({
        finderUserName:"sphJAvaa4TqNigV",
        feedId:"export/UzFfAgtgekIEAQAAAAAARhcq5g8IsgAAAAstQy6ubaLX4KHWvLEZgBPE9aMkQ2JRBrqPzNPgMJoZA-fvI3tKln9q4sMXn6xE",
        nonceId:""
      })
    },

    goToMixAdd(){
      wx.navigateTo({
        url: '/pages/compute/mixAddSub/index'
      })
    },
    goToMixMultip(){
      wx.navigateTo({
        url: '/pages/compute/mixMultip/index'
      })
    },
    goAboutFun(){
      wx.navigateTo({
        url: '/pages/about/index'
        // url: '/pages/arithmetic/arithmetic'
      })
    },
    goMulEquationFun(){
      wx.navigateTo({
        url: '/pages/compute/multipEquation/index'
      })
    },

    goNoteBookFun(){
      wx.navigateTo({
        url: '/pages/notebook/index'
      })
    },
    
    goToPage(){
      wx.showToast({
        title: '正在开发...',
        icon: 'none',
        duration: 2000
      })
    },
    emojiClick(e){
      const { index } = e.currentTarget.dataset;
      const isChange = Math.random() > 0.8;
      if(isChange){
        this.getEmoji()
      }else if(this.data.animalMove == 1){
        this.setData({animalMove: index})
        setTimeout(() => {this.setData({animalMove: 1})}, 5000);
      }
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
