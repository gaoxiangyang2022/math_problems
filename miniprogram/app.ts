// app.ts
App<IAppOption>({
  globalData: {
    emojiArray:["🐁","🐇","🐎","🐼","🐐","🐹","🐓","🐬","🌷","🌵","🍁","🌭","🥮","🍰","🌕️","🌈","🏆️","🔮","🧦","👗","💣️","🔨","💉","💯","🐊","🐪","🍄","🐉","🐧","🦩","🦖","🌸","🌻","🌼","☘️","🥭","🍎","🍒","🚲️","🛴","🏓","💎","🦗","🐞","🦋","🦈","🐢","🦢","🐾","🐛","🦕","🐕️","🐷","🐅","🍓","🍕","🎂","🍼","🍭","🍦","🍔","🥛","🚀","☂️","💡"]
  },
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // iOS 打开静音键时，默认播放是没声音的；这里关掉"遵循静音开关"
    // 基础库 2.3.0 起用的是 wx.setInnerAudioOption（InnerAudioContext.obeyMuteSwitch 已不生效）
    try {
      if (typeof wx.setInnerAudioOption === 'function') {
        wx.setInnerAudioOption({
          obeyMuteSwitch: false,
          // 用扬声器播放（false 会走听筒，声音很小）
          speakerOn: true,
          fail: () => {}
        })
      }
    } catch (err) {
      // 老版本基础库没有这个接口，忽略
    }

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })
  },
})