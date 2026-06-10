// pages/index/index.js
var request = require('../../utils/api-service.js').request

function parseTopLanguages(val) {
  if (!val) return []
  if (Array.isArray(val)) return val
  try { var arr = JSON.parse(val); return Array.isArray(arr) ? arr : [] }
  catch (e) { return [] }
}

Page({
  data: {
    isLoggedIn: false,
    isEmailVerified: false,
    githubUsername: '',
    showUpdateInput: false,
    bindPlatform: '',
    updatePlatform: '',
    boundGithub: '',
    boundGitee: '',
    boundPlatform: '',
    hasTechProfile: false,
    techScore: 0, totalRepos: 0, totalStars: 0, totalPrs: 0, totalCommits: 0,
    topLanguages: [],
    boards: [
      { name: '综合技术分', emoji: '🐙', sort: 'techScore' },
      { name: 'Stars 星标', emoji: '⭐', sort: 'totalStars' },
      { name: '开源仓库', emoji: '📦', sort: 'totalRepos' },
      { name: '代码贡献', emoji: '💻', sort: 'totalCommits' }
    ]
  },

  onShow: function() {
    var token = wx.getStorageSync('token')
    var emailVerified = wx.getStorageSync('emailVerified') || false
    this.setData({ isLoggedIn: !!token, isEmailVerified: !!emailVerified })
    if (token) this.fetchTechProfile()
  },

  async fetchTechProfile() {
    try {
      var res = await request({ url: '/profile/tech-profile', method: 'GET' })
      var data = res.data || {}
      var platform = data.githubUsername ? 'github' : data.giteeUsername ? 'gitee' : ''
      this.setData({
        hasTechProfile: true,
        boundGithub: data.githubUsername || '',
        boundGitee: data.giteeUsername || '',
        boundPlatform: platform,
        techScore: data.techScore || 0,
        totalRepos: data.totalRepos || 0,
        totalStars: data.totalStars || 0,
        totalPrs: data.totalPrs || 0,
        totalCommits: data.totalCommits || 0,
        topLanguages: parseTopLanguages(data.topLanguages)
      })
    } catch (err) {
      this.setData({ hasTechProfile: false })
    }
  },

  onGitHubInput: function(e) {
    this.setData({ githubUsername: e.detail.value })
  },

  // ===== 首次绑定 =====

  // 点击"生成" → 选择平台
  startBind: function() {
    var that = this
    wx.showActionSheet({
      itemList: ['GitHub', 'Gitee'],
      success: function(res) {
        var platform = res.tapIndex === 0 ? 'github' : 'gitee'
        that.setData({ bindPlatform: platform, showUpdateInput: false })
      }
    })
  },

  // 确认绑定
  async doBind() {
    var username = this.data.githubUsername.trim()
    var platform = this.data.bindPlatform
    if (!username) {
      wx.showToast({ title: '请输入用户名', icon: 'none' })
      return
    }
    wx.showLoading({ title: '生成中...' })
    try {
      console.log('[bind] 请求:', platform, '/profile/' + platform + '/bind', { githubUsername: username, giteeUsername: username })
      var res = await request({
        url: '/profile/' + platform + '/bind',
        method: 'POST',
        data: platform === 'github' ? { githubUsername: username } : { giteeUsername: username }
      })
      console.log('[bind] 成功:', res)
      wx.hideLoading()
      wx.showToast({ title: (platform === 'github' ? 'GitHub' : 'Gitee') + ' 技术画像已生成', icon: 'success' })
      this.setData({
        bindPlatform: '', githubUsername: '',
        hasTechProfile: true,
        boundPlatform: platform,
        boundGithub: platform === 'github' ? username : '',
        boundGitee: platform === 'gitee' ? username : ''
      })
      this.fetchTechProfile()
    } catch (err) {
      wx.hideLoading()
      console.error('[bind] 失败:', JSON.stringify(err), 'code:', err && err.code, 'message:', err && err.message)
      // 用 raw wx.request 再调一次，看后端原始返回
      wx.request({
        url: 'http://localhost:8080/api/profile/' + platform + '/bind',
        method: 'POST',
        header: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + wx.getStorageSync('token') },
        data: platform === 'github' ? { githubUsername: username } : { giteeUsername: username },
        success: function(r) { console.log('[bind-raw] statusCode:', r.statusCode, 'body:', JSON.stringify(r.data)) },
        fail: function(r) { console.error('[bind-raw] 网络失败:', r) }
      })
      var msg = (err && err.message) || '生成失败'
      wx.showToast({ title: msg, icon: 'none', duration: 2000 })
    }
  },

  // ===== 换绑 =====

  startRebind: function() {
    var that = this
    wx.showActionSheet({
      itemList: ['GitHub', 'Gitee'],
      success: function(res) {
        var platform = res.tapIndex === 0 ? 'github' : 'gitee'
        that.setData({ updatePlatform: platform, showUpdateInput: true, bindPlatform: '' })
      }
    })
  },

  // 取消换绑
  cancelUpdate: function() {
    this.setData({ showUpdateInput: false, updatePlatform: '', githubUsername: '' })
  },

  // 提交换绑
  async doUpdate() {
    var username = this.data.githubUsername.trim()
    var platform = this.data.updatePlatform
    if (!username) {
      wx.showToast({ title: '请输入用户名', icon: 'none' })
      return
    }
    wx.showLoading({ title: '更新中...' })
    try {
      var samePlatform = platform === this.data.boundPlatform
      var apiPath = samePlatform ? '/profile/' + platform + '/update' : '/profile/' + platform + '/bind'
      var apiMethod = samePlatform ? 'PUT' : 'POST'
      console.log('[update] 请求:', platform, apiPath, { githubUsername: username, giteeUsername: username })
      await request({
        url: apiPath,
        method: apiMethod,
        data: platform === 'github' ? { githubUsername: username } : { giteeUsername: username }
      })
      wx.hideLoading()
      wx.showToast({ title: '已更新，同步中...', icon: 'success' })
      this.setData({ showUpdateInput: false, updatePlatform: '', githubUsername: '' })
      this.fetchTechProfile()
    } catch (err) {
      wx.hideLoading()
      console.error('[update] 失败:', JSON.stringify(err), 'code:', err && err.code)
      var msg = (err && err.message) || '更新失败'
      wx.showToast({ title: msg, icon: 'none' })
    }
  },

  // ===== 页面跳转 =====

  goProjectList: function() { wx.navigateTo({ url: '/pages/projects/list/list' }) },
  goCreateProject: function() { wx.navigateTo({ url: '/pages/projects/create/create' }) },
  goMemberMatch: function() { wx.navigateTo({ url: '/pages/member-match/member-match' }) },
  goEmailVerify: function() { wx.navigateTo({ url: '/pages/email-verify/email-verify' }) },
  goLeaderboard: function(e) {
    var sort = e.currentTarget.dataset.sort || ''
    wx.navigateTo({ url: '/pages/leaderboard/leaderboard?sort=' + sort })
  }
})
