const LOGIN_PAGE_URL = '/pages/index/index'
const TEAM_REQUESTS_PAGE_URL = '/pages/team-requests/team-requests'
const PROJECT_MEMBERS_PAGE_URL = '/pages/project-members/project-members'
const TOKEN_KEYS = ['token', 'accessToken', 'userToken', 'sessionToken']

Page({
  data: {
    isAuthenticated: false,
    isRedirectingToLogin: false
  },

  onShow() {
    this.ensureLogin()
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
  },

  goTeamRequests() {
    wx.navigateTo({
      url: TEAM_REQUESTS_PAGE_URL
    })
  },

  goProjectMembers() {
    wx.navigateTo({
      url: PROJECT_MEMBERS_PAGE_URL
    })
  }
})
