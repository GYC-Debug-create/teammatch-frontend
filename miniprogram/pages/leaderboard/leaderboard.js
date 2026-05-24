// pages/leaderboard/leaderboard.js
Page({
  data: {
    loading: true,
    leaderboardData: []
  },

  onLoad() {
    this.loadLeaderboard()
  },

  loadLeaderboard() {
    this.setData({ loading: true })

    setTimeout(() => {
      const mockData = [
        {
          rank: 1,
          username: '张宸铭',
          githubUsername: 'chenming-zhang',
          skills: ['React', 'TypeScript', 'Node.js'],
          repoCount: 47,
          score: 98.5
        },
        {
          rank: 2,
          username: '林雨薇',
          githubUsername: 'yuwei-lin',
          skills: ['Python', '机器学习', 'Docker'],
          repoCount: 35,
          score: 96.2
        },
        {
          rank: 3,
          username: '赵一航',
          githubUsername: 'yihang-zhao',
          skills: ['Vue.js', 'Spring Boot', 'MySQL'],
          repoCount: 42,
          score: 94.8
        },
        {
          rank: 4,
          username: '陈思语',
          githubUsername: 'siyu-chen',
          skills: ['Go', 'Kubernetes', 'gRPC'],
          repoCount: 28,
          score: 91.3
        },
        {
          rank: 5,
          username: '王浩然',
          githubUsername: 'haoran-wang',
          skills: ['Flutter', 'Firebase', 'Dart'],
          repoCount: 31,
          score: 89.7
        },
        {
          rank: 6,
          username: '周予安',
          githubUsername: 'yuan-zhou',
          skills: ['Java', '微服务', 'Redis'],
          repoCount: 25,
          score: 87.4
        },
        {
          rank: 7,
          username: '许之恒',
          githubUsername: 'zhiheng-xu',
          skills: ['C++', 'OpenCV', 'PyTorch'],
          repoCount: 20,
          score: 84.1
        }
      ]

      this.setData({
        leaderboardData: mockData,
        loading: false
      })
    }, 800)
  },

  viewProfile(e) {
    const item = e.currentTarget.dataset.item
    wx.showToast({
      title: '查看画像功能开发中',
      icon: 'none',
      duration: 1500
    })
  },

  goGitHubBind() {
    wx.showToast({
      title: 'GitHub 绑定功能开发中',
      icon: 'none',
      duration: 1500
    })
  },

  goProjectList() {
    wx.navigateTo({
      url: '/pages/projects/list/list'
    })
  }
})
