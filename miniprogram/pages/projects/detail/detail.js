// pages/projects/detail/detail.js
Page({
  data: {
    project: null,
    loading: false
  },

  onLoad(options) {
    const projectId = options.id || 1;
    this.loadProjectDetail(projectId);
  },

  loadProjectDetail(projectId) {
    this.setData({ loading: true });

    setTimeout(() => {
      const mockDetail = {
        id: 1,
        title: '校园二手交易小程序',
        description: '开发一个面向全校师生的二手物品交易平台，支持商品发布、搜索、在线沟通、订单管理等功能。前端采用微信小程序，后端使用 Spring Boot + MySQL。',
        boardName: '小程序开发',
        maxMembers: 5,
        currentMembers: 3,
        status: 'recruiting',
        statusText: '招募中',
        skills: ['微信小程序', 'Spring Boot', 'MySQL', 'Vue.js'],
        deadline: '2026-06-15',
        creatorName: '张三',
        creatorAvatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
        members: [
          { id: 1, name: '张三', role: '队长', avatar: '' },
          { id: 2, name: '李四', role: '成员', avatar: '' },
          { id: 3, name: '王五', role: '成员', avatar: '' }
        ],
        createdAt: '2026-04-01'
      };

      this.setData({
        project: mockDetail,
        loading: false
      });
    }, 600);
  },

  // 申请加入（占位，后续实现）
  applyJoin() {
    wx.showToast({ title: '申请功能开发中', icon: 'none' });
  },

  // 查看成员详情（占位，后续串通）
  viewMember(e) {
    const memberId = e.currentTarget.dataset.id;
    wx.showToast({ title: `查看成员 ${memberId}`, icon: 'none' });
  }
});