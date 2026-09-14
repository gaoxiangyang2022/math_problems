export const showFloatingFeedback = (message: string, duration = 1600) => {
  wx.showToast({
    title: message,
    icon: 'none',
    duration,
    mask: false
  })
}
