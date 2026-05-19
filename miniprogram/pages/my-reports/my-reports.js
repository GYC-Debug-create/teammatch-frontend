const teamService = require('../../utils/team-service.js')

Page({
  data: { reports: [], loading: true, error: null },
  onReady() { this.loadReports() },
  async loadReports() {
    this.setData({ loading: true, error: null })
    try {
      var reports = await teamService.getMyReports()
      this.setData({ reports: reports, loading: false })
    } catch (err) {
      this.setData({ loading: false, error: '加载失败' })
    }
  }
})
