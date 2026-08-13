import { getPracticeSettings, savePracticeSettings } from '../../utils/practiceSettings';

Component({
  properties: {
    mode: { type: String, value: 'manual' },
    showVerify: { type: Boolean, value: true },
    delay: { type: Number, value: 900 },
    autoNext: { type: Boolean, value: true },
    checked: { type: Boolean, value: false }
  },

  data: {
    delayOptions: [500, 700, 900, 1200, 1500, 2000],
    delayIndex: 2,
    innerDelay: 900,
    innerAutoNext: true,
    panelVisible: false
  },

  observers: {
    delay(value: number) {
      const index = this.data.delayOptions.indexOf(Number(value))
      this.setData({
        delayIndex: index >= 0 ? index : 2,
        innerDelay: Number(value) || 900
      })
    },
    autoNext(value: boolean) {
      this.setData({ innerAutoNext: Boolean(value) })
    }
  },

  lifetimes: {
    attached() {
      const settings = getPracticeSettings(this.properties.delay)
      const index = this.data.delayOptions.indexOf(Number(settings.delay))
      this.setData({
        delayIndex: index >= 0 ? index : 2,
        innerDelay: settings.delay,
        innerAutoNext: settings.autoNext
      })
    }
  },

  methods: {
    openPanel() {
      const settings = getPracticeSettings(this.properties.delay)
      const index = this.data.delayOptions.indexOf(Number(settings.delay))
      this.setData({
        panelVisible: true,
        delayIndex: index >= 0 ? index : 2,
        innerDelay: settings.delay,
        innerAutoNext: settings.autoNext
      })
    },
    closePanel() {
      this.setData({ panelVisible: false })
    },
    noop() {},
    changeDelay(e) {
      const index = Number(e.detail.value)
      const delay = this.data.delayOptions[index] || 900
      const settings = savePracticeSettings({
        delay,
        autoNext: this.data.innerAutoNext
      })
      this.setData({
        delayIndex: index,
        innerDelay: settings.delay,
        innerAutoNext: settings.autoNext
      })
      this.triggerEvent('change', settings)
    },
    changeAutoNext(e) {
      const settings = savePracticeSettings({
        delay: this.data.innerDelay,
        autoNext: Boolean(e.detail.value)
      })
      this.setData({
        innerDelay: settings.delay,
        innerAutoNext: settings.autoNext
      })
      this.triggerEvent('change', settings)
    },
    verify() {
      this.triggerEvent('verify')
    },
    next() {
      this.triggerEvent('next')
    }
  }
})
