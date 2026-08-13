export interface PracticeSettings {
  delay: number
  autoNext: boolean
}

const STORAGE_KEY = 'practiceSettings'
const DEFAULT_SETTINGS: PracticeSettings = {
  delay: 900,
  autoNext: true
}

export const getPracticeSettings = (defaultDelay = DEFAULT_SETTINGS.delay): PracticeSettings => {
  const saved = wx.getStorageSync(STORAGE_KEY) || {}
  const savedDelay = Number(saved.delay)

  return {
    delay: savedDelay > 0 ? savedDelay : defaultDelay,
    autoNext: typeof saved.autoNext === 'boolean' ? saved.autoNext : DEFAULT_SETTINGS.autoNext
  }
}

export const savePracticeSettings = (settings: PracticeSettings) => {
  const nextSettings = {
    delay: Number(settings.delay) || DEFAULT_SETTINGS.delay,
    autoNext: Boolean(settings.autoNext)
  }
  wx.setStorageSync(STORAGE_KEY, nextSettings)
  return nextSettings
}
