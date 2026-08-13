import { getComplexMultipProblem } from '../../../utils/util';
import { recordPracticeResult } from '../../../utils/practiceStats';
import { getPracticeSettings, savePracticeSettings } from '../../../utils/practiceSettings';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isWrong: false,
    processOfProblemIndex : 0,

    currentTotal: 50,
    currentIndex: 1,
    wrongQuestions:[],
    showWherePage:0,

    userAnswer : "",
    timer: 0,
    debounce_time:700,
    autoNext:true,
    answerChecked:false,
    inputFocus:false,
    errorShake: false,
    nums: [2,3,4,5,6,7,8,9],
    problemList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const settings = getPracticeSettings(this.data.debounce_time);
    this.setData({
      debounce_time: settings.delay,
      autoNext: settings.autoNext
    });
  },


  startTest(e) {    
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
    const settings = getPracticeSettings(this.data.debounce_time);
    this.setData({
      currentTotal:e.detail.total,
      currentIndex: 1,
      wrongQuestions: [],
      answerChecked:false,
      debounce_time: settings.delay,
      autoNext: settings.autoNext,
      feedbackMessage:"",
      userAnswer:"",
      errorShake:false,
      timer: 0,
      showWherePage: 1
    });
    this.generateNewProblem();
  },

  generateNewProblem() {
    let p_obj = getComplexMultipProblem()
    this.setData({
      currentProblem: p_obj.problem,
      correctAnswer: p_obj.answer,
      inputFocus: true
    });
  },
 
  inputChange(e) {
    const _userAnswer = parseInt(e.detail.value);
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }

    const debounceTimer = this.data.autoNext ? setTimeout(() => {
      this.checkAnswer();
    }, this.data.debounce_time) : 0;

    this.setData({
      userAnswer: _userAnswer,
      timer: debounceTimer
    });
  },

  
  checkAnswer() {
    if (this.data.answerChecked) return;
    if (isNaN(this.data.userAnswer)) {
      this.setData({
        userAnswer: "",
        feedbackMessage: "先写下答案，再来验证吧"
      });
    } else if (this.data.userAnswer === this.data.correctAnswer) {
      recordPracticeResult(true)
      this.setData({
        feedbackMessage: this.data.autoNext ? "答对了，真棒！" : "答对了，点下一题继续",
        currentIndex: this.data.currentIndex + 1,
        answerChecked:true
      });
      if (this.data.autoNext) setTimeout(() => {
        this.nextProblem();
      }, 650);
    } else {
      recordPracticeResult(false)
      var wqTmp = this.data.wrongQuestions
      wqTmp.push({"question": this.data.currentProblem,"yourAnswer": this.data.userAnswer,"correctAnswer": this.data.correctAnswer})
      this.setData({
        feedbackMessage: `这题先记下来，正确答案是 ${this.data.correctAnswer}`,
        currentIndex: this.data.currentIndex + 1,
        wrongQuestions: wqTmp,
        answerChecked:true,
        errorShake:true
      });
      if (this.data.autoNext) setTimeout(() => {
        this.nextProblem();
      }, 1800);
    }
  },

  nextProblem() {
    this.setData({
      feedbackMessage:"",
      userAnswer: "",
      answerChecked:false,
      errorShake:false
    });

    if (this.data.currentIndex > this.data.currentTotal) {
      this.finishQuiz();
    } else {
      this.generateNewProblem();
    }
  },
  changePracticeSettings(e) {
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
    const settings = savePracticeSettings({
      delay: e.detail.delay,
      autoNext: e.detail.autoNext
    });
    this.setData({
      debounce_time: settings.delay,
      autoNext: settings.autoNext,
      timer: 0
    });
  },

  finishQuiz() {
    this.setData({
      showWherePage: 2
    });
  },
  restartQuiz() {
    this.setData({
      showWherePage: 0,
      feedbackMessage:"",
      userAnswer:"",
      answerChecked:false,
      errorShake:false,
      timer: 0
    });
  },
  beginPrint(e){
    if(e.detail.total){
      this.setData({
        currentTotal:e.detail.total,
      });
    }
    var pros = []
    for (let index = 0; index < this.data.currentTotal; index++) {
      pros.push(getComplexMultipProblem())      
    }
    console.log(pros)
    this.setData({
      problemList:pros,
      showWherePage:3
    })
  },
  // onShareAppMessage() {
  //   return {
  //     title: '一起来练习乘法计算吧！',
  //     path: '/pages/compute/mixMultip/index',
  //   }
  //  },
})
