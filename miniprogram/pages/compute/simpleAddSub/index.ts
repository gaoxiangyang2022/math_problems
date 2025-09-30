import { getAddSubProblem } from '../../../utils/util';
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
    errorShake: false,
    wrongQuestions: [],
    feedbackMessage: "",
    showWherePage: 0
  },
  startTest(e) {
    this.setData({
      currentRange:e.detail.range,
      currentTotal:e.detail.total,
      currentIndex: 1,
      wrongQuestions: [],
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
    const debounceTimer = setTimeout(() => {
      this.checkAnswer();
    }, this.data.debounce_time);
    this.setData({
      userAnswer: _userAnswer,
      timer: debounceTimer
    });
  },

  checkAnswer() {
    if (isNaN(this.data.userAnswer)) {
      this.setData({
        userAnswer: ""
      });
    } else if (this.data.userAnswer === this.data.correctAnswer) {
      this.setData({
        currentIndex: this.data.currentIndex + 1
      });
      this.nextProblem();
    } else {
      var wqTmp = this.data.wrongQuestions
      wqTmp.push({"question": this.data.currentProblem,"yourAnswer": this.data.userAnswer,"correctAnswer": this.data.correctAnswer})
      this.setData({
        feedbackMessage: `😢答错了！正确答案是 ${this.data.correctAnswer}`,
        currentIndex: this.data.currentIndex + 1,
        wrongQuestions: wqTmp,
        errorShake:true
      });
      setTimeout(() => {
        this.nextProblem();
      }, 1500);
    }
  },

  nextProblem() {
    this.setData({
      feedbackMessage:"",
      userAnswer: "",
      errorShake:false
    });

    if (this.data.currentIndex > this.data.currentTotal) {
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

  restartQuiz() {
    this.setData({
      showWherePage: 0,
      currentProblem: "请选择难度开始练习"
    });
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