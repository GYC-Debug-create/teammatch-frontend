// pages/profile-auth/profile-auth.js
var api = require('../../utils/api-service.js')
var request = api.request
var BASE_URL = api.BASE_URL

Page({
  data: {
    avatarUrl: '',
    nickName: '',
    canSubmit: false,
    submitting: false
  },

  onChooseAvatar: function(e) {
    this.setData({ avatarUrl: e.detail.avatarUrl })
    this.checkCanSubmit()
  },

  onInputChange: function(e) {
    this.setData({ nickName: e.detail.value })
    this.checkCanSubmit()
  },

  checkCanSubmit: function() {
    this.setData({ canSubmit: this.data.nickName.trim().length > 0 })
  },

  submitProfile: function() {
    var that = this
    var nickName = this.data.nickName.trim()
    var rawAvatar = this.data.avatarUrl

    if (!nickName) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '保存中...' })

    // 如果选了头像且是临时路径，先上传再保存
    if (rawAvatar && rawAvatar.indexOf('http') !== 0) {
      var token = wx.getStorageSync('token') || ''
      console.log('[profile-auth] 上传头像, 临时路径:', rawAvatar, 'BASE_URL:', BASE_URL)
      wx.uploadFile({
        url: BASE_URL + '/profile/avatar',
        filePath: rawAvatar,
        name: 'file',
        header: { 'Authorization': 'Bearer ' + token },
        success: function(uploadRes) {
          try {
            var data = JSON.parse(uploadRes.data)
            console.log('[profile-auth] 上传响应:', uploadRes.statusCode, JSON.stringify(data))
            if (data.code === '00000' && data.data && data.data.accessUrl) {
              // accessUrl 带签名但 http，转 https 保留签名鉴权
              var url = data.data.accessUrl.replace('http://', 'https://')
              that.doSave(nickName, url)
            } else {
              // 上传失败，用原始路径兜底
              console.warn('[profile-auth] 上传返回非成功码')
              that.doSave(nickName, rawAvatar)
            }
          } catch (e) {
            console.error('[profile-auth] 解析上传响应失败:', e)
            that.doSave(nickName, rawAvatar)
          }
        },
        fail: function(err) {
          console.error('[profile-auth] 上传请求失败:', JSON.stringify(err))
          that.doSave(nickName, rawAvatar)
        }
      })
    } else {
      // 无头像或已是 http URL，直接保存
      this.doSave(nickName, rawAvatar || '')
    }
  },

  doSave: function(nickName, avatarUrl) {
    var that = this
    console.log('[profile-auth] 最终保存 avatarUrl:', avatarUrl)

    // 保存到本地缓存
    wx.setStorageSync('userInfo', {
      avatarUrl: avatarUrl,
      nickName: nickName
    })

    // 同步写入后端
    request({
      url: '/profile/update',
      method: 'PUT',
      data: { nickname: nickName, avatarUrl: avatarUrl }
    }).then(function() {
      wx.hideLoading()
      that.setData({ submitting: false })
      wx.showToast({ title: '授权成功', icon: 'success' })
      setTimeout(function() { wx.navigateBack() }, 800)
    }).catch(function(err) {
      wx.hideLoading()
      that.setData({ submitting: false })
      console.warn('[profile-auth] 后台同步失败:', err)
      wx.showToast({ title: '已授权', icon: 'success' })
      setTimeout(function() { wx.navigateBack() }, 800)
    })
  }
})
