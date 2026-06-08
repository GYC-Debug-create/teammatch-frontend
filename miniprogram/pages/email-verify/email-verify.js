// pages/email-verify/email-verify.js
const { request } = require('../../utils/api-service.js')

Page({
  data: {
    email: '',
    code: '',
    sendingCode: false,
    countdown: 0,
    verifying: false,
    errorMsg: ''
  },

  // 邮箱输入
  onEmailInput(e) {
    this.setData({ email: e.detail.value, errorMsg: '' });
  },

  // 验证码输入
  onCodeInput(e) {
    this.setData({ code: e.detail.value, errorMsg: '' });
  },

  // 发送验证码
  async sendCode() {
    const { email, countdown } = this.data;
    if (!email.trim()) {
      this.setData({ errorMsg: '请先输入邮箱地址' });
      return;
    }
    if (countdown > 0) return;

    this.setData({ sendingCode: true, errorMsg: '' });

    try {
      await request({
        url: '/auth/email/send',
        method: 'POST',
        data: { email: email.trim() }
      })

      this.setData({ sendingCode: false, countdown: 60 });
      this.countdownTimer = setInterval(() => {
        let remaining = this.data.countdown - 1;
        if (remaining <= 0) {
          clearInterval(this.countdownTimer);
          remaining = 0;
        }
        this.setData({ countdown: remaining });
      }, 1000);

      wx.showToast({ title: '验证码已发送', icon: 'success' });
    } catch (err) {
      this.setData({ sendingCode: false });
      const msg = (err && err.message) ? err.message : '发送失败，请稍后重试';
      this.setData({ errorMsg: msg });
    }
  },

  // 提交验证
  async verifyCode() {
    const { email, code } = this.data;
    if (!email.trim() || !code.trim()) {
      this.setData({ errorMsg: '请填写完整信息' });
      return;
    }

    this.setData({ verifying: true, errorMsg: '' });

    try {
      await request({
        url: '/auth/email/verify',
        method: 'POST',
        data: { email: email.trim(), code: code.trim() }
      })

      this.setData({ verifying: false });
      wx.showToast({ title: '邮箱验证成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    } catch (err) {
      this.setData({ verifying: false });
      const msg = (err && err.message) ? err.message : '验证失败，请重试';
      this.setData({ errorMsg: msg });
    }
  },

  onUnload() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }
});