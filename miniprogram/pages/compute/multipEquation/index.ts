// pages/compute/addSub/index.ts
import { isValidNumber } from '../../../utils/util';
import { multiplicationSteps } from '../../../utils/multipTools';
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
    nullChar:''
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
  generateNewProblem() {
    let num1, num2, _currentProblem, _correctAnswer;
    // 生成2-4位随机数（10-9999）
    const getRandomNum2 = () => Math.floor(Math.random() * (99 - 10 + 1)) + 10;
    const getRandomNum3 = () => Math.floor(Math.random() * (999 - 10 + 1)) + 10;
    num1 = getRandomNum2()>70 ? getRandomNum3() : getRandomNum2();
    num2 = getRandomNum3()>750 ? getRandomNum3() : getRandomNum2();   
      _currentProblem = `${num1} X ${num2} = `;
      _correctAnswer = num1 * num2;
    const _num1Array = String(num1).split('').map(Number);
    const _num2Array = String(num2).split('').map(Number);
    const _correctAnswerArray = String(_correctAnswer).split('').map(Number);
    
    const o = multiplicationSteps(num1,num2)
    console.log(o)
    

    this.setData({
      processSteps:o.steps,
      focus2:o.steps[0].detailSteps.length-1,
      currentProblem: _currentProblem,
      correctAnswer: _correctAnswer,
      num1Array: _num1Array,
      num2Array: _num2Array,
      correctAnswerArray: _correctAnswerArray,
      userAnswerArray: _correctAnswerArray.map(() => null),
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
      this.setData({
        checked:true,
        checkResult:_checkResult,
        feedbackMessage: `🌸答案正确！很棒🌸！`,
        currentIndex: this.data.currentIndex + 1
      });
    }
    console.log('表单数据:', this.data.checkResult);
  },
  
  checkAnswer() {
  },
})