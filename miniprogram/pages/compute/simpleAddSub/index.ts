import { getAddSubProblem } from '../../../utils/util';
import { recordPracticeResult } from '../../../utils/practiceStats';
import { getPracticeSettings, savePracticeSettings } from '../../../utils/practiceSettings';
Page({
  data: {
    currentRange: 10,
    currentTotal: 50,
    currentProblem: "请选择难度开始练习",
    correctAnswer: 0,
    currentIndex: 1,
    userAnswer: "",
    inputFocus: false,
    lastInputTime: 0,
    timer: 0,
    debounce_time: 900,
    autoNext: true,
    answerChecked: false,
    errorShake: false,
    wrongQuestions: [],
    feedbackMessage: "",
    showWherePage: 0,
    problemList:[],
  },
  onLoad() {
    const settings = getPracticeSettings(this.data.debounce_time);
    this.setData({
      debounce_time: settings.delay,
      autoNext: settings.autoNext
    });
  },

  startTest(e) {
    this.setData({
      currentRange:e.detail.range,
      currentTotal:e.detail.total,
      currentIndex: 1,
      wrongQuestions: [],
      answerChecked: false,
      showWherePage: 1
    });
    this.generateNewProblem();
  },

  generateNewProblem() {
    let _p = getAddSubProblem(this.data.currentRange)
    this.setData({
      currentProblem: _p.problem,
      correctAnswer: _p.answer,
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
        feedbackMessage: "答对了，真棒！",
        currentIndex: this.data.currentIndex + 1,
        answerChecked: true
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
        answerChecked: true,
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
      answerChecked: false,
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
      currentProblem: "请选择难度开始练习"
    });
  }, 
  beginPrint(e){
    if(e.detail.total){
      this.setData({
        currentRange:e.detail.range,
        currentTotal:e.detail.total,
      });
    }
    var pros = []
    for (let index = 0; index < this.data.currentTotal; index++) {
      pros.push(getAddSubProblem(this.data.currentRange))      
    }
    console.log(pros)
    this.setData({
      problemList:pros,
      showWherePage:3
    })
  },
 
  /**
  * 用户点击右上角分享
  */
//  onShareAppMessage() {
//   return {
//     title: '一起来学习吧！',
//     path: '/pages/compute/simpleAddSub/index',
//   }
//  },
});
