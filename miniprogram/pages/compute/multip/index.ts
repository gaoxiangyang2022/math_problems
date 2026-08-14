import { getMultipProblem } from '../../../utils/util';
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
    let p_obj = getMultipProblem()
    this.setData({
      currentProblem: p_obj.problem,
      correctAnswer: p_obj.answer,
      inputFocus: true
    });
  },  
  inputChange(e) {
    this.setAnswerValue(e.detail.value);
  },

  inputDigit(e) {
    if (this.data.answerChecked) return;
    const nextValue = `${this.data.userAnswer || ''}${e.detail.value}`;
    this.setAnswerValue(nextValue);
  },

  backspaceDigit() {
    if (this.data.answerChecked) return;
    const value = `${this.data.userAnswer || ''}`;
    this.setAnswerValue(value.slice(0, -1));
  },

  clearAnswer() {
    if (this.data.answerChecked) return;
    this.setAnswerValue('');
  },

  setAnswerValue(value) {
    const valueText = `${value || ''}`;
    const _userAnswer = valueText === '' ? NaN : parseInt(valueText);
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }

    const debounceTimer = valueText !== '' ? setTimeout(() => {
      this.checkAnswer();
    }, this.data.debounce_time) : 0;

    this.setData({
      userAnswer: valueText === '' ? '' : _userAnswer,
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
    if (this.data.currentIndex >= this.data.currentTotal) {
      this.finishQuiz();
      return;
    }
    this.setData({
      feedbackMessage:"",
      userAnswer: "",
      answerChecked:false,
      errorShake:false,
      currentIndex: this.data.currentIndex + 1
    });

    this.generateNewProblem();
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
      currentProblem: "请选择题目开始练习",
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
      pros.push(getMultipProblem())      
    }
    console.log(pros)
    this.setData({
      problemList:pros,
      showWherePage:3
    })
  },
  // onShareAppMessage() {
  //   return {
  //     title: '一起来练习乘法口决吧！',
  //     path: '/pages/compute/multip/index',
  //   }
  //  },
})
