// pages/profile-auth/profile-auth.js
const { request } = require('../../utils/api-service.js')

Page({
  data: {
    avatarUrl: '',
    nickName: '',
    canSubmit: false,
    submitting: false
  },

  onChooseAvatar: function(e) {
    var avatarUrl = e.detail.avatarUrl
    this.setData({ avatarUrl: avatarUrl })
    this.checkCanSubmit()
  },

  onInputChange: function(e) {
    var nickName = e.detail.value
    this.setData({ nickName: nickName })
    this.checkCanSubmit()
  },

  checkCanSubmit: function() {
    var can = this.data.nickName.trim().length > 0
    this.setData({ canSubmit: can })
  },

  submitProfile: function() {
    var that = this
    var nickName = this.data.nickName.trim()
    if (!nickName) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    this.setData({ submitting: true })

    // 1. 保存到本地缓存
    var userInfo = {
      avatarUrl: this.data.avatarUrl,
      nickName: nickName
    }
    wx.setStorageSync('userInfo', userInfo)

    // 2. 同步写入后端
    request({
      url: '/profile/update',
      method: 'PUT',
      data: {
        nickname: nickName,
        avatarUrl: this.data.avatarUrl
      }
    }).then(function() {
      that.setData({ submitting: false })
      wx.showToast({ title: '授权成功', icon: 'success' })
      setTimeout(function() { wx.navigateBack() }, 800)
    }).catch(function() {
      // 后端写入失败不影响本地授权
      that.setData({ submitting: false })
      wx.showToast({ title: '已授权（后台同步失败）', icon: 'none' })
      setTimeout(function() { wx.navigateBack() }, 1200)
    })
  }
})
