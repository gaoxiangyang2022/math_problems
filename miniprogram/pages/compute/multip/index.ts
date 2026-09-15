import { getMultipProblem, buildAnswerChoices, AnswerChoice } from '../../../utils/util';
import { recordPracticeResult } from '../../../utils/practiceStats';
import { getPracticeSettings, savePracticeSettings } from '../../../utils/practiceSettings';
import { showFloatingFeedback } from '../../../utils/feedback';
import { createPracticeTimer, formatDuration, formatPreciseDuration, averageSeconds } from '../../../utils/practiceTimer';

// 竞速判卷动画时间：只留一小段，让颜色变化能被看见
const SPEED_JUDGE_DELAY = 300
// 竞速模式下锁死页面滚动（含 iOS 下拉回弹）
const PAGE_LOCK_STYLE = 'height:100vh;overflow:hidden;'

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
    problemList:[],
    practiceMode: 'input',
    // 选择题 = 竞速模式：去掉动画、去掉提示，做完立刻下一题
    speedMode: false,
    answerChoices: [] as AnswerChoice[],
    selectedChoice: null as number | null,
    selectionLocked: false,
    sessionTimeText: '',
    avgTimeText: '',
    averageTimeText: '',
    // 竞速模式锁住页面滚动用
    pageStyle: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
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
    // 离开页面时确保页面滚动恢复，避免带到别的页面
    this.setData({ pageStyle: '' });
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

  /** 竞速模式：刷新顶部的"每题平均用时" */
  refreshAverage() {
    if (!this.data.speedMode) return
    const count = Math.max(Number(this.data.currentIndex) || 0, 0)
    if (!count) return
    const total = this.practiceTimer ? this.practiceTimer.getElapsed() : 0
    const avg = averageSeconds(total, count)
    this.setData({
      averageTimeText: `均 ${formatPreciseDuration(avg)}`
    })
  },

  /**
   * 竞速模式必须把页面本身也锁住：
   * 只在容器上写 overflow:hidden 挡不住 iOS 的下拉回弹，页面照样会被拖动
   */
  updatePageScrollLock(speedMode) {
    this.setData({ pageStyle: speedMode ? PAGE_LOCK_STYLE : '' })
  },


  startTest(e) {    
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
    const settings = getPracticeSettings(this.data.debounce_time);
    const speedMode = e.detail.mode === 'choice'
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
      practiceMode: speedMode ? 'choice' : 'input',
      speedMode,
      pageStyle: speedMode ? PAGE_LOCK_STYLE : '',
      selectedChoice: null,
      selectionLocked: false,
      answerChoices: [],
      sessionTimeText: "",
      avgTimeText: "",
      averageTimeText: "",
      showWherePage: 1
    });
    // 重新开始一场练习：总用时从 0 开始
    this.resetPracticeTimer();
    this.startPracticeTimer();
    this.generateNewProblem();
  },

  generateNewProblem() {
    let p_obj = getMultipProblem()
    this.setData({
      currentProblem: p_obj.problem,
      correctAnswer: p_obj.answer,
      inputFocus: true,
      selectedChoice: null,
      selectionLocked: false,
      answerChoices: this.data.practiceMode === 'choice' ? buildAnswerChoices(p_obj) : []
    });
    // 新的一题：单题用时重新开始
    this.startProblemTimer();
    this.refreshAverage();
  },  
  inputChange(e) {
    this.setAnswerValue(e.detail.value);
  },

  inputDigit(e) {
    if (this.data.answerChecked) return;
    if (this.data.practiceMode === 'choice') return;
    const nextValue = `${this.data.userAnswer || ''}${e.detail.value}`;
    this.setAnswerValue(nextValue);
  },

  backspaceDigit() {
    if (this.data.answerChecked) return;
    if (this.data.practiceMode === 'choice') return;
    const value = `${this.data.userAnswer || ''}`;
    this.setAnswerValue(value.slice(0, -1));
  },

  clearAnswer() {
    if (this.data.answerChecked) return;
    if (this.data.practiceMode === 'choice') return;
    this.setAnswerValue('');
  },

  /** 选择题模式：点选其中一个答案，选完立即判卷 */
  selectChoice(e) {
    if (this.data.answerChecked || this.data.selectionLocked) return;
    const value = Number(e.currentTarget.dataset.value);
    if (Number.isNaN(value)) return;
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
    this.setData({
      selectedChoice: value,
      selectionLocked: true,
      userAnswer: value,
      timer: 0
    });
    this.checkAnswer();
  },

  setAnswerValue(value) {
    if (this.data.practiceMode === 'choice') return;
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
      this.setData({
        answerChecked:true
      });
      if (this.data.speedMode) {
        // 竞速模式：不要提示、不要动画，直接下一题
        setTimeout(() => {
          this.nextProblem();
        }, SPEED_JUDGE_DELAY);
      } else {
        showFloatingFeedback(this.data.autoNext ? '🎉 答对啦' : '🎉 答对啦', 1200)
        if (this.data.autoNext) setTimeout(() => {
          this.nextProblem();
        }, 650);
      }
      this.refreshAverage();
    } else {
      recordPracticeResult(false)
      this.stopProblemTimer();
      var wqTmp = this.data.wrongQuestions
      wqTmp.push({"question": this.data.currentProblem,"yourAnswer": this.data.userAnswer,"correctAnswer": this.data.correctAnswer})
      this.setData({
        wrongQuestions: wqTmp,
        answerChecked:true,
        // 竞速模式不做抖动动画，省时间
        errorShake: !this.data.speedMode
      });
      if (this.data.speedMode) {
        setTimeout(() => {
          this.nextProblem();
        }, SPEED_JUDGE_DELAY);
      } else {
        showFloatingFeedback(`😢 答案：${this.data.correctAnswer}`, 1600)
        if (this.data.autoNext) setTimeout(() => {
          this.nextProblem();
        }, 1800);
      }
      this.refreshAverage();
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
      selectedChoice: null,
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
    // 练习结束：停止计时，算出每题平均用时
    const elapsed = this.stopPracticeTimer();
    const count = Math.max(Number(this.data.currentTotal) || Number(this.data.currentIndex) || 0, 0);
    const avg = averageSeconds(elapsed, count);
    this.setData({
      showWherePage: 2,
      sessionTimeText: formatDuration(elapsed),
      avgTimeText: count ? formatPreciseDuration(avg) : '',
      averageTimeText: count ? `均 ${formatPreciseDuration(avg)}` : '',
      // 结果页可以正常滚动
      pageStyle: ''
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
      currentProblem: "请选择题目开始练习",
      feedbackMessage:"",
      userAnswer:"",
      answerChecked:false,
      errorShake:false,
      selectedChoice: null,
      selectionLocked: false,
      answerChoices: [],
      timer: 0,
      sessionTimeText: "",
      avgTimeText: "",
      averageTimeText: "",
      pageStyle: ""
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
