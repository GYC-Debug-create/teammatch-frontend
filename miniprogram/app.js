// app.js
App({
  onLaunch() {
    // 全局未捕获 Promise 错误处理
    if (typeof wx.onUnhandledRejection === 'function') {
      wx.onUnhandledRejection(function(res) {
        console.error('[Global] 未捕获的 Promise 错误:', res.reason)
      })
    }

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: function(res) {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null,
    userId: 1
  }
})
