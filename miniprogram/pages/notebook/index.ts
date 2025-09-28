// pages/notebook/index.ts
import { MathOperationAnalyzer, AdditionStep, SubtractionStep } from '../../utils/MathOperationAnalyzer';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num1Array:[4,2,5],
    num2Array:[6,1,8],
    answerArray:[1,0,4,3],
    operator:'+',
    animation:wx.createAnimation(),
    addSteps:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const addSteps = MathOperationAnalyzer.analyzeAddition(Number(this.data.num1Array.join("")), Number(this.data.num2Array.join("")));
    console.log(addSteps)
    this.setData({
      addSteps:addSteps
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  showAnimation() {
    
  }
})