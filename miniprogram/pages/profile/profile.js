Page({
  data: {
    userId: '',
    avatarText: '员'
  },

  onLoad(options) {
    const userId = options.userId || ''
    this.setData({
      userId,
      avatarText: userId ? userId.slice(-1).toUpperCase() : '员'
    })
  }
})
