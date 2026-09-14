// pages/compute/multipTab/index.ts
import { formatDuration, createPracticeTimer } from '../../../utils/practiceTimer'

const app = getApp()

const SWIPE_MIN_DISTANCE = 60      // 判定滑动的最小距离(px)
const FEEDBACK_MS = 380            // 判定结果动画时长
const RETRY_MIN_GAP = 3            // 错题至少隔几道题再出现
const RETRY_MAX_GAP = 6            // 错题最晚隔几道题再出现

/** 把数组打乱（Fisher-Yates） */
const shuffle = (list) => {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
  return arr
}

/** 随机取 [min, max] 之间的整数 */
const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1))

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // ---------- 学习模式 ----------
    multipData: [],
    tableNums: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    selectedBase: 2,
    selectedFacts: [],
    selectedFact: null,
    groupData: [],
    showExplanation:false,
    explanationHeader : "点击乘法口诀查看解释",
    explanationText: "",
    groupCount: 0,
    perGroupCount: 0,
    selectedIndex: 0,
    scrollLeft:0,

    // ---------- 提问模式 ----------
    tab: 'study',            // study: 看口诀  quiz: 考一考
    quizReady: false,        // 提问模式的选择界面
    quizPhase: 'setup',      // setup: 选择范围 / asking: 提问中 / result: 本轮结果
    quizScope: 'all',        // all: 全表(1~9) / pick: 指定几个数字
    quizPickBases: [2, 3, 4],
    quizIntro: '',
    currentProblem: null,    // { i, j, result, showAs, askText }
    queueLeft: 0,
    queueTotal: 0,
    answeredCount: 0,
    correctCount: 0,
    wrongStrikeCount: 0,
    mistakeList: [],         // [{ key, showAs, text, answerText, wrongCount }]
    correctPile: [],
    cardState: '',
    quizTimeText: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.practiceTimer = createPracticeTimer()
    this.buildIds = 'multipTabQuiz'
    this.ttsPlayTried = false
    this.isStaticPlayback = false
    try {
      this.questionAudio = wx.createInnerAudioContext({ useWebAudioImplement: true })
      this.questionAudio.onError(() => {
        // 设备不支持朗读或域名未配置时，静默失败，不打扰家长
        this.ttsPlayTried = false
      })
    } catch (err) {
      this.questionAudio = null
    }
    this.initData()
    this.refreshQuizIntro()
  },

  onHide() {
    this.stopSpeak()
    if (this.practiceTimer && this.data.quizPhase === 'asking') {
      this.practiceTimer.pause()
    }
  },

  onShow() {
    if (this.practiceTimer && this.data.quizPhase === 'asking') {
      this.practiceTimer.start()
    }
  },

  onUnload() {
    this.stopSpeak()
    if (this.questionAudio) {
      this.questionAudio.destroy()
      this.questionAudio = null
    }
  },

  initData() {
    // 生成乘法口诀表
    let _multipData = []
    for (let i = 1; i <= 9; i++) {
      let _multipData_line = []
      for (let j = i; j <= 9; j++) {
          _multipData_line.push({t:`${i}×${j}`,i:i,j:j,result:i*j})
      }
      _multipData.push(_multipData_line)
    }
   this.setData({
    multipData: _multipData
   })
    this.selectBase({ currentTarget: { dataset: { base: this.data.selectedBase } } })

  },

  // ============ 顶部切换：看口诀 / 考一考 ============
  switchTab(e) {
    const tab = `${e.currentTarget.dataset.tab}`
    if (tab === this.data.tab) return
    if (tab !== 'quiz') this.stopSpeak()
    this.setData({
      tab,
      showExplanation: false
    })
    if (tab === 'quiz' && this.data.quizPhase === 'asking') {
      this.speakCurrentProblem()
    }
  },

  // ============ 看口诀（原有功能） ============
  selectBase(e) {
    const base = Number(e.currentTarget.dataset.base) || 2
    const selectedFacts = []
    for (let j = 1; j <= 9; j++) {
      selectedFacts.push({
        t: `${base} × ${j} = ${base * j}`,
        i: base,
        j,
        result: base * j
      })
    }
    this.setData({
      selectedBase: base,
      selectedFacts,
      showExplanation: false,
      selectedFact: null,
      groupData: []
    })
  },

  showFactExplanation(e) {
    const index = Number(e.currentTarget.dataset.index) || 0
    const fact = this.data.selectedFacts[index]
    if (!fact) return
    this.renderExplanation(fact, index)
  },

  showExplanation(e){
    const { i,j} = e.currentTarget.dataset;
    const fact = {
      i: Number(i),
      j: Number(j),
      result: Number(i) * Number(j)
    }
    this.renderExplanation(fact, 0)
  },

  renderExplanation(fact, index) {
    const emojis = [...app.globalData.emojiArray].sort(()=>Math.random()-0.5)
    const i = Number(fact.i)
    const j = Number(fact.j)
    const result = i * j
    let _GroupData = []
    for (let i1 = 0; i1 < i; i1++) {
      let _bunnyData = []
        for (let j1 = 0; j1 < j; j1++) {
          _bunnyData.push({t:emojis[i1]})
        }
        _bunnyData.push({t:`${i1+1}组`,label:true})
        _GroupData.push(_bunnyData)
    }
    this.setData({
      groupData:_GroupData,
      showExplanation:true,
      explanationHeader:`${i} × ${j} = ${result}`,
      explanationText: `${i} 组，每组 ${j} 个，一共 ${result} 个`,
      groupCount: i,
      perGroupCount: j,
      selectedIndex: index,
      selectedFact: fact
    })

    setTimeout(() => {
      this.setData({
        scrollLeft: 100
      });

      setTimeout(() => {
        this.setData({
          scrollLeft: 0
        });
      }, 1500);
    }, 1000);
  },

  prevFact() {
    const nextIndex = Math.max(this.data.selectedIndex - 1, 0)
    const fact = this.data.selectedFacts[nextIndex]
    if (!fact) return
    this.renderExplanation(fact, nextIndex)
  },

  nextFact() {
    const nextIndex = Math.min(this.data.selectedIndex + 1, this.data.selectedFacts.length - 1)
    const fact = this.data.selectedFacts[nextIndex]
    if (!fact) return
    this.renderExplanation(fact, nextIndex)
  },

  closeExplanation(){
    this.setData({showExplanation:false})
  },

  // ============ 提问模式：设置 ============
  changeQuizScope(e) {
    const scope = `${e.currentTarget.dataset.scope}` === 'pick' ? 'pick' : 'all'
    this.setData({ quizScope: scope })
    this.refreshQuizIntro()
  },

  toggleQuizBase(e) {
    const base = Number(e.currentTarget.dataset.base)
    if (!base) return
    const picked = [...(this.data.quizPickBases || [])]
    const index = picked.indexOf(base)
    if (index >= 0) {
      if (picked.length <= 1) {
        wx.showToast({ title: '至少留一个数字', icon: 'none' })
        return
      }
      picked.splice(index, 1)
    } else {
      picked.push(base)
    }
    picked.sort((a: number, b: number) => a - b)
    this.setData({ quizPickBases: picked })
    this.refreshQuizIntro()
  },

  /** 按当前选择算出这一轮会考哪些口诀 */
  getQuizPairs() {
    const bases = this.data.quizScope === 'pick'
      ? (this.data.quizPickBases || []).slice().sort((a: number, b: number) => a - b)
      : [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const pairs = []
    bases.forEach((i: number) => {
      for (let j = i; j <= 9; j++) {
        pairs.push({ i, j, key: `${i}x${j}` })
      }
    })
    return pairs
  },

  refreshQuizIntro() {
    const pairs = this.getQuizPairs()
    const baseText = this.data.quizScope === 'pick'
      ? `只考 ${(this.data.quizPickBases || []).join('、')} 的口诀`
      : '考 1~9 全部口诀'
    this.setData({
      quizIntro: `${baseText}，共 ${pairs.length} 句口诀。孩子答对就向上滑，答错就向右滑；答错的会隔几题再来一次，全部答对才结束。`
    })
  },

  startQuiz() {
    const pairs = this.getQuizPairs()
    if (!pairs.length) {
      wx.showToast({ title: '先选一个数字', icon: 'none' })
      return
    }
    this.practiceTimer.reset()
    this.practiceTimer.start()
    const queue = shuffle(pairs)
    this.setData({
      quizPhase: 'asking',
      queueTotal: queue.length,
      queueLeft: queue.length,
      answeredCount: 0,
      correctCount: 0,
      wrongStrikeCount: 0,
      mistakeList: [],
      correctPile: [],
      cardState: '',
      quizTimeText: ''
    }, () => {
      this.nextQuestion(queue)
    })
  },

  // ============ 提问模式：出题 ============
  /**
   * 随机从待问队列里抽一题（不是按顺序，避免孩子顺着背）
   * @param pendingQueue 可选的待问队列，默认用页面状态里的
   */
  nextQuestion(pendingQueue?) {
    const queue = pendingQueue || this.quizQueue || []
    this.quizQueue = queue
    this.updateQueueStats()
    if (!queue.length) {
      this.finishRound()
      return
    }
    // 随机抽一道，保证"随机出题"
    const pickIndex = randomInt(0, queue.length - 1)
    const pair = queue.splice(pickIndex, 1)[0]
    const showAs = Math.random() < 0.5 ? `${pair.i} × ${pair.j}` : `${pair.j} × ${pair.i}`
    const problem = {
      i: pair.i,
      j: pair.j,
      result: pair.i * pair.j,
      showAs,
      askText: `${pair.i}乘${pair.j}`
    }
    this.setData({
      currentProblem: problem,
      cardState: ''
    })
    this.updateQueueStats()
    this.speakCurrentProblem()
  },

  updateQueueStats() {
    const queue = this.quizQueue || []
    this.setData({
      queueLeft: queue.length + (this.data.currentProblem ? 1 : 0)
    })
  },

  // ============ 提问模式：朗读题目 ============
  speakCurrentProblem() {
    const problem = this.data.currentProblem
    if (!problem) return
    this.playQuestion(`${problem.i}乘${problem.j}等于多少`)
  },

  replayQuestion() {
    const problem = this.data.currentProblem
    if (!problem) return
    this.playQuestion(`${problem.i}乘${problem.j}等于多少`)
  },

  playQuestion(text) {
    if (!this.questionAudio || !text) return
    const url = `https://tsn.baidu.com/text2audio?tex=${encodeURIComponent(text)}&lan=zh&cuid=${this.buildIds}&ctp=1&per=0&spd=4&pit=5&vol=6&aue=3`
    this.isStaticPlayback = false
    try {
      this.questionAudio.stop()
      this.questionAudio.src = url
      this.questionAudio.play()
      this.isStaticPlayback = true
      this.ttsPlayTried = true
    } catch (err) {
      // 朗读不可用时，家长自己念题即可，卡片上一直有题目
      this.isStaticPlayback = false
    }
  },

  stopSpeak() {
    if (!this.questionAudio || !this.isStaticPlayback) return
    try {
      this.questionAudio.stop()
    } catch (err) {
      // 忽略停止失败
    }
    this.isStaticPlayback = false
  },

  // ============ 提问模式：手势判定 ============
  onCardTouchStart(e) {
    const touch = e.touches && e.touches[0]
    if (!touch) return
    this.touchStart = { x: touch.clientX, y: touch.clientY }
  },

  onCardTouchEnd(e) {
    if (this.judging) return
    const start = this.touchStart
    this.touchStart = null
    const touch = e.changedTouches && e.changedTouches[0]
    if (!start || !touch) return
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y

    // 向上滑动 = 答对
    if (dy <= -SWIPE_MIN_DISTANCE && Math.abs(dy) > Math.abs(dx)) {
      this.markAnswer(true)
      return
    }
    // 向右滑动 = 答错
    if (dx >= SWIPE_MIN_DISTANCE && Math.abs(dx) > Math.abs(dy)) {
      this.markAnswer(false)
      return
    }
  },

  /** 按钮备用：答对 */
  tapCorrect() {
    this.markAnswer(true)
  },

  /** 按钮备用：答错 */
  tapWrong() {
    this.markAnswer(false)
  },

  /**
   * 判定当前这一题
   * @param isCorrect 家长判定：孩子是否答对
   */
  markAnswer(isCorrect) {
    if (this.data.quizPhase !== 'asking' || this.judging) return
    const problem = this.data.currentProblem
    if (!problem) return

    this.judging = true
    this.stopSpeak()

    if (isCorrect) {
      // 答对：收进"已答对"堆
      const correctPile = [problem].concat(this.data.correctPile || []).slice(0, 3)
      this.setData({
        cardState: 'correct',
        correctPile,
        correctCount: this.data.correctCount + 1,
        answeredCount: this.data.answeredCount + 1
      })
      setTimeout(() => {
        this.judging = false
        // 本题已从队列取出，直接问下一题
        this.nextQuestion()
      }, FEEDBACK_MS)
      return
    }

    // 答错：计入错题本，并把这道题重新放回队列（隔几题之后再出现）
    const key = `${problem.i}x${problem.j}`
    const mistakeList = (this.data.mistakeList || []).map((item) => ({ ...item }))
    const existIndex = mistakeList.findIndex((item) => item.key === key)
    if (existIndex >= 0) {
      mistakeList[existIndex].wrongCount += 1
    } else {
      mistakeList.push({
        key,
        showAs: problem.showAs,
        text: `${problem.showAs} = ?`,
        answerText: `${problem.showAs} = ${problem.result}`,
        i: problem.i,
        j: problem.j,
        result: problem.result,
        wrongCount: 1
      })
    }
    mistakeList.sort((a, b) => b.wrongCount - a.wrongCount)

    const queue = this.quizQueue || []
    const gap = randomInt(RETRY_MIN_GAP, RETRY_MAX_GAP)
    // 放到后面的位置，保证"接下来的题目中重复出现"；队列里还有别的题时至少隔一道
    const insertAt = Math.max(1, Math.min(queue.length, gap))
    queue.splice(insertAt, 0, { i: problem.i, j: problem.j, key: problem.key || key })

    this.setData({
      cardState: 'wrong',
      mistakeList,
      wrongStrikeCount: this.data.wrongStrikeCount + 1,
      answeredCount: this.data.answeredCount + 1
    })
    setTimeout(() => {
      this.judging = false
      this.nextQuestion(queue)
    }, FEEDBACK_MS)
  },

  // ============ 提问模式：本轮结果 ============
  finishRound() {
    const elapsed = this.practiceTimer.stop()
    this.setData({
      quizPhase: 'result',
      currentProblem: null,
      cardState: '',
      quizTimeText: formatDuration(elapsed),
      queueLeft: 0
    })
    // 题目可能中途改过范围，回到设置页时文案保持同步
    this.refreshQuizIntro()
  },

  /** 再来一轮（换一批随机顺序，错题重新开始统计） */
  restartQuiz() {
    this.practiceTimer.reset()
    this.startQuiz()
  },

  /** 回到提问设置 */
  backToQuizSetup() {
    this.stopSpeak()
    this.practiceTimer.reset()
    this.quizQueue = []
    this.judging = false
    this.setData({
      quizPhase: 'setup',
      currentProblem: null,
      cardState: '',
      queueLeft: 0,
      quizTimeText: ''
    })
    this.refreshQuizIntro()
  },

  onReady() {
    this.refreshQuizIntro()
  },

  // onShareAppMessage() {
  //   return {
  //     title: '一起来练习乘法口决吧！',
  //     path: '/pages/compute/multipTab/index',
  //   }
  //  },
})
