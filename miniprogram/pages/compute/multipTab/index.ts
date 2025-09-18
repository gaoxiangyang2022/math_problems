// pages/compute/multipTab/index.ts
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    multipData: [],
    groupData: [],
    explanationHeader : "点击乘法口诀查看解释",
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.initData()
  },

  initData() {
    // 生成乘法口诀表
    let _multipData = []
    for (let i = 1; i <= 9; i++) {
      let _multipData_line = []
      for (let j = i; j <= 9; j++) {
          _multipData_line.push({t:`${i}×${j}`,i:i,j:j})
      }
      _multipData.push(_multipData_line)
    }
   this.setData({
    multipData: _multipData
   })
   
  },

  showExplanation(e){
    const emojis = [...app.globalData.emojiArray].sort(()=>Math.random()-0.5)
    const { i,j} = e.currentTarget.dataset;
    const result = i * j;   
    let _GroupData = []
    // 创建新的兔子分组
    for (let i1 = 0; i1 < i; i1++) {
      let _bunnyData = []
        for (let j1 = 0; j1 < j; j1++) {
          _bunnyData.push({t:emojis[i1]})
        }
        _bunnyData.push({t:`${i1+1}组`,label:true})
        _GroupData.push(_bunnyData)
    }

      // 更新数据
      this.setData({groupData:_GroupData,explanationHeader:`${i} × ${j} = ${result}`})
  },
})