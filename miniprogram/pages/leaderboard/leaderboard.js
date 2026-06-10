// pages/leaderboard/leaderboard.js
var api = require('../../utils/api-service.js')
var request = api.request
var USE_MOCK = api.USE_MOCK

// ========== Mock 数据 ==========
var MOCK_DATA = [
  { rank: 1, userId: 1, username: '张宸铭', githubUsername: 'chenming-zhang', skills: ['React', 'TypeScript', 'Node.js'], repoCount: 47, score: 98.5 },
  { rank: 2, userId: 2, username: '林雨薇', githubUsername: 'yuwei-lin', skills: ['Python', '机器学习', 'Docker'], repoCount: 35, score: 96.2 },
  { rank: 3, userId: 3, username: '赵一航', githubUsername: 'yihang-zhao', skills: ['Vue.js', 'Spring Boot', 'MySQL'], repoCount: 42, score: 94.8 },
  { rank: 4, userId: 4, username: '陈思语', githubUsername: 'siyu-chen', skills: ['Go', 'Kubernetes', 'gRPC'], repoCount: 28, score: 91.3 },
  { rank: 5, userId: 5, username: '王浩然', githubUsername: 'haoran-wang', skills: ['Flutter', 'Firebase', 'Dart'], repoCount: 31, score: 89.7 },
  { rank: 6, userId: 6, username: '周予安', githubUsername: 'yuan-zhou', skills: ['Java', '微服务', 'Redis'], repoCount: 25, score: 87.4 },
  { rank: 7, userId: 7, username: '许之恒', githubUsername: 'zhiheng-xu', skills: ['C++', 'OpenCV', 'PyTorch'], repoCount: 20, score: 84.1 }
]

/**
 * 解析 topLanguages 字段
 * 后端返回可能是 JSON 字符串 "[\"Java\",\"Python\"]" 或已是数组
 */
function parseLanguages(val) {
  if (!val) return []
  if (Array.isArray(val)) return val
  try {
    var parsed = JSON.parse(val)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    // 不是 JSON 字符串，尝试按逗号分割
    return String(val).split(',').map(function(s) { return s.trim() }).filter(Boolean)
  }
}

/**
 * 将后端字段映射为前端 WXML 需要的字段名
 * @param {Object} item  - 后端返回的单条数据
 * @param {number} index - 数组索引，用于生成 rank
 */
function mapItem(item, index) {
  return {
    rank: item.rank != null ? item.rank : (index + 1),
    userId: item.userId,
    username: item.nickname || '未知用户',
    avatarUrl: item.avatarUrl || '',
    githubUsername: item.githubUsername || '',
    giteeUsername: item.giteeUsername || '',
    source: item.source || '',
    skills: item.skills || parseLanguages(item.topLanguages),
    repoCount: item.totalRepos || item.repoCount || 0,
    totalStars: item.totalStars || 0,
    totalCommits: item.totalCommits || 0,
    score: item.techScore || item.score || 0,
    school: item.school || ''
  }
}

Page({
  data: {
    loading: true,
    leaderboardData: [],
    sortType: '',
    hasGithub: false
  },

  onLoad: function(options) {
    var sortType = (options && options.sort) || ''
    this.setData({ sortType: sortType })
    this.loadLeaderboard()
    this.checkGithubBind()
  },

  // 检测用户是否已绑定 GitHub
  async checkGithubBind() {
    try {
      var res = await request({
        url: '/profile/tech-profile',
        method: 'GET'
      })
      var data = res.data || {}
      this.setData({ hasGithub: !!(data.githubUsername || data.giteeUsername) })
    } catch (e) {
      this.setData({ hasGithub: false })
    }
  },

  async loadLeaderboard() {
    var that = this
    this.setData({ loading: true })

    if (USE_MOCK) {
      setTimeout(function() {
        var data = MOCK_DATA.slice()
        // Mock 模式下按类型排序
        var sort = that.data.sortType
        if (sort === 'totalStars') data.sort(function(a, b) { return (b.score || 0) - (a.score || 0) })
        else if (sort === 'totalRepos') data.sort(function(a, b) { return (b.repoCount || 0) - (a.repoCount || 0) })
        // 重新排名
        data.forEach(function(item, i) { item.rank = i + 1 })
        that.setData({ leaderboardData: data, loading: false })
      }, 800)
    } else {
      try {
        var sort = that.data.sortType
        var url = '/leaderboard?page=1&size=20'
        if (sort) url += '&sort=' + sort
        var res = await request({ url: url, method: 'GET' })
        var list = (res.data || []).map(mapItem)
        that.setData({ leaderboardData: list, loading: false })
      } catch (err) {
        that.setData({ loading: false })
        wx.showToast({ title: '加载排行榜失败', icon: 'none' })
      }
    }
  },

  viewProfile: function(e) {
    var item = e.currentTarget.dataset.item
    var userId = (item && item.userId) || ''
    wx.navigateTo({ url: '/pages/profile/profile?userId=' + userId })
  },

  goGitHubBind: function() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  goProjectList: function() {
    wx.navigateTo({
      url: '/pages/projects/list/list'
    })
  }
})
