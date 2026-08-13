type DemoStep = {
  title: string
  detail: string
  count: number
  kind?: 'animal' | 'addSub' | 'multiplication'
  operands?: { left: number, right: number, carryIn?: number, borrowIn?: number }
  partial?: string
  mark?: string
  resultDigits?: string[]
  marks?: { position: number, text: string, color: string }[]
  activePosition?: number
  multiplicandPosition?: number
  multiplierPosition?: number
  productPosition?: number
  partialRows?: string[]
  animalAction?: 'showAddGroups' | 'mergeAddGroups' | 'showSubAll' | 'circleSub' | 'removeSub' | 'groupMultiply'
}

const ANIMALS = ['🐶', '🐱', '🐰', '🐼', '🐸', '🦊']
const CANVAS_WIDTH = 350
const CANVAS_HEIGHT = 400
let demoCanvas: WechatMiniprogram.CanvasContext | null = null

const getLayout = (maxLength: number) => {
  const cell = Math.max(20, Math.min(28, Math.floor(190 / Math.max(maxLength, 1))))
  return {
    cell,
    endX: 292,
    fontSize: Math.max(18, Math.min(24, cell - 2)),
    startX: 292 - (maxLength - 1) * cell - 24
  }
}

const getColumnX = (position: number, maxLength: number) => {
  const { cell, endX } = getLayout(maxLength)
  return endX - position * cell + cell / 2
}

Component({
  properties: {
    question: { type: String, value: '' },
    correctAnswer: { type: Number, value: 0 },
    visible: { type: Boolean, value: false }
  },

  data: {
    title: '',
    mode: 'unsupported',
    operation: '',
    left: 0,
    right: 0,
    result: 0,
    steps: [] as DemoStep[],
    stepIndex: 0
  },

  lifetimes: {
    attached() {
      demoCanvas = wx.createCanvasContext('demoCanvas', this)
    },
    detached() {
      this.stopTimer()
    }
  },

  observers: {
    visible(value: boolean) {
      if (value) this.prepareDemo()
      else this.stopTimer()
    }
  },

  methods: {
    stopTimer() {
    },

    close() {
      this.stopTimer()
      this.triggerEvent('close')
    },

    prepareDemo() {
      this.stopTimer()
      const parsed = this.parseQuestion(this.properties.question, Number(this.properties.correctAnswer))
      if (!parsed) {
        this.setData({
          title: '这个题型暂时不能演示',
          mode: 'unsupported',
          steps: [],
          stepIndex: 0
        }, () => this.drawUnsupported())
        return
      }

      const { left, right, result, operation } = parsed
      const animalMode = operation === '×'
        ? left <= 9 && right <= 9
        : left <= 10 && right <= 10 && result <= 20
      const mode = animalMode && ['+', '-', '×'].indexOf(operation) >= 0
        ? 'animals'
        : operation === '×' ? 'multiplicationVertical' : 'addSubVertical'
      const steps = mode === 'animals'
        ? this.buildAnimalSteps(left, right, result, operation)
        : mode === 'multiplicationVertical'
          ? this.buildMultiplicationSteps(left, right, result)
          : this.buildAddSubSteps(left, right, result, operation)

      this.setData({
        title: `${left} ${operation} ${right} = ${result}`,
        mode,
        operation,
        left,
        right,
        result,
        steps,
        stepIndex: 0
      }, () => this.drawScene())
    },

    parseQuestion(question: string, answer: number) {
      const text = String(question || '')
        .replace(/\s/g, '')
        .replace(/[＊*xX]/g, '×')
      const match = text.match(/^(\?|\d+)([+\-×])(\?|\d+)(?:=(\?|\d*))?$/)
      if (!match) return null
      const left = match[1] === '?' ? answer : Number(match[1])
      const right = match[3] === '?' ? answer : Number(match[3])
      if (![left, right].every(Number.isFinite)) return null

      let result = match[4] && match[4] !== '?' ? Number(match[4]) : answer
      if (!Number.isFinite(result)) {
        if (match[2] === '+') result = left + right
        if (match[2] === '-') result = left - right
        if (match[2] === '×') result = left * right
      }
      if (!Number.isFinite(result)) return null
      return { left, right, result, operation: match[2] }
    },

    buildAnimalSteps(left: number, right: number, result: number, operation: string): DemoStep[] {
      if (operation === '×') {
        return [
          { kind: 'animal', animalAction: 'groupMultiply', title: `摆出 ${left} 组小动物`, detail: `每组有 ${right} 只`, count: 0 },
          { kind: 'animal', animalAction: 'groupMultiply', title: '一组一组数', detail: `先看第 1 组，每组 ${right} 只`, count: 1 },
          { kind: 'animal', animalAction: 'groupMultiply', title: '摆出全部分组', detail: `${left} 组 × 每组 ${right} 只`, count: left },
          { kind: 'animal', animalAction: 'groupMultiply', title: '数出全部小动物', detail: `${left} × ${right} = ${result}`, count: left }
        ]
      }
      if (operation === '+') {
        return [
          { kind: 'animal', animalAction: 'showAddGroups', title: '先摆出两组', detail: `左边 ${left} 只，右边 ${right} 只`, count: left },
          { kind: 'animal', animalAction: 'mergeAddGroups', title: '把两组合在一起', detail: `${left} 只和 ${right} 只合起来`, count: left + right },
          { kind: 'animal', animalAction: 'mergeAddGroups', title: '数一数一共有几只', detail: `${left} + ${right} = ${result}`, count: result }
        ]
      }
      return [
        { kind: 'animal', animalAction: 'showSubAll', title: `先摆出 ${left} 只`, detail: `一共有 ${left} 只小动物`, count: left },
        { kind: 'animal', animalAction: 'circleSub', title: `圈出要拿走的 ${right} 只`, detail: `从 ${left} 只里面拿走 ${right} 只`, count: left },
        { kind: 'animal', animalAction: 'removeSub', title: '拿走后再数一数', detail: `${left} - ${right} = ${result}`, count: result }
      ]
    },

    buildAddSubSteps(left: number, right: number, result: number, operation: string): DemoStep[] {
      const maxLength = Math.max(String(left).length, String(right).length, String(result).length)
      const leftDigits = String(left).padStart(maxLength, '0').split('').reverse()
      const rightDigits = String(right).padStart(maxLength, '0').split('').reverse()
      const resultDigits: string[] = Array(maxLength).fill('')
      const marks: { position: number, text: string, color: string }[] = []
      const steps: DemoStep[] = []
      let carry = 0
      let borrow = 0
      leftDigits.forEach((digit, index) => {
        const a = Number(digit)
        const b = Number(rightDigits[index] || 0)
        if (operation === '+') {
          const sum = a + b + carry
          const nextCarry = Math.floor(sum / 10)
          if (nextCarry) {
            marks.push({ position: index + 1, text: `+${nextCarry}`, color: '#2563eb' })
            steps.push({
              kind: 'addSub',
              title: `第 ${index + 1} 步：先写进位`,
              detail: `${a} + ${b}${carry ? ` + ${carry}(进位)` : ''} = ${sum}，向前一位进 ${nextCarry}`,
              count: index,
              operands: { left: a, right: b, carryIn: carry },
              mark: `向前进 ${nextCarry}`,
              marks: [...marks],
              resultDigits: [...resultDigits],
              activePosition: index
            })
          }
          resultDigits[index] = String(sum % 10)
          steps.push({
            kind: 'addSub',
            title: `第 ${index + 1} 步：计算第 ${index + 1} 位`,
            detail: `${a} + ${b}${carry ? ` + ${carry}(进位)` : ''} = ${sum}，本位写 ${sum % 10}`,
            count: index,
            operands: { left: a, right: b, carryIn: carry },
            mark: nextCarry ? `本位写 ${sum % 10}` : '无进位，本位写结果',
            marks: [...marks],
            resultDigits: [...resultDigits],
            activePosition: index
          })
          carry = nextCarry
          return
        }
        const needBorrow = a - borrow < b
        const current = needBorrow ? a - borrow + 10 : a - borrow
        const value = current - b
        if (needBorrow) {
          marks.push({ position: index + 1, text: '-1', color: '#dc2626' })
          marks.push({ position: index, text: '+10', color: '#2563eb' })
          steps.push({
            kind: 'addSub',
            title: `第 ${index + 1} 步：先完成借位`,
            detail: `${a} 不够减 ${b}，向前一位借 1，本位加 10`,
            count: index,
            operands: { left: a, right: b, borrowIn: borrow },
            mark: '先借 1，再计算',
            marks: [...marks],
            resultDigits: [...resultDigits],
            activePosition: index
          })
        }
        resultDigits[index] = String(value)
        steps.push({
          kind: 'addSub',
          title: `第 ${index + 1} 步：计算第 ${index + 1} 位`,
          detail: `${a}${borrow ? ` - ${borrow}(被借)` : ''}${needBorrow ? ' + 10(借位)' : ''} - ${b} = ${value}，本位写 ${value}`,
          count: index,
          operands: { left: a, right: b, borrowIn: borrow },
          mark: needBorrow ? `本位写 ${value}` : '不需要借位',
          marks: [...marks],
          resultDigits: [...resultDigits],
          activePosition: index
        })
        borrow = needBorrow ? 1 : 0
      })
      return steps.concat([{
        kind: 'addSub',
        title: '写出答案',
        detail: `${left} ${operation} ${right} = ${result}`,
        count: leftDigits.length,
        partial: String(result),
        mark: '计算完成',
        marks: [...marks],
        resultDigits: String(result).split('').reverse(),
        activePosition: -1
      }])
    },

    buildMultiplicationSteps(left: number, right: number, result: number): DemoStep[] {
      const rows: string[] = []
      const multiplierDigits = String(right).split('').reverse()
      const steps: DemoStep[] = []

      multiplierDigits.forEach((digit, rowIndex) => {
        const multiplier = Number(digit)
        let carry = 0
        const productDigits: string[] = []
        const multiplicandDigits = String(left).split('').reverse()

        multiplicandDigits.forEach((multiplicandDigit, colIndex) => {
          const a = Number(multiplicandDigit)
          const raw = a * multiplier + carry
          const currentDigit = raw % 10
          const nextCarry = Math.floor(raw / 10)
          productDigits[colIndex] = String(currentDigit)

          steps.push({
            kind: 'multiplication',
            title: `第 ${rowIndex + 1} 行，第 ${colIndex + 1} 位`,
            detail: `${multiplier} × ${a}${carry ? ` + ${carry}(进位)` : ''} = ${raw}，写 ${currentDigit}`,
            count: rowIndex,
            operands: { left: a, right: multiplier, carryIn: carry },
            mark: nextCarry ? `进位 ${nextCarry}` : `写 ${currentDigit}`,
            marks: nextCarry ? [{ position: colIndex + 1 + rowIndex, text: `+${nextCarry}`, color: '#2563eb' }] : [],
            multiplicandPosition: colIndex,
            multiplierPosition: rowIndex,
            productPosition: colIndex + rowIndex,
            partialRows: [...rows, productDigits.slice().reverse().join('') + '0'.repeat(rowIndex)]
          })
          carry = nextCarry
        })

        if (carry) {
          productDigits[multiplicandDigits.length] = String(carry)
          steps.push({
            kind: 'multiplication',
            title: `第 ${rowIndex + 1} 行：写最高位进位`,
            detail: `把最后的进位 ${carry} 写到最高位`,
            count: rowIndex,
            mark: `写进位 ${carry}`,
            multiplicandPosition: multiplicandDigits.length - 1,
            multiplierPosition: rowIndex,
            productPosition: multiplicandDigits.length + rowIndex,
            partialRows: [...rows, productDigits.slice().reverse().join('') + '0'.repeat(rowIndex)]
          })
        }

        rows.push(String(left * multiplier * Math.pow(10, rowIndex)))
      })

      return steps.concat([{
        kind: 'multiplication',
        title: '最后一步：部分积相加',
        detail: `${rows.join(' + ')} = ${result}`,
        count: multiplierDigits.length,
        partial: String(result),
        mark: '得到最终结果',
        activePosition: -1,
        partialRows: [...rows],
        resultDigits: String(result).split('').reverse()
      }])
    },

    nextStep() {
      if (this.data.mode === 'unsupported') return
      this.stopTimer()
      if (this.data.stepIndex >= this.data.steps.length) {
        return
      }
      this.setData({ stepIndex: this.data.stepIndex + 1 }, () => {
        this.drawScene()
      })
    },

    reset() {
      this.stopTimer()
      this.setData({ stepIndex: 0 }, () => this.drawScene())
    },

    drawUnsupported() {
      if (!demoCanvas) return
      demoCanvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      demoCanvas.setFontSize(22)
      demoCanvas.setFillStyle('#6b7280')
      demoCanvas.fillText('除法和混合计算暂不提供演示', 28, 160)
      demoCanvas.draw()
    },

    drawScene() {
      if (!demoCanvas) return
      if (this.data.mode === 'animals') this.drawAnimals()
      if (this.data.mode === 'addSubVertical') this.drawAddSubDemo()
      if (this.data.mode === 'multiplicationVertical') this.drawMultiplicationDemo()
      demoCanvas.draw()
    },

    drawAnimals() {
      const { left, right, result, operation, stepIndex, steps } = this.data
      const current = stepIndex > 0 ? steps[stepIndex - 1] : undefined
      demoCanvas!.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      demoCanvas!.setFontSize(24)
      demoCanvas!.setFillStyle('#243b53')
      demoCanvas!.fillText(`${left} ${operation} ${right} = ${result}`, 118, 28)
      if (operation === '×') {
        this.drawGroupedAnimals(current ? current.count : 0)
        demoCanvas!.setFontSize(15)
        demoCanvas!.setFillStyle('#52606d')
        if (current) demoCanvas!.fillText(current.detail, 24, 370)
        return
      }
      this.drawAddSubAnimals(current)
      demoCanvas!.setFontSize(15)
      demoCanvas!.setFillStyle('#52606d')
      if (current) demoCanvas!.fillText(current.detail, 24, 370)
    },

    drawAnimalGrid(
      total: number,
      startX: number,
      startY: number,
      options: { fadedFrom?: number, circledFrom?: number, columns?: number, gapX?: number, gapY?: number } = {}
    ) {
      const columns = options.columns || 5
      const gapX = options.gapX || 45
      const gapY = options.gapY || 50
      demoCanvas!.setTextAlign('center')
      demoCanvas!.setFontSize(28)
      for (let i = 0; i < total; i++) {
        const x = startX + (i % columns) * gapX
        const y = startY + Math.floor(i / columns) * gapY
        const faded = options.fadedFrom !== undefined && i >= options.fadedFrom
        demoCanvas!.setFillStyle(faded ? '#cbd5e1' : '#243b53')
        demoCanvas!.fillText(ANIMALS[i % ANIMALS.length], x, y)
        if (options.circledFrom !== undefined && i >= options.circledFrom) {
          demoCanvas!.setStrokeStyle('#ef4444')
          demoCanvas!.setLineWidth(2)
          demoCanvas!.beginPath()
          demoCanvas!.arc(x, y - 9, 18, 0, Math.PI * 2)
          demoCanvas!.stroke()
        }
      }
      demoCanvas!.setTextAlign('left')
    },

    drawAddSubAnimals(current?: DemoStep) {
      const { left, right, result, operation } = this.data
      if (!current) return
      if (operation === '+') {
        if (current.animalAction === 'showAddGroups') {
          this.drawAnimalGrid(left, 48, 95, { columns: 2, gapX: 38, gapY: 48 })
          this.drawAnimalGrid(right, 225, 95, { columns: 2, gapX: 38, gapY: 48 })
          demoCanvas!.setFontSize(14)
          demoCanvas!.setFillStyle('#2563eb')
          demoCanvas!.fillText(`${left} 只`, 45, 305)
          demoCanvas!.fillText(`${right} 只`, 222, 305)
          return
        }
        this.drawAnimalGrid(result, 72, 100, { columns: 5, gapX: 42, gapY: 48 })
        return
      }
      if (current.animalAction === 'circleSub') {
        this.drawAnimalGrid(left, 72, 100, { circledFrom: Math.max(0, left - right), columns: 5, gapX: 42, gapY: 48 })
        return
      }
      if (current.animalAction === 'removeSub') {
        this.drawAnimalGrid(result, 72, 100, { columns: 5, gapX: 42, gapY: 48 })
        demoCanvas!.setFontSize(14)
        demoCanvas!.setFillStyle('#16a34a')
        demoCanvas!.fillText(`拿走 ${right} 只，剩下 ${result} 只`, 70, 285)
        return
      }
      this.drawAnimalGrid(left, 72, 100, { columns: 5, gapX: 42, gapY: 48 })
    },

    drawGroupedAnimals(groupCount: number) {
      const { left, right } = this.data
      const visibleGroups = Math.min(groupCount, left)
      const columns = left <= 3 ? left : left <= 6 ? 3 : 3
      const rows = Math.ceil(left / Math.max(columns, 1))
      const groupWidth = Math.floor(310 / Math.max(columns, 1))
      const groupHeight = Math.floor(270 / Math.max(rows, 1))
      const startX = (CANVAS_WIDTH - groupWidth * columns) / 2
      const startY = 48
      const animalColumns = right <= 4 ? 2 : 3
      const animalRows = Math.ceil(right / animalColumns)
      const animalSize = Math.max(14, Math.min(22, Math.floor((groupHeight - 22) / Math.max(animalRows, 1))))
      demoCanvas!.setTextAlign('center')
      for (let group = 0; group < visibleGroups; group++) {
        const groupCol = group % columns
        const groupRow = Math.floor(group / columns)
        const x = startX + groupCol * groupWidth
        const y = startY + groupRow * groupHeight
        demoCanvas!.setFillStyle(group % 2 ? '#eff6ff' : '#ecfdf5')
        demoCanvas!.fillRect(x + 3, y + 2, groupWidth - 8, groupHeight - 6)
        demoCanvas!.setFillStyle('#52606d')
        demoCanvas!.setFontSize(12)
        demoCanvas!.fillText(`第${group + 1}组`, x + groupWidth / 2, y + groupHeight - 9)
        demoCanvas!.setFontSize(animalSize)
        for (let item = 0; item < right; item++) {
          const innerCol = item % animalColumns
          const innerRow = Math.floor(item / animalColumns)
          const innerGapX = Math.min(24, Math.floor((groupWidth - 20) / animalColumns))
          const innerGapY = Math.min(19, Math.floor((groupHeight - 24) / Math.max(animalRows, 1)))
          const itemX = x + groupWidth / 2 + (innerCol - (animalColumns - 1) / 2) * innerGapX
          const itemY = y + 23 + innerRow * innerGapY
          demoCanvas!.setFillStyle('#243b53')
          demoCanvas!.fillText(ANIMALS[group % ANIMALS.length], itemX, itemY)
        }
      }
      demoCanvas!.setTextAlign('left')
    },

    drawStepText(current?: DemoStep) {
      const { stepIndex, steps } = this.data
      demoCanvas!.setFontSize(15)
      demoCanvas!.setFillStyle('#52606d')
      demoCanvas!.fillText(`第 ${Math.min(stepIndex, steps.length)} 步`, 22, 230)
      if (current) {
        demoCanvas!.setFillStyle('#d97706')
        demoCanvas!.fillText(current.detail, 22, 255)
        demoCanvas!.setFillStyle('#52606d')
        demoCanvas!.fillText(current.title, 22, 280)
        if (current.mark) {
          demoCanvas!.setFillStyle('#2563eb')
          demoCanvas!.fillText(current.mark, 22, 305)
        }
      }
    },

    drawAddSubDemo() {
      const { stepIndex, steps } = this.data
      const current = stepIndex > 0 ? steps[stepIndex - 1] : undefined
      demoCanvas!.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      this.drawAddSubVertical(current)
      this.drawStepText(current)
    },

    drawMultiplicationDemo() {
      const { stepIndex, steps } = this.data
      const current = stepIndex > 0 ? steps[stepIndex - 1] : undefined
      demoCanvas!.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      this.drawMultiplicationVertical(current)
      this.drawStepText(current)
    },

    drawAlignedNumber(text: string, y: number, maxLength: number, color = '#243b53') {
      const { fontSize } = getLayout(maxLength)
      const padded = text.padStart(maxLength, ' ')
      demoCanvas!.setFontSize(fontSize)
      demoCanvas!.setFillStyle(color)
      demoCanvas!.setTextAlign('center')
      padded.split('').forEach((digit, index) => {
        if (digit !== ' ') {
          const position = maxLength - 1 - index
          demoCanvas!.fillText(digit, getColumnX(position, maxLength), y)
        }
      })
      demoCanvas!.setTextAlign('left')
    },

    drawStepMarks(marks: { position: number, text: string, color: string }[] = [], maxLength: number) {
      demoCanvas!.setFontSize(14)
      demoCanvas!.setTextAlign('center')
      const stackByPosition: Record<number, number> = {}
      marks.forEach(mark => {
        if (mark.position < 0 || mark.position >= maxLength) return
        const stackIndex = stackByPosition[mark.position] || 0
        stackByPosition[mark.position] = stackIndex + 1
        demoCanvas!.setFillStyle(mark.color)
        demoCanvas!.fillText(mark.text, getColumnX(mark.position, maxLength), 22 + stackIndex * 15)
      })
      demoCanvas!.setTextAlign('left')
    },

    drawResultDigits(digits: string[] = [], y: number, maxLength: number) {
      const { fontSize } = getLayout(maxLength)
      demoCanvas!.setFontSize(fontSize)
      demoCanvas!.setFillStyle('#ef6c57')
      demoCanvas!.setTextAlign('center')
      digits.forEach((digit, position) => {
        if (digit) demoCanvas!.fillText(digit, getColumnX(position, maxLength), y)
      })
      demoCanvas!.setTextAlign('left')
    },

    drawActiveColumn(position: number | undefined, maxLength: number) {
      if (position === undefined || position < 0) return
      const { cell, endX } = getLayout(maxLength)
      const x = endX - position * cell
      demoCanvas!.setFillStyle('rgba(250, 204, 21, 0.28)')
      demoCanvas!.fillRect(x, 30, cell, 118)
    },

    drawActiveCell(position: number | undefined, y: number, maxLength: number, color = 'rgba(250, 204, 21, 0.28)') {
      if (position === undefined || position < 0) return
      const { cell, endX } = getLayout(maxLength)
      const x = endX - position * cell
      demoCanvas!.setFillStyle(color)
      demoCanvas!.fillRect(x, y, cell, 28)
    },

    drawAddSubVertical(current?: DemoStep) {
      const { left, right, operation } = this.data
      const maxLength = Math.max(String(left).length, String(right).length, String(this.data.result).length)
      this.drawActiveColumn(current && current.activePosition, maxLength)
      this.drawStepMarks(current && current.marks, maxLength)
      this.drawAlignedNumber(String(left), 58, maxLength)
      const layout = getLayout(maxLength)
      demoCanvas!.setFontSize(24)
      demoCanvas!.setFillStyle('#dc2626')
      demoCanvas!.fillText(operation, layout.startX - 18, 95)
      this.drawAlignedNumber(String(right), 95, maxLength)
      demoCanvas!.setStrokeStyle('#243b53')
      demoCanvas!.setLineWidth(2)
      demoCanvas!.beginPath()
      demoCanvas!.moveTo(layout.startX, 108)
      demoCanvas!.lineTo(306, 108)
      demoCanvas!.stroke()
      this.drawResultDigits(current && current.resultDigits, 136, maxLength)
    },

    drawMultiplicationVertical(current?: DemoStep) {
      const { left, right, result } = this.data
      const rows = current && current.partialRows ? current.partialRows : []
      const maxLength = Math.max(String(left).length, String(right).length, String(result).length, ...rows.map(row => row.length))
      this.drawActiveCell(current && current.multiplicandPosition, 24, maxLength, 'rgba(250, 204, 21, 0.3)')
      this.drawActiveCell(current && current.multiplierPosition, 58, maxLength, 'rgba(96, 165, 250, 0.28)')
      this.drawActiveCell(current && current.productPosition, 96 + (current ? current.count * 28 : 0), maxLength, 'rgba(34, 197, 94, 0.22)')
      this.drawStepMarks(current && current.marks, maxLength)
      this.drawAlignedNumber(String(left), 44, maxLength)
      const layout = getLayout(maxLength)
      demoCanvas!.setFontSize(24)
      demoCanvas!.setFillStyle('#dc2626')
      demoCanvas!.fillText('×', layout.startX - 18, 78)
      this.drawAlignedNumber(String(right), 78, maxLength)
      demoCanvas!.setStrokeStyle('#243b53')
      demoCanvas!.setLineWidth(2)
      demoCanvas!.beginPath()
      demoCanvas!.moveTo(layout.startX, 90)
      demoCanvas!.lineTo(306, 90)
      demoCanvas!.stroke()
      rows.slice(0, 3).forEach((row, index) => {
        this.drawAlignedNumber(row, 118 + index * 28, maxLength, '#2563eb')
      })
      if (current && current.resultDigits) {
        demoCanvas!.beginPath()
        demoCanvas!.moveTo(layout.startX, 188)
        demoCanvas!.lineTo(306, 188)
        demoCanvas!.stroke()
        this.drawResultDigits(current.resultDigits, 216, maxLength)
      }
    }
  }
})
