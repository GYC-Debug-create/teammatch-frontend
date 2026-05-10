/*
 * T-033 组队请求页（Service 层改造版）
 * 基线约束（V2.1）：
 * 1. 请求状态仅用 pending/accepted/rejected/cancelled/expired
 * 2. 请求类型仅用 invite/apply
 * 3. 不出现 removed、remove_vote 等旧名称
 * 4. 统一响应格式：{ code, message, data: { list } }
 * 5. 操作按钮（接受/拒绝/取消）将在后续联调接入真接口
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
    error: ''
  },

  onLoad() {
    if (!this.ensureLogin()) return
    this.loadRequests()
  },

  goFunctionHub() {
    wx.redirectTo({
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
        const counterpart = isReceived ? item.from_user : item.to_user
        const requestTypeLabel = item.requestType === 'invite' ? '邀请' : '申请'
        const counterpartLabel = isReceived ? '对方' : '队长'
        const hint =
          item.status !== 'pending'
            ? getResultHint(item.requestType, item.status)
            : ''

        return {
          ...item,
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

  handleAction(event) {
    if (!this.ensureLogin()) return

    const { action, requestId } = event.currentTarget.dataset
    const actionLabels = {
      accept: '已接受',
      reject: '已拒绝',
      cancel: '已取消'
    }

    console.log('[T-033] handleAction', { action, requestId })

    wx.showToast({
      title: actionLabels[action] || '操作成功',
      icon: 'success'
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
      wx.redirectTo({ url: LOGIN_PAGE_URL })
    }, 300)
  }
})
