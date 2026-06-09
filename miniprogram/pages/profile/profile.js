// pages/profile/profile.js
var teamService = require('../../utils/team-service.js')
var apiService = require('../../utils/api-service.js')

Page({
  data: {
    loading: true,
    user: null
  },

  onLoad: function(options) {
    var userId = options.userId || ''
    this.loadUserProfile(userId)
  },

  async loadUserProfile(userId) {
    // Mock 模式：使用假数据
    if (apiService.USE_MOCK) {
      var that = this
      setTimeout(function() {
        that.setData({
          user: {
            nickname: '林乔',
            avatarUrl: '',
            school: '元宇宙大学',
            major: '软件工程 22级',
            grade: '2022级',
            bio: 'Vue.js 重度用户，追求代码优雅。热爱前端技术，喜欢参与开源项目。',
            creditScore: 96,
            githubUsername: 'linqiao-vue',
            email: 'user-6ecb17e3@example.invalid'
          },
          loading: false
        })
      }, 400)
      return
    }

    // 真实模式
    try {
      var profile = await teamService.getUserProfile(userId)
      this.setData({
        user: {
          nickname: profile.nickname || '未知用户',
          avatarUrl: profile.avatarUrl || profile.avatar || '',
          school: profile.school || '',
          major: profile.major || '',
          grade: profile.grade || '',
          bio: profile.bio || '',
          creditScore: profile.creditScore || profile.trustScore || 0,
          githubUsername: profile.githubUsername || '',
          email: profile.email || ''
        },
        loading: false
      })
    } catch (err) {
      this.setData({ loading: false })
      wx.showToast({ title: '加载用户信息失败', icon: 'none' })
    }
  }
})
