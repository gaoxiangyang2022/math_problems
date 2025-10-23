// utils/arithmetic-pdf-generator.js
class ArithmeticPDFGenerator {
  /**
   * 生成口算题图片（A4纸比例）
   */
  static async generateImage(pageInstance, problems, options = {}) {
    const {
      title = '练习题',
      showAnswers = false,
      pageNumber = 1,
      totalPages = 1,
      columns = 4,
      rowSpacing = 1,
      startIndex = 1,
      showNum = true,
      showPage = true
    } = options;

    const canvas = await this.getCanvas(pageInstance);
    const ctx = canvas.getContext('2d');
    const dpr = wx.getSystemInfoSync().pixelRatio;
    
    // A4纸尺寸
    const width = 794, height = 1123;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    this.drawBackground(ctx, width, height);
    this.drawHeader(ctx, width, title, showAnswers, pageNumber, totalPages, problems.length, showPage);
    this.drawProblems(ctx, problems, width, height, columns, rowSpacing, showAnswers, startIndex, showNum);
    this.drawFooter(ctx, width, height, title);

    return this.canvasToImage(canvas, pageInstance);
  }

  /**
   * 智能分页生成图片
   */
  static async generateAllImages(pageInstance, problems, options) {
    const { columns = 4, rowSpacing = 1, showNum = true, showPage = true } = options;
    const allImages = [];
    
    // 生成题目页和答案页
    const pages = [
      { showAnswers: false, type: '题目' },
      { showAnswers: true, type: '答案' }
    ];

    for (const [pageIndex, pageConfig] of pages.entries()) {
      const problemsPerPage = this.calculateProblemsPerPage(columns, rowSpacing, pageConfig.showAnswers);
      const totalPages = Math.ceil(problems.length / problemsPerPage);

      for (let i = 0; i < totalPages; i++) {
        const startIndex = i * problemsPerPage + 1; // 计算起始编号
        const pageProblems = problems.slice(i * problemsPerPage, (i + 1) * problemsPerPage);
        
        const imagePaths = await this.generateImage(pageInstance, pageProblems, {
          ...options,
          ...pageConfig,
          pageNumber: i + 1,
          totalPages,
          startIndex, // 传递起始编号
          showNum,
          showPage
        });

        allImages.push(...imagePaths);
        
        // 更新进度
        const baseProgress = pageIndex * 50;
        const currentProgress = Math.round(((i + 1) / totalPages) * 50);
        pageInstance.setData({ imageProgress: baseProgress + currentProgress });
        
        await this.delay(500);
      }
    }

    console.log(`所有图片生成完成，共 ${allImages.length} 张`);
    return allImages;
  }

  /**
   * 绘制题目
   */
  static drawProblems(ctx, problems, width, height, columns, rowSpacing, showAnswers, startIndex = 1, showNum = true) {
    const margin = 40;
    const colWidth = (width - 2 * margin) / columns;
    const lineHeight = showAnswers ? 50 : 50 * rowSpacing;
    let y = 140;

    ctx.textAlign = 'left';
    ctx.font = '20px "Microsoft YaHei"';

    problems.forEach((problem, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const x = margin + col * colWidth;
      const currentY = y + row * lineHeight;

      // 使用连续编号，而不是从1开始
      const problemNumber = startIndex + index;

      // 绘制题目编号（根据showNum参数决定是否显示）
      if (showNum) {
        ctx.fillStyle = '#666666';
        ctx.font = '16px "Microsoft YaHei"';
        ctx.fillText(`${problemNumber}.`, x, currentY);
      }

      // 绘制题目内容
      const text = this.formatProblemText(problem, showAnswers);
      ctx.fillStyle = showAnswers ? '#2e7d32' : '#333333';
      ctx.font = '20px "Microsoft YaHei"';
      
      // 根据是否显示序号调整文本位置
      const textX = showNum ? x + ctx.measureText(`${problemNumber}. `).width : x;
      ctx.fillText(text, textX, currentY);
    });
  }

  /**
   * 绘制页头
   */
  static drawHeader(ctx, width, title, showAnswers, pageNumber, totalPages, problemCount, showPage = true) {
    const pageTitle = `${title} - ${showAnswers ? '答案' : '题目'}`;
    
    // 根据showPage参数决定是否显示页数信息
    const pageInfo = showPage 
      ? `第${pageNumber}页/共${totalPages}页 • 共${problemCount}题 • ${showAnswers ? '答案' : '题目'}`
      : "";

    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    
    ctx.font = 'bold 24px "Microsoft YaHei"';
    ctx.fillText(pageTitle, width / 2, 60);
    
    ctx.font = '16px "Microsoft YaHei"';
    ctx.fillStyle = '#666666';
    ctx.fillText(pageInfo, width / 2, 95);
  }

  /**
   * 生成预览数据 - 保持连续编号
   */
  static generatePreview(problems, options = {}) {
    const { columns = 4, rowSpacing = 1, showAnswers = false, showNum = true } = options;
    const problemsPerPage = this.calculateProblemsPerPage(columns, rowSpacing, false);
    const problemPages = Math.ceil(problems.length / problemsPerPage);

    // 生成连续编号的预览数据
    const problemsWithNumbers = problems.map((problem, index) => ({
      ...problem,
      number: index + 1,
      display: this.formatProblemText(problem, false),
      showNum: showNum // 添加showNum参数
    }));

    const answersWithNumbers = problems.map((problem, index) => ({
      ...problem,
      number: index + 1,
      display: this.formatProblemText(problem, true),
      showNum: showNum // 添加showNum参数
    }));

    return {
      problems: this.formatForPreview(problemsWithNumbers, columns),
      answers: this.formatForPreview(answersWithNumbers, columns),
      total: problems.length,
      problemPages,
      answerStartPage: problemPages + 1,
      hasAnswers: showAnswers,
      showNum: showNum,
      showPage: options.showPage !== false // 默认显示页数信息
    };
  }

  /**
   * 格式化预览数据 - 适配连续编号
   */
  static formatForPreview(problemsWithNumbers, columns) {
    return Array.from(
      { length: Math.ceil(problemsWithNumbers.length / columns) },
      (_, i) => problemsWithNumbers.slice(i * columns, (i + 1) * columns)
    );
  }

  // 以下方法保持不变
  static getCanvas(pageInstance) {
    return new Promise((resolve, reject) => {
      wx.createSelectorQuery().in(pageInstance)
        .select('#mathCanvas')
        .fields({ node: true, size: true })
        .exec((res) => res[0] ? resolve(res[0].node) : reject(new Error('Canvas 未找到')));
    });
  }

  static canvasToImage(canvas, pageInstance) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvas,
          success: res => resolve([res.tempFilePath]),
          fail: reject
        }, pageInstance);
      }, 300);
    });
  }

  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static drawBackground(ctx, width, height) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  static drawFooter(ctx, width, height, title) {
    ctx.font = '14px "Microsoft YaHei"';
    ctx.fillStyle = '#999999';
    ctx.textAlign = 'center';
    ctx.fillText(`${new Date().toLocaleDateString()} • ${title}`, width / 2, height - 30);

    // 绘制边框
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, width - 20, height - 20);
  }

  static formatProblemText(problem, showAnswers) {
    if (problem.problem.includes("?")) {
      return showAnswers ? 
        problem.problem.replaceAll("?", problem.answer) : 
        problem.problem.replaceAll("?", "___");
    }
    return showAnswers ? `${problem.problem}${problem.answer}` : `${problem.problem}`;
  }

  static calculateProblemsPerPage(columns, rowSpacing, showAnswers = false) {
    const usableHeight = 1123 - 140 - 10;
    const lineHeight = showAnswers ? 50 : 50 * rowSpacing;
    const rowsPerPage = Math.floor(usableHeight / lineHeight);
    return rowsPerPage * columns;
  }

  static async saveImagesToAlbum(imagePaths) {
    for (const imagePath of imagePaths) {
      try {
        await new Promise((resolve, reject) => {
          wx.saveImageToPhotosAlbum({
            filePath: imagePath,
            success: resolve,
            fail: reject
          });
        });
      } catch (error) {
        console.error('保存图片失败:', error);
      }
    }
    return imagePaths;
  }
}

module.exports = ArithmeticPDFGenerator;