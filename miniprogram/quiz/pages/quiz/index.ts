// 乘法口诀 · 考一考（独立分包页面，语音包随分包一起加载）
import { formatDuration, createPracticeTimer } from '../../utils/practiceTimer'

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
    // 考一考只考 2~9 的乘法口诀（看口诀仍保留完整的 1~9）
    quizBaseNums: [2, 3, 4, 5, 6, 7, 8, 9],
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
    quizScope: 'all',        // all: 全表(2~9) / pick: 指定几个数字
    quizPickBases: [2, 3, 4],
    pickTabs: [],            // [{ num, picked }] 供"指定数字"直接渲染选中状态
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
    quizTimeText: '',
    // 本地语音包是否可用（决定要不要显示"再念一遍"按钮）
    hasQuestionAudio: true,
    // 提问中锁住页面滚动，否则滑动判定会带着整个页面一起滚
    pageStyle: ''
  },
  /** 提问中：整页锁死 + 内容居中，滑动手势不会被页面滚动吃掉 */
  ASK_PAGE_STYLE: 'height:100vh;overflow:hidden;',

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.practiceTimer = createPracticeTimer()
    this.isStaticPlayback = false
    // 本地语音包状态：有文件就能念题，没有就退回家长念题
    this.audioMissing = false
    this.applyAudioOptions()
    try {
      this.questionAudio = wx.createInnerAudioContext({ useWebAudioImplement: true })
      // 老版本基础库只看这个属性；2.3.0+ 由 wx.setInnerAudioOption 统一设置
      this.questionAudio.obeyMuteSwitch = false
      this.questionAudio.onError((res) => {
        // 语音包缺失（没放音频文件）时，自动隐藏"再念一遍"按钮
        const code = Number(res && res.errCode)
        if (!code || [1, 2, 3, 4].indexOf(code) >= 0) {
          this.audioMissing = true
          if (this.data.hasQuestionAudio) this.setData({ hasQuestionAudio: false })
        }
      })
    } catch (err) {
      this.questionAudio = null
      this.audioMissing = true
    }
    this.initData()
    this.refreshQuizIntro()
  },

  /** iOS 静音键下也要能出声：兜底再设一次（分包被独立打开时 app.onLaunch 可能已执行过，重复设置无副作用） */
  applyAudioOptions() {
    try {
      if (typeof wx.setInnerAudioOption === 'function') {
        wx.setInnerAudioOption({ obeyMuteSwitch: false, speakerOn: true, fail: () => {} })
      }
    } catch (err) {
      // 忽略老版本基础库
    }
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
   // 圆圈尺寸只算一次，切换选中状态时保持同一个尺寸
   this.pickTabSize = this.getPickTabSize()
   this.setData({
    multipData: _multipData,
    // 初始化"指定数字"的选中状态（圆圈尺寸按"一行四个"算好）
    pickTabs: this.buildPickTabs(this.data.quizPickBases, this.pickTabSize)
   })
    this.selectBase({ currentTarget: { dataset: { base: this.data.selectedBase } } })

  },

  // ============ 顶部切换：看口诀 / 考一考 ============
  switchTab(e) {
    const tab = `${e.currentTarget.dataset.tab}`
    if (tab === this.data.tab) return
    if (tab !== 'quiz') this.stopSpeak()
    const asking = tab === 'quiz' && this.data.quizPhase === 'asking'
    this.setData({
      tab,
      showExplanation: false,
      // 只有提问中的界面需要锁住页面滚动
      pageStyle: asking ? this.ASK_PAGE_STYLE : ''
    })
    if (asking) {
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

  /**
   * 把"数字是否被选中"提前算进数组，模板直接用
   * size 是每个圆圈的直径(rpx)：按屏幕宽度算出"一行四个"的正圆尺寸，
   * 这样宽高一致，不会因为屏幕宽窄被拉成椭圆
   */
  buildPickTabs(picked, size) {
    const selected = picked || this.data.quizPickBases || []
    const nums = this.data.quizBaseNums || [2, 3, 4, 5, 6, 7, 8, 9]
    return nums.map((num: number) => ({
      num,
      picked: selected.indexOf(num) >= 0,
      size: size || this.pickTabSize || 143
    }))
  },

  /**
   * 算出一行四个的正圆直径（单位 rpx，会自动跟着屏幕缩放）
   * 750rpx 就是屏幕宽度：减去页面左右内边距、卡片内边距、三个间距，再四等分
   */
  getPickTabSize() {
    return Math.max(100, Math.round((750 - 2 * 28 - 2 * 24 - 3 * 20) / 4))
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
    this.setData({
      quizPickBases: picked,
      // 选中状态同步刷新，保证点一下外观立刻变
      pickTabs: this.buildPickTabs(picked)
    })
    this.refreshQuizIntro()
  },

  /** 按当前选择算出这一轮会考哪些口诀（全表 = 2~9 的乘法口诀，共 36 句） */
  getQuizPairs() {
    const bases = this.data.quizScope === 'pick'
      ? (this.data.quizPickBases || []).slice().sort((a: number, b: number) => a - b)
      : [2, 3, 4, 5, 6, 7, 8, 9]
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
      : '考 2~9 全部口诀'
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
      quizTimeText: '',
      pageStyle: this.ASK_PAGE_STYLE
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
    // 口诀统一"小数在前"：显示 2 × 7，不显示 7 × 2
    const small = Math.min(pair.i, pair.j)
    const big = Math.max(pair.i, pair.j)
    const problem = {
      i: pair.i,
      j: pair.j,
      result: pair.i * pair.j,
      showAs: `${small} × ${big}`,
      askText: `${small}乘${big}`
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

  // ============ 提问模式：念题语音 ============
  /**
   * 只播放本地语音包，不请求任何在线接口
   * 语音包随分包一起放在 quiz/audio/multip/ 下，命名 ixj.mp3
   * （例如 2x7.mp3 读"二乘七等于十四"）
   * 没放文件时 onError 会把 audioMissing 置为 true，并自动隐藏"再念一遍"按钮
   */
  speakCurrentProblem() {
    const problem = this.data.currentProblem
    if (!problem) return
    this.playQuestion(problem)
  },

  replayQuestion() {
    if (this.audioMissing) {
      wx.showToast({ title: '请家长念题', icon: 'none' })
      return
    }
    const problem = this.data.currentProblem
    if (!problem) return
    this.playQuestion(problem)
  },

  getQuestionAudioPath(i, j) {
    // 绝对路径指向本分包内的语音包：只有进入考一考才会下载这部分资源
    return `/quiz/audio/multip/${i}x${j}.mp3`
  },

  playQuestion(problem) {
    if (!this.questionAudio || this.audioMissing || !problem) return
    const src = this.getQuestionAudioPath(problem.i, problem.j)
    this.isStaticPlayback = false
    try {
      // 保险起见每次播放前再确认一次静音开关设置（部分机型切前后台后会重置）
      if (this.questionAudio.obeyMuteSwitch !== false) {
        this.questionAudio.obeyMuteSwitch = false
      }
      this.questionAudio.stop()
      this.questionAudio.src = src
      this.questionAudio.play()
      this.isStaticPlayback = true
    } catch (err) {
      // 播放失败不影响答题，家长自己念题即可
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
    this.touchTriggered = false
  },

  /**
   * 卡片上的 touchmove 用 catch 绑定，阻止事件冒泡到页面，页面就不会跟着滚
   * 顺便在手指移动到位时就判定，滑动手感更跟手
   */
  onCardTouchMove(e) {
    if (this.touchTriggered || this.judging) return
    const start = this.touchStart
    const touch = e.touches && e.touches[0]
    if (!start || !touch) return
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    // 向上滑动（并且明显比横向多）= 答对
    if (dy <= -SWIPE_MIN_DISTANCE && Math.abs(dy) > Math.abs(dx)) {
      this.touchTriggered = true
      this.markAnswer(true)
      return
    }
    // 向右滑动（并且明显比纵向多）= 答错
    if (dx >= SWIPE_MIN_DISTANCE && Math.abs(dx) > Math.abs(dy)) {
      this.touchTriggered = true
      this.markAnswer(false)
    }
  },

  onCardTouchEnd(e) {
    const start = this.touchStart
    this.touchStart = null
    if (this.judging || this.touchTriggered) {
      this.touchTriggered = false
      return
    }
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
      queueLeft: 0,
      // 结果页要能上下滚动
      pageStyle: ''
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
      quizTimeText: '',
      pageStyle: ''
    })
    this.refreshQuizIntro()
  },

  onReady() {
    this.refreshQuizIntro()
  },

  // onShareAppMessage() {
  //   return {
  //     title: '一起来练习乘法口决吧！',
  //     path: '/quiz/pages/quiz/index',
  //   }
  //  },
})
