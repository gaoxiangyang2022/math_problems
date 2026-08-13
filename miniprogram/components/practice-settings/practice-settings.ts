Component({
  properties: {
    delay: { type: Number, value: 900 },
    autoNext: { type: Boolean, value: true },
    checked: { type: Boolean, value: false }
  },

  data: {
    delayOptions: [500, 700, 900, 1200, 1500, 2000],
    delayIndex: 2
  },

  observers: {
    delay(value: number) {
      const index = this.data.delayOptions.indexOf(Number(value))
      this.setData({ delayIndex: index >= 0 ? index : 2 })
    }
  },

  methods: {
    changeDelay(e) {
      const index = Number(e.detail.value)
      const delay = this.data.delayOptions[index] || 900
      this.triggerEvent('change', { delay, autoNext: this.properties.autoNext })
    },
    changeAutoNext(e) {
      this.triggerEvent('change', {
        delay: this.properties.delay,
        autoNext: Boolean(e.detail.value)
      })
    },
    verify() {
      this.triggerEvent('verify')
    },
    next() {
      this.triggerEvent('next')
    }
  }
})
