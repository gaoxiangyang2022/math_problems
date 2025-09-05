// pages/compute/addSub/index.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num1Array:[4,2,5],
    num2Array:[6,1,2],
    correctAnswerArray:[1,0,3,7],
    userAnswerArray:[],
    showWherePage:0,
    currentRange: 10,
    currentTotal: 50,
    currentIndex: 1,
    wrongQuestions:[],
    operator:'+'
  },

  changeRange(e) {
    const { range } = e.currentTarget.dataset;
    this.setData({
      currentRange: range
    });
  },

  changeTotal(e) {
    const { total } = e.currentTarget.dataset;
    this.setData({
      currentTotal: total
    });
  },

  startTest() {
    this.setData({
      currentIndex: 1,
      wrongQuestions: [],
      showWherePage: 1
    });
    this.generateNewProblem();
  },

  nextProblem() {
    this.setData({
      userAnswer: ""
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
  generateNewProblem() {
    const isAddition = Math.random() > 0.5;
    let num1, num2, _currentProblem, _correctAnswer,_operator;
    // 生成2-4位随机数（10-9999）
    const getRandomNum = () => Math.floor(Math.random() * (9999 - 10 + 1)) + 10;
    num1 = getRandomNum();
    num2 = getRandomNum();

    if (isAddition) {
      _operator = "+"
      _currentProblem = `${num1} + ${num2} = `;
      _correctAnswer = num1 + num2;
    } else {
      _operator = "-"
       // 确保减法结果不为负
      if (num1 < num2) {
        var _n = num1
        num1 = num2
        num2 = _n
      }
      _currentProblem = `${num1} - ${num2} = `;
      _correctAnswer = num1 - num2;
    }

    const _num1Array = String(num1).split('').map(Number);
    const _num2Array = String(num2).split('').map(Number);
    const _correctAnswerArray = String(_correctAnswer).split('').map(Number);
    
    this.setData({
      currentProblem: _currentProblem,
      correctAnswer: _correctAnswer,
      num1Array: _num1Array,
      num2Array: _num2Array,
      correctAnswerArray: _correctAnswerArray,
      operator: _operator
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
})