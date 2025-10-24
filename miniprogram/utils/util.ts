export const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('/') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}
const getNumsByRange = (range: number) => {
  const arr = Array.from({length: range}, (_, i) => i + 1);
  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  
  return arr;
}
const getNumsByMultip = () => {
  const arr = [2,3,4,5,6,7,8,9];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  
  return arr;
}

/**
 * 生成算式
 * 生成加or减的算式
 * 用于加法与减法的口算计算
 * @param range 生成值的范围
 */
export const getAddSubProblem = (range: number) => {
  const isAddition = Math.random() > 0.5;
  var nums = getNumsByRange(range);
  var num1 = Math.max(nums[0],nums[1],nums[2])
  var num2 = Math.min(nums[0],nums[1],nums[2])
  var num3 = num1-num2
  var r = {problem: isAddition ? `${num3} + ${num2} = ` : `${num1} - ${num2} = `, answer: isAddition ? num1 : num3}
  if(hasNoDuplicateInLast10(r.problem)){
    return r
  }else{
    return getAddSubProblem(range)
  }
}

/**
 * 生成加减法竖式计算
 */
export const getAddSubProblemShu = () => {
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

    console.log(_currentProblem,_correctAnswer)
  }
  const _correctAnswerArray = String(_correctAnswer).split('').map(Number).reverse();
  var r = {
    problem : _currentProblem,
    answer : _correctAnswer,
    answerArray : _correctAnswerArray,
    num1Array : String(num1).split('').map(Number),
    num2Array : String(num2).split('').map(Number),
    operator:_operator
  }
  if(hasNoDuplicateInLast10(r.problem)){
    return r
  }else{
    return getAddSubProblemShu()
  }
}
/**
 * 生成算式
 * 生成连加连减的算式
 * @param range 生成数字的范围
 */
export const getComplexAddSubProblem = (range: number) => {
  var nums = getNumsByRange(range);
  var num1 = Math.max(nums[0],nums[1])
  var num2 = Math.min(nums[0],nums[1])
  const isAddFirst = Math.random() > 0.5;
  var num3 = nums[2]
  if(isAddFirst&&num1+num2<num3){
    var na = nums.filter(n=>(num1+num2)>n)
    num3 = na[0]
  }
  
  var r = getProblem(num1,num2,num3,isAddFirst)
  if(hasNoDuplicateInLast10(r.problem)){
    return r
  }else{
    return getComplexAddSubProblem(range)
  }
}

const getProblem = (num1: number,num2: number,num3: number,isAddFirst: boolean) => {
  const _index = getNumsByRange(4)[0]-1
  var answer = 0
  if(isAddFirst){
    const nums = [num1,num2,num3,num1+num2-num3]
    answer = nums[_index]
    nums[_index] = "?"
    return {problem : `${nums[0]} + ${nums[1]} - ${nums[2]} = ${nums[3]}`,
    answer:answer}
  }else{
    const nums = [num1,num2,num3,num1-num2+num3]
    answer = nums[_index]
    nums[_index] = "?"
    return {problem : `${nums[0]} - ${nums[1]} + ${nums[2]} = ${nums[3]}`,
    answer:answer}
  }
}


/**
 * 生成算式
 * 生成乘法或除法算式
 * @param
 */
export const getMultipProblem = () => {
  var multN1 = getNumsByMultip();
  var multN2 = getNumsByMultip();
  const rnums = [multN1[1],multN2[2],multN1[1]*multN2[2]]
  const _index = getNumsByRange(3)[0]-1;
  var _answer = rnums[_index]
  rnums[_index] = "?"
  var r = {
    problem: `${rnums[0]} * ${rnums[1]} = ${rnums[2]}`,
    answer: _answer
  }
  if(hasNoDuplicateInLast10(r.problem)){
    return r
  }else{
    return getMultipProblem()
  }
}
/**
 * 乘法竖式
 */
export const getMultipProblemShu = () => {
  let num1, num2, _currentProblem, _correctAnswer;
    // 生成2-4位随机数（10-9999）
    const getRandomNum2 = () => Math.floor(Math.random() * (99 - 10 + 1)) + 10;
    const getRandomNum3 = () => Math.floor(Math.random() * (999 - 10 + 1)) + 10;
    num1 = getRandomNum2()>70 ? getRandomNum3() : getRandomNum2();
    num2 = getRandomNum3()>750 ? getRandomNum3() : getRandomNum2();   
      _currentProblem = `${num1} * ${num2} = `;
      _correctAnswer = num1 * num2;
  var r = {
    problem : _currentProblem,
    answer : _correctAnswer,
    answerArray : String(_correctAnswer).split('').map(Number),
    num1Array : String(num1).split('').map(Number),
    num2Array : String(num2).split('').map(Number),
    num1:num1,
    num2:num2
  }
  if(hasNoDuplicateInLast10(r.problem)){
    return r
  }else{
    return getMultipProblemShu()
  }
}
/**
 * 生成算式
 * 生成乘法与加减混合算式
 * @param
 */
export const getComplexMultipProblem = () => {
  var multN1 = getNumsByMultip();
  var multN2 = getNumsByMultip();
  var addN = getNumsByRange(100);
  const isMultFirst = addN[9]%2==0;
  const isAdd = addN[5]%2==0;
  const _index = getNumsByRange(4)[0]-1;
  var r
  if(isMultFirst){
    if(isAdd){//a*b+c
      const rnums = [multN1[1],multN2[2],addN[0],multN1[1]*multN2[2]+addN[0]]
      var _answer = rnums[_index]
      rnums[_index] = "?"
      r = {
        problem: `${rnums[0]} * ${rnums[1]} + ${rnums[2]} = ${rnums[3]}`,
        answer: _answer
      }
    }else{    //a*b-c  
      const _r =addN.filter(n => n < multN1[1]*multN2[2])[0]
      const rnums = [multN1[1] , multN2[2] , _r , (multN1[1]*multN2[2]-_r)]
      var _answer = rnums[_index]
      rnums[_index] = "?"
      r = {
        problem: `${rnums[0]} * ${rnums[1]} - ${rnums[2]} = ${rnums[3]}`,
        answer: _answer
      }
    }
  }else{
    if(isAdd){//a+b*c
      const rnums = [addN[0],multN1[1],multN2[2],addN[0]+multN1[1]*multN2[2]]
      var _answer = rnums[_index]
      rnums[_index] = "?"
      r = {
        problem: `${rnums[0]} + ${rnums[1]} * ${rnums[2]} = ${rnums[3]}`,
        answer: _answer
      }
    }else{//a-b*c
      const _r =addN.filter(n => n > multN1[1]*multN2[2])[0]
      const rnums = [ _r , multN1[1] , multN2[2] , (_r - multN1[1]*multN2[2])]
      var _answer = rnums[_index]
      rnums[_index] = "?"
      r = {
        problem: `${rnums[0]} - ${rnums[1]} * ${rnums[2]} = ${rnums[3]}`,
        answer: _answer
      }
    }
  }
  if(hasNoDuplicateInLast10(r.problem)){
    return r
  }else{
    return getComplexMultipProblem()
  }
}

/**
 * 判断最近10次是否有重复数据
 * @param {string} currentData - 当前要判断的数据
 * @returns {boolean} - 最近10次没有重复返回true，有重复返回false
 */
export const hasNoDuplicateInLast10 = (currentData)=>{
  const app = getApp();
  // 确保globalData中有dataHistory数组
  if (!app.globalData.dataHistory) { app.globalData.dataHistory = []; }
  const history = app.globalData.dataHistory;
  // 检查当前数据是否在历史记录中存在
  const isDuplicate = history.includes(currentData);
  if (isDuplicate) {return false;}
  // 没有重复，将当前数据添加到历史记录（最新的在前面）
  app.globalData.dataHistory = [currentData, ...history].slice(0, 10);
  return true; // 没有重复，返回true
}
export const isValidNumber = (value) => {
  if(value.length>0){
    const num = Number(value);
    console.log(num,value)
    return !isNaN(num);
  }else{
    return false
  }
}