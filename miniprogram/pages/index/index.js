// pages/index/index.js
var request = require('../../utils/api-service.js').request

function parseTopLanguages(val) {
  if (!val) return []
  if (Array.isArray(val)) return val
  try {
    var arr = JSON.parse(val)
    return Array.isArray(arr) ? arr : []
  } catch (e) {
    return []
  }
}

Page({
  data: {
    isLoggedIn: false,
    isEmailVerified: false,
    githubUsername: '',
    hasTechProfile: false,
    techScore: 0,
    totalRepos: 0,
    totalStars: 0,
    totalPrs: 0,
    totalCommits: 0,
    topLanguages: [],
    boards: [
      { name: 'GitHub 活跃', emoji: '🐙' },
      { name: 'Java 技术分', emoji: '☕' },
      { name: '前端技术分', emoji: '⚛️' },
      { name: 'Python 分榜', emoji: '🐍' }
    ]
  },

  onShow: function() {
    var token = wx.getStorageSync('token')
    var emailVerified = wx.getStorageSync('emailVerified') || false
    this.setData({ isLoggedIn: !!token, isEmailVerified: !!emailVerified })
    // 已登录时尝试拉取技术画像
    if (token) this.fetchTechProfile()
  },

  // ===== 技术画像 =====

  // 静默拉取技术画像
  async fetchTechProfile() {
    try {
      var res = await request({
        url: '/profile/tech-profile',
        method: 'GET'
      })
      var data = res.data || {}
      this.setData({
        hasTechProfile: true,
        techScore: data.techScore || 0,
        totalRepos: data.totalRepos || 0,
        totalStars: data.totalStars || 0,
        totalPrs: data.totalPrs || 0,
        totalCommits: data.totalCommits || 0,
        topLanguages: parseTopLanguages(data.topLanguages)
      })
    } catch (err) {
      // 静默失败，用户尚未生成画像
      this.setData({ hasTechProfile: false })
    }
  },

  // GitHub 输入框
  onGitHubInput: function(e) {
    this.setData({ githubUsername: e.detail.value })
  },

  // 生成技术画像 → 绑定 GitHub → 拉取画像
  async generateProfile() {
    var username = this.data.githubUsername.trim()
    if (!username) {
      wx.showToast({ title: '请输入 GitHub 用户名', icon: 'none' })
      return
    }

    wx.showLoading({ title: '生成中...' })

    try {
      await request({
        url: '/profile/github/bind',
        method: 'POST',
        data: { githubUsername: username }
      })

      // 绑定成功，立即拉取技术画像
      var res = await request({
        url: '/profile/tech-profile',
        method: 'GET'
      })
      var data = res.data || {}
      this.setData({
        hasTechProfile: true,
        githubUsername: '',
        techScore: data.techScore || 0,
        totalRepos: data.totalRepos || 0,
        totalStars: data.totalStars || 0,
        totalPrs: data.totalPrs || 0,
        totalCommits: data.totalCommits || 0,
        topLanguages: parseTopLanguages(data.topLanguages)
      })

      wx.hideLoading()
      wx.showToast({ title: 'GitHub 技术画像已生成', icon: 'success' })
    } catch (err) {
      wx.hideLoading()
      var msg = (err && err.message) ? err.message : '生成失败，请重试'
      if (err && err.code === 'M3027') {
        msg = '该 GitHub 账号已被其他用户认领'
      } else if (err && err.code === 'M3000') {
        msg = '登录已过期，请重新登录'
      }
      wx.showToast({ title: msg, icon: 'none', duration: 2000 })
    }
  },

  // ===== 页面跳转 =====

  goProjectList: function() {
    wx.navigateTo({ url: '/pages/projects/list/list' })
  },

  goCreateProject: function() {
    wx.navigateTo({ url: '/pages/projects/create/create' })
  },

  goMemberMatch: function() {
    wx.navigateTo({ url: '/pages/member-match/member-match' })
  },

  goEmailVerify: function() {
    wx.navigateTo({ url: '/pages/email-verify/email-verify' })
  },

  goLeaderboard: function() {
    wx.navigateTo({ url: '/pages/leaderboard/leaderboard' })
  }
})
