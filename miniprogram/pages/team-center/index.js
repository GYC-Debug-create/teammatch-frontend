var teamService = require('../../utils/team-service')

Page({
  data: {
    activeTab: 'discover',
    joinedProjects: [],
    pendingVotes: [],
    loadingJoined: false
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    this.loadJoinedProjects()
  },

  loadJoinedProjects() {
    var that = this
    if (this.data.loadingJoined) return
    this.setData({ loadingJoined: true })
    teamService.getMyJoinedProjects().then(function(projects) {
      // 并行获取每个项目的成员列表，得到真实人数
      var countPromises = projects.map(function(p) {
        var pid = p.projectId || p.id
        return teamService.getMembers(pid).then(function(members) {
          return (members && members.length) ? members.length : 0
        }).catch(function() { return 0 })
      })
      Promise.all(countPromises).then(function(counts) {
        var mapped = projects.map(function(p, i) {
          var rawStatus = (p.status || '').toUpperCase()
          var status, statusText
          if (rawStatus === 'ENDED' || rawStatus === 'COMPLETED' || rawStatus === 'FINISHED') {
            status = 'ended'; statusText = '已结束'
          } else if (rawStatus === 'RECRUITING') {
            status = 'active'; statusText = '招募中'
          } else {
            status = 'active'; statusText = '进行中'
          }
          return {
            id: p.projectId || p.id,
            name: p.name || p.title || ('项目#' + (p.projectId || p.id)),
            leader: p.leader || p.creatorName || '--',
            members: counts[i] || p.currentMembers || p.memberCount || '--',
            maxMembers: p.maxMembers || '--',
            status: status,
            statusText: statusText,
            projectId: p.projectId || p.id
          }
        })
        that.setData({ joinedProjects: mapped, loadingJoined: false })
      })
    }).catch(function(err) {
    }).catch(function(err) {
      console.log('[team-center] 加载项目失败:', err)
      that.setData({ loadingJoined: false })
    })
  },

  loadPendingVotes(projects) {
    var that = this
    var votes = []
    var promises = []
    for (var i = 0; i < projects.length; i++) {
      var p = projects[i]
      var pid = p.projectId || p.id
      // 用 IIFE 捕获当前项目，避免闭包引用错误
      ;(function(project) {
        promises.push(
          teamService.getProjectPendingVotes(project.projectId || project.id).then(function(res) {
            if (res && res.length > 0) {
              for (var j = 0; j < res.length; j++) {
                res[j].projectName = project.name
                res[j].projectStatus = project.status
                votes.push(res[j])
              }
            }
          }).catch(function() { /* 忽略 */ })
        )
      })(p)
    }
    Promise.all(promises).then(function() {
      that.setData({ pendingVotes: votes })
    })
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  },

  goProjectList() {
    wx.switchTab({ url: '/pages/index/index' })
    setTimeout(function() {
      wx.navigateTo({ url: '/pages/projects/list/list' })
    }, 100)
  },

  goTeamRequests() {
    wx.navigateTo({ url: '/pages/team-requests/team-requests' })
  },

  goProjectDetail(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/projects/detail/detail?id=' + id })
  },

  goProjectMembers(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/project-members/project-members?projectId=' + id })
  },

  goEvaluation(e) {
    var id = e.currentTarget.dataset.id
    var name = e.currentTarget.dataset.name || ''
    wx.navigateTo({ url: '/pages/evaluation-list/evaluation-list?projectId=' + id + '&projectName=' + name })
  },

  goExitProject(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/exit-project/exit-project?projectId=' + id })
  },

  goExitVoteDetail(e) {
    var voteId = e.currentTarget.dataset.voteId
    var projectId = e.currentTarget.dataset.projectId
    wx.navigateTo({ url: '/pages/exit-vote-detail/exit-vote-detail?voteId=' + voteId + '&projectId=' + projectId })
  },

  goVoteManagement(e) {
    var id = e.currentTarget.dataset.id
    var name = e.currentTarget.dataset.name || ''
    wx.navigateTo({ url: '/pages/vote-management/vote-management?projectId=' + id + '&projectName=' + name })
  }
})
