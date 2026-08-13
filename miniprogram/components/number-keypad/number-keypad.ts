Component({
  data: {
    keys: [1, 2, 3, 4, 5, 6, 7, 8, 9]
  },

  methods: {
    tapDigit(e) {
      this.triggerEvent('digit', { value: Number(e.currentTarget.dataset.value) })
    },
    backspace() {
      this.triggerEvent('backspace')
    },
    clear() {
      this.triggerEvent('clear')
    }
  }
})
