var teamService = require('../../utils/team-service')

Page({
  data: {
    projectId: null,
    projectName: '',
    projectStatus: '',
    isProjectLeader: false,
    searchKeyword: '',
    users: [],
    filteredUsers: [],
    loading: true,
    invitingId: null,
    inviteMsg: '',
    // 项目选择弹窗
    showProjectPicker: false,
    pickTargetUserId: null,
    pickTargetNickname: '',
    myProjects: []
  },

  onLoad(options) {
    var projectId = Number(options.projectId) || 0
    var projectName = options.projectName || ''
    this.setData({ projectId: projectId, projectName: projectName, loading: true })
  },

  onReady() {
    this.loadRecommendUsers()
  },

  // 加载推荐用户
  async loadRecommendUsers() {
    var that = this
    this.setData({ loading: true })

    try {
      // 获取全量项目，按成员聚合推荐用户
      var allProjects = await teamService.getAllProjects()
      var targetSkills = []

      if (this.data.projectId) {
        // 场景1：来自项目成员页 → 匹配该项目技能标签
        var project = await teamService.getProjectDetail(this.data.projectId)
        targetSkills = (project.skills || []).map(function(s) {
          return typeof s === 'string' ? s.toLowerCase() : (s.name || '').toLowerCase()
        })
        // 记录项目状态，已结束的项目禁止邀请
        var projStatus = (project.status || '').toUpperCase()
        var leaderId = project.creatorId || project.creator_id || 0
        var myId = parseInt(wx.getStorageSync('userId')) || 0
        that.setData({
          projectName: project.name || project.title || that.data.projectName,
          projectStatus: projStatus,
          isProjectLeader: leaderId === myId
        })
      } else {
        // 场景2：首页直接进入 → 匹配用户创建的项目技能
        var userId = parseInt(wx.getStorageSync('userId')) || 0
        var myCreatedProjects = []
        for (var i = 0; i < allProjects.length; i++) {
          var p = allProjects[i]
          if (p.creatorId === userId || p.creator_id === userId) {
            var pStatus = (p.status || '').toUpperCase()
            // 只收集招募中的项目
            if (pStatus !== 'ENDED' && pStatus !== 'COMPLETED' && pStatus !== 'FINISHED') {
              myCreatedProjects.push({
                id: p.id,
                name: p.name || p.title || '',
                status: pStatus,
                members: p.currentMembers || p.memberCount || '--',
                maxMembers: p.maxMembers || '--'
              })
            }
            var skills = (p.skills || []).map(function(s) {
              return typeof s === 'string' ? s.toLowerCase() : (s.name || '').toLowerCase()
            })
            targetSkills = targetSkills.concat(skills)
          }
        }
        that.setData({ myProjects: myCreatedProjects })
      }

      // 场景1 也收集队长项目
      if (that.data.projectId) {
        var myId = parseInt(wx.getStorageSync('userId')) || 0
        if (that.data.isProjectLeader) {
          var pStatus = (project.status || '').toUpperCase()
          if (pStatus !== 'ENDED' && pStatus !== 'COMPLETED') {
            that.setData({ myProjects: [{
              id: project.id || project.projectId,
              name: project.name || project.title || '',
              status: pStatus,
              members: project.currentMembers || '--',
              maxMembers: project.maxMembers || '--'
            }] })
          }
        }
      }

      // 收集所有项目的成员（去重）
      var userMap = {}
      var currentUserId = parseInt(wx.getStorageSync('userId')) || 0

      for (var j = 0; j < allProjects.length; j++) {
        var pid = allProjects[j].id || allProjects[j].projectId
        try {
          var members = await teamService.getMembers(pid)
          for (var k = 0; k < members.length; k++) {
            var muid = members[k].userId || members[k].id
            if (muid === currentUserId || userMap[muid]) continue
            // 计算技能匹配度
            var userSkills = (members[k].skills || []).map(function(s) {
              return typeof s === 'string' ? s.toLowerCase() : (s.name || '').toLowerCase()
            })
            var matchScore = 0
            if (targetSkills.length > 0 && userSkills.length > 0) {
              for (var t = 0; t < targetSkills.length; t++) {
                if (userSkills.indexOf(targetSkills[t]) > -1) matchScore++
              }
            }
            userMap[muid] = {
              userId: muid,
              nickname: members[k].nickname || ('用户' + muid),
              avatarText: (members[k].nickname || 'U').slice(0, 1),
              major: members[k].major || '',
              skills: userSkills.join('、') || '--',
              matchScore: matchScore,
              projectName: allProjects[j].name || allProjects[j].title || ''
            }
          }
        } catch (e) { /* skip */ }
      }

      // 转数组并按匹配度排序
      var userList = Object.values(userMap).sort(function(a, b) {
        return b.matchScore - a.matchScore
      })

      that.setData({ users: userList, filteredUsers: userList, loading: false })
    } catch (err) {
      console.log('[member-match] 加载失败:', err)
      that.setData({ loading: false, users: [], filteredUsers: [] })
    }
  },

  // 搜索过滤
  onSearchInput(e) {
    var keyword = (e.detail.value || '').trim().toLowerCase()
    this.setData({ searchKeyword: keyword })
    if (!keyword) {
      this.setData({ filteredUsers: this.data.users })
      return
    }
    var filtered = this.data.users.filter(function(u) {
      return u.nickname.toLowerCase().indexOf(keyword) > -1
        || (u.skills || '').toLowerCase().indexOf(keyword) > -1
    })
    this.setData({ filteredUsers: filtered })
  },

  // 点击邀请 → 弹出项目选择器
  inviteUser(e) {
    var targetUserId = e.currentTarget.dataset.userId
    var nickname = e.currentTarget.dataset.nickname || ''

    if (this.data.myProjects.length === 0) {
      wx.showToast({ title: '暂无可用的招募中项目', icon: 'none' })
      return
    }
    if (this.data.myProjects.length === 1) {
      // 只有一个项目，直接邀请
      this.doInvite(this.data.myProjects[0].id, targetUserId, nickname)
      return
    }
    // 多个项目，弹出选择器
    this.setData({
      showProjectPicker: true,
      pickTargetUserId: targetUserId,
      pickTargetNickname: nickname
    })
  },

  // 选择项目后发送邀请
  selectProject(e) {
    var projectId = e.currentTarget.dataset.projectId
    this.setData({ showProjectPicker: false })
    this.doInvite(projectId, this.data.pickTargetUserId, this.data.pickTargetNickname)
  },

  // 关闭项目选择器
  closeProjectPicker() {
    this.setData({ showProjectPicker: false })
  },

  // 实际发送邀请
  doInvite(projectId, targetUserId, nickname) {
    var that = this
    that.setData({ invitingId: targetUserId })
    wx.showLoading({ title: '发送中' })
    teamService.sendInviteRequest(projectId, targetUserId, '诚邀你加入我们的项目团队').then(function() {
      wx.hideLoading()
      wx.showToast({ title: '邀请已发送', icon: 'success' })
      that.setData({ invitingId: null })
    }).catch(function(err) {
      wx.hideLoading()
      var code = err && err.code
      var msg = (err && err.message) || '邀请失败'
      if (code === 'M1003') msg = '已邀请过或项目状态不允许'
      wx.showToast({ title: msg, icon: 'none' })
      that.setData({ invitingId: null })
    })
  }
})
