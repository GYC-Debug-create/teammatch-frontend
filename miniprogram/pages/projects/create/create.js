// pages/projects/create/create.js
Page({
  data: {
    form: {
      title: '',
      description: '',
      boardId: '',
      maxMembers: 3,
      skills: [],
      deadline: ''
    },
    boardList: [
      { id: 1, name: '小程序开发' },
      { id: 2, name: 'Web应用' },
      { id: 3, name: 'AI应用' },
      { id: 4, name: '校园工具' }
    ],
    skillTagList: [
      { id: 1, name: '微信小程序' },
      { id: 2, name: 'Spring Boot' },
      { id: 3, name: 'Vue.js' },
      { id: 4, name: 'React' },
      { id: 5, name: 'Python' },
      { id: 6, name: 'MySQL' }
    ],
    submitting: false,
    errorMsg: ''
  },

  onLoad() {
    // 可在此处预加载板块列表、技能标签列表等（后续联调时替换为接口数据）
  },

  // 输入框通用处理
  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value, errorMsg: '' });
  },

  // 板块选择
  onBoardChange(e) {
    const index = e.detail.value;
    const board = this.data.boardList[index];
    this.setData({ 'form.boardId': board.id, errorMsg: '' });
  },

  // 技能选择（多选）
  onSkillToggle(e) {
    const skillId = e.currentTarget.dataset.id;
    let skills = this.data.form.skills;
    const index = skills.indexOf(skillId);
    if (index > -1) {
      skills.splice(index, 1);
    } else {
      skills.push(skillId);
    }
    this.setData({ 'form.skills': skills, errorMsg: '' });
  },

  // 人数选择
  onMemberChange(e) {
    const value = parseInt(e.detail.value) || 1;
    this.setData({ 'form.maxMembers': value, errorMsg: '' });
  },

  // 截止日期选择
  onDateChange(e) {
    this.setData({ 'form.deadline': e.detail.value, errorMsg: '' });
  },

  // 表单提交（Mock）
  submitForm() {
    const { title, description, boardId, skills, deadline, maxMembers } = this.data.form;

    if (!title.trim()) {
      this.setData({ errorMsg: '请输入项目标题' });
      return;
    }
    if (!description.trim()) {
      this.setData({ errorMsg: '请输入项目描述' });
      return;
    }
    if (!boardId) {
      this.setData({ errorMsg: '请选择项目板块' });
      return;
    }
    if (skills.length === 0) {
      this.setData({ errorMsg: '请至少选择一个技能需求' });
      return;
    }
    if (!deadline) {
      this.setData({ errorMsg: '请选择截止日期' });
      return;
    }
    if (maxMembers < 2) {
      this.setData({ errorMsg: '项目人数至少为 2 人' });
      return;
    }

    this.setData({ submitting: true, errorMsg: '' });

    // 模拟提交
    setTimeout(() => {
      wx.showToast({ title: '项目发布成功（Mock）', icon: 'success' });
      this.setData({ submitting: false });
      // 后续可跳转到项目详情页
      // wx.redirectTo({ url: `/pages/projects/detail/detail?id=${res.id}` });
    }, 1000);
  }
});