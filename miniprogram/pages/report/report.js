/*
 * T-043 举报入口页
 * 基线约束（V2.1）：
 * 1. 举报对象范围 P0 仅支持 user / project
 * 2. 不支持将 evaluation 作为 target_type
 * 3. 举报提交后状态 pending，后台处理
 * 4. 统一成功响应码 code: 200
 */

const teamService = require('../../utils/team-service.js')

function buildTagStates(tags, selected) {
  var map = {}
  for (var i = 0; i < tags.length; i++) {
    map[tags[i]] = selected.indexOf(tags[i]) > -1
  }
  return map
}

Page({
  data: {
    reportType: 'user',
    searchKeyword: '',
    searchResults: [],
    selectedTarget: null,

    reasons: ['虚假信息', '恶意行为', '骚扰', '侵权内容', '其他'],
    selectedReasons: [],

    description: '',
    descriptionLength: 0,
    maxDescriptionLength: 500,

    images: [],
    maxImages: 3,

    submitting: false,
    canSubmit: false,

    _tagStates: {}
  },

  onLoad() {
    // 无异步操作
  },

  onReady() {
    this.setData({
      _tagStates: buildTagStates(this.data.reasons, this.data.selectedReasons)
    })
  },

  goBack() {
    wx.navigateBack()
  },

  // 切换举报类型
  switchType(e) {
    var type = e.currentTarget.dataset.type
    if (type !== this.data.reportType) {
      this.setData({
        reportType: type,
        searchKeyword: '',
        searchResults: [],
        selectedTarget: null
      })
      this.checkCanSubmit()
    }
  },

  // 搜索输入
  onSearchInput(e) {
    var keyword = e.detail.value
    this.setData({ searchKeyword: keyword })
    if (keyword.trim()) {
      this.mockSearch(keyword)
    } else {
      this.setData({ searchResults: [] })
    }
  },

  // Mock 搜索
  mockSearch(keyword) {
    var results
    if (this.data.reportType === 'user') {
      results = [
        { id: 101, name: '林乔', avatarText: '林', grade: '22级', desc: '软件工程 · 计算机学院' },
        { id: 102, name: '周予安', avatarText: '周', grade: '21级', desc: '计算机科学' }
      ]
    } else {
      results = [
        { id: 201, name: 'AI创新实践队', avatarText: 'AI', desc: '校园失物招领智能助手' },
        { id: 202, name: '智能课表小程序', avatarText: '课', desc: '课程表管理与分享' }
      ]
    }
    this.setData({
      searchResults: results.filter(function(item) {
        return item.name.indexOf(keyword) > -1
      })
    })
  },

  // 选中搜索结果
  selectTarget(e) {
    var item = e.currentTarget.dataset.item
    this.setData({
      selectedTarget: item,
      searchKeyword: '',
      searchResults: []
    })
    this.checkCanSubmit()
  },

  // 移除已选对象
  removeTarget() {
    this.setData({ selectedTarget: null })
    this.checkCanSubmit()
  },

  // 切换原因
  toggleReason(e) {
    var reason = e.currentTarget.dataset.reason
    var arr = this.data.selectedReasons.slice()
    var idx = arr.indexOf(reason)
    if (idx > -1) arr.splice(idx, 1)
    else arr.push(reason)
    this.setData({
      selectedReasons: arr,
      _tagStates: buildTagStates(this.data.reasons, arr)
    })
    this.checkCanSubmit()
  },

  // 详细说明输入
  onDescriptionInput(e) {
    var value = e.detail.value
    this.setData({
      description: value,
      descriptionLength: value.length
    })
    this.checkCanSubmit()
  },

  // 选择图片（Mock）
  chooseImage() {
    if (this.data.images.length >= this.data.maxImages) {
      wx.showToast({ title: '最多上传3张', icon: 'none' })
      return
    }
    wx.showToast({ title: '选择图片（Mock）', icon: 'none' })
  },

  // 删除图片
  deleteImage(e) {
    var index = e.currentTarget.dataset.index
    var images = this.data.images.slice()
    images.splice(index, 1)
    this.setData({ images: images })
  },

  // 校验提交
  checkCanSubmit() {
    var selected = this.data.selectedTarget
    var reasons = this.data.selectedReasons
    var desc = this.data.description
    var can = selected && reasons.length > 0 && desc.trim().length > 0
    this.setData({ canSubmit: can })
  },

  // 提交举报
  async handleSubmit() {
    if (!this.data.canSubmit || this.data.submitting) return
    this.setData({ submitting: true })
    try {
      await teamService.submitReport({
        targetType: this.data.reportType,
        targetId: this.data.selectedTarget.id,
        reasons: this.data.selectedReasons,
        description: this.data.description,
        images: this.data.images
      })
      wx.showToast({ title: '举报已提交', icon: 'success' })
      setTimeout(function() { wx.navigateBack() }, 1500)
    } catch (err) {
      var code = err && err.code
      var msg = '提交失败，请重试'
      if (code === 409) msg = '您已提交过相同举报'
      else if (code === 422) msg = '举报内容不符合要求'
      wx.showToast({ title: msg, icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
