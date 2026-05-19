// pages/login/login.js
Page({
  data: {},

  // 跳转到首页（微信一键登录入口）
  goToLogin() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});