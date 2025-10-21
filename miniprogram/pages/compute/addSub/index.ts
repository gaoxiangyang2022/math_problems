// pages/compute/addSub/index.ts
import { isValidNumber,getAddSubProblemShu } from '../../../utils/util';
import { MathOperationAnalyzer, AdditionStep, SubtractionStep } from '../../../utils/MathOperationAnalyzer';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num1Array:[4,2,5],
    num2Array:[6,1,2],
    num1Selected :10000,
    num2Selected :10000,
    correctAnswerArray:[1,0,3,7],
    correctAnimationArray:[],
    userAnswerArray:[0],
    showWherePage:0,
    currentTotal: 50,
    currentIndex: 1,
    wrongQuestions:[],
    inputFocus:0,
    operator:'+',
    userAnswer : "",
    processOfProblemIndex : 0,
    processSteps:[],
    currentStep:{},
    errorShake:false,
    problemList:[]
  },

  startTest(e) {    
    this.setData({
      currentTotal:e.detail.total,
      currentIndex: 1,
      wrongQuestions: [],
      showWherePage: 1
    });
    this.generateNewProblem();
  },

  nextProblem() {
    this.setData({
      feedbackMessage: "",
      userAnswer: "",
      inputFocus: 0,
      errorShake:false
    });

    if (this.data.currentIndex > this.data.currentTotal) {
      this.setData({
        inputFocus: 100
      });
      this.finishQuiz();
    } else {
      this.generateNewProblem();
    }
  },
  finishQuiz() {
    this.setData({
      showWherePage: 2
    });
  },
  generateNewProblem() {
    const p = getAddSubProblemShu()
    this.setData({
      currentProblem: p.problem,
      correctAnswer: p.answer,
      num1Array: p.num1Array,
      num2Array: p.num2Array,
      correctAnswerArray: p.answerArray,
      userAnswerArray: p.answerArray.map(() => null),
      operator: p.operator
    });
  },

  
  inputChange(e) {
    console.log(e.target.dataset)
    if(isValidNumber(e.detail.value)){
      const _userAnswer = parseInt(e.detail.value);
      const _dataSet = e.target.dataset
      var _userAnswerArray = this.data.userAnswerArray
      _userAnswerArray[_dataSet.index] = _userAnswer
      //保存用户答案
      this.setData({
        userAnswerArray : _userAnswerArray,
        inputFocus : _dataSet.index+1,
      })

      if(this.data.userAnswerArray.length-1 == _dataSet.index){
        this.checkAnswer()
      }
    }
  },

  
  checkAnswer() {

  if (this.data.userAnswerArray.reverse().join('') != this.data.correctAnswerArray.reverse().join('')) {
    var wqTmp = this.data.wrongQuestions
    wqTmp.push({"question": this.data.currentProblem,"yourAnswer": this.data.userAnswerArray.reverse().join(''),"correctAnswer": this.data.correctAnswerArray.reverse().join('')})
    this.setData({
      feedbackMessage: `😢答错了！正确答案是 ${this.data.correctAnswerArray.reverse().join('')}`,
      currentIndex: this.data.currentIndex + 1,
      wrongQuestions: wqTmp,
      errorShake:true
    });
    setTimeout(() => {
      this.nextProblem();
    }, 1500);
    } else {
      this.setData({
        currentIndex: this.data.currentIndex + 1
      });
      this.nextProblem();
    }
  },
  beginProcess(){
    //计算动画所需要的值，然后依次播放
    if(this.data.operator=="+"){
      // 加法计算
      const addSteps = MathOperationAnalyzer.analyzeAddition(Number(this.data.num1Array.join("")), Number(this.data.num2Array.join("")));
      this.setData({
        processSteps:addSteps
      })
    }else{
      // 减法计算
      const subSteps = MathOperationAnalyzer.analyzeSubtraction(Number(this.data.num1Array.join("")), Number(this.data.num2Array.join("")));
      this.setData({
        processSteps:subSteps
      })
    }
    this.setData({
      processOfProblemIndex:0
    })
    this.processOfProblem()
  },
  processOfProblem(){
    var index = this.data.processOfProblemIndex
    var maxProcess = this.data.processSteps.length
    if(index> maxProcess) return;
    var step = this.data.processSteps[this.data.processSteps.length - 1 - index]

    this.setData({
      currentStep:step
    })
    console.log(step)
      var a = this.data.correctAnswerArray[index]
      //选择第一个数的计算位
      setTimeout(() => {this.setData({num1Selected: this.data.num1Array.length-1-index})}, 100);

      //选择第二个数的计算位
      setTimeout(() => {this.setData({num2Selected: this.data.num2Array.length-1-index})}, 800);

      // if(step.operation == "subtraction"){
      //   //是否需要借位？
      //   if(step.borrowIn != 0){
      //     var b_step = this.data.processSteps[this.data.processSteps.length - 2 - index]
      //     console.log(b_step)
      //   }
      //   //是否有借位？
      // }else{

      // }


      //清空选择位
      setTimeout(() => {this.setData({num2Selected: 10000,num1Selected: 10000,})}, 1600);
      this.setData({
        processOfProblemIndex:this.data.processOfProblemIndex+1
      })
  }, 

  beginPrint(e){
    if(e.detail.total){
      this.setData({
        currentTotal:e.detail.total,
      });
    }
    var pros = []
    for (let index = 0; index < this.data.currentTotal; index++) {
      pros.push(getAddSubProblemShu())      
    }
    console.log(pros)
    this.setData({
      problemList:pros,
      showWherePage:3
    })
  },
  goPrint(){
    if(this.data.problemList && this.data.problemList.length>0){
      wx.setStorageSync("problemList",JSON.stringify(this.data.problemList))
      wx.navigateTo({
        url: '/pages/arithmetic/arithmetic'
      })
    }else{
      wx.showToast({
        title: '先生成题目',
        icon: 'error',
        duration: 2000
      })
    }
  },
  // onShareAppMessage() {
  //   return {
  //     title: '一起来练习加法竖式吧！',
  //     path: '/pages/compute/addSub/index',
  //   }
  //  },
})