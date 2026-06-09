// pages/my-center/my-center.js
var api = require('../../utils/api-service.js')
var request = api.request
var USE_MOCK = api.USE_MOCK

Page({
  data: {
    loading: true,
    hasUserProfile: false,
    userInfo: {
      nickname: 'TeamMatch 用户',
      avatarUrl: '',
      creditScore: 100,
      emailVerified: false,
      email: '',
      school: ''
    },
    menuList: [
      {
        id: 'projects',
        icon: '📁',
        title: '我的项目',
        desc: '查看已加入和管理的项目',
        action: 'goProjectList'
      },
      {
        id: 'profile',
        icon: '👤',
        title: '我的档案',
        desc: '编辑个人基本信息和简介',
        action: 'goProfileEdit'
      },
      {
        id: 'skills',
        icon: '🏷️',
        title: '技能标签',
        desc: '管理你的技术技能标签',
        action: 'goSkills'
      },
      {
        id: 'email',
        icon: '📧',
        title: '邮箱认证',
        desc: '绑定邮箱完成身份验证',
        action: 'goEmailVerify'
      }
    ]
  },

  onLoad: function() {
    this.loadUserProfile()
    this.setData({ loading: false })
    this.loadProfileDetail()
  },

  onShow: function() {
    this.loadUserProfile()
    this.loadProfileDetail()
  },

  loadUserProfile: function() {
    var userInfo = wx.getStorageSync('userInfo')

    // 清理无效的旧缓存
    if (userInfo && typeof userInfo === 'object') {
      var avatarOk = userInfo.avatarUrl &&
                     typeof userInfo.avatarUrl === 'string' &&
                     userInfo.avatarUrl.indexOf('http') === 0
      var nickOk = userInfo.nickName &&
                   typeof userInfo.nickName === 'string' &&
                   userInfo.nickName !== '微信用户'
      if (!avatarOk || !nickOk) {
        wx.removeStorageSync('userInfo')
        userInfo = null
      }
    }

    if (userInfo && userInfo.avatarUrl && userInfo.nickName) {
      this.setData({
        hasUserProfile: true,
        'userInfo.avatarUrl': userInfo.avatarUrl,
        'userInfo.nickname': userInfo.nickName
      })
      return
    }

    // 没有微信授权时，后端数据在 loadProfileDetail 中异步填充
    this.setData({ hasUserProfile: false })
  },

  // 拉取后端档案数据（昵称、头像、信誉分等）
  async loadProfileDetail() {
    if (USE_MOCK) return

    try {
      var res = await request({
        url: '/profile/detail',
        method: 'GET'
      })
      var data = res.data || {}
      var update = {
        'userInfo.creditScore': data.creditScore != null ? data.creditScore : this.data.userInfo.creditScore,
        'userInfo.emailVerified': data.emailVerified || false,
        'userInfo.email': data.email || '',
        'userInfo.school': data.school || ''
      }

      // 没有微信授权时，用后端档案的昵称和头像
      if (!this.data.hasUserProfile) {
        if (data.nickname && data.nickname !== 'TeamMatch User') {
          update['userInfo.nickname'] = data.nickname
        }
        if (data.avatarUrl || data.avatar_url) {
          update['userInfo.avatarUrl'] = data.avatarUrl || data.avatar_url
        }
      }

      this.setData(update)
    } catch (err) {
      console.log('[my-center] 档案数据拉取失败，使用默认值')
    }
  },

  goProfileAuth: function() {
    wx.navigateTo({
      url: '/pages/profile-auth/profile-auth'
    })
  },

  goProjectList: function() {
    // 跳转组队中心的"已加入项目" Tab
    wx.setStorageSync('teamTab', 'joined')
    wx.switchTab({ url: '/pages/team-center/index' })
  },

  goProfileEdit: function() {
    wx.navigateTo({
      url: '/pages/profile/edit/edit'
    })
  },

  goSkills: function() {
    wx.navigateTo({
      url: '/pages/profile/skills/skills'
    })
  },

  goEmailVerify: function() {
    wx.navigateTo({
      url: '/pages/email-verify/email-verify'
    })
  },

  doLogout: function() {
    var that = this
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: function(res) {
        if (res.confirm) {
          // 清除登录 token
          wx.removeStorageSync('token')
          wx.removeStorageSync('accessToken')
          wx.removeStorageSync('userToken')
          wx.removeStorageSync('sessionToken')
          wx.removeStorageSync('profile')
          wx.removeStorageSync('userInfo')

          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 1200
          })

          setTimeout(function() {
            wx.redirectTo({
              url: '/pages/login/login'
            })
          }, 1200)
        }
      }
    })
  }
})
