// index.ts
// 获取应用实例
const app = getApp<IAppOption>()
const LAST_PRACTICE_KEY = 'lastPracticeEntry'
const encouragements = [
  '慢慢算也很厉害',
  '今天先选一个小关卡吧',
  '认真看题，就已经很棒啦',
  '做一点点，也是在进步',
  '先从简单的开始也很好',
  '慢慢想，不急的',
  '错了也没关系，再来一次',
  '你只是需要多一点时间',
  '动笔写写看，就会有思路',
  '能坐在这里做题，你已经很棒了',
  '认真写的你，超帅',
  '你的字写得真工整',
  '草稿纸用得很整齐呢',
  '检查一遍的你，特别厉害',
  '每一步都写清楚，太棒了',
  '做一道也是收获',
  '完成一半，也值得鼓掌',
  '今天比昨天多会一题就好',
  '不用跟别人比，做自己就好',
  '能做对一题，就是胜利',
  '大胆猜一个答案试试',
  '把你的想法说出来听听',
  '画个图帮帮忙吧',
  '换个角度看看，也许就亮了',
  '这道题有点意思，一起来琢磨'
]

Component({
  data: {
    motto: 'Hello World',
    emo1:"",
    emo2:"",
    emo3:"",
    emo4:"",
    animalMove: 1,
    encouragement: encouragements[0],
    lastPractice: null,
  },
  lifetimes: {
    attached() {
      this.getEmoji()
      this.refreshHome()
    },
  },
  pageLifetimes: {
    show() {
      this.refreshHome()
    }
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
      this.openPractice('简单加减法', '/pages/compute/simpleAddSub/index')
    },    
    goToAddSub(){
      this.openPractice('加减竖式', '/pages/compute/addSub/index')
    },
    goToMultip(){
      this.openPractice('乘法口诀', '/pages/compute/multipTab/index')
    },
    goToMult(){
      this.openPractice('乘法口算', '/pages/compute/multip/index')
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
      this.openPractice('加减混合', '/pages/compute/mixAddSub/index')
    },
    goToMixMultip(){
      this.openPractice('加减乘混合', '/pages/compute/mixMultip/index')
    },
    goAboutFun(){
      wx.navigateTo({
        url: '/pages/about/index'
        // url: '/pages/arithmetic/arithmetic'
        // url: '/pages/demo/addSubDemo/index'
      })
    },
    goMulEquationFun(){
      this.openPractice('乘法竖式', '/pages/compute/multipEquation/index')
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
      if(this.data.animalMove == 1){
        this.setData({animalMove: index})
        setTimeout(() => {this.setData({animalMove: 1})}, 1800);
      }
      if(isChange){
        setTimeout(() => {this.getEmoji()}, 1800);
      }
    },
    openPractice(title, url) {
      const lastPractice = { title, url }
      wx.setStorageSync(LAST_PRACTICE_KEY, lastPractice)
      this.setData({ lastPractice })
      wx.navigateTo({ url })
    },
    goLastPractice() {
      if (!this.data.lastPractice || !this.data.lastPractice.url) return
      wx.navigateTo({
        url: this.data.lastPractice.url
      })
    },
    refreshHome() {
      const lastPractice = wx.getStorageSync(LAST_PRACTICE_KEY) || null
      const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)]
      this.setData({
        lastPractice,
        encouragement
      })
    },
    getEmoji(){
      const emojis = [...app.globalData.emojiArray].sort(()=>Math.random()-0.5)
      const index = Math.ceil(Math.random()*10)
      this.refreshHome()
      this.setData({
        emo1:emojis[index],
        emo2:emojis[index+1],
        emo3:emojis[index+2],
        emo4:emojis[index+3]
      })
    }
  },
})
