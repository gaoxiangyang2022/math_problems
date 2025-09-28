import { getMultipProblem } from '../../../utils/util';
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
    inputFocus:false,
    errorShake: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {

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

  generateNewProblem() {
    let p_obj = getMultipProblem()
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

})