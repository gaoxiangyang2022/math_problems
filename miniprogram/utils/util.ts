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

/**
 * 生成 num1 = num2 + num3
 * 用于加法与减法的口算计算
 * @param range 生成值的范围
 */
export const getAddSubNums = (range: number) => {
  const isAddition = Math.random() > 0.5;
  var nums = getNumsByRange(range);
  var num1 = Math.max(nums[0],nums[1],nums[2])
  var num2 = Math.min(nums[0],nums[1],nums[2])
  var num3 = num1-num2
  return {
    problem: isAddition ? `${num3} + ${num2} = ` : `${num1} - ${num2} = `,
    answer: isAddition ? num1 : num3
  }
}

/**
 * 生成连加连减的算式
 * @param range 生成数字的范围
 */
export const getComplexAddSubNums = (range: number) => {
  var nums = getNumsByRange(range);
  var num1 = Math.max(nums[0],nums[1])
  var num2 = Math.min(nums[0],nums[1])
  const isAddFirst = Math.random() > 0.5;
  var num3 = nums[2]
  if(isAddFirst&&num1+num2<num3){
    var na = nums.filter(n=>(num1+num2)>n)
    num3 = na[0]
  }
  
  return getProblem(num1,num2,num3,isAddFirst)
}

const getProblem = (num1: number,num2: number,num3: number,isAddFirst: boolean) => {
  const indexArray = [0,1,2,3].sort(()=>Math.random()-0.5)
  var answer = 0
  if(isAddFirst){
    var num4 = num1+num2-num3
    const nums = [num1,num2,num3,num4]
    answer = nums[indexArray[0]]
    nums[indexArray[0]] = "?"
    return {problem : `${nums[0]} + ${nums[1]} - ${nums[2]} = ${nums[3]}`,
    answer:answer}
  }else{
    var num4 = num1-num2+num3
    const nums = [num1,num2,num3,num4]
    answer = nums[indexArray[0]]
    nums[indexArray[0]] = "?"
    return {problem : `${nums[0]} - ${nums[1]} + ${nums[2]} = ${nums[3]}`,
    answer:answer}
  }
}

