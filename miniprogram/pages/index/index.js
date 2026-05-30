Page({
  data: {
    isLoggedIn: false,
    isEmailVerified: false,
    boards: [
      { name: 'GitHub 活跃', emoji: '🐙' },
      { name: 'Java 技术分', emoji: '☕' },
      { name: '前端技术分', emoji: '⚛️' },
      { name: 'Python 分榜', emoji: '🐍' }
    ]
  },

  onShow() {
    var token = wx.getStorageSync('token')
    var emailVerified = wx.getStorageSync('emailVerified') || false
    this.setData({ isLoggedIn: !!token, isEmailVerified: !!emailVerified })
  },

  goProjectList() {
    wx.navigateTo({ url: '/pages/projects/list/list' })
  },

  goEmailVerify() {
    wx.navigateTo({ url: '/pages/email-verify/email-verify' })
  },

  goLeaderboard() {
    wx.navigateTo({ url: '/pages/leaderboard/leaderboard' })
  }
})
