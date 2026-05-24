// pages/projects/list/list.js
var api = require('../../../utils/api-service.js')
var request = api.request
var USE_MOCK = api.USE_MOCK

// ========== Mock 项目数据 ==========
var MOCK_PROJECTS = [
  {
    id: 1,
    title: '校园二手交易小程序',
    description: '开发一个面向全校师生的二手物品交易平台',
    boardName: '小程序开发',
    maxMembers: 5,
    currentMembers: 3,
    status: 'recruiting',
    statusText: '招募中',
    skills: ['Java', 'Spring Boot', 'Vue.js'],
    deadline: '2026-06-15',
    creatorName: '张三'
  },
  {
    id: 2,
    title: '智能课表助手',
    description: '基于AI算法的智能课程推荐与时间管理工具',
    boardName: 'AI应用',
    maxMembers: 4,
    currentMembers: 4,
    status: 'in_progress',
    statusText: '进行中',
    skills: ['Python', '机器学习', 'Flutter'],
    deadline: '2026-05-30',
    creatorName: '李四'
  },
  {
    id: 3,
    title: '校园活动发布平台',
    description: '社团活动在线发布、报名、签到一体化解决方案',
    boardName: 'Web应用',
    maxMembers: 6,
    currentMembers: 2,
    status: 'recruiting',
    statusText: '招募中',
    skills: ['React', 'Node.js', 'MySQL'],
    deadline: '2026-07-01',
    creatorName: '王五'
  },
  {
    id: 4,
    title: '图书馆座位预约系统',
    description: '在线查看图书馆座位状态并提前预约',
    boardName: '校园工具',
    maxMembers: 3,
    currentMembers: 3,
    status: 'ended',
    statusText: '已结束',
    skills: ['微信小程序', '云开发'],
    deadline: '2026-04-20',
    creatorName: '赵六'
  },
  {
    id: 5,
    title: '校园跑腿服务平台',
    description: '代取快递、代买物品等跑腿服务匹配平台',
    boardName: '小程序开发',
    maxMembers: 5,
    currentMembers: 5,
    status: 'recruiting',
    statusText: '招募中',
    skills: ['uni-app', 'Express', 'MongoDB'],
    deadline: '2026-06-20',
    creatorName: '孙七'
  }
]

Page({
  data: {
    projects: [],
    loading: false,
    noMore: false
  },

  onLoad: function() {
    this.loadProjects()
  },

  // 加载项目列表（Mock/真实由 USE_MOCK 控制）
  async loadProjects() {
    this.setData({ loading: true })

    if (USE_MOCK) {
      // Mock 模式：使用本地数据，模拟延迟
      var that = this
      setTimeout(function() {
        that.setData({
          projects: MOCK_PROJECTS,
          loading: false
        })
      }, 800)
    } else {
      // 真实模式：调用后端接口
      try {
        var res = await request({
          url: '/m4/projects?pageNum=1&pageSize=20',
          method: 'GET'
        })
        this.setData({
          projects: res.data && res.data.records ? res.data.records : (res.data || []),
          loading: false
        })
      } catch (err) {
        this.setData({ loading: false })
        wx.showToast({ title: '加载失败', icon: 'none' })
      }
    }
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadProjects()
    wx.stopPullDownRefresh()
  },

  // 上拉加载更多（占位，后续联调时实现）
  onReachBottom: function() {
    if (this.data.noMore) return
    wx.showToast({ title: '没有更多项目了', icon: 'none' })
    this.setData({ noMore: true })
  },

  // 跳转项目详情（暂不实现，后续统一串通）
  goToDetail: function(e) {
    var projectId = e.currentTarget.dataset.id
    wx.showToast({ title: '查看项目 ' + projectId, icon: 'none' })
    // 后续改为：wx.navigateTo({ url: '/pages/projects/detail/detail?id=' + projectId })
  }
})
