const problemHistory: string[] = []

const randInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const gcd = (a: number, b: number) => {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) {
    const t = x % y
    x = y
    y = t
  }
  return x
}

const simplifyFraction = (num: number, den: number) => {
  const g = gcd(num, den)
  return `${num / g}/${den / g}`
}

const formatNumber = (num: number) => {
  if (Number.isInteger(num)) return `${num}`
  return parseFloat(num.toFixed(6)).toString()
}

const formatAnswer = (value: number | string, unit?: string) => {
  const text = typeof value === 'number' ? formatNumber(value) : `${value}`
  return unit ? `${text}${unit}` : text
}

const makeProblem = (config: any) => {
  return {
    id: config.id,
    typeLabel: config.typeLabel,
    categoryLabel: config.categoryLabel,
    text: config.text,
    answer: config.answer,
    answerText: config.answerText || formatAnswer(config.answer, config.unit),
    tip: config.tip || '',
    steps: config.steps || [],
    signature: `${config.id}:${config.text}`
  }
}

const bank = [
  {
    id: 'sum-basic',
    typeLabel: '合并求和',
    categoryLabel: '基础数量',
    grades: [1],
    generate() {
      const a = randInt(6, 18)
      const b = randInt(4, 16)
      return makeProblem({
        id: 'sum-basic',
        typeLabel: '合并求和',
        categoryLabel: '基础数量',
        text: `小雨有 ${a} 张贴纸，老师又奖励了她 ${b} 张。她现在一共有多少张贴纸？`,
        answer: a + b,
        unit: '张',
        tip: '看到“一共”，先想加法。',
        steps: [
          `先找原来的数量：${a}张。`,
          `再找后来增加的数量：${b}张。`,
          `把两部分合起来：${a} + ${b} = ${a + b}（张）。`
        ]
      })
    }
  },
  {
    id: 'remain-basic',
    typeLabel: '剩余问题',
    categoryLabel: '基础数量',
    grades: [1],
    generate() {
      const total = randInt(12, 28)
      const used = randInt(3, total - 2)
      return makeProblem({
        id: 'remain-basic',
        typeLabel: '剩余问题',
        categoryLabel: '基础数量',
        text: `篮子里原来有 ${total} 个橘子，吃掉了 ${used} 个，还剩多少个橘子？`,
        answer: total - used,
        unit: '个',
        tip: '“吃掉了、飞走了、用去了”通常想减法。',
        steps: [
          `原来有 ${total} 个。`,
          `吃掉了 ${used} 个，就是从总数里去掉一部分。`,
          `${total} - ${used} = ${total - used}（个）。`
        ]
      })
    }
  },
  {
    id: 'compare-basic',
    typeLabel: '比较多少',
    categoryLabel: '基础数量',
    grades: [1, 2],
    generate() {
      const bigger = randInt(14, 30)
      const smaller = randInt(5, bigger - 3)
      return makeProblem({
        id: 'compare-basic',
        typeLabel: '比较多少',
        categoryLabel: '基础数量',
        text: `小明收集了 ${bigger} 枚贝壳，小红收集了 ${smaller} 枚。小明比小红多多少枚？`,
        answer: bigger - smaller,
        unit: '枚',
        steps: [
          `“多多少”就是比较两个数量相差多少。`,
          `用多的减去少的：${bigger} - ${smaller} = ${bigger - smaller}（枚）。`
        ]
      })
    }
  },
  {
    id: 'equal-groups',
    typeLabel: '几个几',
    categoryLabel: '乘除入门',
    grades: [2],
    generate() {
      const each = randInt(2, 9)
      const groups = randInt(3, 8)
      return makeProblem({
        id: 'equal-groups',
        typeLabel: '几个几',
        categoryLabel: '乘除入门',
        text: `每盒彩笔有 ${each} 支，买了 ${groups} 盒，一共有多少支彩笔？`,
        answer: each * groups,
        unit: '支',
        tip: '“每份一样多”可以想乘法。',
        steps: [
          `每盒有 ${each} 支，这是一份的数量。`,
          `一共有 ${groups} 盒，就是 ${groups} 份。`,
          `${each} × ${groups} = ${each * groups}（支）。`
        ]
      })
    }
  },
  {
    id: 'average-share',
    typeLabel: '平均分',
    categoryLabel: '乘除入门',
    grades: [2],
    generate() {
      const people = randInt(2, 8)
      const each = randInt(2, 9)
      const total = people * each
      return makeProblem({
        id: 'average-share',
        typeLabel: '平均分',
        categoryLabel: '乘除入门',
        text: `有 ${total} 块饼干，平均分给 ${people} 个小朋友，每人分到多少块？`,
        answer: each,
        unit: '块',
        tip: '“平均分”通常用除法。',
        steps: [
          `总共有 ${total} 块饼干。`,
          `平均分给 ${people} 个小朋友，就是把总数平均分成 ${people} 份。`,
          `${total} ÷ ${people} = ${each}（块）。`
        ]
      })
    }
  },
  {
    id: 'multiple-basic',
    typeLabel: '倍数问题',
    categoryLabel: '乘除入门',
    grades: [2, 3],
    generate() {
      const base = randInt(3, 12)
      const times = randInt(2, 5)
      return makeProblem({
        id: 'multiple-basic',
        typeLabel: '倍数问题',
        categoryLabel: '乘除入门',
        text: `小亮有 ${base} 个气球，小雅的气球个数是小亮的 ${times} 倍。小雅有多少个气球？`,
        answer: base * times,
        unit: '个',
        steps: [
          `“${times}倍”表示有 ${times} 个 ${base}。`,
          `用乘法：${base} × ${times} = ${base * times}（个）。`
        ]
      })
    }
  },
  {
    id: 'perimeter',
    typeLabel: '长方形周长',
    categoryLabel: '图形测量',
    grades: [3],
    generate() {
      const length = randInt(8, 20)
      const width = randInt(4, 12)
      const answer = 2 * (length + width)
      return makeProblem({
        id: 'perimeter',
        typeLabel: '长方形周长',
        categoryLabel: '图形测量',
        text: `一个长方形操场，长 ${length} 米，宽 ${width} 米。沿着操场边走一圈是多少米？`,
        answer,
        unit: '米',
        tip: '“走一圈”就是求周长。',
        steps: [
          `长方形周长公式：周长 = （长 + 宽）× 2。`,
          `先算长和宽的和：${length} + ${width} = ${length + width}。`,
          `再乘 2：${length + width} × 2 = ${answer}（米）。`
        ]
      })
    }
  },
  {
    id: 'area-basic',
    typeLabel: '长方形面积',
    categoryLabel: '图形测量',
    grades: [3],
    generate() {
      const length = randInt(6, 18)
      const width = randInt(4, 12)
      return makeProblem({
        id: 'area-basic',
        typeLabel: '长方形面积',
        categoryLabel: '图形测量',
        text: `一块长方形菜地，长 ${length} 米，宽 ${width} 米。它的面积是多少平方米？`,
        answer: length * width,
        unit: '平方米',
        steps: [
          `长方形面积公式：面积 = 长 × 宽。`,
          `${length} × ${width} = ${length * width}（平方米）。`
        ]
      })
    }
  },
  {
    id: 'time-duration',
    typeLabel: '经过时间',
    categoryLabel: '生活应用',
    grades: [3],
    generate() {
      const start = randInt(7, 10)
      const hours = randInt(2, 5)
      const end = start + hours
      return makeProblem({
        id: 'time-duration',
        typeLabel: '经过时间',
        categoryLabel: '生活应用',
        text: `小朋友们从上午 ${start} 时开始春游，到 ${end} 时结束，一共春游了几小时？`,
        answer: hours,
        unit: '小时',
        steps: [
          `结束时刻减开始时刻，就是经过时间。`,
          `${end} - ${start} = ${hours}（小时）。`
        ]
      })
    }
  },
  {
    id: 'unit-rate',
    typeLabel: '归一问题',
    categoryLabel: '典型应用',
    grades: [3, 4],
    generate() {
      const groups = randInt(2, 5)
      const each = randInt(4, 9)
      const total = groups * each
      const targetGroups = randInt(groups + 1, groups + 4)
      return makeProblem({
        id: 'unit-rate',
        typeLabel: '归一问题',
        categoryLabel: '典型应用',
        text: `${groups} 盒彩笔一共有 ${total} 支，照这样算，${targetGroups} 盒彩笔一共有多少支？`,
        answer: each * targetGroups,
        unit: '支',
        tip: '先求一份是多少，再求几份。',
        steps: [
          `先求 1 盒彩笔有多少支：${total} ÷ ${groups} = ${each}（支）。`,
          `再求 ${targetGroups} 盒有多少支：${each} × ${targetGroups} = ${each * targetGroups}（支）。`
        ]
      })
    }
  },
  {
    id: 'sum-difference',
    typeLabel: '和差问题',
    categoryLabel: '典型应用',
    grades: [4],
    generate() {
      const small = randInt(12, 38)
      const diff = randInt(4, 18)
      const big = small + diff
      const sum = big + small
      return makeProblem({
        id: 'sum-difference',
        typeLabel: '和差问题',
        categoryLabel: '典型应用',
        text: `两筐苹果一共重 ${sum} 千克，第一筐比第二筐重 ${diff} 千克。第一筐重多少千克？`,
        answer: big,
        unit: '千克',
        tip: '较大数 =（和 + 差）÷ 2。',
        steps: [
          `第一筐是较大数。`,
          `较大数 =（和 + 差）÷ 2 = (${sum} + ${diff}) ÷ 2。`,
          `${sum} + ${diff} = ${sum + diff}。`,
          `${sum + diff} ÷ 2 = ${big}（千克）。`
        ]
      })
    }
  },
  {
    id: 'sum-multiple',
    typeLabel: '和倍问题',
    categoryLabel: '典型应用',
    grades: [4, 5],
    generate() {
      const base = randInt(8, 20)
      const multiple = randInt(2, 4)
      const total = base + base * multiple
      return makeProblem({
        id: 'sum-multiple',
        typeLabel: '和倍问题',
        categoryLabel: '典型应用',
        text: `哥哥和妹妹一共有 ${total} 本故事书，哥哥的本数是妹妹的 ${multiple} 倍。妹妹有多少本故事书？`,
        answer: base,
        unit: '本',
        tip: '先把总数看成几份，再求 1 份。',
        steps: [
          `妹妹有 1 份，哥哥有 ${multiple} 份，一共是 ${multiple + 1} 份。`,
          `每 1 份是多少：${total} ÷ ${multiple + 1} = ${base}（本）。`,
          `妹妹有 1 份，所以妹妹有 ${base} 本。`
        ]
      })
    }
  },
  {
    id: 'plant-tree',
    typeLabel: '植树问题',
    categoryLabel: '典型应用',
    grades: [4, 5],
    generate() {
      const interval = randInt(4, 9)
      const count = randInt(5, 10)
      const length = interval * (count - 1)
      return makeProblem({
        id: 'plant-tree',
        typeLabel: '植树问题',
        categoryLabel: '典型应用',
        text: `一条小路长 ${length} 米，两端都要栽树，每隔 ${interval} 米栽一棵，一共要栽多少棵树？`,
        answer: count,
        unit: '棵',
        tip: '两端都栽时：棵数 = 间隔数 + 1。',
        steps: [
          `先求一共有几个间隔：${length} ÷ ${interval} = ${count - 1}（个间隔）。`,
          `两端都栽树，所以棵数 = 间隔数 + 1。`,
          `${count - 1} + 1 = ${count}（棵）。`
        ]
      })
    }
  },
  {
    id: 'unit-total',
    typeLabel: '归总问题',
    categoryLabel: '典型应用',
    grades: [4],
    generate() {
      const each = randInt(6, 12)
      const groupCount = randInt(3, 6)
      const total = each * groupCount
      return makeProblem({
        id: 'unit-total',
        typeLabel: '归总问题',
        categoryLabel: '典型应用',
        text: `每张桌子能坐 ${each} 人，教室里一共能坐 ${total} 人，需要摆多少张同样的桌子？`,
        answer: groupCount,
        unit: '张',
        tip: '已知一份量和总量，求有几份。',
        steps: [
          `每张桌子坐 ${each} 人，这是 1 份。`,
          `一共能坐 ${total} 人，这是总量。`,
          `桌子张数 = ${total} ÷ ${each} = ${groupCount}（张）。`
        ]
      })
    }
  },
  {
    id: 'fraction-part',
    typeLabel: '分数应用',
    categoryLabel: '分数百分数',
    grades: [5],
    generate() {
      const total = randInt(12, 30)
      const den = randInt(2, 5)
      const num = randInt(1, den - 1)
      const answer = total * num / den
      if (!Number.isInteger(answer)) {
        return this.generate()
      }
      return makeProblem({
        id: 'fraction-part',
        typeLabel: '分数应用',
        categoryLabel: '分数百分数',
        text: `一桶水重 ${total} 千克，用去了这桶水的 ${num}/${den}，用去了多少千克？`,
        answer,
        unit: '千克',
        steps: [
          `求一个数的几分之几，用乘法。`,
          `${total} × ${num}/${den} = ${total * num} ÷ ${den}。`,
          `${total * num} ÷ ${den} = ${answer}（千克）。`
        ]
      })
    }
  },
  {
    id: 'discount',
    typeLabel: '折扣问题',
    categoryLabel: '分数百分数',
    grades: [5],
    generate() {
      const origin = randInt(40, 180)
      const discount = randInt(5, 9)
      const answer = origin * discount / 10
      return makeProblem({
        id: 'discount',
        typeLabel: '折扣问题',
        categoryLabel: '分数百分数',
        text: `一个书包原价 ${origin} 元，打 ${discount} 折后，现在卖多少元？`,
        answer,
        unit: '元',
        tip: '“打几折”就是按原价的十分之几来算。',
        steps: [
          `${discount} 折表示现价是原价的 ${discount}/10。`,
          `现价 = 原价 × 折扣 = ${origin} × ${discount}/10。`,
          `${origin} × ${discount}/10 = ${answer}（元）。`
        ]
      })
    }
  },
  {
    id: 'ratio-allocation',
    typeLabel: '按比例分配',
    categoryLabel: '分数百分数',
    grades: [5, 6],
    generate() {
      const a = randInt(2, 5)
      const b = randInt(2, 6)
      const per = randInt(4, 10)
      const total = (a + b) * per
      return makeProblem({
        id: 'ratio-allocation',
        typeLabel: '按比例分配',
        categoryLabel: '分数百分数',
        text: `把 ${total} 颗糖果按 ${a}:${b} 分给甲、乙两人，甲分到多少颗？`,
        answer: a * per,
        unit: '颗',
        steps: [
          `总份数：${a} + ${b} = ${a + b}（份）。`,
          `每份是多少：${total} ÷ ${a + b} = ${per}（颗）。`,
          `甲有 ${a} 份，所以甲分到：${per} × ${a} = ${a * per}（颗）。`
        ]
      })
    }
  },
  {
    id: 'encounter',
    typeLabel: '相遇问题',
    categoryLabel: '行程问题',
    grades: [6],
    generate() {
      const speedA = randInt(45, 80)
      const speedB = randInt(40, 75)
      const hours = randInt(2, 5)
      const distance = (speedA + speedB) * hours
      return makeProblem({
        id: 'encounter',
        typeLabel: '相遇问题',
        categoryLabel: '行程问题',
        text: `甲、乙两地相距 ${distance} 千米，两辆汽车同时相向而行，甲车每小时行 ${speedA} 千米，乙车每小时行 ${speedB} 千米，几小时后相遇？`,
        answer: hours,
        unit: '小时',
        tip: '相向而行时，速度要相加。',
        steps: [
          `速度和：${speedA} + ${speedB} = ${speedA + speedB}（千米/时）。`,
          `相遇时间 = 路程 ÷ 速度和。`,
          `${distance} ÷ ${speedA + speedB} = ${hours}（小时）。`
        ]
      })
    }
  },
  {
    id: 'chase',
    typeLabel: '追及问题',
    categoryLabel: '行程问题',
    grades: [6],
    generate() {
      const slow = randInt(50, 70)
      const fast = slow + randInt(10, 25)
      const gapHours = randInt(1, 3)
      const gapDistance = slow * gapHours
      const catchHours = gapDistance / (fast - slow)
      if (!Number.isInteger(catchHours) || catchHours < 1 || catchHours > 4) {
        return this.generate()
      }
      return makeProblem({
        id: 'chase',
        typeLabel: '追及问题',
        categoryLabel: '行程问题',
        text: `甲车每小时行 ${slow} 千米，先出发 ${gapHours} 小时；乙车每小时行 ${fast} 千米，后来出发去追甲车。乙车出发后几小时追上甲车？`,
        answer: catchHours,
        unit: '小时',
        tip: '追及时间 = 路程差 ÷ 速度差。',
        steps: [
          `甲车先走了 ${gapHours} 小时，先走的路程是：${slow} × ${gapHours} = ${gapDistance}（千米）。`,
          `速度差：${fast} - ${slow} = ${fast - slow}（千米/时）。`,
          `追上所需时间：${gapDistance} ÷ ${fast - slow} = ${catchHours}（小时）。`
        ]
      })
    }
  },
  {
    id: 'engineering',
    typeLabel: '工程问题',
    categoryLabel: '行程问题',
    grades: [6],
    generate() {
      const a = randInt(4, 10)
      const b = randInt(5, 12)
      const answer = a * b / (a + b)
      return makeProblem({
        id: 'engineering',
        typeLabel: '工程问题',
        categoryLabel: '行程问题',
        text: `一项作业，甲单独做 ${a} 天完成，乙单独做 ${b} 天完成，两人合作几天能完成？`,
        answer,
        answerText: `${formatNumber(answer)}天`,
        tip: '先求两人的工作效率，再求合作时间。',
        steps: [
          `甲每天完成这项作业的 1/${a}，乙每天完成 1/${b}。`,
          `合作每天完成：1/${a} + 1/${b} = ${a + b}/${a * b}。`,
          `合作时间 = 1 ÷ ${a + b}/${a * b} = ${a * b}/${a + b} = ${formatNumber(answer)}（天）。`
        ]
      })
    }
  },
  {
    id: 'age',
    typeLabel: '年龄问题',
    categoryLabel: '典型应用',
    grades: [6],
    generate() {
      const child = randInt(6, 12)
      const diff = randInt(20, 28)
      const yearsLater = randInt(2, 6)
      const futureChild = child + yearsLater
      const futureAdult = child + diff + yearsLater
      return makeProblem({
        id: 'age',
        typeLabel: '年龄问题',
        categoryLabel: '典型应用',
        text: `妈妈今年比小明大 ${diff} 岁。${yearsLater} 年后，小明 ${futureChild} 岁，妈妈多少岁？`,
        answer: futureAdult,
        unit: '岁',
        tip: '年龄差不会变。',
        steps: [
          `妈妈和小明的年龄差一直是 ${diff} 岁。`,
          `${yearsLater} 年后，小明是 ${futureChild} 岁。`,
          `妈妈的年龄 = 小明年龄 + 年龄差 = ${futureChild} + ${diff} = ${futureAdult}（岁）。`
        ]
      })
    }
  },
  {
    id: 'chicken-rabbit',
    typeLabel: '鸡兔同笼',
    categoryLabel: '典型应用',
    grades: [6],
    generate() {
      const chicken = randInt(4, 12)
      const rabbit = randInt(2, 8)
      const heads = chicken + rabbit
      const feet = chicken * 2 + rabbit * 4
      return makeProblem({
        id: 'chicken-rabbit',
        typeLabel: '鸡兔同笼',
        categoryLabel: '典型应用',
        text: `笼子里有鸡和兔，共有 ${heads} 个头、${feet} 只脚。鸡有多少只？`,
        answer: chicken,
        unit: '只',
        tip: '先假设全是兔，再把多出来的脚数减回去。',
        steps: [
          `假设全是兔，那么脚数应该是：${heads} × 4 = ${heads * 4}（只）。`,
          `比实际多了：${heads * 4} - ${feet} = ${heads * 4 - feet}（只脚）。`,
          `每把 1 只兔看成 1 只鸡，就会少 2 只脚。`,
          `鸡的只数：(${heads * 4} - ${feet}) ÷ 2 = ${chicken}（只）。`
        ]
      })
    }
  }
]

const matchesGrade = (grades: number[], grade: number) => {
  return grades.indexOf(grade) >= 0
}

export const getWordProblemTypes = (grade: number) => {
  const list = bank.filter((item) => matchesGrade(item.grades, grade))
  const map: any = { all: { id: 'all', label: '全部题型' } }
  list.forEach((item) => {
    if (!map[item.id]) {
      map[item.id] = { id: item.id, label: item.typeLabel }
    }
  })
  return Object.keys(map).map((key) => map[key])
}

export const generateWordProblem = (grade: number, typeId?: string) => {
  const filtered = bank.filter((item) => {
    return matchesGrade(item.grades, grade) && (!typeId || typeId === 'all' || item.id === typeId)
  })
  const candidates = filtered.length ? filtered : bank.filter((item) => matchesGrade(item.grades, grade))
  let problem = null
  for (let i = 0; i < 12; i++) {
    const picked = candidates[randInt(0, candidates.length - 1)]
    problem = picked.generate()
    if (problemHistory.indexOf(problem.signature) === -1) {
      break
    }
  }
  if (!problem) {
    const fallback = candidates[0]
    problem = fallback.generate()
  }
  problemHistory.unshift(problem.signature)
  if (problemHistory.length > 10) {
    problemHistory.pop()
  }
  return problem
}
