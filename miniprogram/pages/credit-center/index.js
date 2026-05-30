Page({
  data: {
    creditScore: 100,
    scoreLevel: 'green'
  },

  onShow() {
    this.loadScore()
  },

  loadScore() {
    var score = wx.getStorageSync('creditScore') || 100
    var level = score >= 80 ? 'green' : score >= 50 ? 'orange' : 'red'
    this.setData({ creditScore: score, scoreLevel: level })
  },

  goCreditHistory() {
    wx.navigateTo({ url: '/pages/credit-history/credit-history' })
  },

  goReport() {
    wx.navigateTo({ url: '/pages/report/report' })
  },

  goAppeal() {
    wx.navigateTo({ url: '/pages/appeal/appeal' })
  },

  goMyReports() {
    wx.navigateTo({ url: '/pages/my-reports/my-reports' })
  },

  goMyAppeals() {
    wx.navigateTo({ url: '/pages/my-appeals/my-appeals' })
  }
})
