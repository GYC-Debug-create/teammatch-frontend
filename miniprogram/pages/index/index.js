// index.js    
const { request } = require('../../utils/api-service.js')
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const FUNCTION_HUB_PAGE_URL = '/pages/function-hub/function-hub'
const TOKEN_KEY = 'token'

Page({
  data: {
    motto: '登录后进入功能选择页',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false, 
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
  },

  onShow() {
    if (wx.getStorageSync(TOKEN_KEY)) {
      this.goFunctionHub()
    }
  },

  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const nextUserInfo = Object.assign({}, this.data.userInfo, { avatarUrl })
    this.updateProfileAndLogin(nextUserInfo)
  },

  onInputChange(e) {
    const nickName = e.detail.value
    const nextUserInfo = Object.assign({}, this.data.userInfo, { nickName })
    this.updateProfileAndLogin(nextUserInfo)
  },

  getUserProfile() {
    wx.getUserProfile({
      desc: '用于展示用户信息并登录', // 合并你和M2的文案
      success: (res) => {
        console.log('[Index] getUserProfile response', res)
        this.completeLogin(res.userInfo)
      }
    })
  },
  
  updateProfileAndLogin(userInfo) {
    const hasUserInfo = Boolean(userInfo.nickName && userInfo.avatarUrl && userInfo.avatarUrl !== defaultAvatarUrl)
    this.setData({
      userInfo,
      hasUserInfo
    }, () => {
      if (hasUserInfo) {
        this.completeLogin(userInfo)
      }
    })
  },

  async completeLogin(userInfo) {
    try {
      const res = await request({
        url: '/auth/login',
        method: 'POST',
        data: { code: 'test_openid_123' }
      })

      const token = res.data.token
      const nickname = res.data.nickname || ''

      wx.setStorageSync(TOKEN_KEY, token)
      wx.setStorageSync('nickname', nickname)
      wx.setStorageSync('userInfo', userInfo)
      console.log('[Index] login success', { token, userInfo })

      this.setData({
        userInfo,
        hasUserInfo: true
      }, () => {
        wx.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          this.goFunctionHub()
        }, 300)
      })
    } catch (err) {
      const msg = (err && err.message) ? err.message : '登录失败'
      wx.showToast({ title: msg, icon: 'none' })
      console.error('[Index] login failed', err)
    }
  },

  goFunctionHub() {
    wx.switchTab({
      url: FUNCTION_HUB_PAGE_URL
    })
  }
})

