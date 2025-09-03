// pages/compute/simpleAddSub/index.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentRange :10,
    currentTotal :50,
    currentProblem : "请选择难度开始练习",
    correctAnswer: 0,
    currentIndex: 0,
    userAnswer : "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  //设置范围
  changeRange(e){
    const { range } = e.currentTarget.dataset;
    this.setData({
      currentRange:range
    })
  },
  //设置总共需要生成多少道题目
  changeTotal(e){
    const { total } = e.currentTarget.dataset;
    this.setData({
      currentTotal:total
    })
  },

  //开始测试
  startTest(){
    this.generateNewProblem()
  },
  

  //生成新题目
  generateNewProblem() {
    const isAddition = Math.random() > 0.5;
    let num1, num2,_currentProblem,_correctAnswer;
    
    if (isAddition) {
        num1 = Math.floor(Math.random() * this.data.currentRange) + 1;
        num2 = Math.floor(Math.random() * (this.data.currentRange - num1)) + 1;
        _currentProblem = `${num1} + ${num2} = ?`;
        _correctAnswer = num1 + num2;
        
    } else {
        num1 = Math.floor(Math.random() * this.data.currentRange) + 1;
        num2 = Math.floor(Math.random() * (num1));
        _currentProblem = `${num1} - ${num2} = ?`;
        _correctAnswer = num1 - num2;
    }
    
    this.setData({
      currentProblem: _currentProblem,
      correctAnswer: _correctAnswer
    })
  },
  checkAnswer(e){
    //记录两次输入时间，若大于1000毫秒，可认为是确认了答案，相当于点了提交，自动判定答案，若当前值与答案相同，这个时间可以缩小到400毫秒，直接显示正确，然后进入下一题。
    const _userAnswer = parseInt(e.detail.value)
    if (isNaN(_userAnswer)) {
      this.setData({
        userAnswer:""
      })
    }else if (_userAnswer === this.data.correctAnswer) {
      
    }
  }
//   // 检查答案
//   checkAnswer() {
//       const userAnswer = parseInt(userAnswerInput.value);
      
//       if (isNaN(userAnswer)) {
//           feedbackEl.textContent = "请输入有效数字！";
//           feedbackEl.className = "incorrect";
//           return;
//       }
      
//       if (userAnswer === correctAnswer) {
//           feedbackEl.textContent = "&#10004;️ 答对了！";
//           feedbackEl.className = "correct";
//       } else {
//           feedbackEl.textContent = `&#10060; 答错了！正确答案是 ${correctAnswer}`;
//           feedbackEl.className = "incorrect";
//           // 添加抖动效果
//           problemEl.classList.add('shake');
//           setTimeout(() => problemEl.classList.remove('shake'), 500);
          
//           // 记录错题
//           wrongQuestions.push({
//               question: currentProblem,
//               yourAnswer: userAnswer,
//               correctAnswer: correctAnswer
//           });
//           updateWrongList();
//       }
      
//       currentIndex++;
//       updateProgress();
      
//       if (currentIndex >= totalQuestions) {
//           finishQuiz();
//       } else {
//           setTimeout(generateNewProblem, 800); // 加快节奏
//       }
//   },

//   // 更新进度条
//   updateProgress() {
//     const percent = (currentIndex / totalQuestions) * 100;
//     progressBar.style.width = `${percent}%`;
//     currentSpan.textContent = `${currentIndex}/${totalQuestions}`;
//     wrongCountEl.textContent = wrongQuestions.length;
//   },

// // 更新错题本
//   updateWrongList() {
//     wrongListEl.innerHTML = '';
//     wrongQuestions.forEach((item, index) => {
//         const div = document.createElement('div');
//         div.className = 'wrong-item';
//         div.innerHTML = `
//             <strong>第${index + 1}题：</strong> ${item.question}<br>
//             你的答案：${item.yourAnswer} | 正确答案：${item.correctAnswer}
//         `;
//         wrongListEl.appendChild(div);
//     });
//   },

// // 完成测验
//   finishQuiz() {
//     problemEl.textContent = `&#127881; 已完成 ${totalQuestions} 道题！`;
//     userAnswerInput.disabled = true;
//     submitBtn.disabled = true;
    
//     if (wrongQuestions.length > 0) {
//         problemEl.textContent += `，共有 ${wrongQuestions.length} 道错题`;
//     } else {
//         problemEl.textContent += "，全部正确！完美表现！";
//     }
//   },

})