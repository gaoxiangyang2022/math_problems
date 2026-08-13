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
      showWherePage: 1
    });
    this.generateNewProblem();
  },

  nextProblem() {
    this.setData({
      feedbackMessage: "",
      userAnswer: "",
      focus1:0,
      focus2:0,
      checkResult:{},
      checked:false,
      processSteps:[],
      nullChar:''
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
      showWherePage: 0
    });
  },
  generateNewProblem() {
    let _p = getMultipProblemShu()
    const o = multiplicationSteps(_p.num1,_p.num2)
    console.log(o)

    this.setData({
      processSteps:o.steps,
      focus2:o.steps[0].detailSteps.length-1,
      currentProblem: _p.problem,
      correctAnswer: _p.answer,
      num1Array: _p.num1Array,
      num2Array: _p.num2Array,
      correctAnswerArray: _p.answerArray,
      userAnswerArray: _p.answerArray.map(() => null),
    });
  },

  
  inputChange(e) {
    console.log(e.target.dataset)
    if(isValidNumber(e.detail.value)){
      const _userAnswer = parseInt(e.detail.value);
      const _dataSet = e.target.dataset
      var _userAnswerArray = this.data.userAnswerArray
      console.log(_dataSet.index1, _dataSet.index2)
      //取得当前输入框是第几行（_focus1），第几列（_focus2）
      var _focus1 =  _dataSet.index1
      var _focus2 = _dataSet.index2 - 1
      if(_focus2 < 0){//步减，小于0，需要换行，否则继续 减1
        _focus1 = _dataSet.index1+1
        //如果_focus1超出步数，则移到 最终结果 那里的第一个输入框（最终结果长度-1）
        if(this.data.processSteps.length < _focus1+1){
          _focus2=this.data.correctAnswerArray.length-1
        }else{//否则，就继续下一行，从这一行的最后一个数字开始
          _focus2 = this.data.processSteps[_focus1].detailSteps.length-1
        }
      }
    
      //移动光标
      this.setData({
        focus2 : _focus2,
        focus1 : _focus1,
      })

      // if(this.data.userAnswerArray.length-1 == _dataSet.index){
      //   this.checkAnswer()
      // }
    }
  },

  /**
   * 验证答案是否正确  
   */
  onFormSubmit(e){
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
        currentIndex: this.data.currentIndex + 1,
        wrongQuestions: wqTmp
      });
    }else{
      recordPracticeResult(true)
      this.setData({
        checked:true,
        checkResult:_checkResult,
        feedbackMessage: `🌸答案正确！很棒🌸！`,
        currentIndex: this.data.currentIndex + 1
      });
    }
    setTimeout(() => {
      this.nextProblem();
    }, 1600);
    console.log('表单数据:', this.data.checkResult);
  },
  
  checkAnswer() {
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
