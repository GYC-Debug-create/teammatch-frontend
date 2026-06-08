// pages/profile/edit.js
const { request } = require('../../../utils/api-service.js')
const teamService = require('../../../utils/team-service.js')

Page({
  data: {
    form: {
      nickname: '',
      avatarUrl: '',
      school: '',
      major: '',
      grade: '',
      bio: ''
    },
    isLoading: false,
    loadingData: true,
    errorMsg: ''
  },

  onLoad() {
    this.loadFromBackend()
  },

  // 从后端获取最新档案，自动填充表单
  async loadFromBackend() {
    this.setData({ loadingData: true })
    try {
      var res = await request({
        url: '/profile/detail',
        method: 'GET'
      })
      var data = res.data || {}
      var form = {
        nickname: data.nickname || '',
        avatarUrl: data.avatarUrl || data.avatar_url || '',
        school: data.school || '',
        major: data.major || '',
        grade: data.grade || '',
        bio: data.bio || ''
      }

      // 微信授权数据优先覆盖（可能比后端新）
      var userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        var wxNick = userInfo.nickName || userInfo.nickname
        if (wxNick && wxNick !== '微信用户') form.nickname = wxNick
        var wxAvatar = userInfo.avatarUrl || userInfo.avatar
        if (wxAvatar) form.avatarUrl = wxAvatar
      }

      this.setData({ form: form, loadingData: false })
    } catch (err) {
      // 后端失败，回退本地缓存
      this.loadFromCache()
    }
  },

  // 回退方案：从本地缓存加载
  loadFromCache() {
    var profile = wx.getStorageSync('profile')
    var userInfo = wx.getStorageSync('userInfo')
    var form = {
      nickname: 'TeamMatch User',
      avatarUrl: '',
      school: '',
      major: '',
      grade: '',
      bio: ''
    }
    if (profile) form = { ...form, ...profile }
    if (userInfo) {
      var wxNick = userInfo.nickName || userInfo.nickname
      if (wxNick && wxNick !== '微信用户') form.nickname = wxNick
      var wxAvatar = userInfo.avatarUrl || userInfo.avatar
      if (wxAvatar) form.avatarUrl = wxAvatar
    }
    this.setData({ form: form, loadingData: false })
  },

  // 选择头像
  onChooseAvatar(e) {
    var avatarUrl = e.detail.avatarUrl
    this.setData({ ['form.avatarUrl']: avatarUrl })
  },

  // 通用的输入框处理函数
  onFieldChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value, errorMsg: '' })
  },

  // 保存档案
  async saveProfile() {
    const { form } = this.data
    if (!form.nickname.trim() || !form.school.trim()) {
      this.setData({ errorMsg: '昵称和学校不能为空' })
      return
    }

    this.setData({ isLoading: true, errorMsg: '' })

    try {
      await request({
        url: '/profile/update',
        method: 'PUT',
        data: form
      })
      // 同步更新缓存
      var userInfo = wx.getStorageSync('userInfo') || {}
      if (form.nickname) userInfo.nickName = form.nickname
      if (form.avatarUrl) userInfo.avatarUrl = form.avatarUrl
      wx.setStorageSync('userInfo', userInfo)
      wx.setStorageSync('profile', form)
      // 清除档案缓存，下次重新拉取
      teamService.clearProfileCache()
      wx.showToast({ title: '档案保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (err) {
      const msg = (err && err.message) ? err.message : '保存失败，请稍后重试'
      this.setData({ errorMsg: msg })
    } finally {
      this.setData({ isLoading: false })
    }
  }
})
