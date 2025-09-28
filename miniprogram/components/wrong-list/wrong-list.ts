// components/wrong-list/wrong-list.ts
const app = getApp();
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    wrongList: { type: Array ,value: []},
  },

  /**
   * 组件的初始数据
   */
  data: {
    emojiStr:[...app.globalData.emojiArray].sort(()=>Math.random()-0.5),
    guli:["你算的数学题，计算器都自愧不如，为你骄傲！","这么难的步骤你都攻克了，像个小专家","将来一定能成大器","这个进步太棒了，我看到了你的努力","你比上次更熟练了，这就是坚持的力量","这么难的题目你都完美解答，像个小专家","看你这专注的样子，将来一定能成大器","大脑像肌肉，越练越强壮","你专注的样子像给知识充电的电池","你现在的努力，是给未来的自己写信","你今天的坚持，会变成明天的超能力","你解方程像侦探破案一样精彩！","成果会消失，但能力永远跟着你","照这个速度，下个月你能当小老师"]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeEmlji(){
      this.setData({
        emojiStr:[...app.globalData.emojiArray].sort(()=>Math.random()-0.5),
        guli:[...this.data.guli].sort(()=>Math.random()-0.5)
      })
    }
  }
})