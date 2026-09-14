// pages/compute/addSub/index.ts
import { isValidNumber,getAddSubProblemShu } from '../../../utils/util';
import { MathOperationAnalyzer, AdditionStep, SubtractionStep } from '../../../utils/MathOperationAnalyzer';
import { recordPracticeResult } from '../../../utils/practiceStats';
import { showFloatingFeedback } from '../../../utils/feedback';
import { createPracticeTimer, formatDuration } from '../../../utils/practiceTimer';
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
    answerChecked:false,
    operator:'+',
    userAnswer : "",
    processOfProblemIndex : 0,
    processSteps:[],
    currentStep:{},
    errorShake:false,
    problemList:[],
    sessionTimeText: ''
  },

  onLoad() {
    this.practiceTimer = createPracticeTimer();
    this.problemTimer = createPracticeTimer();
  },
  onUnload() {
    if (this.practiceTimer) this.practiceTimer.reset();
    if (this.problemTimer) this.problemTimer.reset();
  },
  onHide() {
    // 切到后台 / 离开页面时暂停计时
    const timerComponent = this.getTimerComponent();
    if (timerComponent && timerComponent.pauseTimer) timerComponent.pauseTimer();
  },
  onShow() {
    if (this.data.showWherePage !== 1) return;
    const timerComponent = this.getTimerComponent();
    if (timerComponent && timerComponent.startTimer) timerComponent.startTimer();
  },

  /** 页面里的进度条组件，负责计时显示 */
  getTimerComponent() {
    return this.selectComponent('#progressBar') as any;
  },
  startPracticeTimer() {
    this.practiceTimer.start();
    const timerComponent = this.getTimerComponent();
    if (timerComponent && timerComponent.startTimer) timerComponent.startTimer();
  },
  resetPracticeTimer() {
    this.practiceTimer.reset();
    const timerComponent = this.getTimerComponent();
    if (timerComponent && timerComponent.resetTimer) timerComponent.resetTimer();
  },
  stopPracticeTimer() {
    const elapsed = this.practiceTimer.stop();
    const timerComponent = this.getTimerComponent();
    if (timerComponent && timerComponent.stopTimer) timerComponent.stopTimer();
    return elapsed;
  },
  startProblemTimer() {
    this.problemTimer.reset();
    this.problemTimer.start();
    const timerComponent = this.getTimerComponent();
    if (timerComponent && timerComponent.startProblemTimer) timerComponent.startProblemTimer();
  },
  stopProblemTimer() {
    this.problemTimer.stop();
    const timerComponent = this.getTimerComponent();
    if (timerComponent && timerComponent.stopProblemTimer) timerComponent.stopProblemTimer();
  },

  startTest(e) {    
    this.setData({
      currentTotal:e.detail.total,
      currentIndex: 1,
      wrongQuestions: [],
      answerChecked:false,
      feedbackMessage:"",
      errorShake:false,
      sessionTimeText: "",
      showWherePage: 1
    });
    // 重新开始一场练习：总用时从 0 开始
    this.resetPracticeTimer();
    this.startPracticeTimer();
    this.generateNewProblem();
  },

  nextProblem() {
    if (this.data.currentIndex >= this.data.currentTotal) {
      this.setData({
        inputFocus: 100
      });
      this.finishQuiz();
      return;
    }
    this.setData({
      feedbackMessage: "",
      userAnswer: "",
      inputFocus: 0,
      answerChecked:false,
      errorShake:false,
      currentIndex: this.data.currentIndex + 1
    });

    this.generateNewProblem();
  },
  finishQuiz() {
    // 练习结束：停止计时并记录总用时
    const elapsed = this.stopPracticeTimer();
    this.setData({
      showWherePage: 2,
      sessionTimeText: formatDuration(elapsed)
    });
  },
  restartQuiz() {
    this.problemTimer.reset();
    this.resetPracticeTimer();
    this.setData({
      showWherePage: 0,
      answerChecked:false,
      feedbackMessage:"",
      errorShake:false,
      sessionTimeText: ""
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
      inputFocus: 0,
      answerChecked:false,
      operator: p.operator
    });
    // 新的一题：单题用时重新开始
    this.startProblemTimer();
  },

  selectInputCell(e) {
    const index = Number(e.currentTarget.dataset.index) || 0
    this.setData({ inputFocus: index })
  },

  inputDigit(e) {
    if (this.data.answerChecked) return
    const digit = Number(e.detail.value)
    if (!isValidNumber(`${digit}`)) return
    const userAnswerArray = [...this.data.userAnswerArray]
    const index = Math.min(Number(this.data.inputFocus) || 0, userAnswerArray.length - 1)
    userAnswerArray[index] = digit
    const nextFocus = Math.min(index + 1, userAnswerArray.length - 1)
    this.setData({
      userAnswerArray,
      inputFocus: nextFocus,
      feedbackMessage: "",
      errorShake: false
    })

    if (index === userAnswerArray.length - 1) {
      this.checkAnswer()
    }
  },

  backspaceDigit() {
    if (this.data.answerChecked) return
    const userAnswerArray = [...this.data.userAnswerArray]
    let index = Math.min(Number(this.data.inputFocus) || 0, userAnswerArray.length - 1)
    if (userAnswerArray[index] === null && index > 0) {
      index -= 1
    }
    userAnswerArray[index] = null
    this.setData({
      userAnswerArray,
      inputFocus: index,
      feedbackMessage: "",
      errorShake: false
    })
  },

  clearDigits() {
    if (this.data.answerChecked) return
    this.setData({
      userAnswerArray: this.data.correctAnswerArray.map(() => null),
      inputFocus: 0,
      feedbackMessage: "",
      errorShake: false
    })
  },

  
  checkAnswer() {
  if (this.data.answerChecked) return
  if (this.data.userAnswerArray.some((item) => item === null)) {
    showFloatingFeedback('🙂 先填完答案', 1200)
    this.setData({
      errorShake: true
    })
    return
  }

  const userAnswer = [...this.data.userAnswerArray].reverse().join('')
  const correctAnswer = [...this.data.correctAnswerArray].reverse().join('')
  if (userAnswer != correctAnswer) {
    recordPracticeResult(false)
    this.stopProblemTimer();
    var wqTmp = this.data.wrongQuestions
    wqTmp.push({"question": this.data.currentProblem,"yourAnswer": userAnswer,"correctAnswer": correctAnswer})
    showFloatingFeedback(`😢 答案：${correctAnswer}`, 1600)
    this.setData({
      wrongQuestions: wqTmp,
      answerChecked:true,
      errorShake:true
    });
    setTimeout(() => {
      this.nextProblem();
    }, 1500);
    } else {
      recordPracticeResult(true)
      this.stopProblemTimer();
      showFloatingFeedback('🎉 答对啦', 1200)
      this.setData({
        answerChecked:true
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
