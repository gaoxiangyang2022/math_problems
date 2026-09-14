import { getComplexAddSubProblem } from '../../../utils/util';
import { recordPracticeResult } from '../../../utils/practiceStats';
import { getPracticeSettings, savePracticeSettings } from '../../../utils/practiceSettings';
import { showFloatingFeedback } from '../../../utils/feedback';
import { createPracticeTimer, formatDuration } from '../../../utils/practiceTimer';
Page({
  data: {
    currentRange: 10,
    currentTotal: 50,
    currentProblem: "请选择难度开始练习",
    problemHis:[],
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
    sessionTimeText: ''
  },
  onLoad() {
    this.practiceTimer = createPracticeTimer();
    this.problemTimer = createPracticeTimer();
    const settings = getPracticeSettings(this.data.debounce_time);
    this.setData({
      debounce_time: settings.delay,
      autoNext: settings.autoNext
    });
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
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
    const settings = getPracticeSettings(this.data.debounce_time);
    this.setData({
      currentRange:e.detail.range,
      currentTotal:e.detail.total,
      currentIndex: 1,
      wrongQuestions: [],
      answerChecked: false,
      debounce_time: settings.delay,
      autoNext: settings.autoNext,
      feedbackMessage: "",
      userAnswer: "",
      errorShake: false,
      timer: 0,
      sessionTimeText: "",
      showWherePage: 1
    });
    // 重新开始一场练习：总用时从 0 开始
    this.resetPracticeTimer();
    this.startPracticeTimer();
    this.generateNewProblem();
  },

  generateNewProblem() {
    let p_obj = getComplexAddSubProblem(this.data.currentRange)
    this.setData({
      currentProblem: p_obj.problem,
      correctAnswer: p_obj.answer,
      inputFocus: true,
    });
    // 新的一题：单题用时重新开始
    this.startProblemTimer();
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
      showFloatingFeedback('🙂 先输入答案', 1200)
      this.setData({
        userAnswer: ""
      });
    } else if (this.data.userAnswer === this.data.correctAnswer) {
      recordPracticeResult(true)
      this.stopProblemTimer();
      showFloatingFeedback(this.data.autoNext ? '🎉 答对啦' : '🎉 答对啦', 1200)
      this.setData({
        answerChecked: true
      });
      if (this.data.autoNext) setTimeout(() => {
        this.nextProblem();
      }, 650);
    } else {
      recordPracticeResult(false)
      this.stopProblemTimer();
      var wqTmp = this.data.wrongQuestions
      wqTmp.push({"question": this.data.currentProblem,"yourAnswer": this.data.userAnswer,"correctAnswer": this.data.correctAnswer})
      showFloatingFeedback(`😢 答案：${this.data.correctAnswer}`, 1600)
      this.setData({
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
    if (this.data.currentIndex >= this.data.currentTotal) {
      this.finishQuiz();
      return;
    }
    this.setData({
      feedbackMessage:"",
      userAnswer: "",
      answerChecked: false,
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
    // 练习结束：停止计时并记录总用时
    const elapsed = this.stopPracticeTimer();
    this.setData({
      showWherePage: 2,
      sessionTimeText: formatDuration(elapsed)
    });
  },

  restartQuiz() {
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
    this.problemTimer.reset();
    this.resetPracticeTimer();
    this.setData({
      showWherePage: 0,
      currentProblem: "请选择难度开始练习",
      feedbackMessage: "",
      userAnswer: "",
      answerChecked: false,
      errorShake: false,
      timer: 0,
      sessionTimeText: ""
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
      pros.push(getComplexAddSubProblem(this.data.currentRange))      
    }
    console.log(pros)
    this.setData({
      problemList:pros,
      showWherePage:3
    })
  },
  // onShareAppMessage() {
  //   return {
  //     title: '一起来混合加减法计算吧！',
  //     path: '/pages/compute/mixAddSub/index',
  //   }
  //  },
});
