/*
 * T-035 项目成员列表（接口联调版）
 * 基线约束（V2.1 详细设计文档）：
 * 1. team_member.status 仅用 active / exited，不使用 removed 等旧名称
 * 2. team_member.exit_mode 仅用 self_exit / exit_vote，对应 UI 文案"主动退出"/"被投票移除"
 * 3. 被移除成员识别方式：status='exited' AND exit_mode='exit_vote'
 * 4. 队长不能直接移除成员，P0 阶段移除必须走 exit_vote 投票流程
 * 5. 统一成功响应码 code: 200（不是 0）
 * 6. 本页面操作图标 (...) 仅作为退出投票入口占位，不直接执行移除
 */

const teamService = require('../../utils/team-service')
const LOGIN_PAGE_URL = '/pages/index/index'
const FUNCTION_HUB_PAGE_URL = '/pages/function-hub/function-hub'
const TOKEN_KEYS = ['token', 'accessToken', 'userToken', 'sessionToken']

Page({
  data: {
    isAuthenticated: false,
    isRedirectingToLogin: false,
    projectTitle: 'AI创新实践队',
    projectId: 1,
    members: [],
    currentUserId: 1,

    // 新增：页面状态
    loading: false,
    error: null
  },

  onLoad(options) {
    if (!this.ensureLogin()) return

    const projectId = Number(options.projectId) || 1
    this.setData({ projectId })
  },

  onReady() {
    this.loadMembers()
  },

  async loadMembers() {
    this.setData({ loading: true, error: null })

    try {
      var list = await teamService.getMembers(this.data.projectId)
      console.log('[T-035] loadMembers success', { count: list.length })

      // 并发获取每个用户的详情（昵称、信誉分等）
      var enriched = []
      for (var i = 0; i < list.length; i++) {
        var member = list[i]
        var userId = member.userId || member.id
        var profile = null
        try {
          profile = await teamService.getUserProfile(userId)
        } catch (e) {
          // 获取详情失败，使用默认值
        }
        enriched.push({
          id: member.id,
          userId: userId,
          nickname: (profile && profile.nickname) || ('用户' + userId),
          creditScore: (profile && (profile.creditScore || profile.trustScore)) || 0,
          role: member.role || '',
          status: member.status || 'active',
          exitMode: member.exitMode || '',
          exitDate: member.exitDate || ''
        })
      }

      this.setData({ members: enriched, loading: false })
    } catch (err) {
      const errorMsg = (err && err.message) || '加载失败，请重试'
      console.log('[T-035] loadMembers failed', err)
      this.setData({ loading: false, error: errorMsg, members: [] })
    }
  },

  handleMemberAction(e) {
    const { id } = e.currentTarget.dataset
    wx.showToast({ title: `成员操作: ${id}`, icon: 'none' })
  },

  goFunctionHub() {
    if (!this.ensureLogin()) return

    wx.switchTab({
      url: FUNCTION_HUB_PAGE_URL
    })
  },

  ensureLogin() {
    const token = this.getLoginToken()
    if (token) {
      if (!this.data.isAuthenticated || this.data.isRedirectingToLogin) {
        this.setData({
          isAuthenticated: true,
          isRedirectingToLogin: false
        })
      }
      return true
    }

    this.redirectToLogin()
    return false
  },

  getLoginToken() {
    for (let index = 0; index < TOKEN_KEYS.length; index += 1) {
      const token = wx.getStorageSync(TOKEN_KEYS[index])
      if (token) return token
    }
    return ''
  },

  redirectToLogin() {
    if (this.data.isRedirectingToLogin) return

    this.setData({
      isAuthenticated: false,
      isRedirectingToLogin: true
    })

    wx.showToast({ title: '请先登录后使用', icon: 'none' })
    setTimeout(() => {
      wx.switchTab({ url: LOGIN_PAGE_URL })
    }, 300)
  }
})
