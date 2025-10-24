// pages/arithmetic/arithmetic.js
const ArithmeticPDFGenerator = require('../../utils/arithmetic-pdf-generator.js');

Page({
  data: {
    config: {
      title: "练习题",
      rowSpacing: 1,
      lineSpacing: 2,
      fontSize: 14,
      columns: 3,
      showNum: true,
      showPage: true
    },
    problems: [],
    previewData: {
      problems: [],
      answers: [],
      total: 0,
      problemPages: 0,
      answerStartPage: 0
    },
    generatingImages: false,
    imageProgress: 0,
    generatedImages: [],
    showCanvas: false,
    showGeneratedImages: false,
    currentImageIndex: 0
  },

  onLoad(option) {
    const problems = JSON.parse(wx.getStorageSync("problemList"));
    const paperTitle = wx.getStorageSync("paperTitle") || "练习题";
    
    this.setData({
      problems,
      'config.title': paperTitle
    });

    if (option.column && option.rowGap) {
      this.setData({
        "config.rowSpacing": option.rowGap,
        "config.columns": option.column,
      });
    }
    
    this.generateProblems();
  },

  onReady() {
    setTimeout(() => this.setData({ showCanvas: true }), 1000);
  },

  changeTitle(e) {
    this.setData({ 'config.title': e.detail.value });
  },

  generateProblems() {    
    setTimeout(() => {      
      const previewData = ArithmeticPDFGenerator.generatePreview(this.data.problems, this.data.config);
      this.setData({
        previewData,
        generatedImages: [],
        showGeneratedImages: false
      });
    }, 300);
  },

  async generateImages() {
    const { problems, config } = this.data;
    
    if (!problems.length) {
      wx.showToast({ title: '请先生成题目', icon: 'none' });
      return;
    }

    wx.setStorageSync("paperTitle", config.title);
    
    this.setData({ 
      generatingImages: true,
      imageProgress: 0,
      showCanvas: true,
      showGeneratedImages: false
    });

    try {
      wx.showLoading({ title: '正在生成图片...', mask: true });
      await new Promise(resolve => setTimeout(resolve, 1000));

      const allImages = await ArithmeticPDFGenerator.generateAllImages(this, problems, config);
      
      this.setData({
        generatedImages: allImages,
        imageProgress: 100,
        showGeneratedImages: true,
        currentImageIndex: 0
      });

      wx.hideLoading();
      this.setData({ showCanvas: false });
      
      wx.showToast({ title: `生成${allImages.length}张图片`, icon: 'success' });
    } catch (error) {
      console.error('生成图片失败:', error);
      wx.hideLoading();
      wx.showToast({ title: '生成失败: ' + error.message, icon: 'error' });
    } finally {
      this.setData({ generatingImages: false, showCanvas: false });
    }
  },

  async saveAllImagesToAlbum() {
    const { generatedImages } = this.data;
    
    if (!generatedImages.length) {
      wx.showToast({ title: '没有可保存的图片', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });
    
    try {
      await this.requestAlbumPermission();
      await ArithmeticPDFGenerator.saveImagesToAlbum(generatedImages);
      
      wx.hideLoading();
      wx.showToast({ title: `已保存${generatedImages.length}张图片`, icon: 'success' });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'error' });
    }
  },

  async saveCurrentImage() {
    const { generatedImages, currentImageIndex } = this.data;
    
    if (!generatedImages.length) {
      wx.showToast({ title: '没有可保存的图片', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });
    
    try {
      await this.requestAlbumPermission();
      
      await new Promise((resolve, reject) => {
        wx.saveImageToPhotosAlbum({
          filePath: generatedImages[currentImageIndex],
          success: resolve,
          fail: reject
        });
      });
      
      wx.hideLoading();
      wx.showToast({ title: '图片已保存', icon: 'success' });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'error' });
    }
  },

  requestAlbumPermission() {
    return new Promise((resolve, reject) => {
      wx.authorize({
        scope: 'scope.writePhotosAlbum',
        success: resolve,
        fail: () => {
          wx.showModal({
            title: '需要相册权限',
            content: '请允许访问相册以保存图片',
            success: (res) => {
              res.confirm ? 
                wx.openSetting({
                  success: (res) => res.authSetting['scope.writePhotosAlbum'] ? resolve() : reject(new Error('用户拒绝授权'))
                }) : reject(new Error('用户取消授权'));
            }
          });
        }
      });
    });
  },

  switchImage(e) {
    const { direction } = e.currentTarget.dataset;
    const { generatedImages, currentImageIndex } = this.data;
    
    let newIndex = direction === 'prev' ? currentImageIndex - 1 : currentImageIndex + 1;
    
    if (newIndex < 0) newIndex = generatedImages.length - 1;
    if (newIndex >= generatedImages.length) newIndex = 0;
    
    this.setData({ currentImageIndex: newIndex });
  },

  goToImage(e) {
    this.setData({ currentImageIndex: parseInt(e.currentTarget.dataset.index) });
  },

  previewCurrentImage() {
    const { generatedImages, currentImageIndex } = this.data;
    if (generatedImages.length) {
      wx.previewImage({
        urls: generatedImages,
        current: generatedImages[currentImageIndex]
      });
    }
  },

  rowSpacingChange(e){
    this.setData({ "config.rowSpacing" : parseInt(e.detail.value) });
    this.generateProblems()
  },
  columnsChange(e){
    console.log(parseInt(e.target.dataset.value))
    this.setData({ "config.columns" : parseInt(e.target.dataset.value) });
    this.generateProblems()
  },
  showNumChange(e){
    this.setData({ "config.showNum" : e.detail.value });
  },
  showPageChange(e){
    this.setData({ "config.showPage" : e.detail.value });
  }
});