/*
 * T-034 组队请求页（操作闭环版）
 * 基线约束（V2.1）：
 * 1. 请求状态仅用 pending/accepted/rejected/cancelled/expired
 * 2. 统一成功响应码 code: 200（不是 0）
 * 3. 操作权限由后端校验，前端只需根据返回成功切换 UI，不本地模拟权限
 * 4. 同一请求不能重复操作，后端返回 409 时前端提示"操作已失效，请刷新"
 * 5. 名词冻结：不使用 removed、remove_vote 等旧名称
 */

const teamService = require('../../utils/team-service')
const LOGIN_PAGE_URL = '/pages/index/index'
const FUNCTION_HUB_PAGE_URL = '/pages/function-hub/function-hub'
const TOKEN_KEYS = ['token', 'accessToken', 'userToken', 'sessionToken']

const statusMetaMap = {
  pending: {
    label: 'PENDING',
    class: 'pending'
  },
  accepted: {
    label: 'ACCEPTED',
    class: 'accepted'
  },
  rejected: {
    label: 'REJECTED',
    class: 'rejected'
  },
  cancelled: {
    label: 'CANCELLED',
    class: 'cancelled'
  },
  expired: {
    label: 'EXPIRED',
    class: 'expired'
  }
}

/**
 * 根据请求类型和状态生成辅助提示文字
 */
function getResultHint(requestType, status) {
  const hints = {
    invite: {
      accepted: '邀请已接受，成员状态已同步',
      rejected: '邀请已被拒绝',
      cancelled: '邀请已撤回',
      expired: '邀请已过期'
    },
    apply: {
      accepted: '申请已接受，成员状态已同步',
      rejected: '申请已被拒绝',
      cancelled: '申请已撤回',
      expired: '申请已过期'
    }
  }
  return (hints[requestType] && hints[requestType][status]) || ''
}

Page({
  data: {
    isAuthenticated: false,
    isRedirectingToLogin: false,
    activeTab: 'received',
    requests: [],
    loading: false,
    error: '',
    operatingId: null
  },

  onLoad() {
    if (!this.ensureLogin()) return
  },

  onReady() {
    this.loadRequests()
  },

  goFunctionHub() {
    wx.switchTab({
      url: FUNCTION_HUB_PAGE_URL
    })
  },

  switchTab(event) {
    if (!this.ensureLogin()) return

    const { tab } = event.currentTarget.dataset
    if (!tab || tab === this.data.activeTab) return

    this.setData({ activeTab: tab }, () => {
      this.loadRequests()
    })
  },

  loadRequests() {
    const { activeTab } = this.data

    this.setData({ loading: true, error: '' })

    teamService.getRequests(activeTab).then(res => {
      if (res.code !== 200) {
        this.setData({
          loading: false,
          error: res.message || '加载失败，请稍后重试'
        })
        return
      }

      const list = (res.data.list || []).map(item => {
        const meta = statusMetaMap[item.status] || statusMetaMap.pending
        const isReceived = activeTab === 'received'

        // 后端返回扁平字段，转换为前端所需格式
        var transformed = {
          requestId: item.id || item.requestId,
          projectName: item.projectName || '项目 #' + item.projectId,
          from_user: {
            id: item.fromUserId || (item.from_user && item.from_user.id),
            nickname: (item.from_user && item.from_user.nickname) || ('用户' + (item.fromUserId || '')),
            major: (item.from_user && item.from_user.major) || ''
          },
          to_user: {
            id: item.toUserId || (item.to_user && item.to_user.id),
            nickname: (item.to_user && item.to_user.nickname) || ('用户' + (item.toUserId || '')),
            major: (item.to_user && item.to_user.major) || ''
          },
          message: item.message || '',
          requestType: item.requestType || '',
          status: item.status || '',
          createdAt: item.createdAt || item.created_at || '',
          displayRole: item.displayRole || ''
        }

        // received：我是 toUserId（接收方），对方是 fromUserId（发送方）
        // sent：我是 fromUserId（发送方），对方是 toUserId（接收方）
        const counterpart = isReceived ? transformed.from_user : transformed.to_user
        const requestTypeLabel = item.requestType === 'invite' ? '邀请' : '申请'
        const counterpartLabel = isReceived ? '发起者' : '接收者'
        const hint =
          item.status !== 'pending'
            ? getResultHint(item.requestType, item.status)
            : ''

        return {
          ...transformed,
          ...meta,
          counterpart,
          requestTypeLabel,
          counterpartLabel,
          hint,
          isReceived,
          avatarText: counterpart.nickname ? counterpart.nickname.slice(0, 1) : '?'
        }
      })

      this.setData({
        loading: false,
        requests: list
      })
    }).catch(err => {
      this.setData({
        loading: false,
        error: err.message || '网络异常，请稍后重试'
      })
    })
  },

  handleAction(e) {
    if (!this.ensureLogin()) return

    const { id, action } = e.currentTarget.dataset

    // 防重复：如果该请求正在操作中，直接返回
    if (this.data.operatingId === id) {
      wx.showToast({ title: '操作处理中，请稍后', icon: 'none' })
      return
    }

    this.setData({ operatingId: id })

    this.doAction(id, action).finally(() => {
      if (this.data.operatingId === id) {
        this.setData({ operatingId: null })
      }
    })
  },

  async doAction(requestId, action) {
    try {
      let result
      if (action === 'accept') {
        result = await teamService.acceptRequest(requestId)
        this.updateRequestStatus(requestId, 'accepted')
        wx.showToast({ title: '已接受', icon: 'success' })
      } else if (action === 'reject') {
        result = await teamService.rejectRequest(requestId)
        this.updateRequestStatus(requestId, 'rejected')
        wx.showToast({ title: '已拒绝', icon: 'success' })
      } else if (action === 'cancel') {
        result = await teamService.cancelRequest(requestId)
        this.updateRequestStatus(requestId, 'cancelled')
        this.removeRequestFromList(requestId)
        wx.showToast({ title: '已取消', icon: 'success' })
      }
      console.log('[T-034] doAction success', { requestId, action, result })
    } catch (err) {
      const msg = (err && err.message) || '操作失败'
      console.log('[T-034] doAction failed', { requestId, action, err })
      wx.showToast({ title: msg, icon: 'none' })
    }
  },

  // 更新单个请求的状态
  updateRequestStatus(requestId, newStatus) {
    const requests = this.data.requests.map(req => {
      if (req.requestId === requestId) {
        const meta = statusMetaMap[newStatus] || statusMetaMap.pending
        return { ...req, status: newStatus, ...meta, hint: getResultHint(req.requestType, newStatus) }
      }
      return req
    })
    this.setData({ requests })
  },

  // 从列表中移除请求（取消用）
  removeRequestFromList(requestId) {
    const requests = this.data.requests.filter(req => req.requestId !== requestId)
    this.setData({ requests })
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
