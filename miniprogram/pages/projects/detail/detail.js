// pages/projects/detail/detail.js
var api = require('../../../utils/api-service.js')
var request = api.request
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
        var data = res.data || {}
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

  // 申请加入（占位，后续实现）
  applyJoin: function() {
    wx.showToast({ title: '申请功能开发中', icon: 'none' })
  },

  // 查看成员详情（占位，后续串通）
  viewMember: function(e) {
    var memberId = e.currentTarget.dataset.id
    wx.showToast({ title: '查看成员 ' + memberId, icon: 'none' })
  }
})
