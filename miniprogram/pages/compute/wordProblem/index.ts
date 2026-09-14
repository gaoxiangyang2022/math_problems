import { generateWordProblem, getWordProblemTypes } from '../../../utils/wordProblemGenerator'

Page({
  data: {
    pageMode: 'setup',
    currentGrade: 3,
    currentType: 'all',
    showSolution: false,
    currentProblem: null,
    gradeOptions: [
      { value: 1, label: '一年级' },
      { value: 2, label: '二年级' },
      { value: 3, label: '三年级' },
      { value: 4, label: '四年级' },
      { value: 5, label: '五年级' },
      { value: 6, label: '六年级' }
    ],
    typeOptions: []
  },

  onLoad() {
    this.refreshTypes(3)
  },

  refreshTypes(grade: number) {
    this.setData({
      typeOptions: getWordProblemTypes(grade)
    })
  },

  changeGrade(e) {
    const grade = Number(e.currentTarget.dataset.grade) || 1
    this.refreshTypes(grade)
    this.setData({
      currentGrade: grade,
      currentType: 'all',
      showSolution: false,
      currentProblem: null
    })
  },

  changeType(e) {
    const type = e.currentTarget.dataset.type || 'all'
    this.setData({
      currentType: type,
      showSolution: false
    })
  },

  startPractice() {
    this.generateProblem(this.data.currentGrade, this.data.currentType)
    this.setData({
      pageMode: 'problem',
      showSolution: false
    })
  },

  generateProblem(gradeParam?: number, typeParam?: string) {
    const grade = typeof gradeParam === 'number' ? gradeParam : this.data.currentGrade
    const type = typeof typeParam === 'string' ? typeParam : this.data.currentType
    const currentProblem = generateWordProblem(grade, type)
    this.setData({
      currentProblem,
      showSolution: false
    })
  },

  toggleSolution() {
    if (!this.data.currentProblem) return
    this.setData({
      showSolution: !this.data.showSolution
    })
  },

  backToSetup() {
    this.setData({
      pageMode: 'setup',
      showSolution: false
    })
  }
})
