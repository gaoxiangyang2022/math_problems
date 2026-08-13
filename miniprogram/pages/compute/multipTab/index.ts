// pages/compute/multipTab/index.ts
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    multipData: [],
    tableNums: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    selectedBase: 2,
    selectedFacts: [],
    selectedFact: null,
    groupData: [],
    showExplanation:false,
    explanationHeader : "点击乘法口诀查看解释",
    explanationText: "",
    groupCount: 0,
    perGroupCount: 0,
    selectedIndex: 0,
    scrollLeft:0
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
          _multipData_line.push({t:`${i}×${j}`,i:i,j:j,result:i*j})
      }
      _multipData.push(_multipData_line)
    }
   this.setData({
    multipData: _multipData
   })
    this.selectBase({ currentTarget: { dataset: { base: this.data.selectedBase } } })
   
  },

  selectBase(e) {
    const base = Number(e.currentTarget.dataset.base) || 2
    const selectedFacts = []
    for (let j = 1; j <= 9; j++) {
      selectedFacts.push({
        t: `${base} × ${j} = ${base * j}`,
        i: base,
        j,
        result: base * j
      })
    }
    this.setData({
      selectedBase: base,
      selectedFacts,
      showExplanation: false,
      selectedFact: null,
      groupData: []
    })
  },

  showFactExplanation(e) {
    const index = Number(e.currentTarget.dataset.index) || 0
    const fact = this.data.selectedFacts[index]
    if (!fact) return
    this.renderExplanation(fact, index)
  },

  showExplanation(e){
    const { i,j} = e.currentTarget.dataset;
    const fact = {
      i: Number(i),
      j: Number(j),
      result: Number(i) * Number(j)
    }
    this.renderExplanation(fact, 0)
  },

  renderExplanation(fact, index) {
    const emojis = [...app.globalData.emojiArray].sort(()=>Math.random()-0.5)
    const i = Number(fact.i)
    const j = Number(fact.j)
    const result = i * j
    let _GroupData = []
    for (let i1 = 0; i1 < i; i1++) {
      let _bunnyData = []
        for (let j1 = 0; j1 < j; j1++) {
          _bunnyData.push({t:emojis[i1]})
        }
        _bunnyData.push({t:`${i1+1}组`,label:true})
        _GroupData.push(_bunnyData)
    }
    this.setData({
      groupData:_GroupData,
      showExplanation:true,
      explanationHeader:`${i} × ${j} = ${result}`,
      explanationText: `${i} 组，每组 ${j} 个，一共 ${result} 个`,
      groupCount: i,
      perGroupCount: j,
      selectedIndex: index,
      selectedFact: fact
    })

    setTimeout(() => {
      this.setData({
        scrollLeft: 100
      });

      setTimeout(() => {
        this.setData({
          scrollLeft: 0
        });
      }, 1500);
    }, 1000);
  },

  prevFact() {
    const nextIndex = Math.max(this.data.selectedIndex - 1, 0)
    const fact = this.data.selectedFacts[nextIndex]
    if (!fact) return
    this.renderExplanation(fact, nextIndex)
  },

  nextFact() {
    const nextIndex = Math.min(this.data.selectedIndex + 1, this.data.selectedFacts.length - 1)
    const fact = this.data.selectedFacts[nextIndex]
    if (!fact) return
    this.renderExplanation(fact, nextIndex)
  },

  closeExplanation(){
    this.setData({showExplanation:false})
  },
  // onShareAppMessage() {
  //   return {
  //     title: '一起来学习乘法口决吧！',
  //     path: '/pages/compute/multipTab/index',
  //   }
  //  },
})
