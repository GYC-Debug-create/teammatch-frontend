/*
 * T-032 项目成员列表页
 * 基线约束（来自详细设计文档V2.1）：
 * 1. 成员状态只用 active / exited，不使用 removed 等旧名称
 * 2. 退出方式只用 self_exit / exit_vote，对应 UI 文案"主动退出"/"被投票移除"
 * 3. 队长在 recruiting 阶段只能通过邀请/拒绝管理成员，不能直接移除
 * 4. 进入 in_progress 后，移除必须走 exit_vote 投票流程
 * 5. 本页面为 Mock 阶段，操作图标仅做展示占位，暂不绑定事件
 */

const LOGIN_PAGE_URL = '/pages/index/index'
const FUNCTION_HUB_PAGE_URL = '/pages/function-hub/function-hub'
const TOKEN_KEYS = ['token', 'accessToken', 'userToken', 'sessionToken']

Page({
  data: {
    isAuthenticated: false,
    isRedirectingToLogin: false,
    projectTitle: 'AI创新实践队',
    members: [
      {
        id: 1,
        nickname: '江一舟',
        major: '计算机科学 21级',
        avatar: 'https://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNRJFEavFs7J9vDtGqTVMwiaPRHQqk7UicwLEW0Xn3RRAf5xAV19O7Qhml5KR06y1l6jSoxzUPdZ7Rcw/0',
        role: 'leader',
        status: 'active',
        exitMode: null,
        exitDate: null,
        trustScore: 98
      },
      {
        id: 2,
        nickname: '林乔',
        major: '软件工程 22级',
        avatar: 'https://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNRJFEavFs7J9vDtGqTVMwiaPVj8mBIa1P9duib3Jic8FNuRGzTEnD0soEd3lmgUu60ldNQBeaYbC3rLg/0',
        role: 'member',
        status: 'active',
        exitMode: null,
        exitDate: null,
        trustScore: 96
      },
      {
        id: 3,
        nickname: '周予安',
        major: '计算机科学 21级',
        avatar: 'https://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNRJFEavFs7J9vDtGqTVMwiaP0yVCvufE9flxeREoz3icx7Viaz3OE6ibV5X0lWxjx6SXlNcOHkVLpQR0A/0',
        role: 'member',
        status: 'active',
        exitMode: null,
        exitDate: null,
        trustScore: 91
      },
      {
        id: 4,
        nickname: '陈知远',
        major: '软件工程 22级',
        avatar: 'https://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNRJFEavFs7J9vDtGqTVMwiaP4ur0bzBILwibtfEgXa19NhPfE9H3ovmgTGeIvX8XXlvNcZBVXRiarEuw/0',
        role: 'member',
        status: 'exited',
        exitMode: 'self_exit',
        exitDate: '05-02',
        trustScore: 85
      },
      {
        id: 5,
        nickname: '许之恒',
        major: '软件工程 21级',
        avatar: 'https://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNRJFEavFs7J9vDtGqTVMwiaPYqJuQgm0XjAPsZwms0bQSJau0iaDFqb7icvicuYialYSk4GcFzr7kptcWg/0',
        role: 'member',
        status: 'exited',
        exitMode: 'exit_vote',
        exitDate: '04-28',
        trustScore: 72
      },
      {
        id: 6,
        nickname: '赵一琳',
        major: '数字媒体 22级',
        avatar: 'https://example.com/avatar6.png',
        role: 'member',
        status: 'exited',
        exitMode: 'exit_vote',
        exitDate: '04-28',
        trustScore: 68
      }
    ],
    currentUserId: 1
  },

  onShow() {
    if (!this.ensureLogin()) return
    console.log('[T-032] onShow project members page')
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
  },

  goFunctionHub() {
    if (!this.ensureLogin()) return

    wx.switchTab({
      url: FUNCTION_HUB_PAGE_URL
    })
  }
})
