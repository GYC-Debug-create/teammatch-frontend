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
    isSearching: false,
    invitingId: null,
    inviteMsg: '',
    // 项目选择弹窗
    showProjectPicker: false,
    pickTargetUserId: null,
    pickTargetNickname: '',
    myProjects: [],
    // 首页进入时选中的目标项目
    activeProjectId: null,
    showProjectBar: false
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
        that.setData({
          myProjects: myCreatedProjects,
          activeProjectId: myCreatedProjects.length > 0 ? myCreatedProjects[0].id : null,
          showProjectBar: myCreatedProjects.length > 1
        })
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

      // 收集所有项目的成员（去重），同时记录技能匹配度
      var userMap = {}
      var currentUserId = parseInt(wx.getStorageSync('userId')) || 0

      for (var j = 0; j < allProjects.length; j++) {
        var pid = allProjects[j].id || allProjects[j].projectId
        try {
          var members = await teamService.getMembers(pid)
          for (var k = 0; k < members.length; k++) {
            var muid = members[k].userId || members[k].id
            if (muid === currentUserId || userMap[muid]) continue
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
              major: members[k].major || '',
              userSkills: userSkills,
              matchScore: matchScore,
              projectName: allProjects[j].name || allProjects[j].title || ''
            }
          }
        } catch (e) { /* skip */ }
      }

      // 批量拉取用户档案（昵称 + 头像）
      var userIds = Object.keys(userMap)
      var profileMap = {}
      var profilePromises = userIds.map(function(uid) {
        return teamService.getUserProfile(uid).then(function(profile) {
          profileMap[uid] = {
            nickname: (profile && profile.nickname) || '未知用户',
            avatarUrl: (profile && (profile.avatarUrl || profile.avatar)) || '',
            avatarText: ((profile && profile.nickname) || '?').slice(0, 1)
          }
        }).catch(function() {
          profileMap[uid] = { nickname: '未知用户', avatarUrl: '', avatarText: '?' }
        })
      })
      await Promise.all(profilePromises)

      // 合并档案信息并按匹配度排序
      var userList = userIds.map(function(uid) {
        var u = userMap[uid]
        var p = profileMap[uid] || {}
        return {
          userId: parseInt(uid),
          nickname: p.nickname || '未知用户',
          avatarUrl: p.avatarUrl || '',
          avatarText: p.avatarText || '?',
          major: u.major || '',
          skills: u.userSkills.join('、') || '--',
          matchScore: u.matchScore,
          projectName: u.projectName || ''
        }
      }).sort(function(a, b) {
        return b.matchScore - a.matchScore
      })

      that.setData({ users: userList, filteredUsers: userList, loading: false })
    } catch (err) {
      console.log('[member-match] 加载失败:', err)
      that.setData({ loading: false, users: [], filteredUsers: [] })
    }
  },

  // 搜索过滤：优先调用后端 API，失败时回退本地过滤
  onSearchInput(e) {
    var keyword = (e.detail.value || '').trim()
    this.setData({ searchKeyword: keyword })
    if (!keyword) {
      this.setData({ filteredUsers: this.data.users, isSearching: false })
      return
    }
    var that = this
    this.setData({ isSearching: true })
    teamService.searchUsers(keyword, 1, 20).then(function(results) {
      var myId = parseInt(wx.getStorageSync('userId')) || 0
      var mapped = (results || [])
        .filter(function(u) { return (u.userId || u.id) !== myId })
        .map(function(u) {
          return {
            userId: u.userId || u.id,
            nickname: u.nickname || u.name || '未知用户',
            avatarUrl: u.avatarUrl || u.avatar || u.avatar_url || '',
            avatarText: (u.nickname || u.name || 'U').slice(0, 1),
            major: u.major || u.department || '',
            skills: (u.skills || []).join('、') || '--',
            matchScore: 0
          }
        })
      that.setData({ filteredUsers: mapped, isSearching: false })
    }).catch(function() {
      // API 失败，回退本地过滤
      var kw = keyword.toLowerCase()
      var filtered = that.data.users.filter(function(u) {
        return u.nickname.toLowerCase().indexOf(kw) > -1
          || (u.skills || '').toLowerCase().indexOf(kw) > -1
      })
      that.setData({ filteredUsers: filtered, isSearching: false })
    })
  },

  // 切换当前选中的项目（首页多项目栏）
  switchActiveProject(e) {
    var id = e.currentTarget.dataset.projectId
    this.setData({ activeProjectId: id })
  },

  // 点击邀请 → 弹出项目选择器
  inviteUser(e) {
    var targetUserId = e.currentTarget.dataset.userId
    var nickname = e.currentTarget.dataset.nickname || ''

    var myId = parseInt(wx.getStorageSync('userId')) || 0
    if (targetUserId === myId) {
      wx.showToast({ title: '不能邀请自己', icon: 'none' })
      return
    }
    // 首页项目栏已选中 → 直接用 activeProjectId
    if (this.data.showProjectBar && this.data.activeProjectId) {
      this.doInvite(this.data.activeProjectId, targetUserId, nickname)
      return
    }
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
      var msg = (err && err.message) || '无法邀请'
      wx.showToast({ title: msg, icon: 'none' })
      that.setData({ invitingId: null })
    })
  }
})
