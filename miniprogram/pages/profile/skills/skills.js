// pages/profile/skills/skills.js
Page({
  data: {
    // 所有可用标签（Mock 数据，后续替换为 GET /api/profile/skills/tags）
    allTags: [
      // 语言
      { id: 1, name: 'Java', category: 'language' },
      { id: 2, name: 'Python', category: 'language' },
      { id: 3, name: 'JavaScript', category: 'language' },
      { id: 4, name: 'TypeScript', category: 'language' },
      { id: 5, name: 'C++', category: 'language' },
      // 框架
      { id: 6, name: 'Spring Boot', category: 'framework' },
      { id: 7, name: 'Vue.js', category: 'framework' },
      { id: 8, name: 'React', category: 'framework' },
      { id: 9, name: 'Flutter', category: 'framework' },
      { id: 10, name: 'Django', category: 'framework' },
      // 工具
      { id: 11, name: 'Git', category: 'tool' },
      { id: 12, name: 'Docker', category: 'tool' },
      { id: 13, name: 'MySQL', category: 'tool' },
      { id: 14, name: 'Redis', category: 'tool' },
      // 软技能
      { id: 15, name: '项目管理', category: 'soft_skill' },
      { id: 16, name: '团队协作', category: 'soft_skill' },
      { id: 17, name: '技术文档编写', category: 'soft_skill' },
      { id: 18, name: '沟通表达', category: 'soft_skill' }
    ],
    // 用户已选的技能 ID 数组
    selectedIds: [],
    // 保存状态
    saving: false,
    errorMsg: ''
  },

  onLoad() {
    // 后续联调时，这里调用 GET /api/profile/skills/tags 获取 allTags
    // 同时可以通过 GET /me/profile 或缓存的 profile 来预选已拥有的技能
    const profile = wx.getStorageSync('profile');
    if (profile && profile.skillTagIds) {
      this.setData({ selectedIds: profile.skillTagIds });
    }
  },

  // 切换技能选择
  toggleSkill(e) {
    const skillId = e.currentTarget.dataset.id;
    let selectedIds = [...this.data.selectedIds];
    const index = selectedIds.indexOf(skillId);
    if (index > -1) {
      selectedIds.splice(index, 1);
    } else {
      selectedIds.push(skillId);
    }
    this.setData({ selectedIds, errorMsg: '' });
  },

  // 保存技能
  saveSkills() {
    if (this.data.selectedIds.length === 0) {
      this.setData({ errorMsg: '请至少选择一个技能标签' });
      return;
    }

    this.setData({ saving: true, errorMsg: '' });

    // Mock 保存（全量替换 PUT /api/profile/skills）
    setTimeout(() => {
      this.setData({ saving: false });
      
      // 更新本地缓存中的 profile
      const profile = wx.getStorageSync('profile') || {};
      profile.skillTagIds = this.data.selectedIds;
      wx.setStorageSync('profile', profile);

      wx.showToast({ title: '技能保存成功', icon: 'success' });
      // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 800);
    }, 600);
  }
});