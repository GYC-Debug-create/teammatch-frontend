// pages/profile-claim/profile-claim.js
Page({
  data: {
    loading: true,
    steps: [
      {
        step: 1,
        title: '绑定学校邮箱',
        desc: '使用 .edu.cn 邮箱验证学生身份',
        btnText: '去认证',
        action: 'goEmailVerify'
      },
      {
        step: 2,
        title: '完善个人档案',
        desc: '填写昵称、学校、专业等信息',
        btnText: '去填写',
        action: 'goProfileEdit'
      },
      {
        step: 3,
        title: '认领技术画像',
        desc: '确认并公开你的技术能力图谱',
        btnText: '立即认领',
        action: 'doClaim'
      }
    ]
  },

  onLoad() {
    this.setData({ loading: true })
    setTimeout(() => {
      this.setData({ loading: false })
    }, 600)
  },

  goEmailVerify() {
    wx.navigateTo({
      url: '/pages/email-verify/email-verify'
    })
  },

  goProfileEdit() {
    wx.navigateTo({
      url: '/pages/profile/edit/edit'
    })
  },

  doClaim() {
    wx.showToast({
      title: '认领成功',
      icon: 'success',
      duration: 1500
    })
  }
})
