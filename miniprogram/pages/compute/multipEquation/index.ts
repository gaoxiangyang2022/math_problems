// pages/compute/addSub/index.ts
import { isValidNumber,getMultipProblemShu } from '../../../utils/util';
import { multiplicationSteps } from '../../../utils/multipTools';
import { recordPracticeResult } from '../../../utils/practiceStats';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num1Array:[4,2,5],
    num2Array:[6,1,2],
    num1Selected :10000,
    num2Selected :10000,
    correctAnswerArray:[1,0,3,7],
    correctAnimationArray:[],
    userAnswerArray:[0],
    showWherePage:0,
    currentTotal: 50,
    currentIndex: 1,
    wrongQuestions:[],
    focus1:0,
    focus2:0,
    focus3:100,
    operator:'*',
    userAnswer : "",
    processSteps:[],
    answerGrid:[],
    activeRowId:'row-0',
    activeRowLabel:'第 1 行：用乘数个位去乘',
    checked:false,
    checkResult:{},
    nullChar:'',
    problemList:[]
  },

  startTest(e) {    
    this.setData({
      currentTotal:e.detail.total,
      currentIndex: 1,
      wrongQuestions: [],
      feedbackMessage:"",
      checked:false,
      checkResult:{},
      showWherePage: 1
    });
    this.generateNewProblem();
  },

  nextProblem() {
    if (this.data.currentIndex >= this.data.currentTotal) {
      this.finishQuiz();
      return;
    }
    this.setData({
      feedbackMessage: "",
      userAnswer: "",
      focus1:0,
      focus2:0,
      activeRowId:'row-0',
      activeRowLabel:'第 1 行：用乘数个位去乘',
      checkResult:{},
      checked:false,
      processSteps:[],
      answerGrid:[],
      nullChar:'',
      currentIndex: this.data.currentIndex + 1
    });

    this.generateNewProblem();
  },
  finishQuiz() {
    this.setData({
      showWherePage: 2
    });
  },
  restartQuiz() {
    this.setData({
      showWherePage: 0
    });
  },
  generateNewProblem() {
    let _p = getMultipProblemShu()
    const o = multiplicationSteps(_p.num1,_p.num2)
    console.log(o)

    this.setData({
      processSteps:o.steps,
      answerGrid: this.createAnswerGrid(o.steps, _p.answerArray),
      activeRowId:'row-0',
      activeRowLabel:this.getRowLabel(0, o.steps),
      focus2:o.steps[0].detailSteps.length-1,
      currentProblem: _p.problem,
      correctAnswer: _p.answer,
      num1Array: _p.num1Array,
      num2Array: _p.num2Array,
      correctAnswerArray: _p.answerArray,
      userAnswerArray: _p.answerArray.map(() => null),
    });
  },

  createAnswerGrid(steps, answerArray) {
    const rows = steps.map((step) => step.detailSteps.map(() => null))
    rows.push(answerArray.map(() => null))
    return rows
  },

  selectInputCell(e) {
    if (this.data.checked) return
    const rowIndex = Number(e.currentTarget.dataset.index1) || 0
    this.setData({
      focus1: rowIndex,
      focus2: Number(e.currentTarget.dataset.index2) || 0,
      activeRowId: this.getRowId(rowIndex),
      activeRowLabel: this.getRowLabel(rowIndex),
      feedbackMessage:""
    })
  },

  getRowId(rowIndex) {
    return rowIndex >= this.data.processSteps.length ? 'sum-zone' : `row-${rowIndex}`
  },

  getRowLabel(rowIndex, stepsParam?) {
    const steps = stepsParam || this.data.processSteps
    if (rowIndex >= steps.length) {
      return '最终答案：把中间结果加起来'
    }
    const step = steps[rowIndex]
    const placeNames = ['个位', '十位', '百位', '千位', '万位']
    const placeName = placeNames[step.shiftPosition] || `第 ${step.shiftPosition + 1} 位`
    return `第 ${rowIndex + 1} 行：用乘数${placeName} ${step.multiplier} 去乘`
  },

  moveToNextCell(rowIndex, cellIndex) {
    let nextRow = rowIndex
    let nextCell = cellIndex - 1
    if (nextCell < 0) {
      nextRow = rowIndex + 1
      if (this.data.answerGrid.length <= nextRow) {
        return { row: rowIndex, cell: cellIndex, done: true }
      }
      nextCell = this.data.answerGrid[nextRow].length - 1
    }
    return { row: nextRow, cell: nextCell, done: false }
  },

  inputDigit(e) {
    if (this.data.checked) return
    const digit = Number(e.detail.value)
    if (!isValidNumber(`${digit}`)) return
    const answerGrid = this.data.answerGrid.map((row) => [...row])
    const rowIndex = Math.min(Number(this.data.focus1) || 0, answerGrid.length - 1)
    const cellIndex = Math.min(Number(this.data.focus2) || 0, answerGrid[rowIndex].length - 1)
    answerGrid[rowIndex][cellIndex] = digit
    const next = this.moveToNextCell(rowIndex, cellIndex)
    this.setData({
      answerGrid,
      focus1: next.row,
      focus2: next.cell,
      activeRowId: this.getRowId(next.row),
      activeRowLabel: this.getRowLabel(next.row),
      feedbackMessage:""
    })
    if (next.done) {
      this.onKeypadSubmit()
    }
  },

  backspaceDigit() {
    if (this.data.checked) return
    const answerGrid = this.data.answerGrid.map((row) => [...row])
    let rowIndex = Math.min(Number(this.data.focus1) || 0, answerGrid.length - 1)
    let cellIndex = Math.min(Number(this.data.focus2) || 0, answerGrid[rowIndex].length - 1)
    if (answerGrid[rowIndex][cellIndex] === null) {
      cellIndex += 1
      if (cellIndex >= answerGrid[rowIndex].length && rowIndex > 0) {
        rowIndex -= 1
        cellIndex = 0
      }
      cellIndex = Math.min(cellIndex, answerGrid[rowIndex].length - 1)
    }
    answerGrid[rowIndex][cellIndex] = null
    this.setData({
      answerGrid,
      focus1: rowIndex,
      focus2: cellIndex,
      activeRowId: this.getRowId(rowIndex),
      activeRowLabel: this.getRowLabel(rowIndex),
      feedbackMessage:""
    })
  },

  clearDigits() {
    if (this.data.checked) return
    this.setData({
      answerGrid: this.createAnswerGrid(this.data.processSteps, this.data.correctAnswerArray),
      focus1: 0,
      focus2: this.data.processSteps[0].detailSteps.length - 1,
      activeRowId:'row-0',
      activeRowLabel:this.getRowLabel(0),
      checkResult:{},
      feedbackMessage:""
    })
  },

  onKeypadSubmit() {
    this.onFormSubmit({ detail: { value: this.buildFormDataFromGrid() } })
  },

  buildFormDataFromGrid() {
    const formData = {}
    this.data.answerGrid.forEach((row, rowIndex) => {
      row.forEach((value, cellIndex) => {
        formData[`${rowIndex}-${cellIndex}`] = value === null ? '' : `${value}`
      })
    })
    return formData
  },

  /**
   * 验证答案是否正确  
   */
  onFormSubmit(e){
    if (this.data.checked) return
    const formData = e.detail.value;
    const _n = this.data.processSteps.length
    var _checkResult={}
    var error = false
    for (let i = 0; i < _n; i++) {
      for (let j = 0; j < this.data.processSteps[i].detailSteps.length; j++) {
        var currentDigit = this.data.processSteps[i].detailSteps[j].currentDigit
        if(currentDigit == formData[i+"-"+j]){
          _checkResult[i+"-"+j] = false
          console.log(i+"-"+j+":验证正确")
        }else{
          _checkResult[i+"-"+j] = true
          error = true
          console.log(i+"-"+j+":XXXX")
        }
      }
    }
    var _yourAnswer = "",_correctAnswer=""
    for (let i = 0; i < this.data.correctAnswerArray.length; i++) {
      var _a = this.data.correctAnswerArray[i]
      var _ua = formData[_n+"-"+i]
      _yourAnswer += _ua
      _correctAnswer += _a
      _checkResult[_n+"-"+i] = _a == _ua ? false:true
      if(_a == _ua){
        _checkResult[_n+"-"+i] = false
        console.log(_n+"-"+i+":验证正确--",_a)
      }else{
        _checkResult[_n+"-"+i] = true
        error = true
        console.log(_n+"-"+i+":XXXX--")
      }
    }
    if(error){
      recordPracticeResult(false)
      var wqTmp = this.data.wrongQuestions
      wqTmp.push({"question": this.data.currentProblem,"yourAnswer": _yourAnswer ,"correctAnswer": _correctAnswer})
      this.setData({
        checked:true,
        checkResult:_checkResult,
        feedbackMessage: `😢答错了！正确答案是 ${_correctAnswer}`,
        wrongQuestions: wqTmp
      });
    }else{
      recordPracticeResult(true)
      this.setData({
        checked:true,
        checkResult:_checkResult,
        feedbackMessage: `🌸答案正确！很棒🌸！`
      });
    }
    setTimeout(() => {
      this.nextProblem();
    }, 1600);
    console.log('表单数据:', this.data.checkResult);
  },
  
  checkAnswer() {
    this.onKeypadSubmit()
  },

  beginPrint(e){

    if(e.detail.total){
      this.setData({
        currentTotal:e.detail.total,
      });
    }
    var pros = []
    for (let index = 0; index < this.data.currentTotal; index++) {
      pros.push(getMultipProblemShu())      
    }
    console.log(pros)
    this.setData({
      problemList:pros,
      showWherePage:3
    })
  },
  // onShareAppMessage() {
  //   return {
  //     title: '一起来学习乘法竖式吧！',
  //     path: '/pages/compute/multipEquation/index',
  //   }
  //  },
})
