export interface PracticeStats {
  total: number
  wrong: number
  date: string
}

const STORAGE_KEY = 'practiceStats'

const getTodayKey = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const emptyStats = (): PracticeStats => ({
  total: 0,
  wrong: 0,
  date: getTodayKey()
})

export const getPracticeStats = (): PracticeStats => {
  const saved = wx.getStorageSync(STORAGE_KEY) || {}
  const today = getTodayKey()
  if (saved.date !== today) {
    const stats = emptyStats()
    wx.setStorageSync(STORAGE_KEY, stats)
    return stats
  }

  return {
    total: Number(saved.total) || 0,
    wrong: Number(saved.wrong) || 0,
    date: today
  }
}

export const recordPracticeResult = (correct: boolean): PracticeStats => {
  const stats = getPracticeStats()
  stats.total += 1
  if (!correct) stats.wrong += 1
  wx.setStorageSync(STORAGE_KEY, stats)
  return stats
}

export const clearPracticeStats = (): PracticeStats => {
  const stats = emptyStats()
  wx.setStorageSync(STORAGE_KEY, stats)
  return stats
}
