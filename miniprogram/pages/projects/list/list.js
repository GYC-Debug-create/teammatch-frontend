// pages/projects/list/list.js
var teamService = require('../../../utils/team-service.js')

var PAGE_SIZE = 12

Page({
  data: {
    projects: [],
    allProjects: [],
    searchKeyword: '',
    loading: false,
    displayCount: PAGE_SIZE,
    hasMore: true
  },

  onLoad: function() {
    this.loadProjects()
  },

  loadProjects: function() {
    var that = this
    this.setData({ loading: true })
    teamService.getAllProjects().then(function(list) {
      var mapped = (list || []).map(function(p) {
        return {
          id: p.id || p.projectId,
          title: p.name || p.title || '项目#' + (p.id || p.projectId),
          description: p.description || '',
          boardName: p.boardName || '',
          maxMembers: p.maxMembers || 0,
          currentMembers: p.currentMembers || p.memberCount || 0,
          status: p.status || 'recruiting',
          statusText: p.statusText || p.status || '',
          skills: p.skills || [],
          deadline: p.deadline || '',
          creatorName: p.creatorName || p.leader || ''
        }
      })
      that.setData({ allProjects: mapped, loading: false, displayCount: PAGE_SIZE })
      that.renderPage()
    }).catch(function() {
      that.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  onSearchInput: function(e) {
    this.setData({ searchKeyword: e.detail.value, displayCount: PAGE_SIZE })
    this.renderPage()
  },

  renderPage: function() {
    var keyword = (this.data.searchKeyword || '').trim().toLowerCase()
    var source = this.data.allProjects
    if (keyword) {
      source = source.filter(function(p) {
        return (p.title || '').toLowerCase().indexOf(keyword) > -1
          || (p.description || '').toLowerCase().indexOf(keyword) > -1
      })
    }
    var count = Math.min(this.data.displayCount, source.length)
    this.setData({
      projects: source.slice(0, count),
      hasMore: count < source.length
    })
  },

  onScrollToLower: function() {
    if (!this.data.hasMore) return
    this.setData({ displayCount: this.data.displayCount + PAGE_SIZE })
    this.renderPage()
  },

  onPullDownRefresh: function() {
    this.setData({ displayCount: PAGE_SIZE })
    this.renderPage()
    wx.stopPullDownRefresh()
  },

  goToDetail: function(e) {
    var projectId = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/projects/detail/detail?id=' + projectId })
  }
})
