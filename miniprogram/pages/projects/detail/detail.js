// pages/projects/detail/detail.js
var api = require('../../../utils/api-service.js')
var request = api.request
var teamService = require('../../../utils/team-service.js')
var USE_MOCK = api.USE_MOCK

// ========== Mock 项目详情 ==========
var MOCK_DETAIL = {
  id: 1,
  title: '校园二手交易小程序',
  description: '开发一个面向全校师生的二手物品交易平台，支持商品发布、搜索、在线沟通、订单管理等功能。前端采用微信小程序，后端使用 Spring Boot + MySQL。',
  boardName: '小程序开发',
  maxMembers: 5,
  currentMembers: 3,
  status: 'recruiting',
  statusText: '招募中',
  skills: ['微信小程序', 'Spring Boot', 'MySQL', 'Vue.js'],
  deadline: '2026-06-15',
  creatorName: '张三',
  creatorAvatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
  members: [
    { id: 1, name: '张三', role: '队长', avatar: '' },
    { id: 2, name: '李四', role: '成员', avatar: '' },
    { id: 3, name: '王五', role: '成员', avatar: '' }
  ],
  createdAt: '2026-04-01'
}

// status 值 → 展示文案
function getStatusText(status) {
  var map = {
    'recruiting': '招募中',
    'in_progress': '进行中',
    'ended': '已结束'
  }
  return map[status] || status
}

Page({
  data: {
    project: null,
    loading: false
  },

  onLoad: function(options) {
    var projectId = options.id || 1
    this.loadProjectDetail(projectId)
  },

  async loadProjectDetail(projectId) {
    this.setData({ loading: true })

    if (USE_MOCK) {
      // Mock 模式
      var that = this
      setTimeout(function() {
        that.setData({
          project: MOCK_DETAIL,
          loading: false
        })
      }, 600)
    } else {
      // 真实模式：调用 GET /m4/projects/{projectId}
      try {
        var res = await request({
          url: '/m4/projects/' + projectId,
          method: 'GET'
        })
        // 检查项目是否存在
        if (!res.data) {
          var msg = '项目不存在'
          wx.showToast({ title: msg, icon: 'none', duration: 2000 })
          this.setData({ loading: false })
          setTimeout(function() { wx.navigateBack() }, 2000)
          return
        }

        var data = res.data
        this.setData({
          project: {
            id: data.id || projectId,
            title: data.title || '',
            description: data.description || '',
            boardName: data.boardName || data.board_name || '',
            maxMembers: data.maxMembers || data.max_members || 0,
            currentMembers: data.currentMembers || data.current_members || 0,
            status: data.status || '',
            statusText: getStatusText(data.status),
            skills: data.skills || [],
            deadline: data.deadline || '',
            creatorId: data.creatorId || data.creator_id || 0,
            isCreator: parseInt(data.creatorId || data.creator_id || 0) === parseInt(wx.getStorageSync('userId'))
            creatorName: data.creatorName || data.creator_name || '',
            creatorAvatar: data.creatorAvatar || data.creator_avatar || '',
            members: data.members || [],
            createdAt: data.createdAt || data.created_at || ''
          },
          loading: false
        })
      } catch (err) {
        this.setData({ loading: false })
        wx.showToast({ title: '加载失败', icon: 'none' })
      }
    }
  },

  // 申请加入
  applyJoin: function() {
    var that = this
    var projectId = this.data.project.id
    var toUserId = this.data.project.creatorId  // 项目队长
    var fromUserId = parseInt(wx.getStorageSync('userId')) || 0
    wx.showModal({
      title: '申请加入',
      content: '确定要申请加入「' + (this.data.project.title || '') + '」吗？',
      success: function(res) {
        if (!res.confirm) return
        wx.showLoading({ title: '申请中' })
        teamService.sendApplyRequest(projectId, fromUserId, toUserId, '我对这个项目很感兴趣，希望能加入团队').then(function() {
          wx.hideLoading()
          wx.showToast({ title: '申请已发送', icon: 'success' })
        }).catch(function(err) {
          wx.hideLoading()
          var msg = (err && err.message) || '申请失败'
          if (err && err.code === 'M1003') msg = '您已申请过该项目'
          wx.showToast({ title: msg, icon: 'none' })
        })
      }
    })
  },

  // 查看成员详情（占位，后续串通）
  viewMember: function(e) {
    var memberId = e.currentTarget.dataset.id
    wx.showToast({ title: '查看成员 ' + memberId, icon: 'none' })
  }
})
