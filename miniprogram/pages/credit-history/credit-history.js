/*
 * T-042 信誉分变化历史页
 * 基线约束（V2.1）：
 * 1. 信誉分初始值 100
 * 2. 当前信誉分 = 100 + SUM(change_value WHERE effective=1)
 * 3. 流水类型：evaluation / exit_vote / self_exit / penalty / appeal_restore
 * 4. effective=1 生效，effective=0 挂起或不计分
 * 5. 统一成功响应码 code: 200
 */

const teamService = require('../../utils/team-service.js')

Page({
  data: {
    currentScore: 0,
    initialScore: 100,
    records: [],
    loading: true,
    error: null
  },

  onLoad() {
    // 只做同步赋值
  },

  onReady() {
    this.loadData()
  },

  async loadData() {
    this.setData({ loading: true, error: null })
    try {
      const [score, records] = await Promise.all([
        teamService.getCurrentCreditScore(),
        teamService.getCreditHistory()
      ])
      this.setData({
        currentScore: score,
        records: records,
        loading: false
      })
    } catch (err) {
      this.setData({
        loading: false,
        error: '加载失败，请重试'
      })
    }
  },

  handleRecordTap(e) {
    const id = e.currentTarget.dataset.id
    // 暂不跳转详情页，预留
  }
})
