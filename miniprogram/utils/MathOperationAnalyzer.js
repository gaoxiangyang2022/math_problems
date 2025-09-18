// utils/mathOperationAnalyzer.js

class MathOperationAnalyzer {
  /**
   * 分析减法计算过程（修复版）
   */
  static analyzeSubtraction(num1, num2) {
    const str1 = num1.toString();
    const str2 = num2.toString();
    const maxLength = Math.max(str1.length, str2.length);
    
    const padded1 = str1.padStart(maxLength, '0');
    const padded2 = str2.padStart(maxLength, '0');
    
    const steps = [];
    let borrow = 0; // 借位标志，0表示无借位，1表示有借位
    
    // 从右往左逐位计算（个位开始）
    for (let i = maxLength - 1; i >= 0; i--) {
      let digit1 = parseInt(padded1[i]);
      const digit2 = parseInt(padded2[i]);
      
      // 先减去上一位的借位
      let currentDigit1 = digit1 - borrow;
      borrow = 0; // 重置借位标志
      
      // 如果当前位不够减，需要向高位借位
      if (currentDigit1 < digit2) {
        currentDigit1 += 10; // 借位后加10
        borrow = 1; // 设置借位标志
      }
      
      const value = currentDigit1 - digit2;
      
      const step = {
        step: maxLength - i,
        digit1: digit1, // 原始数字
        digit2: digit2,
        borrowIn: steps.length > 0 ? steps[0].borrowOut : 0, // 上一步的借出
        value: value,
        borrowOut: borrow, // 当前步的借出
        operation: 'subtraction',
        description: this.getSubtractionDescription(
          maxLength - i,
          digit1,
          digit2,
          steps.length > 0 ? steps[0].borrowOut : 0,
          borrow,
          value
        )
      };
      
      steps.unshift(step);
    }
    
    return steps;
  }

  /**
   * 生成减法步骤描述
   */
  static getSubtractionDescription(step,digit1, digit2, previousBorrow, currentBorrow, value) {
    let desc = `第${step}位: `;
    
    // 如果有上一步的借位
    if (previousBorrow > 0) {
      desc += "\n"+(currentBorrow>0 ? "10(借) + " : "")+` ${digit1} - ${previousBorrow}(被借1) - ${digit2}`;
    } else {
      desc += (currentBorrow>0 ? "=  10(借) + " : "= ")+` ${digit1} - ${digit2}`;
    }
    
    // 如果当前需要借位
    if (currentBorrow > 0) {
      desc += ` = ${value} (需借1)`;
    } else {
      desc += ` = ${value}`;
    }
    
    return desc;
  }

  /**
   * 分析加法计算过程
   */
  static analyzeAddition(num1, num2) {
    const str1 = num1.toString();
    const str2 = num2.toString();
    const maxLength = Math.max(str1.length, str2.length);
    
    const padded1 = str1.padStart(maxLength, '0');
    const padded2 = str2.padStart(maxLength, '0');
    
    const steps = [];
    let carry = 0;
    
    for (let i = maxLength - 1; i >= 0; i--) {
      const digit1 = parseInt(padded1[i]);
      const digit2 = parseInt(padded2[i]);
      
      const sum = digit1 + digit2 + carry;
      const value = sum % 10;
      carry = Math.floor(sum / 10);
      
      const step = {
        step: maxLength - i,
        digit1,
        digit2,
        carryIn: i === maxLength - 1 ? 0 : (steps[0] && steps[0].carryOut) || 0,
        value,
        carryOut: carry,
        operation: 'addition',
        description: ''
      };
      var des = `第${maxLength - i}位: ${digit1} + ${digit2}`
      if(step.carryIn>0){
        des+= ` + ${step.carryIn}(进位) `
      }
      des+= ` = ${sum}, 结果: ${value}`
      if(carry>0){
        des+= ` 向前进位 ${step.carryOut} `
      }
      step.description = des
      steps.unshift(step);
    }
    
    if (carry > 0) {
      steps.unshift({
        step: maxLength + 1,
        digit1: 0,
        digit2: 0,
        carryIn: carry,
        value: carry,
        carryOut: 0,
        operation: 'addition',
        description: `最高位进位: ${carry}`
      });
    }
    
    return steps;
  }

  /**
   * 格式化步骤输出
   */
  static formatSteps(steps) {
    return steps.map(step => step.description);
  }

  /**
   * 获取最终计算结果
   */
  static getResult(steps) {
    const resultStr = steps.map(step => step.value).join('');
    return parseInt(resultStr, 10);
  }
}

// 模块导出
module.exports = {
  MathOperationAnalyzer
};