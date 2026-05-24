// pages/my-center/my-center.js
Page({
  data: {
    loading: true,
    userInfo: {
      nickname: 'TeamMatch 用户',
      creditScore: 100
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
        desc: '绑定学校邮箱完成身份验证',
        action: 'goEmailVerify'
      },
      {
        id: 'credit',
        icon: '⭐',
        title: '信誉分详情',
        desc: '查看信誉分变化与历史记录',
        action: 'goCredit'
      }
    ]
  },

  onLoad() {
    this.setData({ loading: true })

    // 从本地缓存读取用户信息
    const profile = wx.getStorageSync('profile')
    if (profile && profile.nickname) {
      this.setData({
        'userInfo.nickname': profile.nickname
      })
    }

    setTimeout(() => {
      this.setData({ loading: false })
    }, 600)
  },

  goProjectList() {
    wx.navigateTo({
      url: '/pages/projects/list/list'
    })
  },

  goProfileEdit() {
    wx.navigateTo({
      url: '/pages/profile/edit/edit'
    })
  },

  goSkills() {
    wx.navigateTo({
      url: '/pages/profile/skills/skills'
    })
  },

  goEmailVerify() {
    wx.navigateTo({
      url: '/pages/email-verify/email-verify'
    })
  },

  goCredit() {
    wx.showToast({
      title: '信誉分功能开发中',
      icon: 'none',
      duration: 1500
    })
  },

  doLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录 token
          wx.removeStorageSync('token')
          wx.removeStorageSync('accessToken')
          wx.removeStorageSync('userToken')
          wx.removeStorageSync('sessionToken')
          wx.removeStorageSync('profile')

          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 1200
          })

          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/login/login'
            })
          }, 1200)
        }
      }
    })
  }
})
