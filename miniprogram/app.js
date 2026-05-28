// app.js
var apiService = require('./utils/api-service')

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

    // 自动登录获取 token
    this.autoLogin()
  },

  async autoLogin() {
    var token = wx.getStorageSync('token') || ''
    // 已有 token 则跳过登录
    if (token) {
      console.log('[app] 已有 token，跳过登录')
      return
    }

    try {
      var result = await apiService.login('test123')
      if (result && result.token) {
        wx.setStorageSync('token', result.token)
        wx.setStorageSync('userId', result.id)
        this.globalData.userId = result.id
        this.globalData.userInfo = result
        console.log('[app] 自动登录成功, userId:', result.id)
      }
    } catch (err) {
      console.error('[app] 自动登录失败:', err)
    }
  },

  globalData: {
    userInfo: null,
    userId: 2
  }
})
