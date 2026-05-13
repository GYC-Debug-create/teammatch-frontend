// pages/email-verify/email-verify.js
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
  sendCode() {
    const { email, countdown } = this.data;
    if (!email.trim()) {
      this.setData({ errorMsg: '请先输入学校邮箱' });
      return;
    }
    if (!email.endsWith('.edu.cn')) {
      this.setData({ errorMsg: '请使用学校邮箱（.edu.cn）' });
      return;
    }
    if (countdown > 0) return;

    this.setData({ sendingCode: true, errorMsg: '' });

    // Mock 发送验证码
    setTimeout(() => {
      this.setData({ sendingCode: false, countdown: 60 });
      this.countdownTimer = setInterval(() => {
        let remaining = this.data.countdown - 1;
        if (remaining <= 0) {
          clearInterval(this.countdownTimer);
          remaining = 0;
        }
        this.setData({ countdown: remaining });
      }, 1000);

      wx.showToast({ title: '验证码已发送（Mock）', icon: 'success' });
    }, 500);
  },

  // 提交验证
  verifyCode() {
    const { email, code } = this.data;
    if (!email.trim() || !code.trim()) {
      this.setData({ errorMsg: '请填写完整信息' });
      return;
    }

    this.setData({ verifying: true, errorMsg: '' });

    // Mock 验证
    setTimeout(() => {
      this.setData({ verifying: false });
      if (code === '654321') {
        wx.showToast({ title: '邮箱验证成功（Mock）', icon: 'success' });
        // 后续可返回上一页或跳转
        // wx.navigateBack();
      } else {
        this.setData({ errorMsg: '验证码错误，请重试' });
      }
    }, 1000);
  },

  onUnload() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }
});