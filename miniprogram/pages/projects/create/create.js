// pages/projects/create/create.js
var api = require('../../../utils/api-service.js')
var request = api.request
var USE_MOCK = api.USE_MOCK

// ========== Mock 技能标签 ==========
var MOCK_SKILL_TAGS = [
  { id: 1, name: '微信小程序', category: '', status: 'active' },
  { id: 2, name: 'Spring Boot', category: '', status: 'active' },
  { id: 3, name: 'Vue.js', category: '', status: 'active' },
  { id: 4, name: 'React', category: '', status: 'active' },
  { id: 5, name: 'Python', category: '', status: 'active' },
  { id: 6, name: 'MySQL', category: '', status: 'active' }
]

Page({
  data: {
    form: {
      title: '',
      description: '',
      boardId: '',
      maxMembers: 3,
      skills: [],
      deadline: '',
      deadlineTime: '23:59'
    },
    boardList: [
      { id: 1, name: '小程序开发' },
      { id: 2, name: 'Web应用' },
      { id: 3, name: 'AI应用' },
      { id: 4, name: '校园工具' }
    ],
    skillTagList: [],
    submitting: false,
    errorMsg: ''
  },

  async onLoad() {
    if (USE_MOCK) {
      // Mock 模式：使用本地技能标签
      this.setData({ skillTagList: MOCK_SKILL_TAGS })
    } else {
      // 真实模式：从后端获取技能标签列表
      try {
        var res = await request({
          url: '/profile/skills/tags',
          method: 'GET'
        })
        var tags = (res.data || []).filter(function(t) {
          return t.status === 'active'
        })
        this.setData({ skillTagList: tags })
      } catch (err) {
        // 加载失败时回退到 Mock 数据
        this.setData({ skillTagList: MOCK_SKILL_TAGS })
      }
    }
  },

  // 输入框通用处理
  onInputChange: function(e) {
    var field = e.currentTarget.dataset.field
    this.setData({ ['form.' + field]: e.detail.value, errorMsg: '' })
  },

  // 板块选择
  onBoardChange: function(e) {
    var index = e.detail.value
    var board = this.data.boardList[index]
    this.setData({ 'form.boardId': board.id, errorMsg: '' })
  },

  // 技能选择（多选）
  onSkillToggle: function(e) {
    console.log('onSkillToggle 触发', e.currentTarget.dataset.id, typeof e.currentTarget.dataset.id)
    var form = JSON.parse(JSON.stringify(this.data.form))
    var skillId = parseInt(e.currentTarget.dataset.id, 10)
    var idx = form.skills.indexOf(skillId)
    if (idx > -1) {
      form.skills.splice(idx, 1)
    } else {
      form.skills.push(skillId)
    }
    console.log('skills 更新后:', form.skills)
    this.setData({ form: form, errorMsg: '' })
  },

  // 人数选择
  onMemberChange: function(e) {
    var value = parseInt(e.detail.value) || 1
    this.setData({ 'form.maxMembers': value, errorMsg: '' })
  },

  // 截止日期选择
  onDateChange: function(e) {
    this.setData({ 'form.deadline': e.detail.value, errorMsg: '' })
  },

  // 截止时间选择
  onTimeChange: function(e) {
    this.setData({ 'form.deadlineTime': e.detail.value, errorMsg: '' })
  },

  // 表单提交
  async submitForm() {
    var title = this.data.form.title
    var description = this.data.form.description
    var boardId = this.data.form.boardId
    var skills = this.data.form.skills
    var deadline = this.data.form.deadline
    var deadlineTime = this.data.form.deadlineTime
    var maxMembers = this.data.form.maxMembers

    if (!title.trim()) {
      this.setData({ errorMsg: '请输入项目标题' })
      return
    }
    if (!description.trim()) {
      this.setData({ errorMsg: '请输入项目描述' })
      return
    }
    if (!boardId) {
      this.setData({ errorMsg: '请选择项目板块' })
      return
    }
    if (skills.length === 0) {
      this.setData({ errorMsg: '请至少选择一个技能需求' })
      return
    }
    if (!deadline) {
      this.setData({ errorMsg: '请选择截止日期' })
      return
    }
    if (maxMembers < 2) {
      this.setData({ errorMsg: '项目人数至少为 2 人' })
      return
    }

    console.log('提交的 skills:', skills, '类型:', typeof skills[0], '数量:', skills.length)

    this.setData({ submitting: true, errorMsg: '' })

    var userInfo = wx.getStorageSync('userInfo') || {}
    var creatorId = userInfo.id || 1

    try {
      await request({
        url: '/m4/projects',
        method: 'POST',
        data: {
          title: title.trim(),
          description: description.trim(),
          boardId: boardId,
          maxMembers: maxMembers,
          skills: skills,
          deadline: deadline + 'T' + deadlineTime + ':00',
          creatorId: creatorId
        }
      })

      this.setData({ submitting: false })
      wx.showToast({ title: '项目发布成功', icon: 'success' })
      setTimeout(function() {
        wx.redirectTo({ url: '/pages/projects/list/list' })
      }, 1000)
    } catch (err) {
      this.setData({ submitting: false })
      var msg = (err && err.message) ? err.message : '发布失败，请重试'
      this.setData({ errorMsg: msg })
    }
  }
})
