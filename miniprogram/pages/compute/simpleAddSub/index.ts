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
    debounce_time: 700,
    errorShake: false,
    wrongQuestions: [],
    feedbackMessage: "",
    showWherePage: 0
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

  generateNewProblem() {
    const isAddition = Math.random() > 0.5;
    let num1, num2, _currentProblem, _correctAnswer;

    if (isAddition) {
      num1 = Math.floor(Math.random() * this.data.currentRange) + 1;
      num2 = Math.floor(Math.random() * (this.data.currentRange - num1)) + 1;
      _currentProblem = `${num1} + ${num2} = `;
      _correctAnswer = num1 + num2;
    } else {
      num1 = Math.floor(Math.random() * this.data.currentRange) + 1;
      num2 = Math.floor(Math.random() * num1);
      _currentProblem = `${num1} - ${num2} = `;
      _correctAnswer = num1 - num2;
    }

    this.setData({
      currentProblem: _currentProblem,
      correctAnswer: _correctAnswer,
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
        feedbackMessage: "😏答对了！",
        currentIndex: this.data.currentIndex + 1
      });
      this.nextProblem();
    } else {
      var wqTmp = this.data.wrongQuestions
      wqTmp.push({"question": this.data.currentProblem,"yourAnswer": this.data.userAnswer,"correctAnswer": this.data.correctAnswer})
      this.setData({
        feedbackMessage: `😢答错了！正确答案是 ${this.data.correctAnswer}`,
        currentIndex: this.data.currentIndex + 1,
        wrongQuestions: wqTmp
      });
     
      setTimeout(() => {
        this.nextProblem();
      }, 800);
    }
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

  restartQuiz() {
    this.setData({
      showWherePage: 0,
      currentProblem: "请选择难度开始练习"
    });
  }
});