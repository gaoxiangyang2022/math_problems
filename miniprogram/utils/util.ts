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
  var r = {
    problem: isAddition ? `${num3} + ${num2} = ` : `${num1} - ${num2} = `,
    answer: isAddition ? num1 : num3,
    kind: 'addSub',
    meta: { a: isAddition ? num3 : num1, b: num2, op: isAddition ? '+' : '-', numbers: [isAddition ? num3 : num1, num2] }
  }
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
    answer:answer, unknownIndex: _index,
    kind: 'complexAddSub',
    meta: { numbers: [num1, num2, num3], ops: ['+', '-'] }}
  }else{
    const nums = [num1,num2,num3,num1-num2+num3]
    answer = nums[_index]
    nums[_index] = "?"
    return {problem : `${nums[0]} - ${nums[1]} + ${nums[2]} = ${nums[3]}`,
    answer:answer, unknownIndex: _index,
    kind: 'complexAddSub',
    meta: { numbers: [num1, num2, num3], ops: ['-', '+'] }}
  }
}

/**
 * 取出算式中的 ? ，用于选择题题干与选项拼接
 * @param problem 例如 "5 * ? = 35"
 */
const splitProblemByUnknown = (problem: string) => {
  const text = `${problem || ''}`
  const markIndex = text.indexOf('?')
  if (markIndex < 0) {
    return { prefix: text, suffix: '' }
  }
  return { prefix: text.slice(0, markIndex), suffix: text.slice(markIndex + 1) }
}

const toPosInt = (value: any) => {
  const num = Math.round(Number(value))
  return Number.isFinite(num) && num > 0 ? num : 0
}

/** 拆成数字数组（低位在前），方便模拟"逐位计算" */
const digitsOf = (value: number) => `${Math.round(Math.abs(Number(value) || 0))}`.split('').map(Number)

const digitsToNumber = (digits: number[]) => Number(digits.slice().reverse().join(''))

/**
 * 加减法的两位数字相加 / 相减，carryMode 控制进位、借位怎么处理
 * - normal：正常进位
 * - none：该进位不进位
 * - always：不管需不需要都进 1
 */
const combineByDigits = (a: number, b: number, op: string, carryMode: string) => {
  const left = digitsOf(a)
  const right = digitsOf(b)
  const len = Math.max(left.length, right.length)
  const out: number[] = []
  for (let i = 0; i < len; i++) {
    const da = i < left.length ? left[i] : 0
    const db = i < right.length ? right[i] : 0
    let value: number
    let carry = 0
    if (op === '+') {
      value = da + db
      if (value >= 10) {
        if (carryMode !== 'none') { value -= 10; carry = 1 } // none：该进位也不进位
      } else if (carryMode === 'always') {
        value += 10 // always：不需要进位也硬进 1
        carry = 1
      }
    } else {
      if (da >= db) {
        value = da - db
      } else if (carryMode === 'always') {
        // 不借位，反过来减（大减小）
        value = db - da
      } else {
        // none：该借位也不借位，本位仍按 10 算，结果自然偏大
        value = da + 10 - db
      }
    }
    out.push(value)
    if (op === '+' && carry > 0) {
      while (left.length < i + 2) left.push(0)
      left[i + 1] += carry
    }
  }
  return digitsToNumber(out)
}

/** 加法最大众的错法：该进位没有进位 / 每一位都进 1 / 多算少算一个数 */
const addCandidates = (a: number, b: number, correct: number) => {
  const list = [
    combineByDigits(a, b, '+', 'none'),   // 该进位不进位
    combineByDigits(a, b, '+', 'always'), // 不管三七二十一都进 1
    correct + 10,
    correct - 10,
    correct + 1,
    correct - 1,
    Math.abs(a - b),                      // 看错符号，算成了减法
    a * 2,
    b * 2
  ]
  return list
}

/** 减法最大众的错法：不借位 / 逐位反过来减 / 借位搞错方向 */
const subCandidates = (a: number, b: number, correct: number) => {
  const list = [
    combineByDigits(a, b, '-', 'none'),   // 该借位不借位（结果偏大）
    combineByDigits(a, b, '-', 'always'), // 逐位反过来减（大减小）
    correct - 10,
    correct + 10,
    correct + 1,
    correct - 1,
    a + b,                                // 看错符号，算成了加法
    Math.abs(b - a)
  ]
  return list
}

/** 乘法最大众的错法：口诀背成相邻的一句（多乘/少乘一个数）、用加法代替乘法 */
const multipCandidates = (a: number, b: number, correct: number) => {
  const hi = Math.max(a, b)
  const lo = Math.min(a, b)
  const list = [
    hi * (lo + 1),                        // 口诀背多了一句
    hi * Math.max(1, lo - 1),             // 口诀背少了一句
    correct + hi,
    correct - hi,
    correct + lo,
    correct - lo,
    correct + 1,
    correct - 1,
    a + b                                 // 把乘法当成加法
  ]
  return list
}

/**
 * 通用兜底候选：当"典型错法"不够用时才拿出来
 * 都是孩子容易看错、数错的结果（相邻整数、整十、数位颠倒）
 */
const buildCandidatePool = (correct: number) => {
  const fallback: number[] = [correct + 1, correct - 1, correct + 10, correct - 10]
  if (digitsOf(correct).length >= 2) {
    fallback.push(digitsToNumber(digitsOf(correct))) // 数字顺序颠倒（42 → 24）
  }
  if (correct >= 10 && correct % 10 === 0) fallback.push(correct / 10) // 整十看漏一位
  return fallback
}

const pickDistractors = (mistakes: number[], correct: number, count: number, options?: { extraPool?: number[], minValue?: number }) => {
  const minValue = options && options.minValue !== undefined ? options.minValue : 1
  const extraPool = (options && options.extraPool) || []
  const picked: number[] = []

  // 统一入口：过滤非法值 + 去重，保证 5 个选项互不相同
  const tryAdd = (value: number, limit?: number) => {
    const num = Math.round(Number(value))
    if (!Number.isFinite(num)) return
    if (num < minValue) return
    if (num === correct) return
    if (picked.indexOf(num) >= 0) return
    if (limit !== undefined && picked.length >= limit) return
    picked.push(num)
  }

  // 1) 先用"典型错法"（不进位 / 不借位 / 背错口诀…），打乱后优先全部用上
  const shuffledMistakes = mistakes.slice()
  for (let i = shuffledMistakes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = shuffledMistakes[i]
    shuffledMistakes[i] = shuffledMistakes[j]
    shuffledMistakes[j] = t
  }
  shuffledMistakes.forEach((value) => tryAdd(value, count))

  // 2) 不够的数量再用通用候选（±1、±10、数位颠倒、题面数字…）补齐
  extraPool.concat(buildCandidatePool(correct)).forEach((value) => tryAdd(value, count))

  // 3) 实在不够就用最接近的整数补
  let step = 2
  while (picked.length < count) {
    tryAdd(correct + step, count)
    step = step > 0 ? -step : -step + 1
  }
  return picked
}

/** 根据题目结构，生成"孩子最容易选错"的那几个答案 */
const buildDistractors = (problem: any, count: number) => {
  const correct = Math.max(0, Math.round(Number(problem && problem.answer) || 0))
  const meta = (problem && problem.meta) || null
  const kind = (problem && problem.kind) || ''

  let mistakes: number[] = []
  if (kind === 'multip' && meta && meta.a && meta.b) {
    mistakes = multipCandidates(meta.a, meta.b, correct)
  } else if (kind === 'complexMultip' && meta && meta.numbers) {
    const numbers: number[] = meta.numbers
    const ops: string[] = meta.ops || []
    // 按从左到右算（孩子最爱犯的错）
    let chained = numbers[0]
    for (let i = 1; i < numbers.length; i++) {
      const op = ops[i - 1]
      if (op === '*') chained *= numbers[i]
      else if (op === '+') chained += numbers[i]
      else chained -= numbers[i]
    }
    // 运算顺序搞错：把 a*b+c 算成 (a+b)*c，或者反过来
    const mathValue = numbers[0] + numbers[1] * numbers[2]
    const bracketValue = (numbers[0] + numbers[1]) * numbers[2]
    const multiplyFirst = ops[0] === '*'
    // 两个乘法口诀里的数
    const productPair = multiplyFirst ? [numbers[0], numbers[1]] : [numbers[1], numbers[2]]
    const addedNumber = multiplyFirst ? numbers[2] : numbers[0]
    mistakes = [
      chained,
      multiplyFirst ? bracketValue : mathValue,
      correct + addedNumber,
      correct - addedNumber,
      correct + Math.min.apply(null, productPair),
      correct - Math.min.apply(null, productPair),
      productPair[0] * (productPair[1] + 1),
      productPair[0] * (productPair[1] - 1),
      numbers[0] + numbers[1],
      numbers[1] + numbers[2]
    ]
    if (multiplyFirst) mistakes.push(numbers[0] * (numbers[1] + numbers[2]))
    else mistakes.push((numbers[0] + numbers[1]) * numbers[2] + numbers[0])
  } else if (kind === 'addSub') {
    const a = toPosInt(meta && meta.a)
    const b = toPosInt(meta && meta.b)
    if (a && b) mistakes = addCandidates(a, b, correct)
  } else if (kind === 'complexAddSub' && meta && meta.numbers) {
    const numbers: number[] = meta.numbers
    const ops: string[] = meta.ops || []
    let chained = 0
    numbers.forEach((num, index) => {
      if (index === 0) { chained = num; return }
      chained = ops[index - 1] === '+' ? chained + num : chained - num
    })
    // 第二步用错符号（该减反而加）
    const wrongSign = ops[0] === '+' ? numbers[0] + numbers[1] + numbers[2] : numbers[0] - numbers[1] - numbers[2]
    mistakes = [
      chained,
      wrongSign,
      numbers[0] + numbers[1],
      numbers[1] + numbers[2],
      Math.abs(numbers[0] - numbers[1]),
      Math.abs(numbers[1] - numbers[2]),
      correct + numbers[1],
      correct - numbers[2],
      correct + numbers[0],
      correct + 10,
      correct - 10
    ]
  } else if (kind === 'addSubShu' || kind === 'multipShu') {
    // 竖式：直接用题面里的两个数
    const a = toPosInt(meta && meta.a)
    const b = toPosInt(meta && meta.b)
    if (a && b) {
      mistakes = kind === 'addSubShu'
        ? addCandidates(a, b, correct)
        : multipCandidates(a, b, correct)
    }
  }

  // 选项都是"数出来的个数"，所以最小只能是 1（答案是 0 时才允许 0）
  const minValue = correct > 0 ? 1 : 0
  // 典型错法优先，不够再用通用候选补齐
  return pickDistractors(mistakes, correct, count, {
    extraPool: buildCandidatePool(correct),
    minValue
  })
}

export interface AnswerChoice {
  value: number
  label: string
  isCorrect: boolean
  prefix: string
  suffix: string
}

/**
 * 生成含正确答案的一组选项（默认 5 个）供选择题模式使用
 * 选项只显示答案本身，题干仍然在题目区，不重复显示算式
 * @param problem 题目对象或题目文本，例如 getAddSubProblem() 的返回值
 * @param options.count 选项个数，默认 5
 * @param options.answer 覆盖正确答案（不传则取 problem.answer）
 */
export const buildAnswerChoices = (problem: any, options?: { count?: number, answer?: number }): AnswerChoice[] => {
  const source = typeof problem === 'string' ? { problem } : (problem || {})
  const text = `${source.problem || ''}`
  const answer = options && options.answer !== undefined ? options.answer : source.answer
  const count = Math.max(2, Number((options && options.count) || 5))
  const correctValue = Math.round(Number(answer) || 0)
  const { prefix, suffix } = splitProblemByUnknown(text)
  const values = [correctValue].concat(buildDistractors(source, count - 1))

  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = values[i]
    values[i] = values[j]
    values[j] = t
  }

  return values.map((value) => ({
    value,
    // 只显示答案数字，不再把题目重复一遍
    label: `${value}`,
    isCorrect: value === correctValue,
    prefix,
    suffix
  }))
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
    problem: `${rnums[0]} × ${rnums[1]} = ${rnums[2]}`,
    answer: _answer,
    kind: 'multip',
    meta: { a: multN1[1], b: multN2[2], numbers: [multN1[1], multN2[2]] }
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
        answer: _answer,
        meta: { numbers: [multN1[1], multN2[2], addN[0]], ops: ['*', '+'] }
      }
    }else{    //a*b-c  
      const _r =addN.filter(n => n < multN1[1]*multN2[2])[0]
      const rnums = [multN1[1] , multN2[2] , _r , (multN1[1]*multN2[2]-_r)]
      var _answer = rnums[_index]
      rnums[_index] = "?"
      r = {
        problem: `${rnums[0]} * ${rnums[1]} - ${rnums[2]} = ${rnums[3]}`,
        answer: _answer,
        meta: { numbers: [multN1[1], multN2[2], _r], ops: ['*', '-'] }
      }
    }
  }else{
    if(isAdd){//a+b*c
      const rnums = [addN[0],multN1[1],multN2[2],addN[0]+multN1[1]*multN2[2]]
      var _answer = rnums[_index]
      rnums[_index] = "?"
      r = {
        problem: `${rnums[0]} + ${rnums[1]} * ${rnums[2]} = ${rnums[3]}`,
        answer: _answer,
        meta: { numbers: [addN[0], multN1[1], multN2[2]], ops: ['+', '*'] }
      }
    }else{//a-b*c
      const _r =addN.filter(n => n > multN1[1]*multN2[2])[0]
      const rnums = [ _r , multN1[1] , multN2[2] , (_r - multN1[1]*multN2[2])]
      var _answer = rnums[_index]
      rnums[_index] = "?"
      r = {
        problem: `${rnums[0]} - ${rnums[1]} * ${rnums[2]} = ${rnums[3]}`,
        answer: _answer,
        meta: { numbers: [_r, multN1[1], multN2[2]], ops: ['-', '*'] }
      }
    }
  }
  r.kind = 'complexMultip'
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