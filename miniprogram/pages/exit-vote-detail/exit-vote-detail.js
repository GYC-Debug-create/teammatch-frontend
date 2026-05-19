/*
 * T-038 退出投票详情页
 * 基线约束（V2.1）：
 * 1. 投票选项仅 agree / disagree，无弃权
 * 2. 被投票人不能投票（前端按钮隐藏，后端最终校验）
 * 3. 仅队长可手动关闭投票
 * 4. deadline_at = created_at + 24h，超时后懒检查关闭
 * 5. 投票通过后，成员状态 exited，exit_mode = exit_vote，根据 penalty_level 扣分
 * 6. 统一成功响应码 code: 200
 */

const teamService = require('../../utils/team-service')

Page({
  data: {
    voteId: null,
    voteInfo: {
      id: null,
      targetUser: { id: null, nickname: '', avatar: '', major: '', trustScore: 0 },
      initiatorId: null,
      penaltyLevel: 'negotiated',
      status: 'voting',
      result: null,
      totalVoters: 0,
      agreeCount: 0,
      disagreeCount: 0,
      deadlineAt: '',
      createdAt: '',
      myVote: null,
      voters: []
    },
    loading: true,
    error: null,
    submitting: false,
    currentUserId: null,
    countdownText: '',
    formatDeadline: ''
  },

  onLoad(options) {
    const voteId = options.voteId || 1
    const app = getApp()
    const currentUserId = (app && app.globalData && app.globalData.userId) || 1
    this.setData({ voteId, currentUserId })
  },

  onReady() {
    this.loadVoteDetail()
  },

  onUnload() {
    this.clearTimer()
  },

  clearTimer() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
  },

  loadVoteDetail() {
    this.setData({ loading: true, error: null })
    teamService.getExitVoteDetail(this.data.voteId).then(voteInfo => {
      if (!voteInfo) {
        this.setData({ loading: false, error: '数据为空' })
        return
      }

      const deadlineDate = new Date(voteInfo.deadlineAt)
      const y = deadlineDate.getFullYear()
      const mo = String(deadlineDate.getMonth() + 1).padStart(2, '0')
      const d = String(deadlineDate.getDate()).padStart(2, '0')
      const h = String(deadlineDate.getHours()).padStart(2, '0')
      const mi = String(deadlineDate.getMinutes()).padStart(2, '0')
      const formatDeadline = `${y}-${mo}-${d} ${h}:${mi}`

      const deadlineAt = voteInfo.deadlineAt
      const deadline = new Date(deadlineAt).getTime()
      let countdownText = ''
      if (!isNaN(deadline)) {
        const diff = deadline - Date.now()
        if (diff > 0) {
          const hours = Math.floor(diff / 3600000)
          const mins = Math.floor((diff % 3600000) / 60000)
          const secs = Math.floor((diff % 60000) / 1000)
          countdownText = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        } else {
          countdownText = '00:00:00'
        }
      }

      this.setData({ voteInfo, loading: false, formatDeadline, countdownText })
    }).catch(err => {
      const msg = (err && err.message) || '加载失败，请重试'
      this.setData({ loading: false, error: msg })
      wx.showToast({ title: msg, icon: 'none' })
    })
  },

  handleVote(e) {
    const choice = e.currentTarget.dataset.choice
    if (this.data.submitting || this.data.voteInfo.myVote) return

    this.setData({ submitting: true })
    teamService.submitExitVote(this.data.voteId, choice).then(() => {
      wx.showToast({ title: '投票成功', icon: 'success' })
      this.loadVoteDetail()
    }).catch(err => {
      const code = err && err.code
      let msg = '投票失败'
      if (code === 409) msg = '操作已失效，请刷新'
      else if (code === 422) msg = '投票已关闭'
      wx.showToast({ title: msg, icon: 'none' })
      this.setData({ submitting: false })
    })
  },

  handleCloseVote() {
    if (!this.isLeader() || this.data.voteInfo.status !== 'voting') return

    wx.showModal({
      title: '关闭投票',
      content: '确定要提前关闭此投票吗？',
      success: (res) => {
        if (res.confirm) {
          teamService.closeExitVote(this.data.voteId).then(() => {
            wx.showToast({ title: '投票已关闭', icon: 'success' })
            this.loadVoteDetail()
          }).catch(() => {
            wx.showToast({ title: '关闭失败', icon: 'none' })
          })
        }
      }
    })
  },

  isLeader() {
    return this.data.currentUserId === this.data.voteInfo.initiatorId
  },

  goBack() {
    wx.navigateBack()
  }
})
