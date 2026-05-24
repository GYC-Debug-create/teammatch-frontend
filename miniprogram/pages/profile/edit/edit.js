// pages/profile/edit.js
const { request } = require('../../../utils/api-service.js')

Page({
  data: {
    form: {
      nickname: 'TeamMatch User',
      school: '',
      major: '',
      grade: '',
      bio: ''
    },
    isLoading: false,
    errorMsg: ''
  },

  onLoad() {
    // 加载本地缓存中的档案信息（如果有的话）
    const profile = wx.getStorageSync('profile');
    if (profile) {
      this.setData({ form: { ...this.data.form, ...profile } });
    }
  },

  // 通用的输入框处理函数
  onFieldChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value, errorMsg: '' });
  },

  // 保存档案
  async saveProfile() {
    const { form } = this.data;
    // 基础校验
    if (!form.nickname.trim() || !form.school.trim()) {
      this.setData({ errorMsg: '昵称和学校不能为空' });
      return;
    }

    this.setData({ isLoading: true, errorMsg: '' });

    try {
      await request({
        url: '/profile/update',
        method: 'PUT',
        data: form
      })
      // 保存到本地缓存，供首页展示
      wx.setStorageSync('profile', form);
      wx.showToast({ title: '档案保存成功', icon: 'success' });
      // 返回上一页
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (err) {
      const msg = (err && err.message) ? err.message : '保存失败，请稍后重试';
      this.setData({ errorMsg: msg });
    } finally {
      this.setData({ isLoading: false });
    }
  }
})