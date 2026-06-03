// pages/profile-auth/profile-auth.js
Page({
  data: {
    avatarUrl: '',
    nickName: '',
    canSubmit: false
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

    var userInfo = {
      avatarUrl: this.data.avatarUrl,
      nickName: nickName
    }
    wx.setStorageSync('userInfo', userInfo)
    console.log('[profile-auth] 保存 userInfo:', userInfo)

    wx.showToast({ title: '授权成功', icon: 'success' })
    setTimeout(function() {
      wx.navigateBack()
    }, 800)
  }
})
